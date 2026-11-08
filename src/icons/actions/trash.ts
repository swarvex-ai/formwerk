import { line, polygon, type Pt } from "../../core/vector";
import { area, defineIcon, detail, stroke, type Part } from "../define";
import { CLEAR, EDGE, largest, turn } from "../shared";

export const trash = defineIcon({
  id: "trash", category: "actions",
  title: { de: "Papierkorb", en: "Trash" },
  description: {
    de: "Ein Mülleimer mit Deckel und Griff für Löschen und Papierkorb, mit Rillen und auch mit angehobenem Deckel.",
    en: "A bin with lid and handle for delete and trash, with grooves and also with the lid lifted.",
  },
  params: {
    width: { type: "number", min: 10, max: 16, step: 0.5, default: 13, label: { de: "Breite", en: "Width" },
      describe: { de: "Breite des Eimers oben in Rasterpunkten (von 24), der Deckel steht etwas über: 11 schlank, 13 üblich, 15 breit.", en: "Width of the bin at the top in grid units (of 24), the lid overhangs a little: 11 slim, 13 usual, 15 wide." } },
    height: { type: "number", min: 10, max: 16, step: 0.5, default: 14, label: { de: "Höhe", en: "Height" },
      describe: { de: "Höhe des Eimers unter dem Deckel: 11 gedrungen, 14 üblich, 16 hoch; der Griff kommt dazu.", en: "Height of the bin below the lid: 11 squat, 14 usual, 16 tall; the handle comes on top." } },
    grooves: { type: "integer", min: 0, max: 3, default: 2, label: { de: "Rillen", en: "Grooves" },
      describe: { de: "Senkrechte Rillen im Eimer: 0 glatt, 2 üblich, 3 wie ein Metalleimer; bei schmalen Eimern und kräftigem Strich weniger.", en: "Vertical grooves in the bin: 0 plain, 2 usual, 3 like a metal bin; fewer on narrow bins with a heavy stroke." } },
    open: { type: "boolean", default: false, label: { de: "Offen", en: "Open" },
      describe: { de: "Der Deckel ist angehoben und schräg, etwa beim Hineinziehen einer Datei.", en: "The lid is lifted and tilted, when a file is dragged onto it." } },
  },
  presets: {
    delete: { label: { de: "Löschen", en: "Delete" }, values: { grooves: 2 } },
    bin: { label: { de: "Papierkorb", en: "Bin" }, values: { grooves: 0, width: 14, height: 13 } },
    "drop-here": { label: { de: "Hier ablegen", en: "Drop here" }, values: { open: true, grooves: 3, width: 14 } },
  },
  build(p, pen) {
    const ueber = 1.75;
    const breite = Math.min(p.width, 24 - 2 * EDGE - pen.width - 2 * ueber);
    const henkel = Math.max(breite * 0.2, (pen.width + CLEAR) / 2 + 0.25), henkelH = Math.max(2.25, pen.width + CLEAR);
    const bauen = (h: number): Part[] => {
      const verj = breite * 0.07, l = -breite / 2, r = breite / 2;
      const koerper = polygon([l, 0], [l + verj, h], [r - verj, h], [r, 0]);
      let deckel: Pt[] = [[l - ueber, 0], [r + ueber, 0]], griff: Pt[] = [[-henkel, 0], [-henkel, -henkelH], [henkel, -henkelH], [henkel, 0]];
      if (p.open) {
        // Lifted clear of the bin, tilted up to the right around its left end
        const heben = pen.width + CLEAR + 0.5, um: Pt = [l - ueber, 0];
        deckel = turn(deckel, -16, um).map(([x, y]): Pt => [x, y - heben]);
        griff = turn(griff, -16, um).map(([x, y]): Pt => [x, y - heben]);
      }
      const teile: Part[] = [area(koerper), stroke(line(...deckel)), stroke(line(...griff))];
      // Grooves evenly across the narrower bottom, with clear room to the sides and to the top and bottom
      const unten = breite - 2 * verj, rand = pen.width + CLEAR, lang = h - 2 * rand;
      let n = p.grooves;
      while (n > 0 && unten / (n + 1) - pen.width < CLEAR) n--;
      if (lang >= 1.5) for (let i = 1; i <= n; i++) {
        const x = l + verj + (i * unten) / (n + 1);
        teile.push(detail(line([x, rand], [x, h - rand])));
      }
      return teile;
    };
    return largest(6, p.height, pen, bauen);
  },
});
