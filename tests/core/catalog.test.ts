// The catalogue for agents (catalog.json, llms.txt): complete, serialisable, and every asset in it.
import { describe, expect, it } from "vitest";
import { ASSETS } from "../../src/assets";
import { catalog, llmsTxt, soundFiles, spriteFiles } from "../../src/catalog";
import { fromWav } from "../../src/core/audio";
import { SOUNDS } from "../../src/sounds";
import { SURFACES } from "../../src/surfaces";
import { SPRITES } from "../../src/sprites";

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
  it("lists every surface with parameters, presets, tile size and maps", () => {
    expect(k.surfaces.map((f) => f.id)).toEqual(SURFACES.map((f) => f.id));
    for (const f of k.surfaces) {
      expect(Object.values(f.params).every((p) => p.describe.en.length > 0)).toBe(true);
      expect(Object.keys(f.presets).length).toBeGreaterThanOrEqual(2);
      expect(f.tileMetres).toBeGreaterThan(0);
      expect(f.maps).toEqual(["color", "normal", "roughness", "metalness", "height"]);
    }
  });
  it("lists every sprite with its animations and files", () => {
    expect(k.sprites.map((s) => s.id)).toEqual(SPRITES.map((s) => s.id));
    const dateien = new Set(spriteFiles().map((f) => `https://example.test/${f.path}`));
    for (const s of k.sprites) {
      for (const f of [s.files, ...Object.values(s.presets).map((p) => p.files)]) for (const u of Object.values(f)) expect(dateien.has(u), u).toBe(true);
      expect(s.animations.length).toBeGreaterThan(0);
    }
  });
  it("llms.txt names every function and parameter", () => {
    const t = llmsTxt(k);
    for (const a of [...k.models, ...k.surfaces, ...k.sprites, ...k.sounds]) {
      expect(t).toContain(`### ${a.function}()`);
      for (const p of Object.keys(a.params)) expect(t).toContain(`\`${p}\``);
    }
  });
});
