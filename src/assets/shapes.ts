// Shapes for realistic assets (style guide: real parts, bevels, enough segments): grids with sharp edges between
// faces, staves of a barrel or a tub, boxes with rounded edges, turned profiles and boards cut to a circle. Every
// geometry has position, normal and uv, so Parts can merge it with the primitives.
import { BufferGeometry, ExtrudeGeometry, Float32BufferAttribute, LatheGeometry, Shape, Vector2, Vector3 } from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

/**
 * A grid of nu × nv quads from f(u, v), u and v from 0 to 1, with smooth normals inside the grid. `outward` says which
 * side is the front: the grid is turned so its normals point that way (checked at the centre).
 */
export function grid(nu: number, nv: number, f: (u: number, v: number) => Vector3, outward: (p: Vector3) => Vector3): BufferGeometry {
  const pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) {
    const p = f(i / nu, j / nv);
    pos.push(p.x, p.y, p.z);
    uv.push(i / nu, j / nv);
  }
  const k = (i: number, j: number) => j * (nu + 1) + i;
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) idx.push(k(i, j), k(i + 1, j), k(i + 1, j + 1), k(i, j), k(i + 1, j + 1), k(i, j + 1));
  // Orientation from the centre: the cross product of the partial derivatives against the wanted side
  const m = f(0.5, 0.5), du = f(0.51, 0.5).sub(f(0.49, 0.5)), dv = f(0.5, 0.51).sub(f(0.5, 0.49));
  if (new Vector3().crossVectors(du, dv).dot(outward(m)) < 0) for (let t = 0; t < idx.length; t += 3) [idx[t + 1], idx[t + 2]] = [idx[t + 2], idx[t + 1]];
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/**
 * One stave of a barrel or tub: a curved board between the angles a0 and a1 (radians around y, 0 = +x), standing on
 * y = 0 with height h; `radius(y)` is its outer radius, `thickness` goes inwards. Sharp edges between its six faces.
 */
export function stave(radius: (y: number) => number, h: number, a0: number, a1: number, thickness: number, segY = 12, segA = 3): BufferGeometry {
  const at = (r: number, a: number, y: number) => new Vector3(r * Math.cos(a), y, r * Math.sin(a));
  const ang = (u: number) => a0 + (a1 - a0) * u;
  const raus = (p: Vector3) => new Vector3(p.x, 0, p.z).normalize();
  const teile = [
    grid(segA, segY, (u, v) => at(radius(v * h), ang(u), v * h), raus),
    grid(segA, segY, (u, v) => at(radius(v * h) - thickness, ang(u), v * h), (p) => raus(p).negate()),
    // Seiten: zur Nachbardaube hin
    grid(1, segY, (u, v) => at(radius(v * h) - thickness * u, a0, v * h), () => new Vector3(Math.sin(a0), 0, -Math.cos(a0))),
    grid(1, segY, (u, v) => at(radius(v * h) - thickness * u, a1, v * h), () => new Vector3(-Math.sin(a1), 0, Math.cos(a1))),
    // Hirnholz oben und unten
    grid(segA, 1, (u, v) => at(radius(h) - thickness * v, ang(u), h), () => new Vector3(0, 1, 0)),
    grid(segA, 1, (u, v) => at(radius(0) - thickness * v, ang(u), 0), () => new Vector3(0, -1, 0)),
  ];
  return mergeGeometries(teile)!;
}

/** A box with rounded edges, centred at x, y, z. */
export function rounded(w: number, h: number, d: number, radius: number, x = 0, y = 0, z = 0, segments = 2): BufferGeometry {
  const r = Math.min(radius, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4);
  return new RoundedBoxGeometry(w, h, d, segments, Math.max(1e-4, r)).translate(x, y, z);
}

/** A turned part (leg, spindle, finial, cap) from [radius, y] pairs, bottom to top, standing at x, y0, z. */
export function turned(profile: [number, number][], segments: number, x = 0, y0 = 0, z = 0): BufferGeometry {
  return new LatheGeometry(profile.map(([r, y]) => new Vector2(Math.max(1e-4, r), y)), segments).translate(x, y0, z);
}

/**
 * The boards of a round lid or barrel head: `boards` strips across x with `gap` between them, cut to a circle of
 * `radius`, `thickness` thick, lying flat with the top face at y = 0.
 */
export function roundBoards(radius: number, boards: number, gap: number, thickness: number, curveSegments = 10): BufferGeometry {
  const teile: BufferGeometry[] = [];
  for (let k = 0; k < boards; k++) {
    const x0 = -radius + (2 * radius * k) / boards + (k ? gap / 2 : 0), x1 = -radius + (2 * radius * (k + 1)) / boards - (k < boards - 1 ? gap / 2 : 0);
    const y = (x: number) => Math.sqrt(Math.max(0, radius * radius - x * x));
    const s = new Shape();
    s.moveTo(x0, -y(x0));
    for (let i = 0; i <= curveSegments; i++) { const x = x0 + ((x1 - x0) * i) / curveSegments; s.lineTo(x, -y(x)); }
    for (let i = curveSegments; i >= 0; i--) { const x = x0 + ((x1 - x0) * i) / curveSegments; s.lineTo(x, y(x)); }
    const g = new ExtrudeGeometry(s, { depth: thickness, bevelEnabled: false, curveSegments: 1 });
    // Liegend: die Form in x/z, die Dicke nach unten
    teile.push(g.rotateX(Math.PI / 2));
  }
  return mergeGeometries(teile)!;
}
