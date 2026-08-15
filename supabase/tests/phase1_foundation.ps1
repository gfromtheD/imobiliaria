# phase1_foundation.ps1 — Harness de validación Fase 1 MVP REAL.
# Requiere: stack Supabase local arriba con migraciones 1+2 aplicadas.
# Uso: pwsh -File phase1_foundation.ps1  (opcional: -SkipRegression)

param([switch]$SkipRegression)

$ErrorActionPreference = "Stop"
$Base = "http://127.0.0.1:54321"
$RunId = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()

$Pass = 0; $Fail = 0; $Errors = @()
function Assert([bool]$Cond, [string]$Msg) {
  if ($Cond) { $script:Pass++; Write-Host "  [PASS] $Msg" -ForegroundColor Green }
  else { $script:Fail++; $script:Errors += $Msg; Write-Host "  [FAIL] $Msg" -ForegroundColor Red }
}
function AssertEq($Actual, $Expected, [string]$Msg) { Assert ($Actual -eq $Expected) "$Msg (actual=$Actual esperado=$Expected)" }
function AssertOk($Result, [string]$Msg) { Assert (($Result.Status -ge 200) -and ($Result.Status -lt 300)) $Msg }
function AssertNullRow($Result, [string]$Msg) { Assert (($Result.Status -eq 204) -or ($null -eq $Result.Body)) $Msg }
function Section([string]$Name) { Write-Host "`n== $Name ==" -ForegroundColor Cyan }

$db = docker ps --format "{{.Names}}" | Where-Object { $_ -like "supabase_db_*" } | Select-Object -First 1
if (-not $db) { Write-Host "Stack no levantado" -ForegroundColor Red; exit 1 }
function Sql([string]$Sql) { docker exec $db psql -U postgres -d postgres -v ON_ERROR_STOP=1 -tA -c $Sql 2>&1 }

# --- Credenciales desde el edge runtime (robusto ante rotación de claves locales) ---
$edgeEnv = docker inspect supabase_edge_runtime_imobiliaria | ConvertFrom-Json | Select-Object -ExpandProperty Config | Select-Object -ExpandProperty Env
$anon = ($edgeEnv | Where-Object { $_ -like "SUPABASE_ANON_KEY=*" }) -replace "^SUPABASE_ANON_KEY=", ""
$service = ($edgeEnv | Where-Object { $_ -like "SUPABASE_SERVICE_ROLE_KEY=*" }) -replace "^SUPABASE_SERVICE_ROLE_KEY=", ""
$apiUrl = ($edgeEnv | Where-Object { $_ -like "SUPABASE_URL=*" }) -replace "^SUPABASE_URL=", ""

function Invoke-Api([string]$Method, [string]$Path, [string]$Token, $Body = $null, [string]$ContentType = "application/json") {
  $headers = @{ apikey = $Token; Authorization = "Bearer $Token"; Prefer = "return=representation" }
  if ($ContentType) { $headers["Content-Type"] = $ContentType }
  try {
    $r = Invoke-WebRequest -Method $Method -Uri "$Base$Path" -Headers $headers -Body $Body -ContentType $ContentType -SkipHttpErrorCheck
    $json = $null
    if ($r.Content -and $r.Content.Length -gt 0) { try { $json = $r.Content | ConvertFrom-Json } catch { $json = $r.Content } }
    $res = [pscustomobject]@{ Status = [int]$r.StatusCode; Body = $json; Raw = $r.Content }
    if ($env:PH1_DEBUG) { Add-Content -Path $env:PH1_DEBUG -Value ">>> $Method $Path`n    BODY: $Body`n    <- $($r.StatusCode) $($r.Content)`n" }
    return $res
  } catch { return [pscustomobject]@{ Status = 0; Body = $null; Raw = $_.Exception.Message } }
}
function Invoke-Rpc([string]$Token, [string]$Fn, $Params) {
  return Invoke-Api "POST" "/rest/v1/rpc/$Fn" $Token ($Params | ConvertTo-Json -Compress)
}
function Get-Table([string]$Token, [string]$Table, [string]$Query = "") {
  return Invoke-Api "GET" "/rest/v1/$Table`?$Query" $Token
}
function Post-Table([string]$Token, [string]$Table, [hashtable]$Row) {
  return Invoke-Api "POST" "/rest/v1/$Table" $Token ($Row | ConvertTo-Json -Compress)
}
function Signup([string]$Email, [string]$Password) {
  $r = Invoke-Api "POST" "/auth/v1/signup" $anon (@{ email = $Email; password = $Password } | ConvertTo-Json -Compress)
  if ($r.Status -eq 200) { return [pscustomobject]@{ Token = $r.Body.access_token; Email = $Email } }
  throw "signup $Email falló: $($r.Status) $($r.Raw)"
}
function Upload-Original([string]$Token, [string]$Path) {
  $png = [Convert]::FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==")
  return Invoke-Api "POST" "/storage/v1/object/original-images/$Path" $Token $png "image/png"
}

