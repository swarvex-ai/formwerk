import { line, polygon, type Pt } from "../../core/vector";
import { area, defineIcon, detail, type Part } from "../define";
import { inkRadius, largest } from "../shared";

// Distance from a point to the segment a–b
const abstand = (q: Pt, a: Pt, b: Pt): number => {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = dx * dx + dy * dy;
  const t = l ? Math.max(0, Math.min(1, ((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / l)) : 0;
  return Math.hypot(q[0] - a[0] - t * dx, q[1] - a[1] - t * dy);
};

export const bread = defineIcon({
  id: "bread", category: "objects",
  title: { de: "Brot", en: "Bread" },
  description: {
    de: "Ein Brotlaib von der Seite mit flachem Boden, gewölbter Kruste und schrägen Einschnitten, für Essen, Bäckerei, Laden und Rezepte; auf Wunsch angeschnitten.",
    en: "A loaf of bread seen from the side with a flat bottom, a domed crust and diagonal score cuts, for food, bakery, shop and recipes; sliced if wanted.",
  },
  params: {
    length: { type: "number", min: 14, max: 21, step: 0.5, default: 19, label: { de: "Länge", en: "Length" },
      describe: { de: "Länge des Laibs in Rasterpunkten (von 24): 14 kompakt, 19 üblich, 21 randnah; bei kräftigem Strich wird er so weit kürzer, wie nötig.", en: "Length of the loaf in grid units (of 24): 14 compact, 19 usual, 21 near the edge; with a bold stroke it shortens as far as needed." } },
    dome: { type: "number", min: 0.3, max: 0.8, step: 0.05, default: 0.55, label: { de: "Wölbung", en: "Dome" },
      describe: { de: "Höhe des Laibs im Verhältnis zur Länge: 0,3 flach wie ein Baguette, 0,55 ein üblicher Laib, 0,8 hoch und rund wie ein Bauernbrot.", en: "Height of the loaf as a share of its length: 0.3 flat like a baguette, 0.55 a usual loaf, 0.8 tall and round like a boule." } },
    cuts: { type: "choice", options: ["0", "2", "3"], default: "3", label: { de: "Einschnitte", en: "Cuts" },
      labels: { "0": { de: "Keine", en: "None" }, "2": { de: "Zwei", en: "Two" }, "3": { de: "Drei", en: "Three" } },
      describe: { de: "Anzahl der schrägen Einschnitte in der Kruste: 0 glatt wie ein Kastenbrot, 2 wie ein Bauernbrot, 3 wie ein Baguette oder Laib.", en: "Number of diagonal score cuts in the crust: 0 smooth like a tin loaf, 2 like a boule, 3 like a baguette or loaf." } },
    slice: { type: "boolean", default: false, label: { de: "Angeschnitten", en: "Sliced" },
      describe: { de: "Das rechte Ende ist gerade abgeschnitten und zeigt eine kurze Schnittfläche: für Aufschnitt und Scheiben.", en: "The right end is cut off flat and shows a short cut face: for sliced bread and slices." } },
  },
  presets: {
    loaf: { label: { de: "Laib", en: "Loaf" }, values: { length: 19, dome: 0.55, cuts: "3" } },
    baguette: { label: { de: "Baguette", en: "Baguette" }, values: { length: 21, dome: 0.3, cuts: "3" } },
    boule: { label: { de: "Bauernbrot", en: "Boule" }, values: { length: 16, dome: 0.8, cuts: "2" } },
    sliced: { label: { de: "Angeschnitten", en: "Sliced" }, values: { slice: true, cuts: "2" } },
  },
  build(p, pen) {
    const w = pen.width, hw = w / 2;
    // Clear space between the crust and the cuts (more than the 0.8 the legibility test asks for), and how far the
    // end of a cut keeps from the outline and the other lines (its cap included)
    const luft = 1, frei = hw + luft + inkRadius(pen);
    // Lean of the cuts: from lower left to upper right, 35° from the ground on a flat loaf (long like a baguette's) to
    // 60° on a tall one; the crust rounder the taller the loaf (a superellipse from boxy 2.8 to round 2.1)
    const neig = ((35 + 50 * (p.dome - 0.3)) * Math.PI) / 180, u: Pt = [Math.cos(neig), -Math.sin(neig)];
    const e = 2 / (2.8 - 1.4 * (p.dome - 0.3));
    // The loaf at length L and height H, or null when a cut or the cut face has no room in it
    const form = (L: number, H: number, n: number): Part[] | null => {
      const b = Math.min(1.5, 0.15 * H), top = H - b;
      // Domed crust (a superellipse) over a flat bottom with rounded ends, the bottom at y = b
      const pts: Pt[] = [];
      const m = 64;
      for (let i = 0; i < m; i++) {
        const t = (i / m) * 2 * Math.PI, c = Math.cos(t), s = Math.sin(t), oben = s < 0;
        const x = (L / 2) * Math.sign(c) * Math.abs(c) ** e;
        const y = oben ? -top * Math.abs(s) ** e : b * Math.abs(s) ** (2 / 8);
        pts.push([x, y]);
      }
      // Sliced: everything right of xs goes, the end runs straight down
      const xs = p.slice ? L / 2 - 0.1 * L : Infinity;
      const umriss: Pt[] = [];
      pts.forEach((a, i) => {
        const z = pts[(i + 1) % m];
        if (a[0] <= xs) umriss.push(a);
        if ((a[0] - xs) * (z[0] - xs) < 0) umriss.push([xs, a[1] + ((xs - a[0]) / (z[0] - a[0])) * (z[1] - a[1])]);
      });
      const segs: [Pt, Pt][] = umriss.map((a, i) => [a, umriss[(i + 1) % umriss.length]]);
      // (The cut face runs alongside the straight end, so its ends measure their room without it)
      const weit = (q: Pt, ende = true) => Math.min(...segs.filter(([a, z]) => ende || a[0] !== xs || z[0] !== xs).map(([a, z]) => abstand(q, a, z)));
      // Top and bottom of the outline at x
      const huelle = (x: number): [number, number] => {
        let lo = Infinity, hi = -Infinity;
        for (const [a, z] of segs) {
          if ((a[0] - x) * (z[0] - x) > 0 || a[0] === z[0]) continue;
          const y = a[1] + ((x - a[0]) / (z[0] - a[0])) * (z[1] - a[1]);
          lo = Math.min(lo, y); hi = Math.max(hi, y);
        }
        return [lo, hi];
      };
      // How far from q along d (up to max) the ink keeps clear of the outline; 0 when q itself is not clear
      const bis = (q: Pt, d: Pt, max: number, ende = true): number => {
        const klar = (k: number) => weit([q[0] + d[0] * k, q[1] + d[1] * k], ende) >= frei;
        if (!klar(0)) return 0;
        if (klar(max)) return max;
        let a = 0, z = max;
        for (let i = 0; i < 12; i++) { const k = (a + z) / 2; if (klar(k)) a = k; else z = k; }
        return a;
      };
      const teile: Part[] = [area(polygon(...umriss))];
      let rechts = L / 2;
      if (p.slice) {
        // The cut face: a line just inside the straight end
        const xf = xs - w - luft, [y0, y1] = huelle(xf), mitte: Pt = [xf, (y0 + y1) / 2];
        const auf = bis(mitte, [0, -1], (y1 - y0) / 2, false), ab = bis(mitte, [0, 1], (y1 - y0) / 2, false);
        if (auf + ab < 1.5) return null;
        teile.push(detail(line([xf, mitte[1] - auf], [xf, mitte[1] + ab])));
        // The cuts keep clear of the face like of the outline
        segs.push([[xf, mitte[1] - auf], [xf, mitte[1] + ab]]);
        rechts = xf;
      }
      if (n) {
        // Spaced by the length, never closer than two strokes and a clear gap across the lean; all at one height,
        // the highest where they fit whole (shorter on a flat loaf)
        const lo = -0.3 * L, hi = p.slice ? rechts - frei - 0.5 : 0.3 * L, voll = Math.min(0.28 * H, 0.15 * L);
        const sp = Math.max(Math.min(0.22 * L, n > 1 ? (hi - lo) / (n - 1) : 0), (w + luft) / -u[1] + 0.1), mitte = (lo + hi) / 2 - 0.02 * L;
        const lagen = Array.from({ length: n }, (_, i) => mitte + (i - (n - 1) / 2) * sp);
        const [y0, y1] = huelle(mitte);
        const laengen = (y: number) => lagen.map((x) => Math.min(bis([x, y], u, voll), bis([x, y], [-u[0], -u[1]], voll)));
        let best = { y: y0, k: -1, l: [] as number[] };
        for (let j = 1; j < 24; j++) {
          const y = y0 + ((y1 - y0) * j) / 24, l = laengen(y), k = Math.min(...l);
          if (k > best.k + 1e-6) best = { y, k, l };
          if (k >= 0.85 * voll) break;
        }
        if (best.k < 1) return null;
        lagen.forEach((x, i) => {
          const h = best.l[i];
          teile.push(detail(line([x - u[0] * h, best.y - u[1] * h], [x + u[0] * h, best.y + u[1] * h])));
        });
      }
      return teile;
    };
    // Taller than the dome asks, then longer (as far as the grid allows), only as far as the cuts and the cut face need
    // room; at the boldest sharp strokes a sliced loaf holds one cut less
    const passt = new Map<number, boolean>(), lang = 21.5 - w;
    const geht = (n: number) => {
      // Whether n cuts fit the longest loaf at all (once per build, not for every step of largest)
      if (!passt.has(n)) passt.set(n, [0.6, 0.75, 0.9].some((k) => !!form(lang, k * lang, n)));
      return passt.get(n)!;
    };
    const laib = (L: number): Part[] => {
      for (let n = Number(p.cuts); n >= 0; n--)
        if (geht(n)) for (let l = L; l <= Math.max(L, lang); l += 0.5)
          for (let H = p.dome * l; H < 0.9 * l; H += 0.5) { const t = form(l, H, n); if (t) return t; }
      return form(L, p.dome * L, 0) ?? [];
    };
    return largest(8, p.length, pen, laib);
  },
});
