// Every asset, at its defaults, its extremes and random values: valid schema, within budget, finite, standing on the
// floor, and the same output for the same values and seed. A new asset passes these before it can be merged.
import { describe, expect, it } from "vitest";
import { Box3, type BufferGeometry, type Mesh, type Object3D } from "three";
import { ASSETS } from "../../src/assets";
import { CATEGORIES, measure } from "../../src/assets/define";
import { extremes, random, schemaProblems } from "../../src/core/params";
import { rng } from "../../src/core/rng";

// Upper limits per category (the lead changes these, not a single asset)
const GRENZE = { furniture: { triangles: 20000, drawCalls: 4 }, architecture: { triangles: 30000, drawCalls: 4 }, nature: { triangles: 150000, drawCalls: 3 } } as const;

const pruefsumme = (o: Object3D) => {
  let summe = 0;
  o.traverse((x) => {
    const g = (x as Mesh).geometry as BufferGeometry | undefined;
    if ((x as Mesh).isMesh && g) { const a = g.attributes.position.array; for (let i = 0; i < a.length; i += 7) summe += a[i] * (i % 13 + 1); }
  });
  return summe;
};

describe("catalogue", () => {
  it("ids are unique, kebab-case, with texts in German and English", () => {
    expect(new Set(ASSETS.map((a) => a.id)).size).toBe(ASSETS.length);
    for (const a of ASSETS) {
      expect(a.id).toMatch(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/);
      expect(CATEGORIES).toContain(a.category);
      for (const t of [a.title, a.description]) { expect(t.de.trim()).not.toBe(""); expect(t.en.trim()).not.toBe(""); }
      expect(schemaProblems(a.params), a.id).toEqual([]);
      expect(Object.keys(a.params).length, `${a.id}: an asset is parametric`).toBeGreaterThanOrEqual(3);
      expect(a.budget.triangles).toBeLessThanOrEqual(GRENZE[a.category].triangles);
      expect(a.budget.drawCalls).toBeLessThanOrEqual(GRENZE[a.category].drawCalls);
    }
  });
});

for (const a of ASSETS) {
  describe(a.id, () => {
    const r = rng(42);
    const faelle = [...extremes(a.params), ...Array.from({ length: 12 }, () => random(a.params, r))];
    it(`builds within budget at ${faelle.length} parameter sets`, () => {
      for (const [i, werte] of faelle.entries()) {
        const o = a.build(werte, 1 + i);
        const m = measure(o);
        const was = `${a.id} ${JSON.stringify(werte)}`;
        expect(m.triangles, was).toBeGreaterThan(0);
        expect(m.triangles, was).toBeLessThanOrEqual(a.budget.triangles);
        expect(m.drawCalls, was).toBeLessThanOrEqual(a.budget.drawCalls);
        const box = new Box3().setFromObject(o);
        for (const v of [box.min.x, box.min.y, box.min.z, box.max.x, box.max.y, box.max.z]) expect(Number.isFinite(v), was).toBe(true);
        expect(Math.abs(box.min.y), `${was}: stands on the floor`).toBeLessThan(0.02);
      }
    });
    it("is deterministic: same values and seed, same geometry", () => {
      const w = random(a.params, rng(7));
      expect(pruefsumme(a.build(w, 3))).toBe(pruefsumme(a.build(w, 3)));
    });
  });
}