# ---------------------------------------------------------------- preparación
Section "0. Config runtime"
$null = Sql "select cron.unschedule('process-generation-jobs') where exists (select 1 from cron.job where jobname = 'process-generation-jobs');"
$r = Invoke-Api "POST" "/rest/v1/rpc/current_org_id" $service @{}
AssertEq $r.Status 200 "current_org_id ejecutable (service)"
AssertNullRow $r "current_org_id devuelve vacío sin sesión de usuario"
$u = Invoke-Api "PATCH" "/rest/v1/app_config?key=eq.anon_key" $service (@{ value = $anon } | ConvertTo-Json -Compress)
AssertOk $u "app_config: anon_key del runtime registrada (service_role)"
$u2 = Invoke-Api "PATCH" "/rest/v1/app_config?key=eq.retry_interval" $service (@{ value = "1 second" } | ConvertTo-Json -Compress)
AssertOk $u2 "app_config: retry_interval acortado para el test"

# ---------------------------------------------------------------- 1. auth + org
Section "1. Auth: signup crea org + suscripción free"
$userA = Signup "alice$RunId@test.local" "password123"
Assert ([bool]$userA.Token) "signup A devuelve sesión (confirmations off)"
$orgs = Get-Table $userA.Token "organizations" "select=id,name"
AssertEq $orgs.Status 200 "A lista su organización"
AssertEq @($orgs.Body).Count 1 "A ve exactamente 1 organización"
$orgA = @($orgs.Body)[0]
$subs = Get-Table $userA.Token "subscriptions" "select=plan,status,credits_available,credits_reserved"
AssertEq $subs.Body[0].plan "free" "suscripción free"
AssertEq $subs.Body[0].status "free" "estado free"
AssertEq ([int]$subs.Body[0].credits_available) 3 "3 créditos iniciales"
AssertEq ([int]$subs.Body[0].credits_reserved) 0 "0 créditos reservados"

$userB = Signup "bob$RunId@test.local" "password123"
$orgsB = Get-Table $userB.Token "organizations" "select=id,name"
$orgB = @($orgsB.Body)[0]
Assert ($orgA.id -ne $orgB.id) "A y B tienen organizaciones distintas"

# ---------------------------------------------------------------- 2. multi-tenancy
Section "2. Aislamiento multi-tenant (RLS)"
$pA = Post-Table $userA.Token "properties" @{ organization_id = $orgA.id; title = "Casa Test" }
AssertEq $pA.Status 201 "A crea propiedad"
$propA = $pA.Body
$hack = Post-Table $userB.Token "organizations" @{ id = $orgA.id; name = "hack" }
Assert ($hack.Status -eq 400 -or $hack.Status -eq 403) "B no puede insertar en la org de A (org-hopping bloqueado)"
$proB = Get-Table $userB.Token "properties" "select=id,title"
AssertEq $proB.Status 200 "B lista propiedades"
AssertEq @($proB.Body).Count 0 "B no ve propiedades de A"
$proB2 = Get-Table $userB.Token "properties" "select=id,title&id=eq.$($propA.id)"
AssertEq @($proB2.Body).Count 0 "B no lee la propiedad de A por id"
$rBroom = Invoke-Rpc $userB.Token "create_room" @{ p_property_id = $propA.id; p_room_type = "salón"; p_file_name = "x.jpg" }
Assert ($rBroom.Raw -match "property_not_found") "B no crea habitación en propiedad ajena"

