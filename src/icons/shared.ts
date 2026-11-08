// Building blocks several icons share: an optional frame (circle or rounded square) around a symbol, how far a stroke
// reaches beyond its points, and centring a drawing on the grid by its ink. Icons only; the contract stays in define.ts.
import { circle, GRID, inkBox, onCircle, polygon, reach, rect, translate, type Pen, type Pt, type Shape } from "../core/vector";
import { area, detail, stroke, type Part } from "./define";

/** The ink keeps this far from the edge of the 24 grid (the outermost pixel stays empty). */
export const EDGE = 1.25;
/** Clear space between two strokes that should read apart (more than the 0.8 the legibility test asks for). */
export const CLEAR = 1.25;

export const FRAME = {
  type: "choice", options: ["none", "circle", "square"], default: "circle", label: { de: "Rahmen", en: "Frame" },
  labels: { none: { de: "Ohne", en: "None" }, circle: { de: "Kreis", en: "Circle" }, square: { de: "Quadrat", en: "Square" } },
  describe: {
    de: "Ohne Rahmen für Werkzeugleisten, im Kreis oder Quadrat als eigene Schaltfläche; gefüllt wird der Rahmen zur Fläche, aus der das Zeichen ausgespart ist.",
    en: "No frame for toolbars, a circle or square as a button of its own; filled, the frame becomes an area the sign is cut out of.",
  },
} as const;
export const FRAME_SIZE = {
  type: "number", min: 14, max: 21.5, step: 0.5, default: 20, label: { de: "Rahmengröße", en: "Frame size" },
  describe: {
    de: "Außenmaß von Kreis oder Quadrat in Rasterpunkten (von 24): 20 üblich, 16 wie ein kleiner Knopf; ohne Rahmen ohne Wirkung.",
    en: "Outer size of the circle or square in grid units (of 24): 20 usual, 16 like a small button; no effect without a frame.",
  },
} as const;

export type Frame = { parts: Part[]; kind: "none" | "circle" | "square"; room: number; scale: number; mark(s: Shape, fill?: boolean): Part };
/** The frame and the room inside it: `room` is the radius (circle) or half side (square, none) the symbol's ink may
 *  fill, `scale` how much smaller a symbol is drawn inside it than free (so its size parameter still counts). Inside a
 *  frame the symbol is a detail (cut out of a filled frame), without one a stroke or an area. */
export function framed(kind: "none" | "circle" | "square", pen: Pen, size = 20): Frame {
  const hw = pen.width / 2;
  const frei = GRID / 2 - EDGE;
  if (kind === "none") return { parts: [], kind, room: frei, scale: 1, mark: (s, fill) => (fill ? area(s) : stroke(s)) };
  const r = Math.min(size, GRID - 2 * EDGE) / 2 - hw, room = r - hw - CLEAR;
  const form = kind === "circle" ? circle([12, 12], r) : rect(12 - r, 12 - r, 2 * r, 2 * r, Math.min(4, r * 0.35));
  return { parts: [area(form)], kind, room, scale: Math.max(0.1, room / frei), mark: (s, fill = false) => detail(s, fill) };
}

/** How far the ink of a stroke reaches beyond its points: half the width with round corners, the corner of a square
 *  cap (or a miter tip at `sharpest` degrees) with sharp ones. */
export function inkRadius(pen: Pen, sharpest = 90): number {
  const hw = pen.width / 2;
  return pen.corners === "round" ? hw : Math.max(hw * Math.SQRT2, reach(pen, sharpest));
}

/** The scale for points around the centre: the frame's scale, or smaller where their ink would not fit its room. */
export function fit(points: readonly Pt[], ink: number, f: Frame): number {
  const weit = Math.max(...points.map(([x, y]) => (f.kind === "circle" ? Math.hypot(x, y) : Math.max(Math.abs(x), Math.abs(y)))));
  return weit > 0 ? Math.min(f.scale, Math.max(0.1, (f.room - ink) / weit)) : f.scale;
}

