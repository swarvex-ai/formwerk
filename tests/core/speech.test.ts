// The finish of the speech package without the model: Kokoro speaks at 24 kHz, the upsampling to 48 kHz must keep the
// tone and add no mirror image above it, and the finished line is a Formwerk sound (−1 dBFS, clean edges). Whether the
// speech is understandable checks tests/speech/quality.mjs with Whisper on a developer machine.
import { describe, expect, it } from "vitest";
import { metrics, PEAK, RATE } from "../../src/core/audio";
import { finish, trim, upsample2, VOICES } from "../../speech/src";

const ton = (hz: number, rate: number, sekunden: number) => Float32Array.from({ length: Math.round(rate * sekunden) }, (_, i) => 0.5 * Math.sin((2 * Math.PI * hz * i) / rate));
/** Level of one frequency in a signal (Goertzel), as amplitude. */
const pegel = (s: Float32Array, hz: number, rate: number) => {
  const k = (2 * Math.PI * hz) / rate, c = 2 * Math.cos(k);
  let a = 0, b = 0;
  for (const x of s) { const y = x + c * a - b; b = a; a = y; }
  return Math.sqrt(a * a + b * b - c * a * b) / (s.length / 2);
};

describe("speech finish", () => {
  it("upsampling keeps a 3 kHz tone and leaves almost nothing of its mirror at 21 kHz", () => {
    const x = upsample2(ton(3000, RATE / 2, 0.5)), mitte = x.subarray(2000, x.length - 2000);
    expect(x.length).toBe(RATE / 2);
    expect(pegel(mitte, 3000, RATE)).toBeGreaterThan(0.45);
    expect(pegel(mitte, 21000, RATE)).toBeLessThan(0.005); // below −40 dB of the tone
  });
  it("a finished line is at −1 dBFS and starts and ends at zero", () => {
    const m = metrics(finish(ton(220, RATE / 2, 1), RATE / 2));
    expect(m.peak).toBeCloseTo(PEAK, 3);
    expect(Math.abs(m.first) + Math.abs(m.last)).toBeLessThan(0.01);
    expect(m.seconds).toBeCloseTo(1, 2);
  });
  it("trims silence before and after the voice to 30 ms", () => {
    const s = new Float32Array(RATE) as Float32Array<ArrayBuffer>;
    s.set(ton(300, RATE, 0.2), RATE / 2);
    const t = trim(s);
    expect(t.length / RATE).toBeCloseTo(0.2 + 0.06, 2);
  });
  it("filters rumble below 60 Hz out of a line", () => {
    const x = Float32Array.from(ton(220, RATE / 2, 1), (v, i) => v + 0.3 * Math.sin((2 * Math.PI * 20 * i) / (RATE / 2)));
    const f = finish(x, RATE / 2), mitte = f.subarray(RATE / 4, (3 * RATE) / 4);
    expect(pegel(mitte, 20, RATE) / pegel(mitte, 220, RATE)).toBeLessThan(0.15);
  });
  it("offers voices with texts in both languages", () => {
    for (const v of Object.values(VOICES)) { expect(v.de.length).toBeGreaterThan(5); expect(v.en.length).toBeGreaterThan(5); }
  });
});