# ---------------------------------------------------------------- 3. propiedades
Section "3. Propiedades CRUD"
$props = Get-Table $userA.Token "properties" "select=id,title,status"
AssertEq @($props.Body).Count 1 "A lista su propiedad"
$up = Invoke-Api "PATCH" "/rest/v1/properties?id=eq.$($propA.id)" $userA.Token (@{ title = "Casa Test Renombrada" } | ConvertTo-Json -Compress)
AssertOk $up "A renombra su propiedad"
$propA.title = "Casa Test Renombrada"
$del = Invoke-Rpc $userB.Token "delete_property" @{ p_property_id = $propA.id }
Assert ($del.Raw -match "property_not_found") "B no borra propiedad ajena"

# ---------------------------------------------------------------- 4. rooms + upload
Section "4. Habitaciones + subida original"
$room1 = Invoke-Rpc $userA.Token "create_room" @{ p_property_id = $propA.id; p_room_type = "salón"; p_file_name = "foto.jpg" }
AssertEq $room1.Status 200 "create_room ok"
$roomA = $room1.Body
Assert ($roomA.upload_path -eq "$($orgA.id)/$($propA.id)/$($roomA.room_id).jpg") "ruta de subida con prefijo de org"
$badRoom = Invoke-Rpc $userA.Token "create_room" @{ p_property_id = $propA.id; p_room_type = "salón"; p_file_name = "foto.exe" }
Assert ($badRoom.Raw -match "invalid_file_type") "extensión inválida rechazada"
$badRoom2 = Invoke-Rpc $userA.Token "create_room" @{ p_property_id = $propA.id; p_room_type = "piscina"; p_file_name = "foto.jpg" }
Assert ($badRoom2.Raw -match "invalid_room_type") "tipo de estancia inválido rechazado"
$roomB = Invoke-Rpc $userA.Token "create_room" @{ p_property_id = $propA.id; p_room_type = "otra"; p_file_name = "otra.jpg" }
for ($i = 0; $i -lt 18; $i++) { $null = Invoke-Rpc $userA.Token "create_room" @{ p_property_id = $propA.id; p_room_type = "otra"; p_file_name = "f$i.jpg" } }
$over = Invoke-Rpc $userA.Token "create_room" @{ p_property_id = $propA.id; p_room_type = "otra"; p_file_name = "over.jpg" }
Assert ($over.Raw -match "image_limit_reached") "límite de 20 imágenes por propiedad"

$up = Upload-Original $userA.Token $roomA.upload_path
AssertEq $up.Status 200 "A sube original a storage (prefijo org)"
$fin = Invoke-Rpc $userA.Token "finalize_room_upload" @{ p_room_id = $roomA.room_id; p_upload_path = $roomA.upload_path }
AssertEq $fin.Status 200 "finalize_room_upload ok"
AssertEq $fin.Body.original_image_path $roomA.upload_path "ruta persistida"
$fin2 = Invoke-Rpc $userA.Token "finalize_room_upload" @{ p_room_id = $roomA.room_id; p_upload_path = $roomA.upload_path }
Assert ($fin2.Raw -match "already_uploaded") "doble finalize rechazado"
$fin3 = Invoke-Rpc $userA.Token "finalize_room_upload" @{ p_room_id = $roomB.room_id; p_upload_path = "$($orgB.id)/$($propA.id)/$($roomB.room_id).jpg" }
Assert ($fin3.Raw -match "invalid_upload_path") "ruta ajena rechazada en finalize"
$genNoImg = Invoke-Rpc $userA.Token "create_generation" @{ p_room_id = $roomA.room_id; p_style_id = $null }
Assert ($genNoImg.Raw -match "style_not_found|invalid") "generación sin estilo rechazada"

