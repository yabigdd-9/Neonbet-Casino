// @vitest-environment node
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
it("requires verified accounts and credits a new referral exactly once without exposing tables", async () => {
  const db = new PGlite();
  const alice = "00000000-0000-0000-0000-000000000001",
    bob = "00000000-0000-0000-0000-000000000002",
    charlie = "00000000-0000-0000-0000-000000000003";
  try {
    await db.exec(`create role anon; create role authenticated; create schema auth;
      create table auth.users(id uuid primary key, created_at timestamptz default now(), email_confirmed_at timestamptz);
      create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
      grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated;`);
    const schema = readFileSync(new URL("../../supabase/referrals.sql", import.meta.url), "utf8");
    await db.exec(schema);
    await db.exec(schema);
    await db.query("insert into auth.users(id,email_confirmed_at) values($1,now()),($2,now()),($3,null)", [
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
    const own = await db.query("select public.get_practice_referral_status() as status");
    const code = own.rows[0].status.code;
    await expect(db.query("select public.claim_practice_referral($1)", [code])).rejects.toThrow("Invalid");
    await db.exec("reset role");
    // Represent Bob signing up after Alice generated the invitation.
    await db.query("update auth.users set created_at=now() where id=$1", [bob]);
    await asUser(bob);
    await db.query("select public.claim_practice_referral($1)", [code]);
    await db.query("select public.claim_practice_referral($1)", [code]);
    await expect(db.query("select * from private.practice_referral_awards")).rejects.toThrow();
    await asUser(alice);
    const status = (await db.query("select public.get_practice_referral_status() as status")).rows[0].status;
    expect(status).toMatchObject({ credits: 5, count: 1 });
    await asUser(charlie);
    await expect(db.query("select public.claim_practice_referral($1)", [code])).rejects.toThrow("verified");
    await db.exec("reset role; set role anon");
    await expect(db.query("select public.get_practice_referral_status()")).rejects.toThrow();
  } finally {
    await db.close();
  }
}, 30000);
