-- PRODUCT FOUNDATION — Fase 1
-- Esquema real del producto: multi-tenancy, propiedades, habitaciones, estilos,
-- generaciones (cola de jobs), suscripciones/créditos y ledger de uso.
-- Reutiliza las garantías validadas en Fase 0 (claim atómico, SKIP LOCKED, pg_cron, pg_net).
-- Las tablas de Fase 0 (image_jobs, phase0_config) se mantienen como artefacto de validación
-- para que phase0_validation.ps1 siga ejecutable (regresión).

-- ============================================================
-- 1. TABLAS PRODUCTO
-- ============================================================

-- organizaciones (inmobiliarias)
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- usuarios de aplicación (PK = auth.users.id); el registro crea org + owner + suscripción free
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  role text not null default 'agent' check (role in ('owner', 'agent')),
  created_at timestamptz not null default now()
);

-- propiedades
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  address text,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- habitaciones (una foto por habitación)
create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  property_id uuid not null references public.properties (id) on delete cascade,
  room_type text not null check (room_type in ('salón', 'dormitorio', 'cocina', 'baño', 'comedor', 'despacho', 'terraza', 'exterior', 'otra')),
  original_image_path text,
  notes text,
  created_at timestamptz not null default now()
);

-- catálogo de estilos (lectura para usuarios autenticados; decisión PROVISIONAL registrada)
create table public.styles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  ai_preset text not null,
  active boolean not null default true
);

-- generaciones = cola de jobs
create table public.generations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  room_id uuid not null references public.rooms (id) on delete cascade,
  style_id uuid not null references public.styles (id),
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  provider text not null default 'mock',
  provider_job_id text,
  output_image_path text,
  prompt_version text not null default 'v1',
  parameters jsonb not null default '{}'::jsonb,
  error_code text,
  error_message text,
  locked_at timestamptz,
  retry_count int not null default 0,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

