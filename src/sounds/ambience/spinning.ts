import { Biquad, buffer, envelope, LowPass, LOOP_TAIL, Osc, RATE, smooth, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const spinning = defineSound({
  id: "spinning", category: "ambience",
  title: { de: "Spinnrad", en: "Spinning wheel" },
  description: {
    de: "Ein Spinnrad im Betrieb als nahtlose Schleife: das sanfte Surren des Holzes im Rad, einmal je Umdrehung der dumpfe Holzschlag des Tritts mit einem leisen Knarren des Fußbands, und das Zischen des sich drehenden Garns auf der Spindel.",
    en: "A spinning wheel at work as a seamless loop: the soft whirr of the wood in the wheel, once per turn the dull knock of the treadle with a soft creak of the footman, and the fine hiss of yarn twisting onto the bobbin.",
  },
  params: {
    speed: { type: "number", min: 0.6, max: 2.5, step: 0.05, default: 1.2, unit: "Hz", label: { de: "Tempo", en: "Speed" },
      describe: { de: "Umdrehungen des Rades je Sekunde: 0,8 langsam und gleichmäßig, 1,2 üblich, 2 schnelles Zwirnen.", en: "Turns of the wheel per second: 0.8 slow and even, 1.2 usual, 2 fast plying." } },
    whirr: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Rad", en: "Whirr" },
      describe: { de: "Das luftige Rauschen der Speichen und der Holzdunst des Rades (Rauschen um 300 bis 800 Hz), das ein wenig anschwillt je Umdrehung: 0 still, 0,5 sanft, 1 deutlich.", en: "The airy rush of the spokes and the wooden hum of the wheel (noise around 300 to 800 Hz), swelling a little once per turn: 0 still, 0.5 soft, 1 clear." } },
    treadle: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Tritt", en: "Treadle" },
      describe: { de: "Der dumpfe Holzschlag des Tritts (um 150 bis 400 Hz, 30 bis 60 ms), einmal je Umdrehung, und ein leises Knarren des Fußbands eine halbe Umdrehung später: 0 keines, 0,5 leise, 1 deutlich.", en: "The dull wooden knock of the treadle (around 150 to 400 Hz, 30 to 60 ms), once per turn, and a soft creak of the footman half a turn later: 0 none, 0.5 soft, 1 clear." } },
    yarn: { type: "number", min: 0, max: 1, step: 0.05, default: 0.4, label: { de: "Garn", en: "Yarn" },
      describe: { de: "Das feine Zischen des sich drehenden Garns auf der Spindel (Rauschen oberhalb von 4 kHz), das langsam wankt: 0 keines, 0,4 sanft, 1 deutlich.", en: "The fine hiss of yarn twisting onto the bobbin (noise above 4 kHz), wavering slowly: 0 none, 0.4 soft, 1 clear." } },
    seconds: { type: "number", min: 4, max: 12, step: 1, default: 8, unit: "s", label: { de: "Schleifenlänge", en: "Loop length" },
      describe: { de: "Länge der Schleife: 4 s ist klein, 8 bis 12 s wiederholen sich unauffälliger.", en: "Length of the loop: 4 s is small, 8 to 12 s repeat less noticeably." } },
  },
  presets: {
    cottage: { label: { de: "Häuschen", en: "Cottage" }, values: { speed: 1.2 } },
    slow: { label: { de: "Langsam", en: "Slow" }, values: { speed: 0.8, treadle: 0.7, yarn: 0.3 } },
    plying: { label: { de: "Zwirnen", en: "Plying" }, values: { speed: 2, whirr: 0.7, yarn: 0.6 } },
    quiet: { label: { de: "Leise", en: "Quiet" }, values: { treadle: 0.2, whirr: 0.3 } },
  },
  loop: true, maxSeconds: 12,
  build(p, seed) {
    const r = rng(seed), laenge = p.seconds + LOOP_TAIL, s = buffer(laenge);
    // A whole number of turns per loop, so the knocks and creaks line up at the seam
    const turns = Math.max(1, Math.round(p.seconds * p.speed)), periode = p.seconds / turns;
    const welle = (t: number) => 0.5 - 0.5 * Math.cos((2 * Math.PI * t) / periode);
    // The faint wooden hum of the wheel, always on so the loop stays audible
    const tief = new LowPass();
    for (let i = 0; i < s.length; i++) s[i] = tief.run(white(r), 100) * 0.7;
    // Whirr: noise band-passed around 300-800 Hz, swelling once per turn
    if (p.whirr > 0) {
      const bp = new Biquad("bandpass", 550, 1.4), wellen = smooth(r, laenge, 0.7);
      for (let i = 0; i < s.length; i++) {
        const t = i / RATE, w = welle(t);
        s[i] += bp.run(white(r)) * p.whirr * 0.9 * (0.75 + 0.25 * w) * (0.8 + 0.4 * wellen(t));
      }
    }
    // Treadle: a dull wooden knock around 150-400 Hz, 30-60 ms, once per turn
    if (p.treadle > 0) {
      for (let k = 0; k * periode < laenge; k++) {
        const at = Math.round(k * periode * RATE), f = 260 * (0.94 + 0.12 * r()), laut = p.treadle * 0.85 * (0.85 + 0.3 * r());
        const a = new Osc("sine", 0.3), b = new Osc("sine", r());
        const dauer = 0.035 + 0.025 * r();
        for (let i = 0; i < dauer * RATE && at + i < s.length; i++) {
          const t = i / RATE, fall = 1 + 0.15 * Math.exp(-t / 0.006);
          s[at + i] += (a.next(f * fall) * envelope(t, 0.001, dauer * 0.5) + b.next(f * 2.31 * fall) * envelope(t, 0.0008, dauer * 0.3) * 0.3) * laut;
        }
      }
    }
    // Creak: half a turn after the knock, 200-400 ms of noise around 1-2 kHz
    if (p.treadle > 0) {
      const bp = new Biquad("bandpass", 1500, 1.2), schwingen = smooth(r, laenge, 0.8);
      for (let k = 0; (k + 0.5) * periode < laenge; k++) {
        const at2 = Math.round((k + 0.5) * periode * RATE), laut2 = p.treadle * 1.6 * (0.85 + 0.3 * r());
        const dauer2 = 0.2 + 0.2 * r();
        for (let i = 0; i < dauer2 * RATE && at2 + i < s.length; i++) {
          const t = i / RATE;
          s[at2 + i] += bp.run(white(r)) * envelope(t, 0.02, dauer2 * 0.5) * laut2 * schwingen((at2 + i) / RATE);
        }
      }
    }
    // Yarn: fine hiss above 4 kHz, slowly wavering
    if (p.yarn > 0) {
      const hp = new Biquad("highpass", 4200, 1.0), flimmern = smooth(r, laenge, 0.9);
      for (let i = 0; i < s.length; i++) {
        const t = i / RATE;
        s[i] += hp.run(white(r)) * p.yarn * 0.22 * (0.75 + 0.5 * flimmern(t));
      }
    }
    return s;
  },
});
