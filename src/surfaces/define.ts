// A surface: a material that tiles (cobblestones, planks, metal plates), as TSL nodes of the texture coordinate. One
// sample function gives height, colour, roughness and metalness at any point of the tile; the normal comes from the
// height. three.js uses it live (no textures, sharp at any distance), the bake (src/surfaces/bake.ts) renders it into
// PNG maps of any size for Godot, Blender and other engines. A larger bake also gets finer detail: the octaves of the
// noise follow the resolution.
import type { Texture } from "three";
import { MeshStandardNodeMaterial } from "three/webgpu";
import { float, Fn, normalize, normalMap, uv, vec2, vec3 } from "three/tsl";
import { withPreset, type Presets, type Schema, type Text, type Values } from "../core/params";
import type { F, V2, V3 } from "./noise";

export type SurfaceCategory = "stone" | "wood" | "metal";
export const SURFACE_CATEGORIES: SurfaceCategory[] = ["stone", "wood", "metal"];

/** What a surface is at one point: height 0 to 1, colour in linear RGB, roughness and metalness 0 to 1. */
export type Layers = { height: F; color: V3; roughness: F; metalness: F };
/** `p` is the position on the tile (0 to 1 is one tile, beyond it repeats); `resolution` the pixels across a tile. */
export type Sampler = (p: V2, resolution: number) => Layers;

export type Surface<S extends Schema = Schema> = {
  id: string; category: SurfaceCategory; title: Text; description: Text; params: S;
  presets: Presets<S>;
  /** Size of one tile in metres: the texture repeats every `tile` metres. */
  tile: number;
  /** Metres between height 0 and 1: how deep joints, grooves and rivets are (the strength of the normal map). */
  depth: number;
  build(p: Values<S>, seed: number): Sampler;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnySurface = Surface<any>;
export const defineSurface = <const S extends Schema>(s: Surface<S>): Surface<S> => s;

export type MadeSurface = { surface: AnySurface; values: Record<string, unknown>; seed: number; sample: Sampler };

/** A surface from (partial, unchecked) values, a preset name under `preset`, and a seed. */
export function makeSurface(surface: AnySurface, input: Record<string, unknown> = {}, seed = 1): MadeSurface {
  const values = withPreset(surface.params, surface.presets, input);
  return { surface, values, seed, sample: surface.build(values, seed) };
}

export type MapName = "color" | "normal" | "roughness" | "metalness" | "height";
export const MAPS: MapName[] = ["color", "normal", "roughness", "metalness", "height"];
/** Pixels across a tile that the live material assumes for detail and the normal (the bake uses its own size). */
export const LIVE_RESOLUTION = 1024;

/**
 * Tangent-space normal from the height, encoded in 0 to 1 (OpenGL convention: green points up the texture, as Godot,
 * Blender and three.js expect). Slopes are in metres per metre, so `depth` and `tile` give the real relief.
 */
export function normalOf(m: MadeSurface, p: V2, resolution: number): V3 {
  const e = 1 / resolution, k = m.surface.depth / (2 * e * m.surface.tile);
  const h = (dx: number, dy: number) => m.sample(p.add(vec2(dx, dy)), resolution).height;
  const sx = h(e, 0).sub(h(-e, 0)).mul(k), sy = h(0, e).sub(h(0, -e)).mul(k);
  return normalize(vec3(sx.negate(), sy.negate(), float(1))).mul(0.5).add(0.5);
}

/** One map as a colour node: colour in linear RGB, the normal encoded, the others as grey. */
export function mapNode(m: MadeSurface, map: MapName, p: V2, resolution: number): V3 {
  return Fn(() => {
    const q = vec2(p).toVar();
    if (map === "normal") return normalOf(m, q, resolution);
    const l = m.sample(q, resolution);
    if (map === "color") return l.color;
    const g = map === "height" ? l.height : map === "roughness" ? l.roughness : l.metalness;
    return vec3(g.clamp(0, 1));
  })() as V3;
}

/**
 * The live material for three.js: TSL, no textures. `repeat` is how many tiles fit across the mesh's UVs (a 4 m floor
 * with UVs 0 to 1 and a 1 m tile: 4); a pair repeats differently in u and v.
 */
export function surfaceMaterial(m: MadeSurface, repeat: number | readonly [number, number] = 1): MeshStandardNodeMaterial {
  const [ru, rv] = typeof repeat === "number" ? [repeat, repeat] : repeat;
  const mat = new MeshStandardNodeMaterial();
  const p = uv().mul(vec2(ru, rv));
  mat.colorNode = Fn(() => m.sample(vec2(p).toVar(), LIVE_RESOLUTION).color)();
  mat.roughnessNode = Fn(() => m.sample(vec2(p).toVar(), LIVE_RESOLUTION).roughness)();
  mat.metalnessNode = Fn(() => m.sample(vec2(p).toVar(), LIVE_RESOLUTION).metalness)();
  mat.normalNode = normalMap(mapNode(m, "normal", p, LIVE_RESOLUTION));
  mat.userData.surface = { id: m.surface.id, values: m.values, seed: m.seed, repeat: [ru, rv] };
  return mat;
}

/** Textures of baked maps on a plain MeshStandardMaterial: what Godot or Blender show from the PNG files. */
export type BakedTextures = Partial<Record<MapName, Texture>>;
