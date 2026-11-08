import { Biquad, buffer, envelope, LowPass, RATE, smooth, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

// Resonances of what creaks: a wooden door or floorboard, a metal hinge
const KOERPER = { wood: [[420, 6], [980, 8], [2100, 5]], metal: [[1700, 25], [3300, 30], [5200, 20]] } as const;

export const creak = defineSound({
  id: "creak", category: "movement",
  title: { de: "Knarzen", en: "Creak" },
  description: {
    de: "Eine Tür, die knarrt, ein Scharnier, das quietscht, eine Diele unter dem Fuß; auf Wunsch fällt die Tür zum Schluss ins Schloss.",
    en: "A door that creaks, a hinge that squeaks, a floorboard underfoot; if you like, the door shuts at the end.",
  },
  params: {
    pitch: { type: "number", min: 30, max: 300, step: 1, default: 80, unit: "Hz", label: { de: "Rate", en: "Rate" },
      describe: { de: "Wie schnell das Holz ruckt: 40 Hz ein langsames Knarzen, 80 Hz eine Tür, 220 Hz ein quietschendes Scharnier.", en: "How fast the wood sticks and slips: 40 Hz a slow creak, 80 Hz a door, 220 Hz a squeaking hinge." } },
    length: { type: "number", min: 0.3, max: 1.2, step: 0.05, default: 0.8, unit: "s", label: { de: "Länge", en: "Length" },
      describe: { de: "Dauer: 0,4 s ein kurzes Knarren, 0,8 s eine Tür, die aufgeht, 1,2 s ganz langsam.", en: "Duration: 0.4 s a short creak, 0.8 s a door swinging open, 1.2 s very slow." } },
    bend: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Schwanken", en: "Bend" },
      describe: { de: "Wie sehr die Höhe schwankt: 0 gleichmäßig, 0,5 lebendig, 1 jammernd wie in einem Spukhaus.", en: "How much the pitch wanders: 0 steady, 0.5 lively, 1 moaning like a haunted house." } },
    body: { type: "choice", options: ["wood", "metal"], default: "wood", label: { de: "Material", en: "Material" },
      labels: { wood: { de: "Holz", en: "Wood" }, metal: { de: "Metall", en: "Metal" } },
      describe: { de: "Holz knarzt warm und tief, Metall quietscht hell.", en: "Wood creaks warm and low, metal squeaks bright." } },
    slam: { type: "boolean", default: false, label: { de: "Zufallen", en: "Slam" },
      describe: { de: "Zum Schluss fällt die Tür mit einem dumpfen Schlag zu.", en: "At the end the door shuts with a dull thud." } },
  },
  presets: {
    door: { label: { de: "Tür", en: "Door" }, values: { pitch: 80, length: 0.9, bend: 0.6, body: "wood" } },
    hinge: { label: { de: "Scharnier", en: "Hinge" }, values: { pitch: 220, length: 0.5, bend: 0.3, body: "metal" } },
    floorboard: { label: { de: "Diele", en: "Floorboard" }, values: { pitch: 45, length: 0.4, bend: 0.2 } },
    "door-shut": { label: { de: "Tür fällt zu", en: "Door shuts" }, values: { length: 0.5, bend: 0.4, slam: true } },
  },
  loop: false, maxSeconds: 1.5,
  build(p, seed) {
    const r = rng(seed), knall = p.slam ? 0.22 : 0, s = buffer(p.length + knall + 0.06);
    const wandern = smooth(r, p.length + 0.1, 0.12 + 0.2 * (1 - p.bend)), filter = KOERPER[p.body as keyof typeof KOERPER].map(([f, q]) => new Biquad("bandpass", f, q));
    // Stick and slip: a train of tiny jolts whose rate wanders, swelling in and out
    let phase = 0;
    for (let i = 0; i < p.length * RATE; i++) {
      const t = i / RATE, x = t / p.length, rate = p.pitch * (1 + p.bend * 0.9 * (wandern(t) - 0.5)) * (1 + (r() - 0.5) * 0.04);
      phase += rate / RATE;
      let ruck = 0;
      if (phase >= 1) { phase -= 1; ruck = 0.6 + 0.4 * r(); }
      const huelle = Math.sin(Math.PI * x) ** 0.6;
      const reiz = ruck + white(r) * 0.03;
      let y = 0;
      filter.forEach((f, k) => { y += f.run(reiz) / (k + 1); });
      s[i] += y * huelle * (p.body === "metal" ? 4 : 2.5);
    }
    if (p.slam) {
      // The door meets the frame: a low thump with a short rattle
      const at = Math.round(p.length * RATE), lp = new LowPass();
      for (let i = 0; at + i < s.length; i++) {
        const t = i / RATE;
        s[at + i] += (Math.sin(2 * Math.PI * 65 * t) * envelope(t, 0.002, 0.05) * 0.9 + lp.run(white(r), 900) * envelope(t, 0.001, 0.025) * 1.5);
      }
    }
    return s;
  },
});
