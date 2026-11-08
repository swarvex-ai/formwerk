// Parameters the voices share: one schema entry each, so every voice explains size, pitch and mouth the same way.
import type { ChoiceParam, NumberParam } from "../../core/params";

export const size = (fallback: number, min = 0.6, max = 1.6): NumberParam => ({
  type: "number", min, max, step: 0.05, default: fallback, label: { de: "Körpergröße", en: "Body size" },
  describe: {
    de: "Länge von Rachen und Mund gegen einen Erwachsenen: 0,7 ein Kind oder Kobold, 1 ein Erwachsener, 1,4 ein Hüne. Größer klingt tiefer und voller, auch bei gleicher Tonhöhe.",
    en: "Length of throat and mouth against an adult: 0.7 a child or goblin, 1 an adult, 1.4 a brute. Larger sounds deeper and fuller, even at the same pitch.",
  },
});

export const pitch = (fallback: number, min: number, max: number): NumberParam => ({
  type: "number", min, max, step: 1, default: fallback, unit: "Hz", label: { de: "Tonhöhe", en: "Pitch" },
  describe: {
    de: "Grundton der Stimme: um 110 Hz eine tiefe Männerstimme, 200 Hz eine Frauenstimme, 280 Hz ein Kind.",
    en: "Base pitch of the voice: about 110 Hz a low male voice, 200 Hz a female voice, 280 Hz a child.",
  },
});

export const vowel = (fallback: "ah" | "eh" | "oh" | "uh"): ChoiceParam<"ah" | "eh" | "oh" | "uh"> => ({
  type: "choice", options: ["ah", "eh", "oh", "uh"], default: fallback, label: { de: "Mund", en: "Mouth" },
  labels: { ah: { de: "a (weit offen)", en: "ah (wide open)" }, eh: { de: "e (breit)", en: "eh (wide)" }, oh: { de: "o (rund)", en: "oh (round)" }, uh: { de: "ö (halb offen)", en: "uh (half open)" } },
  describe: {
    de: "Mundform des Lauts: a für Rufe und Schreie, e für gepresste Laute, o für Stöhnen, ö für kurze Anstrengung.",
    en: "Mouth shape of the sound: ah for shouts and screams, eh for pressed sounds, oh for groans, uh for short efforts.",
  },
});
