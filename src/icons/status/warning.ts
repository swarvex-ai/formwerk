import { circle, inkBox, line, onCircle, polygon, type Pt } from "../../core/vector";
import { area, defineIcon, detail, type Part } from "../define";
import { inkRadius } from "../shared";

export const warning = defineIcon({
  id: "warning", category: "status",
  title: { de: "Warnung", en: "Warning" },
  description: {
    de: "Warndreieck oder achteckiges Stopschild mit Ausrufezeichen, gefüllt als deutliche Meldung; das eigene, größere Zeichen neben dem allgemeinen `mark`.",
    en: "Warning triangle or octagonal stop sign with an exclamation mark, filled as a loud notice; the dedicated, larger sign beside the general `mark`.",
  },
  params: {
    shape: { type: "choice", options: ["triangle", "octagon"], default: "triangle", label: { de: "Form", en: "Shape" },
      labels: { triangle: { de: "Dreieck", en: "Triangle" }, octagon: { de: "Achteck", en: "Octagon" } },
      describe: { de: "Dreieck wie das Warndreieck an der Straße, Achteck wie ein Stoppschild für unübersehbare Meldungen.", en: "Triangle like the road warning triangle, octagon like a stop sign for impossible-to-miss messages." } },
    size: { type: "number", min: 15, max: 22, step: 0.5, default: 20, label: { de: "Größe", en: "Size" },
      describe: { de: "Breite des Schilds in Rasterpunkten (von 24): 15 klein in Listen, 20 üblich, 22 so groß, wie es passt; bei kräftigem Strich wächst es nicht unter die Größe, in der das Ausrufezeichen noch passt.", en: "Width of the sign in grid units (of 24): 15 small in lists, 20 usual, 22 as wide as fits; with a heavy stroke it stays as large as the exclamation needs." } },
    stem: { type: "number", min: 0.55, max: 1, step: 0.05, default: 0.85, label: { de: "Balken", en: "Stem" },
      describe: { de: "Länge des Ausrufezeichens im Verhältnis zum freien Raum: 0,6 kurz und ruhig, 0,85 üblich, 1 fast bis an den freien Rand.", en: "Length of the exclamation's stem relative to the free room: 0.6 short and calm, 0.85 usual, 1 nearly to the clear edge." } },
    spacing: { type: "number", min: 0.9, max: 1.7, step: 0.1, default: 1.2, label: { de: "Abstand", en: "Spacing" },
      describe: { de: "Luft zwischen Balken und Punkt in Rasterpunkten: 0,9 eng, 1,2 üblich, 1,7 bleibt auch in kleiner Größe deutlich.", en: "Clear space between stem and dot in grid units: 0.9 tight, 1.2 usual, 1.7 stays clear even at small sizes." } },
  },
  presets: {
    caution: { label: { de: "Achtung", en: "Caution" }, values: { shape: "triangle", stem: 0.95 } },
    stop: { label: { de: "Stopp", en: "Stop" }, values: { shape: "octagon" } },
    alert: { label: { de: "Alarm", en: "Alert" }, values: { style: "filled" } },
  },
  build(p, pen) {
    const hw = pen.width / 2, teile: Part[] = [];
    let dotR: number, dotC: Pt, oben: number, stielBis: number;
    if (p.shape === "triangle") {
      // As large as the live area allows with the real reach of the stroke (blunt tip when sharp, as in `mark`),
      // then shrunk to the size parameter — never below the size in which stem and dot still fit with their margins
      const stumpf = pen.corners === "sharp" ? 0.4 : 0;
      const dreieck = (k: number): Pt[] => [...(stumpf ? [[12 - stumpf, 12 - 10 * k], [12 + stumpf, 12 - 10 * k]] as Pt[] : [[12, 12 - 10 * k]] as Pt[]), [12 + 10.5 * k, 12 + 10 * k], [12 - 10.5 * k, 12 + 10 * k]];
      let k = 1;
      for (let s = 0.5, schritt = 0.25; schritt > 0.001; schritt /= 2) {
        const [x0, y0, x1, y1] = inkBox(polygon(...dreieck(s)) as Parameters<typeof inkBox>[0], pen);
        if (x0 >= 1 && y0 >= 1 && x1 <= 23 && y1 <= 23 - (y0 - 1)) { k = s; s += schritt; } else s -= schritt;
      }
      // The mark needs: 5 half-widths (stem cap, side margins, dot), the unit gaps to base and stem, spacing and the
      // height where the slopes leave room beside the stem
      const kMin = Math.min(k, (5 * hw + 1 + p.spacing + (2 * hw + 1) * Math.hypot(1, 20 / 10.5) + 0.35) / 20);
      const roh = dreieck(Math.max(kMin, k * Math.min(1, p.size / 21)));
      const [, y0, , y1] = inkBox(polygon(...roh) as Parameters<typeof inkBox>[0], pen), dy = 12 - (y0 + y1) / 2;
      const ecken = roh.map(([x, y]): Pt => [x, y + dy]);
      teile.push(area(polygon(...ecken)));
      const top = ecken[0][1], basis = ecken[ecken.length - 2][1], links = ecken[ecken.length - 1][0];
      const schraeg = (basis - top) / (12 - links);
      oben = top + (2 * hw + 1) * Math.hypot(1, schraeg);
      dotR = hw;
      dotC = [12, basis - 2 * hw - 1 - dotR];
      stielBis = dotC[1] - dotR - p.spacing - hw;
    } else {
      // Regular octagon with flat top and bottom; the mark stands between the horizontal edges
      const cap = inkRadius(pen, 135);
      const r = Math.min(p.size / 2, 12 - 1.25 - 0.15 - cap);
      teile.push(area(polygon(...Array.from({ length: 8 }, (_, i) => onCircle([12, 12], r, 22.5 + i * 45)))));
      const grenze = r * Math.cos(Math.PI / 8) - hw - 1.15;
      dotR = Math.max(hw, 0.95);
      dotC = [12, 12 + grenze - dotR];
      oben = 12 - grenze + hw;
      stielBis = dotC[1] - dotR - p.spacing - hw;
    }
    const raum = stielBis - oben;
    if (raum > 0.25) teile.push(detail(line([12, Math.max(oben, stielBis - Math.min(raum, Math.max(0.4, raum * p.stem)))], [12, stielBis])));
    teile.push(detail(circle(dotC, dotR), true));
    return teile;
  },
});
