import { Biquad, buffer, envelope, LowPass, LOOP_TAIL, Osc, RATE, semitones, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const ticking = defineSound({
  id: "ticking", category: "ambience",
  title: { de: "Ticken", en: "Ticking" },
  description: {
    de: "Das gleichmäßige Tick und Tack einer Uhr als nahtlose Schleife: knackige Hemmungsklicks mit einem kurzen Klang des Gehäuses und ein leiser Raumton dazwischen. 1 Hz ist eine Standuhr, 2 Hz eine Wanduhr, 5 Hz eine Taschenuhr.",
    en: "The steady tick and tock of a clock as a seamless loop: crisp escapement clicks with a short ring of the case, and a faint room tone in between. 1 Hz is a longcase clock, 2 Hz a wall clock, 5 Hz a pocket watch.",
  },
  params: {
    rate: { type: "number", min: 1, max: 6, step: 0.5, default: 2, unit: "Hz", label: { de: "Geschwindigkeit", en: "Rate" },
      describe: { de: "Tick pro Sekunde: 1 eine Standuhr, 2 eine Wanduhr, 5 eine Taschenuhr.", en: "Ticks per second: 1 a longcase clock, 2 a wall clock, 5 a pocket watch." } },
    size: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Größe", en: "Size" },
      describe: { de: "Die Größe der Uhr und ihres Gehäuses: 0 eine kleine Uhr (hell, kurz), 0,5 eine Wanduhr, 1 eine Standuhr im Holzgehäuse (dumpf, klingt lange nach).", en: "The size of the clock and its case: 0 a small watch (bright, short), 0.5 a wall clock, 1 a longcase in a wooden case (dull, ringing longer)." } },
    tock: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Tack", en: "Tock" },
      describe: { de: "Wie sehr der zweite Schlag (Tack) anders klingt: 0 gleich, 1 drei Halbtöne tiefer und 30 % leiser.", en: "How different the second tick (tock) is: 0 the same, 1 three semitones lower and 30 % softer." } },
    room: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Raumton", en: "Room tone" },
      describe: { de: "Der leise Raumton zwischen den Schlägen: 0 sehr leise, 1 ein hörbares Brummen des Raums.", en: "The faint room tone between the ticks: 0 very quiet, 1 an audible hum of the room." } },
    seconds: { type: "number", min: 2, max: 12, step: 1, default: 6, unit: "s", label: { de: "Schleifenlänge", en: "Loop length" },
      describe: { de: "Länge der Schleife: 2 s ist kurz, 6 bis 12 s wiederholen sich unauffälliger.", en: "Length of the loop: 2 s is short, 6 to 12 s repeat less noticeably." } },
  },
  presets: {
    watch: { label: { de: "Taschenuhr", en: "Pocket watch" }, values: { rate: 5, size: 0 } },
    mantel: { label: { de: "Kaminuhr", en: "Mantel clock" }, values: { rate: 2, size: 0.4 } },
    longcase: { label: { de: "Standuhr", en: "Longcase clock" }, values: { rate: 1, size: 1, tock: 0.7 } },
  },
  loop: true, maxSeconds: 12,
  build(p, seed) {
    const r = rng(seed), laenge = p.seconds + LOOP_TAIL, s = buffer(laenge);
    // A whole number of tick pairs per loop, so tick and tock keep alternating at the seam
    const paare = Math.max(1, Math.round(p.seconds * p.rate / 2)), interval = p.seconds / (2 * paare);
    // The faint room tone under everything, always on so the loop stays audible
    const tief = new LowPass(), tiefer = new LowPass();
    for (let i = 0; i < s.length; i++) s[i] = tiefer.run(tief.run(white(r), 400), 800) * (0.1 + 0.2 * p.room);
    // Per event: a shift of at most ±2 ms and a level within ±1 dB; events past the seam reuse those of the start
    const n = 2 * paare, zufall = Array.from({ length: n }, () => ({
      at: 0.002 * (2 * r() - 1), laut: 10 ** ((1 * (2 * r() - 1)) / 20),
    }));
    const ton = (at: number, dauer: number, x: (t: number) => number) => {
      const start = Math.round(at * RATE);
      for (let i = Math.max(0, -start); i < dauer * RATE && start + i < s.length; i++) s[start + i] += x(i / RATE);
    };
    const ab = 0.012 + 0.01 * p.size;
    const ringDauer = 6 * (0.02 + 0.02 * p.size), ringDecay = 0.02 + 0.02 * p.size;
    // Offset the grid so the loop boundary falls in a quiet gap when there is one, keeping the seam robust for every random shift
    const delta = interval - ringDauer - ab > 0.013 ? 0.01 : 0;
    // One click: a bright burst plus the ring of the case, new filter and oscillator objects per click
    const klick = (at: number, body: number, hell: number, laut: number) => {
      const bp = new Biquad("bandpass", hell, 3), g = laut * 3;
      ton(at, 0.01, (t) => bp.run(white(r)) * envelope(t, 0.0002, 0.0015) * g);
      const a = new Osc("sine", 0.6), b = new Osc("sine", 0.25);
      ton(at, ringDauer, (t) => {
        const e = envelope(t, 0.0005, ringDecay);
        return (a.next(body) * 0.6 + b.next(2.7 * body) * 0.25) * e * laut;
      });
    };
    for (let k = -1; k * interval < laenge; k++) {
      const z = zufall[((k % n) + n) % n], t0 = delta + k * interval;
      const tack = k % 2 === 1, hoch = tack ? semitones(1, -3 * p.tock) : 1;
      const body = (1400 - 950 * p.size) * hoch, hell = (5200 - 3400 * p.size) * hoch;
      const laut = z.laut * (tack ? 1 - 0.3 * p.tock : 1), ab = 0.012 + 0.01 * p.size;
      klick(t0 + z.at, body, hell, laut);
      // The escapement's drop and lock: a softer second click a short while after the main one
      klick(t0 + z.at + ab, body, hell, laut * 0.45);
    }
    return s;
  },
});
