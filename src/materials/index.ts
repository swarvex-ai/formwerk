// Shared materials as TSL nodes: they compile to WGSL (WebGPU) or GLSL (WebGL 2) and need no image files. Every
// material also knows plain PBR values for the export, whether it has a procedural pattern (the export bakes those into
// textures, src/core/export.ts) and a density for the mass estimate (src/core/physics.ts).
//
// Wood, iron, stone and bark are described like a surface: colour, roughness, metalness and a height at every point of
// the object, in the object's own metres. The height gives the relief (grain, rust, pits, furrows): a normal from finite
// differences of the height, the same function live and in the bake, so the exported normal map matches what the
// gallery shows. Wood has a grain direction: the fibres run along one axis of the asset ("y" for staves and legs).
import { MeshStandardMaterial, type Material } from "three";
import { MeshStandardNodeMaterial, type Node } from "three/webgpu";
import {
  abs, color, cross, dFdx, dFdy, dot, float, Fn, fwidth, max, mix, mx_cell_noise_float, mx_fractal_noise_float, mx_noise_float,
  mx_worley_noise_float, normalize, normalLocal, positionLocal, pow, select, sin, smoothstep, transformNormalToView, vec2, vec3,
} from "three/tsl";

export const MATERIALS = ["wood", "metal", "iron", "paint", "stone", "plastic", "bark", "leaf", "glow"] as const;
export type MaterialKind = (typeof MATERIALS)[number];
/** The axis the wood fibres run along, in the asset's coordinates. */
export type Grain = "x" | "y" | "z" | "auto";

type F = Node<"float">;
type V3 = Node<"vec3">;
/** A colour as a vec3 node (linear RGB). */
const farbe = (hex: string) => color(hex) as unknown as V3;

const PBR: Record<MaterialKind, { roughness: number; metalness: number }> = {
  wood: { roughness: 0.66, metalness: 0 }, metal: { roughness: 0.4, metalness: 0.6 }, iron: { roughness: 0.55, metalness: 0.7 },
  paint: { roughness: 0.5, metalness: 0 }, stone: { roughness: 0.86, metalness: 0 }, plastic: { roughness: 0.45, metalness: 0 },
  bark: { roughness: 0.92, metalness: 0 }, leaf: { roughness: 0.8, metalness: 0 }, glow: { roughness: 0.4, metalness: 0 },
};

// Effective densities in kg/m³ for the way assets are modelled: metal parts are drawn solid but are mostly tubes and
// sheets in reality, plastic is hollow, foliage clusters are mostly air. Good for an estimate, not for engineering.
const DICHTE: Record<MaterialKind, number> = { wood: 600, metal: 2500, iron: 2500, paint: 600, stone: 2500, plastic: 300, bark: 800, leaf: 30, glow: 1000 };
const MUSTER: MaterialKind[] = ["wood", "iron", "stone", "bark", "leaf"];

/** How much of a detail survives at this pixel: 1 while one period of `x` (a noise argument) spans more than about four
 *  pixels, 0 when it is finer than one and a half. Live this fades what a texture's mipmaps would average away; in the bake
 *  (texels of a few millimetres) the detail stays. */
const sichtbar = (x: V3): F => {
  const w = fwidth(x);
  return float(1).sub(smoothstep(0.25, 0.7, max(w.x, max(w.y, w.z))));
};
/** The same for a periodic band: faded between five and two pixels per period, about where mipmaps blur it. */
const sichtbar1 = (x: F): F => float(1).sub(smoothstep(0.2, 0.5, fwidth(x)));

/** A surface at one point of the object: colour (linear), roughness, metalness and height (about -1 to 1). */
type Probe = { color: V3; roughness: F; metalness: F };
type Kind = {
  /** Height at a point (scaled object coordinates) of a face with normal n; null: no relief. */
  height: ((q: V3, n: V3) => F) | null;
  /** Metres between height 0 and 1. */
  depth: number;
  probe(q: V3, n: V3, base: V3): Probe;
};

