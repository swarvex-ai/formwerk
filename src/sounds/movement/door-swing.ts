import { Biquad, buffer, envelope, grains, LowPass, Osc, RATE, smooth, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

// Resonances of what swings: a wooden door in its frame, an iron gate
const KOERPER = { wood: [[420, 6], [980, 8], [2100, 5]], metal: [[1700, 25], [3300, 30], [5200, 20]] } as const;
const SCHWUNG = { open: 0.55, close: 0.45, slam: 0.22 } as const;

export const doorSwing = defineSound({
  id: "door-swing", category: "movement",
  title: { de: "Tür auf und zu", en: "Door swing" },
  description: {
    de: "Eine Tür, die aufgeht oder zufällt: der Schnapper klickt, die Scharniere knarren im Schwung, und beim Zuschlagen schlägt sie dumpf ins Schloss.",
    en: "A door swinging open or shut: the latch clicks, the hinges creak through the swing, and on a slam it strikes home with a dull thud.",
  },
  params: {
    action: { type: "choice", options: ["open", "close", "slam"], default: "open", label: { de: "Aktion", en: "Action" },
      labels: { open: { de: "Öffnen", en: "Open" }, close: { de: "Schließen", en: "Close" }, slam: { de: "Zuschlagen", en: "Slam" } },
      describe: { de: "Öffnen: der Schnapper, ein langsames knarzendes Aufschwingen, leise abgefangen; Schließen: Schwung mit dumpfem Zuschlagen; Zuschlagen: schneller Schwung, harter Schlag, der Rahmen klappert nach.", en: "Open: the latch, a slow creaking swing, softly caught; close: a swing with a dull thud; slam: a fast swing, a hard strike, the frame rattles after." } },
    weight: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Gewicht", en: "Weight" },
      describe: { de: "Wie schwer die Tür ist: 0,2 eine leichte Schranktür, 0,5 eine Zimmertür, 1 ein Eichentor; eine schwere knarrt und schlägt tiefer und länger.", en: "How heavy the door is: 0.2 a light cupboard door, 0.5 an interior door, 1 an oak gate; a heavy one creaks and thuds lower and longer." } },
    creak: { type: "number", min: 0, max: 1, step: 0.05, default: 0.6, label: { de: "Knarren", en: "Creak" },
      describe: { de: "Wie sehr das Scharnier im Schwung knarrt: 0 nur die ziehende Luft, 0,5 eine gewöhnliche Tür, 1 ein rostiges Tor.", en: "How much the hinge creaks through the swing: 0 only the moving air, 0.5 an ordinary door, 1 a rusty gate." } },
    material: { type: "choice", options: ["wood", "metal"], default: "wood", label: { de: "Material", en: "Material" },
      labels: { wood: { de: "Holz", en: "Wood" }, metal: { de: "Metall", en: "Metal" } },
      describe: { de: "Holz knarrt warm und schlägt dumpf aus; Metall quietscht hell und schlägt kürzer und heller mit kurzem Nachklingen.", en: "Wood creaks warm and thuds dull; metal squeaks bright and strikes shorter and brighter with a brief ring." } },
  },
  presets: {
    "wooden-open": { label: { de: "Holztür öffnen", en: "Open a wooden door" }, values: { action: "open", weight: 0.35, creak: 0.7, material: "wood" } },
    "heavy-slam": { label: { de: "Schwer zuschlagen", en: "Heavy slam" }, values: { action: "slam", weight: 0.9, creak: 0.3, material: "wood" } },
    "iron-gate": { label: { de: "Eisernes Tor", en: "Iron gate" }, values: { action: "close", weight: 0.85, creak: 0.95, material: "metal" } },
  },
  loop: false, maxSeconds: 1.1,
  build(p, seed) {
    const r = rng(seed), offen = p.action === "open", schwung = SCHWUNG[p.action], von = Math.round(0.04 * RATE);
    const s = buffer(0.04 + schwung + 0.45), schwer = 1 - 0.3 * p.weight, tiefer = 1 - 0.25 * p.weight;
    // The latch: a small bright click over a short wooden clack
    const klick = (at: number, amp: number) => {
      const a = Math.round(at * RATE), bp = new Biquad("bandpass", 2400 + 1600 * r(), 1.5), lp = new LowPass();
      for (let i = 0; i < 0.025 * RATE && a + i < s.length; i++) {
        const t = i / RATE;
        s[a + i] += bp.run(white(r)) * envelope(t, 0.0004, 0.0012) * amp + lp.run(white(r), 800) * envelope(t, 0.001, 0.004) * amp * 0.6;
      }
    };
    klick(0.012, 0.35 + 0.3 * p.weight);
    // The swing: drawn air and the stick-slip of the hinge, whose rate runs fast on a slam and deep-slow on a heavy door
    const filter = KOERPER[p.material as keyof typeof KOERPER].map(([f, q]) => new Biquad("bandpass", f * tiefer, q));
    const rate = (p.material === "metal" ? 150 : 90) * schwer * (p.action === "slam" ? 1.7 : p.action === "close" ? 1.2 : 1);
    const wandern = smooth(r, schwung + 0.1, 0.15), luft = new LowPass();
    let phase = 0;
    for (let i = 0; i < schwung * RATE; i++) {
      const t = i / RATE, x = t / schwung, huelle = Math.sin(Math.PI * x) ** 0.6;
      phase += rate * (1 + 0.4 * (wandern(t) - 0.5)) * (1 + (r() - 0.5) * 0.04) / RATE;
      let ruck = 0;
      if (phase >= 1) { phase -= 1; ruck = (0.6 + 0.4 * r()) * p.creak * (0.4 + 0.6 * p.weight); }
      const reiz = ruck + white(r) * 0.02 * p.creak;
      let y = 0;
      filter.forEach((f, k) => { y += f.run(reiz) / (k + 1); });
      s[von + i] += y * huelle * (p.material === "metal" ? 21 : 13)
        + luft.run(white(r), 350 + 250 * p.weight) * huelle * (0.04 + 0.1 * p.weight) * (p.action === "slam" ? 1.6 : 1);
    }
    // The end: softly caught when opening, a thud when closing, a hard strike with a rattle when slamming
    const treffen = (at: number, amp: number) => {
      const a = Math.round(at * RATE), lp = new LowPass(), o = new Osc("sine");
      const tau = (p.material === "wood" ? 0.07 : 0.035) * (0.7 + 0.6 * p.weight), hz = (p.material === "wood" ? 75 : 110) * (1.1 - 0.25 * p.weight);
      for (let i = 0; i < tau * 6 * RATE && a + i < s.length; i++) {
        const t = i / RATE, fall = 1 + 0.1 * Math.exp(-t / 0.008);
        s[a + i] += o.next(hz * fall) * envelope(t, 0.002, tau) * amp + lp.run(white(r), p.material === "wood" ? 600 : 1800) * envelope(t, 0.0005, 0.018) * amp * 1.4;
      }
      if (p.material === "metal" && !offen) {
        // the short bright ring of struck metal, far shorter than the wooden aftertone
        const o1 = new Osc("sine", r()), o2 = new Osc("sine", r());
        for (let i = 0; i < 0.03 * RATE && a + i < s.length; i++) {
          const t = i / RATE;
          s[a + i] += (o1.next(1900 * tiefer) * envelope(t, 0.001, 0.012) + o2.next(3400 * tiefer) * envelope(t, 0.001, 0.008) * 0.6) * amp * 0.5;
        }
      }
      if (p.action === "slam") grains(s, r, { start: at + 0.008, seconds: 0.09, count: 12 + Math.round(10 * p.weight), hz: 220 * tiefer, q: 1.4, gain: (0.3 + 0.35 * p.weight), grain: 0.004, shape: "front" });
    };
    treffen(0.04 + schwung, offen ? 0.14 + 0.08 * p.weight : 0.25 + 0.2 * p.weight);
    return s;
  },
});
