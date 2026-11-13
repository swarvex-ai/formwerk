import { Biquad, buffer, Osc, RATE, semitones, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const horn = defineSound({
  id: "horn", category: "effects",
  title: { de: "Horn", en: "Horn" },
  description: {
    de: "Ein langer geblasener Ton eines Tierhorns oder Messinghorns: schwillt an, gleitet von unten in den Ton, ein langsames feines Vibrato, verklingt dann.",
    en: "One long blown note of an animal or brass horn: swelling in, lips sliding up into the note, a slow small vibrato, then falling away.",
  },
  params: {
    pitch: { type: "number", min: 70, max: 400, step: 1, default: 130, unit: "Hz", label: { de: "Tonhöhe", en: "Pitch" },
      describe: { de: "Grundton des Horns: 110 Hz ein tiefes Kriegshorn, 260 Hz ein Jagdhorn.", en: "Pitch of the horn: 110 Hz a deep war horn, 260 Hz a hunting horn." } },
    seconds: { type: "number", min: 0.5, max: 2.4, step: 0.05, default: 1.6, unit: "s", label: { de: "Dauer", en: "Duration" },
      describe: { de: "Wie lange der Ton gehalten wird: 0,9 s kurz, 1,6 s üblich, 2,4 s ein langes Signal.", en: "How long the note is held: 0.9 s short, 1.6 s typical, 2.4 s a long signal." } },
    brightness: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Helligkeit", en: "Brightness" },
      describe: { de: "Klangfarbe: 0,2 weich und hohl (Muschelhorn), 0,8 scharf und blechern.", en: "Timbre: 0.2 soft and hollow (conch), 0.8 brassy." } },
    rise: { type: "number", min: 0, max: 5, step: 0.5, default: 2, label: { de: "Einschleifen", en: "Rise" },
      describe: { de: "Wie weit unter dem Zielton das Anblasen beginnt: 0 sofort sauber, 2 Halbtöne üblich, 5 Halbtöne ein schweres Ziehen.", en: "How far below the note the blow starts: 0 clean onset, 2 semitones typical, 5 semitones heavy lip bend." } },
    breath: { type: "number", min: 0, max: 1, step: 0.05, default: 0.3, label: { de: "Blasgeräusch", en: "Breath" },
      describe: { de: "Luftrauschen im Ton: 0 reiner Ton, 0,3 üblich, 0,6 ein raues Muschelhorn.", en: "Air noise in the tone: 0 pure tone, 0.3 typical, 0.6 a rough conch." } },
  },
  presets: {
    "war-horn": { label: { de: "Kriegshorn", en: "War horn" }, values: { pitch: 110, seconds: 2, brightness: 0.65, rise: 3 } },
    "hunting-horn": { label: { de: "Jagdhorn", en: "Hunting horn" }, values: { pitch: 260, seconds: 0.9, brightness: 0.8, rise: 1 } },
    conch: { label: { de: "Muschelhorn", en: "Conch" }, values: { pitch: 180, brightness: 0.2, breath: 0.6, rise: 0.5 } },
  },
  loop: false, maxSeconds: 2.5,
  build(p, seed) {
    const r = rng(seed), s = buffer(p.seconds + 0.05), n = s.length;
    const ton = new Osc("saw", r()), lp = new Biquad("lowpass", 800, 1.2), luft = new Biquad("bandpass", p.pitch * 5, 2);
    const ausklang = Math.min(0.35, p.seconds * 0.3), ende = p.seconds;
    for (let i = 0; i < n; i++) {
      const t = i / RATE;
      const an = Math.min(1, t / 0.08);
      const ab = t >= ende ? 0 : t > ende - ausklang ? 0.5 + 0.5 * Math.cos(Math.PI * (t - ende + ausklang) / ausklang) : 1;
      const env = an * ab;
      const gleit = Math.min(1, t / 0.15);
      const hz = semitones(p.pitch, -p.rise * (1 - gleit) * (1 - gleit)) * (1 + 0.004 * Math.sin(2 * Math.PI * 5 * t));
      lp.set(p.pitch * (1.5 + 10 * p.brightness * env), 1.2);
      s[i] = lp.run(ton.next(hz)) * env + luft.run(white(r)) * env * p.breath * 0.3;
    }
    return s;
  },
});
