import { rng } from "../../core/rng";
import { MOUTH_OF, voice, type VoiceKey } from "../../core/voice";
import { defineSound } from "../define";
import { pitch, size, vowel } from "./shared";

export const pain = defineSound({
  id: "pain", category: "voice",
  title: { de: "Schmerz", en: "Pain" },
  description: {
    de: "Ein Schmerzlaut ohne Worte: vom kurzen „uh“ bei einem Treffer bis zum Schrei, mit fallender Stimme für einen Sturz oder das Ende. Aus einer Stimme in Code. Jeder Seed klingt etwas anders.",
    en: "A cry of pain without words: from a short “uh” when hit to a scream, with a falling voice for a fall or the end. From a voice in code. Every seed sounds a little different.",
  },
  params: {
    intensity: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Heftigkeit", en: "Intensity" },
      describe: { de: "Wie sehr es weh tut: 0,3 ein Kratzer, 0,6 ein harter Treffer, 1 ein Schrei.", en: "How much it hurts: 0.3 a scratch, 0.6 a hard hit, 1 a scream." } },
    fall: { type: "number", min: 0, max: 1, step: 0.05, default: 0.2, label: { de: "Abfallen", en: "Fall" },
      describe: { de: "Wie weit die Stimme am Ende sinkt und verhaucht: 0 bleibt oben, 1 für einen Sturz in die Tiefe oder das Ende einer Figur.", en: "How far the voice sinks and fades into breath at the end: 0 stays up, 1 for a long fall or a character's end." } },
    pitch: pitch(150, 80, 400),
    size: size(1),
    vowel: vowel("ah"),
    length: { type: "number", min: 0.2, max: 1.6, step: 0.01, default: 0.45, unit: "s", label: { de: "Länge", en: "Length" },
      describe: { de: "Wie lange der Laut dauert: 0,25 s bei einem Treffer, 0,6 s bei einem schweren, 1,4 s für ein langes Ende.", en: "How long the sound lasts: 0.25 s when hit, 0.6 s for a heavy hit, 1.4 s for a long end." } },
  },
  presets: {
    hurt: { label: { de: "Getroffen", en: "Hurt" }, values: { intensity: 0.4, fall: 0.1, length: 0.28, vowel: "uh" } },
    "heavy-hit": { label: { de: "Schwer getroffen", en: "Heavy hit" }, values: { intensity: 0.8, fall: 0.3, length: 0.6, vowel: "ah" } },
    defeat: { label: { de: "Niederlage", en: "Defeat" }, values: { intensity: 0.6, fall: 1, length: 1.4, vowel: "oh" } },
    scream: { label: { de: "Schrei", en: "Scream" }, values: { intensity: 1, fall: 0.2, pitch: 330, length: 0.9, vowel: "ah" } },
  },
  loop: false, maxSeconds: 1.7,
  build(p, seed) {
    const r = rng(seed), m = MOUTH_OF[p.vowel], L = p.length, i = p.intensity, f0 = p.pitch * (0.97 + 0.06 * r());
    const ende = p.fall > 0.5 ? "u" : "schwa";
    const keys: VoiceKey[] = [
      { t: 0, f0: f0 * (1 + 0.15 * i), mouth: m, voice: 0, breath: 0.3 },
      { t: 0.012, f0: f0 * (1 + 0.15 * i), mouth: m, voice: 0.8, breath: 0.25 },
      { t: 0.03 + 0.12 * L, f0: f0 * (1 + 0.5 * i), mouth: m, voice: 1, breath: 0.2 + 0.2 * i },
      { t: 0.65 * L, f0: f0 * (1 + 0.2 * i - 0.25 * p.fall), mouth: m, voice: 0.85 - 0.3 * p.fall, breath: 0.25 + 0.3 * p.fall },
      { t: L, f0: f0 * (1 - 0.45 * p.fall), mouth: ende, voice: 0, breath: 0.2 + 0.4 * p.fall },
      { t: L + 0.06, f0: f0 * (1 - 0.45 * p.fall), mouth: ende, voice: 0, breath: 0 },
    ];
    return voice(keys, r, { size: p.size, open: 0.55, jitter: 0.01 + 0.04 * i, shimmer: 0.04 + 0.1 * i, vibrato: 0.35 * i, sub: 0.25 * i, drive: 0.8 + 2.2 * i });
  },
});
