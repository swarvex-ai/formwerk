// Icons as numbers: shapes on a 24 × 24 grid (lines, polygons, circles, arcs, rectangles) painted with one stroke
// width, as SVG text and as pixels. The rasteriser follows the rules of SVG (square or round caps, miter joins with
// limit 4 or round joins, even-odd fill, masks for cuts), so the PNG files and the tests see the geometry a browser
// draws from the SVG. Pure TypeScript: no canvas, no DOM, so every machine draws the same pixels.
import { hex, Pixels } from "./pixels";

export const GRID = 24;
const MITER_LIMIT = 4;

export type Pt = readonly [number, number];
export type Shape =
  | { kind: "line"; points: readonly Pt[]; closed: boolean }
  | { kind: "circle"; c: Pt; r: number }
  /** Angles in degrees, clockwise from 12 o'clock; `from` < `to` < `from` + 360. */
  | { kind: "arc"; c: Pt; r: number; from: number; to: number }
  /** Corner radius `r` only with round corners; sharp corners make it 0. */
  | { kind: "rect"; x: number; y: number; w: number; h: number; r: number };
export type Corners = "round" | "sharp";
export type Pen = { width: number; corners: Corners };
/** One painting step. Ink adds colour (with an opacity), erase takes it away again (a cut, a gap, a hole). */
export type Op = { shape: Shape; paint: "stroke" | "fill"; erase?: boolean; opacity?: number; width?: number };

export const line = (...points: Pt[]): Shape => ({ kind: "line", points, closed: false });
export const polygon = (...points: Pt[]): Shape => ({ kind: "line", points, closed: true });
export const circle = (c: Pt, r: number): Shape => ({ kind: "circle", c, r });
export const arc = (c: Pt, r: number, from: number, to: number): Shape => ({ kind: "arc", c, r, from, to });
export const rect = (x: number, y: number, w: number, h: number, r = 0): Shape => ({ kind: "rect", x, y, w, h, r });
/** A shape moved by dx, dy. */
export function translate(s: Shape, dx: number, dy: number): Shape {
  switch (s.kind) {
    case "line": return { ...s, points: s.points.map(([x, y]): Pt => [x + dx, y + dy]) };
    case "rect": return { ...s, x: s.x + dx, y: s.y + dy };
    default: return { ...s, c: [s.c[0] + dx, s.c[1] + dy] };
  }
}
/** The box the ink of a line or polygon covers: [x0, y0, x1, y1], with its caps and joins (miter tips, bevels). */
export function inkBox(s: Shape & { kind: "line" }, pen: Pen): [number, number, number, number] {
  const hw = pen.width / 2, pts = s.points, n = pts.length, ecken: Pt[] = [];
  if (pen.corners === "round") for (const q of pts) ecken.push([q[0] - hw, q[1] - hw], [q[0] + hw, q[1] + hw]);
  else {
    const richtung = (i: number): Pt => { const d = sub(pts[(i + 1) % n], pts[i]), l = len(d); return [d[0] / l, d[1] / l]; };
    const segs = s.closed ? n : n - 1;
    for (let i = 0; i < n; i++) {
      const offen = !s.closed && (i === 0 || i === n - 1);
      if (offen) {
        // Square cap: the corners of the cap
        const d = i === 0 ? richtung(0) : richtung(n - 2), aus = i === 0 ? -1 : 1, q = pts[i];
        for (const quer of [-1, 1]) ecken.push([q[0] + aus * d[0] * hw + quer * -d[1] * hw, q[1] + aus * d[1] * hw + quer * d[0] * hw]);
      } else {
        const j = joinPolygon(pts[i], richtung((i - 1 + segs) % segs), richtung(i % segs), hw);
        if (j) ecken.push(...j);
        const d = richtung(i % segs);
        ecken.push([pts[i][0] - d[1] * hw, pts[i][1] + d[0] * hw], [pts[i][0] + d[1] * hw, pts[i][1] - d[0] * hw]);
      }
    }
  }
  return [Math.min(...ecken.map((q) => q[0])), Math.min(...ecken.map((q) => q[1])), Math.max(...ecken.map((q) => q[0])), Math.max(...ecken.map((q) => q[1]))];
}
/** The point on a circle at an angle (degrees, clockwise from 12 o'clock). */
export const onCircle = (c: Pt, r: number, deg: number): Pt => [c[0] + r * Math.sin((deg * Math.PI) / 180), c[1] - r * Math.cos((deg * Math.PI) / 180)];
/** How far a stroke reaches beyond a corner with this inner angle (degrees): w/2 round, up to the miter tip sharp. */
export function reach(pen: Pen, innerDeg = 90): number {
  const hw = pen.width / 2;
  if (pen.corners === "round") return hw;
  const s = Math.sin((innerDeg * Math.PI) / 360);
  return 1 / s > MITER_LIMIT ? hw : hw / s;
}

