import { Biquad, buffer, envelope, Osc, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const toggle = defineSound({
  id: "toggle", category: "ui",
  title: { de: "Umschalter", en: "Toggle" },
  description: {
    de: "Ein Schalter geht an oder aus: an steigt, aus fällt, so hört man den Zustand. Mechanisch wie ein Kippschalter oder digital wie ein Blip.",
    en: "A switch turns on or off: on rises, off falls, so you can hear the state. Mechanical like a toggle switch or digital like a blip.",
  },
  params: {
    state: { type: "choice", options: ["on", "off"], default: "on", label: { de: "Zustand", en: "State" },
      labels: { on: { de: "An (steigt)", en: "On (rises)" }, off: { de: "Aus (fällt)", en: "Off (falls)" } },
      describe: { de: "An klingt nach oben und hell, aus nach unten und dunkler: nimm beide für denselben Schalter.", en: "On sounds upward and bright, off downward and darker: use both for the same switch." } },
    pitch: { type: "number", min: 600, max: 4000, step: 10, default: 1600, unit: "Hz", label: { de: "Tonhöhe", en: "Pitch" },
      describe: { de: "Höhe des Schalters: 900 Hz satt wie ein Lichtschalter, 1600 Hz üblich, 3000 Hz fein wie ein kleiner Taster.", en: "Pitch of the switch: 900 Hz full like a light switch, 1600 Hz usual, 3000 Hz fine like a small button." } },
    kind: { type: "choice", options: ["mechanical", "digital"], default: "mechanical", label: { de: "Art", en: "Kind" },
      labels: { mechanical: { de: "Mechanisch", en: "Mechanical" }, digital: { de: "Digital", en: "Digital" } },
      describe: { de: "Mechanisch: zwei Klicks wie Hebel und Raste; digital: zwei kurze Töne wie in Einstellungen am Telefon.", en: "Mechanical: two clicks like lever and detent; digital: two short tones like settings on a phone." } },
    spacing: { type: "number", min: 0.015, max: 0.08, step: 0.005, default: 0.035, unit: "s", label: { de: "Abstand", en: "Spacing" },
      describe: { de: "Zeit zwischen den beiden Teilen: 0,02 s knapp und fest, 0,035 s üblich, 0,07 s langsam und deutlich.", en: "Time between the two parts: 0.02 s tight and firm, 0.035 s usual, 0.07 s slow and clear." } },
  },
  presets: {
    "switch-on": { label: { de: "Schalter an", en: "Switch on" }, values: { state: "on", kind: "mechanical" } },
    "switch-off": { label: { de: "Schalter aus", en: "Switch off" }, values: { state: "off", kind: "mechanical" } },
    "digital-on": { label: { de: "Digital an", en: "Digital on" }, values: { state: "on", kind: "digital", pitch: 1200, spacing: 0.05 } },
    "digital-off": { label: { de: "Digital aus", en: "Digital off" }, values: { state: "off", kind: "digital", pitch: 1200, spacing: 0.05 } },
  },
  loop: false, maxSeconds: 0.3,
  build(p, seed) {
    const r = rng(seed), s = buffer(p.spacing + 0.12);
    // On: low then high; off: high then low (a fifth apart)
    const hoehen = p.state === "on" ? [p.pitch / 1.5, p.pitch] : [p.pitch, p.pitch / 1.5];
    hoehen.forEach((hz, n) => {
      const at = Math.round(n * p.spacing * RATE), laut = n === 0 ? 0.75 : 1;
      if (p.kind === "mechanical") {
        const bp = new Biquad("bandpass", hz * 1.4, 2.2), osc = new Osc("sine");
        for (let i = 0; i < 0.03 * RATE && at + i < s.length; i++) {
          const t = i / RATE;
          s[at + i] += (bp.run(white(r)) * 3 + osc.next(hz) * 0.5) * envelope(t, 0.0004, 0.004) * laut;
        }
      } else {
        const osc = new Osc("triangle");
        for (let i = 0; i < 0.07 * RATE && at + i < s.length; i++) {
          const t = i / RATE;
          s[at + i] += osc.next(hz) * envelope(t, 0.002, 0.014) * laut;
        }
      }
    });
    return s;
  },
});