// Wood: rings of a log whose pith lies beside the object (planks show slightly wavy stripes), thin dark latewood at the
// end of each ring, fine fibres along the grain, and a mild tone per board (cells a hand wide and over a metre long;
// an asset that wants one clear tone per board takes two wood materials and alternates them)
const holzFelder = (q: V3, n: V3, g: Grain) => {
  // "auto": fibres upright on standing faces (legs, staves, posts) and along x on lying ones (tops, seats, shelves),
  // so a table top shows long grain instead of the end of a log
  const liegend = abs(n.y).greaterThan(0.7);
  const along = g === "x" ? q.x : g === "z" ? q.z : g === "y" ? q.y : select(liegend, q.x, q.y);
  const quer = g === "x" ? q.yz : g === "z" ? q.xy : g === "y" ? q.xz : select(liegend, q.zy, q.xz);
  const warp = mx_noise_float(vec3(quer.mul(1.3), along.mul(0.22)));
  // The pith lies two metres beside the object: rings cross a board as slightly wavy lines, not as wide arches
  // Uneven ring widths (good and poor years) from a slow noise across the log
  const jahre = mx_noise_float(vec3(quer.mul(2.2), along.mul(0.08)).add(3.1)).mul(1.6);
  const ring = quer.add(vec2(1.9, 1.3)).length().mul(30).add(warp.mul(1.2)).add(mx_noise_float(vec3(quer.mul(6), along.mul(0.6))).mul(0.5)).add(jahre);
  // Latewood as a narrow band with soft edges (a hard sawtooth edge flickers between the live material and its bake)
  // A soft band (few harmonics), faded to its mean (0.375) where the rings get finer than a few pixels, as mipmaps would
  const spaet = mix(float(0.375), pow(sin(ring.mul(Math.PI * 2)).mul(0.5).add(0.5), float(2)), sichtbar1(ring));
  const faserArg = vec3(quer.mul(150), along.mul(3.5));
  const faser = mx_noise_float(faserArg).mul(sichtbar(faserArg));
  const brett = mx_cell_noise_float(vec3(quer.x.div(0.11).floor(), quer.y.div(0.11).floor(), along.div(1.7).floor()));
  return { spaet, faser, brett };
};
const holz = (g: Grain): Kind => ({
  depth: 0.0007,
  height: (q, n) => { const f = holzFelder(q, n, g); return f.spaet.mul(-0.5).sub(f.faser.mul(0.5)); },
  probe(q, n, base) {
    const f = holzFelder(q, n, g);
    const ton = mix(float(1.05), float(0.76), f.spaet).mul(f.brett.mul(0.14).add(0.93)).mul(f.faser.mul(0.06).add(1));
    return { color: base.mul(ton), roughness: f.spaet.mul(0.14).add(f.faser.mul(0.05)).add(0.6), metalness: float(0) };
  },
});

// Iron: forged or cast, with rust in patches (rough, orange-brown, raised a little) and pitting inside the rust
const eisenFelder = (q: V3, menge: number) => {
  const flecken = mx_fractal_noise_float(q.mul(5), 3, 2.0, 0.5, 1.0);
  const fein = mx_noise_float(q.mul(45));
  // menge 0: bare metal, 0.45: patches, 1: mostly rust
  const ab = 0.55 - menge * 0.9;
  const rost = menge <= 0 ? float(0) : smoothstep(ab, ab + 0.28, flecken.add(fein.mul(0.15)));
  const narben = mx_noise_float(q.mul(120)).mul(sichtbar(q.mul(120)));
  return { rost, fein, narben };
};
const ROST = farbe("#5a3220");
const eisen = (menge: number): Kind => ({
  depth: 0.0006,
  height: (q) => { const f = eisenFelder(q, menge); return f.rost.mul(0.6).add(f.narben.mul(f.rost).mul(0.25)).add(f.fein.mul(0.15)); },
  probe(q, _n, base) {
    const f = eisenFelder(q, menge);
    return {
      color: mix(base.mul(f.fein.mul(0.15).add(0.92)), ROST.mul(f.narben.mul(0.18).add(0.92)), f.rost),
      roughness: mix(f.fein.mul(0.08).add(0.42), float(0.88), f.rost),
      metalness: mix(float(0.88), float(0.2), f.rost),
    };
  },
});

