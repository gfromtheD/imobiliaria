# Phase 0 validation harness — async pipeline
# PostgreSQL/Supabase -> image_jobs -> process_jobs() -> pg_net -> Edge Function -> MockAdapter -> result -> PostgreSQL
# Run from repo root after `supabase start`.

$ErrorActionPreference = "Stop"
$PSNativeCommandUseErrorActionPreference = $false
$global:failures = 0

function Say($text) { Write-Host $text }
function Pass($text) { Say "  PASS  $text" }
function Fail($text) { $global:failures++; Say "  FAIL  $text" }
function Check($cond, $text) { if ($cond) { Pass $text } else { Fail $text } }

# --- locate the local database container
$container = (docker ps --format "{{.Names}}" | Where-Object { $_ -like "supabase_db_*" } | Select-Object -First 1)
if (-not $container) { Say "ERROR: supabase database container not found. Run 'supabase start' first."; exit 1 }
Say "Container: $container"

# --- keys from the running stack (runtime only, never written to files)
# CLI 2.114 outputs ANON_KEY="..." style lines
$envOut = supabase status -o env
$anonLine = $envOut | Where-Object { $_ -like "ANON_KEY=*" } | Select-Object -First 1
$anon = ""
if ($anonLine -match '^ANON_KEY="?([^"]+)"?$') { $anon = $Matches[1] }
if (-not $anon) { Say "ERROR: could not read ANON_KEY from 'supabase status -o env'"; exit 1 }

function Sql($sql) {
  docker exec $container psql -U postgres -d postgres -v ON_ERROR_STOP=1 -tA -c $sql 2>$null
}

# --- eliminar la carrera con el cron phase0-process-jobs durante TEST 1-3
# (un tick del cron puede encolar el job entre el INSERT y la llamada manual de
# process_jobs(), y el worker puede reclamarlo antes -> el contador manual da 0).
# El TEST 4 lo re-programa para validar el cron end-to-end.
Sql "select cron.unschedule('phase0-process-jobs') where exists (select 1 from cron.job where jobname = 'phase0-process-jobs');" | Out-Null

# --- seed runtime config (edge_function_url reaches Kong from the postgres container)
Sql "INSERT INTO public.phase0_config (key, value) VALUES
  ('edge_function_url', 'http://kong:8000/functions/v1/process-job'),
  ('api_url', 'http://kong:8000'),
  ('anon_key', '$anon')
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;" | Out-Null
Pass "phase0_config seeded"

# psql 17 prints command tags like "INSERT 0 1" even with -tA, so the INSERT
# is wrapped in a CTE and only the uuid line is extracted.
function InsertJob($payloadJson) {
  $out = Sql "WITH ins AS (INSERT INTO public.image_jobs (payload) VALUES ('$payloadJson'::jsonb) RETURNING id) SELECT id FROM ins;"
  ($out | Where-Object { $_ -match "^[0-9a-f-]{36}$" } | Select-Object -First 1).Trim()
}

function GetJobState($id) {
  $row = Sql "SELECT row_to_json(t) FROM (SELECT status, attempt_count, enqueued_count, error_code, error_message, locked_by, result, status_history FROM public.image_jobs WHERE id = '$id') t;"
  if (-not $row) { return $null }
  try { $row | ConvertFrom-Json } catch { return $null }
}

function WaitFor($id, $maxSeconds, $targetStatuses) {
  $deadline = (Get-Date).AddSeconds($maxSeconds)
  do {
    $s = GetJobState $id
    if ($s -and $targetStatuses -contains $s.status) { return $s }
    Start-Sleep -Milliseconds 500
  } while ((Get-Date) -lt $deadline)
  return GetJobState $id
}

function ProcessingEvents($state) {
  if (-not $state -or -not $state.status_history) { return 0 }
  if ($state.status_history -is [string]) { $state.status_history = $state.status_history | ConvertFrom-Json }
  ($state.status_history | Where-Object { $_.status -eq "processing" }).Count
}

function HistoryChain($state) {
  if (-not $state -or -not $state.status_history) { return "" }
  if ($state.status_history -is [string]) { $state.status_history = $state.status_history | ConvertFrom-Json }
  ($state.status_history | ForEach-Object { $_.status }) -join " -> "
}

Say ""
Say "=== TEST 1: happy path pending -> processing -> completed ==="
$j1 = InsertJob '{"room_type":"salon","style":"moderno","test":"happy-path"}'
Check ($j1 -match "^[0-9a-f-]{36}$") "job created with uuid ($j1)"
$enq = (Sql "SELECT public.process_jobs(10);").Trim()
Check ($enq -eq "1") "process_jobs() enqueued 1 job (got $enq)"
$s1 = WaitFor $j1 30 @("completed", "failed")
Check ($s1.status -eq "completed") "job reached completed (got $($s1.status))"
if ($s1) {
  Check (ProcessingEvents $s1 -eq 1) "exactly one processing event in status_history"
  Check ($s1.attempt_count -eq 1) "attempt_count = 1"
  Check ($s1.enqueued_count -eq 1) "enqueued_count = 1"
  Check ($s1.result.provider -eq "mock") "result.provider = mock"
  Check ($null -ne $s1.result.artifact) "result.artifact present"
  Check ($null -eq $s1.locked_by) "lock released after completion"
  Say "  history: $(HistoryChain $s1)"
}

