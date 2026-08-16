create extension if not exists pgcrypto;

create schema if not exists private;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text check (email is null or char_length(email) <= 320),
  username text not null default '' check (char_length(username) <= 80),
  phone text not null default '' check (char_length(phone) <= 40),
  role text not null default 'user' check (role in ('user', 'admin')),
  verification_status text not null default 'not_submitted' check (verification_status in ('not_submitted', 'pending', 'verified', 'rejected')),
  bonus_balance numeric(12,2) not null default 100 check (bonus_balance >= 0),
  rollover_required numeric(12,2) not null default 1000 check (rollover_required >= 0),
  rollover_progress numeric(12,2) not null default 0 check (rollover_progress >= 0),
  admin_notes text not null default '' check (char_length(admin_notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.verification_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  asset text not null check (char_length(asset) between 1 and 64),
  network text not null check (char_length(network) between 1 and 64),
  tx_hash text not null check (char_length(tx_hash) between 8 and 256),
  amount_usd numeric(12,2) not null default 75 check (amount_usd > 0),
  status text not null default 'pending' check (status in ('pending', 'verified', 'rejected')),
  admin_notes text not null default '' check (char_length(admin_notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount_usd numeric(12,2) not null check (amount_usd > 0),
  payout_method text not null default 'manual' check (char_length(payout_method) between 1 and 64),
  payout_address text not null default '' check (char_length(payout_address) between 8 and 256),
  status text not null default 'pending' check (status in ('pending', 'approved', 'paid', 'rejected')),
  admin_notes text not null default '' check (char_length(admin_notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_verification_status_idx on public.profiles(verification_status);
create index if not exists profiles_created_at_idx on public.profiles(created_at desc);
create index if not exists verification_submissions_user_id_idx on public.verification_submissions(user_id);
create index if not exists verification_submissions_status_idx on public.verification_submissions(status);
create index if not exists verification_submissions_user_created_at_idx on public.verification_submissions(user_id, created_at desc);
create index if not exists verification_submissions_status_created_at_idx on public.verification_submissions(status, created_at desc);
create index if not exists withdrawal_requests_user_id_idx on public.withdrawal_requests(user_id);
create index if not exists withdrawal_requests_status_idx on public.withdrawal_requests(status);
create index if not exists withdrawal_requests_user_created_at_idx on public.withdrawal_requests(user_id, created_at desc);
create index if not exists withdrawal_requests_status_created_at_idx on public.withdrawal_requests(status, created_at desc);
create unique index if not exists verification_submissions_user_pending_idx
  on public.verification_submissions(user_id)
  where status = 'pending';

alter table public.withdrawal_requests
  alter column payout_method set default 'manual';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_amounts_non_negative') then
    alter table public.profiles
      add constraint profiles_amounts_non_negative
      check (bonus_balance >= 0 and rollover_required >= 0 and rollover_progress >= 0);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profiles_text_lengths') then
    alter table public.profiles
      add constraint profiles_text_lengths
      check (
        (email is null or char_length(email) <= 320)
        and char_length(username) <= 80
        and char_length(phone) <= 40
        and char_length(admin_notes) <= 2000
      );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'verification_submissions_input_shape') then
    alter table public.verification_submissions
      add constraint verification_submissions_input_shape
      check (
        char_length(asset) between 1 and 64
        and char_length(network) between 1 and 64
        and char_length(tx_hash) between 8 and 256
        and amount_usd > 0
        and char_length(admin_notes) <= 2000
      );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'withdrawal_requests_input_shape') then
    alter table public.withdrawal_requests
      add constraint withdrawal_requests_input_shape
      check (
        amount_usd > 0
        and char_length(payout_method) between 1 and 64
        and char_length(payout_address) between 8 and 256
        and char_length(admin_notes) <= 2000
      );
  end if;
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists verification_submissions_set_updated_at on public.verification_submissions;
create trigger verification_submissions_set_updated_at
before update on public.verification_submissions
for each row execute function public.set_updated_at();

drop trigger if exists withdrawal_requests_set_updated_at on public.withdrawal_requests;
create trigger withdrawal_requests_set_updated_at
before update on public.withdrawal_requests
for each row execute function public.set_updated_at();

create or replace function public.mark_profile_pending_verification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set verification_status = 'pending'
  where id = new.user_id
    and verification_status <> 'verified';

  return new;
end;
$$;

drop trigger if exists verification_submission_marks_profile_pending on public.verification_submissions;
create trigger verification_submission_marks_profile_pending
after insert on public.verification_submissions
for each row execute function public.mark_profile_pending_verification();

create or replace function private.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, username, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'phone', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.review_verification_submission(
  p_submission_id uuid,
  p_status text,
  p_admin_notes text default ''
)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
declare
  target_user_id uuid;
begin
  if not private.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  if p_status not in ('pending', 'verified', 'rejected') then
    raise exception 'Invalid verification status' using errcode = '22023';
  end if;

  update public.verification_submissions
  set status = p_status,
      admin_notes = coalesce(p_admin_notes, '')
  where id = p_submission_id
  returning user_id into target_user_id;

  if target_user_id is null then
    raise exception 'Verification submission not found' using errcode = 'P0002';
  end if;

  update public.profiles
  set verification_status = p_status,
      admin_notes = coalesce(p_admin_notes, '')
  where id = target_user_id;
end;
$$;

create or replace function public.review_withdrawal_request(
  p_withdrawal_id uuid,
  p_status text,
  p_admin_notes text default ''
)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if not private.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  if p_status not in ('pending', 'approved', 'paid', 'rejected') then
    raise exception 'Invalid withdrawal status' using errcode = '22023';
  end if;

  update public.withdrawal_requests
  set status = p_status,
      admin_notes = coalesce(p_admin_notes, '')
  where id = p_withdrawal_id;

  if not found then
    raise exception 'Withdrawal request not found' using errcode = 'P0002';
  end if;
end;
$$;

create or replace function public.update_profile_admin(
  p_profile_id uuid,
  p_bonus_balance numeric,
  p_rollover_progress numeric,
  p_rollover_required numeric,
  p_admin_notes text default ''
)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if not private.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  if p_bonus_balance is null
    or p_rollover_progress is null
    or p_rollover_required is null
    or p_bonus_balance < 0
    or p_rollover_progress < 0
    or p_rollover_required < 0 then
    raise exception 'Balance and rollover values must be non-negative numbers' using errcode = '22023';
  end if;

  update public.profiles
  set bonus_balance = p_bonus_balance,
      rollover_progress = p_rollover_progress,
      rollover_required = p_rollover_required,
      admin_notes = coalesce(p_admin_notes, '')
  where id = p_profile_id;

  if not found then
    raise exception 'Profile not found' using errcode = 'P0002';
  end if;
end;
$$;

alter table public.profiles enable row level security;
alter table public.verification_submissions enable row level security;
alter table public.withdrawal_requests enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can update own contact fields" on public.profiles;
drop policy if exists "Admins can update profiles" on public.profiles;
drop policy if exists "Users can read own submissions" on public.verification_submissions;
drop policy if exists "Users can create own submissions" on public.verification_submissions;
drop policy if exists "Admins can update submissions" on public.verification_submissions;
drop policy if exists "Users can read own withdrawals" on public.withdrawal_requests;
drop policy if exists "Users can create own withdrawals" on public.withdrawal_requests;
drop policy if exists "Admins can update withdrawals" on public.withdrawal_requests;

drop function if exists public.is_admin();

create policy "Users can read own profile"
on public.profiles for select
to authenticated
using (id = (select auth.uid()) or (select private.is_admin()));

create policy "Users can read own submissions"
on public.verification_submissions for select
to authenticated
using (user_id = (select auth.uid()) or (select private.is_admin()));

create policy "Users can create own submissions"
on public.verification_submissions for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and status = 'pending'
  and admin_notes = ''
  and amount_usd = 75
);

create policy "Users can read own withdrawals"
on public.withdrawal_requests for select
to authenticated
using (user_id = (select auth.uid()) or (select private.is_admin()));

create policy "Users can create own withdrawals"
on public.withdrawal_requests for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and status = 'pending'
  and admin_notes = ''
  and amount_usd > 0
);

revoke all on schema private from public, anon;
grant usage on schema private to authenticated, service_role;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.verification_submissions from anon, authenticated;
revoke all on table public.withdrawal_requests from anon, authenticated;

grant select on table public.profiles to authenticated;
grant select, insert on table public.verification_submissions to authenticated;
grant select, insert on table public.withdrawal_requests to authenticated;

grant all on table public.profiles to service_role;
grant all on table public.verification_submissions to service_role;
grant all on table public.withdrawal_requests to service_role;

revoke execute on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated, service_role;

revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.mark_profile_pending_verification() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

revoke execute on function public.review_verification_submission(uuid, text, text) from public, anon;
revoke execute on function public.review_withdrawal_request(uuid, text, text) from public, anon;
revoke execute on function public.update_profile_admin(uuid, numeric, numeric, numeric, text) from public, anon;
grant execute on function public.review_verification_submission(uuid, text, text) to authenticated, service_role;
grant execute on function public.review_withdrawal_request(uuid, text, text) to authenticated, service_role;
grant execute on function public.update_profile_admin(uuid, numeric, numeric, numeric, text) to authenticated, service_role;

-- After your first admin signs up, run this with their email:
-- update public.profiles set role = 'admin' where email = 'you@example.com';
