import { Biquad, buffer, envelope, grains, LowPass, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const rollingPin = defineSound({
  id: "rolling-pin", category: "effects",
  title: { de: "Nudelholz", en: "Rolling pin" },
  description: {
    de: "Ein Bäcker rollt Teig aus: ein hölzernes Nudelholz wird einige Male hin und zurück über das bemehlte Brett geschoben. Jede Bahn ist ein weiches, tiefes Holzrumpeln mit trockenem Mehlrascheln, an den Wendepunkten ein kleines Ticken.",
    en: "A baker rolling out dough: a wooden rolling pin pushed away and pulled back a few times over a floured board. Each roll is a soft, low wooden rumble with a dry rustle of flour and a small tick where the pin turns.",
  },
  params: {
    rolls: { type: "integer", min: 2, max: 6, default: 4, label: { de: "Bahnen", en: "Rolls" },
      describe: { de: "Wie viele Bahnen, abwechselnd weg und zurück: 2 ein schnelles Flachdrücken, 4 üblich, 6 eine große Teigplatte. Mehr Bahnen, als in 2,5 s passen, werden schneller.", en: "How many rolls, alternating away and back: 2 a quick flatten, 4 usual, 6 a large sheet. More rolls than fit in 2.5 s are played faster." } },
    tempo: { type: "number", min: 0.3, max: 0.6, step: 0.05, default: 0.45, unit: "s", label: { de: "Tempo", en: "Tempo" },
      describe: { de: "Dauer einer Bahn in Sekunden: 0,3 flott, 0,45 üblich, 0,6 langsam und gleichmäßig. Wird es insgesamt länger als 2,5 s, wird es schneller.", en: "Duration of one roll in seconds: 0.3 brisk, 0.45 usual, 0.6 slow and even. If the total exceeds 2.5 s, it is played faster." } },
    pressure: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Druck", en: "Pressure" },
      describe: { de: "Wie fest der Bäcker drückt: 0 leicht, leise, dünnes Rumpeln um 250 Hz; 1 kräftig, lauter, volleres Rumpeln um 120 Hz mit mehr Tiefe.", en: "How hard the baker presses: 0 light and quiet, a thin rumble around 250 Hz; 1 heavy and louder, a fuller rumble around 120 Hz with more low body." } },
    board: { type: "choice", options: ["wood", "stone"], default: "wood", label: { de: "Unterlage", en: "Board" },
      optionLabels: { wood: { de: "Holzbrett", en: "Wooden board" }, stone: { de: "Marmorplatte", en: "Marble slab" } },
      describe: { de: "Holzbrett: warme Resonanz um 300 Hz, weiches Ticken. Marmorplatte: keine Holzresonanz, heller, härteres Klicken an jeder Wende.", en: "Wooden board: a warm resonance around 300 Hz, soft ticks. Marble slab: no wooden resonance, brighter, a harder click at each turn." } },
  },
  presets: {
    pastry: { label: { de: "Mürbeteig", en: "Pastry" }, values: { rolls: 4 } },
    pizza: { label: { de: "Pizzateig", en: "Pizza" }, values: { rolls: 3, pressure: 0.8, tempo: 0.35 } },
    "marble-slab": { label: { de: "Marmorplatte", en: "Marble slab" }, values: { board: "stone", pressure: 0.3 } },
  },
  loop: false, maxSeconds: 2.5,
  build(p, seed) {
    const r = rng(seed), tail = 0.15, wood = p.board === "wood";
    const per = Math.min(p.tempo, (2.5 - tail) / p.rolls), total = per * p.rolls + tail, s = buffer(total);
    const cut = 400 + 500 * p.pressure, rumbleHz = 250 - 130 * p.pressure, level = 0.35 + 0.65 * p.pressure;
    const tickHz = wood ? 1500 : 3000;
    for (let k = 0; k < p.rolls; k++) {
      const jitter = 0.85 + 0.3 * r(), len = Math.round(per * (0.92 + 0.12 * r()) * RATE), at = Math.round(k * per * RATE);
      const end = Math.min(len, s.length - at);
      const lp = new LowPass(), lp2 = new LowPass(), band = new Biquad("bandpass", rumbleHz, 1.2), warm = new Biquad("bandpass", 300, 2);
      for (let i = 0; i < end; i++) {
        const u = i / Math.max(1, len - 1), swell = Math.sin(Math.PI * u) ** 1.5, n = lp2.run(lp.run(white(r), cut), cut * 1.2);
        s[at + i] += (band.run(n) * 2.4 + (wood ? warm.run(n) * 0.9 : 0) + n * 0.8) * swell * level * jitter;
      }
      // Flour rustle: sparse quiet high grains riding on the roll.
      grains(s, r, { start: at / RATE, seconds: per, count: 8, hz: 3000 + 2000 * r(), q: 1.5, gain: 0.015 * jitter, grain: 0.003, shape: "bell" });
      // The tick where the pin turns (at the start of every roll after the first).
      if (k > 0) {
        const tk = new Biquad("bandpass", tickHz, 2), ms = (wood ? 0.005 : 0.003);
        for (let i = 0; i < Math.round(0.012 * RATE) && at + i < s.length; i++) {
          s[at + i] += tk.run(white(r)) * envelope(i / RATE, 0.0005, ms) * (wood ? 0.22 : 0.4) * (0.8 + 0.4 * r());
        }
      }
    }
    // The last roll ends on its own: a raised-cosine fade over the last 20 ms.
    const fade = Math.min(s.length, Math.round(0.02 * RATE));
    for (let i = 0; i < fade; i++) s[s.length - 1 - i] *= 0.5 - 0.5 * Math.cos((Math.PI * i) / fade);
    return s;
  },
});
