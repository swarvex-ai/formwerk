// Every asset, at its defaults, its extremes and random values: valid schema, within budget, finite, standing on the
// floor, and the same output for the same values and seed. A new asset passes these before it can be merged.
import { describe, expect, it } from "vitest";
import { only } from "../only.mjs";
import { Box3, Quaternion, type BufferGeometry, type Mesh, type Object3D } from "three";
import { ASSETS } from "../../src/assets";
import { CATEGORIES, infoOf, make, measure, partOf, pose } from "../../src/assets/define";
import { extremes, presetProblems, random, schemaProblems } from "../../src/core/params";
import { hullPoints, physicsOf } from "../../src/core/physics";
import { rng } from "../../src/core/rng";

// Upper limits per category (the lead changes these, not a single asset; raised for the realistic look, style guide
// approved 14 Nov 2026: bevels, lathe profiles and segment minimums cost triangles)
// (vehicles: several movable parts such as turret, barrel, wheels or doors, each its own draw call)
const GRENZE = { furniture: { triangles: 60000, drawCalls: 4 }, architecture: { triangles: 80000, drawCalls: 4 }, nature: { triangles: 150000, drawCalls: 3 },
  vehicles: { triangles: 150000, drawCalls: 8 }, props: { triangles: 30000, drawCalls: 4 } } as const;

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
      expect(presetProblems(a.params, a.presets), a.id).toEqual([]);
      expect(Object.keys(a.presets).length, `${a.id}: at least two presets`).toBeGreaterThanOrEqual(2);
      expect(["static", "dynamic"]).toContain(a.physics.body);
      expect(["box", "hull", "cylinder"]).toContain(a.physics.collider);
      for (const [name, r] of Object.entries(a.rig ?? {})) {
        expect(name, `${a.id}: rig names are camelCase`).toMatch(/^[a-z][a-zA-Z0-9]*$/);
        expect(r.min <= 0 && 0 <= r.max && r.min < r.max, `${a.id}.${name}: 0 (closed) inside the range`).toBe(true);
        expect(Math.hypot(...r.axis), `${a.id}.${name}: axis`).toBeGreaterThan(0);
      }
      expect(Object.keys(a.params).length, `${a.id}: an asset is parametric`).toBeGreaterThanOrEqual(3);
      expect(a.budget.triangles).toBeLessThanOrEqual(GRENZE[a.category].triangles);
      expect(a.budget.drawCalls).toBeLessThanOrEqual(GRENZE[a.category].drawCalls);
    }
  });
});

for (const a of only(ASSETS)) {
  describe(a.id, () => {
    const r = rng(42);
    const faelle = [...extremes(a.params), ...Array.from({ length: 12 }, () => random(a.params, r))];
    it(`builds within budget at ${faelle.length} parameter sets`, () => {
      for (const [i, werte] of faelle.entries()) {
        const o = make(a, werte, 1 + i);
        const m = measure(o);
        const was = `${a.id} ${JSON.stringify(werte)}`;
        expect(m.triangles, was).toBeGreaterThan(0);
        expect(m.triangles, was).toBeLessThanOrEqual(a.budget.triangles);
        expect(m.drawCalls, was).toBeLessThanOrEqual(a.budget.drawCalls);
        const box = new Box3().setFromObject(o);
        for (const v of [box.min.x, box.min.y, box.min.z, box.max.x, box.max.y, box.max.z]) expect(Number.isFinite(v), was).toBe(true);
        expect(Math.abs(box.min.y), `${was}: stands on the floor`).toBeLessThan(0.02);
        const info = infoOf(o)!;
        expect(info.physics.massKg, `${was}: mass`).toBeGreaterThan(0);
        expect(Number.isFinite(info.physics.massKg), `${was}: mass`).toBe(true);
        // Bewegliche Teile: am Ende ihres Bereichs bleibt alles über dem Boden und endlich
        for (const [name, r] of Object.entries(info.rig)) {
          for (const v of [r.min, r.max]) {
            const b = new Box3().setFromObject(pose(o, { [name]: v }));
            expect(Number.isFinite(b.max.y) && b.min.y > -0.02, `${was}: ${name} at ${v}`).toBe(true);
            expect(o.quaternion.equals(new Quaternion()) && o.position.lengthSq() === 0, `${was}: ${name} moves its part, not the whole asset`).toBe(true);
          }
          pose(o, { [name]: 0 });
        }
      }
    });
    it("presets build, movable parts appear, physics data is complete", () => {
      for (const name of Object.keys(a.presets)) expect(measure(make(a, { preset: name })).triangles, `${a.id} preset ${name}`).toBeGreaterThan(0);
      for (const name of Object.keys(a.rig ?? {})) {
        expect(faelle.some((w) => partOf(make(a, w), name)), `${a.id}: movable part ${name} appears for some values`).toBe(true);
      }
      const p = physicsOf(make(a));
      expect(p.halfExtents.every((x) => x > 0)).toBe(true);
      if (p.collider === "cylinder") expect(p.cylinder!.radius > 0 && p.cylinder!.height > 0).toBe(true);
      if (p.collider === "hull") expect(hullPoints(make(a)).length).toBeGreaterThanOrEqual(12);
    });
    it("is deterministic: same values and seed, same geometry", () => {
      const w = random(a.params, rng(7));
      expect(pruefsumme(make(a, w, 3))).toBe(pruefsumme(make(a, w, 3)));
    });
  });
}
