import { Biquad, buffer, envelope, grains, LOOP_TAIL, Osc, RATE, smooth, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const millstone = defineSound({
  id: "millstone", category: "ambience",
  title: { de: "Mühlstein", en: "Millstone" },
  description: {
    de: "Das Innere einer Mühle als nahtlose Schleife: ein schwerer Läuferstein mahlt auf dem Bodenstein, trockenes Knirschen über tiefem Grollen, und einmal je Umdrehung klopft das hölzerne Zahnrad.",
    en: "The inside of a working mill as a seamless loop: a heavy runner stone grinding on the bed stone, a dry gritty rasp over a low rumble, and the wooden gear knocking once per turn.",
  },
  params: {
    speed: { type: "number", min: 0.2, max: 1.5, step: 0.05, default: 0.6, label: { de: "Drehzahl", en: "Speed" },
      describe: { de: "Umdrehungen des Steins je Sekunde: 0,3 eine langsame Ochsenmühle, 0,6 eine Wassermühle, 1,2 eine schnelle Windmühle im Sturm.", en: "Turns of the stone per second: 0.3 a slow ox mill, 0.6 a water mill, 1.2 a fast windmill in a gale." } },
    grind: { type: "number", min: 0, max: 1, step: 0.05, default: 0.6, label: { de: "Mahlgut", en: "Grind" },
      describe: { de: "Das körnige Raspeln des Korns zwischen den Steinen (Rauschen um 1,5 bis 3 kHz): 0 ein leerer Stein, der nur grollt, 1 ein voller Trichter.", en: "The gritty rasp of grain between the stones (noise around 1.5 to 3 kHz): 0 an empty stone rumbling, 1 a full hopper." } },
    rumble: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Grollen", en: "Rumble" },
      describe: { de: "Der tiefe Körper des Steins unter 150 Hz, der einmal je Umdrehung anschwillt: 0,2 ein leichter Stein, 0,5 üblich, 1 ein schwerer Mahlgang.", en: "The low body of the stone below 150 Hz, swelling once per turn: 0.2 a light stone, 0.5 usual, 1 a heavy pair of stones." } },
    knock: { type: "number", min: 0, max: 1, step: 0.05, default: 0.4, label: { de: "Zahnrad", en: "Knock" },
      describe: { de: "Lautstärke des dumpfen Holzklopfens der Zahnräder (um 300 bis 600 Hz), einmal je Umdrehung: 0 keines, 0,4 leise, 1 deutlich.", en: "Level of the dull wooden knock of the gear teeth (around 300 to 600 Hz), once per turn: 0 none, 0.4 soft, 1 clear." } },
    seconds: { type: "number", min: 4, max: 12, step: 1, default: 8, unit: "s", label: { de: "Schleifenlänge", en: "Loop length" },
      describe: { de: "Länge der Schleife: 4 s ist klein, 8 bis 12 s wiederholen sich unauffälliger.", en: "Length of the loop: 4 s is small, 8 to 12 s repeat less noticeably." } },
  },
  presets: {
    "water-mill": { label: { de: "Wassermühle", en: "Water mill" }, values: { speed: 0.6 } },
    "ox-mill": { label: { de: "Ochsenmühle", en: "Ox mill" }, values: { speed: 0.3, grind: 0.4, knock: 0.6 } },
    windmill: { label: { de: "Windmühle", en: "Windmill" }, values: { speed: 1.2, grind: 0.8, rumble: 0.3 } },
  },
  loop: true, maxSeconds: 12,
  build(p, seed) {
    const r = rng(seed), laenge = p.seconds + LOOP_TAIL, s = buffer(laenge);
    // A whole number of turns per loop, so the swell and the knocks line up at the seam
    const turns = Math.max(1, Math.round(p.seconds * p.speed)), periode = p.seconds / turns;
    const welle = (t: number) => 0.5 - 0.5 * Math.cos((2 * Math.PI * t) / periode);
    // The grind: band-passed noise around 2 kHz, rasping harder as the stone passes its heavy side
    const bp = new Biquad("bandpass", 2200, 1.6), hp = new Biquad("highpass", 1200, 0.7), korn = smooth(r, laenge, 0.35);
    // The rumble: low noise below 150 Hz and a slow hum of the stone, swelling once per turn
    const tief = new Biquad("lowpass", 140, 0.8), tief2 = new Biquad("lowpass", 140, 0.8), brumm = new Osc("sine", r());
    const grindLaut = 0.08 + 0.9 * p.grind, rumbleLaut = 0.2 + 1.6 * p.rumble;
    for (let i = 0; i < s.length; i++) {
      const t = i / RATE, w = welle(t), n = white(r);
      const rasp = bp.run(hp.run(n)) * grindLaut * (0.75 + 0.25 * w) * (0.8 + 0.4 * korn(t));
      const body = (tief2.run(tief.run(white(r))) * 2.5 + brumm.next(55 + 10 * w) * 0.15) * rumbleLaut * (0.45 + 0.55 * w);
      s[i] = rasp + body;
    }
    // Grit: tiny grains cracking between the stones, denser with a full hopper
    grains(s, r, { start: 0, seconds: laenge, count: Math.round(laenge * (40 + 500 * p.grind)), hz: 2400, q: 1.4, gain: 0.35 * (0.1 + p.grind), grain: 0.0006 });
    // The gear knock: a short dull wooden knock once per turn, a quarter turn in, over the whole buffer so the tail wraps
    if (p.knock > 0) {
      for (let k = 0; (k + 0.25) * periode < laenge; k++) {
        const at = Math.round((k + 0.25) * periode * RATE), f = 380 * (0.96 + 0.08 * r()), laut = p.knock * 0.9 * (0.85 + 0.15 * r());
        const a = new Osc("sine", 0.25), b = new Osc("sine", r()), klick = new Biquad("bandpass", 900, 1.2);
        for (let i = 0; i < 0.25 * RATE && at + i < s.length; i++) {
          const t = i / RATE, fall = 1 + 0.08 * Math.exp(-t / 0.01);
          s[at + i] += (a.next(f * fall) * envelope(t, 0.0015, 0.035) + b.next(f * 2.31 * fall) * envelope(t, 0.001, 0.012) * 0.35) * laut;
          if (t < 0.02) s[at + i] += klick.run(white(r)) * envelope(t, 0.0005, 0.003) * 0.4 * laut;
        }
      }
    }
    return s;
  },
});
