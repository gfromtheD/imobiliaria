# RoomImages Cloud E2E — real REST/RPC/Storage contracts, no commercial AI.
# SUPABASE_E2E_ENV_FILE may point to an ignored .env.local in another worktree.
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$RunId = [guid]::NewGuid().ToString('N').Substring(0, 12)
$Pass = 0
$Fail = 0
$CreatedUsers = @()
$EnvFile = if ($env:SUPABASE_E2E_ENV_FILE) { $env:SUPABASE_E2E_ENV_FILE } else { Join-Path $PSScriptRoot '..\..\.env.local' }

function Read-EnvValue([string]$Name) {
  $line = Get-Content $EnvFile | Where-Object { $_ -match ('^' + [regex]::Escape($Name) + '=') } | Select-Object -First 1
  if (-not $line) { throw "$Name no está configurada." }
  return (($line -split '=', 2)[1]).Trim().Trim('"').Trim("'")
}

$BaseUrl = Read-EnvValue 'NEXT_PUBLIC_SUPABASE_URL'
$AnonKey = Read-EnvValue 'NEXT_PUBLIC_SUPABASE_ANON_KEY'
$ServiceKey = Read-EnvValue 'SUPABASE_SERVICE_ROLE_KEY'

function Assert([bool]$Condition, [string]$Message) {
  if ($Condition) { $script:Pass++; Write-Host "  [PASS] $Message" -ForegroundColor Green }
  else { $script:Fail++; Write-Host "  [FAIL] $Message" -ForegroundColor Red }
}
function Invoke-Api([string]$Method, [string]$Path, [string]$Token, $Body = $null, [string]$ContentType = 'application/json', [string]$ApiKey = $AnonKey) {
  $headers = @{ apikey = $ApiKey; Authorization = "Bearer $Token"; Prefer = 'return=representation' }
  try {
    $request = @{ Uri = "$BaseUrl$Path"; Method = $Method; Headers = $headers; SkipHttpErrorCheck = $true }
    if ($null -ne $Body) { $request.Body = $Body; $request.ContentType = $ContentType }
    $response = Invoke-WebRequest @request
    $parsed = $null; if ($response.Content) { try { $parsed = $response.Content | ConvertFrom-Json } catch { $parsed = $response.Content } }
    return [pscustomobject]@{ Status = [int]$response.StatusCode; Body = $parsed; Raw = $response.Content }
  } catch { return [pscustomobject]@{ Status = 0; Body = $null; Raw = $_.Exception.Message } }
}
function Invoke-Rpc([string]$Token, [string]$FunctionName, [hashtable]$Parameters, [string]$ApiKey = $AnonKey) {
  Invoke-Api 'POST' "/rest/v1/rpc/$FunctionName" $Token ($Parameters | ConvertTo-Json -Compress -Depth 5) 'application/json' $ApiKey
}
function First($Body) { if ($Body -is [array]) { return @($Body)[0] }; return $Body }
function Create-User([string]$Suffix) {
  $email = "room-images-$Suffix-$RunId@e2e.invalid"; $password = "RoomImages!$RunId"
  $created = Invoke-Api 'POST' '/auth/v1/admin/users' $ServiceKey (@{ email=$email; password=$password; email_confirm=$true } | ConvertTo-Json -Compress) 'application/json' $ServiceKey
  if ($created.Status -notin 200,201) { throw "No se pudo crear usuario temporal $Suffix" }
  $script:CreatedUsers += $created.Body.id
  $login = Invoke-Api 'POST' '/auth/v1/token?grant_type=password' $AnonKey (@{ email=$email; password=$password } | ConvertTo-Json -Compress)
  if ($login.Status -ne 200) { throw "No se pudo iniciar sesión temporal $Suffix" }
  $profile = First (Invoke-Api 'GET' "/rest/v1/users?select=organization_id&id=eq.$($created.Body.id)" $login.Body.access_token).Body
  return [pscustomobject]@{ Token=$login.Body.access_token; OrgId=$profile.organization_id; UserId=$created.Body.id }
}
function Upload-Png([string]$Token, [string]$Path) {
  $png = [Convert]::FromBase64String('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==')
  Invoke-Api 'POST' "/storage/v1/object/original-images/$Path" $Token $png 'image/png'
}
function Create-ReadyImage($User, [string]$RoomId, [string]$FileName) {
  $created = Invoke-Rpc $User.Token 'create_room_image' @{ p_room_id=$RoomId; p_file_name=$FileName }
  if ($created.Status -ne 200) { throw "create_room_image falló: $($created.Raw)" }
  $upload = Upload-Png $User.Token $created.Body.upload_path
  if ($upload.Status -ne 200) { throw "Upload falló: $($upload.Raw)" }
  $ready = Invoke-Rpc $User.Token 'finalize_room_image_upload' @{ p_room_image_id=$created.Body.image_id; p_upload_path=$created.Body.upload_path }
  if ($ready.Status -ne 200) { throw "Finalize falló: $($ready.Raw)" }
  return $created.Body
}