/** The box the ink of a shape covers: [x0, y0, x1, y1]. */
export function shapeBox(s: Shape, pen: Pen): [number, number, number, number] {
  const hw = pen.width / 2;
  switch (s.kind) {
    case "line": return inkBox(s, pen);
    case "circle": return [s.c[0] - s.r - hw, s.c[1] - s.r - hw, s.c[0] + s.r + hw, s.c[1] + s.r + hw];
    case "rect": {
      // Sharp corners reach out to the corner of the stroke, round ones not further than the sides
      return [s.x - hw, s.y - hw, s.x + s.w + hw, s.y + s.h + hw];
    }
    case "arc": {
      const n = 24, pts = Array.from({ length: n + 1 }, (_, i) => onCircle(s.c, s.r, s.from + ((s.to - s.from) * i) / n));
      const e = inkRadius(pen);
      return [Math.min(...pts.map((q) => q[0])) - e, Math.min(...pts.map((q) => q[1])) - e, Math.max(...pts.map((q) => q[0])) + e, Math.max(...pts.map((q) => q[1])) + e];
    }
  }
}

/** The ink box of several parts (gaps and holes left out: they only take ink away). */
export function partsBox(parts: readonly Part[], pen: Pen): [number, number, number, number] {
  const b = parts.filter((t) => t.role !== "gap" && t.role !== "hole").map((t) => shapeBox(t.shape, pen));
  return [Math.min(...b.map((q) => q[0])), Math.min(...b.map((q) => q[1])), Math.max(...b.map((q) => q[2])), Math.max(...b.map((q) => q[3]))];
}

/** Moves the parts so their ink sits in the middle of the grid. */
export function centre(parts: readonly Part[], pen: Pen): Part[] {
  const [x0, y0, x1, y1] = partsBox(parts, pen), dx = 12 - (x0 + x1) / 2, dy = 12 - (y0 + y1) / 2;
  return parts.map((t) => ({ ...t, shape: translate(t.shape, dx, dy) }));
}

/** Does the ink of these parts fit inside the live area of the grid? */
export function fits(parts: readonly Part[], pen: Pen): boolean {
  const [x0, y0, x1, y1] = partsBox(parts, pen);
  return x1 - x0 <= GRID - 2 * EDGE && y1 - y0 <= GRID - 2 * EDGE;
}

/** The largest value in [lo, hi] for which `build` still fits the grid (binary search), and its parts, centred. */
export function largest(lo: number, hi: number, pen: Pen, build: (v: number) => Part[]): Part[] {
  if (fits(build(hi), pen)) return centre(build(hi), pen);
  let a = lo, b = hi;
  for (let i = 0; i < 20; i++) { const m = (a + b) / 2; if (fits(build(m), pen)) a = m; else b = m; }
  return centre(build(a), pen);
}

/** Points of a shape turned by `deg` (clockwise) around a centre. */
export function turn(points: readonly Pt[], deg: number, c: Pt = [12, 12]): Pt[] {
  const a = (deg * Math.PI) / 180, cos = Math.cos(a), sin = Math.sin(a);
  return points.map(([x, y]): Pt => [c[0] + (x - c[0]) * cos - (y - c[1]) * sin, c[1] + (x - c[0]) * sin + (y - c[1]) * cos]);
}

/** A filled corner for the sharp point v between a and b: the narrow inside of a point (a star's tip) would show as a
 *  sliver of paper that breaks up at 24 px, so it is solid up to where the inside has room. */
export function solidTip(a: Pt, v: Pt, b: Pt, pen: Pen): Shape {
  const ax = a[0] - v[0], ay = a[1] - v[1], bx = b[0] - v[0], by = b[1] - v[1], la = Math.hypot(ax, ay), lb = Math.hypot(bx, by);
  const winkel = Math.acos(Math.max(-1, Math.min(1, (ax * bx + ay * by) / (la * lb))));
  const d = Math.min(0.6 * Math.min(la, lb), (pen.width * 1.15 + CLEAR) / (2 * Math.sin(winkel / 2)));
  return polygon(v, [v[0] + (ax / la) * d, v[1] + (ay / la) * d], [v[0] + (bx / lb) * d, v[1] + (by / lb) * d]);
}
