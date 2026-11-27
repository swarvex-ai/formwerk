import { circle, line, onCircle, polygon, type Pt } from "../../core/vector";
import { area, defineIcon, detail, type Part } from "../define";
import { CLEAR, largest, turn } from "../shared";

export const pill = defineIcon({
  id: "pill", category: "objects",
  title: { de: "Tablette", en: "Pill" },
  description: {
    de: "Eine Tablette für Medizin, Gesundheit, Apotheke, Rezepte und Tränke: eine Kapsel mit zwei runden Enden oder eine runde Tablette mit Bruchkerbe.",
    en: "A pill for medicine, health, pharmacy, prescriptions and potions: a capsule with two round ends or a round tablet with a score line.",
  },
  params: {
    shape: { type: "choice", options: ["capsule", "tablet"], default: "capsule", label: { de: "Form", en: "Shape" },
      labels: { capsule: { de: "Kapsel", en: "Capsule" }, tablet: { de: "Tablette", en: "Tablet" } },
      describe: { de: "Kapsel (lang mit zwei runden Enden) oder runde Tablette.", en: "A capsule (long with two round ends) or a round tablet." } },
    length: { type: "number", min: 1.8, max: 2.8, step: 0.1, default: 2.3, label: { de: "Länge", en: "Length" },
      describe: { de: "Länge der Kapsel als Vielfaches ihrer Breite: 1,8 kurz und dick, 2,3 üblich, 2,8 lang; bei der Tablette ohne Wirkung.", en: "Length of the capsule as a multiple of its width: 1.8 short and fat, 2.3 usual, 2.8 long; no effect on a tablet." } },
    angle: { type: "number", min: 0, max: 60, step: 15, default: 45, unit: "°", label: { de: "Winkel", en: "Angle" },
      describe: { de: "Neigung der Kapsel oder Richtung der Bruchkerbe der Tablette in Grad: 0 liegend, 45 schräg nach rechts oben.", en: "Tilt of the capsule, or direction of the tablet's score line, in degrees: 0 lying, 45 diagonal rising to the right." } },
    split: { type: "boolean", default: true, label: { de: "Teilung", en: "Split" },
      describe: { de: "Die Linie quer über die Mitte: die Naht der Kapsel, die Bruchkerbe der Tablette.", en: "The line across the middle: the seam of a capsule, the score of a tablet." } },
  },
  presets: {
    capsule: { label: { de: "Kapsel", en: "Capsule" }, values: { shape: "capsule" } },
    tablet: { label: { de: "Tablette", en: "Tablet" }, values: { shape: "tablet", angle: 0 } },
    vitamin: { label: { de: "Vitamin", en: "Vitamin" }, values: { length: 1.8, angle: 30, split: false } },
  },
  build(p, pen) {
    const hw = pen.width / 2, kapsel = p.shape === "capsule";
    // The line ends a clear margin inside the outline; in a filled icon it is cut out and stops at the inner edge of
    // the outline, else it would cut it. Square caps reach out with their corners across a round tablet.
    const ecke = pen.corners === "sharp" && !kapsel ? hw * Math.SQRT2 : hw;
    const innen = (r: number) => (p.style === "filled" ? r - hw - ecke : r - hw - CLEAR - ecke);
    const um = (pts: Pt[]) => turn(pts.map(([x, y]): Pt => [12 + x, 12 + y]), -p.angle);
    return largest(2, 11, pen, (r): Part[] => {
      const l = innen(r);
      if (!kapsel) {
        const teile: Part[] = [area(circle([12, 12], r))];
        if (p.split && l > 0) teile.push(detail(line(...um([[-l, 0], [l, 0]]))));
        return teile;
      }
      // Centres of the two round ends on the long axis; each end is a half circle of 9 points
      const a = r * (p.length - 1);
      const rechts = Array.from({ length: 9 }, (_, i) => onCircle([a, 0], r, (i * 180) / 8));
      const links = Array.from({ length: 9 }, (_, i) => onCircle([-a, 0], r, 180 + (i * 180) / 8));
      const teile: Part[] = [area(polygon(...um([...rechts, ...links])))];
      if (p.split && l > 0) teile.push(detail(line(...um([[0, -l], [0, l]]))));
      return teile;
    });
  },
});
