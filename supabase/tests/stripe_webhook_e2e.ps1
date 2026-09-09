# Stripe Test webhook E2E — verifies Vercel protection bypass, signature and idempotent credits.
# Prerequisites: Cloud credentials, Stripe Test webhook secret and Vercel bypass secret in .env.local.

[CmdletBinding()]
param([switch]$KeepData)

$ErrorActionPreference = "Stop"
$Pass = 0
$Fail = 0
$RunId = [guid]::NewGuid().ToString("N").Substring(0, 12)
$CreatedUserId = $null
$OrganizationId = $null
$EventId = "evt_e2e_$RunId"

function Read-EnvValue([string]$Name) {
  $line = Get-Content (Join-Path $PSScriptRoot "..\..\.env.local") |
    Where-Object { $_ -match ("^" + [regex]::Escape($Name) + "=") } |
    Select-Object -Last 1
  if (-not $line) { throw "$Name no está configurada en .env.local." }
  return (($line -split "=", 2)[1]).Trim().Trim('"').Trim("'")
}

$BaseUrl = (Read-EnvValue "NEXT_PUBLIC_SUPABASE_URL").TrimEnd("/")
$ServiceRoleKey = Read-EnvValue "SUPABASE_SERVICE_ROLE_KEY"
$WebhookSecret = Read-EnvValue "STRIPE_WEBHOOK_SECRET"
$BypassSecret = Read-EnvValue "VERCEL_STRIPE_BYPASS_SECRET"
if ($BaseUrl -notmatch "^https://") { throw "Stripe E2E requiere NEXT_PUBLIC_SUPABASE_URL de Supabase Cloud." }

function Assert([bool]$Condition, [string]$Message) {
  if ($Condition) {
    $script:Pass++
    Write-Host "  [PASS] $Message" -ForegroundColor Green
  } else {
    $script:Fail++
    Write-Host "  [FAIL] $Message" -ForegroundColor Red
  }
}

function Invoke-Cloud([string]$Method, [string]$Path, $Body = $null) {
  $headers = @{ apikey = $ServiceRoleKey; Authorization = "Bearer $ServiceRoleKey"; Prefer = "return=representation" }
  $json = if ($null -eq $Body -or $Body -is [string]) { $Body } else { $Body | ConvertTo-Json -Compress -Depth 10 }
  try {
    $response = Invoke-WebRequest -Uri "$BaseUrl$Path" -Method $Method -Headers $headers -Body $json -ContentType "application/json" -SkipHttpErrorCheck
    $parsed = $null
    if ($response.Content) { try { $parsed = $response.Content | ConvertFrom-Json } catch { $parsed = $response.Content } }
    return [pscustomobject]@{ Status = [int]$response.StatusCode; Body = $parsed; Raw = $response.Content }
  } catch {
    return [pscustomobject]@{ Status = 0; Body = $null; Raw = $_.Exception.Message }
  }
}

function Get-FirstRow($Body) {
  if ($Body -is [array]) { return @($Body)[0] }
  return $Body
}

function New-StripeSignature([string]$Payload, [string]$Secret) {
  $timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
  $content = "$timestamp.$Payload"
  $hmac = [System.Security.Cryptography.HMACSHA256]::new([System.Text.Encoding]::UTF8.GetBytes($Secret))
  $hash = [Convert]::ToHexString($hmac.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($content))).ToLowerInvariant()
  return "t=$timestamp,v1=$hash"
}

function Invoke-SignedWebhook([string]$Payload) {
  $url = "https://imobiliaria-xi-five.vercel.app/api/webhooks/stripe?x-vercel-protection-bypass=$BypassSecret"
  $headers = @{ "stripe-signature" = (New-StripeSignature $Payload $WebhookSecret) }
  try {
    $response = Invoke-WebRequest -Uri $url -Method Post -Headers $headers -Body $Payload -ContentType "application/json" -SkipHttpErrorCheck
    return [pscustomobject]@{ Status = [int]$response.StatusCode; Raw = $response.Content }
  } catch {
    return [pscustomobject]@{ Status = 0; Raw = $_.Exception.Message }
  }
}

