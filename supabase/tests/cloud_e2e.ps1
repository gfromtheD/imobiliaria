# Cloud E2E harness — exercises the real Supabase project with MockAdapter only.
# Prerequisites: linked Cloud project and the Cloud credentials in .env.local.

[CmdletBinding()]
param([switch]$KeepData)

$ErrorActionPreference = "Stop"
$RunId = [guid]::NewGuid().ToString("N").Substring(0, 12)
$Pass = 0
$Fail = 0
$CreatedUserId = $null
$AccessToken = $null
$OrganizationId = $null
$PropertyId = $null
$OriginalImagePath = $null
$OutputImagePath = $null

function Read-EnvValue([string]$Name) {
  $line = Get-Content (Join-Path $PSScriptRoot "..\..\.env.local") |
    Where-Object { $_ -match ("^" + [regex]::Escape($Name) + "=") } |
    Select-Object -First 1
  if (-not $line) { throw "$Name no está configurada en .env.local." }
  return (($line -split "=", 2)[1]).Trim().Trim('"').Trim("'")
}

$BaseUrl = Read-EnvValue "NEXT_PUBLIC_SUPABASE_URL"
$AnonKey = Read-EnvValue "NEXT_PUBLIC_SUPABASE_ANON_KEY"
$ServiceRoleKey = Read-EnvValue "SUPABASE_SERVICE_ROLE_KEY"
if ($BaseUrl -notmatch "^https://") { throw "Cloud E2E requiere NEXT_PUBLIC_SUPABASE_URL de Supabase Cloud." }

function Assert([bool]$Condition, [string]$Message) {
  if ($Condition) {
    $script:Pass++
    Write-Host "  [PASS] $Message" -ForegroundColor Green
  } else {
    $script:Fail++
    Write-Host "  [FAIL] $Message" -ForegroundColor Red
  }
}

function Invoke-Api([string]$Method, [string]$Path, [string]$BearerToken, $Body = $null, [string]$ContentType = "application/json", [string]$ApiKey = $AnonKey) {
  $headers = @{ apikey = $ApiKey; Authorization = "Bearer $BearerToken"; Prefer = "return=representation" }
  try {
    $response = Invoke-WebRequest -Uri "$BaseUrl$Path" -Method $Method -Headers $headers -Body $Body -ContentType $ContentType -SkipHttpErrorCheck
    $parsed = $null
    if ($response.Content) { try { $parsed = $response.Content | ConvertFrom-Json } catch { $parsed = $response.Content } }
    return [pscustomobject]@{ Status = [int]$response.StatusCode; Body = $parsed; Raw = $response.Content }
  } catch {
    return [pscustomobject]@{ Status = 0; Body = $null; Raw = $_.Exception.Message }
  }
}

function Invoke-Rpc([string]$BearerToken, [string]$FunctionName, [hashtable]$Parameters, [string]$ApiKey = $AnonKey) {
  Invoke-Api "POST" "/rest/v1/rpc/$FunctionName" $BearerToken ($Parameters | ConvertTo-Json -Compress) -ApiKey $ApiKey
}

function Get-FirstRow($Body) {
  if ($Body -is [array]) { return @($Body)[0] }
  return $Body
}

function Wait-ForGeneration([string]$GenerationId, [string]$Token, [int]$TimeoutSeconds = 60) {
  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  do {
    $result = Invoke-Api "GET" "/rest/v1/generations?select=id,status,output_image_path,retry_count&id=eq.$GenerationId" $Token
    $row = Get-FirstRow $result.Body
    if ($row -and @("completed", "failed") -contains $row.status) { return $row }
    Start-Sleep -Seconds 1
  } while ((Get-Date) -lt $deadline)
  return $null
}

