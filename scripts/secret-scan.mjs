// Local secret scanner — blocks commits/CI on leaked owner secrets.
// Patterns: crypto wallets, personal contact links, private keys, JWTs.
// Run: npm run secret-scan
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { detectSecret } from "./secret-patterns.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const IGNORE = new Set([
  "node_modules",
  "dist",
  ".git",
  "output",
  ".playwright-cli",
  "test-results",
  "playwright-report",
]);
// Filenames that are templates or generated and may contain placeholder/hash
// strings that resemble secrets but are not (locked by standard practice).
const IGNORE_FILES = new Set([
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  ".env.example",
  ".env.sample",
]);

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    if (IGNORE.has(entry)) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, acc);
    else if (st.isFile() && !IGNORE_FILES.has(entry)) acc.push(full);
  }
  return acc;
}

const files = walk(ROOT);
const hits = [];
for (const file of files) {
  let content;
  try {
    content = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  if (content.includes("\0") || /\.(png|jpe?g|webp|zip|pdf)$/.test(file)) continue;
  const category = detectSecret(content);
  if (category) hits.push({ file: relative(ROOT, file), category });
}

if (hits.length) {
  console.error("SECRET SCAN FAILED — potential secrets found:");
  for (const h of hits) console.error(`  ${h.file}: ${h.category} (value redacted)`);
  console.error(
    "\nRemove or externalise these values (see docs/SECURITY.md). " + "Do not commit real secrets.",
  );
  process.exit(1);
}

console.log(`Secret scan clean — ${files.length} files checked.`);
process.exit(0);