// Stone: large swells, fine grain, small pits; light and dark mineral grains; darker in the hollows and near the ground
const steinFelder = (q: V3) => {
  const gross = mx_fractal_noise_float(q.mul(2.2), 4, 2.0, 0.5, 1.0);
  const korn = mx_noise_float(q.mul(70)).mul(sichtbar(q.mul(70)));
  const loch = smoothstep(0.14, 0.0, mx_worley_noise_float(q.mul(22)));
  const mineral = mx_noise_float(q.mul(160).add(17.3)).mul(sichtbar(q.mul(160)));
  return { gross, korn, loch, mineral };
};
const MOOS = farbe("#4a5230"), FLECHTE_HELL = farbe("#a3a08a");
const stein = (moos: number): Kind => ({
  depth: 0.004,
  height: (q) => { const f = steinFelder(q); return f.gross.mul(0.7).add(f.korn.mul(0.12)).sub(f.loch.mul(0.6)); },
  probe(q, n, base) {
    const f = steinFelder(q);
    const ton = f.gross.mul(0.3).add(0.88).mul(f.korn.mul(0.1).add(1)).mul(f.loch.mul(-0.4).add(1));
    const hell = smoothstep(0.55, 0.75, f.mineral), dunkel = smoothstep(-0.55, -0.75, f.mineral);
    let farbeStein = base.mul(ton).mul(hell.mul(0.3).add(1)).mul(dunkel.mul(-0.4).add(1));
    let rauh = f.korn.mul(0.08).add(0.84).sub(f.loch.mul(0.06));
    if (moos > 0) {
      // Moss and lichen on the faces that look up, in patches
      const flecken = mx_fractal_noise_float(q.mul(2.6).add(9.1), 3, 2.0, 0.5, 1.0);
      const maske = smoothstep(0.55, 0.9, n.y).mul(smoothstep(0.5 - moos * 0.45, 0.65 - moos * 0.45, flecken.mul(0.5).add(0.5))).mul(0.85);
      const flechte = smoothstep(0.62, 0.7, mx_noise_float(q.mul(9).add(2.3)).mul(0.5).add(0.5)).mul(moos);
      farbeStein = mix(mix(farbeStein, FLECHTE_HELL, flechte.mul(0.5)), MOOS.mul(f.korn.mul(0.15).add(0.9)), maske);
      rauh = mix(rauh, float(0.95), maske);
    }
    // Soil stains where the stone meets the ground (the floor of the asset is y = 0)
    const erde = float(1).sub(smoothstep(0.0, 0.14, positionLocal.y));
    return { color: farbeStein.mul(erde.mul(-0.28).add(1)), roughness: rauh, metalness: float(0) };
  },
});

// Bark: ridges and furrows along the trunk, fine fibres, grey-green lichen in patches
const rindeFelder = (q: V3) => {
  const w = mx_noise_float(q.mul(vec3(3, 0.6, 3)));
  const rippe = float(1).sub(abs(mx_noise_float(q.mul(vec3(14, 2.2, 14)).add(vec3(0, w.mul(0.8), 0)))));
  const fein = mx_noise_float(q.mul(55)).mul(sichtbar(q.mul(55)));
  return { rippe, fein, w };
};
const FLECHTE = farbe("#7d8466");
const rinde: Kind = {
  depth: 0.006,
  height: (q) => { const f = rindeFelder(q); return pow(f.rippe, float(2)).mul(0.9).add(f.fein.mul(0.1)); },
  probe(q, _n, base) {
    const f = rindeFelder(q);
    const holzig = base.mul(mix(float(0.42), float(1.12), f.rippe)).mul(f.fein.mul(0.08).add(1));
    return { color: mix(holzig, FLECHTE.mul(f.rippe.mul(0.3).add(0.7)), smoothstep(0.45, 0.65, f.w).mul(0.6)), roughness: float(0.92), metalness: float(0) };
  },
};

// Foliage: colour variation only
const laub: Kind = {
  depth: 0, height: null,
  probe: (q, _n, base) => ({ color: mix(base.mul(0.75), base.mul(1.15), mx_noise_float(q.mul(9)).mul(0.5).add(0.5)), roughness: float(0.8), metalness: float(0) }),
};

/** Object-space normal with the relief of `height`: finite differences along two tangents, so the result does not
 *  depend on the screen and the bake gets exactly the normal the gallery shows. `flat`: faceted shading. */