Say ""
Say "=== TEST 2: concurrency — two workers race for the same job ==="
$j2 = InsertJob '{"room_type":"dormitorio","style":"rustico","test":"concurrency"}'
$w1 = Start-Job { param($c, $id) docker exec $c psql -U postgres -d postgres -tA -c "SELECT (public.claim_job('$id','worker-1')).id;" 2>$null } -ArgumentList $container, $j2
$w2 = Start-Job { param($c, $id) docker exec $c psql -U postgres -d postgres -tA -c "SELECT (public.claim_job('$id','worker-2')).id;" 2>$null } -ArgumentList $container, $j2
$r1 = (Receive-Job $w1 -Wait | Where-Object { $_ -eq $j2 }).Count
$r2 = (Receive-Job $w2 -Wait | Where-Object { $_ -eq $j2 }).Count
Remove-Job $w1, $w2
Check (($r1 + $r2) -eq 1) "exactly one parallel claim won (w1=$r1, w2=$r2)"

# reset job 2 to pending, then race two process_jobs() enqueues
Sql "UPDATE public.image_jobs SET status='pending', locked_at=NULL, locked_by=NULL WHERE id='$j2';" | Out-Null
$p1 = Start-Job { param($c) docker exec $c psql -U postgres -d postgres -tA -c "SELECT public.process_jobs(10);" 2>$null } -ArgumentList $container
$p2 = Start-Job { param($c) docker exec $c psql -U postgres -d postgres -tA -c "SELECT public.process_jobs(10);" 2>$null } -ArgumentList $container
$e1 = (Receive-Job $p1 -Wait | Where-Object { $_ -match "^\d+$" }).Count
$e2 = (Receive-Job $p2 -Wait | Where-Object { $_ -match "^\d+$" }).Count
Remove-Job $p1, $p2
$s2 = WaitFor $j2 30 @("completed", "failed")
Check ($s2.status -eq "completed") "job completed after concurrent enqueues (got $($s2.status))"
if ($s2) {
  Check (ProcessingEvents $s2 -eq 1) "single processing event despite two process_jobs() calls (SKIP LOCKED)"
  Check ($s2.enqueued_count -ge 1 -and $s2.enqueued_count -le 2) "enqueued_count in [1,2] (got $($s2.enqueued_count))"
  Check ($null -ne $s2.result.artifact) "single result artifact stored"
  Say "  enqueued by p1/p2: $e1 / $e2"
}

Say ""
Say "=== TEST 3: error + retry — controlled failure, then safe reprocessing ==="
$j3 = InsertJob '{"room_type":"cocina","style":"minimalista","fail":true}'
$enq3 = (Sql "SELECT public.process_jobs(10);").Trim()
Check ($enq3 -eq "1") "process_jobs() enqueued failure job (got '$($enq3 -join '|')')"
$s3 = WaitFor $j3 30 @("completed", "failed")
Check ($s3.status -eq "failed") "job failed as forced (got $($s3.status))"
if ($s3) {
  Check ($s3.error_code -eq "provider_error") "error_code = provider_error (got $($s3.error_code))"
  Check ($s3.error_message -like "*simulated provider failure*") "error_message recorded"
  Check ($null -eq $s3.result) "no partial result stored"
  Check (ProcessingEvents $s3 -eq 1) "single processing event for failed run"
}

$retried = (Sql "SELECT (public.retry_job('$j3')).status;").Trim()
Check ($retried -eq "pending") "retry_job() moved job back to pending (got $retried)"
$enq3b = (Sql "SELECT public.process_jobs(10);").Trim()
Check ($enq3b -eq "1") "retried job re-enqueued"
$s3b = WaitFor $j3 30 @("completed", "failed")
Check ($s3b.status -eq "completed") "retried job completed (got $($s3b.status))"
if ($s3b) {
  Check ($s3b.attempt_count -eq 2) "attempt_count = 2 after retry"
  Check (ProcessingEvents $s3b -eq 2) "two processing events across both runs"
  Check ($null -ne $s3b.result.artifact) "retry produced a result artifact"
  Check ($null -eq $s3b.error_code) "error cleared after retry"
}

Say ""
Say "=== TEST 4: scheduler — pg_cron picks up a pending job automatically ==="
Sql "select cron.unschedule('phase0-process-jobs');" | Out-Null
Sql "select cron.schedule('phase0-process-jobs', '* * * * *', 'select public.process_jobs(10)');" | Out-Null
$j4 = InsertJob '{"room_type":"sala","style":"escandinavo","test":"cron"}'
Say "  inserted pending job, waiting for pg_cron tick (up to 110s) without calling process_jobs()"
$s4 = WaitFor $j4 110 @("completed", "failed")
Check ($s4.status -eq "completed") "job completed via pg_cron + pg_net alone (got $($s4.status))"
if ($s4) {
  Check (ProcessingEvents $s4 -eq 1) "single processing event via scheduler"
  Check ($s4.enqueued_count -ge 1) "enqueued by scheduler (enqueued_count = $($s4.enqueued_count))"
}

Say ""
Say "=== SUMMARY ==="
if ($global:failures -eq 0) { Say "ALL CHECKS PASSED" } else { Say "$global:failures CHECK(S) FAILED" }
exit $global:failures
