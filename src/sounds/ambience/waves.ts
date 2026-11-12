import { Biquad, buffer, grains, LOOP_TAIL, RATE, smooth, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

export const waves = defineSound({
  id: "waves", category: "ambience",
  title: { de: "Wellen", en: "Waves" },
  description: {
    de: "Wellen, die als nahtlose Schleife auf ein Ufer laufen: sanftes Spülen am See, Brandung am Strand oder schwere Brecher im Sturm.",
    en: "Waves running up a shore as a seamless loop: soft lapping on a lake, surf on a beach or heavy breakers in a storm.",
  },
  params: {
    size: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Wellengröße", en: "Wave size" },
      describe: { de: "Wie groß die Wellen: 0 sanftes Spülen am See, 0,5 Brandung am Badestrand, 1 schwere Brecher mit tiefem Grollen.", en: "How big the waves: 0 soft lapping on a lake, 0.5 surf on a bathing beach, 1 heavy breakers with a deep rumble." } },
    period: { type: "number", min: 3, max: 10, step: 0.5, default: 6, unit: "s", label: { de: "Wellenabstand", en: "Period" },
      describe: { de: "Zeit zwischen den Wellen: 3 s ein unruhiger flacher See, 6 s normaler Seegang, 10 s lange Dünung.", en: "Time between the waves: 3 s a restless shallow lake, 6 s ordinary swell, 10 s long ocean swell." } },
    shore: { type: "choice", options: ["sand", "pebbles"], default: "sand", label: { de: "Ufer", en: "Shore" },
      labels: { sand: { de: "Sand", en: "Sand" }, pebbles: { de: "Kies", en: "Pebbles" } },
      describe: { de: "Was die Welle beim Zurückziehen bewegt: Sand rauscht gleichmäßig, Kies wirft ein Klappern kurzer heller Klicks dazu.", en: "What the wave drags back: sand hisses even, pebbles add a rattle of short bright clicks." } },
    wind: { type: "number", min: 0, max: 1, step: 0.05, default: 0.3, label: { de: "Wind", en: "Wind" },
      describe: { de: "Rauschen des Windes über dem Wasser unter den Wellen: 0 windstille Glätte, 0,3 ein leiser Grund, 1 ein stetes Brausen.", en: "Wind noise over the water under the waves: 0 glassy calm, 0.3 a soft bed, 1 a steady rush." } },
    seconds: { type: "number", min: 6, max: 12, step: 1, default: 12, unit: "s", label: { de: "Schleifenlänge", en: "Loop length" },
      describe: { de: "Länge der Schleife: 6 s für kurze Szenen, 12 s wiederholt sich unauffälliger.", en: "Length of the loop: 6 s for short scenes, 12 s repeat less noticeably." } },
  },
  presets: {
    lake: { label: { de: "See", en: "Lake" }, values: { size: 0.1, period: 3, wind: 0.1 } },
    beach: { label: { de: "Strand", en: "Beach" }, values: { size: 0.5, period: 6 } },
    storm: { label: { de: "Sturm", en: "Storm" }, values: { size: 1, period: 4, wind: 0.8 } },
    "pebble-beach": { label: { de: "Kiesstrand", en: "Pebble beach" }, values: { shore: "pebbles", size: 0.5, period: 7 } },
  },
  loop: true, maxSeconds: 12,
  build(p, seed) {
    const r = rng(seed), laenge = p.seconds + LOOP_TAIL, s = buffer(laenge);
    // Wind bed: low-passed noise whose level drifts slowly back and forth
    const wehen = smooth(r, laenge, 4), bett = new Biquad("lowpass", 500 + 300 * p.wind, 0.6);
    for (let i = 0; i < s.length; i++) s[i] += bett.run(white(r)) * p.wind * 0.45 * (0.7 + 0.5 * wehen(i / RATE));
    // One wave: a swell, the crash (fast and bright, low-pass open) and the hiss running up the shore (low-pass closing);
    // bigger size makes it louder, longer and lower
    const laut = 0.5 + 0.6 * p.size, schwell = 0.8 + 0.4 * p.size, steigen = 0.25, tau = (1.5 + 1.5 * p.size) / 3,
      dumpf = 320 - 140 * p.size, hell = 2000 + 2000 * p.size;
    const welle = (at: number) => {
      const lp = new Biquad("lowpass", dumpf, 0.7), rum = new Biquad("lowpass", 130, 0.7);
      const i0 = Math.round(at * RATE), dauer = Math.round((schwell + steigen + 4 * tau) * RATE);
      for (let j = 0; j < dauer; j++) {
        const i = i0 + j;
        if (i < 0 || i >= s.length) continue;
        const t = j / RATE;
        let pegel: number, grenze: number;
        if (t < schwell) { pegel = 0.2 * (t / schwell) ** 2; grenze = dumpf; }
        else if (t < schwell + steigen) { const u = (t - schwell) / steigen; pegel = 0.2 + 0.8 * u ** 1.6; grenze = dumpf + (hell - dumpf) * u; }
        else { const u = (t - schwell - steigen) / tau; pegel = Math.exp(-u); grenze = 450 + (hell - 450) * Math.exp(-0.8 * u); }
        if (j % 32 === 0) lp.set(grenze, 0.7);
        const n = white(r);
        s[i] += (lp.run(n) * pegel + rum.run(n) * pegel * (0.2 + 0.5 * p.size)) * laut;
      }
    };
    // The pebble rattle during the draw-back, as short bright grains
    const rassel = (at: number) => {
      const start = at + schwell + steigen, ras = 1.2 + 1.2 * p.size;
      if (start >= laenge || start + ras <= 0) return;
      grains(s, r, { start: Math.max(0, start), seconds: ras, count: Math.round(ras * (50 + 100 * p.size)), hz: 3800, q: 1.5, gain: 0.5 * (0.3 + 0.5 * p.size), grain: 0.0007, shape: "front" });
    };
    // Waves on a grid of the period with up to a quarter offset, each also as the shifted copy across the loop edge
    const anzahl = Math.max(1, Math.round(p.seconds / p.period)), abstand = p.seconds / anzahl;
    for (let k = 0; k < anzahl; k++) {
      const at = (k + (r() * 2 - 1) * 0.25) * abstand;
      for (const versatz of [-p.seconds, 0, p.seconds]) {
        welle(at + versatz);
        if (p.shore === "pebbles") rassel(at + versatz);
      }
    }
    return s;
  },
});