// ---- Geometry ----------------------------------------------------------------------------------------------------

type V = [number, number];
const sub = (a: Pt, b: Pt): V => [a[0] - b[0], a[1] - b[1]];
const dot = (a: Pt, b: Pt) => a[0] * b[0] + a[1] * b[1];
const len = (a: Pt) => Math.hypot(a[0], a[1]);

function insidePolygon(p: Pt, pts: readonly Pt[]): boolean {
  let drin = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) drin = !drin;
  }
  return drin;
}

function distSegment(p: Pt, a: Pt, b: Pt): number {
  const ab = sub(b, a), l2 = dot(ab, ab), t = l2 ? Math.max(0, Math.min(1, dot(sub(p, a), ab) / l2)) : 0;
  return len(sub(p, [a[0] + ab[0] * t, a[1] + ab[1] * t]));
}

// In the frame of a segment from a in direction d (unit): along t and across s
function imBand(p: Pt, a: Pt, d: Pt, von: number, bis: number, hw: number): boolean {
  const ap = sub(p, a), t = dot(ap, d), s = ap[0] * -d[1] + ap[1] * d[0];
  return t >= von && t <= bis && Math.abs(s) <= hw;
}

// The outer corner piece of a sharp join at v between directions d1 (in) and d2 (out): miter, or bevel above the limit
function joinPolygon(v: Pt, d1: Pt, d2: Pt, hw: number): Pt[] | null {
  const kreuz = d1[0] * d2[1] - d1[1] * d2[0];
  if (Math.abs(kreuz) < 1e-9 && dot(d1, d2) > 0) return null;
  const seite = kreuz > 0 ? -1 : 1;
  const n1: Pt = [-d1[1] * seite, d1[0] * seite], n2: Pt = [-d2[1] * seite, d2[0] * seite];
  const o1: Pt = [v[0] + n1[0] * hw, v[1] + n1[1] * hw], o2: Pt = [v[0] + n2[0] * hw, v[1] + n2[1] * hw];
  const cosHalb = Math.sqrt(Math.max(0, (1 + dot(d1, d2)) / 2));
  if (cosHalb < 1e-6 || 1 / cosHalb > MITER_LIMIT) return [v, o1, o2];
  const m: Pt = [n1[0] + n2[0], n1[1] + n2[1]], ml = len(m), spitze: Pt = [v[0] + (m[0] / ml) * hw / cosHalb, v[1] + (m[1] / ml) * hw / cosHalb];
  return [v, o1, spitze, o2];
}

function sdRoundBox(p: Pt, c: Pt, bx: number, by: number, r: number): number {
  const qx = Math.abs(p[0] - c[0]) - bx + r, qy = Math.abs(p[1] - c[1]) - by + r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}

const winkel = (c: Pt, p: Pt) => ((Math.atan2(p[0] - c[0], -(p[1] - c[1])) * 180) / Math.PI + 360) % 360;

