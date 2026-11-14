import { Biquad, buffer, envelope, Osc, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

// What the dice land on: the tone of its body, how long it rings, and how bright the clack comes through
const UNTERLAGE = {
  wood: { hz: 230, tau: 0.035, hell: 1 },
  felt: { hz: 140, tau: 0.012, hell: 0.35 },
  stone: { hz: 420, tau: 0.02, hell: 1.3 },
} as const;

export const diceRoll = defineSound({
  id: "dice-roll", category: "impact",
  title: { de: "Würfeln", en: "Dice roll" },
  description: {
    de: "Würfel, die geworfen werden: auf Wunsch erst im Becher geschüttelt, dann klackernd auf Holz, Filz oder Stein, mit kleiner werdenden Sprüngen, bis sie liegen. Für Brettspiele, Tavernen und Glücksspiel.",
    en: "Dice being thrown: shaken in a cup first if you like, then clattering onto wood, felt or stone, in ever smaller bounces until they come to rest. For board games, taverns and gambling.",
  },
  params: {
    dice: { type: "integer", min: 1, max: 5, default: 2, label: { de: "Würfel", en: "Dice" },
      describe: { de: "Wie viele Würfel fallen: 1 ein einzelner, 2 üblich bei Brettspielen, 5 eine Handvoll wie beim Kniffel.", en: "How many dice fall: 1 a single one, 2 usual in board games, 5 a handful as in Yahtzee." } },
    throw: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Wurf", en: "Throw" },
      describe: { de: "Wie kräftig geworfen wird: 0 ein Fallenlassen aus der Hand (kurz, zwei, drei Sprünge), 0,5 üblich, 1 ein Wurf über den ganzen Tisch.", en: "How hard they are thrown: 0 dropped from the hand (short, two or three bounces), 0.5 usual, 1 a throw across the whole table." } },
    surface: { type: "choice", options: ["wood", "felt", "stone"], default: "wood", label: { de: "Unterlage", en: "Surface" },
      labels: { wood: { de: "Holztisch", en: "wooden table" }, felt: { de: "Filz", en: "felt" }, stone: { de: "Stein", en: "stone" } },
      describe: { de: "Worauf sie fallen: ein Holztisch (hell klackernd mit hölzernem Pochen), Filz in einer Würfelschale (gedämpft) oder Stein (hart und hell).", en: "What they land on: a wooden table (bright clatter with a wooden knock), felt in a dice tray (muffled) or stone (hard and bright)." } },
    cup: { type: "number", min: 0, max: 0.8, step: 0.05, default: 0, unit: "s", label: { de: "Becher", en: "Cup" },
      describe: { de: "Wie lange sie vorher im Becher geschüttelt werden: 0 kein Becher, 0,4 s ein kurzes Schütteln, 0,8 s ein langes Rasseln.", en: "How long they are shaken in a cup first: 0 no cup, 0.4 s a short shake, 0.8 s a long rattle." } },
  },
  presets: {
    "board-game": { label: { de: "Brettspiel", en: "Board game" }, values: { dice: 2, throw: 0.5, surface: "wood" } },
    "dice-cup": { label: { de: "Würfelbecher", en: "Dice cup" }, values: { dice: 5, throw: 0.6, surface: "wood", cup: 0.6 } },
    "felt-tray": { label: { de: "Würfelschale", en: "Felt tray" }, values: { dice: 1, throw: 0.3, surface: "felt" } },
  },
  loop: false, maxSeconds: 2.5,
  build(p, seed) {
    const r = rng(seed), u = UNTERLAGE[p.surface as keyof typeof UNTERLAGE];
    const abstand = 0.07 + 0.1 * p.throw, spruenge = 3 + Math.round(5 * p.throw);
    // The throw: every die hits a little after the others, then bounces ever lower and closer together until it lies still
    const treffer: [number, number][] = [];
    for (let w = 0; w < p.dice; w++) {
      let t = p.cup + 0.02 + 0.08 * w * r(), d = abstand * (0.85 + 0.3 * r()), laut = 1 - 0.1 * w;
      for (let k = 0; k < spruenge; k++) { treffer.push([t, laut]); t += d; d *= 0.62 + 0.1 * r(); laut *= 0.68; }
    }
    const s = buffer(Math.max(...treffer.map(([t]) => t)) + 0.12);
    // One clack: the small hard cube rings high and short, the surface answers with a short knock of its own
    const klack = (at: number, laut: number) => {
      const bp = new Biquad("bandpass", (2600 + 1600 * r()) * (0.6 + 0.4 * u.hell), 5), o = new Osc("sine", r()), f = u.hz * (0.9 + 0.2 * r());
      for (let i = 0; i < 0.12 * RATE && at + i < s.length; i++) {
        const t = i / RATE;
        s[at + i] += (bp.run(white(r)) * envelope(t, 0.0002, 0.006) * 3 * u.hell + o.next(f) * envelope(t, 0.001, u.tau) * 0.5) * laut;
      }
    };
    // The cup: the dice rattle against its walls, muffled by the leather, swelling with every shake
    const becher = new Biquad("bandpass", 1300, 2), rasseln = Math.round(p.cup * 22 * p.dice);
    for (let k = 0; k < rasseln; k++) {
      const at = Math.round(r() * p.cup * 0.95 * RATE), welle = 0.55 + 0.45 * Math.sin(2 * Math.PI * 5 * (at / RATE));
      for (let i = 0; i < 0.015 * RATE && at + i < s.length; i++) s[at + i] += becher.run(white(r)) * envelope(i / RATE, 0.0003, 0.003) * 2.4 * welle;
    }
    for (const [t, laut] of treffer) klack(Math.round(t * RATE), laut);
    // The tail falls silent on its own: a raised cosine over the last 20 ms
    const ende = Math.min(s.length, Math.round(0.02 * RATE));
    for (let i = 0; i < ende; i++) s[s.length - 1 - i] *= 0.5 - 0.5 * Math.cos((Math.PI * i) / ende);
    return s;
  },
});
