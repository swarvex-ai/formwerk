import { line, polygon, type Pt } from "../../core/vector";
import { area, defineIcon, detail, type Part } from "../define";
import { CLEAR, largest } from "../shared";

// Radii of the bumps from left to right, as shares of the width before scaling
const BUMPS: Record<number, number[]> = { 2: [0.3, 0.4], 3: [0.22, 0.34, 0.26], 4: [0.17, 0.27, 0.3, 0.2] };

export const cloud = defineIcon({
  id: "cloud", category: "objects",
  title: { de: "Wolke", en: "Cloud" },
  description: {
    de: "Eine Wolke aus runden, sich überlagernden Kuppen mit flachem Boden für Speicher, Wetter und Synchronisation, mit Pfeil nach oben oder unten für Hoch- und Herunterladen.",
    en: "A cloud of overlapping round bumps with a flat bottom for storage, weather and sync, with an arrow up or down for upload and download.",
  },
  params: {
    bumps: { type: "number", min: 2, max: 4, step: 1, default: 3, label: { de: "Kuppen", en: "Bumps" },
      describe: { de: "Anzahl der runden Kuppen oben: 2 schlicht wie ein Speicher-Symbol, 3 üblich, 4 flauschig wie eine Schönwetterwolke.", en: "Number of round bumps on top: 2 plain like a storage symbol, 3 usual, 4 fluffy like a fair-weather cloud." } },
    width: { type: "number", min: 14, max: 22, step: 0.5, default: 20, label: { de: "Breite", en: "Width" },
      describe: { de: "Breite der Wolke in Rasterpunkten (von 24): 15 kompakt, 20 üblich, 22 randnah; sie wird bei kräftigem Strich so weit schmaler, wie nötig.", en: "Width of the cloud in grid units (of 24): 15 compact, 20 usual, 22 near the edge; with a bold stroke it narrows as far as needed." } },
    sign: { type: "choice", options: ["none", "up", "down"], default: "none", label: { de: "Zeichen", en: "Sign" },
      labels: { none: { de: "Ohne", en: "None" }, up: { de: "Hoch", en: "Up" }, down: { de: "Runter", en: "Down" } },
      describe: { de: "Ein kurzer Pfeil in der Wolke: nach oben zum Hochladen, nach unten zum Herunterladen; fehlt der Platz, bleibt er weg.", en: "A short arrow inside the cloud: up for upload, down for download; left out when there is no room." } },
  },
  presets: {
    upload: { label: { de: "Hochladen", en: "Upload" }, values: { sign: "up", bumps: 3, width: 21 } },
    download: { label: { de: "Herunterladen", en: "Download" }, values: { sign: "down", bumps: 3, width: 21 } },
    weather: { label: { de: "Wetter", en: "Weather" }, values: { bumps: 4, width: 20 } },
  },
  build(p, pen) {
    const hw = pen.width / 2, ink = pen.corners === "round" ? hw : hw * Math.SQRT2;
    const wolke = (w: number): Part[] => {
      // Discs sitting on the baseline y = 0 (clipped flat), scaled to the width
      const share = BUMPS[p.bumps] ?? BUMPS[3];
      const xs: number[] = [];
      share.forEach((r, i) => xs.push(i ? xs[i - 1] + (share[i - 1] + r) * 0.55 : r));
      const k = w / (xs[xs.length - 1] + share[share.length - 1]);
      const discs = share.map((r, i) => ({ x: xs[i] * k - w / 2, r: r * k, y: -0.85 * r * k }));
      const big = discs.reduce((a, d) => (d.r > a.r ? d : a));
      const c: Pt = [0, -0.5 * big.r];
      const raw: { pt: Pt; flat: boolean }[] = [];
      const n = 180;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * 2 * Math.PI, u: Pt = [Math.sin(a), -Math.cos(a)];
        let d = 0;
        for (const o of discs) {
          const ox = c[0] - o.x, oy = c[1] - o.y, b = -(ox * u[0] + oy * u[1]), disc = b * b - (ox * ox + oy * oy - o.r * o.r);
          if (disc >= 0) d = Math.max(d, b + Math.sqrt(disc));
        }
        const flat = u[1] > 1e-6 && c[1] + d * u[1] > 0;
        if (flat) d = -c[1] / u[1];
        raw.push({ pt: [c[0] + d * u[0], c[1] + d * u[1]], flat });
      }
      // Of the points on the flat bottom only its two ends stay
      const pts = raw.filter((q, i) => !(q.flat && raw[(i + n - 1) % n].flat && raw[(i + 1) % n].flat)).map((q) => q.pt);
      const teile: Part[] = [area(polygon(...pts))];
      if (p.sign !== "none") {
        const top = (x: number) => Math.min(...discs.filter((o) => Math.abs(x - o.x) < o.r).map((o) => o.y - Math.sqrt(o.r * o.r - (x - o.x) ** 2)));
        const x = big.x, rand = hw + CLEAR + ink, arm = 1.8;
        const unten = -rand, oben = Math.max(...[x - arm - ink, x, x + arm + ink].map(top)) + rand, s = Math.min(7, unten - oben);
        if (s >= 3) {
          const up = p.sign === "up", spitze: Pt = [x, up ? unten - s : unten], schwanz: Pt = [x, up ? unten : unten - s];
          const dir = up ? 1 : -1, ende: Pt = pen.corners === "sharp" ? [x, spitze[1] + dir * hw] : spitze;
          teile.push(detail(line(schwanz, ende)), detail(line([x - arm, spitze[1] + dir * arm], spitze, [x + arm, spitze[1] + dir * arm])));
        }
      }
      return teile;
    };
    return largest(10, p.width, pen, wolke);
  },
});
