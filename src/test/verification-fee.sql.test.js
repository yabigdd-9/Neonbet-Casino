// P2 — SQL policy assertions for the server-authoritative verification fee.
// These guard against a regression where the RLS insert check hard-codes a
// literal fee (which both broke white-label and let the client nominate an
// amount). No live database is required; we assert on the schema/migration text.
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");

const schemaSql = readFileSync(join(ROOT, "supabase", "schema.sql"), "utf8");
const migration002 = readFileSync(join(ROOT, "supabase", "migrations", "002_operator_settings.sql"), "utf8");
const migration001 = readFileSync(join(ROOT, "supabase", "migrations", "001_initial.sql"), "utf8");

describe("verification fee SQL (P2)", () => {
  it("001 migration does NOT hard-code `amount_usd = 75` in the RLS insert policy", () => {
    // The old buggy policy line must be gone from the canonical migration.
    expect(migration001).not.toMatch(/amount_usd\s*=\s*75\b/);
  });

  it("001 migration enforces the fee from operator_settings instead of a literal", () => {
    expect(migration001).toMatch(
      /amount_usd\s*=\s*\(\s*select\s+coalesce\(\(\s*select\s+fee_usd\s+from\s+public\.operator_settings/,
    );
  });

  it("002 migration defines operator_settings + get_verification_fee() + submit_verification_submission()", () => {
    expect(migration002).toMatch(/create table if not exists public\.operator_settings/);
    expect(migration002).toMatch(/function public\.get_verification_fee\(\)/);
    expect(migration002).toMatch(/function public\.submit_verification_submission\(/);
  });

  it("submit_verification_submission derives amount_usd from operator_settings", () => {
    expect(migration002).toMatch(
      /insert into public\.verification_submissions[\s\S]*amount_usd[\s\S]*v_fee/,
    );
    expect(migration002).toMatch(/select fee_usd into v_fee from public\.operator_settings/);
  });

  it("schema.sql stays in sync with the migrations (no literal 75, has operator_settings)", () => {
    expect(schemaSql).not.toMatch(/amount_usd\s*=\s*75\b/);
    expect(schemaSql).toMatch(/public\.operator_settings/);
    expect(schemaSql).toMatch(/function public\.get_verification_fee\(\)/);
  });
});
