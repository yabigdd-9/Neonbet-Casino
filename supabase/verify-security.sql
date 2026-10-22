-- Read-only checks for the intended deployment. No data rows are read or changed.
select n.nspname as schema_name, c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('profiles', 'verification_submissions', 'withdrawal_requests');

select n.nspname as schema_name, p.proname, p.prosecdef as security_definer, p.proconfig,
  has_function_privilege('anon', p.oid, 'EXECUTE') as anon_can_execute
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where p.prosecdef and n.nspname in ('public', 'private');
