import { Biquad, buffer, envelope, LowPass, LOOP_TAIL, Osc, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const loom = defineSound({
  id: "loom", category: "ambience",
  title: { de: "Webstuhl", en: "Loom" },
  description: {
    de: "Ein Handwebstuhl bei der Arbeit als nahtlose Schleife: bei jedem Schuss der dumpfe Holzschlag des Tritts mit einem kurzen Knarren, der luftige Wurf des Schiffchens, das mit einem hellen Holzklacken gefangen wird, und der schwere Schlag der Lade mit einem leisen Klirren des Webblatts.",
    en: "A hand loom at work as a seamless loop: with every pick the dull wooden clunk of the treadle with a short creak, the airy throw of the shuttle caught with a bright wooden clack, and the heavy thump of the beater with a light rattle of the reed.",
  },
  params: {
    tempo: { type: "number", min: 0.8, max: 2.5, step: 0.05, default: 1.4, unit: "s", label: { de: "Takt", en: "Tempo" },
      describe: { de: "Dauer eines Schusses (Tritt, Schiffchen, Lade): 0,8 s zügig, 1,4 s gleichmäßig, 2,5 s langsam und sorgfältig.", en: "Length of one pick (treadle, shuttle, beater): 0.8 s brisk, 1.4 s steady, 2.5 s slow and careful." } },
    beat: { type: "number", min: 0, max: 1, step: 0.05, default: 0.6, label: { de: "Lade", en: "Beat" },
      describe: { de: "Der schwere Schlag der Lade (um 80 bis 200 Hz, 40 bis 80 ms) mit dem leisen Klirren des Webblatts (Rauschen um 3 bis 6 kHz), bei 0,6 des Schusses: 0 keiner, 0,6 fest, 1 schwer.", en: "The heavy thump of the beater (around 80 to 200 Hz, 40 to 80 ms) with the light rattle of the reed (noise around 3 to 6 kHz), at 0.6 of the pick: 0 none, 0.6 firm, 1 heavy." } },
    shuttle: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Schiffchen", en: "Shuttle" },
      describe: { de: "Der luftige Wurf des Schiffchens (Rauschen um 1,5 bis 3 kHz, etwa 90 ms) und das helle Holzklacken, wenn es gefangen wird (2 bis 4 kHz), bei 0,25 des Schusses: 0 keines, 0,5 deutlich, 1 laut.", en: "The airy throw of the shuttle (noise around 1.5 to 3 kHz, about 90 ms) and the bright wooden clack as it is caught (2 to 4 kHz), at 0.25 of the pick: 0 none, 0.5 clear, 1 loud." } },
    treadle: { type: "number", min: 0, max: 1, step: 0.05, default: 0.4, label: { de: "Tritt", en: "Treadle" },
      describe: { de: "Der dumpfe Holzschlag des Tritts zu Beginn jedes Schusses (um 120 bis 300 Hz, 30 bis 60 ms) und ein kurzes Knarren gleich danach (Rauschen um 600 bis 1200 Hz): 0 keiner, 0,4 leise, 1 deutlich.", en: "The dull wooden clunk of the treadle at the start of every pick (around 120 to 300 Hz, 30 to 60 ms) and a short creak right after it (noise around 600 to 1200 Hz): 0 none, 0.4 soft, 1 clear." } },
    seconds: { type: "number", min: 4, max: 12, step: 1, default: 8, unit: "s", label: { de: "Schleifenlänge", en: "Loop length" },
      describe: { de: "Länge der Schleife: 4 s ist klein, 8 bis 12 s wiederholen sich unauffälliger.", en: "Length of the loop: 4 s is small, 8 to 12 s repeat less noticeably." } },
  },
  presets: {
    cottage: { label: { de: "Häuschen", en: "Cottage" }, values: { tempo: 1.6, beat: 0.5 } },
    workshop: { label: { de: "Werkstatt", en: "Workshop" }, values: { tempo: 0.9, beat: 0.9, treadle: 0.7 } },
    gentle: { label: { de: "Behutsam", en: "Gentle" }, values: { tempo: 2.2, beat: 0.3, shuttle: 0.3 } },
  },
  loop: true, maxSeconds: 12,
  build(p, seed) {
    const r = rng(seed), laenge = p.seconds + LOOP_TAIL, s = buffer(laenge);
    // A whole number of picks per loop, so the events line up at the seam
    const picks = Math.max(1, Math.round(p.seconds / p.tempo)), pick = p.seconds / picks;
    // The faint wooden room tone, always on so the loop stays audible
    const tief = new LowPass(), tiefer = new LowPass();
    for (let i = 0; i < s.length; i++) s[i] = tiefer.run(tief.run(white(r), 100), 200) * 1.2;
    // Per pick and event: a shift of at most ±5 % of the event's offset in the pick (a quarter pick for the treadle)
    // and a level within ±1.5 dB; picks past the seam reuse those of the loop's start, so the tail folds in cleanly
    const lage = [0.25, 0.25, 0.6], ab = [0, 0.25, 0.6];
    const zufall = Array.from({ length: picks }, () => ab.map((a, e) => ({
      at: (a + lage[e] * 0.05 * (2 * r() - 1)) * pick, laut: 10 ** ((1.5 * (2 * r() - 1)) / 20),
    })));
    const ton = (at: number, dauer: number, x: (t: number) => number) => {
      const start = Math.round(at * RATE);
      for (let i = Math.max(0, -start); i < dauer * RATE && start + i < s.length; i++) s[start + i] += x(i / RATE);
    };
    for (let k = -1; k * pick < laenge; k++) {
      const [tr, sh, be] = zufall[((k % picks) + picks) % picks], t0 = k * pick;
      // Treadle: a dull wooden clunk around 150-270 Hz, then a short creak around 900 Hz 30 ms later
      if (p.treadle > 0) {
        const a = new Osc("sine", 0.25), b = new Osc("sine", 0.6), g = p.treadle * 0.32 * tr.laut;
        ton(t0 + tr.at, 0.3, (t) => (a.next(150) * envelope(t, 0.002, 0.045) + b.next(270) * envelope(t, 0.001, 0.03) * 0.5) * g);
        const bp = new Biquad("bandpass", 900, 3);
        ton(t0 + tr.at + 0.03, 0.08, (t) => bp.run(white(r)) * Math.sin((Math.PI * t) / 0.08) ** 2 * g * 1.2);
      }
      // Shuttle: an airy throw around 2.2 kHz over 90 ms, rising then falling, caught with a wooden clack around 3 kHz
      if (p.shuttle > 0) {
        const bp = new Biquad("bandpass", 2200, 1.5), g = p.shuttle * sh.laut, wurf = 0.09;
        ton(t0 + sh.at, wurf, (t) => bp.run(white(r)) * Math.sin((Math.PI * t) / wurf) ** 2 * g * 0.5);
        // The clack: a sharp 1 ms tick of the wood, then the 5 ms body of the catch
        const kl = new Biquad("bandpass", 3000, 2), c = new Osc("sine", 0.1), d = new Osc("sine", 0.25);
        ton(t0 + sh.at + wurf, 0.06, (t) => ((kl.run(white(r)) * 1.5 + c.next(2700) * 0.8) * envelope(t, 0.0003, 0.005)
          + d.next(3400) * envelope(t, 0.0001, 0.001) * 2.5) * g);
      }
      // Beater: a heavy thump around 90-180 Hz, 75 ms, with a light rattle of the reed around 4.5 kHz
      if (p.beat > 0) {
        const a = new Osc("sine", 0.25), b = new Osc("sine", 0.4), g = p.beat * 2.2 * be.laut;
        ton(t0 + be.at, 0.4, (t) => (a.next(95) * envelope(t, 0.003, 0.075) + b.next(180) * envelope(t, 0.002, 0.04) * 0.35) * g);
        const bp = new Biquad("bandpass", 4500, 2.5);
        ton(t0 + be.at, 0.1, (t) => bp.run(white(r)) * envelope(t, 0.001, 0.02) * g * 0.04);
      }
    }
    return s;
  },
});
