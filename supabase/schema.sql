create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  username text not null default '',
  phone text not null default '',
  role text not null default 'user' check (role in ('user', 'admin')),
  verification_status text not null default 'not_submitted' check (verification_status in ('not_submitted', 'pending', 'verified', 'rejected')),
  bonus_balance numeric(12,2) not null default 100,
  rollover_required numeric(12,2) not null default 1000,
  rollover_progress numeric(12,2) not null default 0,
  admin_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.verification_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  asset text not null,
  network text not null,
  tx_hash text not null,
  amount_usd numeric(12,2) not null default 75,
  status text not null default 'pending' check (status in ('pending', 'verified', 'rejected')),
  admin_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_verification_status_idx on public.profiles(verification_status);
create index if not exists verification_submissions_user_id_idx on public.verification_submissions(user_id);
create index if not exists verification_submissions_status_idx on public.verification_submissions(status);
create unique index if not exists verification_submissions_user_pending_idx
  on public.verification_submissions(user_id)
  where status = 'pending';

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

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
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

alter table public.profiles enable row level security;
alter table public.verification_submissions enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "Users can update own contact fields" on public.profiles;

drop policy if exists "Admins can update profiles" on public.profiles;
create policy "Admins can update profiles"
on public.profiles for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Users can read own submissions" on public.verification_submissions;
create policy "Users can read own submissions"
on public.verification_submissions for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Users can create own submissions" on public.verification_submissions;
create policy "Users can create own submissions"
on public.verification_submissions for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Admins can update submissions" on public.verification_submissions;
create policy "Admins can update submissions"
on public.verification_submissions for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- After your first admin signs up, run this with their email:
-- update public.profiles set role = 'admin' where email = 'you@example.com';
