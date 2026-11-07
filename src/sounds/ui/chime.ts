import { buffer, envelope, Osc, RATE, semitones } from "../../core/audio";
import { defineSound } from "../define";

// Notes walk up (or down) the tones of a chord, so every combination stays in tune
const AKKORDE = { major: [0, 4, 7, 12, 16], minor: [0, 3, 7, 12, 15], fifths: [0, 7, 12, 19, 24] } as const;
const GLOCKE = { ratio: [1, 2, 2.76, 5.4], amp: [1, 0.4, 0.5, 0.2], decay: [1, 0.7, 0.5, 0.25] };

export const chime = defineSound({
  id: "chime", category: "ui",
  title: { de: "Signalton", en: "Chime" },
  description: {
    de: "Ein bis fünf Töne aus einem Akkord: Bestätigung, Fehler, Level-up oder eine Nachricht. Bleibt bei jeder Einstellung harmonisch.",
    en: "One to five notes from a chord: confirm, error, level up or a message. Stays in tune at every setting.",
  },
  params: {
    pitch: { type: "number", min: 200, max: 1500, step: 1, default: 660, unit: "Hz", label: { de: "Grundton", en: "Root note" },
      describe: { de: "Der erste Ton: 330 Hz klingt ernst, 660 Hz freundlich, 1200 Hz hell und klein.", en: "The first note: 330 Hz sounds serious, 660 Hz friendly, 1200 Hz bright and small." } },
    notes: { type: "integer", min: 1, max: 5, default: 2, label: { de: "Töne", en: "Notes" },
      describe: { de: "Wie viele Töne: 2 für Bestätigen oder Fehler, 4 bis 5 für ein Level-up.", en: "How many notes: 2 for confirm or error, 4 to 5 for a level up." } },
    chord: { type: "choice", options: ["major", "minor", "fifths"], default: "fifths", label: { de: "Akkord", en: "Chord" },
      labels: { major: { de: "Dur (fröhlich)", en: "Major (happy)" }, minor: { de: "Moll (traurig)", en: "Minor (sad)" }, fifths: { de: "Quinten (offen)", en: "Fifths (open)" } },
      describe: { de: "Aus welchen Tönen die Folge besteht: Dur für Erfolg, Moll für Fehler und Verlust, Quinten neutral.", en: "Which notes the sequence uses: major for success, minor for errors and loss, fifths neutral." } },
    direction: { type: "choice", options: ["up", "down"], default: "up", label: { de: "Richtung", en: "Direction" },
      labels: { up: { de: "Aufwärts", en: "Up" }, down: { de: "Abwärts", en: "Down" } },
      describe: { de: "Aufwärts klingt nach Ja und Gewinn, abwärts nach Nein und Ende.", en: "Up sounds like yes and winning, down like no and the end." } },
    spacing: { type: "number", min: 0.03, max: 0.25, step: 0.005, default: 0.08, unit: "s", label: { de: "Abstand", en: "Spacing" },
      describe: { de: "Zeit zwischen den Tönen: 0,05 s wirkt flink, 0,15 s feierlich.", en: "Time between notes: 0.05 s feels quick, 0.15 s ceremonial." } },
    ring: { type: "number", min: 0.05, max: 0.5, step: 0.01, default: 0.2, unit: "s", label: { de: "Nachklang", en: "Ring" },
      describe: { de: "Wie lange jeder Ton klingt: 0,08 s trocken für Menüs, 0,35 s für eine Glocke.", en: "How long each note rings: 0.08 s dry for menus, 0.35 s for a bell." } },
    tone: { type: "choice", options: ["soft", "bell", "retro"], default: "soft", label: { de: "Klangfarbe", en: "Timbre" },
      labels: { soft: { de: "Weich", en: "Soft" }, bell: { de: "Glocke", en: "Bell" }, retro: { de: "Retro (8 Bit)", en: "Retro (8-bit)" } },
      describe: { de: "Weich wie eine Marimba, metallisch wie eine Glocke oder als Rechteckton wie alte Konsolen.", en: "Soft like a marimba, metallic like a bell, or a square wave like old consoles." } },
  },
  presets: {
    confirm: { label: { de: "Bestätigen", en: "Confirm" }, values: { notes: 2, chord: "fifths", direction: "up" } },
    deny: { label: { de: "Fehler", en: "Error" }, values: { pitch: 330, notes: 2, chord: "minor", direction: "down", spacing: 0.11, ring: 0.1, tone: "retro" } },
    "level-up": { label: { de: "Level-up", en: "Level up" }, values: { pitch: 523, notes: 5, chord: "major", spacing: 0.07, ring: 0.35, tone: "bell" } },
  },
  loop: false, maxSeconds: 3.6,
  build(p) {
    const stufen = AKKORDE[p.chord].slice(0, p.notes);
    const folge = p.direction === "up" ? stufen : [...stufen].reverse();
    const s = buffer((p.notes - 1) * p.spacing + p.ring * 5 + 0.01);
    folge.forEach((stufe, n) => {
      const f = semitones(p.pitch, stufe), at = Math.round(n * p.spacing * RATE), letzter = n === folge.length - 1;
      // Retro: each note stops before the next one (like a console channel), only the last one rings
      const dauer = p.tone === "retro" && !letzter ? p.spacing * 0.9 : p.ring * 5;
      const teile = p.tone === "bell" ? GLOCKE.ratio.map((k, i) => ({ k, amp: GLOCKE.amp[i], decay: GLOCKE.decay[i] }))
        : p.tone === "soft" ? [{ k: 1, amp: 1, decay: 1 }, { k: 2, amp: 0.25, decay: 0.5 }] : [{ k: 1, amp: 0.5, decay: 0.6 }];
      const oscs = teile.map(() => new Osc(p.tone === "retro" ? "square" : "sine"));
      for (let i = 0; i < dauer * RATE && at + i < s.length; i++) {
        const t = i / RATE;
        let x = 0;
        teile.forEach((teil, j) => {
          if (f * teil.k < 18000) x += oscs[j].next(f * teil.k) * teil.amp * envelope(t, p.tone === "soft" ? 0.004 : 0.002, p.ring * teil.decay);
        });
        if (p.tone === "retro" && !letzter) x *= Math.min(1, (dauer - t) / 0.004);
        s[at + i] += x;
      }
    });
    return s;
  },
});
