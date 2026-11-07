import { describe, expect, it } from "vitest";
import { clean, defaults, extremes, random, schemaProblems, type Schema } from "../../src/core/params";
import { rng } from "../../src/core/rng";

const s = {
  breite: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.2, max: 1, step: 0.05, default: 0.5 },
  beine: { type: "integer", label: { de: "Beine", en: "Legs" }, min: 3, max: 6, default: 4 },
  form: { type: "choice", label: { de: "Form", en: "Shape" }, options: ["rund", "eckig"], default: "rund" },
  farbe: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#112233" },
  lehne: { type: "boolean", label: { de: "Lehne", en: "Back" }, default: true },
} as const satisfies Schema;

describe("parameters", () => {
  it("clean() turns any input into valid values", () => {
    expect(clean(s, {})).toEqual(defaults(s));
    expect(clean(s, { breite: "7", beine: 2.6, form: "dreieckig", farbe: "rot", lehne: "0", fremd: 1 }))
      .toEqual({ breite: 1, beine: 3, form: "rund", farbe: "#112233", lehne: false });
    expect(clean(s, { breite: 0.43 }).breite).toBe(0.45);
  });
  it("extremes() covers minimum, maximum and every option", () => {
    const f = extremes(s);
    expect(f.some((v) => v.breite === 0.2 && v.beine === 3)).toBe(true);
    expect(f.some((v) => v.breite === 1 && v.beine === 6)).toBe(true);
    expect(f.some((v) => v.form === "eckig")).toBe(true);
    expect(f.some((v) => v.lehne === false)).toBe(true);
  });
  it("random() is valid and reproducible", () => {
    const a = random(s, rng(5)), b = random(s, rng(5));
    expect(a).toEqual(b);
    expect(clean(s, a)).toEqual(a);
  });
  it("schemaProblems() finds broken schemas", () => {
    expect(schemaProblems(s)).toEqual([]);
    expect(schemaProblems({ X: { type: "number", label: { de: "", en: "x" }, min: 2, max: 1, step: 0, default: 5 } })).toHaveLength(4);
  });
});
