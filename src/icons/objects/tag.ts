import { circle, line, onCircle, polygon, type Pt } from "../../core/vector";
import { area, defineIcon, hole, stroke, type Part } from "../define";
import { largest, turn } from "../shared";

export const tag = defineIcon({
  id: "tag", category: "objects",
  title: { de: "Etikett", en: "Tag" },
  description: {
    de: "Ein Preisschild oder Etikett für Preis, Kategorie und Schlagwort: ein Fünfeck mit Spitze links und rundem Loch nahe der Spitze.",
    en: "A price tag or label for price, category and keyword: a pentagon with its point on the left and a round hole near the point.",
  },
  params: {
    tilt: { type: "number", min: 0, max: 45, step: 5, default: 0, label: { de: "Neigung", en: "Tilt" },
      describe: { de: "Winkel des ganzen Etiketts in Grad: 0 waagerecht, 30 üblich als Anhänger, 45 steil mit der Spitze nach unten links.", en: "Angle of the whole tag in degrees: 0 level, 30 usual as a hang tag, 45 steep with the point down left." } },
    hole: { type: "choice", options: ["ring", "none"], default: "ring", label: { de: "Loch", en: "Hole" },
      labels: { ring: { de: "Ring", en: "Ring" }, none: { de: "Ohne", en: "None" } },
      describe: { de: "Ein rundes Loch nahe der Spitze zum Aufhängen; ohne wirkt das Etikett schlichter.", en: "A round hole near the point to hang it by; without it the tag looks plainer." } },
    string: { type: "boolean", default: false, label: { de: "Schnur", en: "String" },
      describe: { de: "Eine kurze, gebogene Schnur vom Loch nach links oben; nur mit Loch.", en: "A short curved string from the hole to the top left; only with a hole." } },
  },
  presets: {
    price: { label: { de: "Preisschild", en: "Price tag" }, values: { tilt: 30 } },
    hang: { label: { de: "Anhänger", en: "Hang tag" }, values: { tilt: 45, string: true } },
    plain: { label: { de: "Schlicht", en: "Plain" }, values: { hole: "none", style: "filled" } },
  },
  build(p, pen) {
    const r = 2.5, halb = r + pen.width + 1, d = halb * Math.SQRT2, wmin = d + r + pen.width + 1;
    const etikett = (w: number): Part[] => {
      const schulter = -w / 2 + halb, c: Pt = [-w / 2 + d, 0];
      const form: Pt[] = [[-w / 2, 0], [schulter, -halb], [w / 2, -halb], [w / 2, halb], [schulter, halb]];
      const drehen = (pts: Pt[]) => turn(pts, -p.tilt, [0, 0]);
      const teile: Part[] = [area(polygon(...drehen(form)))];
      if (p.hole === "ring") {
        teile.push(hole(circle(drehen([c])[0], r)));
        if (p.string) {
          // From the rim of the hole out through the upper left edge, bending to one side
          const von = onCircle(c, r, 315), laenge = halb - r + 3.5;
          const kurve = Array.from({ length: 9 }, (_, i): Pt => {
            const t = i / 8, b = 3 * Math.sin(Math.PI * t);
            return [von[0] - (laenge * t) * Math.SQRT1_2 + b * Math.SQRT1_2, von[1] - (laenge * t) * Math.SQRT1_2 - b * Math.SQRT1_2];
          });
          teile.push(stroke(line(...drehen(kurve))));
        }
      }
      return teile;
    };
    return largest(wmin, Math.max(wmin, 17), pen, etikett);
  },
});