# ---------------------------------------------------------------- 5. créditos
Section "5. Generación + reserva de créditos"
$styles = Get-Table $userA.Token "styles" "select=id,ai_preset&ai_preset=eq.modern"
$styleModern = @($styles.Body)[0]
$g1 = Invoke-Rpc $userA.Token "create_generation" @{ p_room_id = $roomA.room_id; p_style_id = $styleModern.id; p_parameters = @{} }
AssertEq $g1.Status 200 "generación 1 creada (pending)"
AssertEq $g1.Body.status "pending" "estado inicial pending"
$g2 = Invoke-Rpc $userA.Token "create_generation" @{ p_room_id = $roomA.room_id; p_style_id = $styleModern.id; p_parameters = @{} }
$g3 = Invoke-Rpc $userA.Token "create_generation" @{ p_room_id = $roomA.room_id; p_style_id = $styleModern.id; p_parameters = @{} }
AssertEq $g2.Status 200 "generación 2 creada"
AssertEq $g3.Status 200 "generación 3 creada"
$g4 = Invoke-Rpc $userA.Token "create_generation" @{ p_room_id = $roomA.room_id; p_style_id = $styleModern.id; p_parameters = @{} }
Assert ($g4.Raw -match "insufficient_credits") "4ª generación bloqueada por créditos"
$subs2 = Get-Table $userA.Token "subscriptions" "select=credits_available,credits_reserved"
AssertEq ([int]$subs2.Body[0].credits_available) 0 "créditos disponibles 0 tras reservar 3"
AssertEq ([int]$subs2.Body[0].credits_reserved) 3 "créditos reservados 3"

# ---------------------------------------------------------------- 6. idempotencia del estado
Section "6. Guardas de estado (idempotencia)"
$c1 = Invoke-Rpc $service "claim_generation" @{ p_generation_id = $g1.Body.id }
AssertEq $c1.Status 200 "claim de g1 (service) ok"
AssertEq $c1.Body.status "processing" "g1 processing tras claim"
AssertEq ([int]$c1.Body.retry_count) 1 "retry_count 1 tras primer claim"
$c1b = Invoke-Rpc $service "claim_generation" @{ p_generation_id = $g1.Body.id }
AssertNullRow $c1b "doble claim de g1 rechazado (null)"
$cmp = Invoke-Rpc $service "complete_generation" @{ p_generation_id = $g2.Body.id; p_output_path = "x"; p_provider_job_id = "x" }
AssertNullRow $cmp "complete sobre g2 (pending) rechazado (null)"

