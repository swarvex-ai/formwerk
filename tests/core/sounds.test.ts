// Every sound, at its defaults, its extremes, its presets and random values: valid schema, within its length budget,
// finite, at −1 dBFS, no DC, no click at the edges (one-shots) or the seam (loops), not silent, decaying on its own,
// and the same samples for the same values and seed. Its reference spectrogram is checked by tests/scene/sounds.mjs.
import { describe, expect, it } from "vitest";
import { only } from "../only.mjs";
import { ASSETS } from "../../src/assets";
import { fromWav, metrics, PEAK, RATE, toWav } from "../../src/core/audio";
import { extremes, presetProblems, random, schemaProblems } from "../../src/core/params";
import { rng } from "../../src/core/rng";
import { makeSound, SOUND_CATEGORIES } from "../../src/sounds/define";
import { SOUNDS } from "../../src/sounds";

// Upper limits per category in seconds (the lead changes these, not a single sound)
const GRENZE = { ui: 4, impact: 4, movement: 1.5, effects: 2.5, voice: 4, ambience: 12 } as const;

describe("sound catalogue", () => {
  it("ids are unique across models and sounds, kebab-case, with texts in German and English", () => {
    const ids = [...ASSETS.map((a) => a.id), ...SOUNDS.map((s) => s.id)];
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of SOUNDS) {
      expect(s.id).toMatch(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/);
      expect(SOUND_CATEGORIES).toContain(s.category);
      for (const t of [s.title, s.description]) { expect(t.de.trim()).not.toBe(""); expect(t.en.trim()).not.toBe(""); }
      expect(schemaProblems(s.params), s.id).toEqual([]);
      expect(presetProblems(s.params, s.presets), s.id).toEqual([]);
      expect(Object.keys(s.presets).length, `${s.id}: at least two presets`).toBeGreaterThanOrEqual(2);
      expect(Object.keys(s.params).length, `${s.id}: a sound is parametric`).toBeGreaterThanOrEqual(3);
      expect(s.maxSeconds, `${s.id}: budget within the category limit`).toBeLessThanOrEqual(GRENZE[s.category]);
    }
  });
  it("WAV files keep the samples (16 bit, 48 kHz mono)", () => {
    const s = makeSound(SOUNDS[0]).samples, zurueck = fromWav(toWav(s));
    expect(zurueck.rate).toBe(RATE);
    expect(zurueck.samples.length).toBe(s.length);
    expect(Math.max(...zurueck.samples.map((x, i) => Math.abs(x - s[i])))).toBeLessThan(1e-4);
  });
});

for (const s of only(SOUNDS)) {
  describe(s.id, () => {
    const r = rng(42);
    const faelle = [...extremes(s.params), ...Object.keys(s.presets).map((preset) => ({ preset })), ...Array.from({ length: 8 }, () => random(s.params, r))];
    it(`is clean and within budget at ${faelle.length} parameter sets`, () => {
      for (const [i, werte] of faelle.entries()) {
        const { samples } = makeSound(s, werte, 1 + i), m = metrics(samples), was = `${s.id} ${JSON.stringify(werte)}`;
        expect(samples.every(Number.isFinite), `${was}: finite`).toBe(true);
        expect(m.seconds, `${was}: length`).toBeLessThanOrEqual(s.maxSeconds);
        expect(m.seconds, `${was}: length`).toBeGreaterThan(0.005);
        expect(m.peak, `${was}: peak at −1 dBFS`).toBeLessThanOrEqual(PEAK + 1e-6);
        expect(m.peak, `${was}: not silent`).toBeGreaterThan(PEAK * 0.99);
        expect(m.rmsDb, `${was}: loud enough to hear`).toBeGreaterThan(-35);
        expect(Math.abs(m.dc), `${was}: no DC offset`).toBeLessThan(0.005);
        if (s.loop) expect(m.seam, `${was}: seamless loop (the step at the seam like any other step)`).toBeLessThan(4);
        else {
          expect(Math.abs(m.first) + Math.abs(m.last), `${was}: starts and ends at zero`).toBeLessThan(0.01);
          expect(m.endDb, `${was}: decays on its own (the last 50 ms at least 10 dB below the loudest)`).toBeLessThan(-10);
        }
      }
    });
    it("is deterministic: same values and seed, same samples", () => {
      const w = random(s.params, rng(7));
      expect(makeSound(s, w, 3).samples).toEqual(makeSound(s, w, 3).samples);
    });
  });
}
