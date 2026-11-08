import { circle, line, rect, type Shape } from "../../core/vector";
import { area, defineIcon, dot, stroke, type Part } from "../define";
import { CLEAR, EDGE } from "../shared";

export const list = defineIcon({
  id: "list", category: "navigation",
  title: { de: "Liste und Menü", en: "List and menu" },
  description: {
    de: "Zeilen mit oder ohne Aufzählungspunkte: eine Liste, eine Aufgabenliste, und ohne Punkte das Menü (Hamburger).",
    en: "Rows with or without bullets: a list, a to-do list, and without bullets the menu (hamburger).",
  },
  params: {
    lines: { type: "integer", min: 2, max: 4, default: 3, label: { de: "Zeilen", en: "Lines" },
      describe: { de: "Zahl der Zeilen: 3 üblich für Menü und Liste, 2 knapp, 4 für eine lange Liste.", en: "Number of rows: 3 usual for menu and list, 2 terse, 4 for a long list." } },
    width: { type: "number", min: 16, max: 21.5, step: 0.5, default: 18, label: { de: "Breite", en: "Width" },
      describe: { de: "Breite in Rasterpunkten (von 24) samt Punkten: 16 kompakt, 18 üblich, 21 fast randlos.", en: "Width in grid units (of 24) including bullets: 16 compact, 18 usual, 21 nearly edge to edge." } },
    spacing: { type: "number", min: 5, max: 7, step: 0.25, default: 6.5, label: { de: "Zeilenabstand", en: "Spacing" },
      describe: { de: "Abstand der Zeilen von Mitte zu Mitte: 5 dicht, 6,5 üblich, 7 luftig; bei vielen Zeilen wird er so weit enger, wie es nötig ist.", en: "Distance between rows centre to centre: 5 dense, 6.5 usual, 7 airy; with many rows it narrows as far as needed." } },
    bullets: { type: "choice", options: ["none", "round", "square"], default: "round", label: { de: "Punkte", en: "Bullets" },
      labels: { none: { de: "Ohne (Menü)", en: "None (menu)" }, round: { de: "Rund", en: "Round" }, square: { de: "Eckig (Aufgaben)", en: "Square (to-dos)" } },
      describe: { de: "Ohne Punkte ist es das Menü-Symbol, mit runden eine Liste, mit eckigen eine Aufgabenliste; wo Ringe zu eng würden, werden es volle Punkte.", en: "Without bullets it is the menu symbol, with round ones a list, with square ones a to-do list; where rings would be too tight they become solid dots." } },
  },
  presets: {
    menu: { label: { de: "Menü", en: "Menu" }, values: { bullets: "none", width: 18 } },
    "to-do": { label: { de: "Aufgaben", en: "To-dos" }, values: { bullets: "square", lines: 3, spacing: 7 } },
    long: { label: { de: "Lange Liste", en: "Long list" }, values: { lines: 4, spacing: 5.5 } },
  },
  build(p, pen) {
    const hw = pen.width / 2, n = p.lines, punkte = p.bullets !== "none";
    // Rings when their hole and the gap to the next row both read, solid dots otherwise
    const ring = hw + 0.6, ringPasst = 2 * (ring + hw) + CLEAR <= p.spacing;
    const halb = punkte ? (ringPasst ? ring + hw : Math.min(hw + 0.6, (p.spacing - CLEAR) / 2)) : hw;
    const abstand = Math.min(p.spacing, (24 - 2 * EDGE - 2 * Math.max(halb, hw)) / (n - 1));
    const echt = punkte ? (ringPasst && abstand === p.spacing ? ring + hw : Math.min(halb, (abstand - CLEAR) / 2)) : hw;
    const links = 12 - p.width / 2, rechts = 12 + p.width / 2 - hw, y0 = 12 - ((n - 1) * abstand) / 2;
    const teile: Part[] = [];
    for (let i = 0; i < n; i++) {
      const y = y0 + i * abstand;
      if (!punkte) { teile.push(stroke(line([links + hw, y], [rechts, y]))); continue; }
      const mx = links + echt, alsRing = echt > hw + 0.5 && echt === ring + hw, r = alsRing ? ring : echt;
      const form: Shape = p.bullets === "round" ? circle([mx, y], r) : rect(mx - r, y - r, 2 * r, 2 * r, 0.5);
      teile.push(alsRing ? area(form) : dot(form));
      teile.push(stroke(line([links + 2 * echt + CLEAR + hw, y], [rechts, y])));
    }
    return teile;
  },
});
