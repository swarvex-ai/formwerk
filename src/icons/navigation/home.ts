import { onCircle, polygon, rect, reach } from "../../core/vector";
import { area, defineIcon, hole } from "../define";

export const home = defineIcon({
  id: "home", category: "navigation",
  title: { de: "Haus", en: "Home" },
  description: {
    de: "Ein Haus für die Startseite: Dachneigung, Breite, Tür und Schornstein frei wählbar.",
    en: "A house for the home screen: roof pitch, width, door and chimney as you like.",
  },
  params: {
    width: { type: "number", min: 12, max: 19, step: 0.5, default: 16, label: { de: "Breite", en: "Width" },
      describe: { de: "Breite des Hauses in Rasterpunkten (von 24): 14 schlank, 16 üblich, 19 breit wie ein Bungalow.", en: "Width of the house in grid units (of 24): 14 slim, 16 usual, 19 wide like a bungalow." } },
    roof: { type: "number", min: 25, max: 50, step: 1, default: 40, unit: "°", label: { de: "Dachneigung", en: "Roof pitch" },
      describe: { de: "Neigung des Dachs: 28° flach wie ein Bungalow, 40° üblich, 50° steil wie ein Giebelhaus.", en: "Pitch of the roof: 28° flat like a bungalow, 40° usual, 50° steep like a gabled house." } },
    door: { type: "choice", options: ["none", "square", "arch"], default: "square", label: { de: "Tür", en: "Door" },
      labels: { none: { de: "Keine", en: "None" }, square: { de: "Eckig", en: "Square" }, arch: { de: "Bogen", en: "Arch" } },
      describe: { de: "Eine Tür in der Mitte: eckig wirkt modern, mit Bogen gemütlich; ohne Tür bleibt nur die Form.", en: "A door in the middle: square looks modern, an arch cosy; without a door only the shape stays." } },
    chimney: { type: "boolean", default: false, label: { de: "Schornstein", en: "Chimney" },
      describe: { de: "Ein Schornstein auf der rechten Dachseite, für ein Zuhause statt eines Gebäudes.", en: "A chimney on the right side of the roof, for a home rather than a building." } },
  },
  presets: {
    cottage: { label: { de: "Häuschen", en: "Cottage" }, values: { width: 15, roof: 46, door: "arch", chimney: true } },
    bungalow: { label: { de: "Bungalow", en: "Bungalow" }, values: { width: 19, roof: 28, door: "square" } },
  },
  build(p, pen) {
    const steigung = Math.tan((p.roof * Math.PI) / 180);
    const seite = Math.max(2, 1 + reach(pen, 90)), oben = Math.max(2, 1 + reach(pen, 180 - 2 * p.roof));
    const w = Math.min(p.width, 24 - 2 * seite), x0 = 12 - w / 2, x1 = 12 + w / 2, unten = 24 - seite;
    const first = oben, traufe = first + (w / 2) * steigung, dachY = (x: number) => first + Math.abs(x - 12) * steigung;
    const umriss: [number, number][] = [[x0, unten], [x0, traufe], [12, first]];
    if (p.chimney) {
      // On the right slope, its top a little below the ridge
      const a = 12 + w * 0.16, b = a + Math.max(2.5, pen.width + 1), top = Math.max(first + 1, dachY(a) - 3.5);
      umriss.push([a, dachY(a)], [a, top], [b, top], [b, dachY(b)]);
    }
    umriss.push([x1, traufe], [x1, unten]);
    const teile = [area(polygon(...umriss))];
    const koerper = unten - traufe, tb = Math.min(Math.max(3, w * 0.26), 5.5), th = Math.min(Math.max(koerper * 0.62, tb + 1), koerper - pen.width - 1.5);
    const tuer = tb - pen.width >= 1.5 && th - pen.width >= 1.5;
    if (p.door === "square" && tuer) teile.push(hole(rect(12 - tb / 2, unten - th, tb, th, 0.5)));
    if (p.door === "arch" && tuer && th > tb / 2 + 1) {
      const m: [number, number] = [12, unten - th + tb / 2], bogen = Array.from({ length: 13 }, (_, i) => onCircle(m, tb / 2, 270 + i * 15));
      teile.push(hole(polygon([12 - tb / 2, unten], ...bogen, [12 + tb / 2, unten])));
    }
    return teile;
  },
});
