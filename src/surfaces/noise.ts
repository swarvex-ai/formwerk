// Building blocks for surfaces in TSL that tile: gradient noise, fractal noise and Voronoi cells whose lattice wraps
// after a whole number of cells, so a texture repeats without a seam. Randomness comes from MaterialX's cell hash
// (integer bit mixing): the same on every GPU and in WebGL and WebGPU. Noise and Voronoi are real shader functions
// (with period, seed and jitter as arguments): a surface calls them dozens of times, and inlined they made shaders of
// hundreds of kilobytes.
import type { Node } from "three/webgpu";
import { cos, dot, float, floor, Fn, fract, If, min, mix, mx_cell_noise_float, normalize, PI2, sin, sqrt, vec2, vec3 } from "three/tsl";

export type F = Node<"float">;
export type V2 = Node<"vec2">;
export type V3 = Node<"vec3">;
/** Cells across the tile in x and y; a function tiles when its lattice wraps after these many cells. */
export type Period = readonly [number, number];

/** Lattice cell `c` wrapped into [0, period): robust against inexact division on GPUs. */
export const wrap = (c: V2, period: V2): V2 => c.sub(period.mul(floor(c.add(0.5).div(period))));

/** A whole number `x` wrapped into [0, n): the same in WebGL and WebGPU, also below zero. */
export const wrap1 = (x: F, n: number): F => x.sub(float(n).mul(floor(x.add(0.5).div(n))));

/** A random number in [0, 1) for an integer cell and a seed (exact, integer hash). */
export const cell = (c: V2, seed: number | F): F => mx_cell_noise_float(vec3(c.add(0.5), (typeof seed === "number" ? float(seed) : seed).add(0.5)));

const noiseFn = Fn(([p, period, seed]: [V2, V2, F]) => {
  const i = floor(p).toVar(), f = fract(p).toVar();
  const g = (ox: number, oy: number) => {
    const a = cell(wrap(i.add(vec2(ox, oy)), period), seed).mul(PI2);
    return dot(vec2(cos(a), sin(a)), f.sub(vec2(ox, oy)));
  };
  const u = f.mul(f).mul(f).mul(f.mul(f.mul(6).sub(15)).add(10)).toVar();
  return mix(mix(g(0, 0), g(1, 0), u.x), mix(g(0, 1), g(1, 1), u.x), u.y).mul(1.4);
}, { p: "vec2", period: "vec2", seed: "float", return: "float" });

/** Gradient noise in about [−1, 1] at `p` in lattice cells (not tile units), tiling after `period` cells. */
export const noise = (p: V2, period: Period, seed: number): F => noiseFn(p, vec2(period[0], period[1]), float(seed)) as F;

/** How many octaves fit from `period` cells up to two pixels per cell at `resolution`: more detail at higher sizes. */
export const octavesFor = (resolution: number, period: number, most = 10) =>
  Math.max(1, Math.min(most, Math.floor(Math.log2(resolution / (2 * period))) + 1));

/**
 * Fractal noise in about [−1, 1] at `t`, the position on the tile (0 to 1): octaves of `noise` from `period` cells
 * across the tile upward, each twice as fine and `gain` as strong. `resolution` sets how many octaves (a 4096 texture
 * gets finer detail than a 512 one). Stretch it with an unequal period ([3, 40]: long streaks along x).
 */
export const fbm = (t: V2, period: Period, resolution: number, gain: number, seed: number, most = 10): F => Fn(() => {
  const q = vec2(t).toVar();
  const n = octavesFor(resolution, Math.max(period[0], period[1]), most);
  let sum: F = float(0), amp = 1, norm = 0;
  for (let o = 0; o < n; o++) {
    const k = 2 ** o;
    sum = sum.add(noise(q.mul(vec2(period[0] * k, period[1] * k)), [period[0] * k, period[1] * k], seed * 31 + o).mul(amp));
    norm += amp; amp *= gain;
  }
  return sum.div(norm);
})() as F;

const voronoiFn = Fn(([p, period, jitter, seed]: [V2, F, F, F]) => {
  const n = floor(p).toVar(), f = fract(p).toVar(), P = vec2(period, period).toVar();
  const punkt = (b: V2) => {
    const c = wrap(n.add(b), P);
    return b.add(vec2(cell(c, seed), cell(c, seed.add(1))).mul(jitter).add(jitter.mul(-0.5).add(0.5))).sub(f);
  };
  const md = float(8).toVar(), mr = vec2(0, 0).toVar(), mb = vec2(0, 0).toVar();
  for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
    const b = vec2(i, j), r = punkt(b).toVar(), d = dot(r, r).toVar();
    If(d.lessThan(md), () => { md.assign(d); mr.assign(r); mb.assign(b); });
  }
  const rand = cell(wrap(n.add(mb), P), seed.add(2)).toVar();
  const edge = float(8).toVar();
  for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) {
    const r = punkt(mb.add(vec2(i, j))).toVar(), dr = r.sub(mr).toVar();
    If(dot(dr, dr).greaterThan(1e-6), () => { edge.assign(min(edge, dot(mr.add(r).mul(0.5), normalize(dr)))); });
  }
  return vec3(edge, rand, sqrt(md));
}, { p: "vec2", period: "float", jitter: "float", seed: "float", return: "vec3" });

/**
 * Voronoi cells tiling after `period` cells: x the distance to the border of the cell (Quilez: exact, so joints keep
 * their width at every angle), y a random number of the cell (its colour, height), z the distance to its centre.
 * `jitter` 0 is a grid, 1 fully irregular.
 */
export const voronoi = (p: V2, period: number, jitter: number, seed: number): V3 =>
  voronoiFn(p, float(period), float(jitter), float(seed)) as V3;

/** Smooth step from 0 at `a` to 1 at `b` for any order of a and b. */
export const ramp = (x: F, a: number | F, b: number | F): F => {
  const lo = typeof a === "number" ? float(a) : a, hi = typeof b === "number" ? float(b) : b;
  const t = x.sub(lo).div(hi.sub(lo)).clamp(0, 1);
  return t.mul(t).mul(float(3).sub(t.mul(2)));
};
