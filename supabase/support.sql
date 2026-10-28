begin;
create schema if not exists private;
create table if not exists private.support_requests (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  topic text not null check (topic in ('Account','Games','Referrals','Other')),
  details text not null check (length(details) between 10 and 1000),
  status text not null default 'open' check (status in ('open','resolved')),
  created_at timestamptz not null default now()
);
create index if not exists support_requests_user_created_idx on private.support_requests(user_id,created_at desc);
alter table private.support_requests enable row level security;
revoke all on private.support_requests from public,anon,authenticated;
create or replace function private.my_support_requests()
returns jsonb language plpgsql security definer set search_path='' as $$
declare caller uuid:=auth.uid();
begin
 if caller is null or not exists(select 1 from auth.users where id=caller and email_confirmed_at is not null) then raise exception 'A confirmed account is required'; end if;
 return (select coalesce(jsonb_agg(row),'[]'::jsonb) from (select id,topic,details,status,created_at from private.support_requests where user_id=caller order by created_at desc,id limit 10) row);
end $$;
create or replace function private.create_support_request(request_id uuid,request_topic text,request_details text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare caller uuid:=auth.uid(); existing private.support_requests;
begin
 if caller is null or not exists(select 1 from auth.users where id=caller and email_confirmed_at is not null) then raise exception 'A confirmed account is required'; end if;
 if request_id is null or request_topic is null or request_topic not in ('Account','Games','Referrals','Other') or request_details is null or length(trim(request_details)) not between 10 and 1000 then raise exception 'Invalid support request'; end if;
 perform pg_advisory_xact_lock(hashtextextended(caller::text,0));
 select * into existing from private.support_requests where id=request_id;
 if existing.id is not null then
  if existing.user_id<>caller or existing.topic<>request_topic or existing.details<>trim(request_details) then raise exception 'Request conflict'; end if;
  return jsonb_build_object('id',existing.id);
 end if;
 if (select count(*) from private.support_requests where user_id=caller and created_at>now()-interval '24 hours')>=3 then raise exception 'Daily support limit reached'; end if;
 insert into private.support_requests(id,user_id,topic,details) values(request_id,caller,request_topic,trim(request_details));
 return jsonb_build_object('id',request_id);
end $$;
create or replace function public.my_support_requests() returns jsonb language sql security invoker set search_path='' as $$ select private.my_support_requests(); $$;
create or replace function public.create_support_request(request_id uuid,request_topic text,request_details text) returns jsonb language sql security invoker set search_path='' as $$ select private.create_support_request(request_id,request_topic,request_details); $$;
revoke execute on function private.my_support_requests(),private.create_support_request(uuid,text,text),public.my_support_requests(),public.create_support_request(uuid,text,text) from public,anon;
grant usage on schema private to authenticated;
grant execute on function private.my_support_requests(),private.create_support_request(uuid,text,text),public.my_support_requests(),public.create_support_request(uuid,text,text) to authenticated;
commit;
