import { buffer, LowPass, mixInto, RATE, semitones } from "../../core/audio";
import { rng } from "../../core/rng";
import { voice, type VoiceKey } from "../../core/voice";
import { defineSound } from "../define";

export const rooster = defineSound({
  id: "rooster", category: "voice",
  title: { de: "Hahnenschrei", en: "Rooster crow" },
  description: {
    de: "Ein Hahn kräht im Morgengrauen: kurze, heisere Silben und ein langer, gehaltener Schlusston, der am Ende abfällt. Für Hofszenen und Weckmomente; auf Wunsch weit entfernt über das Tal mit leisem Echo.",
    en: "A rooster crowing at dawn: short hoarse syllables and a long held last note that falls off at the end. For farm scenes and wake-up moments; if you like far away across the valley with a soft echo.",
  },
  params: {
    pitch: { type: "number", min: -6, max: 6, step: 1, default: 0, label: { de: "Tonhöhe (Halbtöne)", en: "Pitch (semitones)" },
      describe: { de: "Höher oder tiefer als der Grundton des langen Tons (etwa 600 Hz), in Halbtönen: +5 ein Zwerghahn, −4 ein schwerer Hahn.", en: "Higher or lower than the long note (about 600 Hz), in semitones: +5 a bantam, −4 a big rooster." } },
    length: { type: "number", min: 1, max: 3, step: 0.05, default: 1.8, unit: "s", label: { de: "Länge", en: "Length" },
      describe: { de: "Dauer des ganzen Krähens ohne Echo: 1,2 s ein Zwerghahn, 1,8 s ein normaler Hahn, 2,4 s ein alter Hahn.", en: "Duration of the whole crow without echo: 1.2 s a bantam, 1.8 s a normal rooster, 2.4 s an old rooster." } },
    rasp: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Heiserkeit", en: "Rasp" },
      describe: { de: "Wie heiser und brüchig die Stimme ist: 0,3 jung und klar, 0,5 ein Hahn am Morgen, 0,9 ein alter, krächzender Hahn.", en: "How hoarse and broken the voice is: 0.3 young and clear, 0.5 a rooster in the morning, 0.9 an old croaking rooster." } },
    syllables: { type: "integer", min: 3, max: 5, default: 4, label: { de: "Silben", en: "Syllables" },
      describe: { de: "Anzahl der Silben samt langem Schlusston: 3 kurz-kurz-lang, 4 kurz-kurz-kurz-lang, 5 mit einer Silbe mehr. Der letzte Ton nimmt etwa die halbe Länge ein.", en: "Number of syllables including the long last note: 3 short-short-long, 4 short-short-short-long, 5 one more short one. The last note takes about half the length." } },
    distance: { type: "number", min: 0, max: 1, step: 0.05, default: 0, label: { de: "Entfernung", en: "Distance" },
      describe: { de: "Wie weit der Hahn weg ist (nicht leiser, aber dumpfer mit Echo): 0 im Hof, 0,5 am Nachbarhof, 0,8 über das Tal.", en: "How far away the rooster is (not quieter, but duller with an echo): 0 in the yard, 0.5 at the next farm, 0.8 across the valley." } },
  },
  presets: {
    rooster: { label: { de: "Hahn", en: "Rooster" }, values: { pitch: 0, length: 1.8, rasp: 0.5 } },
    bantam: { label: { de: "Zwerghahn", en: "Bantam" }, values: { pitch: 5, length: 1.2, rasp: 0.3 } },
    "old-rooster": { label: { de: "Alter Hahn", en: "Old rooster" }, values: { pitch: -3, rasp: 0.9, length: 2.4 } },
    "far-away": { label: { de: "Weit weg", en: "Far away" }, values: { distance: 0.8 } },
  },
  loop: false, maxSeconds: 3.6,
  build(p, seed) {
    const r = rng(seed), L = p.length, rasp = p.rasp, d = p.distance, n = p.syllables;
    const f0 = semitones(600, p.pitch) * (0.98 + 0.04 * r());
    const gap = 0.05, shorts = n - 1;
    const dur = (0.5 * L - shorts * gap) / shorts;
    const breath = 0.1 + 0.3 * rasp, hiss = 0.05 + 0.3 * rasp, hz = 3000;
    const keys: VoiceKey[] = [{ t: 0, f0: f0 * 0.7, mouth: "schwa", voice: 0, breath, hiss: 0 }];
    let t = 0.02;
    for (let i = 0; i < shorts; i++) {
      const w = dur * (0.9 + 0.2 * r()), top = f0 * (0.9 + 0.03 * i) * (0.97 + 0.06 * r());
      // "er": starts low and closed, rises fast while the mouth opens, then breaks off
      keys.push({ t, f0: top * 0.72, mouth: "schwa", voice: 0.1, breath, hiss, hissHz: hz });
      keys.push({ t: t + 0.3 * w, f0: top * 0.9, mouth: "e", voice: 1, breath, hiss: hiss * 0.5, hissHz: hz });
      keys.push({ t: t + 0.8 * w, f0: top * 1.05, mouth: "ae", voice: 0.9 - 0.3 * rasp * r(), breath, hiss: hiss * 0.5, hissHz: hz });
      keys.push({ t: t + w, f0: top * 1.05, mouth: "ae", voice: 0, breath: 0, hiss: 0 });
      t += w + gap * (0.8 + 0.4 * r());
    }
    // the long note: rises about 4 semitones, holds with a wobble, falls off while the mouth closes ("ooo")
    const hold = Math.max(0.3, L - t - 0.05), top = semitones(f0, 4);
    keys.push({ t, f0: f0 * 0.85, mouth: "ae", voice: 0.2, breath, hiss });
    keys.push({ t: t + 0.18 * hold, f0: top, mouth: "a", voice: 1, breath, hiss: hiss * 0.6, hissHz: hz });
    keys.push({ t: t + 0.4 * hold, f0: top * (1 + 0.015 * r()), mouth: "a", voice: 0.85 + 0.15 * (1 - rasp), breath, hiss: hiss * 0.6, hissHz: hz });
    keys.push({ t: t + 0.65 * hold, f0: top * 0.99, mouth: "o", voice: 0.9, breath: breath * 1.3, hiss: hiss * 0.4, hissHz: hz });
    keys.push({ t: t + 0.9 * hold, f0: semitones(top, -2), mouth: "u", voice: 0.6, breath: breath * 1.5, hiss: 0 });
    keys.push({ t: t + hold, f0: semitones(top, -5), mouth: "u", voice: 0, breath: 0, hiss: 0 });
    keys.push({ t: t + hold + 0.06, f0: semitones(top, -5), mouth: "u", voice: 0, breath: 0 });
    const dry = voice(keys, r, {
      size: 0.45, open: 0.45, jitter: 0.01 + 0.05 * rasp, shimmer: 0.05 + 0.2 * rasp, sub: 0.45 * rasp * rasp,
      growl: 0.25 * rasp, vibrato: 0.15, drive: 0.8 + 1.5 * rasp,
    });
    if (d === 0) return dry;
    // across the valley: air takes the highs (to about 2 kHz) and a soft echo comes back 0.15 to 0.3 s later
    const delay = Math.round((0.15 + 0.15 * d) * RATE), out = buffer(dry.length / RATE + 0.35 + 0.05);
    const cut = 18000 * (2000 / 18000) ** d, lp = [new LowPass(), new LowPass()], lpEcho = new LowPass();
    mixInto(out, dry);
    const wet = new Float32Array(out.length);
    for (let i = 0; i < out.length; i++) {
      let y = i < dry.length ? dry[i] : 0;
      for (const f of lp) y = f.run(y, cut);
      out[i] = y;
      if (i >= delay) wet[i] = lpEcho.run(out[i - delay], cut * 0.6) * 0.4 * d;
    }
    for (let i = delay; i < out.length; i++) out[i] += wet[i];
    return out;
  },
});
