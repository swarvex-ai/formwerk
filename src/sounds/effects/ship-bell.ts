import { Biquad, buffer, envelope, Osc, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

// The partials of a cast bronze bell as ratios of the nominal (the tone you hear): hum, prime, tierce (the minor third
// that makes a bell a bell), quint, nominal and three upper tones. Their decay follows the task: 1/sqrt(ratio), so the
// deep ones ring long and the bright ones die early.
const TEILE = [
  { k: 0.25, amp: 0.35 }, { k: 0.5, amp: 0.65 }, { k: 0.6, amp: 0.5 }, { k: 0.75, amp: 0.4 }, { k: 1, amp: 1 },
  { k: 1.25, amp: 0.3 }, { k: 1.5, amp: 0.18 }, { k: 2, amp: 0.1 },
];
/** The budget of the effects category (docs/style-guide.md, tests/core/sounds.test.ts). Raise it and the sound below
 *  needs nothing: the strokes keep their spacing and every ring simply runs to its full −60 dB. */
const MAX = 2.5;
/** Room a stroke needs between its onset and the end, so it sounds like a stroke and not like a stopped one. */
const RAUM = 0.2;
/** The strokes as specified: in pairs 0.35 s apart with 1 s between the pairs (the watches on board), else every 0.8 s. */
const schlagzeit = (i: number, paar: boolean) => (paar ? Math.floor(i / 2) + (i % 2) * 0.35 : i * 0.8);

export const shipBell = defineSound({
  id: "ship-bell", category: "effects",
  title: { de: "Schiffsglocke", en: "Ship's Bell" },
  description: {
    de: "Eine geschlagene Bronzeglocke: ein einzelner Schlag wie an einer Ladentür oder im Turm, oder die schnellen Paare der Wachstunden an Bord. Erst der Klöppel, dann die Obertöne: die tiefen klingen lange nach, die hohen kurz.",
    en: "A struck bronze bell: one strike like a shop door or a tower, or the quick pairs of the watches on board. First the clapper, then the partials: the deep ones ring long, the high ones die early.",
  },
  params: {
    pitch: { type: "number", min: 200, max: 1600, step: 1, default: 600, unit: "Hz", label: { de: "Grundton", en: "Nominal" },
      describe: { de: "Der Ton, den man hört: 1100 Hz eine Handglocke, 600 Hz eine Schiffsglocke, 250 Hz ein großer Turm.", en: "The main tone you hear: 1100 Hz a small hand bell, 600 Hz a ship's bell, 250 Hz a tower." } },
    strikes: { type: "integer", min: 1, max: 4, default: 2, label: { de: "Schläge", en: "Strikes" },
      describe: { de: "Wie oft die Glocke schlägt: 1 für einen Hinweis, 2 für eine halbe Stunde Wache, 4 für zwei Stunden oder Alarm.", en: "How often the bell strikes: 1 for a signal, 2 for a half hour of watch, 4 for two hours or an alarm." } },
    pairs: { type: "boolean", default: true, label: { de: "Paarweise", en: "In pairs" },
      describe: { de: "Paarweise zwei schnelle Schläge im Abstand von 0,35 s mit 1 s Pause zwischen den Paaren wie an Bord, sonst ein Schlag alle 0,8 s.", en: "In pairs two quick strikes 0.35 s apart with 1 s between the pairs as on a ship, otherwise one strike every 0.8 s." } },
    decay: { type: "number", min: 0.5, max: 4, step: 0.05, default: 2, unit: "s", label: { de: "Klangdauer", en: "Ring" },
      describe: { de: "Wie lange ein Schlag nachklingt (bis 60 dB leiser): 0,8 s eine kleine Messingglocke, 2 s eine Schiffsglocke, 4 s ein großer Turm; tiefe Obertöne klingen länger nach als hohe.", en: "How long each strike rings (to 60 dB down): 0.8 s a small brass bell, 2 s a ship's bell, 4 s a big tower; deep partials ring on longer than high ones." } },
    brightness: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Helligkeit", en: "Brightness" },
      describe: { de: "Wie laut die oberen Obertöne und der Klöppelanschlag sind: 0,2 dunkel und rund, 0,5 ausgewogen, 0,8 hell und metallisch.", en: "How loud the upper partials and the metallic clapper strike are: 0.2 dark and round, 0.5 balanced, 0.8 bright and metallic." } },
  },
  presets: {
    ship: { label: { de: "Schiffsglocke", en: "Ship's bell" }, values: { pitch: 600, strikes: 2, pairs: true, decay: 2 } },
    "shop-door": { label: { de: "Ladenglöckchen", en: "Shop door" }, values: { pitch: 1400, strikes: 1, decay: 0.8, brightness: 0.7 } },
    tower: { label: { de: "Turmglocke", en: "Tower bell" }, values: { pitch: 250, strikes: 1, decay: 4, brightness: 0.3 } },
  },
  loop: false, maxSeconds: MAX,
  build(p, seed) {
    const r = rng(seed);
    // The stroke times as written; only when the last one would leave it no room inside the category budget do all
    // strokes come a hair closer together. The ring itself never follows anything but the values.
    const gestaucht = Math.min(1, (MAX - RAUM) / Math.max(1e-6, schlagzeit(p.strikes - 1, p.pairs)));
    const zeit = Array.from({ length: p.strikes }, (_, i) => schlagzeit(i, p.pairs) * gestaucht);
    const letzte = zeit[zeit.length - 1], laenge = Math.min(MAX, letzte + p.decay + 0.06), s = buffer(laenge);
    for (const at of zeit) {
      const start = Math.round(at * RATE), verstimmt = 1 + (r() * 2 - 1) * 0.005;
      for (const { k, amp } of TEILE) {
        const f = p.pitch * k * verstimmt;
        if (f > 15000) continue;
        // decay: the time the nominal falls by 60 dB (6.9 time constants), the other partials scaled by 1/sqrt(ratio);
        // the four deep ones sound twice, a hair apart, for the slow wobble of a real bell
        const tau = (p.decay / Math.sqrt(k)) / 6.9, a = amp * (k > 1 ? 0.25 + 1.3 * p.brightness : 1) * 0.45;
        const schwebung = k <= 1 ? [1, 1.003 + r() * 0.004] : [1];
        const dauer = Math.min(s.length - start, 8 * tau * RATE);
        for (const b of schwebung) {
          const o = new Osc("sine", r());
          for (let i = 0; i < dauer; i++) s[start + i] += o.next(f * b) * envelope(i / RATE, 0.0015, tau) * (a / schwebung.length);
        }
      }
      // The clapper on the bronze: two to five milliseconds of noise, brighter and louder with brightness
      const klick = 0.002 + 0.003 * p.brightness, hp = new Biquad("highpass", 1200 + 3500 * p.brightness, 0.7);
      for (let i = 0; i < klick * 6 * RATE && start + i < s.length; i++) {
        s[start + i] += hp.run(white(r)) * envelope(i / RATE, 0.0003, klick) * (0.3 + 0.9 * p.brightness);
      }
    }
    // Only where the category budget ends the sound is the bell damped (a hand on the rim) instead of cut mid-ring;
    // every ring that fits runs to its full −60 dB on its own.
    const von = laenge < letzte + p.decay + 0.05 ? Math.max(letzte + 0.05, laenge - 0.3) : Infinity, bis = laenge - 0.012;
    for (let i = Math.round(von * RATE); i < s.length; i++) {
      const x = (i / RATE - von) / (bis - von);
      s[i] *= x >= 1 ? 0 : 0.5 + 0.5 * Math.cos(Math.PI * x);
    }
    return s;
  },
});
