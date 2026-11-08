import { line, polygon, reach, type Pt } from "../../core/vector";
import { area, defineIcon, dot, stroke, type Part } from "../define";
import { CLEAR, largest } from "../shared";

export const pencil = defineIcon({
  id: "pencil", category: "actions",
  title: { de: "Stift", en: "Pencil" },
  description: {
    de: "Ein Bleistift für Bearbeiten, Schreiben und Umbenennen, mit Spitze, Zwinge und auf Wunsch einer Schreiblinie.",
    en: "A pencil for edit, write and rename, with a tip, a ferrule and, if you like, a line it writes on.",
  },
  params: {
    angle: { type: "number", min: 30, max: 60, step: 1, default: 45, unit: "°", label: { de: "Neigung", en: "Angle" },
      describe: { de: "Neigung gegen die Waagrechte, die Spitze unten links: 45° üblich, 35° flach wie beim Schreiben, 60° steil.", en: "Slope against the horizontal, the tip at the bottom left: 45° usual, 35° flat like writing, 60° steep." } },
    length: { type: "number", min: 14, max: 26, step: 0.5, default: 22, label: { de: "Länge", en: "Length" },
      describe: { de: "Länge von der Spitze bis zum Ende in Rasterpunkten: 16 kurz, 22 üblich, 26 so lang, wie die Diagonale erlaubt.", en: "Length from tip to end in grid units: 16 short, 22 usual, 26 as long as the diagonal allows." } },
    width: { type: "number", min: 4, max: 6.5, step: 0.25, default: 5, label: { de: "Dicke", en: "Thickness" },
      describe: { de: "Dicke des Stifts: 4 schlank wie ein Bleistift, 5 üblich, 6,5 dick wie ein Marker.", en: "Thickness of the pencil: 4 slim like a pencil, 5 usual, 6.5 thick like a marker." } },
    underline: { type: "boolean", default: false, label: { de: "Schreiblinie", en: "Writing line" },
      describe: { de: "Eine Linie unter der Spitze, für Text bearbeiten oder unterschreiben.", en: "A line below the tip, for editing text or signing." } },
  },
  presets: {
    edit: { label: { de: "Bearbeiten", en: "Edit" }, values: { length: 21, width: 4.75 } },
    "edit-text": { label: { de: "Text bearbeiten", en: "Edit text" }, values: { underline: true, angle: 40 } },
    marker: { label: { de: "Marker", en: "Marker" }, values: { width: 6.5, length: 20 } },
  },
  build(p, pen) {
    const hw = pen.width / 2, a = (p.angle * Math.PI) / 180, dir: Pt = [Math.cos(a), -Math.sin(a)], quer: Pt = [Math.sin(a), Math.cos(a)];
    const halb = p.width / 2, kegel = p.width * 1.05, zwinge = Math.max(p.width * 0.7, pen.width + CLEAR);
    const spitzeWinkel = (2 * Math.atan(halb / kegel) * 180) / Math.PI;
    const bauen = (l: number): Part[] => {
      const at = (u: number, v: number): Pt => [u * dir[0] + v * quer[0], u * dir[1] + v * quer[1]];
      // The body from the tip, and the end cap apart from it with a clear gap (reads as a cut in every style)
      const fuge = l - zwinge - pen.width - CLEAR;
      const teile: Part[] = [
        area(polygon(at(0, 0), at(kegel, -halb), at(fuge, -halb), at(fuge, halb), at(kegel, halb))),
        area(polygon(at(l - zwinge, -halb), at(l, -halb), at(l, halb), at(l - zwinge, halb))),
        // The sharpened tip is solid: no narrow wedge of paper inside it
        dot(polygon(at(0, 0), at(kegel, -halb), at(kegel, halb))),
      ];
      if (p.underline) {
        // Below the tip with clear room under its point, as far right as the pencil reaches
        const y = reach(pen, spitzeWinkel) + CLEAR + hw, ende = at(l, halb)[0];
        teile.push(stroke(line([-halb, y], [ende, y])));
      }
      return teile;
    };
    return largest(kegel + zwinge + pen.width + CLEAR + 1.5, p.length, pen, bauen);
  },
});
