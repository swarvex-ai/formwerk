import { line, polygon, type Pt } from "../../core/vector";
import { area, defineIcon, stroke, type Part } from "../define";
import { CLEAR, inkRadius, largest } from "../shared";

export const download = defineIcon({
  id: "download", category: "actions",
  title: { de: "Herunterladen", en: "Download" },
  description: {
    de: "Ein Pfeil in eine Ablage für Herunterladen und Speichern, nach oben für Hochladen und Teilen, als Block- oder Linienpfeil.",
    en: "An arrow into a tray for download and save, pointing up for upload and share, as a block or a line arrow.",
  },
  params: {
    direction: { type: "choice", options: ["down", "up"], default: "down", label: { de: "Richtung", en: "Direction" },
      labels: { down: { de: "Herunter", en: "Down" }, up: { de: "Hoch", en: "Up" } },
      describe: { de: "Nach unten in die Ablage für Herunterladen, nach oben heraus für Hochladen.", en: "Down into the tray for download, up out of it for upload." } },
    arrow: { type: "choice", options: ["block", "line"], default: "block", label: { de: "Pfeil", en: "Arrow" },
      labels: { block: { de: "Block", en: "Block" }, line: { de: "Linie", en: "Line" } },
      describe: { de: "Ein Blockpfeil als Fläche (gefüllt im Stil Gefüllt) oder ein schlanker Linienpfeil.", en: "A block arrow as an area (solid in the filled style) or a slim line arrow." } },
    tray: { type: "number", min: 0, max: 6, step: 0.5, default: 4, label: { de: "Ablage", en: "Tray" },
      describe: { de: "Höhe der Seitenwände der Ablage: 0 nur ein Strich, 4 üblich, 6 eine tiefe Schale.", en: "Height of the tray's side walls: 0 only a line, 4 usual, 6 a deep bowl." } },
    length: { type: "number", min: 9, max: 15, step: 0.5, default: 12, label: { de: "Pfeillänge", en: "Arrow length" },
      describe: { de: "Länge des Pfeils in Rasterpunkten: 9 kurz über der Ablage, 12 üblich, 15 lang.", en: "Length of the arrow in grid units: 9 short above the tray, 12 usual, 15 long." } },
  },
  presets: {
    save: { label: { de: "Speichern", en: "Save" }, values: { arrow: "line", tray: 3 } },
    upload: { label: { de: "Hochladen", en: "Upload" }, values: { direction: "up", tray: 4 } },
    export: { label: { de: "Exportieren", en: "Export" }, values: { direction: "up", arrow: "line", tray: 0, length: 13 } },
  },
  build(p, pen) {
    const hw = pen.width / 2, breite = 18, tief = p.tray >= pen.width ? p.tray : 0;
    const schale: Pt[] = tief ? [[-breite / 2, -tief], [-breite / 2, 0], [breite / 2, 0], [breite / 2, -tief]] : [[-breite / 2, 0], [breite / 2, 0]];
    const bauen = (l: number): Part[] => {
      const teile: Part[] = [stroke(line(...schale))];
      // The arrow points down onto the tray or up away from it, with clear room above the tray's line
      const spitzeAbstand = hw + CLEAR + inkRadius(pen), unten = p.direction === "down" ? -spitzeAbstand : -(pen.width + CLEAR);
      const roh = (y: number) => (p.direction === "down" ? unten - l + y : unten - y); // y from the tail (0) to the tip (l)
      if (p.arrow === "block") {
        const schaft = Math.max(2, hw + 0.9), kopf = schaft + 2.5, hals = l - kopf;
        const pts: Pt[] = [[-schaft, 0], [schaft, 0], [schaft, hals], [kopf, hals], [0, l], [-kopf, hals], [-schaft, hals]];
        teile.push(area(polygon(...pts.map(([x, y]): Pt => [x, roh(y)]))));
      } else {
        const kopf = Math.min(5, l * 0.42), ende = pen.corners === "sharp" ? l - hw : l;
        teile.push(stroke(line([0, roh(0)], [0, roh(ende)])), stroke(line([-kopf, roh(l - kopf)], [0, roh(l)], [kopf, roh(l - kopf)])));
      }
      return teile;
    };
    return largest(7, p.length, pen, bauen);
  },
});
