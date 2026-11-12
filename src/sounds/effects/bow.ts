import { Biquad, buffer, envelope, LowPass, Osc, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const bow = defineSound({
  id: "bow", category: "effects",
  title: { de: "Bogenschuss", en: "Bow shot" },
  description: {
    de: "Ein Pfeil vom Bogen: das Schnarren der Sehne, das Zischen des Pfeils und auf Wunsch der Einschlag.",
    en: "An arrow shot from a bow: the twang of the string, the whoosh of the arrow and, if wanted, the thud of the hit.",
  },
  params: {
    tension: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Spannung", en: "Tension" },
      describe: { de: "Wie stark der Bogen ist: 0 ein leichter Jagdbogen (90 Hz, leise), 0,5 ein Jagdbogen, 1 ein schwerer Langbogen (160 Hz, laut).", en: "How strong the bow is: 0 a light hunting bow (90 Hz, quiet), 0.5 a hunting bow, 1 a heavy longbow (160 Hz, loud)." } },
    flight: { type: "number", min: 0.1, max: 1, step: 0.01, default: 0.4, unit: "s", label: { de: "Flugzeit", en: "Flight" },
      describe: { de: "Wie lange der Pfeil zu hören ist, bevor er trifft: 0,2 s nah, 0,5 s auf 30 m, 1 s sehr weit.", en: "How long the arrow is heard before it hits: 0.2 s close, 0.5 s at 30 m, 1 s very far." } },
    hit: { type: "choice", options: ["none", "wood", "target"], default: "none", label: { de: "Treffer", en: "Hit" },
      labels: { none: { de: "Keiner", en: "None" }, wood: { de: "Holz", en: "Wood" }, target: { de: "Strohscheibe", en: "Straw target" } },
      describe: { de: "Was der Pfeil trifft: keiner (nur Schuss), Holz (dumpfes Pochen) oder eine Strohscheibe (weicher Aufschlag).", en: "What the arrow hits: none (shot only), wood (a dull thud) or a straw target (a softer thump)." } },
    distance: { type: "number", min: 0, max: 1, step: 0.05, default: 0, label: { de: "Entfernung", en: "Distance" },
      describe: { de: "Wie weit der Einschlag weg ist: 0 nah und hell, 0,5 auf 30 m, 1 sehr fern, leise und dumpf (Tiefpass 6000 bis 1500 Hz).", en: "How far the hit is: 0 near and bright, 0.5 at 30 m, 1 far, quiet and dull (low-pass 6000 to 1500 Hz)." } },
  },
  presets: {
    hunting: { label: { de: "Jagdbogen", en: "Hunting bow" }, values: { tension: 0.5, flight: 0.4 } },
    longbow: { label: { de: "Langbogen", en: "Longbow" }, values: { tension: 0.9, flight: 0.6, hit: "wood" } },
    practice: { label: { de: "Übung", en: "Practice" }, values: { tension: 0.3, flight: 0.3, hit: "target" } },
  },
  loop: false, maxSeconds: 1.6,
  build(p, seed) {
    const r = rng(seed), hitLen = p.hit === "none" ? 0 : 0.4;
    const s = buffer(Math.max(0.35, p.flight + hitLen + 0.05));
    // Twang: the string at 90 to 160 Hz with two overtones and a short click of noise
    const f = (90 + 70 * p.tension) * (0.98 + 0.04 * r()), laut = 0.5 + 0.5 * p.tension, decay = 0.15 + 0.15 * p.tension;
    const o1 = new Osc("sine"), o2 = new Osc("sine", r()), o3 = new Osc("sine", r()), click = new Biquad("bandpass", 2500, 1.5);
    for (let i = 0; i < 0.6 * RATE && i < s.length; i++) {
      const t = i / RATE, e = envelope(t, 0.002, decay);
      s[i] += (o1.next(f * (1 + 0.03 * Math.exp(-t / 0.03))) + 0.5 * o2.next(f * 2) * envelope(t, 0.002, decay * 0.6) + 0.3 * o3.next(f * 3) * envelope(t, 0.002, decay * 0.4)) * e * laut * 0.6;
      if (t < 0.01) s[i] += click.run(white(r)) * (1 - t / 0.01) * laut * 0.8;
    }
    // Whoosh: noise through a band-pass that falls from 2000 to 600 Hz, swelling then fading
    const w1 = new Biquad("bandpass", 2000, 2), w2 = new Biquad("bandpass", 2000, 2), n = Math.round(p.flight * RATE);
    for (let i = 0; i < n && i < s.length; i++) {
      const x = i / n, bogen = Math.sin(Math.PI * x ** 0.7);
      if (i % 16 === 0) { const fc = 2000 * (0.3) ** x; w1.set(fc, 2); w2.set(fc, 2); }
      s[i] += w2.run(w1.run(white(r))) * bogen * bogen * 1.2;
    }
    // Hit: two modes like a knock, softer and lower in straw; further away it is quieter and duller
    if (p.hit !== "none") {
      const wood = p.hit === "wood", at = n, g = (1 - 0.6 * p.distance) * (wood ? 0.9 : 0.7), tau = wood ? 0.05 : 0.07;
      const base = (wood ? 140 : 85) * (0.97 + r() * 0.06), a = new Osc("sine", 0.25), b = new Osc("sine", r());
      const bp = new Biquad("bandpass", wood ? 2500 : 900, 1.2), lp = new LowPass(), lp2 = new LowPass(), cut = 6000 - 4500 * p.distance;
      for (let i = 0; at + i < s.length; i++) {
        const t = i / RATE, fall = 1 + 0.12 * Math.exp(-t / 0.01);
        let v = a.next(base * fall) * envelope(t, 0.001, tau) + b.next(base * 2.31 * fall) * envelope(t, 0.0008, tau * 0.45) * 0.5;
        if (t < 0.02) v += bp.run(white(r)) * envelope(t, 0.0003, wood ? 0.003 : 0.006) * (wood ? 0.9 : 0.4);
        s[at + i] += lp2.run(lp.run(v, cut), cut) * g;
      }
    }
    // End on our own decay: the last 20 ms with a raised cosine
    const m = Math.round(0.02 * RATE);
    for (let i = 0; i < m && i < s.length; i++) s[s.length - 1 - i] *= 0.5 - 0.5 * Math.cos(Math.PI * i / m);
    return s;
  },
});