/** Whether point p (grid units) is painted by the op. */
function covers(op: Op, pen: Pen, p: Pt): boolean {
  const s = op.shape, hw = (op.width ?? pen.width) / 2, rund = pen.corners === "round";
  if (op.paint === "fill") {
    switch (s.kind) {
      case "line": return s.closed && insidePolygon(p, s.points);
      case "circle": return len(sub(p, s.c)) <= s.r;
      case "rect": return sdRoundBox(p, [s.x + s.w / 2, s.y + s.h / 2], s.w / 2, s.h / 2, rund ? Math.min(s.r, s.w / 2, s.h / 2) : 0) <= 0;
      case "arc": return false;
    }
  }
  switch (s.kind) {
    case "circle": return Math.abs(len(sub(p, s.c)) - s.r) <= hw;
    case "rect": {
      const c: Pt = [s.x + s.w / 2, s.y + s.h / 2], r = rund ? Math.min(s.r, s.w / 2, s.h / 2) : 0;
      const aussen = sdRoundBox(p, c, s.w / 2 + hw, s.h / 2 + hw, r > 0 ? r + hw : rund ? hw : 0) <= 0;
      if (!aussen) return false;
      const ix = s.w / 2 - hw, iy = s.h / 2 - hw;
      return !(ix > 0 && iy > 0 && sdRoundBox(p, c, ix, iy, Math.max(r - hw, 0)) < 0);
    }
    case "arc": {
      const a = winkel(s.c, p), rel = (a - s.from + 720) % 360;
      if (rel <= s.to - s.from && Math.abs(len(sub(p, s.c)) - s.r) <= hw) return true;
      const ende = (deg: number, aus: number): boolean => {
        const e = onCircle(s.c, s.r, deg);
        if (rund) return len(sub(p, e)) <= hw;
        const r = (deg * Math.PI) / 180, d: Pt = [Math.cos(r) * aus, Math.sin(r) * aus];
        return imBand(p, e, d, 0, hw, hw);
      };
      return ende(s.from, -1) || ende(s.to, 1);
    }
    case "line": {
      const pts = s.points, n = pts.length, segs = s.closed ? n : n - 1;
      if (rund) {
        for (let i = 0; i < segs; i++) if (distSegment(p, pts[i], pts[(i + 1) % n]) <= hw) return true;
        return false;
      }
      const richtung = (i: number): Pt => { const d = sub(pts[(i + 1) % n], pts[i]), l = len(d); return l < 1e-9 ? [0, 0] : [d[0] / l, d[1] / l]; };
      for (let i = 0; i < segs; i++) {
        const a = pts[i], b = pts[(i + 1) % n], d = richtung(i), l = len(sub(b, a));
        if (l < 1e-9) continue;
        const vorn = !s.closed && i === 0 ? hw : 0, hinten = !s.closed && i === segs - 1 ? hw : 0;
        if (imBand(p, a, d, -vorn, l + hinten, hw)) return true;
      }
      for (let i = s.closed ? 0 : 1; i < (s.closed ? n : n - 1); i++) {
        const d1 = richtung((i - 1 + segs) % segs), d2 = richtung(i);
        if (!len(d1) || !len(d2)) continue;
        const j = joinPolygon(pts[i], d1, d2, hw);
        if (j && insidePolygon(p, j)) return true;
      }
      return false;
    }
  }
}

function bounds(op: Op, pen: Pen): [number, number, number, number] {
  const s = op.shape, rand = op.paint === "stroke" ? (op.width ?? pen.width) * MITER_LIMIT / 2 + 0.5 : 0.5;
  let x0: number, y0: number, x1: number, y1: number;
  if (s.kind === "line") {
    x0 = Math.min(...s.points.map((q) => q[0])); x1 = Math.max(...s.points.map((q) => q[0]));
    y0 = Math.min(...s.points.map((q) => q[1])); y1 = Math.max(...s.points.map((q) => q[1]));
  } else if (s.kind === "rect") { x0 = s.x; y0 = s.y; x1 = s.x + s.w; y1 = s.y + s.h; }
  else { x0 = s.c[0] - s.r; x1 = s.c[0] + s.r; y0 = s.c[1] - s.r; y1 = s.c[1] + s.r; }
  return [x0 - rand, y0 - rand, x1 + rand, y1 + rand];
}

// ---- Pixels ------------------------------------------------------------------------------------------------------

/**
 * The icon as pixels: `size` × `size`, in one colour with coverage as alpha (`sub` × `sub` samples per pixel). Ops
 * paint in order: ink with its opacity over what is there, erase back to nothing.
 */
export function rasterize(ops: readonly Op[], pen: Pen, size: number, colour = "#000000", sub = 4): Pixels {
  const out = new Pixels(size, size), [r, g, b] = hex(colour), k = GRID / size, SUB = sub;
  const kasten = ops.map((o) => bounds(o, pen)), a = new Float32Array(SUB * SUB);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    a.fill(0);
    const px0 = x * k, py0 = y * k, px1 = px0 + k, py1 = py0 + k;
    let beruehrt = false;
    ops.forEach((op, i) => {
      const [bx0, by0, bx1, by1] = kasten[i];
      if (bx1 < px0 || bx0 > px1 || by1 < py0 || by0 > py1) return;
      beruehrt = true;
      for (let j = 0; j < SUB; j++) for (let m = 0; m < SUB; m++) {
        const p: Pt = [px0 + ((m + 0.5) / SUB) * k, py0 + ((j + 0.5) / SUB) * k], n = j * SUB + m;
        if (!covers(op, pen, p)) continue;
        if (op.erase) a[n] = 0;
        else { const o = op.opacity ?? 1; a[n] = a[n] + o * (1 - a[n]); }
      }
    });
    if (!beruehrt) continue;
    let summe = 0;
    for (const v of a) summe += v;
    const alpha = Math.round((summe / a.length) * 255);
    if (alpha) out.set(x, y, [r, g, b, alpha]);
  }
  return out;
}

