-- Read-only verification for the intended Supabase project. No user data is selected or changed.
SELECT n.nspname AS schema_name, c.relname AS table_name, c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('profiles', 'verification_submissions', 'withdrawal_requests');

SELECT n.nspname AS schema_name, p.proname, p.prosecdef AS security_definer, p.proconfig,
  has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_can_execute
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE p.prosecdef AND n.nspname IN ('public', 'private');
