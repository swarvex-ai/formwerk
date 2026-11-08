// Pixels as numbers: a small RGBA image with integer drawing for pixel art (parts with three-tone shading, ellipses,
// mirroring, the outline around a silhouette) and colour ramps from one colour. Pure TypeScript: no canvas, no DOM, so
// the tests and the build run it in Node and every machine draws the same pixels.

export type RGBA = readonly [number, number, number, number];
export const CLEAR: RGBA = [0, 0, 0, 0];

/** "#rrggbb" to an opaque colour. */
export const hex = (h: string): RGBA => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16), 255];

const klemmen = (x: number) => Math.max(0, Math.min(255, Math.round(x)));
/** Mix two colours, t 0 is a, 1 is b. */
export const mixRGBA = (a: RGBA, b: RGBA, t: number): RGBA => [klemmen(a[0] + (b[0] - a[0]) * t), klemmen(a[1] + (b[1] - a[1]) * t), klemmen(a[2] + (b[2] - a[2]) * t), 255];

/** Four shades of one colour, as pixel artists build them: shadows cooler and darker, highlights warmer and lighter. */
export type Ramp = { deep: RGBA; dark: RGBA; base: RGBA; light: RGBA };
export function ramp(colour: string | RGBA): Ramp {
  const base = typeof colour === "string" ? hex(colour) : colour;
  const kalt: RGBA = [24, 20, 48, 255], warm: RGBA = [255, 246, 214, 255];
  return { deep: mixRGBA(base, kalt, 0.62), dark: mixRGBA(base, kalt, 0.32), base, light: mixRGBA(base, warm, 0.28) };
}

export class Pixels {
  readonly data: Uint8ClampedArray<ArrayBuffer>;
  constructor(readonly w: number, readonly h: number, data?: Uint8ClampedArray<ArrayBuffer>) {
    this.data = data ?? new Uint8ClampedArray(w * h * 4);
  }
  inside(x: number, y: number) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }
  alpha(x: number, y: number) { return this.inside(x, y) ? this.data[(y * this.w + x) * 4 + 3] : 0; }
  get(x: number, y: number): RGBA { const i = (y * this.w + x) * 4; return [this.data[i], this.data[i + 1], this.data[i + 2], this.data[i + 3]]; }
  set(x: number, y: number, c: RGBA) {
    x = Math.round(x); y = Math.round(y);
    if (!this.inside(x, y)) return;
    const i = (y * this.w + x) * 4;
    this.data[i] = c[0]; this.data[i + 1] = c[1]; this.data[i + 2] = c[2]; this.data[i + 3] = c[3];
  }
  /** A filled rectangle (x, y the top-left pixel). */
  rect(x: number, y: number, w: number, h: number, c: RGBA) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c);
  }
  /** A part with three-tone shading: light along the top and left edge, dark along the bottom and right; `round` cuts the corners. */
  part(x: number, y: number, w: number, h: number, r: Ramp, round = false) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      if (round && (i === 0 || i === w - 1) && (j === 0 || j === h - 1) && w > 2 && h > 2) continue;
      const rand = i === w - 1 || j === h - 1, licht = (i === 0 || j === 0) && !rand;
      this.set(x + i, y + j, rand && w > 2 ? r.dark : licht && w > 2 ? r.light : r.base);
    }
  }
  /** A filled ellipse around (cx, cy) with shading: light towards the top left, dark towards the bottom right. */
  ellipse(cx: number, cy: number, rx: number, ry: number, r: Ramp) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
      const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry, d = dx * dx + dy * dy;
      if (d > 1) continue;
      const seite = dx * 0.6 + dy * 0.8;
      this.set(x, y, d > 0.72 && seite > 0.2 ? r.dark : seite < -0.45 && d > 0.25 ? r.light : r.base);
    }
  }
  /** Copies `src` with its top-left at (dx, dy), mirrored left to right if `flip`; transparent pixels stay out. */
  blit(src: Pixels, dx: number, dy: number, flip = false) {
    for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) {
      if (!src.alpha(x, y)) continue;
      this.set(dx + (flip ? src.w - 1 - x : x), dy + y, src.get(x, y));
    }
  }
  /** A copy mirrored left to right. */
  mirrored(): Pixels { const m = new Pixels(this.w, this.h); m.blit(this, 0, 0, true); return m; }
  /**
   * A one-pixel outline around the silhouette, in a deep shade of the darkest colour it touches (selective
   * outlining), so the sprite reads on any background. Chosen by colour, not by side: a mirrored sprite gets the
   * mirrored outline.
   */
  outline() {
    const quelle = new Pixels(this.w, this.h, new Uint8ClampedArray(this.data));
    const hell = (c: RGBA) => c[0] * 299 + c[1] * 587 + c[2] * 114;
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      if (quelle.alpha(x, y)) continue;
      let wahl: RGBA | null = null;
      for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        if (!quelle.alpha(x + dx, y + dy)) continue;
        const c = quelle.get(x + dx, y + dy);
        if (!wahl || hell(c) < hell(wahl) || (hell(c) === hell(wahl) && (c[0] << 16 | c[1] << 8 | c[2]) < (wahl[0] << 16 | wahl[1] << 8 | wahl[2]))) wahl = c;
      }
      if (wahl) this.set(x, y, mixRGBA(wahl, [16, 12, 28, 255], 0.78));
    }
  }
  /** Distinct opaque colours. */
  colours(): number {
    const s = new Set<number>();
    for (let i = 0; i < this.data.length; i += 4) if (this.data[i + 3]) s.add((this.data[i] << 16) | (this.data[i + 1] << 8) | this.data[i + 2]);
    return s.size;
  }
}
