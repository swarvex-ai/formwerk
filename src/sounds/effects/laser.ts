import { buffer, envelope, LowPass, mixInto, Osc, RATE, semitones } from "../../core/audio";
import { defineSound } from "../define";

// One shot of a beam gun: a bright tick, a pitch that dives, a short tail. The echo is the same shot again, quiet and
// late. The tail ends on a raised cosine, so the last sample really is zero and no broadband edge is left behind.
export const laser = defineSound({
  id: "laser", category: "effects",
  title: { de: "Laserschuss", en: "Laser shot" },
  description: {
    de: "Ein Energieschuss: heller Anschlag, die Tonhöhe stürzt ab, ein kurzer Nachhall, optional eine leise Wiederholung.",
    en: "An energy shot: a bright attack, the pitch dives, a short tail, optionally a quiet repeat.",
  },
  params: {
    pitch: { type: "number", min: 600, max: 4000, step: 10, default: 1800, unit: "Hz", label: { de: "Tonhöhe", en: "Pitch" },
      describe: { de: "Die Frequenz des Anschlags: 600 Hz ein schwerer Strahler, 1800 Hz ein Gewehr, 4000 Hz eine helle Pistole.", en: "The frequency of the attack: 600 Hz a heavy blaster, 1800 Hz a rifle, 4000 Hz a bright pistol." } },
    sweep: { type: "number", min: 1, max: 36, step: 1, default: 24, label: { de: "Abfall", en: "Sweep" },
      describe: { de: "Wie tief die Tonhöhe fällt, in Halbtonschritten: 6 ein Zischen, 24 zwei Oktaven für einen Schuss, 36 ein tiefes Blasen.", en: "How far the pitch falls, in semitones: 6 a hiss, 24 two octaves for a shot, 36 a low blast." } },
    length: { type: "number", min: 0.08, max: 0.6, step: 0.01, default: 0.25, unit: "s", label: { de: "Länge", en: "Length" },
      describe: { de: "Dauer des Strahls: 0,1 s eine Pistole, 0,25 s ein Gewehr, 0,5 s ein schwerer Werfer.", en: "Duration of the beam: 0.1 s a pistol, 0.25 s a rifle, 0.5 s a heavy launcher." } },
    tone: { type: "choice", options: ["pure", "buzzy", "ring"], default: "pure", label: { de: "Klang", en: "Tone" },
      labels: { pure: { de: "Rein (Sinus)", en: "Pure (sine)" }, buzzy: { de: "Dröhnend (Rechteck, gedämpft)", en: "Buzzy (damped square)" }, ring: { de: "Klingend (ringmoduliert)", en: "Ring (ring-modulated)" } },
      describe: { de: "Die Klangfarbe: rein ein scharfer Piks, dröhnend ein elektrisches Brummen, klingend ein metallisches Zischen.", en: "The timbre: pure a sharp pick, buzzy an electric hum, ring a metallic sizzle." } },
    echo: { type: "number", min: 0, max: 1, step: 0.05, default: 0.2, label: { de: "Echo", en: "Echo" },
      describe: { de: "Eine leise Wiederholung 60–120 ms später (bei langen Schüssen weiter weg): 0 nichts, 0,2 ein Raum, 1 ein langer Gang.", en: "A quiet repeat 60–120 ms later (further away for long shots): 0 none, 0.2 a room, 1 a long corridor." } },
  },
  presets: {
    blaster: { label: { de: "Blaster", en: "Blaster" }, values: { pitch: 1800, sweep: 26, length: 0.22, tone: "pure", echo: 0.15 } },
    "ray-gun": { label: { de: "Strahlenpistole", en: "Ray gun" }, values: { pitch: 1200, sweep: 30, length: 0.45, tone: "ring", echo: 0.5 } },
    "retro-shot": { label: { de: "Retro-Schuss", en: "Retro shot" }, values: { pitch: 2600, sweep: 18, length: 0.12, tone: "buzzy", echo: 0.1 } },
  },
  loop: false, maxSeconds: 1.1,
  build(p) {
    const tau = p.length / 3, schwanz = Math.max(0.12, p.length * 0.5);
    const spaet = Math.round((0.06 + 0.06 * Math.min(1, p.length / 0.6)) * RATE), gleit = 1 - Math.exp(-3);
    const ton = new Osc(p.tone === "buzzy" ? "square" : "sine"), oben = new Osc("sine"), falt = new Osc("sine"), glanz = new Osc("sine"), tief = new LowPass();
    const schuss = buffer(p.length + schwanz), s = buffer(p.length + schwanz + (p.echo > 0 ? spaet / RATE : 0));
    for (let i = 0; i < schuss.length; i++) {
      const t = i / RATE, x = Math.min(1, t / p.length);
      // The dive comes fast: most of it in the first third, then it settles on the low end
      const f = semitones(p.pitch, -p.sweep * (1 - Math.exp(-x * 3) / gleit));
      const u = Math.max(0, (t - p.length) / schwanz);
      const e = envelope(t, 0.002, tau) * (0.5 + 0.5 * Math.cos(Math.PI * Math.min(1, u)));
      let a: number;
      if (p.tone === "buzzy") a = tief.run(ton.next(f), f * 3.5) * 1.8;
      else if (p.tone === "ring") a = ton.next(f) + oben.next(f * 2) * falt.next(f * 0.7) * 0.6;
      else a = ton.next(f);
      schuss[i] = (a + glanz.next(f * 3) * envelope(t, 0.003, 0.005) * 0.5) * e;
    }
    mixInto(s, schuss);
    if (p.echo > 0) mixInto(s, schuss, spaet, p.echo * 0.3);
    return s;
  },
});