// ---- SVG ---------------------------------------------------------------------------------------------------------

const zahl = (x: number) => String(Math.round(x * 1000) / 1000);
const punkte = (pts: readonly Pt[]) => pts.map((q) => `${zahl(q[0])},${zahl(q[1])}`).join(" ");

function element(s: Shape, pen: Pen, attrs: string): string {
  switch (s.kind) {
    case "line":
      if (!s.closed && s.points.length === 2) { const [a, b] = s.points; return `<line x1="${zahl(a[0])}" y1="${zahl(a[1])}" x2="${zahl(b[0])}" y2="${zahl(b[1])}"${attrs}/>`; }
      return `<${s.closed ? "polygon" : "polyline"} points="${punkte(s.points)}"${attrs}/>`;
    case "circle": return `<circle cx="${zahl(s.c[0])}" cy="${zahl(s.c[1])}" r="${zahl(s.r)}"${attrs}/>`;
    case "rect": {
      const r = pen.corners === "round" ? Math.min(s.r, s.w / 2, s.h / 2) : 0;
      return `<rect x="${zahl(s.x)}" y="${zahl(s.y)}" width="${zahl(s.w)}" height="${zahl(s.h)}"${r > 0 ? ` rx="${zahl(r)}"` : ""}${attrs}/>`;
    }
    case "arc": {
      const a = onCircle(s.c, s.r, s.from), b = onCircle(s.c, s.r, s.to);
      return `<path d="M${zahl(a[0])} ${zahl(a[1])}A${zahl(s.r)} ${zahl(s.r)} 0 ${s.to - s.from > 180 ? 1 : 0} 1 ${zahl(b[0])} ${zahl(b[1])}"${attrs}/>`;
    }
  }
}

function farbe(op: Op, pen: Pen, imMaske: boolean): string {
  const breite = op.width !== undefined && op.width !== pen.width ? ` stroke-width="${zahl(op.width)}"` : "";
  const deckung = op.opacity !== undefined && op.opacity < 1 ? zahl(op.opacity) : "";
  if (imMaske) return op.paint === "fill" ? ` fill="#000" stroke="none"` : ` fill="none" stroke="#000" stroke-width="${zahl(op.width ?? pen.width)}"`;
  if (op.paint === "fill") return ` fill="currentColor" stroke="none"${deckung ? ` fill-opacity="${deckung}"` : ""}`;
  return `${breite}${deckung ? ` stroke-opacity="${deckung}"` : ""}`;
}

/**
 * The icon as SVG text: viewBox 0 0 24 24, every colour `currentColor` (the icon takes the colour of the text around
 * it), the pen as attributes of the root. Cuts become masks; their ids start with `id`, so icons with different
 * drawings can sit inline on one page.
 */
export function toSvg(ops: readonly Op[], pen: Pen, id: string, size = GRID): string {
  const rund = pen.corners === "round", masken: string[] = [];
  let inhalt: string[] = [];
  for (let i = 0; i < ops.length;) {
    if (!ops[i].erase) { inhalt.push(element(ops[i].shape, pen, farbe(ops[i], pen, false))); i++; continue; }
    const schnitt: string[] = [];
    while (i < ops.length && ops[i].erase) { schnitt.push(element(ops[i].shape, pen, farbe(ops[i], pen, true))); i++; }
    const name = `${id}-m${masken.length}`;
    masken.push(`<mask id="${name}" maskUnits="userSpaceOnUse" x="0" y="0" width="${GRID}" height="${GRID}"><rect width="${GRID}" height="${GRID}" fill="#fff" stroke="none"/>${schnitt.join("")}</mask>`);
    inhalt = [`<g mask="url(#${name})">${inhalt.join("")}</g>`];
  }
  const kopf = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${GRID} ${GRID}" fill="none" stroke="currentColor" stroke-width="${zahl(pen.width)}" stroke-linecap="${rund ? "round" : "square"}" stroke-linejoin="${rund ? "round" : "miter"}" stroke-miterlimit="${MITER_LIMIT}" fill-rule="evenodd">`;
  return `${kopf}${masken.length ? `<defs>${masken.join("")}</defs>` : ""}${inhalt.join("")}</svg>`;
}