-- suscripción / entitlement por organización (Stripe es autoridad en fase posterior)
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations (id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null default 'free' check (plan in ('free', 'basic', 'pro')),
  status text not null default 'free'
    check (status in ('free', 'trialing', 'active', 'past_due', 'canceled', 'incomplete')),
  credits_available int not null default 0,
  credits_reserved int not null default 0,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ledger de uso (registro financiero/técnico del consumo)
create table public.usage_ledger (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  generation_id uuid references public.generations (id) on delete cascade,
  credits_used int not null default 0,
  provider_cost_estimate numeric(10, 6) not null default 0,
  status text not null check (status in ('billable', 'free', 'retry', 'provider_error', 'cancelled')),
  reason text,
  created_at timestamptz not null default now()
);

-- configuración del pipeline (sin secretos; anon key es pública por diseño)
create table public.app_config (
  key text primary key,
  value text not null
);

-- ============================================================
-- 2. ÍNDICES
-- ============================================================

create index idx_users_organization on public.users (organization_id);
create index idx_properties_organization on public.properties (organization_id);
create index idx_properties_organization_created on public.properties (organization_id, created_at);
create index idx_rooms_organization on public.rooms (organization_id);
create index idx_rooms_property on public.rooms (property_id);
create index idx_generations_organization on public.generations (organization_id);
create index idx_generations_room on public.generations (room_id);
create index idx_generations_pending_enqueue on public.generations (created_at) where status = 'pending';
create index idx_generations_processing_recovery on public.generations (locked_at) where status = 'processing';
create index idx_generations_failed_retry on public.generations (updated_at) where status = 'failed';
create index idx_usage_ledger_organization_created on public.usage_ledger (organization_id, created_at);
create index idx_subscriptions_stripe_customer on public.subscriptions (stripe_customer_id) where stripe_customer_id is not null;
create index idx_subscriptions_stripe_subscription on public.subscriptions (stripe_subscription_id) where stripe_subscription_id is not null;

-- ============================================================
-- 3. SEED CATÁLOGO Y CONFIG
-- ============================================================

insert into public.styles (name, description, ai_preset) values
  ('Moderno', 'Mobiliario contemporáneo, líneas limpias y materiales actuales.', 'modern'),
  ('Nórdico', 'Estética escandinava: luz natural, madera clara y textiles neutros.', 'scandinavian'),
  ('Minimalista', 'Espacios despejados, pocos objetos y paleta sobria.', 'minimalist'),
  ('Lujo', 'Acabados premium, materiales nobles y elegancia.', 'luxury');

insert into public.app_config (key, value) values
  ('edge_function_url', 'http://kong:8000/functions/v1/process-generation'),
  ('api_url', 'http://kong:8000'),
  ('anon_key', ''),
  ('provider', 'mock'),
  ('max_concurrent', '3'),
  ('hourly_limit', '30'),
  ('max_attempts', '3'),
  ('retry_interval', '2 minutes'),
  ('job_timeout', '10 minutes');

-- ============================================================
-- 4. RLS
-- ============================================================

-- organización del usuario autenticado (SECURITY DEFINER para evitar recursión RLS)
create or replace function public.current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public, auth
as $$
  select organization_id from public.users where id = auth.uid();
$$;

alter table public.organizations enable row level security;
alter table public.users enable row level security;
alter table public.properties enable row level security;
alter table public.rooms enable row level security;
alter table public.styles enable row level security;
alter table public.generations enable row level security;
alter table public.subscriptions enable row level security;
alter table public.usage_ledger enable row level security;
-- app_config: sin políticas ni grants -> solo funciones SECURITY DEFINER

create policy "org: select own" on public.organizations
  for select to authenticated using (public.current_org_id() = id);
create policy "org: update own" on public.organizations
  for update to authenticated using (public.current_org_id() = id)
  with check (public.current_org_id() = id);

create policy "users: select own org" on public.users
  for select to authenticated using (public.current_org_id() = organization_id);
create policy "users: update self" on public.users
  for update to authenticated using (id = auth.uid())
  with check (id = auth.uid());

create policy "properties: org" on public.properties
  for all to authenticated
  using (organization_id = public.current_org_id())
  with check (organization_id = public.current_org_id());

create policy "rooms: org" on public.rooms
  for all to authenticated
  using (organization_id = public.current_org_id())
  with check (organization_id = public.current_org_id());

-- catálogo: lectura para usuarios autenticados (PROVISIONAL; pendiente de validación comercial)
create policy "styles: read authenticated" on public.styles
  for select to authenticated using (true);

create policy "generations: select org" on public.generations
  for select to authenticated using (organization_id = public.current_org_id());
-- insert/update solo a través de RPCs SECURITY DEFINER (create/claim/complete/fail/cancel)

create policy "subscriptions: select org" on public.subscriptions
  for select to authenticated using (organization_id = public.current_org_id());

create policy "usage_ledger: select org" on public.usage_ledger
  for select to authenticated using (organization_id = public.current_org_id());

-- ============================================================
-- 5. STORAGE (buckets privados + políticas RLS por prefijo de org)
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('original-images', 'original-images', false, 10485760, array['image/jpeg', 'image/png']),
  ('staged-images', 'staged-images', false, 26214400, array['image/jpeg', 'image/png'])
on conflict (id) do nothing;

create policy "original-images: org manages own paths"
  on storage.objects for all to authenticated
  using (bucket_id = 'original-images' and (storage.foldername(name))[1] = public.current_org_id()::text)
  with check (bucket_id = 'original-images' and (storage.foldername(name))[1] = public.current_org_id()::text);

-- staged-images: el worker (service role) escribe; los miembros de la org leen/borran sus resultados
create policy "staged-images: org reads own results"
  on storage.objects for select to authenticated
  using (bucket_id = 'staged-images' and (storage.foldername(name))[1] = public.current_org_id()::text);
create policy "staged-images: org deletes own results"
  on storage.objects for delete to authenticated
  using (bucket_id = 'staged-images' and (storage.foldername(name))[1] = public.current_org_id()::text);

-- ============================================================
-- 6. TRIGGERS AUTH (registro: org + owner + suscripción free con 3 créditos)
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_org uuid;
  v_display text;
begin
  v_display := nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '');
  insert into public.organizations (name)
  values (case
    when v_display is not null then 'Agencia de ' || v_display
    else 'Agencia de ' || split_part(new.email, '@', 1)
  end)
  returning id into v_org;

  insert into public.users (id, email, organization_id, role)
  values (new.id, new.email, v_org, 'owner');

  insert into public.subscriptions (organization_id, plan, status, credits_available, credits_reserved)
  values (v_org, 'free', 'free', 3, 0);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.handle_user_email_updated()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if new.email is distinct from old.email then
    update public.users set email = new.email where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row execute function public.handle_user_email_updated();

