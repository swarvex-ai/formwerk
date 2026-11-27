import { Biquad, buffer, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

const MAX = 2.5, END_SIL = 0.05, EMBER_TAIL = 0.35;

export const blowOut = defineSound({
  id: "blow-out", category: "effects",
  title: { de: "Ausgeblasen", en: "Blow-out" },
  description: {
    de: "Jemand pustet eine Kerze aus: ein weicher Hauch durch gespitzte Lippen (ohne Stimme), darin flattert die Flamme einen Augenblick, dann ist sie aus. Auf Wunsch knackst der Docht leise danach. Auch für mehrere Kerzen hintereinander.",
    en: "Someone blowing out a candle: a soft puff of breath through pursed lips (no voice), the flame fluttering in it for a moment, then out. Optionally the wick crackles faintly afterwards. Also for several candles in a row.",
  },
  params: {
    breath: { type: "number", min: 0.1, max: 0.6, step: 0.05, default: 0.3, unit: "s", label: { de: "Hauch", en: "Puff" },
      describe: { de: "Wie lange ein Hauch dauert: 0,1 s ein kurzer Stoss, 0,3 s ein ordentlicher Atemzug, 0,6 s ein langes Blasen.", en: "How long one puff lasts: 0.1 s a short burst, 0.3 s a normal breath, 0.6 s a long blow." } },
    strength: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Stärke", en: "Strength" },
      describe: { de: "Wie scharf der Hauch ist: 0 ein sanfter Atem um 600 Hz, 0,5 üblich, 1 ein kräftiger Stoss um 2500 Hz, mit schnellerem Anstieg.", en: "How sharp the puff is: 0 a gentle breath around 600 Hz, 0.5 usual, 1 a strong blow around 2500 Hz, with a faster rise." } },
    flutter: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Flattern", en: "Flutter" },
      describe: { de: "Wie sehr die Flamme in der zweiten Hälfte des Hauchs wankt: 0 gar nicht, 0,5 ein leichtes Zittern, 1 Senken um etwa 6 bis 10 dB 8 bis 14 Mal pro Sekunde.", en: "How much the flame wavers in the second half of the puff: 0 none, 0.5 a light tremble, 1 dips of about 6 to 10 dB, 8 to 14 times per second." } },
    candles: { type: "integer", min: 1, max: 3, default: 1, label: { de: "Kerzen", en: "Candles" },
      describe: { de: "Wie viele Kerzen einer hinter der anderen ausgeblasen werden: 1 eine Kerze, 2 zwei, 3 drei mit kurzen Pausen dazwischen.", en: "How many candles are blown out one after another: 1 one candle, 2 two, 3 three with short pauses between." } },
    ember: { type: "boolean", default: false, label: { de: "Glut", en: "Ember" },
      describe: { de: "Ob der Docht danach leise knackt: an für ein leises Knacken des Dochts, aus für ein sauberes Ausgehen.", en: "Whether the wick crackles faintly afterwards: on for a soft crackle of the wick, off for a clean end." } },
  },
  presets: {
    gentle: { label: { de: "Sanft", en: "Gentle" }, values: { strength: 0.2, breath: 0.4, flutter: 0.7 } },
    quick: { label: { de: "Schnell", en: "Quick" }, values: { strength: 0.9, breath: 0.15, flutter: 0.2 } },
    birthday: { label: { de: "Geburtstag", en: "Birthday" }, values: { candles: 3, strength: 0.7, breath: 0.25 } },
    wick: { label: { de: "Docht", en: "Wick" }, values: { ember: true } },
  },
  loop: false, maxSeconds: MAX,
  build(p, seed) {
    const r = rng(seed);
    const n = p.candles;
    const lens: number[] = [];
    let puffSum = 0;
    for (let k = 0; k < n; k++) { const l = p.breath * (0.85 + 0.3 * r()); lens.push(l); puffSum += l; }
    const gaps: number[] = [];
    let gapSum = 0;
    for (let k = 1; k < n; k++) { const g = 0.15 + 0.1 * r(); gaps.push(g); gapSum += g; }
    const strengthK: number[] = [];
    const flutterRate: number[] = [];
    const flutterOff: number[] = [];
    for (let k = 0; k < n; k++) {
      strengthK.push(p.strength * (0.9 + 0.2 * r()));
      flutterRate.push(8 + 6 * r());
      flutterOff.push(r() / flutterRate[k]);
    }
    const emberTail = p.ember ? EMBER_TAIL : 0;
    let total = puffSum + gapSum + emberTail + END_SIL;
    if (total > MAX) {
      const scale = (MAX - 0.005 - gapSum - emberTail - END_SIL) / puffSum;
      for (let k = 0; k < n; k++) lens[k] *= scale;
      total = MAX - 0.005;
    }
    const s = buffer(total);
    let at = 0, puffPeak = 0;
    for (let k = 0; k < n; k++) {
      const m = Math.round(lens[k] * RATE);
      const attack = 0.04 - 0.02 * strengthK[k];
      const decay = Math.max(0.01, (lens[k] - attack) / 3);
      const lp = new Biquad("lowpass", 600 + 1900 * strengthK[k], 1);
      const half = lens[k] / 2;
      const d = 0.7 * p.flutter;
      const period = 1 / flutterRate[k];
      const flat = 0.014, edge = 0.016; // flat-bottom dip, total width 2*edge < 20 ms so neighbours stay out
      for (let i = 0; i < m; i++) {
        const t = i / RATE;
        let env = t < attack ? t / attack : Math.exp(-(t - attack) / decay);
        if (t > half && d > 0) {
          const u = t - (flutterOff[k] + Math.round((t - flutterOff[k]) / period) * period);
          const au = Math.abs(u);
          let att = 0;
          if (au < flat) att = d;
          else if (au < edge) att = d * 0.5 * (1 + Math.cos(Math.PI * (au - flat) / (edge - flat)));
          env *= 1 - att;
        }
        const v = lp.run(white(r) * env) * 0.5;
        s[at + i] = v;
        if (Math.abs(v) > puffPeak) puffPeak = Math.abs(v);
      }
      at += m;
      if (k < n - 1) at += Math.round(gaps[k] * RATE);
    }
    if (p.ember) {
      const r1 = rng(seed + 1), hp = new Biquad("highpass", 4000, 1);
      const count = 3 + Math.floor(r1() * 6);
      for (let g = 0; g < count; g++) {
        const place = Math.round((at / RATE + 0.05 + r1() * 0.24) * RATE);
        const clen = Math.max(4, Math.round((0.001 + 0.002 * r1()) * RATE));
        const gain = puffPeak * 0.05;
        for (let j = 0; j < clen; j++) {
          const idx = place + j;
          if (idx < s.length) s[idx] = hp.run(white(r1)) * gain * Math.exp(-j / Math.max(1, clen / 3));
        }
      }
    }
    return s;
  },
});
