import { Biquad, buffer, envelope, LowPass, Osc, RATE, white, type Samples } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const reel = defineSound({
  id: "reel", category: "effects",
  title: { de: "Angelrolle", en: "Fishing reel" },
  description: {
    de: "Eine Angelrolle: Die Schnur wird gegen die Bremse abgezogen und die Ratsche rattert schnell (ein Fisch hat angebissen), oder die Kurbel dreht sich und das Getriebe surrt mit leisen Klicks. Für Angelspiele, Häfen, Teiche und Boote.",
    en: "A fishing reel: the line is pulled out against the drag and the ratchet clicks fast (a fish takes the bait), or the handle turns and the gears whirr with soft clicks as the line winds in. For fishing games, harbours, ponds and boats.",
  },
  params: {
    mode: { type: "choice", options: ["run", "wind"], default: "run", label: { de: "Art", en: "Mode" },
      labels: { run: { de: "Abziehen", en: "Run" }, wind: { de: "Einkurbeln", en: "Wind" } },
      describe: { de: "run: Die Schnur läuft ab, die Ratsche rattert schnell (ein Fisch zieht); wind: Die Kurbel dreht sich, das Getriebe surrt mit langsameren Klicks.", en: "run: the line runs out and the ratchet rattles fast (a fish pulls); wind: the handle turns and the gears whirr with slower clicks." } },
    duration: { type: "number", min: 0.5, max: 2, step: 0.1, default: 1.2, unit: "s", label: { de: "Dauer", en: "Duration" },
      describe: { de: "Wie lange die Schnur läuft oder die Kurbel dreht: 0,5 s ein kurzer Zupfer, 1,2 s üblich, 2 s ein langer Zug.", en: "How long the line runs or the handle turns: 0.5 s a short tug, 1.2 s usual, 2 s a long pull." } },
    speed: { type: "number", min: 0.5, max: 2, step: 0.05, default: 1, label: { de: "Tempo", en: "Speed" },
      describe: { de: "Wie schnell: beim Abziehen etwa 25 · Tempo Klicks pro Sekunde (12 bis 50), beim Einkurbeln etwa 1,5 · Tempo Kurbelumdrehungen pro Sekunde mit je 6 Klicks.", en: "How fast: when running about 25 · speed clicks per second (12 to 50), when winding about 1.5 · speed handle turns per second with 6 clicks each." } },
    size: { type: "number", min: 0, max: 1, step: 0.05, default: 0.4, label: { de: "Größe", en: "Size" },
      describe: { de: "Größe der Rolle: 0 eine kleine Stationärrolle (dünne Klicks um 5 kHz), 0,4 eine Allround-Rolle, 1 eine große Messing-Meeresrolle (schwerere Klicks um 1,5 kHz und ein tieferes Surren).", en: "Size of the reel: 0 a small spinning reel (thin clicks around 5 kHz), 0.4 an all-round reel, 1 a big brass sea reel (heavier clicks around 1.5 kHz and a lower whirr)." } },
  },
  presets: {
    strike: { label: { de: "Biss", en: "Strike" }, values: { mode: "run", speed: 1.6, duration: 1.5 } },
    "wind-in": { label: { de: "Einholen", en: "Wind in" }, values: { mode: "wind", speed: 1, duration: 1.6 } },
    "sea-reel": { label: { de: "Meeresrolle", en: "Sea reel" }, values: { size: 0.9, mode: "run", speed: 0.8 } },
    spinning: { label: { de: "Stationärrolle", en: "Spinning reel" }, values: { size: 0.1, mode: "wind", speed: 1.4 } },
  },
  loop: false, maxSeconds: 2.5,
  build(p, seed) {
    const r = rng(seed), D = p.duration, fade = 0.04, s = buffer(D + fade + 0.06);
    const hz = 5000 * 0.3 ** p.size, decay = 0.0006 + 0.0006 * p.size, run = p.mode === "run";
    // One click of the pawl on the ratchet: a bandpassed tick with a short ping, 2–4 ms, heavier on a big reel
    const click = (at: number, gain: number, soft: number) => {
      const i0 = Math.round(at * RATE), bp = new Biquad("bandpass", hz * (0.95 + 0.1 * r()), 6 - 3 * soft), d = decay * (1 + soft);
      for (let i = 0; i < 0.008 * RATE && i0 + i < s.length; i++) {
        const t = i / RATE;
        s[i0 + i] += (bp.run(white(r) * envelope(t, 0.0002, d)) * 5 + Math.sin(2 * Math.PI * hz * t) * envelope(t, 0.0002, d) * 0.5
          + Math.sin(2 * Math.PI * hz * 0.45 * t) * envelope(t, 0.0003, d * 1.5) * 0.4 * p.size) * gain;
      }
    };
    if (run) {
      // The fish pulls: the click rate rises from 0.6 · rate over 0.2 s and falls back over the last 0.15 s
      const rate = 25 * p.speed;
      for (let t = 0.005; t < D;) {
        click(t, 0.85 + 0.3 * r(), 0);
        const k = 0.6 + 0.4 * Math.min(1, t / 0.2, Math.max(0, (D - t) / 0.15));
        t += (1 + 0.3 * (r() - 0.5)) / (rate * k);
      }
      // The line hissing off the spool, 24 dB below the clicks
      const hp = new Biquad("highpass", 6000, 0.7);
      for (let i = 0; i < D * RATE; i++) s[i] += hp.run(white(r)) * 0.04 * Math.min(1, i / (0.01 * RATE));
    } else {
      // The handle turns: gears whirr at 6 × turns × 40 Hz, swelling once per turn, with 6 soft clicks per turn
      const turns = 1.5 * p.speed, fw = 6 * turns * 40 * (1.2 - 0.5 * p.size), ph = r();
      const parts = [1, 2.01, 2.98, 4.03].map((m, k) => ({ m, a: 1 / (k + 1), o: new Osc(k % 2 ? "triangle" : "saw", r()) }));
      const lp = new Biquad("lowpass", fw * 3, 0.8), soft = new LowPass();
      for (let i = 0; i < D * RATE; i++) {
        const t = i / RATE, swell = 0.8 + 0.2 * Math.sin(2 * Math.PI * (turns * t + ph));
        let x = 0;
        for (const q of parts) x += q.o.next(fw * q.m) * q.a;
        s[i] += soft.run(lp.run(x), fw * 6) * 0.18 * swell * Math.min(1, t / 0.03);
      }
      for (let t = 0.01 + 0.5 / (6 * turns) * r(); t < D; t += (1 + 0.2 * (r() - 0.5)) / (6 * turns)) click(t, 0.7 + 0.3 * r(), 1);
    }
    // The end: a 40 ms raised-cosine fade after the duration, then silence
    for (let i = Math.round(D * RATE); i < s.length; i++) {
      const x = (i / RATE - D) / fade;
      s[i] *= x >= 1 ? 0 : 0.5 + 0.5 * Math.cos(Math.PI * x);
    }
    return s as Samples;
  },
});
