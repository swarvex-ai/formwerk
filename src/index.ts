// Formwerk as a library: every asset as a function of its parameters (and a seed for variation). Values outside the
// ranges are clamped, unknown ones ignored, so `chair({ legs: 99 })` still builds a valid chair. A preset name sets a
// look, explicit values win over it: `chair({ preset: "bar-stool", color: "#334455" })`.
import type { Object3D } from "three";
import type { Values } from "./core/params";
import { make, type Asset } from "./assets/define";
import { chair as a1 } from "./assets/furniture/chair";
import { table as a2 } from "./assets/furniture/table";
import { shelf as a3 } from "./assets/furniture/shelf";
import { crate as a4 } from "./assets/furniture/crate";
import { serverRack as a5 } from "./assets/furniture/server-rack";
import { stairs as a6 } from "./assets/architecture/stairs";
import { fence as a7 } from "./assets/architecture/fence";
import { column as a8 } from "./assets/architecture/column";
import { tree as a9 } from "./assets/nature/tree";
import { rock as a10 } from "./assets/nature/rock";
import { bed as a11 } from "./assets/furniture/bed";
import { sofa as a24 } from "./assets/furniture/sofa";
import { door as a12 } from "./assets/architecture/door";
import { bush as a13 } from "./assets/nature/bush";
import { barrel as a14 } from "./assets/props/barrel";
import { chest as a15 } from "./assets/props/chest";
import { lampPost as a16 } from "./assets/props/lamp-post";
import { bench as a17 } from "./assets/props/bench";
import { signpost as a18 } from "./assets/props/signpost";
import { marketStall as a19 } from "./assets/props/market-stall";
import { cart as a20 } from "./assets/vehicles/cart";
import { car as a21 } from "./assets/vehicles/car";
import { boat as a22 } from "./assets/vehicles/boat";
import { tank as a23 } from "./assets/vehicles/tank";
import { makeSurface as machFlaeche, surfaceMaterial as flaechenMaterial, type Surface } from "./surfaces/define";
import type { MeshStandardNodeMaterial } from "three/webgpu";
import { cobblestone as f1 } from "./surfaces/stone/cobblestone";
import { planks as f2 } from "./surfaces/wood/planks";
import { metalPlate as f3 } from "./surfaces/metal/metal-plate";
import { bricks as f4 } from "./surfaces/stone/bricks";
import { tiles as f5 } from "./surfaces/stone/tiles";
import { concrete as f6 } from "./surfaces/stone/concrete";
import { marble as f7 } from "./surfaces/stone/marble";
import { parquet as f8 } from "./surfaces/wood/parquet";
import { corrugated as f9 } from "./surfaces/metal/corrugated";
import { grass as f10 } from "./surfaces/ground/grass";
import { sand as f11 } from "./surfaces/ground/sand";
import { dirt as f12 } from "./surfaces/ground/dirt";
import { snow as f13 } from "./surfaces/ground/snow";

export { ASSETS, assetById } from "./assets";
export { defaults, clean, random, withPreset } from "./core/params";
export { make as build, pose, infoOf, measure, size } from "./assets/define";
export { physicsOf, hullPoints } from "./core/physics";
export { bake, exportCopy, toGLB, toUSDZ, toOBJ } from "./core/export";
export { exportMaterial } from "./materials";
export { catalog } from "./catalog";
export { SURFACES, surfaceById } from "./surfaces";
export { makeSurface, surfaceMaterial, mapNode, MAPS } from "./surfaces/define";
export { bakeSurface, bakedMaterial, createBaker, toPNG, toTextures, toZip, SIZES } from "./surfaces/bake";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Input<A extends Asset<any>> = Partial<Values<A["params"]>> & { preset?: Extract<keyof A["presets"], string> };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const bauer = <A extends Asset<any>>(a: A) => (values: Input<A> = {}, seed = 1): Object3D => make(a, values, seed);

export const chair = bauer(a1), table = bauer(a2), shelf = bauer(a3), crate = bauer(a4), serverRack = bauer(a5);
export const stairs = bauer(a6), fence = bauer(a7), column = bauer(a8), tree = bauer(a9), rock = bauer(a10);
export const bed = bauer(a11), door = bauer(a12), bush = bauer(a13), barrel = bauer(a14), chest = bauer(a15), lampPost = bauer(a16);
export const bench = bauer(a17), signpost = bauer(a18), marketStall = bauer(a19), cart = bauer(a20), car = bauer(a21), boat = bauer(a22), tank = bauer(a23);
export const sofa = bauer(a24);

// Surfaces as three.js materials: `cobblestone({ moss: 0.5 }, seed, repeat)`; repeat = tiles across the mesh's UVs
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SurfaceInput<F extends Surface<any>> = Partial<Values<F["params"]>> & { preset?: Extract<keyof F["presets"], string> };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const flaeche = <F extends Surface<any>>(f: F) => (values: SurfaceInput<F> = {}, seed = 1, repeat: number | readonly [number, number] = 1): MeshStandardNodeMaterial =>
  flaechenMaterial(machFlaeche(f, values, seed), repeat);
export const cobblestone = flaeche(f1), planks = flaeche(f2), metalPlate = flaeche(f3), bricks = flaeche(f4), tiles = flaeche(f5);
export const concrete = flaeche(f6), marble = flaeche(f7), parquet = flaeche(f8), corrugated = flaeche(f9), grass = flaeche(f10), sand = flaeche(f11), dirt = flaeche(f12), snow = flaeche(f13);
