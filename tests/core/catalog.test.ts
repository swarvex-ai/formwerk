// The catalogue for agents (catalog.json, llms.txt): complete, serialisable, and every asset in it.
import { describe, expect, it } from "vitest";
import { ASSETS } from "../../src/assets";
import { catalog, llmsTxt, soundFiles } from "../../src/catalog";
import { fromWav } from "../../src/core/audio";
import { SOUNDS } from "../../src/sounds";

describe("catalogue for agents", () => {
  const k = catalog("https://example.test");
  it("lists every model with parameters, presets, physics and its size at the defaults", () => {
    expect(k.models.map((a) => a.id)).toEqual(ASSETS.map((a) => a.id));
    for (const a of k.models) {
      expect(Object.values(a.params).every((p) => p.describe.en.length > 0)).toBe(true);
      expect(Object.keys(a.presets).length).toBeGreaterThanOrEqual(2);
      expect(a.atDefaults.massKg).toBeGreaterThan(0);
      expect(a.atDefaults.size.height).toBeGreaterThan(0);
      expect(a.gallery).toBe(`https://example.test/#${a.id}`);
    }
    expect(JSON.parse(JSON.stringify(k))).toEqual(k);
  });
  it("lists every sound with parameters, presets and its files", () => {
    expect(k.sounds.map((s) => s.id)).toEqual(SOUNDS.map((s) => s.id));
    const dateien = new Set(soundFiles().map((f) => `https://example.test/${f.path}`));
    for (const s of k.sounds) {
      expect(Object.values(s.params).every((p) => p.describe.en.length > 0)).toBe(true);
      expect(dateien.has(s.file), s.file).toBe(true);
      for (const p of Object.values(s.presets)) expect(dateien.has(p.file), p.file).toBe(true);
      expect(s.atDefaults.seconds).toBeGreaterThan(0);
    }
    for (const f of soundFiles()) expect(fromWav(f.bytes).samples.length, f.path).toBeGreaterThan(100);
  });
  it("llms.txt names every function and parameter", () => {
    const t = llmsTxt(k);
    for (const a of [...k.models, ...k.sounds]) {
      expect(t).toContain(`### ${a.function}()`);
      for (const p of Object.keys(a.params)) expect(t).toContain(`\`${p}\``);
    }
  });
});
