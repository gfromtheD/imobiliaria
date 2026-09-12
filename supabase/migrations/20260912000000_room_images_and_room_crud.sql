-- ROOM IMAGES + CRUD CONTRACTS
--
-- `room_images` is the sole source of truth for original images. The legacy
-- `rooms.original_image_path` remains temporarily for the already deployed UI
-- and is backfilled below; new generation work always uses source_image_id.

-- A room can be removed only after its Storage objects have been cleaned by
-- the application layer. Keeping this marker in PostgreSQL makes an
-- interrupted deletion visible and safely repeatable.
alter table public.rooms
  add column if not exists deletion_requested_at timestamptz;

create table if not exists public.room_images (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  room_id uuid not null references public.rooms (id) on delete cascade,
  storage_path text not null unique,
  status text not null default 'pending'
    check (status in ('pending', 'ready', 'deleting')),
  created_at timestamptz not null default now(),
  ready_at timestamptz,
  updated_at timestamptz not null default now(),
  check ((status = 'ready' and ready_at is not null) or (status <> 'ready'))
);

create index if not exists idx_room_images_room_created
  on public.room_images (room_id, created_at);
create index if not exists idx_room_images_organization_status
  on public.room_images (organization_id, status);

-- Backfill each legacy original into exactly one ready RoomImage. The unique
-- storage path keeps this operation idempotent if a deploy is retried.
insert into public.room_images (organization_id, room_id, storage_path, status, ready_at)
select r.organization_id, r.id, r.original_image_path, 'ready', r.created_at
  from public.rooms r
 where r.original_image_path is not null
on conflict (storage_path) do nothing;

-- ALTER TABLE changes the composite return type of generations. Drop these
-- two user-facing functions before that change and recreate them below with
-- their tightened organisation checks.
drop function if exists public.cancel_generation(uuid);
drop function if exists public.retry_generation(uuid);

alter table public.generations
  add column if not exists source_image_id uuid;

-- Existing generations retain their exact legacy original through the image
-- record just created above. Do not continue if historical data cannot be
-- mapped: a failed migration is safer than an ambiguous generation.
update public.generations g
   set source_image_id = ri.id
  from public.rooms r
  join public.room_images ri
    on ri.room_id = r.id
   and ri.storage_path = r.original_image_path
 where g.room_id = r.id
   and g.source_image_id is null;

do $$
begin
  if exists (select 1 from public.generations where source_image_id is null) then
    raise exception 'generation_source_backfill_failed';
  end if;
end;
$$;

alter table public.generations
  alter column source_image_id set not null;

alter table public.generations
  drop constraint if exists generations_source_image_id_fkey;
alter table public.generations
  add constraint generations_source_image_id_fkey
  foreign key (source_image_id) references public.room_images (id) on delete restrict;

create index if not exists idx_generations_source_image
  on public.generations (source_image_id);

create table if not exists public.room_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  room_id uuid not null unique references public.rooms (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.room_images enable row level security;
alter table public.room_deletion_requests enable row level security;

create policy "room_images: select org"
  on public.room_images for select to authenticated
  using (organization_id = public.current_org_id());

-- Original Storage is private and must correspond to a persisted RoomImage.
-- Pending rows admit upload/retry; deleting rows admit cleanup only.
drop policy if exists "original-images: org manages own paths" on storage.objects;

create policy "original-images: read own room images"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'original-images'
    and exists (
      select 1 from public.room_images ri
       where ri.storage_path = name
         and ri.organization_id = public.current_org_id()
    )
  );

create policy "original-images: upload pending room images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'original-images'
    and exists (
      select 1 from public.room_images ri
       where ri.storage_path = name
         and ri.organization_id = public.current_org_id()
         and ri.status = 'pending'
    )
  );

create policy "original-images: retry pending room images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'original-images'
    and exists (
      select 1 from public.room_images ri
       where ri.storage_path = name
         and ri.organization_id = public.current_org_id()
         and ri.status = 'pending'
    )
  )
  with check (
    bucket_id = 'original-images'
    and exists (
      select 1 from public.room_images ri
       where ri.storage_path = name
         and ri.organization_id = public.current_org_id()
         and ri.status = 'pending'
    )
  );

create policy "original-images: delete deleting room images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'original-images'
    and exists (
      select 1 from public.room_images ri
       where ri.storage_path = name
         and ri.organization_id = public.current_org_id()
         and ri.status = 'deleting'
    )
  );

