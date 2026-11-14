import { Biquad, buffer, envelope, grains, RATE, white, type Samples } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const lockTurn = defineSound({
  id: "lock-turn", category: "impact",
  title: { de: "Schlüssel im Schloss", en: "Key in lock" },
  description: {
    de: "Ein Schlüssel im Schloss: er gleitet hinein, die Stifte klicken beim Drehen, und der Riegel schnappt um. Für Türen, Truhen, Vorhängeschlösser und rostige Kerkertüren.",
    en: "A key in a lock: it slides in, the pins click as it turns, and the bolt snaps over. For doors, chests, padlocks and rusty dungeon doors.",
  },
  params: {
    size: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Größe", en: "Size" },
      describe: { de: "Wie groß das Schloss ist: 0 ein kleines Vorhängeschloss (helle Klicks um 4 kHz), 0,5 ein Türschloss, 1 eine schwere Kerkertür (tiefer Riegel um 120 Hz).", en: "How big the lock is: 0 a small padlock (bright clicks around 4 kHz), 0.5 a door lock, 1 a heavy dungeon door (a deep bolt around 120 Hz)." } },
    pins: { type: "integer", min: 1, max: 6, default: 3, label: { de: "Stifte", en: "Pins" },
      describe: { de: "Wie viele Stifte beim Drehen klicken: 1 ein einfacher Riegel, 3 ein Türschloss, 6 ein Sicherheitsschloss.", en: "How many pins click as the key turns: 1 a simple latch, 3 a door lock, 6 a security lock." } },
    turn: { type: "number", min: 0.1, max: 0.8, step: 0.05, default: 0.3, unit: "s", label: { de: "Drehen", en: "Turn" },
      describe: { de: "Wie lange der Schlüssel gedreht wird, bis der Riegel umschnappt: 0,1 s flink, 0,3 s üblich, 0,8 s schwergängig.", en: "How long the key turns before the bolt snaps: 0.1 s quick, 0.3 s usual, 0.8 s stiff." } },
    rust: { type: "number", min: 0, max: 1, step: 0.05, default: 0.2, label: { de: "Rost", en: "Rust" },
      describe: { de: "Wie rostig das Schloss ist: 0 frisch geölt, 0,2 benutzt, 1 ein Kerkerschloss, das beim Drehen schabt und knirscht.", en: "How rusty the lock is: 0 freshly oiled, 0.2 used, 1 a dungeon lock that scrapes and grinds as it turns." } },
    insert: { type: "boolean", default: true, label: { de: "Einstecken", en: "Insert" },
      describe: { de: "Vorher gleitet der Schlüssel hörbar ins Schloss, mit einem leisen Schaben über die Stifte.", en: "First the key slides audibly into the lock, with a soft scrape over the pins." } },
  },
  presets: {
    door: { label: { de: "Türschloss", en: "Door lock" }, values: { size: 0.5, pins: 3, turn: 0.3, rust: 0.1, insert: true } },
    padlock: { label: { de: "Vorhängeschloss", en: "Padlock" }, values: { size: 0.1, pins: 4, turn: 0.15, rust: 0, insert: true } },
    "cell-door": { label: { de: "Kerkertür", en: "Cell door" }, values: { size: 1, pins: 2, turn: 0.7, rust: 0.9, insert: false } },
  },
  loop: false, maxSeconds: 2.2,
  build(p, seed) {
    const r = rng(seed), rein = p.insert ? 0.22 : 0, s = buffer(rein + p.turn + 0.35);
    const hell = 4200 - 2600 * p.size, tief = 420 - 300 * p.size;
    if (p.insert) {
      // The key slides in: a soft scrape with tiny ticks as it passes the pins
      const bp = new Biquad("bandpass", hell * 1.3, 2);
      for (let i = 0; i < 0.16 * RATE; i++) {
        const t = i / RATE;
        s[i] += bp.run(white(r)) * Math.min(1, t / 0.03) * Math.min(1, (0.16 - t) / 0.03) * 0.2;
      }
      grains(s, r, { start: 0.02, seconds: 0.13, count: p.pins + 2, hz: hell * 1.5, q: 6, gain: 0.5, grain: 0.002, shape: "even" });
    }
    const t0 = rein;
    if (p.rust > 0) {
      // Rust: a grinding scrape under the turn
      const bp = new Biquad("bandpass", 900 + 1500 * (1 - p.size), 1.5), at = Math.round(t0 * RATE);
      for (let i = 0; i < p.turn * RATE; i++) {
        const t = i / RATE, x = t / p.turn;
        s[at + i] += bp.run(white(r)) * Math.min(1, x / 0.15) * Math.min(1, (1 - x) / 0.1) * p.rust * 0.35 * (0.6 + 0.4 * Math.sin(2 * Math.PI * 9 * t + r()));
      }
    }
    // The pins: one bright click each as the key turns past it, unevenly spaced when rusty
    for (let k = 0; k < p.pins; k++) {
      const at = t0 + p.turn * ((k + 0.5) / (p.pins + 0.5)) * (1 + (r() - 0.5) * 0.3 * p.rust);
      const i0 = Math.round(at * RATE), bp = new Biquad("bandpass", hell * (0.9 + 0.2 * r()), 8), f = hell * 0.6;
      for (let i = 0; i < 0.03 * RATE; i++) {
        const t = i / RATE;
        s[i0 + i] += (bp.run(white(r)) * envelope(t, 0.0003, 0.005) * 4 + Math.sin(2 * Math.PI * f * t) * envelope(t, 0.0005, 0.008) * 0.6) * (0.7 + 0.3 * r());
      }
    }
    // The bolt snaps over: a sharp clack and a low body thump of the door or case
    const at = Math.round((t0 + p.turn) * RATE), bp = new Biquad("bandpass", hell * 0.5, 3);
    for (let i = 0; at + i < s.length; i++) {
      const t = i / RATE;
      s[at + i] += bp.run(white(r)) * envelope(t, 0.0005, 0.012) * 3 + Math.sin(2 * Math.PI * hell * 0.45 * t) * envelope(t, 0.0005, 0.03) * 0.35 + Math.sin(2 * Math.PI * hell * 0.73 * t) * envelope(t, 0.0005, 0.02) * 0.25
        + Math.sin(2 * Math.PI * tief * t) * envelope(t, 0.002, 0.03 + 0.05 * p.size) * (0.35 + 0.55 * p.size)
        + Math.sin(2 * Math.PI * tief * 2.7 * t) * envelope(t, 0.001, 0.025) * 0.3;
    }
    return s as Samples;
  },
});