-- ============================================================
-- 7. RPCs PRODUCTO
-- ============================================================

-- Crear habitación y devolver ruta de subida determinista.
-- Ruta original: {organization_id}/{property_id}/{room_id}.{ext}
create or replace function public.create_room(
  p_property_id uuid,
  p_room_type text,
  p_file_name text,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_org uuid;
  v_property public.properties%rowtype;
  v_room public.rooms%rowtype;
  v_ext text;
  v_count int;
begin
  v_org := public.current_org_id();
  if v_org is null then raise exception 'not_authenticated'; end if;

  select * into v_property from public.properties
   where id = p_property_id and organization_id = v_org;
  if not found then raise exception 'property_not_found'; end if;

  select count(*) into v_count from public.rooms where property_id = p_property_id;
  if v_count >= 20 then raise exception 'image_limit_reached'; end if;

  if p_room_type not in ('salón', 'dormitorio', 'cocina', 'baño', 'comedor', 'despacho', 'terraza', 'exterior', 'otra') then
    raise exception 'invalid_room_type';
  end if;

  if p_file_name !~ '^[A-Za-z0-9._-]+\.(jpg|jpeg|png)$' then
    raise exception 'invalid_file_type';
  end if;
  v_ext := (regexp_match(p_file_name, '\.(jpg|jpeg|png)$'))[1];

  insert into public.rooms (organization_id, property_id, room_type, notes)
  values (v_org, p_property_id, p_room_type, p_notes)
  returning * into v_room;

  return jsonb_build_object(
    'room_id', v_room.id,
    'upload_path', v_org || '/' || p_property_id || '/' || v_room.id || '.' || v_ext,
    'room_type', v_room.room_type
  );
end;
$$;

-- Confirmar subida (backend verifica propiedad de la ruta; el objeto en Storage se
-- comprueba en la capa de aplicación antes de llamar)
create or replace function public.finalize_room_upload(
  p_room_id uuid,
  p_upload_path text
)
returns public.rooms
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_org uuid;
  v_room public.rooms%rowtype;
begin
  v_org := public.current_org_id();
  if v_org is null then raise exception 'not_authenticated'; end if;

  select * into v_room from public.rooms where id = p_room_id and organization_id = v_org;
  if not found then raise exception 'room_not_found'; end if;
  if v_room.original_image_path is not null then raise exception 'already_uploaded'; end if;

  if p_upload_path !~ ('^' || v_org || '/' || v_room.property_id || '/' || p_room_id || '\.(jpg|jpeg|png)$') then
    raise exception 'invalid_upload_path';
  end if;

  update public.rooms
     set original_image_path = p_upload_path
   where id = p_room_id
  returning * into v_room;

  return v_room;
end;
$$;

-- Crear generación: entitlement + límites + reserva atómica de crédito + job pending
create or replace function public.create_generation(
  p_room_id uuid,
  p_style_id uuid,
  p_parameters jsonb default '{}'::jsonb
)
returns public.generations
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_org uuid;
  v_room public.rooms%rowtype;
  v_style public.styles%rowtype;
  v_sub record;
  v_provider text;
  v_hourly int;
  v_count int;
  v_generation public.generations;
begin
  v_org := public.current_org_id();
  if v_org is null then raise exception 'not_authenticated'; end if;

  select * into v_room from public.rooms where id = p_room_id and organization_id = v_org;
  if not found then raise exception 'room_not_found'; end if;
  if v_room.original_image_path is null then raise exception 'image_required'; end if;

  select * into v_style from public.styles where id = p_style_id and active;
  if not found then raise exception 'style_not_found'; end if;

  select coalesce((select value::int from public.app_config where key = 'hourly_limit'), 30) into v_hourly;
  select count(*) into v_count from public.generations
   where organization_id = v_org and created_at > now() - interval '1 hour';
  if v_count >= v_hourly then raise exception 'hourly_limit_reached'; end if;

  select * into v_sub from public.subscriptions where organization_id = v_org for update;
  if not found then raise exception 'subscription_required'; end if;
  if v_sub.status not in ('free', 'active', 'trialing') then raise exception 'subscription_not_active'; end if;
  if v_sub.credits_available <= 0 then raise exception 'insufficient_credits'; end if;

  update public.subscriptions
     set credits_available = credits_available - 1,
         credits_reserved = credits_reserved + 1,
         updated_at = now()
   where organization_id = v_org;

  select coalesce((select value from public.app_config where key = 'provider'), 'mock') into v_provider;

  insert into public.generations (organization_id, room_id, style_id, status, provider, prompt_version, parameters)
  values (v_org, p_room_id, p_style_id, 'pending', v_provider, 'v1', coalesce(p_parameters, '{}'::jsonb))
  returning * into v_generation;

  return v_generation;
end;
$$;

-- Claim atómico: pending -> processing (solo un worker gana)
create or replace function public.claim_generation(p_generation_id uuid)
returns public.generations
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
  return v_generation;
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
returns public.generations
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

  return v_generation;
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
returns public.generations
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

  return v_generation;
end;
$$;

-- Retry manual: failed -> pending (solo con intentos restantes)
create or replace function public.retry_generation(p_generation_id uuid)
returns public.generations
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
  return v_generation;
end;
$$;

-- Cancelar: pending -> cancelled; devolución del crédito; ledger cancelled
create or replace function public.cancel_generation(p_generation_id uuid)
returns public.generations
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

  return v_generation;
end;
$$;

-- Eliminar propiedad (borrado físico; imágenes en Storage las borra la capa de aplicación)
create or replace function public.delete_property(p_property_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_org uuid;
begin
  v_org := public.current_org_id();
  if v_org is null then raise exception 'not_authenticated'; end if;

  delete from public.properties where id = p_property_id and organization_id = v_org;
  if not found then raise exception 'property_not_found'; end if;

  return true;
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
  select count(*) from recovered;

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

-- ============================================================
-- 8. GRANTS (exposición explícita a las roles del API)
-- ============================================================

grant usage on schema public to authenticated, service_role;

grant select, insert, update, delete on public.properties, public.rooms to authenticated;
grant select, update on public.users to authenticated;
grant select on public.organizations, public.generations, public.subscriptions, public.usage_ledger to authenticated;
grant select on public.styles to authenticated;

grant select, insert, update, delete on public.organizations, public.users, public.properties, public.rooms,
  public.styles, public.generations, public.subscriptions, public.usage_ledger to service_role;

grant execute on function public.current_org_id() to authenticated, service_role;
grant execute on function public.create_room(uuid, text, text, text) to authenticated, service_role;
grant execute on function public.finalize_room_upload(uuid, text) to authenticated, service_role;
grant execute on function public.create_generation(uuid, uuid, jsonb) to authenticated, service_role;
grant execute on function public.cancel_generation(uuid) to authenticated, service_role;
grant execute on function public.delete_property(uuid) to authenticated, service_role;
grant execute on function public.claim_generation(uuid) to service_role;
grant execute on function public.complete_generation(uuid, text, text, numeric, jsonb) to service_role;
grant execute on function public.fail_generation(uuid, text, text, boolean) to service_role;
grant execute on function public.retry_generation(uuid) to service_role;
grant execute on function public.process_generation_jobs(int) to service_role;

-- ============================================================
-- 9. SCHEDULER
-- ============================================================

select cron.schedule(
  'process-generation-jobs',
  '* * * * *',
  'select public.process_generation_jobs(10)'
);
