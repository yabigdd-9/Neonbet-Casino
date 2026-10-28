// @vitest-environment node
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
it("enforces referral caps and private, bounded, idempotent support requests", async () => {
  const db = new PGlite();
  const alice = "00000000-0000-4000-8000-000000000001",
    bob = "00000000-0000-4000-8000-000000000002",
    charlie = "00000000-0000-4000-8000-000000000003";
  try {
    await db.exec(
      `create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key,created_at timestamptz default now(),email_confirmed_at timestamptz);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;grant usage on schema auth to authenticated;grant execute on function auth.uid() to authenticated;`,
    );
    for (const file of ["referrals.sql", "support.sql", "support.sql"])
      await db.exec(readFileSync(new URL(`../../supabase/${file}`, import.meta.url), "utf8"));
    await db.query("insert into auth.users(id,email_confirmed_at) values($1,now()),($2,now()),($3,now())", [
      alice,
      bob,
      charlie,
    ]);
    const asUser = async (id) => {
      await db.exec("reset role");
      await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id]);
      await db.exec("set role authenticated");
    };
    await asUser(alice);
    const code = (await db.query("select public.get_practice_referral_status() as status")).rows[0].status
      .code;
    await db.exec("reset role");
    await db.exec(
      `insert into auth.users(id,email_confirmed_at) select gen_random_uuid(),now() from generate_series(1,19);`,
    );
    await db.query(
      "insert into private.practice_referral_awards(referred_id,referrer_id) select id,$1 from auth.users where id not in ($1,$2,$3)",
      [alice, bob, charlie],
    );
    await db.query("update auth.users set created_at=now() where id in ($1,$2)", [bob, charlie]);
    await asUser(bob);
    await db.query("select public.claim_practice_referral($1)", [code]);
    await db.query("select public.claim_practice_referral($1)", [code]);
    await asUser(charlie);
    await expect(db.query("select public.claim_practice_referral($1)", [code])).rejects.toThrow("limit");
    await asUser(alice);
    expect(
      (await db.query("select public.get_practice_referral_status() as status")).rows[0].status,
    ).toMatchObject({ credits: 100, count: 20 });
    const request = "10000000-0000-4000-8000-000000000001";
    await db.query("select public.create_support_request($1,'Games','The game does not load')", [request]);
    await db.query("select public.create_support_request($1,'Games','The game does not load')", [request]);
    expect((await db.query("select public.my_support_requests() as rows")).rows[0].rows).toHaveLength(1);
    await expect(db.query("select * from private.support_requests")).rejects.toThrow();
    await asUser(bob);
    expect((await db.query("select public.my_support_requests() as rows")).rows[0].rows).toEqual([]);
    await expect(
      db.query("select public.create_support_request($1,'Games','The game does not load')", [request]),
    ).rejects.toThrow("conflict");
    await asUser(alice);
    for (let n = 2; n <= 3; n++)
      await db.query("select public.create_support_request($1,'Games','The game does not load')", [
        `10000000-0000-4000-8000-${String(n).padStart(12, "0")}`,
      ]);
    await expect(
      db.query("select public.create_support_request(gen_random_uuid(),'Games','The game does not load')"),
    ).rejects.toThrow("limit");
    await db.exec("reset role;set role anon");
    await expect(db.query("select public.my_support_requests()")).rejects.toThrow();
  } finally {
    await db.close();
  }
}, 30000);