-- Direct mutations bypass the validation contract. Reads remain available
-- under RLS; all writes occur through SECURITY DEFINER RPCs below.
revoke insert, update, delete on public.rooms from authenticated;
revoke all on public.room_images from authenticated;
revoke all on public.room_deletion_requests from authenticated;
grant select on public.room_images to authenticated;
grant select, insert, update, delete on public.room_images, public.room_deletion_requests to service_role;

-- The deployed room upload form still calls create_room with a file name. It
-- receives a pending RoomImage as a compatibility bridge. New callers omit
-- p_file_name, obtaining a Room with zero images.
drop function if exists public.create_room(uuid, text, text, text);
create function public.create_room(
  p_property_id uuid,
  p_room_type text,
  p_file_name text default null,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, storage
as $$
declare
  v_org uuid;
  v_property public.properties%rowtype;
  v_room public.rooms%rowtype;
  v_image public.room_images%rowtype;
  v_ext text;
  v_room_count int;
  v_image_count int;
begin
  v_org := public.current_org_id();
  if v_org is null then raise exception 'not_authenticated'; end if;

  select * into v_property from public.properties
   where id = p_property_id and organization_id = v_org
   for update;
  if not found then raise exception 'property_not_found'; end if;

  select count(*) into v_room_count from public.rooms where property_id = p_property_id;
  if v_room_count >= 20 then raise exception 'room_limit_reached'; end if;

  if p_room_type not in ('salón', 'dormitorio', 'cocina', 'baño', 'comedor', 'despacho', 'terraza', 'exterior', 'otra') then
    raise exception 'invalid_room_type';
  end if;

  if p_file_name is not null then
    if p_file_name !~ '^[A-Za-z0-9._-]+\.(jpg|jpeg|png)$' then
      raise exception 'invalid_file_type';
    end if;
    v_ext := (regexp_match(p_file_name, '\.(jpg|jpeg|png)$'))[1];

    select count(*) into v_image_count
      from public.room_images ri
      join public.rooms r on r.id = ri.room_id
     where r.property_id = p_property_id and ri.status <> 'deleting';
    if v_image_count >= 20 then raise exception 'image_limit_reached'; end if;
  end if;

  insert into public.rooms (organization_id, property_id, room_type, notes)
  values (v_org, p_property_id, p_room_type, nullif(trim(p_notes), ''))
  returning * into v_room;

  if p_file_name is not null then
    insert into public.room_images (organization_id, room_id, storage_path)
    values (v_org, v_room.id, v_org || '/' || p_property_id || '/' || v_room.id || '/' || gen_random_uuid() || '.' || v_ext)
    returning * into v_image;
  end if;

  return jsonb_build_object(
    'room_id', v_room.id,
    'room_type', v_room.room_type,
    'image_id', v_image.id,
    'upload_path', v_image.storage_path
  );
end;
$$;

create function public.update_room(
  p_room_id uuid,
  p_room_type text,
  p_notes text default null
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
  if p_room_type not in ('salón', 'dormitorio', 'cocina', 'baño', 'comedor', 'despacho', 'terraza', 'exterior', 'otra') then
    raise exception 'invalid_room_type';
  end if;

  update public.rooms
     set room_type = p_room_type,
         notes = nullif(trim(p_notes), '')
   where id = p_room_id
     and organization_id = v_org
     and deletion_requested_at is null
  returning * into v_room;
  if not found then raise exception 'room_not_found_or_deleting'; end if;
  return v_room;
end;
$$;

create function public.create_room_image(
  p_room_id uuid,
  p_file_name text
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_org uuid;
  v_room public.rooms%rowtype;
  v_ext text;
  v_image_count int;
  v_image public.room_images%rowtype;
begin
  v_org := public.current_org_id();
  if v_org is null then raise exception 'not_authenticated'; end if;
  if p_file_name !~ '^[A-Za-z0-9._-]+\.(jpg|jpeg|png)$' then
    raise exception 'invalid_file_type';
  end if;
  v_ext := (regexp_match(p_file_name, '\.(jpg|jpeg|png)$'))[1];

  select r.* into v_room
    from public.rooms r
    join public.properties p on p.id = r.property_id
   where r.id = p_room_id and r.organization_id = v_org
   for update of p, r;
  if not found then raise exception 'room_not_found'; end if;
  if v_room.deletion_requested_at is not null then raise exception 'room_deletion_in_progress'; end if;

  select count(*) into v_image_count
    from public.room_images ri
    join public.rooms r on r.id = ri.room_id
   where r.property_id = v_room.property_id and ri.status <> 'deleting';
  if v_image_count >= 20 then raise exception 'image_limit_reached'; end if;

  insert into public.room_images (organization_id, room_id, storage_path)
  values (v_org, v_room.id, v_org || '/' || v_room.property_id || '/' || v_room.id || '/' || gen_random_uuid() || '.' || v_ext)
  returning * into v_image;

  return jsonb_build_object(
    'image_id', v_image.id,
    'room_id', v_room.id,
    'upload_path', v_image.storage_path,
    'status', v_image.status
  );
end;
$$;

create function public.finalize_room_image_upload(
  p_room_image_id uuid,
  p_upload_path text
)
returns public.room_images
language plpgsql
security definer
set search_path = public, auth, storage
as $$
declare
  v_org uuid;
  v_image public.room_images%rowtype;
begin
  v_org := public.current_org_id();
  if v_org is null then raise exception 'not_authenticated'; end if;

  select ri.* into v_image
    from public.room_images ri
    join public.rooms r on r.id = ri.room_id
   where ri.id = p_room_image_id
     and ri.organization_id = v_org
     and r.deletion_requested_at is null
   for update of ri;
  if not found then raise exception 'room_image_not_found'; end if;
  if v_image.status = 'ready' then raise exception 'already_uploaded'; end if;
  if v_image.status <> 'pending' then raise exception 'room_image_deletion_in_progress'; end if;
  if p_upload_path <> v_image.storage_path then raise exception 'invalid_upload_path'; end if;
  if not exists (
    select 1 from storage.objects
     where bucket_id = 'original-images' and name = p_upload_path
  ) then raise exception 'upload_not_found'; end if;

  update public.room_images
     set status = 'ready', ready_at = now(), updated_at = now()
   where id = v_image.id
  returning * into v_image;
  return v_image;
end;
$$;

-- Compatibility wrapper for the pre-normalisation UI. It finalizes the
-- matching pending RoomImage and mirrors its path into the marked legacy field.
create or replace function public.finalize_room_upload(
  p_room_id uuid,
  p_upload_path text
)
returns public.rooms
language plpgsql
security definer
set search_path = public, auth, storage
as $$
declare
  v_org uuid;
  v_room public.rooms%rowtype;
  v_image public.room_images%rowtype;
begin
  v_org := public.current_org_id();
  if v_org is null then raise exception 'not_authenticated'; end if;

  select * into v_room from public.rooms
   where id = p_room_id and organization_id = v_org and deletion_requested_at is null
   for update;
  if not found then raise exception 'room_not_found'; end if;

  select * into v_image from public.room_images
   where room_id = v_room.id and organization_id = v_org and storage_path = p_upload_path
   for update;
  if not found then raise exception 'invalid_upload_path'; end if;
  if v_image.status = 'ready' then raise exception 'already_uploaded'; end if;
  if v_image.status <> 'pending' then raise exception 'room_image_deletion_in_progress'; end if;
  if not exists (
    select 1 from storage.objects
     where bucket_id = 'original-images' and name = p_upload_path
  ) then raise exception 'upload_not_found'; end if;

  update public.room_images
     set status = 'ready', ready_at = now(), updated_at = now()
   where id = v_image.id;
  update public.rooms
     set original_image_path = coalesce(original_image_path, p_upload_path)
   where id = v_room.id
  returning * into v_room;
  return v_room;
end;
$$;

-- Deletion of a single image is two-phase. A source image with any generation
-- remains immutable; deleting its room is the explicit way to remove history.
create function public.prepare_room_image_deletion(p_room_image_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_org uuid;
  v_image public.room_images%rowtype;
begin
  v_org := public.current_org_id();
  if v_org is null then raise exception 'not_authenticated'; end if;
  select ri.* into v_image
    from public.room_images ri
    join public.rooms r on r.id = ri.room_id
   where ri.id = p_room_image_id and ri.organization_id = v_org
   for update of ri;
  if not found then raise exception 'room_image_not_found'; end if;
  if exists (select 1 from public.room_deletion_requests where room_id = v_image.room_id) then
    raise exception 'room_deletion_in_progress';
  end if;
  if exists (select 1 from public.generations where source_image_id = v_image.id) then
    raise exception 'image_has_generations';
  end if;
  if v_image.status <> 'deleting' then
    update public.room_images set status = 'deleting', updated_at = now() where id = v_image.id;
  end if;
  return jsonb_build_object('image_id', v_image.id, 'storage_path', v_image.storage_path);
end;
$$;

create function public.complete_room_image_deletion(p_room_image_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, auth, storage
as $$
declare
  v_org uuid;
  v_path text;
begin
  v_org := public.current_org_id();
  if v_org is null then raise exception 'not_authenticated'; end if;
  select storage_path into v_path from public.room_images
   where id = p_room_image_id and organization_id = v_org and status = 'deleting'
   for update;
  if not found then raise exception 'room_image_not_found_or_not_deleting'; end if;
  if exists (select 1 from storage.objects where bucket_id = 'original-images' and name = v_path) then
    raise exception 'storage_cleanup_incomplete';
  end if;
  delete from public.room_images where id = p_room_image_id and organization_id = v_org;
  return true;
end;
$$;

-- A Room deletion snapshots nothing outside durable DB rows: image and staged
-- paths remain available until cleanup succeeds. Repeating prepare after a
-- crash returns the same paths; complete verifies Storage is empty first.
create function public.prepare_room_deletion(p_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_org uuid;
  v_room public.rooms%rowtype;
  v_request public.room_deletion_requests%rowtype;
  v_generation record;
begin
  v_org := public.current_org_id();
  if v_org is null then raise exception 'not_authenticated'; end if;
  select * into v_room from public.rooms
   where id = p_room_id and organization_id = v_org
   for update;
  if not found then raise exception 'room_not_found'; end if;
  if exists (
    select 1 from public.generations
     where room_id = v_room.id and status = 'processing'
  ) then raise exception 'room_generation_in_progress'; end if;

  -- Pending jobs are cancelled through the existing ledger/refund contract.
  for v_generation in
    select id from public.generations where room_id = v_room.id and status = 'pending'
  loop
    perform public.cancel_generation(v_generation.id);
  end loop;

  update public.rooms set deletion_requested_at = coalesce(deletion_requested_at, now())
   where id = v_room.id;
  update public.room_images set status = 'deleting', updated_at = now()
   where room_id = v_room.id and status <> 'deleting';

  insert into public.room_deletion_requests (organization_id, room_id)
  values (v_org, v_room.id)
  on conflict (room_id) do update set organization_id = excluded.organization_id
  returning * into v_request;

  return jsonb_build_object(
    'deletion_id', v_request.id,
    'room_id', v_room.id,
    'original_paths', coalesce((
      select jsonb_agg(ri.storage_path order by ri.created_at)
        from public.room_images ri where ri.room_id = v_room.id
    ), '[]'::jsonb),
    'staged_paths', coalesce((
      select jsonb_agg(g.output_image_path order by g.created_at)
        from public.generations g
       where g.room_id = v_room.id and g.output_image_path is not null
    ), '[]'::jsonb)
  );
end;
$$;

create function public.complete_room_deletion(p_deletion_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, auth, storage
as $$
declare
  v_org uuid;
  v_request public.room_deletion_requests%rowtype;
begin
  v_org := public.current_org_id();
  if v_org is null then raise exception 'not_authenticated'; end if;
  select * into v_request from public.room_deletion_requests
   where id = p_deletion_id and organization_id = v_org
   for update;
  if not found then raise exception 'room_deletion_not_found'; end if;
  if exists (
    select 1 from storage.objects o
     where (o.bucket_id = 'original-images' and exists (
       select 1 from public.room_images ri where ri.room_id = v_request.room_id and ri.storage_path = o.name
     )) or (o.bucket_id = 'staged-images' and exists (
       select 1 from public.generations g where g.room_id = v_request.room_id and g.output_image_path = o.name
     ))
  ) then raise exception 'storage_cleanup_incomplete'; end if;

  delete from public.rooms
   where id = v_request.room_id and organization_id = v_org;
  if not found then raise exception 'room_not_found'; end if;
  return true;
end;
$$;

-- Generation now either receives an explicit ready source image or, during the
-- transition, resolves the only ready image. Multiple ready images are never
-- selected implicitly.
drop function if exists public.create_generation(uuid, uuid, jsonb);
create function public.create_generation(
  p_room_id uuid,
  p_style_id uuid,
  p_source_image_id uuid default null,
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
  v_image public.room_images%rowtype;
  v_image_count int;
  v_style public.styles%rowtype;
  v_sub record;
  v_provider text;
  v_hourly int;
  v_count int;
  v_generation public.generations;
begin
  v_org := public.current_org_id();
  if v_org is null then raise exception 'not_authenticated'; end if;

  select * into v_room from public.rooms
   where id = p_room_id and organization_id = v_org and deletion_requested_at is null;
  if not found then raise exception 'room_not_found'; end if;

  if p_source_image_id is null then
    select count(*) into v_image_count from public.room_images
     where room_id = v_room.id and organization_id = v_org and status = 'ready';
    if v_image_count = 0 then raise exception 'image_required'; end if;
    if v_image_count > 1 then raise exception 'source_image_required'; end if;
    select * into v_image from public.room_images
     where room_id = v_room.id and organization_id = v_org and status = 'ready';
  else
    select * into v_image from public.room_images
     where id = p_source_image_id
       and room_id = v_room.id
       and organization_id = v_org
       and status = 'ready';
    if not found then raise exception 'source_image_not_found'; end if;
  end if;

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
  insert into public.generations (organization_id, room_id, source_image_id, style_id, status, provider, prompt_version, parameters)
  values (v_org, p_room_id, v_image.id, p_style_id, 'pending', v_provider, 'v1', coalesce(p_parameters, '{}'::jsonb))
  returning * into v_generation;
  return v_generation;
end;
$$;

-- Existing generation mutations now reject cross-organisation IDs as well.
create function public.cancel_generation(p_generation_id uuid)
returns public.generations
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_org uuid;
  v_generation public.generations;
begin
  v_org := public.current_org_id();
  if v_org is null then raise exception 'not_authenticated'; end if;
  if not exists (select 1 from public.generations where id = p_generation_id and organization_id = v_org) then
    raise exception 'generation_not_found';
  end if;
  update public.generations
     set status = 'cancelled', locked_at = null, updated_at = now()
   where id = p_generation_id and organization_id = v_org and status = 'pending'
  returning * into v_generation;
  if not found then return null; end if;
  update public.subscriptions
     set credits_reserved = credits_reserved - 1,
         credits_available = credits_available + 1,
         updated_at = now()
   where organization_id = v_generation.organization_id and credits_reserved > 0;
  insert into public.usage_ledger (organization_id, generation_id, credits_used, provider_cost_estimate, status, reason)
  values (v_generation.organization_id, v_generation.id, 0, 0, 'cancelled', 'cancelled_by_user');
  return v_generation;
end;
$$;

create function public.retry_generation(p_generation_id uuid)
returns public.generations
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_org uuid;
  v_generation public.generations;
  v_max int;
begin
  v_org := public.current_org_id();
  if v_org is null then raise exception 'not_authenticated'; end if;
  if not exists (select 1 from public.generations where id = p_generation_id and organization_id = v_org) then
    raise exception 'generation_not_found';
  end if;
  select coalesce((select value::int from public.app_config where key = 'max_attempts'), 3) into v_max;
  update public.generations
     set status = 'pending', error_code = null, error_message = null, locked_at = null, updated_at = now()
   where id = p_generation_id and organization_id = v_org and status = 'failed' and retry_count < v_max
  returning * into v_generation;
  return v_generation;
end;
$$;

comment on column public.rooms.original_image_path is
  'LEGACY transitional mirror. room_images is the only source of truth; remove after the visual Room flow uses RoomImage.';

grant execute on function public.create_room(uuid, text, text, text) to authenticated, service_role;
grant execute on function public.update_room(uuid, text, text) to authenticated, service_role;
grant execute on function public.create_room_image(uuid, text) to authenticated, service_role;
grant execute on function public.finalize_room_image_upload(uuid, text) to authenticated, service_role;
grant execute on function public.finalize_room_upload(uuid, text) to authenticated, service_role;
grant execute on function public.prepare_room_image_deletion(uuid) to authenticated, service_role;
grant execute on function public.complete_room_image_deletion(uuid) to authenticated, service_role;
grant execute on function public.prepare_room_deletion(uuid) to authenticated, service_role;
grant execute on function public.complete_room_deletion(uuid) to authenticated, service_role;
grant execute on function public.create_generation(uuid, uuid, uuid, jsonb) to authenticated, service_role;
