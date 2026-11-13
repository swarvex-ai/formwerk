import { semitones } from "../../core/audio";
import { rng } from "../../core/rng";
import { voice, type VoiceKey } from "../../core/voice";
import { defineSound } from "../define";

export const crow = defineSound({
  id: "crow", category: "voice",
  title: { de: "Krähe", en: "Crow" },
  description: {
    de: "Eine Krähe oder ein Rabe ruft: ein oder mehrere harte, krächzende „Kraa“, jedes mit weit geöffnetem Schnabel am Anfang und fallender Tonhöhe. Für Friedhöfe, Felder und unheimliche Momente.",
    en: "A crow or raven cawing: one or more harsh, croaking “kraa”, each starting with the beak wide open and the pitch falling. For graveyards, fields and spooky moments.",
  },
  params: {
    caws: { type: "integer", min: 1, max: 5, default: 3, label: { de: "Rufe", en: "Caws" },
      describe: { de: "Wie viele Rufe hintereinander: 1 ein einzelner Ruf, 3 eine Krähe, 5 ein aufgeregter Vogel.", en: "How many caws in a row: 1 a single call, 3 a crow, 5 an excited bird." } },
    pitch: { type: "number", min: -6, max: 6, step: 1, default: 0, label: { de: "Tonhöhe (Halbtöne)", en: "Pitch (semitones)" },
      describe: { de: "Höher oder tiefer als der Grundton von etwa 700 Hz, in Halbtönen: −5 ein Rabe, +5 eine Dohle.", en: "Higher or lower than the base of about 700 Hz, in semitones: −5 a raven, +5 a jackdaw." } },
    length: { type: "number", min: 0.15, max: 0.4, step: 0.01, default: 0.25, unit: "s", label: { de: "Länge", en: "Length" },
      describe: { de: "Dauer eines Rufs: 0,16 s eine Dohle, 0,25 s eine Krähe, 0,35 s ein Rabe.", en: "Duration of one caw: 0.16 s a jackdaw, 0.25 s a crow, 0.35 s a raven." } },
    gap: { type: "number", min: 0.1, max: 0.4, step: 0.01, default: 0.18, unit: "s", label: { de: "Pause", en: "Gap" },
      describe: { de: "Stille zwischen zwei Rufen: 0,12 s hastig, 0,18 s normal, 0,35 s ruhig und unheimlich.", en: "Silence between two caws: 0.12 s hasty, 0.18 s normal, 0.35 s calm and eerie." } },
    rasp: { type: "number", min: 0, max: 1, step: 0.05, default: 0.6, label: { de: "Krächzen", en: "Rasp" },
      describe: { de: "Wie hart und krächzend die Stimme ist: 0,3 klar wie eine Dohle, 0,6 eine Krähe, 0,85 ein heiserer Rabe.", en: "How harsh and croaking the voice is: 0.3 clear like a jackdaw, 0.6 a crow, 0.85 a hoarse raven." } },
  },
  presets: {
    crow: { label: { de: "Krähe", en: "Crow" }, values: { caws: 3, pitch: 0, length: 0.25, gap: 0.18, rasp: 0.6 } },
    raven: { label: { de: "Rabe", en: "Raven" }, values: { pitch: -5, rasp: 0.85, caws: 2, length: 0.32 } },
    jackdaw: { label: { de: "Dohle", en: "Jackdaw" }, values: { pitch: 5, caws: 4, length: 0.16, gap: 0.12, rasp: 0.3 } },
    "lone-caw": { label: { de: "Einzelner Ruf", en: "Lone caw" }, values: { caws: 1, length: 0.35 } },
  },
  loop: false, maxSeconds: 3.8,
  build(p, seed) {
    const r = rng(seed), rasp = p.rasp, L = p.length;
    const breath = 0.05 + 0.15 * rasp, hiss = 0.05 + 0.4 * rasp, hz = 2800;
    const keys: VoiceKey[] = [{ t: 0, f0: semitones(700, p.pitch), mouth: "schwa", voice: 0, breath: 0, hiss: 0 }];
    let t = 0.01;
    for (let i = 0; i < p.caws; i++) {
      if (i > 0) t += Math.max(0, (r() * 2 - 1) * 0.02);
      const top = semitones(700, p.pitch + (r() * 2 - 1));
      const k = (f: number, m: number, mouth: VoiceKey["mouth"], v: number, h: number): VoiceKey =>
        ({ t: t + f * L, f0: semitones(top, m), mouth, voice: v, breath, hiss: h, hissHz: hz });
      // "kraa": a burst, the beak wide open ("ah") with the pitch at its top, then falling 3 semitones towards "uh"
      keys.push({ t, f0: semitones(top, -1), mouth: "schwa", voice: 0, breath: 0, hiss: 0 });
      keys.push(k(0.06, 0, "a", 0.9 - 0.2 * rasp * r(), hiss * 1.5));
      keys.push(k(0.3, 0, "a", 1 - 0.3 * rasp * r(), hiss));
      keys.push(k(0.7, -2, "ae", 0.9 - 0.3 * rasp * r(), hiss * 0.8));
      keys.push(k(0.9, -3, "ae", 0.5, hiss * 0.5));
      keys.push({ t: t + L, f0: semitones(top, -3.2), mouth: "ae", voice: 0, breath: 0, hiss: 0 });
      t += L + p.gap;
    }
    // the last caw's end is already silent; a short release closes the sound
    const last = keys[keys.length - 1];
    keys.push({ ...last, t: last.t + 0.05 });
    return voice(keys, r, {
      size: 0.4, open: 0.45, jitter: 0.01 + 0.05 * rasp, shimmer: 0.05 + 0.25 * rasp, sub: 0.5 * rasp,
      growl: 0.3 * rasp, vibrato: 0, drive: 0.8 + 1.8 * rasp,
    });
  },
});
