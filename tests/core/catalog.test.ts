// The catalogue for agents (catalog.json, llms.txt): complete, serialisable, and every asset in it.
import { describe, expect, it } from "vitest";
import { ASSETS } from "../../src/assets";
import { catalog, llmsTxt } from "../../src/catalog";

describe("catalogue for agents", () => {
  const k = catalog("https://example.test");
  it("lists every asset with parameters, presets, physics and its size at the defaults", () => {
    expect(k.assets.map((a) => a.id)).toEqual(ASSETS.map((a) => a.id));
    for (const a of k.assets) {
      expect(Object.values(a.params).every((p) => p.describe.en.length > 0)).toBe(true);
      expect(Object.keys(a.presets).length).toBeGreaterThanOrEqual(2);
      expect(a.atDefaults.massKg).toBeGreaterThan(0);
      expect(a.atDefaults.size.height).toBeGreaterThan(0);
      expect(a.gallery).toBe(`https://example.test/#${a.id}`);
    }
    expect(JSON.parse(JSON.stringify(k))).toEqual(k);
  });
  it("llms.txt names every asset function and parameter", () => {
    const t = llmsTxt(k);
    for (const a of k.assets) {
      expect(t).toContain(`### ${a.function}()`);
      for (const p of Object.keys(a.params)) expect(t).toContain(`\`${p}\``);
    }
  });
});
