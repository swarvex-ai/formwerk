// Every icon, at its defaults, extremes, presets and random values, in every style: valid schema and texts, an id no
// other asset uses, its own shape parameters next to the shared pen, ink only inside the live area (the outermost
// pixel of the 24 px grid stays empty), a sensible amount of ink, centred, and readable at 24 px: no gap or stroke
// narrower than about one pixel (src/core/vector.ts, legibility). The SVG is well formed, takes the
// text colour and comes out the same for the same values. The reference sheets are checked by tests/scene/icons.mjs.
import { describe, expect, it } from "vitest";
import { only } from "../only.mjs";
import { ASSETS } from "../../src/assets";
import { extremes, presetProblems, random, schemaProblems } from "../../src/core/params";
import { rng } from "../../src/core/rng";
import { legibility } from "../../src/core/vector";
import { ICONS } from "../../src/icons";
import { ICON_CATEGORIES, makeIcon, ownParams, STYLE } from "../../src/icons/define";
import { SOUNDS } from "../../src/sounds";
import { SPRITES } from "../../src/sprites";
import { SURFACE_IDS } from "../../src/surfaces/list";

const STILE = STYLE.style.options;

// Tags open and close in order; attribute values never hold a raw "<"
function wohlgeformt(svg: string): string | null {
  const stapel: string[] = [];
  for (const m of svg.matchAll(/<(\/?)([a-zA-Z]+)([^<>]*?)(\/?)>/g)) {
    const [, zu, name, , selbst] = m;
    if (selbst) continue;
    if (!zu) stapel.push(name);
    else if (stapel.pop() !== name) return `</${name}> closes the wrong tag`;
  }
  return stapel.length ? `<${stapel.join("><")}> not closed` : svg.replace(/<[^<>]*>/g, "").trim() ? "text outside tags" : null;
}

describe("icon catalogue", () => {
  it("ids are unique across all kinds, kebab-case, with texts in German and English", () => {
    const ids = [...ASSETS.map((a) => a.id), ...SURFACE_IDS, ...SOUNDS.map((s) => s.id), ...SPRITES.map((s) => s.id), ...ICONS.map((i) => i.id)];
    expect(new Set(ids).size).toBe(ids.length);
    for (const i of ICONS) {
      expect(i.id).toMatch(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/);
      expect(ICON_CATEGORIES).toContain(i.category);
      for (const t of [i.title, i.description]) { expect(t.de.trim()).not.toBe(""); expect(t.en.trim()).not.toBe(""); }
      expect(schemaProblems(i.params), i.id).toEqual([]);
      expect(presetProblems(i.params, i.presets), i.id).toEqual([]);
      expect(Object.keys(i.presets).length, `${i.id}: at least two presets`).toBeGreaterThanOrEqual(2);
      expect(ownParams(i).length, `${i.id}: at least three parameters of its own that change the shape`).toBeGreaterThanOrEqual(3);
      for (const k of Object.keys(STYLE)) expect(i.params, `${i.id}: shared parameter ${k}`).toHaveProperty(k);
    }
  });
});

for (const icon of only(ICONS)) {
  describe(icon.id, () => {
    const r = rng(42);
    const faelle = [...extremes(icon.params), ...Object.keys(icon.presets).map((preset) => ({ preset })), ...Array.from({ length: 10 }, () => random(icon.params, r))]
      .flatMap((w) => STILE.map((style) => ({ ...w, style }) as Record<string, unknown>));
    it(`stays in the live area, centred, and reads at 24 px in ${faelle.length} cases`, () => {
      for (const werte of faelle) {
        const was = `${icon.id} ${JSON.stringify(werte)}`, m = makeIcon(icon, werte), klein = m.pixels(24);
        let rand = 0, tinte = 0, x0 = 24, x1 = 0, y0 = 24, y1 = 0;
        for (let y = 0; y < 24; y++) for (let x = 0; x < 24; x++) {
          const a = klein.alpha(x, y);
          if (!a) continue;
          if (x === 0 || y === 0 || x === 23 || y === 23) rand++;
          tinte += a / 255; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
        }
        expect(rand, `${was}: the outermost pixel ring stays empty`).toBe(0);
        expect(tinte / 576, `${was}: ink between 4 and 80 % of the grid`).toBeGreaterThan(0.04);
        expect(tinte / 576, `${was}: ink between 4 and 80 % of the grid`).toBeLessThan(0.8);
        if (!m.values.badge) {
          expect(Math.abs((x0 + x1 + 1) / 2 - 12), `${was}: centred across`).toBeLessThanOrEqual(2);
          expect(Math.abs((y0 + y1 + 1) / 2 - 12), `${was}: centred top to bottom`).toBeLessThanOrEqual(2);
        }
        // The badge cuts into the drawing on purpose; the icon itself has to read without it
        const ohne = m.values.badge ? makeIcon(icon, { ...werte, badge: false }) : m;
        expect(legibility(ohne.ops, ohne.pen), `${was}: reads at 24 px`).toBeNull();
      }
    }, 120_000);
    it("the style, the corners and its own parameters change the drawing", () => {
      const basis = makeIcon(icon).svg();
      expect(makeIcon(icon, { style: "filled" }).svg(), "filled").not.toBe(basis);
      expect(makeIcon(icon, { corners: "sharp" }).svg(), "sharp").not.toBe(basis);
      for (const k of ownParams(icon)) {
        const p = icon.params[k], anders = extremes({ [k]: p }).map((w) => makeIcon(icon, { [k]: w[k] }).svg());
        expect(new Set([basis, ...anders]).size, `${k} changes the drawing`).toBeGreaterThan(1);
      }
    });
    it("writes well-formed SVG in the text colour, the same for the same values", () => {
      for (const werte of faelle.slice(0, 40)) {
        const svg = makeIcon(icon, werte).svg(48);
        expect(wohlgeformt(svg), `${icon.id} ${JSON.stringify(werte)}`).toBeNull();
        expect(svg).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="48" height="48" viewBox="0 0 24 24"/);
        expect(svg).toContain('stroke="currentColor"');
        expect(svg).not.toMatch(/NaN|Infinity|undefined/);
        expect(svg).not.toMatch(/#[0-9a-f]{6}/i);
        expect(makeIcon(icon, werte).svg(48)).toBe(svg);
      }
    });
  });
}
