import { line, polygon, type Pt } from "../../core/vector";
import { area, defineIcon, stroke, type Part } from "../define";
import { CLEAR, largest } from "../shared";

export const upload = defineIcon({
  id: "upload", category: "actions",
  title: { de: "Hochladen", en: "Upload" },
  description: {
    de: "Ein Pfeil aus der Ablage heraus für Hochladen und Senden, mit gefülltem oder offenem Kopf; das Gegenstück nach unten ist Herunterladen.",
    en: "An arrow rising out of a tray for upload and sending, with a filled or an open head; its mirror pointing down is download.",
  },
  params: {
    arrowLength: { type: "number", min: 8, max: 14, step: 0.5, default: 11, label: { de: "Pfeillänge", en: "Arrow length" },
      describe: { de: "Länge des Pfeils von der Ablage bis zur Spitze in Rasterpunkten: 8 kurz, 11 üblich, 14 lang; reicht die Höhe nicht, wird er kürzer.", en: "Length of the arrow from the tray to its tip in grid units: 8 short, 11 usual, 14 long; it shortens where the height is not enough." } },
    trayDepth: { type: "number", min: 0, max: 6, step: 0.5, default: 4, label: { de: "Ablagetiefe", en: "Tray depth" },
      describe: { de: "Höhe der Seitenwände der Ablage in Rasterpunkten: 0 nur eine Linie, 4 üblich, 6 eine tiefe Schale.", en: "Height of the tray's side walls in grid units: 0 only a line, 4 usual, 6 a deep bowl." } },
    head: { type: "choice", options: ["open", "filled"], default: "filled", label: { de: "Pfeilkopf", en: "Arrow head" },
      labels: { open: { de: "Offen", en: "Open" }, filled: { de: "Gefüllt", en: "Filled" } },
      describe: { de: "Ein offener Kopf aus zwei Schenkeln wie ein Chevron, ein gefüllter als breiter Blockpfeil.", en: "An open head of two strokes like a chevron, a filled one as a wide block arrow." } },
  },
  presets: {
    publish: { label: { de: "Veröffentlichen", en: "Publish" }, values: { head: "open", arrowLength: 13, trayDepth: 2 } },
    backup: { label: { de: "Sicherung", en: "Backup" }, values: { trayDepth: 6, arrowLength: 9 } },
  },
  build(p, pen) {
    const breite = 18, tief = p.trayDepth >= pen.width ? p.trayDepth : 0;
    const schale: Pt[] = tief ? [[-breite / 2, -tief], [-breite / 2, 0], [breite / 2, 0], [breite / 2, -tief]] : [[-breite / 2, 0], [breite / 2, 0]];
    const bauen = (l: number): Part[] => {
      const teile: Part[] = [stroke(line(...schale))];
      // The arrow leaves the tray upward, its tail standing clear above the tray's line
      const unten = -(pen.width + CLEAR), roh = (y: number) => unten - y; // y from the tail (0) to the tip (l)
      if (p.head === "filled") {
        const schaft = Math.max(2, pen.width / 2 + 0.9);
        const kopf = schaft + (tief > 0 ? Math.max(1.6, 2.5 - tief * 0.2) : 2.5);
        const hals = l - kopf;
        const pts: Pt[] = [[-schaft, 0], [schaft, 0], [schaft, hals], [kopf, hals], [0, l], [-kopf, hals], [-schaft, hals]];
        teile.push(area(polygon(...pts.map(([x, y]): Pt => [x, roh(y)]))));
      } else {
        const kopf = Math.min(5, l * 0.42), ende = pen.corners === "sharp" ? l - pen.width / 2 : l;
        teile.push(stroke(line([0, roh(0)], [0, roh(ende)])), stroke(line([-kopf, roh(l - kopf)], [0, roh(l)], [kopf, roh(l - kopf)])));
      }
      return teile;
    };
    return largest(6, p.arrowLength, pen, bauen);
  },
});
