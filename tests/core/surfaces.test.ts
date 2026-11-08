// Every surface: valid schema, presets, texts, a tile size and relief, and an id that no model or sound uses. The
// shaders themselves are compiled, baked and checked (tiling, determinism, bake against live) by tests/scene/run.mjs.
import { describe, expect, it } from "vitest";
import { ASSETS } from "../../src/assets";
import { extremes, presetProblems, random, schemaProblems } from "../../src/core/params";
import { rng } from "../../src/core/rng";
import { SOUNDS } from "../../src/sounds";
import { SURFACES } from "../../src/surfaces";
import { makeSurface, SURFACE_CATEGORIES } from "../../src/surfaces/define";
import { SURFACE_IDS } from "../../src/surfaces/list";

describe("surface catalogue", () => {
  it("ids are unique across models, surfaces and sounds, kebab-case, with texts in German and English", () => {
    const ids = [...ASSETS.map((a) => a.id), ...SURFACES.map((f) => f.id), ...SOUNDS.map((s) => s.id)];
    expect(new Set(ids).size).toBe(ids.length);
    for (const f of SURFACES) {
      expect(f.id).toMatch(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/);
      expect(SURFACE_CATEGORIES).toContain(f.category);
      for (const t of [f.title, f.description]) { expect(t.de.trim()).not.toBe(""); expect(t.en.trim()).not.toBe(""); }
      expect(schemaProblems(f.params), f.id).toEqual([]);
      expect(presetProblems(f.params, f.presets), f.id).toEqual([]);
      expect(Object.keys(f.presets).length, `${f.id}: at least two presets`).toBeGreaterThanOrEqual(2);
      expect(Object.keys(f.params).length, `${f.id}: a surface is parametric`).toBeGreaterThanOrEqual(3);
      expect(f.tile, `${f.id}: tile size in metres`).toBeGreaterThan(0);
      expect(f.depth, `${f.id}: relief in metres, below the tile size`).toBeGreaterThan(0);
      expect(f.depth).toBeLessThan(f.tile / 4);
    }
  });
  it("the gallery shell knows every surface without loading three.js (src/surfaces/list.ts)", () => {
    expect([...SURFACE_IDS]).toEqual(SURFACES.map((f) => f.id));
  });
  for (const f of SURFACES) {
    it(`${f.id} builds a sampler at its defaults, extremes, presets and random values`, () => {
      const r = rng(42);
      const faelle = [...extremes(f.params), ...Object.keys(f.presets).map((preset) => ({ preset })), ...Array.from({ length: 6 }, () => random(f.params, r))];
      for (const werte of faelle) expect(typeof makeSurface(f, werte).sample, `${f.id} ${JSON.stringify(werte)}`).toBe("function");
    });
  }
});
