// Every sprite, at its defaults, extremes, presets and random values: valid schema and texts, an id no other asset
// uses, a sheet of the right size, frames that are not empty, hard pixel edges (alpha 0 or 255), a small palette, the
// outermost ring of every drawn frame left free for the outline, feet on the bottom row for grounded sprites, left as
// the mirror of right, animations that move, and the same pixels for the same values and seed. The reference sheets
// are checked by tests/scene/sprites.mjs.
import { describe, expect, it } from "vitest";
import { only } from "../only.mjs";
import { ASSETS } from "../../src/assets";
import { extremes, presetProblems, random, schemaProblems, withPreset } from "../../src/core/params";
import { rng } from "../../src/core/rng";
import { SOUNDS } from "../../src/sounds";
import { SURFACE_IDS } from "../../src/surfaces/list";
import { SPRITES } from "../../src/sprites";
import { godotSpriteFrames, makeSheet, sheetJson, SPRITE_CATEGORIES, type Sheet, type SheetFrame } from "../../src/sprites/define";

const FARBEN = 40;
const zeile = (s: Sheet, f: SheetFrame, y: number) => Array.from({ length: f.w }, (_, x) => s.image.alpha(f.x + x, f.y + y));
const pixel = (s: Sheet, f: SheetFrame) => Array.from({ length: f.h }, (_, y) => Array.from({ length: f.w }, (_, x) => s.image.get(f.x + x, f.y + y).join(","))).flat();

describe("sprite catalogue", () => {
  it("ids are unique across all kinds, kebab-case, with texts in German and English", () => {
    const ids = [...ASSETS.map((a) => a.id), ...SURFACE_IDS, ...SOUNDS.map((s) => s.id), ...SPRITES.map((s) => s.id)];
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of SPRITES) {
      expect(s.id).toMatch(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/);
      expect(SPRITE_CATEGORIES).toContain(s.category);
      for (const t of [s.title, s.description]) { expect(t.de.trim()).not.toBe(""); expect(t.en.trim()).not.toBe(""); }
      expect(schemaProblems(s.params), s.id).toEqual([]);
      expect(presetProblems(s.params, s.presets), s.id).toEqual([]);
      expect(Object.keys(s.presets).length, `${s.id}: at least two presets`).toBeGreaterThanOrEqual(2);
      expect(Object.keys(s.params).length, `${s.id}: a sprite is parametric`).toBeGreaterThanOrEqual(3);
      expect(s.animations.length).toBeGreaterThan(0);
      expect(s.frame.w).toBeLessThanOrEqual(64); expect(s.frame.h).toBeLessThanOrEqual(64);
    }
  });
});

for (const s of only(SPRITES)) {
  describe(s.id, () => {
    const r = rng(42);
    const faelle = [...extremes(s.params), ...Object.keys(s.presets).map((preset) => ({ preset })), ...Array.from({ length: 6 }, () => random(s.params, r))];
    it(`draws a clean sheet at ${faelle.length} parameter sets`, () => {
      const spalten = Math.max(...s.animations.map((a) => a.frames)), zeilen = s.animations.length * s.directions.length;
      for (const werte of faelle) {
        const was = `${s.id} ${JSON.stringify(werte)}`, sheet = makeSheet(s, werte, 1);
        expect([sheet.image.w, sheet.image.h], `${was}: sheet size`).toEqual([spalten * s.frame.w, zeilen * s.frame.h]);
        expect(sheet.frames.length).toBe(s.animations.reduce((n, a) => n + a.frames, 0) * s.directions.length);
        let weich = 0;
        for (let i = 3; i < sheet.image.data.length; i += 4) if (sheet.image.data[i] !== 0 && sheet.image.data[i] !== 255) weich++;
        expect(weich, `${was}: hard edges (alpha 0 or 255)`).toBe(0);
        expect(sheet.image.colours(), `${was}: at most ${FARBEN} colours`).toBeLessThanOrEqual(FARBEN);
        // The drawing leaves the outer ring free, so the outline fits into the frame
        const zeichne = s.build(withPreset(s.params, s.presets, werte), 1);
        for (const a of s.animations) for (const d of s.directions) for (let f = 0; f < a.frames; f++) {
          const b = zeichne(a.name, d, f);
          let rand = 0;
          for (let x = 0; x < b.w; x++) rand += b.alpha(x, 0) + b.alpha(x, b.h - 1);
          for (let y = 0; y < b.h; y++) rand += b.alpha(0, y) + b.alpha(b.w - 1, y);
          expect(rand, `${was} ${a.name} ${d} ${f}: the outer ring stays free for the outline`).toBe(0);
        }
        for (const f of sheet.frames) {
          const voll = Array.from({ length: f.h }, (_, y) => zeile(sheet, f, y).some(Boolean));
          expect(voll.some(Boolean), `${was} ${f.animation} ${f.direction} ${f.frame}: not empty`).toBe(true);
          if (s.grounded && f.animation === "idle") expect(voll[f.h - 1], `${was} idle ${f.direction} ${f.frame}: feet on the bottom row`).toBe(true);
        }
      }
    });
    it("left is the mirror of right, and every animation with several frames moves", () => {
      const sheet = makeSheet(s);
      if (s.directions.includes("left") && s.directions.includes("right")) for (const f of sheet.frames.filter((x) => x.direction === "right")) {
        const l = sheet.frames.find((x) => x.direction === "left" && x.animation === f.animation && x.frame === f.frame)!;
        let anders = 0;
        for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) if (sheet.image.get(l.x + f.w - 1 - x, l.y + y).join() !== sheet.image.get(f.x + x, f.y + y).join()) anders++;
        expect(anders, `${f.animation} ${f.frame}: left is the mirror of right`).toBe(0);
      }
      for (const a of s.animations.filter((x) => x.frames > 1)) for (const d of s.directions) {
        const bilder = sheet.frames.filter((f) => f.animation === a.name && f.direction === d).map((f) => pixel(sheet, f).join(";"));
        expect(new Set(bilder).size, `${a.name} ${d}: frames differ`).toBeGreaterThan(1);
      }
    });
    it("is deterministic, and its Godot SpriteFrames and JSON name every frame", () => {
      const w = random(s.params, rng(7));
      expect(makeSheet(s, w, 3).image.data).toEqual(makeSheet(s, w, 3).image.data);
      const sheet = makeSheet(s), tres = godotSpriteFrames(sheet, `${s.id}.png`), json = sheetJson(sheet, `${s.id}.png`);
      expect(tres.match(/\[sub_resource type="AtlasTexture"/g)?.length).toBe(sheet.frames.length);
      expect(Object.values(json.animations).reduce((n, a) => n + a.frames.length, 0)).toBe(sheet.frames.length);
    });
  });
}