# ---------------------------------------------------------------- 7. pipeline
Section "7. Pipeline completo (scheduler + worker + storage)"
$n = Invoke-Rpc $service "process_generation_jobs" @{ p_limit = 10 }
AssertEq $n.Status 200 "process_generation_jobs ejecutable"
$n2 = Invoke-Rpc $service "process_generation_jobs" @{ p_limit = 10 }
$deadline = [DateTime]::UtcNow.AddSeconds(20)
do {
  Start-Sleep -Milliseconds 500
  $gs = Get-Table $userA.Token "generations" "select=id,status,output_image_path&id=in.($($g2.Body.id),$($g3.Body.id))"
  $done = @($gs.Body | Where-Object { $_.status -eq "completed" }).Count
} while ($done -lt 2 -and [DateTime]::UtcNow -lt $deadline)
AssertEq $done 2 "g2 y g3 completadas por el worker"
$g2row = @($gs.Body | Where-Object { $_.id -eq $g2.Body.id })[0]
Assert ($g2row.output_image_path -match "^$($orgA.id)/$($propA.id)/$($roomA.room_id)/$($g2.Body.id)\.png$") "ruta de salida determinista en staged-images"
$c1fin = Invoke-Rpc $service "complete_generation" @{ p_generation_id = $g1.Body.id; p_output_path = "$($orgA.id)/$($propA.id)/$($roomA.room_id)/$($g1.Body.id).png"; p_provider_job_id = "manual"; p_cost_estimate = 0 }
AssertEq $c1fin.Status 200 "cierre manual de g1 (claim previo)"
$subs3 = Get-Table $userA.Token "subscriptions" "select=credits_available,credits_reserved"
AssertEq ([int]$subs3.Body[0].credits_reserved) 0 "reservas liberadas tras completar"
$led = Get-Table $userA.Token "usage_ledger" "select=generation_id,credits_used,status"
AssertEq @($led.Body | Where-Object { $_.status -eq "free" -and $_.credits_used -eq 1 }).Count 3 "3 entradas ledger free con 1 crédito"
$obj = Invoke-Api "GET" "/storage/v1/object/staged-images/$($g2row.output_image_path)" $userA.Token $null $null
AssertEq $obj.Status 200 "A lee resultado staged"
$objB = Invoke-Api "GET" "/storage/v1/object/staged-images/$($g2row.output_image_path)" $userB.Token $null $null
Assert ($objB.Status -eq 400 -or $objB.Status -eq 404) "B no lee resultado ajeno"

# ---------------------------------------------------------------- 8. error + retry
Section "8. Fallo del proveedor + retry (sin doble cargo)"
$reset = Invoke-Api "PATCH" "/rest/v1/subscriptions?organization_id=eq.$($orgA.id)" $service (@{ credits_available = 3; credits_reserved = 0 } | ConvertTo-Json -Compress)
AssertOk $reset "reset de créditos para el test (service)"
$gf = Invoke-Rpc $userA.Token "create_generation" @{ p_room_id = $roomA.room_id; p_style_id = $styleModern.id; p_parameters = @{ mock_fail = $true } }
AssertEq $gf.Status 200 "generación mock_fail creada"
$null = Invoke-Rpc $service "process_generation_jobs" @{ p_limit = 10 }
Start-Sleep -Seconds 2
$gfr = Get-Table $userA.Token "generations" "select=id,status,error_code,retry_count&id=eq.$($gf.Body.id)"
AssertEq $gfr.Body[0].status "failed" "g_fail falla (retryable) en intento 1"
AssertEq $gfr.Body[0].error_code "provider_error" "código de error provider_error"
$subf = Get-Table $userA.Token "subscriptions" "select=credits_available,credits_reserved"
AssertEq ([int]$subf.Body[0].credits_reserved) 1 "reserva mantenida tras fallo reintentable (sin reembolso)"
$null = Invoke-Rpc $service "process_generation_jobs" @{ p_limit = 10 }
$deadline = [DateTime]::UtcNow.AddSeconds(20)
do {
  Start-Sleep -Milliseconds 500
  $gfr2 = Get-Table $userA.Token "generations" "select=id,status,retry_count&id=eq.$($gf.Body.id)"
} while ($gfr2.Body[0].status -ne "completed" -and [DateTime]::UtcNow -lt $deadline)
AssertEq $gfr2.Body[0].status "completed" "reabierto y completado en intento 2"
AssertEq ([int]$gfr2.Body[0].retry_count) 2 "retry_count 2 (sin duplicar trabajo)"
$subf2 = Get-Table $userA.Token "subscriptions" "select=credits_available,credits_reserved"
AssertEq ([int]$subf2.Body[0].credits_available) 2 "solo 1 crédito consumido (1 fallo + 1 éxito = 1 cobro)"