try {
  Write-Host "== Stripe Test webhook E2E ==" -ForegroundColor Cyan
  $email = "stripe-e2e-$RunId@e2e.invalid"
  $password = "Stripe!$RunId-Cloud"

  $created = Invoke-Cloud "POST" "/auth/v1/admin/users" @{ email = $email; password = $password; email_confirm = $true }
  Assert ($created.Status -eq 200 -or $created.Status -eq 201) "usuario temporal confirmado creado"
  $CreatedUserId = $created.Body.id
  if (-not $CreatedUserId) { throw "No se pudo crear el usuario temporal." }

  $profile = Invoke-Cloud "GET" "/rest/v1/users?select=organization_id&id=eq.$CreatedUserId"
  $OrganizationId = (Get-FirstRow $profile.Body).organization_id
  Assert ($profile.Status -eq 200 -and $OrganizationId) "organización temporal creada por trigger"
  if (-not $OrganizationId) { throw "No se pudo recuperar la organización temporal." }

  $before = Get-FirstRow (Invoke-Cloud "GET" "/rest/v1/subscriptions?select=credits_available&organization_id=eq.$OrganizationId").Body
  $creditsBefore = [int]$before.credits_available
  Assert ($creditsBefore -ge 0) "saldo inicial de créditos disponible"

  $event = [ordered]@{
    id = $EventId
    object = "event"
    type = "checkout.session.completed"
    data = @{ object = @{ id = "cs_e2e_$RunId"; object = "checkout.session"; customer = "cus_e2e_$RunId"; metadata = @{ organization_id = $OrganizationId; credits = "10" } } }
  }
  $payload = $event | ConvertTo-Json -Compress -Depth 10

  $firstDelivery = Invoke-SignedWebhook $payload
  Assert ($firstDelivery.Status -eq 200) "webhook firmado atraviesa la protección y es aceptado"

  $afterFirst = Get-FirstRow (Invoke-Cloud "GET" "/rest/v1/subscriptions?select=credits_available&organization_id=eq.$OrganizationId").Body
  Assert ([int]$afterFirst.credits_available -eq ($creditsBefore + 10)) "primera entrega añade créditos exactamente una vez"

  $duplicateDelivery = Invoke-SignedWebhook $payload
  Assert ($duplicateDelivery.Status -eq 200) "entrega duplicada del mismo evento es aceptada"

  $afterDuplicate = Get-FirstRow (Invoke-Cloud "GET" "/rest/v1/subscriptions?select=credits_available&organization_id=eq.$OrganizationId").Body
  Assert ([int]$afterDuplicate.credits_available -eq ($creditsBefore + 10)) "idempotencia evita duplicar créditos"

  $eventRow = Invoke-Cloud "GET" "/rest/v1/stripe_events?select=id&id=eq.$EventId"
  Assert ($eventRow.Status -eq 200 -and @($eventRow.Body).Count -eq 1) "ledger de eventos Stripe conserva una sola entrega"
} finally {
  if (-not $KeepData -and $EventId) {
    $null = Invoke-Cloud "DELETE" "/rest/v1/stripe_events?id=eq.$EventId"
  }
  if (-not $KeepData -and $CreatedUserId) {
    $null = Invoke-Cloud "DELETE" "/auth/v1/admin/users/$CreatedUserId"
  }
  if (-not $KeepData -and $OrganizationId) {
    $null = Invoke-Cloud "DELETE" "/rest/v1/organizations?id=eq.$OrganizationId"
  }
}

Write-Host "Stripe webhook E2E: $Pass PASS / $Fail FAIL"
exit $(if ($Fail -eq 0) { 0 } else { 1 })
