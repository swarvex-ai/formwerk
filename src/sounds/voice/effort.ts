import { rng } from "../../core/rng";
import { MOUTH_OF, voice, type VoiceKey } from "../../core/voice";
import { defineSound } from "../define";
import { pitch, size, vowel } from "./shared";

export const effort = defineSound({
  id: "effort", category: "voice",
  title: { de: "Anstrengung", en: "Effort" },
  description: {
    de: "Ein kurzer Laut der Anstrengung ohne Worte: beim Springen, Zuschlagen oder Heben. Aus einer Stimme in Code, nicht aus einer Aufnahme. Jeder Seed klingt etwas anders.",
    en: "A short sound of effort without words: jumping, striking or lifting. From a voice in code, not a recording. Every seed sounds a little different.",
  },
  params: {
    force: { type: "number", min: 0, max: 1, step: 0.05, default: 0.6, label: { de: "Kraft", en: "Force" },
      describe: { de: "Wie viel Kraft dahinter steckt: 0,2 ein leises „hm“, 0,5 ein Sprung, 1 ein Angriffsschrei.", en: "How much force is behind it: 0.2 a quiet “hm”, 0.5 a jump, 1 an attack shout." } },
    strain: { type: "number", min: 0, max: 1, step: 0.05, default: 0.3, label: { de: "Pressen", en: "Strain" },
      describe: { de: "Wie gepresst und rau die Stimme ist: 0 locker, 0,5 beim Klettern, 1 beim Heben einer schweren Last.", en: "How pressed and rough the voice is: 0 relaxed, 0.5 climbing, 1 lifting a heavy load." } },
    pitch: pitch(125, 70, 330),
    size: size(1),
    vowel: vowel("uh"),
    length: { type: "number", min: 0.15, max: 0.8, step: 0.01, default: 0.3, unit: "s", label: { de: "Länge", en: "Length" },
      describe: { de: "Wie lange der Laut dauert: 0,2 s beim Springen, 0,35 s beim Zuschlagen, 0,7 s beim Heben.", en: "How long the sound lasts: 0.2 s jumping, 0.35 s striking, 0.7 s lifting." } },
  },
  presets: {
    jump: { label: { de: "Sprung", en: "Jump" }, values: { force: 0.45, strain: 0.2, length: 0.2, vowel: "uh" } },
    attack: { label: { de: "Angriff", en: "Attack" }, values: { force: 1, strain: 0.4, length: 0.38, vowel: "ah" } },
    lift: { label: { de: "Schwer heben", en: "Heavy lift" }, values: { force: 0.7, strain: 0.9, length: 0.7, vowel: "eh" } },
    small: { label: { de: "Kobold", en: "Goblin" }, values: { force: 0.6, strain: 0.5, pitch: 250, size: 0.7, length: 0.25, vowel: "ah" } },
  },
  loop: false, maxSeconds: 0.9,
  build(p, seed) {
    const r = rng(seed), m = MOUTH_OF[p.vowel], L = p.length, f = p.force, v = 0.97 + 0.06 * r();
    const h = 0.015 + 0.035 * (1 - f), f0 = p.pitch * v;
    const keys: VoiceKey[] = [
      { t: 0, f0, mouth: m, voice: 0 },
      { t: 0.004, f0, mouth: m, voice: 0, breath: 0.5 + 0.5 * f },
      { t: h, f0: f0 * (1 + 0.1 * f), mouth: m, voice: 0.6 + 0.4 * f, breath: 0.3 },
      { t: h + 0.25 * (L - h), f0: f0 * (1 + 0.2 * f), mouth: m, voice: 1, breath: 0.15 + 0.2 * p.strain },
      { t: L * 0.8, f0: f0 * 0.85, mouth: m, voice: 0.45, breath: 0.3 + 0.3 * p.strain },
      { t: L, f0: f0 * 0.7, mouth: "schwa", voice: 0, breath: 0.15 },
      { t: L + 0.06, f0: f0 * 0.7, mouth: "schwa", voice: 0, breath: 0 },
    ];
    return voice(keys, r, {
      size: p.size, open: 0.6 - 0.18 * p.strain - 0.08 * f, jitter: 0.01 + 0.05 * p.strain, shimmer: 0.04 + 0.12 * p.strain,
      sub: 0.5 * p.strain, drive: 0.5 + 2 * f,
    });
  },
});