# ---------------------------------------------------------------- 9. cancelación
Section "9. Cancelación + reembolso"
$gc = Invoke-Rpc $userA.Token "create_generation" @{ p_room_id = $roomA.room_id; p_style_id = $styleModern.id; p_parameters = @{} }
$subc = Get-Table $userA.Token "subscriptions" "select=credits_available,credits_reserved"
AssertEq ([int]$subc.Body[0].credits_available) 1 "crédito disponible 1 antes de cancelar"
$cx = Invoke-Rpc $userA.Token "cancel_generation" @{ p_generation_id = $gc.Body.id }
AssertEq $cx.Status 200 "cancel_generation ok"
AssertEq $cx.Body.status "cancelled" "estado cancelled"
$subc2 = Get-Table $userA.Token "subscriptions" "select=credits_available,credits_reserved"
AssertEq ([int]$subc2.Body[0].credits_available) 2 "crédito reembolsado tras cancelar"
$ledc = Get-Table $userA.Token "usage_ledger" "select=status&generation_id=eq.$($gc.Body.id)"
AssertEq $ledc.Body[0].status "cancelled" "ledger registra cancelación"
$null = Invoke-Rpc $service "process_generation_jobs" @{ p_limit = 10 }
Start-Sleep -Seconds 1
$gc2 = Get-Table $userA.Token "generations" "select=status&id=eq.$($gc.Body.id)"
AssertEq $gc2.Body[0].status "cancelled" "scheduler ignora jobs cancelados"

# ---------------------------------------------------------------- 10. concurrencia
Section "10. Concurrencia: dos schedulers a la vez"
$reset2 = Invoke-Api "PATCH" "/rest/v1/subscriptions?organization_id=eq.$($orgA.id)" $service (@{ credits_available = 5; credits_reserved = 0 } | ConvertTo-Json -Compress)
AssertOk $reset2 "reset de créditos para concurrencia"
$genIds = @()
for ($i = 0; $i -lt 5; $i++) {
  $g = Invoke-Rpc $userA.Token "create_generation" @{ p_room_id = $roomA.room_id; p_style_id = $styleModern.id; p_parameters = @{} }
  $genIds += $g.Body.id
}
$j1 = Start-Job -ArgumentList $service { param($s) $h = @{ apikey = $s; Authorization = "Bearer $s"; "Content-Type" = "application/json" }; Invoke-WebRequest -Method Post -Uri "http://127.0.0.1:54321/rest/v1/rpc/process_generation_jobs" -Headers $h -Body '{"p_limit":10}' -SkipHttpErrorCheck | Out-Null }
$j2 = Start-Job -ArgumentList $service { param($s) $h = @{ apikey = $s; Authorization = "Bearer $s"; "Content-Type" = "application/json" }; Invoke-WebRequest -Method Post -Uri "http://127.0.0.1:54321/rest/v1/rpc/process_generation_jobs" -Headers $h -Body '{"p_limit":10}' -SkipHttpErrorCheck | Out-Null }
$null = Wait-Job $j1, $j2 -Timeout 30
$deadline = [DateTime]::UtcNow.AddSeconds(30)
do {
  Start-Sleep -Milliseconds 500
  $gcx = Get-Table $userA.Token "generations" "select=id,status,retry_count&id=in.($($genIds -join ","))"
  $donec = @($gcx.Body | Where-Object { $_.status -eq "completed" }).Count
} while ($donec -lt 5 -and [DateTime]::UtcNow -lt $deadline)
AssertEq $donec 5 "5/5 completadas bajo scheduler concurrente"
$dup = @($gcx.Body | Where-Object { $_.retry_count -gt 1 })
AssertEq $dup.Count 0 "ninguna generación procesada dos veces"
$ledc2 = Get-Table $userA.Token "usage_ledger" "select=credits_used&status=eq.free&generation_id=in.($($genIds -join ","))"
AssertEq @($ledc2.Body).Count 5 "5 entradas ledger (sin duplicados)"
$subcx = Get-Table $userA.Token "subscriptions" "select=credits_available,credits_reserved"
AssertEq ([int]$subcx.Body[0].credits_reserved) 0 "sin reservas colgadas tras concurrencia"

