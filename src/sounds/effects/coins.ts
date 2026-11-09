import { Biquad, buffer, envelope, Osc, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

// Ratios of a small coin: a thick disc, inharmonic like a plate but with its brightest modes high
const MODEN = [1, 1.62, 2.24, 2.79, 3.51];

export const coins = defineSound({
  id: "coins", category: "effects",
  title: { de: "Münzen", en: "Coins" },
  description: {
    de: "Metallene Münzen, die aneinander oder auf Stein schlagen: vom einzelnen fallenden Stück über eine Handvoll bis zum Klingeln eines vollen Beutels.",
    en: "Metallic coins striking each other or stone: from a single falling piece over a handful to the jingle of a full pouch.",
  },
  params: {
    count: { type: "integer", min: 1, max: 12, default: 3, label: { de: "Münzen", en: "Coins" },
      describe: { de: "Wie viele Münzen klingen: 1 ein einzelnes Stück, 3 eine Handvoll, 12 ein voller Beutel.", en: "How many coins ring: 1 a single piece, 3 a handful, 12 a full pouch." } },
    spread: { type: "number", min: 0, max: 0.5, step: 0.01, default: 0.12, unit: "s", label: { de: "Verlauf", en: "Spread" },
      describe: { de: "Über wie viele Sekunden sich die Schläge verteilen: 0 alles zugleich, 0,12 ein kurzer Klangstoß, 0,5 ein Beutel, der sich setzt.", en: "Over how many seconds the strikes are spread: 0 all at once, 0.12 a short clink, 0.5 a pouch settling." } },
    brightness: { type: "number", min: 0, max: 1, step: 0.05, default: 0.6, label: { de: "Metallglanz", en: "Metal brightness" },
      describe: { de: "Wie hell und lang die Münzen klingen: 0,2 gedämpfes Neusilber, 0,6 helles Metall, 1 dünne, schrill nachklingende Scheiben.", en: "How bright and long the coins ring: 0.2 muted cupronickel, 0.6 bright metal, 1 thin discs ringing shrill." } },
    pitch: { type: "number", min: 1500, max: 6000, step: 10, default: 3000, unit: "Hz", label: { de: "Höhe", en: "Pitch" },
      describe: { de: "Grundton einer Münze: 2000 Hz eine große, schwere Münze, 3000 Hz üblich, 5000 Hz ein kleiner heller Cent.", en: "Base tone of one coin: 2000 Hz a large heavy coin, 3000 Hz usual, 5000 Hz a small bright cent." } },
  },
  presets: {
    "single-coin": { label: { de: "Einzelne Münze", en: "Single coin" }, values: { count: 1, spread: 0, pitch: 3400, brightness: 0.7 } },
    pouch: { label: { de: "Münzbeutel", en: "Pouch" }, values: { count: 7, spread: 0.3, pitch: 3000, brightness: 0.75 } },
    "treasure-pile": { label: { de: "Schatzhaufen", en: "Treasure pile" }, values: { count: 12, spread: 0.5, pitch: 2000, brightness: 0.5 } },
  },
  loop: false, maxSeconds: 2,
  build(p, seed) {
    const r = rng(seed), tau = 0.06 + p.brightness * 0.12;
    const s = buffer(Math.min(2, p.spread + tau * 6 + 0.15));
    for (let c = 0; c < p.count; c++) {
      // A coin strikes early and mostly, jittered; front-biased so a handful settles rather than stays even
      const at = Math.round(r() * r() * p.spread * RATE), grund = p.pitch * (0.9 + r() * 0.2), laut = 0.5 + 0.5 * r();
      MODEN.forEach((v, k) => {
        const f = grund * v;
        if (f > 16000) return;
        // Higher modes speak louder with brighter metal and ring shorter; each twice, a hair apart, for shimmer
        const a = (k ? (0.28 + 0.72 * p.brightness) / (1 + k * 0.7) : 1) * laut * (0.85 + 0.3 * r()), zk = tau / (1 + k * 1.4);
        for (const verstimmt of [1, 1.004 + r() * 0.004]) {
          const o = new Osc("sine", r());
          for (let i = 0; i < zk * 6 * RATE && at + i < s.length; i++) s[at + i] += o.next(f * verstimmt) * envelope(i / RATE, 0.0006, zk) * a * 0.5;
        }
      });
      // The metal contact: a very short chink, brighter and finer the harder the metal
      const bp = new Biquad("bandpass", 3000 + p.brightness * 6000, 1.2), knack = 0.0015 + 0.003 * (1 - p.brightness);
      for (let i = 0; i < knack * 8 * RATE && at + i < s.length; i++) s[at + i] += bp.run(white(r)) * envelope(i / RATE, 0.0002, knack) * laut * 0.6;
    }
    return s;
  },
});
