import { RATE } from "../../core/audio";
import { rng } from "../../core/rng";
import { voice, type Mouth, type VoiceKey } from "../../core/voice";
import { defineSound } from "../define";
import { pitch, size } from "./shared";

// Sounds of the made-up language: vowels and a few consonants of many languages, no words of a real one
const VOKALE: Mouth[] = ["a", "e", "i", "o", "u", "ae"];
const KONSONANTEN = ["", "", "h", "m", "n", "l", "b", "d", "g", "s", "sh"] as const;
const PLOSIV = { b: 900, d: 3500, g: 2000 } as const;
const STIMMUNG = {
  statement: { tempo: 1, spanne: 0.12, start: 1, ende: 0.82, rau: 0 },
  question: { tempo: 1, spanne: 0.12, start: 0.95, ende: 1.4, rau: 0 },
  excited: { tempo: 1.2, spanne: 0.3, start: 1.15, ende: 1.05, rau: 0 },
  grumpy: { tempo: 0.85, spanne: 0.06, start: 0.95, ende: 0.78, rau: 0.5 },
} as const;
const LAENGSTE = 3.8;

export const babble = defineSound({
  id: "babble", category: "voice",
  title: { de: "Plappern", en: "Babble" },
  description: {
    de: "Eine Stimme in einer erfundenen Sprache für Dialoge und Sprechblasen: Silben ohne echte Wörter, mit Satzmelodie für Aussage, Frage, Aufregung oder Grummeln, auch als Roboter. Jeder Seed sagt etwas anderes.",
    en: "A voice in a made-up language for dialogue and speech bubbles: syllables without real words, with the melody of a statement, question, excitement or grumbling, also as a robot. Every seed says something else.",
  },
  params: {
    syllables: { type: "integer", min: 2, max: 12, default: 6, label: { de: "Silben", en: "Syllables" },
      describe: { de: "Wie viele Silben: 2 für einen kurzen Ausruf, 6 für einen Satz, 12 für eine lange Rede.", en: "How many syllables: 2 for a short exclamation, 6 for a sentence, 12 for a long speech." } },
    mood: { type: "choice", options: ["statement", "question", "excited", "grumpy"], default: "statement", label: { de: "Stimmung", en: "Mood" },
      labels: { statement: { de: "Aussage", en: "Statement" }, question: { de: "Frage", en: "Question" }, excited: { de: "Aufgeregt", en: "Excited" }, grumpy: { de: "Grummelig", en: "Grumpy" } },
      describe: { de: "Satzmelodie: Aussage sinkt am Ende, Frage steigt, aufgeregt springt sie, grummelig bleibt sie tief und rau.", en: "Melody of the sentence: a statement falls at the end, a question rises, excited jumps around, grumpy stays low and rough." } },
    pitch: pitch(140, 80, 350),
    size: size(1, 0.7, 1.3),
    speed: { type: "number", min: 0.6, max: 1.8, step: 0.05, default: 1, label: { de: "Tempo", en: "Speed" },
      describe: { de: "Wie schnell gesprochen wird: 0,7 bedächtig, 1 normal, 1,5 hastig.", en: "How fast the voice speaks: 0.7 measured, 1 normal, 1.5 hasty." } },
    voice: { type: "choice", options: ["human", "robot"], default: "human", label: { de: "Stimme", en: "Voice" },
      labels: { human: { de: "Mensch", en: "Human" }, robot: { de: "Roboter", en: "Robot" } },
      describe: { de: "Mensch mit natürlicher, leicht schwankender Stimme, oder Roboter: summende Pulse, Töne in Stufen, metallischer Klang.", en: "Human with a natural, slightly wavering voice, or robot: buzzing pulses, pitch in steps, a metallic ring." } },
  },
  presets: {
    villager: { label: { de: "Dorfbewohner", en: "Villager" }, values: { syllables: 6, mood: "statement" } },
    "child-question": { label: { de: "Kind fragt", en: "Child asks" }, values: { syllables: 5, mood: "question", pitch: 290, size: 0.75, speed: 1.15 } },
    grumpy: { label: { de: "Grummelig", en: "Grumpy" }, values: { syllables: 7, mood: "grumpy", pitch: 95, size: 1.2, speed: 0.8 } },
    robot: { label: { de: "Roboter", en: "Robot" }, values: { syllables: 6, voice: "robot", pitch: 120, speed: 1.1 } },
  },
  loop: false, maxSeconds: LAENGSTE + 0.1,
  build(p, seed) {
    const r = rng(seed), st = STIMMUNG[p.mood], roboter = p.voice === "robot", tempo = p.speed * st.tempo;
    const keys: VoiceKey[] = [];
    let t = 0.01, pausen = 0;
    const ton = (n: number) => {
      const lage = st.start + (st.ende - st.start) * (n / Math.max(1, p.syllables - 1)) ** 2;
      const akzent = r() < 0.3 ? 1 + st.spanne : 1 + (r() - 0.5) * st.spanne * 0.5;
      const hz = p.pitch * lage * akzent;
      return roboter ? p.pitch * (hz > p.pitch * 1.05 ? 1.26 : hz < p.pitch * 0.9 ? 0.84 : 1) : hz;
    };
    let vorher: Mouth = "schwa";
    keys.push({ t: 0, f0: p.pitch, mouth: "schwa", voice: 0 });
    for (let n = 0; n < p.syllables; n++) {
      const vokal = VOKALE[Math.floor(r() * VOKALE.length)], k = KONSONANTEN[Math.floor(r() * KONSONANTEN.length)];
      const dauer = (0.08 + 0.06 * r()) / tempo, f0 = ton(n), letzte = n === p.syllables - 1;
      // the voice of the last syllable fades over 12 ms before the next sound starts (a jump would click)
      const tk = n === 0 ? t : t + 0.012 / tempo;
      if (k === "h") keys.push({ t: tk, f0, mouth: vokal, voice: 0, breath: 1 }, { t: tk + 0.03 / tempo, f0, mouth: vokal, voice: 0.9, breath: 0.2 });
      else if (k === "m" || k === "n" || k === "l") keys.push({ t: tk, f0, mouth: k, voice: 0.4, breath: 0 }, { t: tk + 0.04 / tempo, f0, mouth: k, voice: 0.4 });
      else if (k === "s" || k === "sh") {
        const hz = k === "s" ? 6000 : 2800;
        keys.push({ t: tk, f0, mouth: vorher, voice: 0, hiss: 0.9, hissHz: hz }, { t: tk + 0.06 / tempo, f0, mouth: vokal, voice: 0, hiss: 0.7, hissHz: hz });
      } else if (k === "b" || k === "d" || k === "g") {
        const hz = PLOSIV[k];
        keys.push({ t: tk, f0, mouth: vorher, voice: 0 }, { t: tk + 0.025 / tempo, f0, mouth: vokal, voice: 0, hiss: 0.8, hissHz: hz }, { t: tk + 0.035 / tempo, f0, mouth: vokal, voice: 0.6, hiss: 0, hissHz: hz });
      } else keys.push({ t: tk, f0, mouth: vokal, voice: 0.3 });
      const anfang = keys[keys.length - 1].t;
      t = Math.max(t, anfang) + dauer;
      keys.push({ t: anfang + dauer * 0.45, f0, mouth: vokal, voice: 1, breath: 0.08 }, { t, f0: f0 * (letzte ? 0.95 : 0.98), mouth: vokal, voice: letzte ? 0 : 0.7 });
      vorher = vokal;
      if (!letzte && pausen < 2 && r() < 0.15) { pausen++; keys.push({ t: t + 0.015, f0, mouth: vokal, voice: 0 }); t += (0.06 + 0.05 * r()) / tempo; keys.push({ t, f0, mouth: vokal, voice: 0 }); }
    }
    keys.push({ t: t + 0.06, f0: p.pitch * st.ende, mouth: vorher, voice: 0 });
    // Long speeches at a slow tempo are squeezed into the budget
    const ende = keys[keys.length - 1].t;
    if (ende > LAENGSTE) for (const k of keys) k.t *= LAENGSTE / ende;
    for (let i = 1; i < keys.length; i++) keys[i].t = Math.max(keys[i].t, keys[i - 1].t + 1e-4);
    const s = voice(keys, r, roboter
      ? { size: p.size, buzz: true, jitter: 0, shimmer: 0, drive: 1 }
      : { size: p.size, jitter: 0.012 + 0.02 * st.rau, shimmer: 0.05, sub: st.rau * 0.5, open: 0.6, drive: 0.6 });
    if (roboter) for (let i = 0; i < s.length; i++) s[i] *= 0.55 + 0.45 * Math.sin((2 * Math.PI * 90 * i) / RATE);
    return s;
  },
});