# ---------------------------------------------------------------- 11. recuperación de jobs colgados
Section "11. Recuperación de worker colgado (timeout)"
$reset3 = Invoke-Api "PATCH" "/rest/v1/subscriptions?organization_id=eq.$($orgA.id)" $service (@{ credits_available = 3; credits_reserved = 0 } | ConvertTo-Json -Compress)
$gh = Invoke-Rpc $userA.Token "create_generation" @{ p_room_id = $roomA.room_id; p_style_id = $styleModern.id; p_parameters = @{} }
$ch = Invoke-Rpc $service "claim_generation" @{ p_generation_id = $gh.Body.id }
$fakeOld = Sql "update public.generations set locked_at = now() - interval '11 minutes' where id = '$($gh.Body.id)';"
$null = Invoke-Rpc $service "process_generation_jobs" @{ p_limit = 10 }
$ghr = Get-Table $userA.Token "generations" "select=status,error_code&id=eq.$($gh.Body.id)"
AssertEq $ghr.Body[0].status "failed" "job colgado marcado failed"
AssertEq $ghr.Body[0].error_code "worker_timeout" "error worker_timeout"
Start-Sleep -Seconds 2
$null = Invoke-Rpc $service "process_generation_jobs" @{ p_limit = 10 }
$deadline = [DateTime]::UtcNow.AddSeconds(20)
do {
  Start-Sleep -Milliseconds 500
  $ghr2 = Get-Table $userA.Token "generations" "select=status&id=eq.$($gh.Body.id)"
} while ($ghr2.Body[0].status -ne "completed" -and [DateTime]::UtcNow -lt $deadline)
AssertEq $ghr2.Body[0].status "completed" "job recuperado y completado"

# ---------------------------------------------------------------- 12. cron end-to-end
Section "12. Cron pg_cron -> pg_net -> edge function"
$reset4 = Invoke-Api "PATCH" "/rest/v1/subscriptions?organization_id=eq.$($orgA.id)" $service (@{ credits_available = 1; credits_reserved = 0 } | ConvertTo-Json -Compress)
$gcr = Invoke-Rpc $userA.Token "create_generation" @{ p_room_id = $roomA.room_id; p_style_id = $styleModern.id; p_parameters = @{} }
$null = Sql "select cron.unschedule('process-generation-jobs');"
$null = Sql "select cron.schedule('process-generation-jobs', '* * * * *', 'select public.process_generation_jobs(10)');"
$deadline = [DateTime]::UtcNow.AddSeconds(80)
$cronDone = $false
do {
  Start-Sleep -Seconds 3
  $gcrr = Get-Table $userA.Token "generations" "select=status&id=eq.$($gcr.Body.id)"
  if ($gcrr.Body[0].status -eq "completed") { $cronDone = $true }
} while (-not $cronDone -and [DateTime]::UtcNow -lt $deadline)
Assert $cronDone "cron completó la generación sin invocación manual (pg_cron+pg_net)"

# ---------------------------------------------------------------- restauración
Section "0b. Restauración"
$null = Invoke-Api "PATCH" "/rest/v1/app_config?key=eq.retry_interval" $service (@{ value = "2 minutes" } | ConvertTo-Json -Compress)
$null = Invoke-Api "PATCH" "/rest/v1/app_config?key=eq.anon_key" $service (@{ value = $anon } | ConvertTo-Json -Compress)

# ---------------------------------------------------------------- 13. regresión fase 0
if (-not $SkipRegression) {
  Section "13. Regresión Fase 0"
  & (Join-Path $PSScriptRoot "phase0_validation.ps1")
  Assert ($LASTEXITCODE -eq 0) "harness Fase 0 sigue verde"
}

Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "FASE 1: $Pass PASS / $Fail FAIL" -ForegroundColor $(if ($Fail -eq 0) { "Green" } else { "Red" })
if ($Fail -gt 0) { Write-Host ($Errors -join "`n") -ForegroundColor Red }
exit $(if ($Fail -eq 0) { 0 } else { 1 })
