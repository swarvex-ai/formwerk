import { Biquad, buffer, envelope, Osc, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

// How far the hiss sits below the pops (dB), and the quiet end without pops (s)
const UNTER = 12, STILL = 0.07;

export const fizz = defineSound({
  id: "fizz", category: "effects",
  title: { de: "Sprudeln", en: "Fizz" },
  description: {
    de: "Etwas, das sprudelt: ein frisch geöffnetes Getränk, eine Brausetablette im Wasser, ein Trank, der reagiert. Ein heller, knisternder Hauch aus vielen winzigen platzenden Bläschen, der sofort einsetzt und ausdünnt, bis er verklingt; auf Wunsch zuerst das Plopp einer hineinfallenden Tablette.",
    en: "Something fizzing: a freshly opened drink, an effervescent tablet in water, a potion that reacts. A bright, crackling hiss of many tiny bursting bubbles that starts at once and thins out until it is gone; optionally the plop of a dropped tablet first.",
  },
  params: {
    seconds: { type: "number", min: 0.8, max: 2.4, step: 0.1, default: 1.8, unit: "s", label: { de: "Dauer", en: "Duration" },
      describe: { de: "Wie lange es sprudelt, bis es verklingt: 0,8 s ein kurzes Zischen, 1,8 s ein frisch eingeschenktes Glas, 2,4 s eine Brausetablette.", en: "How long it fizzes until it dies away: 0.8 s a short hiss, 1.8 s a freshly poured glass, 2.4 s an effervescent tablet." } },
    fizz: { type: "number", min: 0, max: 1, step: 0.05, default: 0.6, label: { de: "Sprudeln", en: "Fizz" },
      describe: { de: "Wie lebhaft es sprudelt (0 etwa 40, 1 etwa 600 Bläschen pro Sekunde am Anfang): 0,1 eine schale Limonade, 0,6 eine frische Limo, 1 eine schäumende Tablette.", en: "How lively it is (0 about 40, 1 about 600 pops per second at the start): 0.1 a flat lemonade, 0.6 a fresh soda, 1 a tablet foaming." } },
    size: { type: "number", min: 0, max: 1, step: 0.05, default: 0.3, label: { de: "Bläschengröße", en: "Bubble size" },
      describe: { de: "Größe der Bläschen: 0 ein feines Ticken wie bei Sekt um 8 kHz, 0,3 eine Limo, 1 grobe Plopps um 2,5 kHz.", en: "Bubble size: 0 a fine champagne-like tick around 8 kHz, 0.3 a soda, 1 coarse pops around 2.5 kHz." } },
    drop: { type: "boolean", default: false, label: { de: "Hineinfallen", en: "Drop" },
      describe: { de: "Eine Tablette oder Münze fällt zuerst mit einem tiefen Plopp hinein, dann sprudelt es: an für eine Brausetablette, aus für ein geöffnetes Getränk.", en: "A tablet or coin is dropped in first with a low plop, then it fizzes: on for an effervescent tablet, off for an opened drink." } },
  },
  presets: {
    soda: { label: { de: "Limo", en: "Soda" }, values: { fizz: 0.8, size: 0.2, seconds: 2.2 } },
    potion: { label: { de: "Zaubertrank", en: "Potion" }, values: { fizz: 0.5, size: 0.6, seconds: 1.6 } },
    tablet: { label: { de: "Brausetablette", en: "Tablet" }, values: { drop: true, fizz: 1, size: 0.4, seconds: 2.2 } },
  },
  loop: false, maxSeconds: 2.5,
  build(p, seed) {
    // The plop's values from their own stream, so switching it on does not move the pops
    const r1 = rng(seed + 1), glide = 0.04 + 0.02 * r1(), vor = p.drop ? 0.04 + 0.02 * r1() : 0;
    const dauer = Math.min(p.seconds, 2.5 - vor), s = buffer(vor + dauer), n = s.length, an = Math.round(vor * RATE);

    // The pops: rate highest at once, falling exponentially; the last 20 % hold only a few
    const r = rng(seed), tau = dauer / 4, ende = dauer - STILL, rate = 40 * 15 ** p.fizz;
    const anteil = 1 - Math.exp(-ende / tau), count = Math.round(rate * tau * anteil);
    const hz = 8000 * (2500 / 8000) ** p.size, pops = new Float32Array(n - an);
    for (let k = 0; k < count; k++) {
      // Inverse of the falling rate: most pops at the start
      const t0 = -tau * Math.log(1 - r() * anteil), at = Math.round(t0 * RATE);
      const f = hz * (0.8 + 0.4 * r()), lang = 0.001 + 0.003 * r(), laut = (0.3 + 0.7 * r()) * (0.4 + 0.6 * Math.exp(-t0 / tau));
      const o = new Osc("sine", r()), m = Math.round(lang * RATE);
      for (let i = 0; i < m && at + i < pops.length; i++) {
        const t = i / RATE, w = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / m);
        pops[at + i] += (o.next(f) + white(r) * 0.1) * envelope(t, 0.0002, lang / 2) * w * laut;
      }
    }
    // Keep the clicks around their pitch, so the bubble size is heard
    const hp = new Biquad("highpass", hz * 0.5, 0.7), oben = new Biquad("lowpass", hz * 1.5, 0.7);
    for (let i = 0; i < pops.length; i++) pops[i] = oben.run(hp.run(pops[i]));

    // The hiss: high-passed noise under the pops, following the same falling envelope, measured UNTER dB below them
    const hiss = new Float32Array(pops.length), band = new Biquad("highpass", hz * 0.6, 0.7), lp = new Biquad("lowpass", hz * 1.5, 0.7);
    for (let i = 0; i < hiss.length; i++) {
      const t = i / RATE, aus = Math.min(1, Math.max(0, (dauer - t) / (dauer * 0.25)));
      hiss[i] = lp.run(band.run(white(r))) * Math.min(1, t / 0.005) * Math.exp(-t / tau) * aus * aus;
    }
    const kopf = Math.round(dauer * 0.2 * RATE), pegel = (b: Float32Array) => {
      let q = 0;
      for (let i = 0; i < kopf; i++) q += b[i] * b[i];
      return Math.sqrt(q / kopf);
    };
    const g = (pegel(pops) * 10 ** (-UNTER / 20)) / Math.max(1e-9, pegel(hiss));
    let spitze = 0;
    for (let i = 0; i < pops.length; i++) { s[an + i] = pops[i] + hiss[i] * g; spitze = Math.max(spitze, Math.abs(s[an + i])); }

    // The plop: a sine gliding down from about 450 to 200 Hz with a fast attack, louder than the fizz
    if (p.drop) {
      const osc = new Osc("sine"), f0 = 430 + 40 * r1(), f1 = 190 + 20 * r1(), laut = 1.6 * spitze;
      for (let i = 0, m = Math.round((glide * 2.5) * RATE); i < m && i < n; i++) {
        const t = i / RATE, x = Math.min(1, t / glide);
        s[i] += osc.next(f0 * (f1 / f0) ** x) * envelope(t, 0.002, glide / 2.5) * laut;
      }
    }
    return s;
  },
});