function reliefNormal(height: (q: V3, n: V3) => F, depth: number, scale: number, flat: boolean): V3 {
  return Fn(() => {
    const n = flat ? faceNormal() : normalize(normalLocal);
    const hilfe = select(abs(n.y).lessThan(0.9), vec3(0, 1, 0), vec3(1, 0, 0));
    const t1 = normalize(cross(hilfe, n)), t2 = cross(n, t1);
    const e = 0.0012, p = positionLocal;
    const h = (x: V3) => height(x.mul(scale), n);
    const h0 = h(p), h1 = h(p.add(t1.mul(e))), h2 = h(p.add(t2.mul(e)));
    const gradient = t1.mul(h1.sub(h0)).add(t2.mul(h2.sub(h0))).mul(depth / e);
    return normalize(n.sub(gradient));
  })() as V3;
}

/** The face normal from screen derivatives, turned to the side of the vertex normal. */
export const faceNormal = (): V3 => {
  const f = normalize(cross(dFdx(positionLocal), dFdy(positionLocal)));
  return select(dot(f, normalLocal).greaterThanEqual(0), f, f.negate()) as V3;
};

/** What the bake needs of a patterned material: its colour, roughness, metalness and object-space normal nodes. */
export type BakeNodes = { color: V3; roughness: F; metalness: F; normal: (flat: boolean) => V3 };
const backen = new WeakMap<Material, BakeNodes>();
export const bakeNodes = (m: Material): BakeNodes | undefined => backen.get(m);

export type MaterialOptions = {
  grain?: Grain;
  /** Stone: moss and lichen on upward faces, 0 to 1. */
  moss?: number;
  /** Iron: how much of it is rust, 0 (bare) to 1; default 0.45. */
  rust?: number;
  /** One plain colour, no pattern and no bake (leaf cards: thousands of them would not fit an atlas). */
  plain?: boolean;
};

/** `density` overrides the effective density for things drawn solid that are hollow inside (a server, a cabinet).
 *  `grain`: the axis wood fibres run along; "auto" (default) is upright on standing faces and along x on lying ones. */
export function material(kind: MaterialKind, hex: string, scale = 1, density?: number, opts: MaterialOptions = {}): MeshStandardNodeMaterial {
  const m = new MeshStandardNodeMaterial(PBR[kind]);
  const base = farbe(hex);
  const art: Kind | null = opts.plain ? null : kind === "wood" ? holz(opts.grain ?? "auto") : kind === "iron" ? eisen(opts.rust ?? 0.45) : kind === "stone" ? stein(opts.moss ?? 0) : kind === "bark" ? rinde : kind === "leaf" ? laub : null;
  if (art) {
    const q = positionLocal.mul(float(scale));
    // The face direction for the grain: the vertex normal (for faceted shading the face normal is the same within a
    // face, and the grain only needs to know standing from lying)
    const p = art.probe(q, normalize(normalLocal), base);
    m.colorNode = p.color;
    m.roughnessNode = p.roughness;
    m.metalnessNode = p.metalness;
    const hoehe = art.height;
    const normal = (flat: boolean) => (hoehe ? reliefNormal(hoehe, art.depth, scale, flat) : flat ? faceNormal() : normalize(normalLocal));
    if (hoehe) m.normalNode = Fn((builder: { material: Material }) => transformNormalToView(normal(Boolean((builder.material as { flatShading?: boolean }).flatShading))))();
    backen.set(m, { color: p.color, roughness: p.roughness, metalness: p.metalness, normal });
  } else if (kind === "glow") { m.colorNode = base; m.emissiveNode = base.mul(2); }
  else m.colorNode = base;
  m.userData.export = { kind, color: hex, emissive: kind === "glow" ? hex : "#000000", ...PBR[kind], density: density ?? DICHTE[kind], pattern: !opts.plain && MUSTER.includes(kind) };
  return m;
}

export type ExportInfo = { kind: MaterialKind; color: string; emissive: string; roughness: number; metalness: number; density: number; pattern: boolean };
export const exportInfo = (m: Material): ExportInfo | undefined => m.userData.export as ExportInfo | undefined;

/** A plain PBR material for the export, from the values a material() carries. */
export function exportMaterial(m: Material): MeshStandardMaterial {
  const e = (m.userData.export ?? { color: "#cccccc", emissive: "#000000", roughness: 0.6, metalness: 0 }) as { color: string; emissive: string; roughness: number; metalness: number };
  // Keeps the side: a tent cloth or a banner is seen from both sides (glTF "doubleSided")
  return new MeshStandardMaterial({ color: e.color, emissive: e.emissive, roughness: e.roughness, metalness: e.metalness, flatShading: Boolean((m as { flatShading?: boolean }).flatShading), side: m.side });
}
