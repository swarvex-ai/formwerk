import { hex, Pixels, ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 16, H = 16;

export const scroll = defineSprite({
  id: "scroll", category: "items",
  title: { de: "Schriftrolle", en: "Scroll" },
  description: {
    de: "Eine Schriftrolle als Pixel-Symbol für Zauber, Karten und Briefe: Papier zwischen zwei Rollen, Textzeilen und ein Wachssiegel; sie rollt sich auf. 16 × 16 Pixel.",
    en: "A scroll as a pixel icon for spells, maps and letters: paper between two rolls, lines of text and a wax seal; it unrolls. 16 × 16 pixels.",
  },
  params: {
    width: { type: "integer", min: 8, max: 12, default: 10, label: { de: "Breite", en: "Width" },
      describe: { de: "Breite des Papiers in Pixeln: 8 eine Notiz, 12 eine breite Urkunde.", en: "Width of the paper in pixels: 8 a note, 12 a wide charter." } },
    length: { type: "integer", min: 4, max: 9, default: 7, label: { de: "Länge", en: "Length" },
      describe: { de: "Geöffnetes Papier zwischen den Rollen in Pixeln: 4 ein Brief, 9 eine lange Rolle.", en: "Open paper between the rolls in pixels: 4 a letter, 9 a long scroll." } },
    lines: { type: "integer", min: 0, max: 4, default: 3, label: { de: "Textzeilen", en: "Text lines" },
      describe: { de: "Zeilen Text auf dem Papier: 0 leer, 3 ein Zauber; so viele wie in die Länge passen.", en: "Lines of text on the paper: 0 blank, 3 a spell; as many as fit the length." } },
    seal: { type: "boolean", default: true, label: { de: "Siegel", en: "Seal" },
      describe: { de: "Ein Wachssiegel unten auf dem Papier, wie an einem offiziellen Brief.", en: "A wax seal at the bottom of the paper, like on an official letter." } },
    paper: { type: "color", default: "#e8d6a8", label: { de: "Papier", en: "Paper" },
      describe: { de: "Farbe des Papiers: Pergament #e8d6a8, altes Papier #c9b07a, weiß #f2efe6.", en: "Colour of the paper: parchment #e8d6a8, old paper #c9b07a, white #f2efe6." } },
    sealColor: { type: "color", default: "#b02a30", label: { de: "Siegelfarbe", en: "Seal colour" },
      describe: { de: "Farbe des Wachses: rot #b02a30, blau #2f5fb0, grün #2f8f4a.", en: "Colour of the wax: red #b02a30, blue #2f5fb0, green #2f8f4a." } },
  },
  presets: {
    spell: { label: { de: "Zauberspruch", en: "Spell" }, values: { width: 10, length: 8, lines: 4, sealColor: "#2f5fb0" } },
    letter: { label: { de: "Brief", en: "Letter" }, values: { width: 12, length: 4, lines: 2, paper: "#f2efe6" } },
  },
  frame: { w: W, h: H },
  directions: ["down"],
  animations: [{ name: "idle", frames: 1, fps: 1, loop: true }, { name: "unroll", frames: 4, fps: 8, loop: false }],
  grounded: false,
  build(p) {
    const m = ramp(p.paper), s = ramp(p.sealColor), tinte = hex("#5a4632");
    return (animation, _d, f) => {
      const b = new Pixels(W, H);
      const offen = animation === "unroll" ? Math.round((p.length * f) / 3) : p.length;
      const x0 = Math.round((16 - p.width) / 2), y0 = Math.round((16 - offen - 4) / 2), cx = x0 + Math.floor(p.width / 2);
      // The open paper with its lines of text
      b.rect(x0, y0 + 2, p.width, offen, m.base);
      for (let j = 0; j < p.lines; j++) {
        const y = y0 + 3 + 2 * j;
        if (y >= y0 + 1 + offen) break;
        b.rect(x0 + 1, y, p.width - 2 - (j % 2) * 2, 1, tinte);
      }
      // The two rolled edges above and below the paper
      for (const y of [y0, y0 + 2 + offen]) {
        b.rect(x0 - 1, y, p.width + 2, 1, m.light);
        b.rect(x0 - 1, y + 1, p.width + 2, 1, m.dark);
        b.set(x0 - 1, y + 1, m.deep);
        b.set(x0 + p.width, y + 1, m.deep);
      }
      // The wax seal over the lower roll
      if (p.seal) {
        b.rect(cx - 1, y0 + 1 + offen, 2, 2, s.base);
        b.set(cx - 1, y0 + 1 + offen, s.light);
        b.rect(cx - 1, y0 + 3 + offen, 2, 1, s.dark);
      }
      return b;
    };
  },
});
