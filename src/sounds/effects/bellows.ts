import { Biquad, buffer, envelope, LowPass, Osc, RATE, smooth, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

// Hand bellows at a fireplace sound about an octave above a big forge bellows, with a lighter knock
const GROESSE = {
  hand: { luft: 1100, creak: 140, holz: [[380, 5], [900, 6]], knock: 230, wucht: 0.55 },
  forge: { luft: 520, creak: 100, holz: [[190, 4], [450, 5]], knock: 150, wucht: 1 },
} as const;
const PAUSE = 0.25, NACHKLANG = 0.15;

export const bellows = defineSound({
  // Category ambience, not effects: one-shot effects are capped at 2.5 s (tests/core/sounds.test.ts), slow pumping runs 5.6 s
  id: "bellows", category: "ambience",
  title: { de: "Blasebalg", en: "Bellows" },
  description: {
    de: "Ein Blasebalg in Hüben: ein hauchendes Luftrauschen, das an- und abschwillt, ein leises Lederknarzen zu Beginn und ein dumpfes Holzklopfen, wenn die Bretter schließen. Für Schmieden und Werkstätten.",
    en: "Bellows pressed in strokes: a breathy rush of air that swells and fades, a soft leather creak at the start and a dull wooden knock as the boards close. For smithies and workshops.",
  },
  params: {
    size: { type: "choice", options: ["hand", "forge"], default: "forge", label: { de: "Größe", en: "Size" },
      labels: { hand: { de: "Handblasebalg", en: "Hand bellows" }, forge: { de: "Schmiedeblasebalg", en: "Forge bellows" } },
      describe: { de: "Ein Handblasebalg am Kamin klingt höher und dünner (etwa eine Oktave) mit leichtem Klopfen, ein großer Schmiedeblasebalg tief und voll.", en: "Hand bellows at a fireplace sound higher and thinner (about an octave up) with a lighter knock, a big forge bellows deep and full." } },
    strokes: { type: "integer", min: 1, max: 4, default: 2, label: { de: "Hübe", en: "Strokes" },
      describe: { de: "Wie oft der Blasebalg gedrückt wird: 1 ein einzelner Stoß, 2 beim Anfachen, 4 beim stetigen Pumpen.", en: "How often the bellows is pressed: 1 a single puff, 2 to stoke the fire, 4 steady pumping." } },
    stroke: { type: "number", min: 0.3, max: 1.2, step: 0.05, default: 0.8, unit: "s", label: { de: "Hublänge", en: "Stroke" },
      describe: { de: "Dauer eines Hubs: 0,4 s ein schneller Handblasebalg, 0,8 s eine Schmiede, 1,2 s langsames, schweres Pumpen.", en: "Length of one stroke: 0.4 s quick hand bellows, 0.8 s a forge, 1.2 s slow, heavy pumping." } },
    creak: { type: "number", min: 0, max: 1, step: 0.05, default: 0.4, label: { de: "Knarzen", en: "Creak" },
      describe: { de: "Lautstärke des Lederknarzens zu Beginn jedes Hubs: 0 keines, 0,4 leise, 1 altes, trockenes Leder.", en: "Level of the leather creak at the start of each stroke: 0 none, 0.4 soft, 1 old, dry leather." } },
    knock: { type: "boolean", default: true, label: { de: "Klopfen", en: "Knock" },
      describe: { de: "Das dumpfe Holzklopfen, wenn die Bretter am Ende jedes Hubs schließen.", en: "The dull wooden knock as the boards close at the end of each stroke." } },
  },
  presets: {
    forge: { label: { de: "Schmiede", en: "Forge" }, values: { size: "forge" } },
    fireplace: { label: { de: "Kamin", en: "Fireplace" }, values: { size: "hand", strokes: 3, stroke: 0.4, creak: 0.2 } },
    "slow-pump": { label: { de: "Langsames Pumpen", en: "Slow pump" }, values: { strokes: 4, stroke: 1.2 } },
    single: { label: { de: "Einzelner Hub", en: "Single stroke" }, values: { strokes: 1 } },
  },
  loop: false, maxSeconds: 6,
  build(p, seed) {
    const r = rng(seed), g = GROESSE[p.size as keyof typeof GROESSE];
    // Each stroke varies a little in length (within ±4 %, so 4 × 1.2 s still fits in 6 s) and loudness
    const huebe = Array.from({ length: p.strokes }, () => ({ len: p.stroke * (0.96 + 0.08 * r()), laut: 0.85 + 0.15 * r() }));
    const s = buffer(huebe.reduce((a, h) => a + h.len, 0) + (p.strokes - 1) * PAUSE + NACHKLANG);
    // The rush peaks at 40 % of the stroke: sin(pi x^a) peaks where x^a = 0.5
    const a = Math.log(0.5) / Math.log(0.4);
    let at = 0;
    for (const h of huebe) {
      const n = Math.round(h.len * RATE), start = Math.round(at * RATE);
      const hauch = smooth(r, h.len + 0.1, 0.06), bp1 = new Biquad("bandpass", g.luft, 0.7), bp2 = new Biquad("bandpass", g.luft, 0.9), weich = new Biquad("lowpass", g.luft * 2), lp = new LowPass();
      // The air: breathy band noise that swells and fades, a little brighter at its peak
      for (let i = 0; i < n && start + i < s.length; i++) {
        const t = i / RATE, x = t / h.len, bogen = Math.sin(Math.PI * x ** a);
        if (i % 16 === 0) { const fc = g.luft * (0.8 + 0.4 * bogen); bp1.set(fc, 0.7); bp2.set(fc, 0.9); }
        const luft = weich.run(bp2.run(bp1.run(white(r)))) + lp.run(white(r), g.luft * 0.5) * 0.4;
        s[start + i] += luft * bogen * bogen * (0.8 + 0.4 * hauch(t)) * h.laut * 2.2;
      }
      // The leather: a short, low rasp of stick-and-slip jolts in the first 10 % of the stroke
      if (p.creak > 0) {
        const lang = h.len * 0.1, filter = g.holz.map(([f, q]) => new Biquad("bandpass", f, q));
        let phase = 0;
        for (let i = 0; i < lang * RATE && start + i < s.length; i++) {
          const t = i / RATE;
          phase += g.creak * (1 + (r() - 0.5) * 0.15) / RATE;
          let ruck = 0;
          if (phase >= 1) { phase -= 1; ruck = 0.6 + 0.4 * r(); }
          const reiz = ruck + white(r) * 0.05;
          let y = 0;
          filter.forEach((f, k) => { y += f.run(reiz) / (k + 1); });
          s[start + i] += y * Math.sin(Math.PI * t / lang) ** 0.6 * p.creak * 1.4;
        }
      }
      // The boards close: a dull low thud with a soft click, gone in under 60 ms
      if (p.knock) {
        const k = start + n - Math.round(0.01 * RATE), o = new Osc("sine", 0.25), klick = new LowPass(), f = g.knock * (0.97 + 0.06 * r());
        for (let i = 0; i < 0.08 * RATE && k + i < s.length; i++) {
          const t = i / RATE, fall = 1 + 0.1 * Math.exp(-t / 0.008);
          s[k + i] += (o.next(f * fall) * envelope(t, 0.002, 0.012) + klick.run(white(r), 1200) * envelope(t, 0.0005, 0.004) * 1.2) * g.wucht * h.laut * 0.9;
        }
      }
      at += h.len + PAUSE;
    }
    return s;
  },
});
