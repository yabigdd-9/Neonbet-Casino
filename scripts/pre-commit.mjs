// Pre-commit gate: runs secret-scan, lint, typecheck, then tests on staged files.
// Wired via: git config core.hooksPath .githooks
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function run(name, cmd, args) {
  console.log(`\n🔍 ${name}…`);
  const res = spawnSync(cmd, args, { cwd: ROOT, stdio: "inherit", shell: false });
  if (res.status !== 0) {
    console.error(`\n✖ ${name} failed (exit ${res.status}). Commit aborted.`);
    console.error("  Fix the issue, then `git add` and commit again.");
    process.exit(1);
  }
  console.log(`✓ ${name} passed`);
}

run("Secret scan", "node", ["scripts/secret-scan.mjs"]);
run("Lint", "npx", ["eslint", ".", "--max-warnings=0"]);
run("Typecheck", "npx", ["tsc", "--noEmit"]);
run("Tests", "npm", ["run", "test"]);

console.log("\n✅ Pre-commit checks passed.");
process.exit(0);
