import { Biquad, buffer, Osc, RATE, semitones, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const hoot = defineSound({
  id: "hoot", category: "voice",
  title: { de: "Eulenruf", en: "Owl hoot" },
  description: {
    de: "Eine Eule ruft: ein paar weiche, hohle „Huh“, fast reine Töne mit etwas Atem, der letzte lang und zitternd. Vom tiefen Uhu bis zum hellen Waldkauz. Für Wälder, Friedhöfe und Nächte.",
    en: "An owl hooting: a few soft, hollow “hoo”, almost pure tones with a little breath, the last one long and quavering. From a deep eagle owl to a bright tawny owl. For forests, graveyards and nights.",
  },
  params: {
    hoots: { type: "integer", min: 1, max: 4, default: 3, label: { de: "Rufe", en: "Hoots" },
      describe: { de: "Wie viele Rufe hintereinander, der letzte ist doppelt so lang: 1 ein einzelnes Huh, 3 ein Uhu, 4 ein Waldkauz.", en: "How many hoots in a row, the last one twice as long: 1 a single hoo, 3 an eagle owl, 4 a tawny owl." } },
    pitch: { type: "number", min: -8, max: 6, step: 1, default: 0, label: { de: "Tonhöhe (Halbtöne)", en: "Pitch (semitones)" },
      describe: { de: "Höher oder tiefer als der Grundton von etwa 380 Hz, in Halbtönen: −7 ein Uhu, 0 ein Waldkauz, +5 ein kleiner Kauz.", en: "Higher or lower than the base of about 380 Hz, in semitones: −7 an eagle owl, 0 a tawny owl, +5 a small owl." } },
    length: { type: "number", min: 0.1, max: 0.4, step: 0.01, default: 0.22, unit: "s", label: { de: "Länge", en: "Length" },
      describe: { de: "Dauer eines Rufs (der letzte doppelt so lang): 0,12 s kurze Hu-hu, 0,22 s üblich, 0,35 s ein langgezogenes Huuh.", en: "Duration of one hoot (the last twice as long): 0.12 s short hu-hu, 0.22 s usual, 0.35 s a drawn-out hooo." } },
    gap: { type: "number", min: 0.05, max: 0.35, step: 0.01, default: 0.15, unit: "s", label: { de: "Pause", en: "Gap" },
      describe: { de: "Stille zwischen zwei Rufen: 0,06 s schnell wie ein Waldkauz, 0,15 s üblich, 0,3 s ruhig wie ein Uhu.", en: "Silence between two hoots: 0.06 s quick like a tawny owl, 0.15 s usual, 0.3 s calm like an eagle owl." } },
    waver: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Zittern", en: "Waver" },
      describe: { de: "Wie stark der letzte Ruf zittert: 0 ruhig, 0,5 ein leichtes Beben, 0,9 das zitternde Huuu-u-u des Waldkauzes.", en: "How much the last hoot quavers: 0 steady, 0.5 a slight tremble, 0.9 the quavering hoo-oo-oo of a tawny owl." } },
    breath: { type: "number", min: 0, max: 1, step: 0.05, default: 0.3, label: { de: "Atem", en: "Breath" },
      describe: { de: "Wie viel Luft im Ton liegt: 0,1 klar und flötend, 0,3 üblich, 0,7 hauchig und hohl.", en: "How much air is in the tone: 0.1 clear like a flute, 0.3 usual, 0.7 breathy and hollow." } },
  },
  presets: {
    tawny: { label: { de: "Waldkauz", en: "Tawny owl" }, values: { hoots: 4, pitch: 0, length: 0.14, gap: 0.06, waver: 0.9, breath: 0.25 } },
    "eagle-owl": { label: { de: "Uhu", en: "Eagle owl" }, values: { hoots: 2, pitch: -7, length: 0.3, gap: 0.3, waver: 0.1, breath: 0.4 } },
    "lone-hoot": { label: { de: "Einzelner Ruf", en: "Lone hoot" }, values: { hoots: 1, length: 0.35, waver: 0.3 } },
  },
  // longest case: 0.01 s lead-in + 3 hoots × 0.4 s + 0.8 s last + 3 gaps × (0.35 s + 0.02 s jitter) + 0.15 s release = 3.27 s
  loop: false, maxSeconds: 3.4,
  build(p, seed) {
    const r = rng(seed), L = p.length;
    const s = buffer(0.01 + (p.hoots + 1) * L + (p.hoots - 1) * (p.gap + 0.02) + 0.15);
    const one = new Osc("sine"), two = new Osc("sine", 0.25);
    let start = 0.01;
    for (let h = 0; h < p.hoots; h++) {
      if (h > 0) start += r() * 0.02;
      const last = h === p.hoots - 1, len = last ? 2 * L : L;
      const top = semitones(380, p.pitch + (r() - 0.5) * 0.4), laut = 0.85 + 0.15 * r();
      // the breath is noise around the tone's own pitch, so it sounds hollow, not hissing
      const air = new Biquad("bandpass", top, 4);
      const at = Math.round(start * RATE), n = Math.round(len * RATE);
      for (let i = 0; i < n && at + i < s.length; i++) {
        const t = i / RATE, u = t / len;
        // a soft swell in, a hold and a long fade: an owl never starts or stops sharply
        const shape = Math.min(1, u / 0.18, (1 - u) / 0.4) ** 1.5;
        // the pitch slides up a semitone into the hoot and sinks two at its end
        const f = semitones(top, Math.min(1, u / 0.2) - 1 - 2 * Math.max(0, u - 0.6));
        // the last hoot quavers at about 9 Hz in loudness, more towards its end
        const zittern = last ? 1 - p.waver * 0.7 * Math.min(1, u * 1.5) * (0.5 + 0.5 * Math.sin(2 * Math.PI * 9 * t)) : 1;
        const tone = one.next(f) + 0.12 * two.next(2 * f) + p.breath * 1.5 * air.run(white(r));
        s[at + i] += tone * shape * zittern * laut;
      }
      start += len + p.gap;
    }
    return s;
  },
});
