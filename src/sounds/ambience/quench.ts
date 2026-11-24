import { Biquad, buffer, envelope, grains, LowPass, Osc, RATE, smooth, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

// What the piece of iron changes: how long the first hiss lasts, how deep and heavy the bubbles are
const STUECK = {
  nail: { zisch: 0.5, tief: 0, blasen: 0.5, laut: 0.7 },
  blade: { zisch: 1, tief: 0.35, blasen: 1, laut: 1 },
  horseshoe: { zisch: 0.8, tief: 1, blasen: 1.5, laut: 1 },
};

export const quench = defineSound({
  id: "quench", category: "ambience",
  title: { de: "Abschrecken", en: "Quench" },
  description: {
    de: "Ein Schmied taucht glühendes Eisen ins Wasserfass: ein scharfes, lautes Zischen, das schnell in ein raues Brodeln fällt, dann ein dünnes Brutzeln, das verklingt.",
    en: "A smith plunges hot iron into a water tub: a sharp, loud hiss that quickly falls into a rough bubbling boil, then a thin sizzle that fades away.",
  },
  params: {
    size: { type: "choice", options: ["nail", "blade", "horseshoe"], default: "blade", label: { de: "Werkstück", en: "Piece" },
      labels: { nail: { de: "Nagel", en: "Nail" }, blade: { de: "Klinge", en: "Blade" }, horseshoe: { de: "Hufeisen", en: "Horseshoe" } },
      describe: { de: "Was ins Wasser kommt: ein Nagel zischt kurz und dünn, eine Klinge lange, ein Hufeisen brodelt schwer und tief.", en: "What goes into the water: a nail hisses short and thin, a blade long, a horseshoe boils heavy and deep." } },
    length: { type: "number", min: 0.8, max: 4, step: 0.1, default: 2, unit: "s", label: { de: "Länge", en: "Length" },
      describe: { de: "Wie lange es bis zur Stille dauert: 1 s ein Nagel, 2 s eine Klinge, 3 bis 4 s ein schweres Hufeisen.", en: "How long until it is silent: 1 s a nail, 2 s a blade, 3 to 4 s a heavy horseshoe." } },
    heat: { type: "number", min: 0, max: 1, step: 0.05, default: 0.7, label: { de: "Hitze", en: "Heat" },
      describe: { de: "Wie heiß das Eisen ist: 0 kaum heiß (leises Zischen, wenige Blasen), 0,7 rotglühend, 1 hellglühend (lautes, scharfes Zischen, heftiges Brodeln).", en: "How hot the iron is: 0 barely hot (a soft hiss, few bubbles), 0.7 red hot, 1 glowing hot (a loud, harsh hiss and a violent boil)." } },
    bubbles: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Blasen", en: "Bubbles" },
      describe: { de: "Wie dicht es nach dem Zischen brodelt: 0 vereinzelte Blasen, 0,5 ein Kochen, 1 ein dichtes Sprudeln.", en: "How dense the boil after the hiss is: 0 a few bubbles, 0.5 a boil, 1 a dense rolling boil." } },
  },
  presets: {
    blade: { label: { de: "Klinge", en: "Blade" }, values: { size: "blade" } },
    nail: { label: { de: "Nagel", en: "Nail" }, values: { size: "nail", length: 1 } },
    horseshoe: { label: { de: "Hufeisen", en: "Horseshoe" }, values: { size: "horseshoe", length: 3, bubbles: 0.8 } },
    warm: { label: { de: "Nur warm", en: "Warm" }, values: { heat: 0.25 } },
  },
  loop: false, maxSeconds: 4.5,
  build(p, seed) {
    const r = rng(seed), T = p.length, s = buffer(T), n = s.length, st = STUECK[p.size];
    // Everything fades to silence by the end
    const aus = (t: number) => Math.max(0, 1 - t / T) ** 1.5;
    // The hiss: bright band-passed noise, a fast rise, then falling in level and brightness into a thin sizzle
    const flackern = smooth(r, T, 0.08), bp = new Biquad("bandpass", 6000, 1.2), hp = new Biquad("highpass", 1500, 0.7), dunkel = new LowPass();
    const spitze = 0.12 + 0.08 * st.zisch, fall = (0.06 + 0.1 * st.zisch) * T / 2, hell = 4500 + 2500 * p.heat;
    const zischen = (0.4 + 0.6 * p.heat) * st.laut;
    for (let i = 0; i < n; i++) {
      const t = i / RATE, k = t < spitze ? 0 : 1 - Math.exp(-(t - spitze) / fall);
      if (i % 64 === 0) bp.set(hell - (hell - 2500) * k, 1.2);
      const pegel = (t < 0.04 ? t / 0.04 : 1) * (1 - 0.88 * k) * (0.75 + 0.5 * flackern(t));
      s[i] = dunkel.run(hp.run(bp.run(white(r))), 14000 - 9000 * k) * pegel * zischen * 2.5 * aus(t);
    }
    // The crackle of the sizzle: fine clicks over the whole length, the odd louder one in the tail
    const knistern = buffer(T);
    grains(knistern, r, { start: 0, seconds: T, count: Math.round(T * (20 + 80 * p.heat)), hz: 4500, q: 0.6, gain: 0.25, grain: 0.002, shape: "front" });
    for (let i = 0; i < n; i++) s[i] += knistern[i] * aus(i / RATE);
    // The boil: dense, rough low pops that take over after the onset and die away over the next 30 to 40 %
    const blasen = buffer(T), boilStart = spitze * 0.9, boilEnde = boilStart + T * (0.35 + 0.1 * st.tief);
    const count = Math.round((boilEnde - boilStart) * (20 + 220 * p.bubbles) * (0.3 + 0.7 * p.heat) * st.blasen);
    const pr = rng(seed + 1);
    for (let k = 0; k < count; k++) {
      const u = pr(), x = u * u * 0.7 + u * 0.3, at = Math.round((boilStart + x * (boilEnde - boilStart)) * RATE);
      const f0 = (800 - 450 * st.tief) * (0.5 + 0.5 * pr()) + 120, f1 = f0 * (1.3 + 0.5 * pr());
      const dauer = 0.008 + 0.012 * st.tief + 0.015 * pr(), laut = (0.3 + 0.7 * pr()) * (1 - 0.7 * x), o = new Osc("sine");
      for (let i = 0, m = Math.round(dauer * RATE); i < m && at + i < n; i++) {
        const t = i / RATE;
        blasen[at + i] += o.next(f0 + (f1 - f0) * (t / dauer)) * envelope(t, 0.0008, dauer * 0.35) * laut;
      }
    }
    // Rough: a low churning rumble under the bubbles, louder the heavier the piece
    const lp = new Biquad("lowpass", 250 + 200 * st.tief, 0.8), rau = new LowPass(), wallen = (0.2 + 0.4 * p.heat) * (0.5 + 0.5 * st.tief);
    for (let i = 0; i < n; i++) {
      const t = i / RATE, boil = t < boilStart ? 0 : envelope(t - boilStart, 0.08, (boilEnde - boilStart) / 2.5);
      s[i] += (rau.run(blasen[i], 3000) * (0.6 + 0.6 * p.heat) + lp.run(white(r)) * wallen * boil) * aus(t);
    }
    return s;
  },
});
