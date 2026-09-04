-- Stripe Billing Infrastructure: Idempotencia y Recarga Atómica de Créditos

create table if not exists public.stripe_events (
  id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

alter table public.stripe_events enable row level security;
-- Solo accesible mediante service_role en el backend

-- Recarga atómica de créditos por compra de paquetes (Checkout Session)
create or replace function public.apply_credit_purchase(
  p_org_id uuid,
  p_credits integer,
  p_stripe_customer_id text,
  p_plan text default 'basic',
  p_event_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_sub public.subscriptions;
begin
  -- Idempotencia estricta por event_id
  if p_event_id is not null then
    if exists (select 1 from public.stripe_events where id = p_event_id) then
      select * into v_sub from public.subscriptions where organization_id = p_org_id;
      return jsonb_build_object('success', true, 'idempotent', true, 'credits_available', v_sub.credits_available);
    end if;

    insert into public.stripe_events (id, event_type)
    values (p_event_id, 'checkout.session.completed');
  end if;

  -- Actualización atómica de suscripción y créditos disponibles
  update public.subscriptions
     set credits_available = credits_available + p_credits,
         stripe_customer_id = coalesce(p_stripe_customer_id, stripe_customer_id),
         plan = case when plan = 'free' and p_plan is not null then p_plan else plan end,
         status = 'active',
         updated_at = now()
   where organization_id = p_org_id
   returning * into v_sub;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Subscription not found');
  end if;

  return jsonb_build_object('success', true, 'idempotent', false, 'credits_available', v_sub.credits_available);
end;
$$;

grant execute on function public.apply_credit_purchase(uuid, integer, text, text, text) to service_role;

-- Sincronización de suscripciones recurrentes de Stripe
create or replace function public.sync_stripe_subscription(
  p_stripe_customer_id text,
  p_stripe_subscription_id text,
  p_status text,
  p_plan text,
  p_period_start timestamptz default null,
  p_period_end timestamptz default null,
  p_credits_to_add integer default 0,
  p_event_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_sub public.subscriptions;
  v_org_id uuid;
begin
  if p_event_id is not null then
    if exists (select 1 from public.stripe_events where id = p_event_id) then
      return jsonb_build_object('success', true, 'idempotent', true);
    end if;
    insert into public.stripe_events (id, event_type)
    values (p_event_id, 'subscription.sync');
  end if;

  select organization_id into v_org_id from public.subscriptions
   where (p_stripe_customer_id is not null and stripe_customer_id = p_stripe_customer_id)
      or (p_stripe_subscription_id is not null and stripe_subscription_id = p_stripe_subscription_id)
   limit 1;

  if v_org_id is null then
    return jsonb_build_object('success', false, 'error', 'No matching organization found');
  end if;

  update public.subscriptions
     set stripe_subscription_id = coalesce(p_stripe_subscription_id, stripe_subscription_id),
         status = coalesce(p_status, status),
         plan = coalesce(p_plan, plan),
         current_period_start = coalesce(p_period_start, current_period_start),
         current_period_end = coalesce(p_period_end, current_period_end),
         credits_available = credits_available + coalesce(p_credits_to_add, 0),
         updated_at = now()
   where organization_id = v_org_id
   returning * into v_sub;

  return jsonb_build_object('success', true, 'idempotent', false, 'status', v_sub.status, 'credits_available', v_sub.credits_available);
end;
$$;

grant execute on function public.sync_stripe_subscription(text, text, text, text, timestamptz, timestamptz, integer, text) to service_role;
