// @vitest-environment node
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, afterEach, beforeAll, expect, it } from "vitest";

let db;
const alice = "00000000-0000-0000-0000-000000000001";
const bob = "00000000-0000-0000-0000-000000000002";
const admin = "00000000-0000-0000-0000-000000000003";

beforeAll(async () => {
  db = new PGlite();
  // Minimal auth fixtures only: this does not emulate Supabase Auth or its API.
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin bypassrls;
    create schema auth;
    create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
    $$;
    grant usage on schema auth to authenticated;
    grant execute on function auth.uid() to authenticated;
  `);
  // PGlite lacks pgcrypto; schema UUID defaults use core gen_random_uuid().
  const schema = readFileSync(new URL("../../supabase/schema.sql", import.meta.url), "utf8")
    .replace("create extension if not exists pgcrypto;", "");
  await db.exec(schema);
  await db.exec(schema); // Existing installs must also accept the schema update.
  await db.query(`insert into auth.users(id,email,raw_user_meta_data) values
    ($1,'alice@example.test','{"username":"Alice","role":"admin"}'),
    ($2,'bob@example.test','{"username":"Bob"}'),
    ($3,'admin@example.test','{"username":"Admin"}')`, [alice, bob, admin]);
  await db.query("update public.profiles set role = 'admin' where id = $1", [admin]);
}, 30000);

afterEach(async () => {
  await db.exec("reset role; select set_config('request.jwt.claim.sub', '', false);");
});
afterAll(async () => { await db?.close(); });

async function asUser(id) {
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
  await db.exec("set role authenticated");
}

it("restricts profile reads to the signed-in owner", async () => {
  await asUser(alice);
  const { rows } = await db.query("select id from public.profiles");
  expect(rows).toEqual([{ id: alice }]);
});
it("denies anonymous profile access", async () => {
  await db.exec("set role anon");
  await expect(db.query("select * from public.profiles")).rejects.toMatchObject({ code: "42501" });
});
it("prevents self-promotion through profile writes", async () => {
  await asUser(alice);
  await expect(db.query("update public.profiles set role = 'admin' where id = $1", [alice]))
    .rejects.toMatchObject({ code: "42501" });
});
it("ignores user-supplied admin metadata", async () => {
  await asUser(alice);
  const { rows } = await db.query("select private.is_admin() as allowed");
  expect(rows[0].allowed).toBe(false);
});
it("preserves database-authorized admin profile reads", async () => {
  await asUser(admin);
  const { rows } = await db.query("select id from public.profiles order by id");
  expect(rows).toHaveLength(3);
});
it("denies authenticated users without an identity access to any profile", async () => {
  await db.exec("set role authenticated");
  const { rows } = await db.query("select id from public.profiles");
  expect(rows).toEqual([]);
});
it("pins every privileged function to an empty search path", async () => {
  const { rows } = await db.query(`select p.proname, p.proconfig
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where p.prosecdef and n.nspname in ('public', 'private')`);
  expect(rows.length).toBeGreaterThan(0);
  for (const row of rows) expect(row.proconfig, row.proname).toContain('search_path=""');
});
it("does not allow anonymous users to execute privileged functions", async () => {
  const { rows } = await db.query(`select p.proname,
    has_function_privilege('anon', p.oid, 'EXECUTE') as allowed
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where p.prosecdef and n.nspname in ('public', 'private')`);
  expect(rows.every((row) => !row.allowed)).toBe(true);
});
it("does not expose trigger functions as authenticated RPCs", async () => {
  const { rows } = await db.query(`select p.proname,
    has_function_privilege('authenticated', p.oid, 'EXECUTE') as allowed
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.prorettype = 'trigger'::regtype`);
  expect(rows.length).toBe(3);
  expect(rows.every((row) => !row.allowed)).toBe(true);
});

it("denies admin RPCs to ordinary authenticated users", async () => {
  await asUser(alice);
  await expect(db.query("select public.update_profile_admin($1, 0, 0, 0, '')", [alice]))
    .rejects.toMatchObject({ code: "42501" });
});
