// FORMWERK_SWEEP=<icon id>: draws the icon in every combination of its parameters (number parameters at up to seven
// evenly spaced values, every choice, every stroke, both corners, all three styles) and applies the checks of
// icons.test.ts to each: the outermost pixel ring stays empty, ink between 4 and 80 %, centred, reads at 24 px.
// The suite itself draws only a few random cases, so a green suite can hide whole failing regions. Writes every
// failing combination to tests/scene/out/sweep-<id>.txt and fails when there is one. Skipped when the variable is not
// set; about 1000 combinations take 4 to 5 minutes. FORMWERK_SWEEP_FIX='{"size":18}' holds parameters at these values
// (a slice, quick while working); the report then names the slice.
import { expect, it } from "vitest";
import { legibility } from "../../src/core/vector";
import { ICONS } from "../../src/icons";
import { makeIcon } from "../../src/icons/define";
import { report, sweepFix, sweepId } from "../sweep.mjs";

const id: string = sweepId;

it.skipIf(!id)(`sweeps every combination of ${id || "an icon"}`, () => {
  const icon = ICONS.find((i) => i.id === id);
  expect(icon, `no icon ${id}`).toBeDefined();
  let faelle: Record<string, unknown>[] = [{}];
  for (const [k, p] of Object.entries(icon!.params) as [string, Record<string, unknown>][]) {
    if (k === "color" || k === "badge") continue;
    let werte: unknown[];
    if (k in sweepFix) werte = [sweepFix[k]];
    else if (p.type === "choice") werte = p.options as string[];
    else if (p.type === "boolean") werte = [false, true];
    else {
      const min = p.min as number, max = p.max as number, step = (p.step as number) ?? (p.type === "integer" ? 1 : (max - min) / 6);
      const n = Math.round((max - min) / step), k2 = k === "stroke" ? n : Math.min(n, 6);
      werte = Array.from({ length: k2 + 1 }, (_, i) => +(min + Math.round((i * n) / k2) * step).toFixed(4));
    }
    faelle = faelle.flatMap((f) => werte.map((w) => ({ ...f, [k]: w })));
  }
  const fehler: string[] = [];
  for (const werte of faelle) {
    const m = makeIcon(icon!, werte), klein = m.pixels(24);
    let rand = 0, tinte = 0, x0 = 24, x1 = 0, y0 = 24, y1 = 0;
    for (let y = 0; y < 24; y++) for (let x = 0; x < 24; x++) {
      const a = klein.alpha(x, y);
      if (!a) continue;
      if (x === 0 || y === 0 || x === 23 || y === 23) rand++;
      tinte += a / 255; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    }
    const was = [
      rand ? `${rand} pixels on the outermost ring` : null,
      tinte / 576 <= 0.04 || tinte / 576 >= 0.8 ? `ink ${((tinte / 576) * 100).toFixed(1)} %` : null,
      Math.abs((x0 + x1 + 1) / 2 - 12) > 2 || Math.abs((y0 + y1 + 1) / 2 - 12) > 2 ? "not centred" : null,
      legibility(m.ops, m.pen),
    ].filter(Boolean);
    if (was.length) fehler.push(`${JSON.stringify(werte)}: ${was.join("; ")}`);
  }
  const scheibe = Object.keys(sweepFix).length ? ` (slice ${JSON.stringify(sweepFix)})` : "";
  report(id, `${id}: ${fehler.length} of ${faelle.length} combinations fail${scheibe}\n${fehler.join("\n")}\n`);
  expect(fehler.length, `${id}: ${fehler.length} of ${faelle.length} combinations fail, see tests/scene/out/sweep-${id}.txt`).toBe(0);
}, 3_600_000);