// ---- Checks ------------------------------------------------------------------------------------------------------

/** Ink of an image as a mask: alpha at least half. */
const maske = (p: Pixels) => { const m = new Uint8Array(p.w * p.h); for (let i = 0; i < m.length; i++) m[i] = p.data[i * 4 + 3] >= 128 ? 1 : 0; return m; };

/**
 * The shape of a mask as a reader sees it: how many separate parts of ink (8-connected) and how many enclosed holes
 * (4-connected background that does not reach the border).
 */
export function topology(p: Pixels | { w: number; h: number; mask: Uint8Array }): { parts: number; holes: number } {
  const w = p.w, h = p.h, m = "mask" in p ? p.mask : maske(p), gesehen = new Uint8Array(w * h);
  const fuellen = (sx: number, sy: number, wert: number, acht: boolean): boolean => {
    const stapel = [sy * w + sx];
    gesehen[sy * w + sx] = 1;
    let rand = false;
    while (stapel.length) {
      const i = stapel.pop()!, x = i % w, y = (i - x) / w;
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) rand = true;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if ((!dx && !dy) || (!acht && dx && dy)) continue;
        const nx = x + dx, ny = y + dy, j = ny * w + nx;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h || gesehen[j] || m[j] !== wert) continue;
        gesehen[j] = 1;
        stapel.push(j);
      }
    }
    return rand;
  };
  let parts = 0, holes = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (gesehen[y * w + x]) continue;
    if (m[y * w + x]) { fuellen(x, y, 1, true); parts++; }
    else if (!fuellen(x, y, 0, false)) holes++;
  }
  return { parts, holes };
}

// Grows (or with `ink` 0 shrinks) the ink of a mask by a disk of radius r pixels
function morph(m: Uint8Array, w: number, h: number, r: number, ink: 0 | 1): Uint8Array {
  const out = new Uint8Array(m.length), scheibe: [number, number][] = [];
  for (let dy = -Math.floor(r); dy <= r; dy++) for (let dx = -Math.floor(r); dx <= r; dx++) if (dx * dx + dy * dy <= r * r) scheibe.push([dx, dy]);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let treffer = false;
    for (const [dx, dy] of scheibe) {
      const nx = x + dx, ny = y + dy, v = nx < 0 || ny < 0 || nx >= w || ny >= h ? 0 : m[ny * w + nx];
      if (v === ink) { treffer = true; break; }
    }
    out[y * w + x] = treffer ? ink : 1 - ink;
  }
  return out;
}

/** Grid units a gap or a stroke needs at least, so it shows as a whole pixel at 24 px. */
export const MIN_FEATURE = 0.8;

/**
 * Whether an icon reads at its design size (24 px, one pixel per grid unit), measured at 8 pixels per unit: closing
 * every gap narrower than MIN_FEATURE must not merge parts or close holes, and thinning every stroke by that much
 * must not remove or split a part. Null when it reads, else what fails.
 */
export function legibility(ops: readonly Op[], pen: Pen): string | null {
  const s = GRID * 8, p = rasterize(ops, pen, s, "#000000", 1), m = maske(p), r = (MIN_FEATURE / 2) * 8;
  const vorher = topology({ w: s, h: s, mask: m }), zu = topology({ w: s, h: s, mask: morph(m, s, s, r, 1) });
  if (zu.parts !== vorher.parts || zu.holes !== vorher.holes)
    return `a gap narrower than ${MIN_FEATURE} grid units closes at 24 px (${vorher.parts} parts and ${vorher.holes} holes become ${zu.parts} and ${zu.holes})`;
  const duenn = topology({ w: s, h: s, mask: morph(m, s, s, r, 0) });
  if (duenn.parts !== vorher.parts) return `ink thinner than ${MIN_FEATURE} grid units vanishes or breaks at 24 px (${vorher.parts} parts become ${duenn.parts})`;
  return null;
}
