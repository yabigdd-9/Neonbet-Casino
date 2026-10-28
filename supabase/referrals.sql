-- Non-cash referral preparation. Standalone schema; apply separately after review.
-- Does not enable money movement, wagering credit, withdrawals or any provider.
begin;
create schema if not exists private;
create table if not exists private.practice_referral_codes (
  owner_id uuid primary key references auth.users(id),
  code uuid not null unique default gen_random_uuid(),
  created_at timestamptz not null default now()
);
create table if not exists private.practice_referral_awards (
  referred_id uuid primary key references auth.users(id),
  referrer_id uuid not null references auth.users(id),
  credits integer not null default 5 check (credits = 5),
  created_at timestamptz not null default now(),
  check (referred_id <> referrer_id)
);
create index if not exists practice_referral_awards_referrer_idx on private.practice_referral_awards(referrer_id);
alter table private.practice_referral_codes enable row level security;
alter table private.practice_referral_awards enable row level security;
revoke all on private.practice_referral_codes, private.practice_referral_awards from public, anon, authenticated;

create or replace function private.practice_referral_status()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare caller uuid := auth.uid(); result jsonb;
begin
  if caller is null or not exists (select 1 from auth.users where id = caller and email_confirmed_at is not null) then
    raise exception 'A verified account is required';
  end if;
  insert into private.practice_referral_codes(owner_id) values(caller) on conflict do nothing;
  select jsonb_build_object(
    'code', 'LO-' || replace(c.code::text,'-',''),
    'credits', (select coalesce(sum(a.credits),0) from private.practice_referral_awards a where a.referrer_id = caller),
    'count', (select count(*) from private.practice_referral_awards a where a.referrer_id = caller),
    'claimed', exists(select 1 from private.practice_referral_awards a where a.referred_id = caller)
  ) into result from private.practice_referral_codes c where c.owner_id = caller;
  return result;
end;
$$;

create or replace function private.claim_practice_referral(invite_code text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare caller uuid := auth.uid(); inviter uuid; existing uuid; signup_at timestamptz; code_created timestamptz;
begin
  select created_at into signup_at from auth.users where id = caller and email_confirmed_at is not null;
  if caller is null or signup_at is null then raise exception 'A verified account is required'; end if;
  if invite_code is null or invite_code !~ '^LO-[a-f0-9]{32}$' then raise exception 'Invalid invitation'; end if;
  -- Lock the inviter's code so concurrent new claims cannot exceed the account cap.
  select owner_id,created_at into inviter,code_created from private.practice_referral_codes where code = substring(invite_code from 4)::uuid for update;
  if inviter is null or inviter = caller then raise exception 'Invalid invitation'; end if;
  -- Rewards are for new signups after the invitation code was created, claimed within 7 days.
  if signup_at < code_created or signup_at < now() - interval '7 days' then raise exception 'Signup is not eligible'; end if;
  select referrer_id into existing from private.practice_referral_awards where referred_id = caller;
  if existing = inviter then return jsonb_build_object('claimed',true,'rewardCredits',5); end if;
  if existing is not null then raise exception 'Invitation already attributed'; end if;
  if (select count(*) from private.practice_referral_awards where referrer_id = inviter) >= 20 then raise exception 'Referral account limit reached'; end if;
  insert into private.practice_referral_awards(referred_id,referrer_id) values(caller,inviter) on conflict do nothing;
  select referrer_id into existing from private.practice_referral_awards where referred_id = caller;
  if existing <> inviter then raise exception 'Invitation already attributed'; end if;
  return jsonb_build_object('claimed',true,'rewardCredits',5);
end;
$$;

create or replace function public.get_practice_referral_status()
returns jsonb language sql security invoker set search_path = '' as $$ select private.practice_referral_status(); $$;
create or replace function public.claim_practice_referral(invite_code text)
returns jsonb language sql security invoker set search_path = '' as $$ select private.claim_practice_referral(invite_code); $$;
revoke execute on function private.practice_referral_status(), private.claim_practice_referral(text), public.get_practice_referral_status(), public.claim_practice_referral(text) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.practice_referral_status(), private.claim_practice_referral(text), public.get_practice_referral_status(), public.claim_practice_referral(text) to authenticated;
commit;
