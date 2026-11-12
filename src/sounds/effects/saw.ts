import { Biquad, buffer, envelope, grains, LowPass, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const saw = defineSound({
  id: "saw", category: "effects",
  title: { de: "Säge", en: "Saw" },
  description: {
    de: "Eine Handsäge im Holz: einige Züge hin und zurück, vom groben Reißsägen-Knurren bis zum feinen Fuchsschwanz. Der Stoß ist lauter als der Zug, die Zähne rascheln körnig.",
    en: "A hand saw cutting wood: a few strokes back and forth, from the coarse growl of a rip saw to a fine tenon saw. The push is louder than the pull, and the teeth rasp in grains.",
  },
  params: {
    strokes: { type: "integer", min: 1, max: 8, default: 4, label: { de: "Züge", en: "Strokes" },
      describe: { de: "Wie viele Züge hin und zurück: 1 ein einzelner Schnitt, 4 ein paar Züge, 8 ein langes Brett.", en: "How many strokes back and forth: 1 a single cut, 4 a few strokes, 8 a long board." } },
    tempo: { type: "number", min: 0.8, max: 3, step: 0.1, default: 1.6, label: { de: "Tempo", en: "Tempo" },
      describe: { de: "Züge pro Sekunde: 1 gemächlich, 1,6 zügig, 3 hektisch; ein Zug ist ein Hin und Zurück.", en: "Strokes per second: 1 leisurely, 1.6 brisk, 3 frantic; one stroke is a push and a pull." } },
    pitch: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Klanghöhe", en: "Pitch" },
      describe: { de: "0 eine grobe Reißsäge, tief und rau, 0,5 ein Fuchsschwanz, 1 eine feine, hohe Feinsäge.", en: "0 a coarse rip saw, low and rough, 0.5 a panel saw, 1 a fine, high tenon saw." } },
    push: { type: "number", min: 0, max: 1, step: 0.05, default: 0.6, label: { de: "Stoßbetonung", en: "Push emphasis" },
      describe: { de: "Wie viel lauter der Stoß als der Zug ist: 0 beide gleich, 0,6 deutlich, 1 der Zug ist nur ein leises Zurückgleiten.", en: "How much louder the push is than the pull: 0 both equal, 0.6 clearly, 1 the pull is only a quiet return." } },
    wood: { type: "number", min: 0, max: 1, step: 0.05, default: 0.45, label: { de: "Holzkörper", en: "Wood body" },
      describe: { de: "Anteil der tiefen Holzresonanz unter dem Rasseln: 0 nur die Zähne, 0,45 ein Brett, 1 ein massiver Balken.", en: "Share of low wood resonance under the rasp: 0 only the teeth, 0.45 a board, 1 a solid beam." } },
  },
  presets: {
    carpenter: { label: { de: "Schreiner", en: "Carpenter" }, values: { strokes: 4, tempo: 1.6, pitch: 0.5, push: 0.6, wood: 0.45 } },
    "rip-saw": { label: { de: "Reißsäge", en: "Rip saw" }, values: { pitch: 0.15, tempo: 1.1, strokes: 3 } },
    "fine-saw": { label: { de: "Feinsäge", en: "Fine saw" }, values: { pitch: 0.9, tempo: 2.6, strokes: 6 } },
  },
  loop: false, maxSeconds: 2.5,
  build(p, seed) {
    const r = rng(seed), total = Math.min(2.5, p.strokes / p.tempo), per = total / p.strokes, s = buffer(total);
    const centre = 1200 + 2800 * p.pitch, teeth = 80 + 120 * p.pitch, bodyHz = 150 + 150 * (1 - p.pitch);
    for (let k = 0; k < p.strokes; k++) {
      const at = Math.round(k * per * RATE), len = Math.min(Math.round(per * RATE), s.length - at);
      if (len <= 0) break;
      const push = k % 2 === 0, dir = push ? 1 : -1, loud = push ? 1 : 1 - 0.8 * p.push, jitter = 0.85 + 0.3 * r();
      const bp = new Biquad("bandpass", centre, 1.1), body = new Biquad("bandpass", bodyHz, 1.6);
      const lp = new LowPass(), bite = new Biquad("bandpass", centre * 1.3, 0.9);
      // The rasp swells in and out over the stroke; its band glides up on the push and down on the pull.
      for (let i = 0; i < len; i++) {
        const u = i / Math.max(1, len - 1), t = i / RATE, swell = Math.sin(Math.PI * u) ** 1.2;
        if ((i & 63) === 0) bp.set(centre * (1 + 0.09 * dir * (2 * u - 1)), 1.1);
        const n = white(r), low = body.run(lp.run(n, bodyHz * 2));
        s[at + i] += (bp.run(n) * swell + low * p.wood * 0.8 * swell + bite.run(n) * envelope(t, 0.002, 0.025) * 0.35) * loud * jitter;
      }
      // The teeth: many short noise grains riding on the swell, finer and denser on a fine saw.
      grains(s, r, { start: at / RATE, seconds: per, count: Math.round(teeth * per), hz: centre * (1 + 0.04 * dir), q: 1.2, gain: 0.55 * loud, grain: 0.0022, shape: "bell" });
    }
    // The last stroke ends on its own; a raised-cosine fade over the last 20 ms keeps the contract's edge fade out of it.
    const fade = Math.min(s.length, Math.round(0.02 * RATE));
    for (let i = 0; i < fade; i++) s[s.length - 1 - i] *= 0.5 - 0.5 * Math.cos((Math.PI * i) / fade);
    return s;
  },
});
