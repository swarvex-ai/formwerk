import { semitones } from "../../core/audio";
import { rng } from "../../core/rng";
import { MOUTH_OF, voice, type VoiceKey } from "../../core/voice";
import { defineSound } from "../define";
import { vowel } from "./shared";

export const creature = defineSound({
  id: "creature", category: "voice",
  title: { de: "Kreatur", en: "Creature" },
  description: {
    de: "Brüllen, Knurren oder Fiepen eines Wesens: vom kleinen Tier bis zum Riesen. Die Größe macht Rachen und Stimme länger, die Wildheit rau und knurrend. Jeder Seed klingt etwas anders.",
    en: "A roar, snarl or squeak of a creature: from a small animal to a giant. Size makes throat and voice longer, aggression rough and growling. Every seed sounds a little different.",
  },
  params: {
    size: { type: "number", min: 0.3, max: 3, step: 0.05, default: 1.8, label: { de: "Größe", en: "Size" },
      describe: { de: "Wie groß das Wesen ist: 0,3 ein kleines Tier, 1 menschengroß, 2 ein Troll, 3 ein Riese oder Drache. Größer ist tiefer.", en: "How big the creature is: 0.3 a small animal, 1 human-sized, 2 a troll, 3 a giant or dragon. Larger is deeper." } },
    aggression: { type: "number", min: 0, max: 1, step: 0.05, default: 0.7, label: { de: "Wildheit", en: "Aggression" },
      describe: { de: "Wie wild es klingt: 0 ein ruhiges Stöhnen, 0,5 ein Knurren, 1 ein rasendes Brüllen.", en: "How wild it sounds: 0 a calm groan, 0.5 a growl, 1 a raging roar." } },
    pitch: { type: "number", min: -12, max: 12, step: 1, default: 0, label: { de: "Tonhöhe (Halbtöne)", en: "Pitch (semitones)" },
      describe: { de: "Höher oder tiefer als für die Größe üblich, in Halbtönen: +7 für ein kreischendes Wesen, −7 für ein besonders dunkles.", en: "Higher or lower than usual for the size, in semitones: +7 for a shrieking creature, −7 for a very dark one." } },
    vowel: vowel("ah"),
    length: { type: "number", min: 0.3, max: 2.5, step: 0.01, default: 1.2, unit: "s", label: { de: "Länge", en: "Length" },
      describe: { de: "Wie lange der Laut dauert: 0,4 s für ein Fauchen, 1,2 s für ein Brüllen, 2 s für einen Ruf über das Tal.", en: "How long the sound lasts: 0.4 s for a snarl, 1.2 s for a roar, 2 s for a call across the valley." } },
  },
  presets: {
    roar: { label: { de: "Brüllen", en: "Roar" }, values: { size: 2, aggression: 0.9, length: 1.4, vowel: "ah" } },
    snarl: { label: { de: "Fauchen", en: "Snarl" }, values: { size: 0.9, aggression: 0.8, length: 0.5, vowel: "eh" } },
    critter: { label: { de: "Kleines Tier", en: "Critter" }, values: { size: 0.35, aggression: 0.2, pitch: 5, length: 0.4, vowel: "eh" } },
    giant: { label: { de: "Riese", en: "Giant" }, values: { size: 3, aggression: 0.3, length: 2.2, vowel: "oh" } },
  },
  loop: false, maxSeconds: 2.6,
  build(p, seed) {
    const r = rng(seed), m = MOUTH_OF[p.vowel], L = p.length, a = p.aggression;
    const f0 = semitones(110 / p.size ** 1.1, p.pitch) * (0.95 + 0.1 * r());
    const keys: VoiceKey[] = [
      { t: 0, f0: f0 * 0.85, mouth: "u", voice: 0, breath: 0.4 },
      { t: 0.25 * L, f0: f0 * 1.05, mouth: m, voice: 1, breath: 0.3 + 0.6 * a },
      { t: 0.55 * L, f0: f0 * (1.1 + 0.1 * r()), mouth: m, voice: 1, breath: 0.3 + 0.6 * a },
      { t: 0.9 * L, f0: f0 * 0.85, mouth: "o", voice: 0.5, breath: 0.3 + 0.4 * a },
      { t: L, f0: f0 * 0.75, mouth: "u", voice: 0, breath: 0.2 },
      { t: L + 0.07, f0: f0 * 0.75, mouth: "u", voice: 0, breath: 0 },
    ];
    return voice(keys, r, {
      size: p.size, open: 0.5, jitter: 0.02 + 0.08 * a, shimmer: 0.05 + 0.15 * a, sub: 0.2 + 0.6 * a, growl: 0.6 * a,
      vibrato: p.size < 0.6 ? 0.6 : 0, drive: 0.5 + 3 * a,
    });
  },
});