try {
  Write-Host '== RoomImages Cloud E2E ==' -ForegroundColor Cyan
  $a = Create-User 'a'; $b = Create-User 'b'
  Assert ($a.OrgId -and $a.OrgId -ne $b.OrgId) 'dos organizaciones aisladas creadas'

  $property = First (Invoke-Api 'POST' '/rest/v1/properties' $a.Token (@{ organization_id=$a.OrgId; title="RoomImages $RunId" } | ConvertTo-Json -Compress)).Body
  Assert ([bool]$property.id) 'propiedad de prueba creada'

  $room = (Invoke-Rpc $a.Token 'create_room' @{ p_property_id=$property.id; p_room_type='salón'; p_notes='inicial' }).Body
  Assert ($room.room_id -and -not $room.image_id -and -not $room.upload_path) 'Room creada sin imagen'

  $updated = Invoke-Rpc $a.Token 'update_room' @{ p_room_id=$room.room_id; p_room_type='comedor'; p_notes='actualizada' }
  Assert ($updated.Status -eq 200 -and $updated.Body.room_type -eq 'comedor' -and $updated.Body.notes -eq 'actualizada') 'edición autorizada de Room'

  $firstPending = Invoke-Rpc $a.Token 'create_room_image' @{ p_room_id=$room.room_id; p_file_name='first.png' }
  Assert ($firstPending.Status -eq 200 -and $firstPending.Body.status -eq 'pending') 'primera imagen pending creada'
  $pendingList = Invoke-Api 'GET' "/rest/v1/room_images?select=id,status&room_id=eq.$($room.room_id)" $a.Token
  Assert (@($pendingList.Body | Where-Object { $_.id -eq $firstPending.Body.image_id -and $_.status -eq 'pending' }).Count -eq 1) 'pending recuperable en una nueva consulta'
  $firstUpload = Upload-Png $a.Token $firstPending.Body.upload_path
  $firstReady = Invoke-Rpc $a.Token 'finalize_room_image_upload' @{ p_room_image_id=$firstPending.Body.image_id; p_upload_path=$firstPending.Body.upload_path }
  Assert ($firstUpload.Status -eq 200 -and $firstReady.Status -eq 200 -and $firstReady.Body.status -eq 'ready') 'pending finaliza como ready'

  $second = Create-ReadyImage $a $room.room_id 'second.png'
  $images = Invoke-Api 'GET' "/rest/v1/room_images?select=id,status&room_id=eq.$($room.room_id)" $a.Token
  Assert (@($images.Body | Where-Object { $_.status -eq 'ready' }).Count -eq 2) 'segunda imagen ready en la misma Room'

  $cancelPending = (Invoke-Rpc $a.Token 'create_room_image' @{ p_room_id=$room.room_id; p_file_name='cancel.png' }).Body
  $prepareCancel = Invoke-Rpc $a.Token 'prepare_room_image_deletion' @{ p_room_image_id=$cancelPending.image_id }
  $completeCancel = Invoke-Rpc $a.Token 'complete_room_image_deletion' @{ p_room_image_id=$cancelPending.image_id }
  Assert ($prepareCancel.Status -eq 200 -and $completeCancel.Status -eq 200 -and $completeCancel.Body -eq $true) 'pending abandonado cancelado sin depender del navegador'

  $deletable = Create-ReadyImage $a $room.room_id 'delete.png'
  $prepareDelete = Invoke-Rpc $a.Token 'prepare_room_image_deletion' @{ p_room_image_id=$deletable.image_id }
  $deleteObject = Invoke-Api 'DELETE' "/storage/v1/object/original-images/$($deletable.upload_path)" $a.Token
  $completeDelete = Invoke-Rpc $a.Token 'complete_room_image_deletion' @{ p_room_image_id=$deletable.image_id }
  Assert ($prepareDelete.Status -eq 200 -and $deleteObject.Status -eq 200 -and $completeDelete.Status -eq 200) 'borrado de imagen en dos pasos limpia Storage y DB'

  $style = First (Invoke-Api 'GET' '/rest/v1/styles?select=id&active=eq.true&limit=1' $a.Token).Body
  $generation = Invoke-Rpc $a.Token 'create_generation' @{ p_room_id=$room.room_id; p_style_id=$style.id; p_source_image_id=$second.image_id; p_parameters=@{} }
  Assert ($generation.Status -eq 200 -and $generation.Body.source_image_id -eq $second.image_id) 'Generation queda vinculada a la imagen seleccionada'
  $workerRun = Invoke-Api 'POST' '/functions/v1/process-generation' $ServiceKey (@{ generation_id=$generation.Body.id } | ConvertTo-Json -Compress) 'application/json' $ServiceKey
  $completedGeneration = First (Invoke-Api 'GET' "/rest/v1/generations?select=status,source_image_id,output_image_path&id=eq.$($generation.Body.id)" $a.Token).Body
  Assert ($workerRun.Status -eq 200 -and $workerRun.Body.ok -eq $true -and $completedGeneration.status -eq 'completed' -and $completedGeneration.source_image_id -eq $second.image_id -and [bool]$completedGeneration.output_image_path) 'worker Cloud procesa exactamente la imagen seleccionada por source_image_id'
  $ambiguous = Invoke-Rpc $a.Token 'create_generation' @{ p_room_id=$room.room_id; p_style_id=$style.id; p_parameters=@{} }
  Assert ($ambiguous.Raw -match 'source_image_required') 'dos imágenes nunca se resuelven implícitamente'
  $blockedImageDelete = Invoke-Rpc $a.Token 'prepare_room_image_deletion' @{ p_room_image_id=$second.image_id }
  Assert ($blockedImageDelete.Raw -match 'image_has_generations') 'imagen fuente con historial no se borra por accidente'

  $foreignImages = Invoke-Api 'GET' "/rest/v1/room_images?select=id&room_id=eq.$($room.room_id)" $b.Token
  $foreignCreate = Invoke-Rpc $b.Token 'create_room_image' @{ p_room_id=$room.room_id; p_file_name='foreign.png' }
  $foreignFinalize = Invoke-Rpc $b.Token 'finalize_room_image_upload' @{ p_room_image_id=$firstPending.Body.image_id; p_upload_path=$firstPending.Body.upload_path }
  $foreignUpdate = Invoke-Rpc $b.Token 'update_room' @{ p_room_id=$room.room_id; p_room_type='baño'; p_notes='hack' }
  $foreignDelete = Invoke-Rpc $b.Token 'prepare_room_deletion' @{ p_room_id=$room.room_id }
  $foreignGeneration = Invoke-Rpc $b.Token 'create_generation' @{ p_room_id=$room.room_id; p_style_id=$style.id; p_source_image_id=$firstPending.Body.image_id; p_parameters=@{} }
  $foreignReadObject = Invoke-Api 'GET' "/storage/v1/object/original-images/$($firstPending.Body.upload_path)" $b.Token $null $null
  $foreignWriteObject = Upload-Png $b.Token $firstPending.Body.upload_path
  Assert (@($foreignImages.Body).Count -eq 0 -and $foreignCreate.Raw -match 'room_not_found' -and $foreignFinalize.Raw -match 'room_image_not_found' -and $foreignUpdate.Raw -match 'room_not_found_or_deleting' -and $foreignDelete.Raw -match 'room_not_found' -and $foreignGeneration.Raw -match 'room_not_found') 'RLS y RPC bloquean todos los IDs de otra organización'
  Assert ($foreignReadObject.Status -notin 200,201 -and $foreignWriteObject.Status -notin 200,201) 'Storage original bloquea lectura y escritura cross-tenant'

  $cancellableGeneration = Invoke-Rpc $a.Token 'create_generation' @{ p_room_id=$room.room_id; p_style_id=$style.id; p_source_image_id=$firstPending.Body.image_id; p_parameters=@{} }
  $cancelGeneration = Invoke-Rpc $a.Token 'cancel_generation' @{ p_generation_id=$cancellableGeneration.Body.id }
  $cancelLedger = Invoke-Api 'GET' "/rest/v1/usage_ledger?select=status,credits_used&generation_id=eq.$($cancellableGeneration.Body.id)" $a.Token
  Assert ($cancelGeneration.Status -eq 200 -and (First $cancelLedger.Body).status -eq 'cancelled' -and [int](First $cancelLedger.Body).credits_used -eq 0) 'cancelación conserva crédito y ledger coherentes'

  $deleteRoom = (Invoke-Rpc $a.Token 'create_room' @{ p_property_id=$property.id; p_room_type='cocina' }).Body
  $deleteRoomImage = Create-ReadyImage $a $deleteRoom.room_id 'room-delete.png'
  $deletePlan = Invoke-Rpc $a.Token 'prepare_room_deletion' @{ p_room_id=$deleteRoom.room_id }
  $deleteOriginal = Invoke-Api 'DELETE' "/storage/v1/object/original-images/$($deleteRoomImage.upload_path)" $a.Token
  $deleteComplete = Invoke-Rpc $a.Token 'complete_room_deletion' @{ p_deletion_id=$deletePlan.Body.deletion_id }
  $deletedRoom = Invoke-Api 'GET' "/rest/v1/rooms?select=id&id=eq.$($deleteRoom.room_id)" $a.Token
  Assert ($deletePlan.Status -eq 200 -and $deleteOriginal.Status -eq 200 -and $deleteComplete.Status -eq 200 -and @($deletedRoom.Body).Count -eq 0) 'borrado de Room es recuperable y no deja su original'

  $backfillGenerations = Invoke-Api 'GET' '/rest/v1/generations?select=id&source_image_id=is.null' $ServiceKey $null $null $ServiceKey
  $backfillRooms = Invoke-Api 'GET' '/rest/v1/rooms?select=id,original_image_path,room_images(storage_path)&original_image_path=not.is.null' $ServiceKey $null $null $ServiceKey
  $legacyMismatch = @($backfillRooms.Body | Where-Object {
    $legacyRoom = $_
    $legacyRoom.original_image_path -and -not (@($legacyRoom.room_images | Where-Object { $_.storage_path -eq $legacyRoom.original_image_path }).Count -gt 0)
  }).Count
  Assert (@($backfillGenerations.Body).Count -eq 0 -and $legacyMismatch -eq 0) 'backfill conserva generaciones e imágenes legacy sin divergencia'
}
finally {
  foreach ($userId in $CreatedUsers) { $null = Invoke-Api 'DELETE' "/auth/v1/admin/users/$userId" $ServiceKey $null 'application/json' $ServiceKey }
}

Write-Host "RoomImages Cloud E2E: $Pass PASS / $Fail FAIL"
exit $(if ($Fail -eq 0) { 0 } else { 1 })
