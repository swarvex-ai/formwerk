import { Biquad, buffer, envelope, LowPass, RATE, smooth, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const thunder = defineSound({
  id: "thunder", category: "ambience",
  title: { de: "Donner", en: "Thunder" },
  description: {
    de: "Ein Donnerschlag: nah mit scharfem Krachen oder fern als dumpfes Grollen, das lange nachrollt. Jeder Seed rollt anders.",
    en: "A thunderclap: close with a sharp crack or far away as a dull rumble that rolls on. Every seed rolls differently.",
  },
  params: {
    distance: { type: "number", min: 0, max: 1, step: 0.05, default: 0.4, label: { de: "Entfernung", en: "Distance" },
      describe: { de: "Wie weit der Blitz weg ist: 0,05 direkt nebenan mit Krachen, 0,4 nah, 0,9 fern und dumpf.", en: "How far away the lightning is: 0.05 right next to you with a crack, 0.4 near, 0.9 far and dull." } },
    length: { type: "number", min: 3, max: 10, step: 0.5, default: 6, unit: "s", label: { de: "Länge", en: "Length" },
      describe: { de: "Wie lange es grollt: 3 s ein kurzer Schlag, 6 s üblich, 10 s ein langes Rollen.", en: "How long it rumbles: 3 s a short clap, 6 s usual, 10 s a long roll." } },
    rumble: { type: "number", min: 0, max: 1, step: 0.05, default: 0.6, label: { de: "Rollen", en: "Rumble" },
      describe: { de: "Wie sehr der Donner auf- und abrollt: 0 gleichmäßig verhallend, 0,6 üblich, 1 mehrere Wellen.", en: "How much the thunder rolls up and down: 0 an even fade, 0.6 usual, 1 several waves." } },
  },
  presets: {
    close: { label: { de: "Nah", en: "Close" }, values: { distance: 0.05, length: 5, rumble: 0.5 } },
    distant: { label: { de: "Fern", en: "Distant" }, values: { distance: 0.9, length: 8, rumble: 0.8 } },
    rolling: { label: { de: "Rollend", en: "Rolling" }, values: { distance: 0.5, length: 10, rumble: 1 } },
  },
  loop: false, maxSeconds: 10,
  build(p, seed) {
    const r = rng(seed), s = buffer(p.length), wellen = smooth(r, p.length, 0.35 + (1 - p.rumble) * 1.2);
    // The crack: only when it is close, a bright tearing burst
    const krach = Math.max(0, 1 - p.distance / 0.6);
    if (krach > 0) {
      const hp = new Biquad("highpass", 700, 0.7), zerren = smooth(r, 0.4, 0.008);
      for (let i = 0; i < 0.4 * RATE; i++) { const t = i / RATE; s[i] += hp.run(white(r)) * envelope(t, 0.001, 0.07) * (0.5 + zerren(t)) * krach * 2.2; }
    }
    // The rumble: low noise that rolls in after the crack and fades over the length, darker the farther away
    const lp1 = new Biquad("lowpass", 1400 - p.distance * 1150, 0.7), lp2 = new LowPass(), anfang = 0.03 + p.distance * 0.5;
    for (let i = 0; i < s.length; i++) {
      const t = i / RATE, roll = 1 - p.rumble * 0.75 + p.rumble * 1.1 * wellen(t) ** 1.5;
      const huelle = t < anfang ? 0 : envelope(t - anfang, 0.15 + p.distance * 0.6, p.length / 5.5);
      s[i] += lp2.run(lp1.run(white(r)), 90 + (1 - p.distance) * 500) * huelle * roll * 4;
    }
    return s;
  },
});
