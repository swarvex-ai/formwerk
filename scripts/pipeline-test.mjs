// Tests in the swarvex test pipeline and merge train: only what a contribution changes. SWARVEX_CHANGED lists the
// changed paths, one per line. If a contribution touches only single assets (their file, their reference images, their
// lines in the registries, docs), the tests check only those assets (FORMWERK_ONLY, tests/only.mjs); the checks across
// the whole catalogue and the build always run. Anything else (shared code, contracts, materials, the gallery, tests,
// scripts, dependencies, a helper next to the assets) runs the full suite, and so does a run without SWARVEX_CHANGED
// (your own `npm test`, CI). The full suite also runs on GitHub after every merge.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const geaendert = (process.env.SWARVEX_CHANGED ?? "").split("\n").map((p) => p.trim()).filter(Boolean);
const ASSET = /^src\/(?:assets|surfaces|sprites|icons|sounds)\/[a-z0-9-]+\/([a-z0-9-]+)\.ts$/;
const BILD = /^tests\/scene\/baseline\/([a-z0-9-]+)(?:\.maps)?\.png$/;
const REGISTER = new Set(["src/index.ts", "src/assets/index.ts", "src/surfaces/index.ts", "src/surfaces/list.ts", "src/sprites/index.ts",
  "src/sprites/lib.ts", "src/icons/index.ts", "src/icons/lib.ts", "src/sounds/index.ts", "src/sounds/lib.ts"]);
const OHNE_TEST = /^(?:docs\/.*|[^/]+\.md)$/;

let voll = geaendert.length === 0 ? "no SWARVEX_CHANGED" : "";
const ids = new Set();
for (const p of geaendert) {
  const asset = ASSET.exec(p), bild = BILD.exec(p);
  // An asset has a reference image of the same name; a file without one next to the assets is a shared helper
  if (asset && existsSync(`tests/scene/baseline/${asset[1]}.png`)) ids.add(asset[1]);
  else if (bild) ids.add(bild[1]);
  else if (!REGISTER.has(p) && !OHNE_TEST.test(p)) { voll = `${p} is shared`; break; }
}
const env = { ...process.env };
if (voll) console.log(`pipeline test: full suite (${voll})`);
else {
  env.FORMWERK_ONLY = ids.size ? [...ids].join(",") : "-";
  console.log(`pipeline test: only ${ids.size ? [...ids].join(", ") : "the catalogue-wide checks"} (from ${geaendert.length} changed paths)`);
}
const r = spawnSync("npm", ["test"], { stdio: "inherit", env });
process.exit(r.status ?? 1);
