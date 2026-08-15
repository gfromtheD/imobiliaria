-- 20260815030000_rpc_null_and_scheduler_fixes.sql
-- Dos correcciones de contrato de la Fase 1 (migración 2 aplicada, no se edita):
--
-- 1. process_generation_jobs: el `select count(*) from recovered;` final (CTE con
--    data-modifying statements) no tiene destino de resultado -> error 42601
--    "query has no destination for result data" -> el scheduler abortaba en el
--    primer paso sin recuperar colgados, reabrir reintentables ni encolar jobs.
--    Fix: asignar el conteo a v_count (que suma los encolados en el bucle).
--
-- 2. claim/complete/fail/retry/cancel_generation: en PL/pgSQL, devolver un
--    composite NULL (return v_generation con fila no encontrada, o return null
--    en una función returns composite) produce UNA FILA con todas las columnas
--    NULL — no un resultado vacío. El worker trataba esa fila como un claim
--    válido (truthy) y los clientes no podían distinguir "sin resultado".
--    Fix: returns jsonb — to_jsonb(fila) o null real.

drop function if exists public.claim_generation(uuid);
drop function if exists public.complete_generation(uuid, text, text, numeric, jsonb);
drop function if exists public.fail_generation(uuid, text, text, boolean);
drop function if exists public.retry_generation(uuid);
drop function if exists public.cancel_generation(uuid);
drop function if exists public.process_generation_jobs(int);

