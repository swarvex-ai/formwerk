import { Biquad, buffer, envelope, LOOP_TAIL, Osc, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

// The four partials of a small round sleigh bell as ratios of its tone and their levels: an inharmonic set (a bell is
// not a flute), so a hit reads as bright metal. Each partial rings shorter as it goes up (tau falls with 1/sqrt(ratio));
// ratios above 15 kHz are skipped. The tones come only from the seed, never from a scale, so the jingle has no tune.
const RATIOS = [1, 1.52, 2.17, 2.74], AMP = [1, 0.5, 0.35, 0.2];

export const sleighBells = defineSound({
  id: "sleigh-bells", category: "movement",
  title: { de: "Schellengeläut", en: "Sleigh Bells" },
  description: {
    de: "Das helle, unregelmäßige Klingeln kleiner runder Schellen am Geschirr eines Pferdes als nahtlose Schleife: im Takt seiner Schritte geschüttelt, für Schlitten, Fuhrwerke und Winterbilder. Kein Lied, nur Metall.",
    en: "The bright, irregular jingle of small round bells on a horse's harness as a seamless loop, shaken in the rhythm of its steps, for sleighs, carts and winter scenes. No tune, only metal.",
  },
  params: {
    bells: { type: "integer", min: 3, max: 24, default: 12, label: { de: "Schellen", en: "Bells" },
      describe: { de: "Wie viele Schellen am Geschirr klingeln: 3 ein Katzenhalsband, 12 ein Schlitten, 24 ein Gespann.", en: "How many bells on the harness ring: 3 a cat collar, 12 a sleigh, 24 a team of horses." } },
    pitch: { type: "number", min: 2000, max: 6000, step: 10, default: 3500, unit: "Hz", label: { de: "Grundton", en: "Pitch" },
      describe: { de: "Der Hauptton der Schellen: 2500 Hz große, 3500 Hz übliche, 5500 Hz winzige Schellen; jede Schelle klingt etwas daneben.", en: "The main tone of the bells: 2500 Hz large, 3500 Hz usual, 5500 Hz tiny bells; each bell rings a little off it." } },
    tempo: { type: "number", min: 0.8, max: 4, step: 0.1, default: 2.2, label: { de: "Tempo", en: "Tempo" },
      describe: { de: "Schüttel je Sekunde im Schritt des Pferdes: 1 im Schritt, 2,2 im Trab, 3,5 im Galopp.", en: "Shakes per second in the horse's steps: 1 at a walk, 2.2 at a trot, 3.5 at a gallop." } },
    decay: { type: "number", min: 0.05, max: 0.4, step: 0.01, default: 0.15, unit: "s", label: { de: "Klangdauer", en: "Ring" },
      describe: { de: "Wie lange eine einzelne Schelle nachklingt: 0,08 s winzige, 0,15 s übliche, 0,4 s große und lange Schellen.", en: "How long one bell rings on: 0.08 s tiny, 0.15 s usual, 0.4 s large and long bells." } },
    seconds: { type: "number", min: 4, max: 12, step: 0.5, default: 6, unit: "s", label: { de: "Schleifenlänge", en: "Loop length" },
      describe: { de: "Länge der Schleife: 4 s ist kurz, 6 bis 12 s wiederholen sich unauffälliger.", en: "Length of the loop: 4 s is short, 6 to 12 s repeat less noticeably." } },
    seed: { type: "number", min: 0, max: 99, step: 1, default: 0, label: { de: "Zufall", en: "Variation" },
      describe: { de: "Andere Verteilung von Tönen, Timing und Lautstärke der Schellen: andere Zahl, anderes Läuten.", en: "Another spread of bell tones, timing and level: another number, another jingle." } },
  },
  presets: {
    sleigh: { label: { de: "Schlitten", en: "Sleigh" }, values: { bells: 12, pitch: 3500, tempo: 2.2, decay: 0.15 } },
    team: { label: { de: "Gespann", en: "Team" }, values: { bells: 24, tempo: 3.2, pitch: 4000 } },
    "slow-sleigh": { label: { de: "Langsamer Schlitten", en: "Slow sleigh" }, values: { bells: 6, tempo: 1, decay: 0.25 } },
    collar: { label: { de: "Halsband", en: "Collar" }, values: { bells: 3, tempo: 3.5, pitch: 5500, decay: 0.08 } },
  },
  loop: true, maxSeconds: 12,
  build(p, seed) {
    const r = rng(seed * 100 + p.seed + 1);
    const shakes = Math.max(1, Math.floor(p.seconds * p.tempo));
    const period = Math.round((shakes / p.tempo) * RATE);
    const n = Math.round(LOOP_TAIL * RATE);
    const loop = buffer(period / RATE);
    // One ring lasts only a fraction of a second; write at most that, never more than the whole loop
    const len = Math.min(period, Math.round(p.decay * 1.2 * RATE));
    // The envelope of each partial depends just on its ratio, so compute it once instead of per hit
    const huellen = RATIOS.map((ratio) => {
      const tau = p.decay / 6.9 / Math.sqrt(ratio), e = new Float32Array(len);
      for (let i = 0; i < len; i++) e[i] = envelope(i / RATE, 0.0005, tau);
      return e;
    });
    // One bell of tone f, written cyclically so a ring at the loop end runs on into its start
    const hit = (at: number, f: number, level: number) => {
      const start = ((at % period) + period) % period;
      for (let q = 0; q < RATIOS.length; q++) {
        const fr = f * RATIOS[q];
        if (fr > 15000) continue;
        const o = new Osc("sine", r());
        for (let i = 0; i < len; i++) loop[(start + i) % period] += o.next(fr) * huellen[q][i] * AMP[q] * level;
      }
      // The pellet inside clicking on the shell: one millisecond of high-passed noise at the onset
      const hp = new Biquad("highpass", 4000, 0.7), klick = Math.min(len, Math.round(0.001 * RATE));
      for (let i = 0; i < klick; i++) loop[(start + i) % period] += hp.run(white(r)) * envelope(i / RATE, 0.0004, 0.0004) * level * 0.4;
    };
    // The tone of every bell, only from the seed: never a scale, so there is no melody
    const tones = Array.from({ length: p.bells }, () => p.pitch * (0.8 + 0.4 * r()));
    for (let k = 0; k < shakes; k++) {
      // Half a shake past t = 0, so the seam falls in the gap between the last and the first shake (as in hooves), not
      // on a loud jingle that would click where the loop wraps
      const base = (k + 0.5) / p.tempo + (r() * 2 - 1) * 0.015, accent = k % 2 === 0 ? 1.2 : 1;
      const m = Math.max(2, Math.round(p.bells * (0.4 + 0.3 * r())));
      for (let h = 0; h < m; h++) {
        const at = Math.round((base + r() * 0.04) * RATE), tone = tones[Math.floor(r() * tones.length)];
        hit(at, tone, (0.5 + 0.5 * r()) * accent);
      }
    }
    // The loop plus its tail: the fold of the contract crossfades with equal power, so split the start into sin/cos parts
    const s = buffer(period / RATE + LOOP_TAIL);
    s.set(loop);
    for (let i = 0; i < n; i++) {
      const f = (i / n) * Math.PI / 2;
      s[i] = loop[i] * Math.sin(f);
      s[period + i] = loop[i] * Math.cos(f);
    }
    return s;
  },
});
