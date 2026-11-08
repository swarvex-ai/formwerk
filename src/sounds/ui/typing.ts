import { Biquad, buffer, envelope, Osc, RATE, white } from "../../core/audio";
import { rng } from "../../core/rng";
import { defineSound } from "../define";

// Each keyboard: the band and decay of a key's click, its low thud, and how much the timing wanders
const TASTATUR = {
  mechanical: { klick: 3800, q: 1.2, tau: 0.006, dumpf: 260, wandern: 0.25 },
  laptop: { klick: 2400, q: 0.9, tau: 0.004, dumpf: 400, wandern: 0.3 },
  typewriter: { klick: 1800, q: 2.2, tau: 0.012, dumpf: 150, wandern: 0.4 },
} as const;

export const typing = defineSound({
  id: "typing", category: "ui",
  title: { de: "Tippen", en: "Typing" },
  description: {
    de: "Tastenanschläge: eine mechanische Tastatur, ein Laptop oder eine Schreibmaschine mit Glöckchen am Zeilenende; für Chats, Terminals und Texteingaben.",
    en: "Keystrokes: a mechanical keyboard, a laptop or a typewriter with a bell at the end of the line; for chats, terminals and text input.",
  },
  params: {
    keys: { type: "integer", min: 1, max: 20, default: 8, label: { de: "Anschläge", en: "Keys" },
      describe: { de: "Wie viele Tasten: 1 ein einzelner Anschlag, 8 ein Wort, 20 ein kurzer Satz.", en: "How many keys: 1 a single keystroke, 8 a word, 20 a short sentence." } },
    speed: { type: "number", min: 3, max: 14, step: 0.5, default: 8, label: { de: "Tempo (Anschläge/s)", en: "Speed (keys/s)" },
      describe: { de: "Anschläge pro Sekunde: 4 suchend, 8 flüssig, 13 sehr schnell.", en: "Keystrokes per second: 4 hunting for keys, 8 fluent, 13 very fast." } },
    keyboard: { type: "choice", options: ["mechanical", "laptop", "typewriter"], default: "mechanical", label: { de: "Tastatur", en: "Keyboard" },
      labels: { mechanical: { de: "Mechanisch", en: "Mechanical" }, laptop: { de: "Laptop", en: "Laptop" }, typewriter: { de: "Schreibmaschine", en: "Typewriter" } },
      describe: { de: "Mechanisch hell klackend, Laptop leise und flach, Schreibmaschine hart mit Glöckchen.", en: "Mechanical bright and clacky, laptop quiet and flat, typewriter hard with a bell." } },
    enter: { type: "boolean", default: false, label: { de: "Eingabe", en: "Enter" },
      describe: { de: "Zum Schluss ein kräftiger Anschlag der Eingabetaste (bei der Schreibmaschine mit Glöckchen).", en: "At the end a firm press of the enter key (with a bell on the typewriter)." } },
  },
  presets: {
    keystroke: { label: { de: "Ein Anschlag", en: "One keystroke" }, values: { keys: 1 } },
    chat: { label: { de: "Nachricht tippen", en: "Typing a message" }, values: { keys: 12, speed: 9, keyboard: "laptop", enter: true } },
    typewriter: { label: { de: "Schreibmaschine", en: "Typewriter" }, values: { keys: 10, speed: 6, keyboard: "typewriter", enter: true } },
  },
  loop: false, maxSeconds: 4,
  build(p, seed) {
    const r = rng(seed), k = TASTATUR[p.keyboard as keyof typeof TASTATUR], schritt = 1 / p.speed;
    const glocke = p.enter && p.keyboard === "typewriter", nach = glocke ? 0.9 : 0.12;
    // The moments of the keys first, as many as fit the length budget
    const zeiten: number[] = [];
    for (let n = 0, zeit = 0; n < p.keys; n++) { zeiten.push(zeit); zeit += schritt * (1 + (r() - 0.5) * 2 * k.wandern); }
    const eingabe = () => (p.enter ? zeiten[zeiten.length - 1] + schritt * 1.3 : -1);
    while (zeiten.length > 1 && Math.max(zeiten[zeiten.length - 1], eingabe()) + nach > 3.95) zeiten.pop();
    const s = buffer(Math.max(zeiten[zeiten.length - 1], eingabe()) + nach);
    // Down and back up: a click in the key's band, a low thud of the board, and a softer click as it rises
    const anschlag = (zeit: number, laut: number, taste: number) => {
      const at = Math.round(zeit * RATE), bp = new Biquad("bandpass", k.klick * (0.85 + r() * 0.3) * taste, k.q), tief = new Osc("sine"), hoch = Math.round((0.03 + r() * 0.03) * RATE);
      for (let i = 0; i < 0.09 * RATE && at + i < s.length; i++) {
        const t = i / RATE, rauf = i >= hoch ? envelope((i - hoch) / RATE, 0.0003, k.tau * 0.7) * 0.35 : 0;
        s[at + i] += (bp.run(white(r)) * (envelope(t, 0.0003, k.tau) + rauf) * 1.6 + tief.next(k.dumpf) * envelope(t, 0.001, 0.012) * 0.5) * laut;
      }
    };
    for (const zeit of zeiten) anschlag(zeit, 0.6 + 0.4 * r(), 1);
    if (p.enter) anschlag(eingabe(), 1.4, 0.8);
    if (glocke) {
      // The typewriter's bell at the end of the line
      const at = Math.round(eingabe() * RATE), a = new Osc("sine"), b = new Osc("sine");
      for (let i = 0; at + i < s.length; i++) { const t = i / RATE; s[at + i] += (a.next(2350) + b.next(2350 * 2.76) * 0.3) * envelope(t, 0.001, 0.15) * 0.5; }
    }
    return s;
  },
});