-- Claim atómico: pending -> processing (solo un worker gana)
create or replace function public.claim_generation(p_generation_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_generation public.generations;
begin
  update public.generations
     set status = 'processing',
         locked_at = now(),
         retry_count = retry_count + 1,
         started_at = coalesce(started_at, now()),
         updated_at = now()
   where id = p_generation_id
     and status = 'pending'
   returning * into v_generation;
  if not found then
    return null;
  end if;
  return to_jsonb(v_generation);
end;
$$;

-- Completar: processing -> completed; consume el crédito reservado; ledger
create or replace function public.complete_generation(
  p_generation_id uuid,
  p_output_path text,
  p_provider_job_id text,
  p_cost_estimate numeric default 0,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_generation public.generations;
  v_plan text;
  v_status text;
begin
  update public.generations
     set status = 'completed',
         output_image_path = p_output_path,
         provider_job_id = p_provider_job_id,
         locked_at = null,
         completed_at = now(),
         updated_at = now()
   where id = p_generation_id
     and status = 'processing'
   returning * into v_generation;

  if not found then
    return null;
  end if;

  update public.subscriptions
     set credits_reserved = credits_reserved - 1,
         updated_at = now()
   where organization_id = v_generation.organization_id
     and credits_reserved > 0;

  select plan into v_plan from public.subscriptions
   where organization_id = v_generation.organization_id;
  v_status := case when v_plan = 'free' then 'free' else 'billable' end;

  insert into public.usage_ledger (organization_id, generation_id, credits_used, provider_cost_estimate, status, reason)
  values (v_generation.organization_id, v_generation.id, 1, coalesce(p_cost_estimate, 0), v_status, 'completed');

  return to_jsonb(v_generation);
end;
$$;

-- Fallar: processing -> failed; ledger provider_error; devolución del crédito si el job es terminal
-- (no reintentable o intentos agotados). Los fallos reintentables mantienen la reserva: un job
-- nunca consume más de un crédito y los retries nunca duplican cargos.
create or replace function public.fail_generation(
  p_generation_id uuid,
  p_error_code text,
  p_error_message text,
  p_retryable boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_generation public.generations;
  v_max int;
begin
  update public.generations
     set status = 'failed',
         error_code = coalesce(p_error_code, 'unknown'),
         error_message = coalesce(p_error_message, ''),
         locked_at = null,
         updated_at = now()
   where id = p_generation_id
     and status = 'processing'
   returning * into v_generation;

  if not found then
    return null;
  end if;

  insert into public.usage_ledger (organization_id, generation_id, credits_used, provider_cost_estimate, status, reason)
  values (v_generation.organization_id, v_generation.id, 0, 0, 'provider_error', p_error_code);

  select coalesce((select value::int from public.app_config where key = 'max_attempts'), 3) into v_max;

  if not p_retryable or v_generation.retry_count >= v_max then
    update public.subscriptions
       set credits_reserved = credits_reserved - 1,
           credits_available = credits_available + 1,
           updated_at = now()
     where organization_id = v_generation.organization_id
       and credits_reserved > 0;

    if v_generation.retry_count < v_max then
      -- fallo no reintentable: marcamos terminal para que el auto-retry nunca lo reabra
      update public.generations set retry_count = v_max where id = v_generation.id;
    end if;
  end if;

  return to_jsonb(v_generation);
end;
$$;

-- Retry manual: failed -> pending (solo con intentos restantes)
create or replace function public.retry_generation(p_generation_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_generation public.generations;
  v_max int;
begin
  select coalesce((select value::int from public.app_config where key = 'max_attempts'), 3) into v_max;

  update public.generations
     set status = 'pending',
         error_code = null,
         error_message = null,
         locked_at = null,
         updated_at = now()
   where id = p_generation_id
     and status = 'failed'
     and retry_count < v_max
   returning * into v_generation;
  if not found then
    return null;
  end if;
  return to_jsonb(v_generation);
end;
$$;

-- Cancelar: pending -> cancelled; devolución del crédito; ledger cancelled
create or replace function public.cancel_generation(p_generation_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_generation public.generations;
begin
  update public.generations
     set status = 'cancelled',
         locked_at = null,
         updated_at = now()
   where id = p_generation_id
     and status = 'pending'
   returning * into v_generation;

  if not found then
    return null;
  end if;

  update public.subscriptions
     set credits_reserved = credits_reserved - 1,
         credits_available = credits_available + 1,
         updated_at = now()
   where organization_id = v_generation.organization_id
     and credits_reserved > 0;

  insert into public.usage_ledger (organization_id, generation_id, credits_used, provider_cost_estimate, status, reason)
  values (v_generation.organization_id, v_generation.id, 0, 0, 'cancelled', 'cancelled_by_user');

  return to_jsonb(v_generation);
end;
$$;

-- Scheduler: recupera jobs colgados, reabre reintentables y encola pendientes via pg_net
create or replace function public.process_generation_jobs(p_limit int default 10)
returns int
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_url text;
  v_anon text;
  v_api text;
  v_max_concurrent int;
  v_max_attempts int;
  v_timeout interval;
  v_retry_interval interval;
  v_job record;
  v_count int := 0;
begin
  select coalesce((select value from public.app_config where key = 'edge_function_url'),
                  'http://kong:8000/functions/v1/process-generation') into v_url;
  select coalesce((select value from public.app_config where key = 'anon_key'), '') into v_anon;
  select coalesce((select value from public.app_config where key = 'api_url'), 'http://kong:8000') into v_api;
  select coalesce((select value::int from public.app_config where key = 'max_concurrent'), 3) into v_max_concurrent;
  select coalesce((select value::int from public.app_config where key = 'max_attempts'), 3) into v_max_attempts;
  select coalesce((select value::interval from public.app_config where key = 'job_timeout'), interval '10 minutes') into v_timeout;
  select coalesce((select value::interval from public.app_config where key = 'retry_interval'), interval '2 minutes') into v_retry_interval;

  if v_anon = '' then
    raise notice 'app_config incompleto: falta anon_key';
    return 0;
  end if;

  -- 1. jobs colgados (worker muerto): processing -> failed (retryable) + ledger
  with recovered as (
    update public.generations
       set status = 'failed',
           error_code = 'worker_timeout',
           error_message = 'worker did not complete in time',
           locked_at = null,
           updated_at = now()
     where status = 'processing'
       and locked_at < now() - v_timeout
     returning id, organization_id, retry_count
  ), ledgered as (
    insert into public.usage_ledger (organization_id, generation_id, credits_used, provider_cost_estimate, status, reason)
    select organization_id, id, 0, 0, 'provider_error', 'worker_timeout'
      from recovered
  ), refunded as (
    update public.subscriptions s
       set credits_reserved = s.credits_reserved - 1,
           credits_available = s.credits_available + 1,
           updated_at = now()
      from recovered r
     where s.organization_id = r.organization_id
       and s.credits_reserved > 0
       and r.retry_count >= v_max_attempts
  )
  select count(*) into v_count from recovered;

  -- 2. reabrir fallos reintentables (delay + intentos restantes)
  update public.generations
     set status = 'pending',
         error_code = null,
         error_message = null,
         updated_at = now()
   where status = 'failed'
     and retry_count < v_max_attempts
     and updated_at < now() - v_retry_interval;

  -- 3. encolar pendientes (límite de concurrencia por organización, FIFO, SKIP LOCKED)
  for v_job in
    select g.id
      from public.generations g
     where g.status = 'pending'
       and (select count(*) from public.generations p
             where p.organization_id = g.organization_id
               and p.status = 'processing') < v_max_concurrent
     order by g.created_at
     limit p_limit
     for update skip locked
  loop
    perform net.http_post(
      url := v_url,
      body := jsonb_build_object('generation_id', v_job.id::text, 'api_url', v_api),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_anon
      )
    );
    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

-- Re-grants (los drop anteriores eliminaron los grants existentes)
grant execute on function public.claim_generation(uuid) to service_role;
grant execute on function public.complete_generation(uuid, text, text, numeric, jsonb) to service_role;
grant execute on function public.fail_generation(uuid, text, text, boolean) to service_role;
grant execute on function public.retry_generation(uuid) to service_role;
grant execute on function public.cancel_generation(uuid) to authenticated, service_role;
grant execute on function public.process_generation_jobs(int) to service_role;
