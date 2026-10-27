import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
const manifest = JSON.parse(readFileSync("dist/.vite/manifest.json", "utf8"));
const entry = Object.values(manifest).find((chunk) => chunk.isEntry);
const files = new Set();
function visit(chunk) {
  if (files.has(chunk.file)) return;
  files.add(chunk.file);
  for (const key of chunk.imports || []) visit(manifest[key]);
}
visit(entry);
const gzipBytes = [...files]
  .filter((file) => file.endsWith(".js"))
  .reduce((sum, file) => sum + gzipSync(readFileSync(`dist/${file}`)).length, 0);
const baselineBytes = 137999;
const report = {
  baselineCommit: "9717a96b8353993d1c30046247aff7cad0536659",
  baselineGzipBytes: baselineBytes,
  initialGzipBytes: gzipBytes,
  reductionPercent: Number((100 * (1 - gzipBytes / baselineBytes)).toFixed(2)),
  files: [...files],
};
writeFileSync("dist/bundle-report.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (gzipBytes > baselineBytes * 0.75) throw new Error("Initial JS exceeds the 25% reduction budget");
