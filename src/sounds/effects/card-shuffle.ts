import { Biquad, buffer, envelope, Osc, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

// What the deck is squared on, or a dealt card lands on: the tone of the knock, how long it rings, how much click
const TISCH = {
  felt: { hz: 130, tau: 0.01, klick: 0.25, lp: 1400 },
  wood: { hz: 240, tau: 0.03, klick: 1, lp: 3200 },
} as const;

export const cardShuffle = defineSound({
  id: "card-shuffle", category: "effects",
  title: { de: "Karten mischen", en: "Card shuffle" },
  description: {
    de: "Spielkarten: ein Riffle-Mischen mit schnell schnarrenden Kartenkanten, dem weichen Rauschen, wenn die Karten zusammenfallen, und einem leisen Aufstoßen des Stapels auf dem Tisch; oder einzelne Karten, die auf den Tisch gegeben werden. Für Kartenspiele, Casinos und Tavernen.",
    en: "Playing cards: a riffle shuffle with the fast burr of flicking card edges, the soft whoosh as the cards cascade together and a light tap of the deck squared on the table; or single cards dealt onto the table. For card games, casinos and taverns.",
  },
  params: {
    mode: { type: "choice", options: ["riffle", "deal"], default: "riffle", label: { de: "Art", en: "Mode" },
      labels: { riffle: { de: "Mischen", en: "Riffle" }, deal: { de: "Geben", en: "Deal" } },
      describe: { de: "Was mit den Karten geschieht: Mischen (ein Riffle-Shuffle mit Brücke und Aufstoßen) oder Geben (einzelne Karten, die über den Tisch gleiten und aufklatschen).", en: "What happens to the cards: riffle (a riffle shuffle with bridge and squaring tap) or deal (single cards sliding across the table and slapping down)." } },
    cards: { type: "integer", min: 20, max: 52, default: 52, label: { de: "Karten", en: "Cards" },
      describe: { de: "Wie viele Karten der Stapel hat (beim Mischen ein Schnarren je Karte): 32 ein Skatblatt, 52 ein Pokerblatt. Beim Geben je 10 Karten eine gegebene Karte, also 2 bis 5.", en: "How many cards the deck has (one flick per card in a riffle): 32 a piquet deck, 52 a poker deck. When dealing, one dealt card per 10 cards, so 2 to 5." } },
    speed: { type: "number", min: 30, max: 90, step: 5, default: 60, unit: "Hz", label: { de: "Tempo", en: "Speed" },
      describe: { de: "Wie schnell die Kartenkanten abschnarren, in Karten pro Sekunde: 30 bedächtig, 60 üblich, 90 ein geübter Croupier. Beim Geben auch, wie schnell die Karten aufeinander folgen.", en: "How fast the card edges flick off, in cards per second: 30 unhurried, 60 usual, 90 a practised dealer. When dealing also how quickly the cards follow each other." } },
    stiffness: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Steifheit", en: "Stiffness" },
      describe: { de: "Wie steif die Karten sind: 0 alte, weiche Karten (um 3 kHz, dumpfer), 0,5 übliche, 1 ein neues, kunststoffbeschichtetes Blatt (um 6 kHz, hell und schnippend).", en: "How stiff the cards are: 0 old soft cards (around 3 kHz, duller), 0.5 usual, 1 a new plastic-coated deck (around 6 kHz, bright and snappy)." } },
    table: { type: "choice", options: ["felt", "wood"], default: "felt", label: { de: "Tisch", en: "Table" },
      labels: { felt: { de: "Filz", en: "felt" }, wood: { de: "Holz", en: "wood" } },
      describe: { de: "Worauf der Stapel aufgestoßen wird und die Karten fallen: Filz eines Spieltischs (dumpf) oder blankes Holz (ein helles Klopfen).", en: "What the deck is tapped on and the cards land on: the felt of a card table (dull) or bare wood (a bright knock)." } },
  },
  presets: {
    riffle: { label: { de: "Riffle-Mischen", en: "Riffle shuffle" }, values: { mode: "riffle", cards: 52, speed: 60, stiffness: 0.5, table: "felt" } },
    deal: { label: { de: "Karten geben", en: "Dealing cards" }, values: { mode: "deal", cards: 40, speed: 60, table: "felt" } },
    "new-deck": { label: { de: "Neues Blatt", en: "New deck" }, values: { mode: "riffle", cards: 52, speed: 75, stiffness: 1, table: "wood" } },
  },
  loop: false, maxSeconds: 2.5,
  build(p, seed) {
    const r = rng(seed), tisch = TISCH[p.table as keyof typeof TISCH];
    const hell = 3000 * 2 ** p.stiffness, kurz = 0.0012 - 0.0006 * p.stiffness;
    // One flick: a card edge snapping off the thumb, a very short bright burst of paper noise
    const flick = (s: Float32Array, at: number, laut: number, f: number) => {
      const bp = new Biquad("bandpass", f, 2.2), hp = new Biquad("highpass", 1800, 0.7), lp = new Biquad("lowpass", f * 1.8, 0.7);
      for (let i = 0; i < kurz * 8 * RATE && at + i < s.length; i++) s[at + i] += lp.run(hp.run(bp.run(white(r)))) * envelope(i / RATE, 0.0001, kurz) * 3.5 * laut;
    };
    // The deck or a card meeting the table: a short knock of the table and a click of the card edges
    const tap = (s: Float32Array, at: number, laut: number) => {
      const o = new Osc("sine", 0.25), lp = new Biquad("lowpass", tisch.lp, 0.8), f = tisch.hz * (0.92 + 0.16 * r());
      for (let i = 0; i < 0.1 * RATE && at + i < s.length; i++) {
        const t = i / RATE;
        s[at + i] += (o.next(f) * envelope(t, 0.001, tisch.tau) + lp.run(white(r)) * envelope(t, 0.0003, 0.004) * (0.6 + tisch.klick)) * laut;
      }
    };
    // A swish: noise in a band that sweeps up as the card or the cascading cards rub past each other, fluttering
    const swish = (s: Float32Array, at: number, dauer: number, laut: number, flatter: number) => {
      const bp = new Biquad("bandpass", 1500, 1.2), wellen = new Osc("sine", r());
      for (let i = 0; i < dauer * RATE && at + i < s.length; i++) {
        const u = i / (dauer * RATE), hz = (1400 + 0.6 * hell * u) * (0.9 + 0.2 * r());
        bp.set(hz, 1.2);
        const huelle = Math.sin(Math.PI * Math.sqrt(u)) ** 2 * (1 - flatter + flatter * (0.5 + 0.5 * wellen.next(38 + 30 * u)));
        s[at + i] += bp.run(white(r)) * huelle * laut;
      }
    };
    if (p.mode === "deal") {
      // Dealing: every card is snapped off the deck, slides across the table and slaps down
      const karten = Math.max(2, Math.round(p.cards / 10)), abstand = 0.18 + 6 / p.speed, gleiten = 0.09 + 3 / p.speed;
      const s = buffer(0.05 + (karten - 1) * abstand + gleiten + 5 * tisch.tau + 0.03);
      for (let k = 0; k < karten; k++) {
        const t0 = 0.01 + k * abstand + 0.03 * r(), at = Math.round(t0 * RATE), laut = 0.8 + 0.2 * r();
        flick(s, at, 0.5 * laut, hell * (0.9 + 0.2 * r()));
        swish(s, at + Math.round(0.005 * RATE), gleiten, 0.5 * laut, 0.15);
        tap(s, at + Math.round((gleiten + 0.003) * RATE), 0.5 * laut);
      }
      return fade(s);
    }
    // The riffle: one flick per card, the two halves in turn; they come ever faster, then thin out as the halves run empty
    const dauer = p.cards / p.speed, bruecke = 0.28 + 0.1 * (1 - p.stiffness);
    const brueckeAt = Math.round((0.01 + dauer * 0.9) * RATE), tapAt = brueckeAt + Math.round(0.85 * bruecke * RATE);
    const s = buffer(tapAt / RATE + 5 * tisch.tau + 0.03);
    for (let k = 0; k < p.cards; k++) {
      const u = (k + 0.3 * r()) / p.cards, w = u + (0.45 * Math.sin(2 * Math.PI * u)) / (2 * Math.PI);
      const t0 = 0.01 + dauer * w, laut = (0.55 + 0.45 * Math.sin(Math.PI * Math.min(1, u * 1.3))) * (0.75 + 0.25 * r());
      flick(s, Math.round(t0 * RATE), laut, hell * (k % 2 ? 1.08 : 0.92) * (0.9 + 0.2 * r()));
    }
    // a soft rustle of the bending halves under the flicks
    swish(s, Math.round(0.01 * RATE), dauer, 0.12, 0.6);
    // The bridge: the cards cascade together in a papery flutter, then the deck is squared with a light tap
    swish(s, brueckeAt, bruecke, 0.35, 0.7);
    tap(s, tapAt, 0.35);
    return fade(s);
  },
});

// The tail falls silent on its own: a raised cosine over the last 20 ms
function fade(s: Float32Array<ArrayBuffer>) {
  const ende = Math.min(s.length, Math.round(0.02 * RATE));
  for (let i = 0; i < ende; i++) s[s.length - 1 - i] *= 0.5 - 0.5 * Math.cos((Math.PI * i) / ende);
  return s;
}
