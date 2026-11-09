import { Biquad, buffer, envelope, LOOP_TAIL, LowPass, Osc, RATE, semitones, smooth, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const nature = defineSound({
  id: "nature", category: "ambience",
  title: { de: "Natur", en: "Nature" },
  description: {
    de: "Draußen als nahtlose Schleife: tagsüber Vogelgezwitscher, nachts Grillen, in der Dämmerung beides, über einem leisen Grund aus atmender Luft.",
    en: "Outdoors as a seamless loop: birdsong by day, crickets by night, both at dusk, over a soft bed of breathing air.",
  },
  params: {
    time: { type: "number", min: 0, max: 1, step: 0.05, default: 0, label: { de: "Tageszeit", en: "Time of day" },
      describe: { de: "0 Tag mit Vögeln, 0,5 Dämmerung mit beidem, 1 Nacht mit Grillen.", en: "0 day with birds, 0.5 dusk with both, 1 night with crickets." } },
    density: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Dichte", en: "Density" },
      describe: { de: "Wie viel singt: 0,2 einzelne Stimmen, 0,5 gewöhnliche Wiese, 1 voller Chor.", en: "How much sings: 0.2 a few lone voices, 0.5 a usual meadow, 1 a full chorus." } },
    distance: { type: "number", min: 0, max: 1, step: 0.05, default: 0.15, label: { de: "Entfernung", en: "Distance" },
      describe: { de: "Wie gedämpft: 0 direkt neben dem Busch, 0,5 über die Wiese, 1 vom Haus am Waldrand.", en: "How muffled: 0 beside the bush, 0.5 across the meadow, 1 from the house at the wood's edge." } },
    pitchSpread: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Stimmstreuung", en: "Pitch spread" },
      describe: { de: "Wie weit die Stimmen auseinander liegen: 0,1 alle ähnlich, 0,5 gemischte Arten, 1 von klein und hoch bis groß und tief.", en: "How far the voices lie apart: 0.1 all alike, 0.5 mixed species, 1 from small and high to large and low." } },
    seconds: { type: "number", min: 4, max: 12, step: 1, default: 8, unit: "s", label: { de: "Schleifenlänge", en: "Loop length" },
      describe: { de: "Länge der Schleife: 4 s ist klein, 8 bis 12 s wiederholen sich unauffälliger.", en: "Length of the loop: 4 s is small, 8 to 12 s repeat less noticeably." } },
  },
  presets: {
    "morning-birds": { label: { de: "Morgenvögel", en: "Morning birds" }, values: { time: 0, density: 0.8, pitchSpread: 0.7 } },
    "summer-night": { label: { de: "Sommernacht", en: "Summer night" }, values: { time: 1, density: 0.7, distance: 0.25, pitchSpread: 0.3 } },
    "quiet-meadow": { label: { de: "Stille Wiese", en: "Quiet meadow" }, values: { time: 0.1, density: 0.2, distance: 0.5 } },
  },
  loop: true, maxSeconds: 12,
  build(p, seed) {
    const r = rng(seed), laenge = p.seconds + LOOP_TAIL, s = buffer(laenge);
    // The bed: air that breathes, so even an empty meadow is never silent
    const atmen = smooth(r, laenge, 2.5), luft = new Biquad("lowpass", 700, 0.7);
    for (let i = 0; i < s.length; i++) s[i] = luft.run(white(r)) * (0.05 + 0.05 * atmen(i / RATE));
    // Birds: songs of two or three chirps, each a pure whistle gliding up or down
    const rufe = Math.round(laenge * (1 - p.time) * (0.3 + p.density * 2.4));
    for (let k = 0; k < rufe; k++) {
      const base = semitones(2500, p.pitchSpread * (r() * 2 - 1) * 8), tiede = 0.6 + 0.8 * r();
      // Never into the seam (the end of the loop runs on into its start there); a song is at most 0.45 s long
      let at = r() * p.seconds;
      if (at > p.seconds - 0.5) at += 0.5;
      const o = new Osc("sine");
      for (let c = 0, seit = at; c < 2 + Math.floor(r() * 2); c++) {
        const ziel = r() < 0.5 ? 1.25 + r() * 0.35 : 0.8 - r() * 0.15, dauer = 0.02 + r() * 0.05;
        for (let i = 0, start = Math.round(seit * RATE); i < dauer * RATE && start + i < s.length; i++) {
          const t = i / RATE;
          s[start + i] += o.next(base * (1 + (ziel - 1) * (t / dauer))) * envelope(t, 0.002, dauer * 0.5) * tiede;
        }
        seit += dauer + 0.04 + r() * 0.06;
      }
    }
    // Crickets: a few individuals, each a high sine chirped by fast pulses, all a little out of step and wobbling
    const tiere = Math.round(p.time * (1 + p.density * 5));
    for (let k = 0; k < tiere; k++) {
      const f = semitones(4600, p.pitchSpread * (r() * 2 - 1) * 5), puls = 24 + r() * 14, ph = r() * Math.PI,
        tiede = p.time * (0.2 + 0.25 * r()) / Math.sqrt(tiere), steil = 8 + (k % 4) * 4;
      const wanken = smooth(r, laenge, 3);
      for (let i = 0; i < s.length; i++) {
        const t = i / RATE, zucken = Math.abs(Math.sin(Math.PI * puls * t + ph)) ** steil;
        s[i] += Math.sin(2 * Math.PI * f * t) * zucken * tiede * (0.6 + 0.4 * wanken(t));
      }
    }
    // Distance: hedges and walls take the highs away
    const dumpf = new LowPass(), grenze = 12000 * (1 - p.distance) ** 2 + 900;
    for (let i = 0; i < s.length; i++) s[i] = dumpf.run(s[i], grenze);
    return s;
  },
});
