import { polygon, rect, type Shape } from "../../core/vector";
import { area, defineIcon, dot, gap, type Part } from "../define";
import { centre } from "../shared";

export const copy = defineIcon({
  id: "copy", category: "actions",
  title: { de: "Kopieren", en: "Copy" },
  description: {
    de: "Zwei überlappende Blätter für Kopieren und Duplizieren: das vordere vollständig, das hintere nur dort, wo es frei liegt, mit geradem oder umgeknicktem Eck.",
    en: "Two overlapping sheets for copy and duplicate: the front one complete, the back one only where it shows, with a plain or folded corner.",
  },
  params: {
    offset: { type: "number", min: 3, max: 5, step: 0.5, default: 3.5, label: { de: "Versatz", en: "Offset" },
      describe: { de: "Wie weit das hintere Blatt nach oben rechts versetzt ist in Rasterpunkten: 3 knapp, 3,5 üblich, 5 deutlich getrennt.", en: "How far the back sheet is shifted up and right in grid units: 3 tight, 3.5 usual, 5 clearly apart." } },
    sheetRatio: { type: "number", min: 0.6, max: 1, step: 0.05, default: 0.78, label: { de: "Blattverhältnis", en: "Sheet ratio" },
      describe: { de: "Breite zur Höhe des Blattes: 0,6 hoch wie ein Brief, 0,78 üblich, 1 quadratisch wie eine Karte.", en: "Width to height of the sheet: 0.6 tall like a letter, 0.78 usual, 1 square like a card." } },
    corner: { type: "choice", options: ["plain", "folded"], default: "plain", label: { de: "Ecke", en: "Corner" },
      labels: { plain: { de: "Gerade", en: "Plain" }, folded: { de: "Umgeknickt", en: "Folded" } },
      describe: { de: "Gerade Ecken wie ein Blatt Papier oder eine umgeknickte Ecke wie bei einem Dokument mit Eselsmarke.", en: "Straight corners like a sheet of paper or a folded corner like a dog-eared document." } },
  },
  presets: {
    document: { label: { de: "Dokument", en: "Document" }, values: { offset: 4, sheetRatio: 0.7, corner: "folded" } },
    cards: { label: { de: "Karten", en: "Cards" }, values: { offset: 4.5, sheetRatio: 1 } },
  },
  build(p, pen) {
    const h = 14, w = h * p.sheetRatio, r = 1.5;
    const xl = 12 - (w + p.offset) / 2, yt = 12 - (h + p.offset) / 2;
    const fx = xl, fy = yt + p.offset, bx = xl + p.offset, by = yt;
    const d = Math.min(4, w * 0.3);
    const front: Shape = p.corner === "folded"
      ? polygon([fx, fy], [fx + w - d, fy], [fx + w, fy + d], [fx + w, fy + h], [fx, fy + h])
      : rect(fx, fy, w, h, r);
    const teile: Part[] = [area(rect(bx, by, w, h, r)), gap(front, 1.25, true), area(front)];
    if (p.corner === "folded") teile.push(dot(polygon([fx + w - d, fy], [fx + w - d, fy + d], [fx + w, fy + d])));
    return centre(teile, pen);
  },
});
