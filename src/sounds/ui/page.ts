import { Biquad, buffer, envelope, LowPass, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const page = defineSound({
  id: "page", category: "ui",
  title: { de: "Seite umblättern", en: "Page turn" },
  description: {
    de: "Eine Seite, die in einem Buch umgeschlagen wird, oder ein Blatt Papier, das gewendet wird; für Menüs, Tagebücher und Questlogs.",
    en: "A page turning in a book or a sheet of paper flipped over; for menus, journals and quest logs.",
  },
  params: {
    paper: { type: "number", min: 0, max: 1, step: 0.05, default: 0.3, label: { de: "Papier", en: "Paper" },
      describe: { de: "0 ist dünnes Bibelpapier, knisternd und hoch (um 5000 Hz), 1 dicke Pappe, dumpf und tief (um 1800 Hz).", en: "0 is thin bible paper, crisp and high (around 5000 Hz), 1 is thick card, duller and lower (around 1800 Hz)." } },
    speed: { type: "number", min: 0.15, max: 0.8, step: 0.01, default: 0.35, unit: "s", label: { de: "Dauer", en: "Speed" },
      describe: { de: "Wie lange das Umblättern dauert: 0,2 s ein flinkes Wenden, 0,35 s ein Buch, 0,6 s ein langsames Umschlagen.", en: "How long the turn takes: 0.2 s a quick flick, 0.35 s a book, 0.6 s a slow turn." } },
    pages: { type: "integer", min: 1, max: 4, default: 1, label: { de: "Seiten", en: "Pages" },
      describe: { de: "Wie viele Seiten schnell hintereinander umgeblättert werden, jede etwas leiser: 1 eine Seite, 4 ein Durchblättern.", en: "How many pages are flipped quickly one after another, each a little quieter: 1 a single page, 4 a flick through." } },
    snap: { type: "number", min: 0, max: 1, step: 0.05, default: 0.4, label: { de: "Klatschen", en: "Snap" },
      describe: { de: "Wie laut die Seite beim Aufliegen klatscht: 0 fast lautlos, 0,4 ein Buch, 1 ein deutlicher Schlag.", en: "How loud the page slaps as it lands: 0 almost silent, 0.4 a book, 1 a clear slap." } },
  },
  presets: {
    book: { label: { de: "Buch", en: "Book" }, values: { paper: 0.3, speed: 0.35, pages: 1, snap: 0.4 } },
    journal: { label: { de: "Tagebuch", en: "Journal" }, values: { paper: 0.6, speed: 0.5, snap: 0.6 } },
    "flip-through": { label: { de: "Durchblättern", en: "Flip through" }, values: { pages: 4, speed: 0.2, snap: 0.2 } },
  },
  loop: false, maxSeconds: 2.5,
  build(p, seed) {
    const r = rng(seed), d = p.speed, versatz = d * 0.6, hz = 5000 - 3200 * p.paper;
    const s = buffer(versatz * (p.pages - 1) + d + 0.12);
    for (let n = 0; n < p.pages; n++) {
      const at = Math.round(n * versatz * RATE), laut = 0.8 ** n;
      const bp = new Biquad("bandpass", hz, 0.7 + (1 - p.paper) * 0.6), tief = new LowPass(), klatsch = new LowPass();
      // Crackle: the noise is chopped by a jittered gain that is redrawn every 1 to 3 ms
      let gain = 0, ziel = r(), links = 0;
      for (let i = 0; i < d * RATE && at + i < s.length; i++) {
        const x = i / RATE / d;
        const hull = x < 1 / 3 ? Math.sin((x * 3 * Math.PI) / 2) ** 2 : Math.cos(((x - 1 / 3) * 1.5 * Math.PI) / 2) ** 2;
        if (links-- <= 0) { links = Math.round((0.001 + 0.002 * r()) * RATE); ziel = r() ** 2.5; }
        gain += (ziel - gain) * 0.05;
        s[at + i] += bp.run(white(r)) * hull * (0.15 + gain * 1.6) * laut * 0.5;
      }
      // The slap when the page lands: 15 to 30 ms of low-passed noise
      const slap = Math.round((0.015 + 0.015 * p.paper) * RATE), ab = at + Math.round(d * RATE);
      for (let i = 0; i < slap * 4 && ab + i < s.length; i++) {
        s[ab + i] += tief.run(klatsch.run(white(r), 1500 - 700 * p.paper), 900) * 6 * envelope(i / RATE, 0.001, slap / RATE / 2.5) * p.snap * laut;
      }
    }
    // Ends on its own decay: a raised-cosine fade over the last 20 ms
    const f = Math.round(0.02 * RATE);
    for (let i = 0; i < f; i++) s[s.length - 1 - i] *= 0.5 - 0.5 * Math.cos((Math.PI * i) / f);
    return s;
  },
});
