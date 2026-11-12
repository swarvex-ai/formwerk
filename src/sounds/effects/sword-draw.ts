import { Biquad, buffer, envelope, grains, LowPass, Osc, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

// Inharmonic modes of a free blade: a thin, stiff bar with bright, widely spaced partials
const MODEN = [1, 2.76, 5.4, 8.93];

export const swordDraw = defineSound({
  id: "sword-draw", category: "effects",
  title: { de: "Schwertziehen", en: "Sword draw" },
  description: {
    de: "Eine Klinge wird aus der Scheide gezogen: ein Kratzen von Metall auf Metall, das schneller und heller wird, dann der helle Ring der freien Klinge. Eine lederne Scheide dämpft alles dumpfer, tiefer und leiser.",
    en: "A blade is pulled from its scabbard: a scrape of metal on metal that speeds up and brightens, then the bright ring of the free blade. A leather scabbard makes it duller, lower and quieter.",
  },
  params: {
    length: { type: "number", min: 0.2, max: 1, step: 0.05, default: 0.5, unit: "s", label: { de: "Länge", en: "Length" },
      describe: { de: "Dauer des Kratzens: 0,2 s ein Dolch, 0,5 s ein Schwert, 1 s ein Zweihänder; danach klingt die Klinge aus.", en: "How long the scrape lasts: 0.2 s a dagger, 0.5 s a sword, 1 s a greatsword; then the blade rings out." } },
    scrape: { type: "number", min: 0, max: 1, step: 0.05, default: 0.6, label: { de: "Kratzen", en: "Scrape" },
      describe: { de: "Wie laut und körnig das Metall auf Metall kratzt: 0 leise und glatt, 0,6 deutlich rasselnd, 1 laut und rau.", en: "How loud and gritty the metal-on-metal scrape is: 0 quiet and smooth, 0.6 clearly rasping, 1 loud and rough." } },
    ring: { type: "number", min: 0, max: 1, step: 0.05, default: 0.7, label: { de: "Klingenring", en: "Blade ring" },
      describe: { de: "Wie laut die freie Klinge nachklingt: 0 kein Ring, 0,7 hell und deutlich, 1 ein langer, schimmernder Ton.", en: "How loud the free blade rings: 0 no ring, 0.7 bright and clear, 1 a long shimmering tone." } },
    pitch: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Klanghöhe", en: "Pitch" },
      describe: { de: "Grundton des Rings: 0 etwa 700 Hz ein großes, tiefes Schwert, 0,5 etwa 1350 Hz, 1 etwa 2000 Hz eine kleine, helle Klinge.", en: "Base tone of the ring: 0 about 700 Hz a large, low sword, 0.5 about 1350 Hz, 1 about 2000 Hz a small, bright blade." } },
    sheath: { type: "choice", options: ["metal", "leather"], default: "metal", label: { de: "Scheide", en: "Scabbard" },
      labels: { metal: { de: "Metall", en: "Metal" }, leather: { de: "Leder", en: "Leather" } },
      describe: { de: "Die Scheide: Metall kratzt hell und rau, Leder dämpft dumpfer, tiefer und leiser mit weichem Anfang.", en: "The scabbard: metal scrapes bright and rough, leather dulls it lower and quieter with a soft start." } },
  },
  presets: {
    sword: { label: { de: "Schwert", en: "Sword" }, values: { length: 0.5, scrape: 0.6, ring: 0.7, pitch: 0.5, sheath: "metal" } },
    dagger: { label: { de: "Dolch", en: "Dagger" }, values: { length: 0.25, pitch: 0.8, ring: 0.5 } },
    greatsword: { label: { de: "Zweihänder", en: "Greatsword" }, values: { length: 0.9, pitch: 0.15, ring: 0.9 } },
    leather: { label: { de: "Lederscheide", en: "Leather scabbard" }, values: { sheath: "leather", ring: 0.4 } },
  },
  loop: false, maxSeconds: 2.5,
  build(p, seed) {
    const r = rng(seed), leather = p.sheath === "leather";
    const ringTime = 0.3 + 0.7 * p.ring, tau = ringTime / 5;
    const s = buffer(p.length + ringTime + 0.06), n = Math.min(s.length, Math.round(p.length * RATE));
    const low = leather ? 1300 : 3000, high = leather ? 3200 : 6000;
    const gain = (leather ? 0.45 : 1) * (0.35 + 0.65 * p.scrape), steep = leather ? 2.2 : 1.4;
    // The grit: short noise grains on top of the steady scrape, more of them the grittier the metal
    const grit = buffer(p.length);
    grains(grit, r, {
      start: 0, seconds: p.length, count: Math.round((leather ? 160 : 380) * p.length * (0.3 + 0.7 * p.scrape)),
      hz: leather ? 2400 : 4800, q: 1.3, gain: 1, grain: 0.0017, shape: "even",
    });
    const gritGain = (leather ? 0.18 : 0.55) * p.scrape;
    const bp = new Biquad("bandpass", low, 1.3), lp = new LowPass();
    let jitter = 0;
    // The scrape rises in level and its band glides up as the blade speeds up; leather starts softer and duller
    for (let i = 0; i < n; i++) {
      const u = i / Math.max(1, n - 1), glide = 0.35 * u + 0.65 * u * u;
      if ((i & 31) === 0) jitter = (r() - 0.5) * (leather ? 400 : 900) * (0.4 + 0.6 * p.scrape);
      if ((i & 15) === 0) bp.set(low + (high - low) * glide + jitter, 1.2 + 1.2 * p.scrape);
      const rise = Math.pow(u, steep), rel = Math.min(1, (n - 1 - i) / (0.015 * RATE));
      let y = bp.run(white(r));
      if (leather) y = lp.run(y, 2600);
      s[i] += (y * gain + (i < grit.length ? grit[i] * gritGain : 0)) * rise * rel;
    }
    // The blade comes free: a bright inharmonic ring at the end of the scrape, each mode twice for shimmer
    const f0 = 700 + 1300 * p.pitch;
    MODEN.forEach((v, k) => {
      const f = f0 * v;
      if (f > 15000) return;
      const a = p.ring * (k ? 0.34 / (1 + k * 0.6) : 0.6) * (0.85 + 0.3 * r()), zk = tau / (1 + k * 0.8);
      for (const verstimmt of [1, 1.003 + r() * 0.004]) {
        const o = new Osc("sine", r());
        for (let i = 0; n + i < s.length; i++) s[n + i] += o.next(f * verstimmt) * envelope(i / RATE, 0.002, zk) * a * 0.5;
      }
    });
    // A raised-cosine fade over the last 20 ms keeps the contract's edge fade out of the ending.
    const fade = Math.min(s.length, Math.round(0.02 * RATE));
    for (let i = 0; i < fade; i++) s[s.length - 1 - i] *= 0.5 - 0.5 * Math.cos((Math.PI * i) / fade);
    return s;
  },
});
