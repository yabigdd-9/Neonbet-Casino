-- 002_operator_settings.sql
-- Server-authoritative verification fee (P2). Buyers configure the fee here
-- instead of editing SQL. The client can NEVER choose the stored amount:
-- submit_verification_submission() derives amount_usd from operator_settings.
--
-- Apply after 001_initial.sql.

create table if not exists public.operator_settings (
  id int primary key default 1,
  fee_usd numeric(12,2) not null default 75 check (fee_usd > 0),
  brand_name text not null default 'NeonBet',
  support_email text not null default 'support@example.com',
  updated_at timestamptz not null default now(),
  constraint operator_settings_single_row check (id = 1)
);

-- Seed the single operator-settings row.
insert into public.operator_settings (id, fee_usd, brand_name, support_email)
values (1, 75, 'NeonBet', 'support@example.com')
on conflict (id) do nothing;

-- Read the current verification fee. Returns a sane default (75) when the
-- operator_settings row is absent, so the demo/fresh-install UX never breaks.
create or replace function public.get_verification_fee()
returns numeric
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select fee_usd from public.operator_settings limit 1), 75);
$$;

-- Server-authoritative submission: the caller supplies only identity + proof
-- (asset/network/tx_hash). The fee is taken from operator_settings, never from
-- the client, so a malicious client cannot submit amount_usd = 1.
create or replace function public.submit_verification_submission(
  p_user_id uuid,
  p_asset text,
  p_network text,
  p_tx_hash text
)
returns uuid
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_fee numeric;
  v_id uuid;
begin
  if (select auth.uid()) is distinct from p_user_id then
    raise exception 'Cannot submit verification for another user' using errcode = '42501';
  end if;

  if not (char_length(p_asset) between 1 and 64) then
    raise exception 'Invalid asset' using errcode = '22023';
  end if;
  if not (char_length(p_network) between 1 and 64) then
    raise exception 'Invalid network' using errcode = '22023';
  end if;
  if not (char_length(p_tx_hash) between 8 and 256) then
    raise exception 'Invalid transaction hash' using errcode = '22023';
  end if;

  select fee_usd into v_fee from public.operator_settings limit 1;
  v_fee := coalesce(v_fee, 75);

  insert into public.verification_submissions (user_id, asset, network, tx_hash, amount_usd)
  values (p_user_id, p_asset, p_network, p_tx_hash, v_fee)
  returning id into v_id;

  return v_id;
end;
$$;

-- RLS for operator_settings: readable by any authenticated user (needed so the
-- fee can be displayed), writable only by admins.
alter table public.operator_settings enable row level security;

drop policy if exists "Operator settings readable by authenticated" on public.operator_settings;
create policy "Operator settings readable by authenticated"
on public.operator_settings for select
to authenticated
using (true);

drop policy if exists "Operator settings writable by admins" on public.operator_settings;
create policy "Operator settings writable by admins"
on public.operator_settings for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

revoke all on table public.operator_settings from anon, authenticated;
grant select on table public.operator_settings to authenticated;
grant all on table public.operator_settings to service_role;

revoke execute on function public.get_verification_fee() from public, anon;
grant execute on function public.get_verification_fee() to authenticated, service_role, anon;
revoke execute on function public.submit_verification_submission(uuid, text, text, text) from public, anon;
grant execute on function public.submit_verification_submission(uuid, text, text, text) to authenticated, service_role;
