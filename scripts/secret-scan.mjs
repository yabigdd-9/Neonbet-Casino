// Local secret scanner — blocks commits/CI on leaked owner secrets.
// Patterns: crypto wallets, personal contact links, private keys, JWTs.
// Run: npm run secret-scan
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const IGNORE = new Set([
  "node_modules",
  "dist",
  ".git",
  "output",
  ".playwright-cli",
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

// Patterns that must never be committed in this owner's repos.
const PATTERNS = [
  // EVM wallet (the historically-leaked owner address + any 0x40 hex)
  /0x[0-9a-fA-F]{40}/,
  // Legacy BTC / Bech32-ish addresses
  /(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}/,
  // Personal Telegram / WhatsApp deep links
  /t\.me\/[a-zA-Z0-9_]+/,
  /wa\.me\/[0-9]+/,
  // Supabase service-role / JWT
  /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/,
  // Generic private key markers
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /sk-[a-zA-Z0-9]{20,}/,
];

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
  for (const re of PATTERNS) {
    const m = content.match(re);
    if (m) {
      hits.push({ file: relative(ROOT, file), match: m[0] });
      break;
    }
  }
}

if (hits.length) {
  console.error("SECRET SCAN FAILED — potential secrets found:");
  for (const h of hits) console.error(`  ${h.file}: ${h.match}`);
  console.error(
    "\nRemove or externalise these values (see docs/SECURITY.md). " +
      "Do not commit real secrets."
  );
  process.exit(1);
}

console.log(`Secret scan clean — ${files.length} files checked.`);
process.exit(0);