try {
  Write-Host "== Cloud E2E (MockAdapter) ==" -ForegroundColor Cyan
  $email = "cloud-e2e-$RunId@e2e.invalid"
  $password = "E2e!$RunId-Cloud"

  $adminCreate = Invoke-Api "POST" "/auth/v1/admin/users" $ServiceRoleKey (@{ email = $email; password = $password; email_confirm = $true } | ConvertTo-Json -Compress)
  Assert ($adminCreate.Status -eq 200 -or $adminCreate.Status -eq 201) "usuario temporal confirmado creado"
  $CreatedUserId = $adminCreate.Body.id
  if (-not $CreatedUserId) { throw "No se pudo crear el usuario temporal." }

  $login = Invoke-Api "POST" "/auth/v1/token?grant_type=password" $AnonKey (@{ email = $email; password = $password } | ConvertTo-Json -Compress)
  Assert ($login.Status -eq 200 -and $login.Body.access_token) "registro administrativo y login por contraseña"
  $AccessToken = $login.Body.access_token
  if (-not $AccessToken) { throw "No se obtuvo sesión de usuario." }

  $profile = Invoke-Api "GET" "/rest/v1/users?select=id,organization_id&id=eq.$CreatedUserId" $AccessToken
  $profileRow = Get-FirstRow $profile.Body
  Assert ($profile.Status -eq 200 -and $profileRow.organization_id) "trigger creó organización y perfil"
  $OrganizationId = $profileRow.organization_id
  if (-not $OrganizationId) { throw "El usuario temporal no tiene organización." }

  $property = Invoke-Api "POST" "/rest/v1/properties" $AccessToken (@{ organization_id = $OrganizationId; title = "Cloud E2E $RunId" } | ConvertTo-Json -Compress)
  $propertyRow = Get-FirstRow $property.Body
  Assert ($property.Status -eq 201 -and $propertyRow.id) "propiedad creada bajo RLS"
  $PropertyId = $propertyRow.id
  if (-not $PropertyId) { throw "No se pudo crear la propiedad temporal." }

  $room = Invoke-Rpc $AccessToken "create_room" @{ p_property_id = $PropertyId; p_room_type = "salón"; p_file_name = "cloud-e2e.png" }
  Assert ($room.Status -eq 200 -and $room.Body.room_id -and $room.Body.upload_path) "habitación creada con ruta aislada"
  $roomId = $room.Body.room_id
  $uploadPath = $room.Body.upload_path
  $OriginalImagePath = $uploadPath
  if (-not $roomId -or -not $uploadPath) { throw "No se pudo crear la habitación temporal." }

  $png = [Convert]::FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==")
  $upload = Invoke-Api "POST" "/storage/v1/object/original-images/$uploadPath" $AccessToken $png "image/png"
  Assert ($upload.Status -eq 200) "imagen original subida a Storage privado"

  $finalize = Invoke-Rpc $AccessToken "finalize_room_upload" @{ p_room_id = $roomId; p_upload_path = $uploadPath }
  Assert ($finalize.Status -eq 200) "subida de habitación finalizada"

  $styles = Invoke-Api "GET" "/rest/v1/styles?select=id&active=eq.true&limit=1" $AccessToken
  $styleId = (Get-FirstRow $styles.Body).id
  Assert ($styles.Status -eq 200 -and $styleId) "estilo disponible"
  if (-not $styleId) { throw "No hay estilos activos en Cloud." }

  $generation = Invoke-Rpc $AccessToken "create_generation" @{ p_room_id = $roomId; p_style_id = $styleId; p_parameters = @{} }
  $generationId = $generation.Body.id
  Assert ($generation.Status -eq 200 -and $generation.Body.status -eq "pending" -and $generationId) "generación Mock creada como pending"
  if (-not $generationId) { throw "No se pudo crear la generación temporal." }

  $enqueue = Invoke-Rpc $ServiceRoleKey "process_generation_jobs" @{ p_limit = 10 } -ApiKey $ServiceRoleKey
  Assert ($enqueue.Status -eq 200) "scheduler Cloud encola el job"

  $generationRow = Wait-ForGeneration $generationId $AccessToken
  Assert ($generationRow -and $generationRow.status -eq "completed") "worker Mock completa el job dentro del timeout"
  Assert ($generationRow.output_image_path -match "\.png$") "resultado PNG persistido"
  $OutputImagePath = $generationRow.output_image_path

  if ($generationRow.output_image_path) {
    $output = Invoke-Api "GET" "/storage/v1/object/staged-images/$($generationRow.output_image_path)" $AccessToken $null $null
    Assert ($output.Status -eq 200 -and $output.Raw.Length -gt 100) "resultado descargable desde Storage privado"
  }

  $subscription = Invoke-Api "GET" "/rest/v1/subscriptions?select=credits_available,credits_reserved" $AccessToken
  $subscriptionRow = Get-FirstRow $subscription.Body
  Assert ($subscription.Status -eq 200 -and [int]$subscriptionRow.credits_available -eq 2 -and [int]$subscriptionRow.credits_reserved -eq 0) "créditos consumidos una sola vez"

  $ledger = Invoke-Api "GET" "/rest/v1/usage_ledger?select=credits_used,status&generation_id=eq.$generationId" $AccessToken
  $ledgerRow = Get-FirstRow $ledger.Body
  Assert ($ledger.Status -eq 200 -and [int]$ledgerRow.credits_used -eq 1 -and $ledgerRow.status -eq "free") "usage ledger registra el consumo Mock"
} finally {
  if (-not $KeepData -and $AccessToken -and $OriginalImagePath) {
    $null = Invoke-Api "DELETE" "/storage/v1/object/original-images/$OriginalImagePath" $AccessToken
  }
  if (-not $KeepData -and $AccessToken -and $OutputImagePath) {
    $null = Invoke-Api "DELETE" "/storage/v1/object/staged-images/$OutputImagePath" $AccessToken
  }
  if (-not $KeepData -and $AccessToken -and $PropertyId) {
    $null = Invoke-Rpc $AccessToken "delete_property" @{ p_property_id = $PropertyId }
  }
  if (-not $KeepData -and $CreatedUserId) {
    $null = Invoke-Api "DELETE" "/auth/v1/admin/users/$CreatedUserId" $ServiceRoleKey -ApiKey $ServiceRoleKey
  }
  if (-not $KeepData -and $OrganizationId) {
    $null = Invoke-Api "DELETE" "/rest/v1/organizations?id=eq.$OrganizationId" $ServiceRoleKey -ApiKey $ServiceRoleKey
  }
}

Write-Host "Cloud E2E: $Pass PASS / $Fail FAIL"
exit $(if ($Fail -eq 0) { 0 } else { 1 })
