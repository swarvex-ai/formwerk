import { onCircle, polygon, type Pt } from "../../core/vector";
import { area, defineIcon, dot, type Part } from "../define";
import { largest, solidTip } from "../shared";

export const star = defineIcon({
  id: "star", category: "status",
  title: { de: "Stern", en: "Star" },
  description: {
    de: "Ein Stern für Favoriten, Bewertungen und Hervorheben, mit 4 bis 7 Zacken, schlank oder rundlich.",
    en: "A star for favourites, ratings and highlights, with 4 to 7 points, slim or plump.",
  },
  params: {
    points: { type: "integer", min: 4, max: 7, default: 5, label: { de: "Zacken", en: "Points" },
      describe: { de: "Zahl der Zacken: 5 der übliche Stern, 4 ein Funkeln, 6 und 7 für Abzeichen.", en: "Number of points: 5 the usual star, 4 a sparkle, 6 and 7 for badges." } },
    inner: { type: "number", min: 0.4, max: 0.65, step: 0.025, default: 0.5, label: { de: "Innenradius", en: "Inner radius" },
      describe: { de: "Radius der Einbuchtungen im Verhältnis zu den Spitzen: 0,4 schlank und spitz, 0,5 üblich, 0,65 rundlich.", en: "Radius of the inner corners relative to the points: 0.4 slim and sharp, 0.5 usual, 0.65 plump." } },
    size: { type: "number", min: 15, max: 23, step: 0.5, default: 21, label: { de: "Größe", en: "Size" },
      describe: { de: "Durchmesser über die Spitzen in Rasterpunkten (von 24): 16 klein, 21 üblich, 23 so groß, wie es passt.", en: "Diameter across the points in grid units (of 24): 16 small, 21 usual, 23 as big as fits." } },
  },
  presets: {
    favourite: { label: { de: "Favorit", en: "Favourite" }, values: { points: 5, inner: 0.5 } },
    rated: { label: { de: "Bewertet", en: "Rated" }, values: { style: "filled" } },
    sparkle: { label: { de: "Funkeln", en: "Sparkle" }, values: { points: 4, inner: 0.4 } },
  },
  build(p, pen) {
    const stern = (d: number): Part[] => {
      const n = p.points, ecken: Pt[] = Array.from({ length: 2 * n }, (_, i) => onCircle([12, 12], i % 2 ? (d / 2) * p.inner : d / 2, (i * 180) / n));
      // The narrow inside of each point is solid near its tip
      const m = 2 * n, teile: Part[] = [area(polygon(...ecken))];
      for (let i = 0; i < m; i += 2) teile.push(dot(solidTip(ecken[(i - 1 + m) % m], ecken[i], ecken[i + 1], pen)));
      return teile;
    };
    return largest(8, p.size, pen, stern);
  },
});
