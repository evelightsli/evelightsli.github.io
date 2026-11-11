// Pre-deploy checks. Run by the GitHub Actions workflow; a failure here stops the deploy,
// so a broken commit never replaces the live site. Usage: node scripts/check.mjs [siteDir]
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2] || ".";
const errors = [];
const need = (f) => { if (!existsSync(join(root, f))) errors.push(`missing file: ${f}`); };

["index.html", "404.html", "robots.txt", "sitemap.xml", "favicon.png", ".nojekyll"].forEach(need);

for (const page of ["index.html", "404.html"]) {
  if (!existsSync(join(root, page))) continue;
  const html = readFileSync(join(root, page), "utf8");

  // Every local file referenced by src / href / srcset / url() must exist.
  const refs = new Set();
  for (const m of html.matchAll(/(?:src|href)="([^"]+)"/g)) refs.add(m[1]);
  for (const m of html.matchAll(/srcset="([^"]+)"/g)) m[1].split(",").forEach((p) => refs.add(p.trim().split(/\s+/)[0]));
  for (const m of html.matchAll(/url\(([^)]+)\)/g)) refs.add(m[1].replace(/["']/g, ""));
  for (const ref of refs) {
    if (/^(https?:|mailto:|tel:|#|data:)/.test(ref) || ref === "/" || ref.includes("+")) continue;
    need(ref.replace(/^\//, "").split(/[?#]/)[0]);
  }

  // Structured data must be valid JSON.
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch (e) { errors.push(`${page}: invalid JSON-LD (${e.message})`); }
  }

  // In-page links must point at an id that exists.
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const m of html.matchAll(/href="#([^"]+)"/g)) if (!ids.has(m[1])) errors.push(`${page}: broken anchor #${m[1]}`);

  // Gallery photos listed in the page script must exist in both sizes.
  const list = html.match(/var PH=(\[\[.*?\]\]);/);
  if (page === "index.html") {
    if (!list) errors.push("index.html: gallery photo list not found");
    else for (const p of JSON.parse(list[1])) { need(`assets/img/${p[0]}-720.webp`); need(`assets/img/${p[0]}-1800.webp`); }
    if (!/<link rel="canonical" href="https:\/\/evelightsli\.com\/">/.test(html)) errors.push("index.html: canonical URL missing or changed");
  }

  // No secrets or third-party runtime dependencies sneaking in.
  if (/(api[_-]?key|secret|password)\s*[:=]\s*["'][^"']{8,}/i.test(html)) errors.push(`${page}: possible credential in source`);
}

if (errors.length) { console.error("Site check failed:\n - " + errors.join("\n - ")); process.exit(1); }
console.log("Site check passed.");
