-- PHASE 0 VALIDATION — async pipeline
-- PostgreSQL / Supabase -> image_jobs -> pg_cron -> process_jobs() -> pg_net -> Edge Function -> MockAdapter -> result -> PostgreSQL

-- 1. Extensions
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 2. Job queue table (validation scope, not the product schema)
create table public.image_jobs (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  payload jsonb not null default '{}'::jsonb,
  attempt_count int not null default 0,
  max_attempts int not null default 3,
  enqueued_count int not null default 0,
  locked_at timestamptz,
  locked_by text,
  result jsonb,
  error_code text,
  error_message text,
  status_history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_image_jobs_pending on public.image_jobs (created_at) where status = 'pending';

-- 3. Runtime config (values inserted by the test harness; no secrets: anon key is public by design)
create table public.phase0_config (
  key text primary key,
  value text not null
);

-- 4. Atomic claim: pending -> processing (only one worker can win)
create or replace function public.claim_job(p_job_id uuid, p_worker text default 'edge-function')
returns public.image_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job public.image_jobs;
begin
  update public.image_jobs
     set status = 'processing',
         locked_at = now(),
         locked_by = p_worker,
         attempt_count = attempt_count + 1,
         updated_at = now(),
         status_history = status_history || jsonb_build_object(
           'status', 'processing', 'at', now(), 'note', 'claimed by ' || p_worker
         )
   where id = p_job_id
     and status = 'pending'
   returning * into v_job;
  return v_job;
end;
$$;

-- 5. Complete: processing -> completed (guard on status prevents double completion)
create or replace function public.complete_job(p_job_id uuid, p_result jsonb)
returns public.image_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job public.image_jobs;
begin
  update public.image_jobs
     set status = 'completed',
         result = p_result,
         locked_at = null,
         locked_by = null,
         updated_at = now(),
         status_history = status_history || jsonb_build_object(
           'status', 'completed', 'at', now(), 'note', 'result stored'
         )
   where id = p_job_id
     and status = 'processing'
   returning * into v_job;
  return v_job;
end;
$$;

-- 6. Fail: processing -> failed (records error; allows retry)
create or replace function public.fail_job(p_job_id uuid, p_error_code text, p_error_message text)
returns public.image_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job public.image_jobs;
begin
  update public.image_jobs
     set status = 'failed',
         error_code = p_error_code,
         error_message = p_error_message,
         locked_at = null,
         locked_by = null,
         updated_at = now(),
         status_history = status_history || jsonb_build_object(
           'status', 'failed', 'at', now(), 'note', 'error: ' || p_error_code
         )
   where id = p_job_id
     and status = 'processing'
   returning * into v_job;
  return v_job;
end;
$$;

-- 7. Retry: failed -> pending (only while attempts remain; never duplicates a completed result)
create or replace function public.retry_job(p_job_id uuid)
returns public.image_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job public.image_jobs;
begin
  update public.image_jobs
     set status = 'pending',
         locked_at = null,
         locked_by = null,
         error_code = null,
         error_message = null,
         updated_at = now(),
         status_history = status_history || jsonb_build_object(
           'status', 'pending', 'at', now(), 'note', 'retry scheduled'
         )
   where id = p_job_id
     and status = 'failed'
     and attempt_count < max_attempts
   returning * into v_job;
  return v_job;
end;
$$;

-- 8. process_jobs(): enqueue pending jobs to the Edge Function via pg_net
create or replace function public.process_jobs(p_limit int default 10)
returns int
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_job record;
  v_url text;
  v_anon text;
  v_api text;
  v_count int := 0;
begin
  select value into v_url from public.phase0_config where key = 'edge_function_url';
  select value into v_anon from public.phase0_config where key = 'anon_key';
  select value into v_api  from public.phase0_config where key = 'api_url';

  if v_url is null or v_anon is null or v_api is null then
    raise notice 'phase0_config incomplete: edge_function_url/anon_key/api_url required';
    return 0;
  end if;

  for v_job in
    select id
      from public.image_jobs
     where status = 'pending'
     order by created_at
     limit p_limit
     for update skip locked
  loop
    perform net.http_post(
      url := v_url,
      body := jsonb_build_object('job_id', v_job.id::text, 'api_url', v_api),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_anon
      )
    );
    update public.image_jobs
       set enqueued_count = enqueued_count + 1
     where id = v_job.id;
    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

-- 9. Scheduler: pg_cron every minute (pg_cron minimum granularity is 1 minute)
select cron.schedule(
  'phase0-process-jobs',
  '* * * * *',
  'select public.process_jobs(10)'
);

-- 10. Access: table locked down (RLS, no policies = deny by default for anon/authenticated)
alter table public.image_jobs enable row level security;

-- Only the worker RPCs are executable by API roles; direct table access is denied.
grant execute on function public.claim_job(uuid, text) to anon, authenticated, service_role;
grant execute on function public.complete_job(uuid, jsonb) to anon, authenticated, service_role;
grant execute on function public.fail_job(uuid, text, text) to anon, authenticated, service_role;
grant execute on function public.retry_job(uuid) to anon, authenticated, service_role;
