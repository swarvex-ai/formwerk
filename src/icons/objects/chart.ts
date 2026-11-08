import { line, rect } from "../../core/vector";
import { area, defineIcon, stroke, type Part } from "../define";
import { CLEAR, EDGE } from "../shared";

const WECHSEL = [0.55, 1, 0.42, 0.8, 0.62];

export const chart = defineIcon({
  id: "chart", category: "objects",
  title: { de: "Balkendiagramm", en: "Bar chart" },
  description: {
    de: "Ein Balkendiagramm für Statistik, Auswertung und Berichte, steigend, fallend oder im Wechsel, mit oder ohne Achsen.",
    en: "A bar chart for statistics, analytics and reports, rising, falling or alternating, with or without axes.",
  },
  params: {
    bars: { type: "integer", min: 2, max: 5, default: 3, label: { de: "Balken", en: "Bars" },
      describe: { de: "Zahl der Balken: 3 üblich, 5 für eine Zeitreihe; wo Umrisse zu eng würden, werden schmale Balken zu Strichen.", en: "Number of bars: 3 usual, 5 for a time series; where outlines would be too tight, narrow bars become lines." } },
    trend: { type: "choice", options: ["rising", "falling", "wave"], default: "rising", label: { de: "Verlauf", en: "Trend" },
      labels: { rising: { de: "Steigend", en: "Rising" }, falling: { de: "Fallend", en: "Falling" }, wave: { de: "Im Wechsel", en: "Alternating" } },
      describe: { de: "Steigend für Wachstum, fallend für Rückgang, im Wechsel für neutrale Statistik.", en: "Rising for growth, falling for decline, alternating for neutral statistics." } },
    axis: { type: "boolean", default: true, label: { de: "Achsen", en: "Axes" },
      describe: { de: "Eine Achse links und unten wie in einem Diagramm; ohne stehen die Balken frei.", en: "An axis at the left and the bottom like a chart; without, the bars stand free." } },
  },
  presets: {
    statistics: { label: { de: "Statistik", en: "Statistics" }, values: { trend: "rising", axis: true } },
    analytics: { label: { de: "Auswertung", en: "Analytics" }, values: { bars: 4, trend: "wave", axis: false } },
    decline: { label: { de: "Rückgang", en: "Decline" }, values: { trend: "falling" } },
  },
  build(p, pen) {
    const hw = pen.width / 2, links = EDGE + hw, rechts = 24 - EDGE - hw, oben = EDGE + hw, unten = 24 - EDGE - hw;
    const teile: Part[] = [];
    if (p.axis) teile.push(stroke(line([links, oben], [links, unten], [rechts, unten])));
    // Bars between the axis and the right edge, standing clear of the axis
    const x0 = p.axis ? links + pen.width + CLEAR : links, boden = p.axis ? unten - pen.width - CLEAR : unten, hoehe = boden - oben;
    let n = p.bars;
    const luecke = pen.width + CLEAR, breite = (k: number) => (rechts - x0 - (k - 1) * luecke) / k;
    const umriss = breite(n) - pen.width >= 1.2;
    // Too narrow for outlines: one line per bar, and only as many as stand clear of each other
    while (!umriss && n > 2 && (rechts - x0 + pen.width) / n - pen.width < CLEAR) n--;
    const wert = (i: number) => (p.trend === "wave" ? WECHSEL[i] : p.trend === "rising" ? 0.4 + (0.6 * i) / (n - 1) : 1 - (0.6 * i) / (n - 1));
    for (let i = 0; i < n; i++) {
      const h = hoehe * wert(i);
      if (umriss) teile.push(area(rect(x0 + i * (breite(n) + luecke), boden - h, breite(n), h, 1)));
      else {
        const schritt = (rechts - x0 + pen.width) / n, mx = x0 - hw + schritt * (i + 0.5);
        teile.push(stroke(line([mx, boden - hw], [mx, boden - h + hw])));
      }
    }
    return teile;
  },
});
