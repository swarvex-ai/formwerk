import { onCircle, polygon, circle, type Pt } from "../../core/vector";
import { area, defineIcon, hole, type Part } from "../define";
import { CLEAR, largest } from "../shared";

export const pin = defineIcon({
  id: "pin", category: "objects",
  title: { de: "Markierung", en: "Map pin" },
  description: {
    de: "Eine Kartenmarkierung: ein Tropfen mit runder Öffnung im Kopf, der nach unten auf einen Ort zeigt, für Standort, Karte und Adresse.",
    en: "A map marker: a teardrop with a round opening in its head pointing down at a place, for location, map and address.",
  },
  params: {
    head: { type: "number", min: 6.5, max: 8, step: 0.25, default: 7, label: { de: "Kopf", en: "Head" },
      describe: { de: "Radius des runden Kopfes in Rasterpunkten (von 24): 6,5 klein, 7 üblich, 8 groß und rund.", en: "Radius of the round head in grid units (of 24): 6.5 small, 7 usual, 8 big and round." } },
    tip: { type: "number", min: 2, max: 9, step: 0.5, default: 6, label: { de: "Spitze", en: "Tip" },
      describe: { de: "Länge der Spitze unter dem Kopf: 2 stumpf wie ein Tropfen, 6 üblich, 9 lang und schlank; bei kräftigem Strich wird sie so weit kürzer, wie nötig.", en: "Length of the point below the head: 2 blunt like a drop, 6 usual, 9 long and slim; with a bold stroke it shortens as far as needed." } },
    hole: { type: "choice", options: ["dot", "ring", "none"], default: "dot", label: { de: "Öffnung", en: "Hole" },
      labels: { dot: { de: "Punkt", en: "Dot" }, ring: { de: "Ring", en: "Ring" }, none: { de: "Ohne", en: "None" } },
      describe: { de: "Die Öffnung im Kopf: ein kleiner Punkt für einen Ort, ein weiter Ring für eine schlanke Markierung, oder keine für eine volle Fläche.", en: "The opening in the head: a small dot for a place, a wide ring for a slim marker, or none for a solid area." } },
  },
  presets: {
    place: { label: { de: "Ort", en: "Place" }, values: { hole: "dot", head: 7, tip: 6 } },
    marker: { label: { de: "Schlanke Markierung", en: "Slim marker" }, values: { hole: "ring", head: 6.5, tip: 8 } },
    solid: { label: { de: "Voll", en: "Solid" }, values: { hole: "none", style: "filled" } },
  },
  build(p, pen) {
    const tropfen = (tip: number): Part[] => {
      // The head circle at the origin, the point straight below it; the sides are tangents from the point
      const r = p.head, d = r + tip, beta = (Math.acos(r / d) * 180) / Math.PI, n = 36, pts: Pt[] = [[0, d]];
      for (let i = 0; i <= n; i++) pts.push(onCircle([0, 0], r, 180 - beta - ((360 - 2 * beta) * i) / n));
      const teile: Part[] = [area(polygon(...pts))];
      if (p.hole === "dot") teile.push(hole(circle([0, 0], 2.5)));
      if (p.hole === "ring") teile.push(hole(circle([0, 0], Math.max(2.5, r - pen.width - CLEAR - 0.25))));
      return teile;
    };
    return largest(1, p.tip, pen, tropfen);
  },
});
