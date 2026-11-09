// Formwerk as a library: every asset as a function of its parameters (and a seed for variation). Values outside the
// ranges are clamped, unknown ones ignored, so `chair({ legs: 99 })` still builds a valid chair. A preset name sets a
// look, explicit values win over it: `chair({ preset: "bar-stool", color: "#334455" })`.
import type { Object3D } from "three";
import type { Values } from "./core/params";
import { make, type Asset } from "./assets/define";
import { chair as chairAsset } from "./assets/furniture/chair";
import { table as tableAsset } from "./assets/furniture/table";
import { shelf as shelfAsset } from "./assets/furniture/shelf";
import { crate as crateAsset } from "./assets/furniture/crate";
import { serverRack as serverRackAsset } from "./assets/furniture/server-rack";
import { stairs as stairsAsset } from "./assets/architecture/stairs";
import { fence as fenceAsset } from "./assets/architecture/fence";
import { column as columnAsset } from "./assets/architecture/column";
import { bridge as bridgeAsset } from "./assets/architecture/bridge";
import { tree as treeAsset } from "./assets/nature/tree";
import { rock as rockAsset } from "./assets/nature/rock";
import { bed as bedAsset } from "./assets/furniture/bed";
import { sofa as sofaAsset } from "./assets/furniture/sofa";
import { wardrobe as wardrobeAsset } from "./assets/furniture/wardrobe";
import { door as doorAsset } from "./assets/architecture/door";
import { windowAsset } from "./assets/architecture/window";
import { bush as bushAsset } from "./assets/nature/bush";
import { flowers as flowersAsset } from "./assets/nature/flowers";
import { barrel as barrelAsset } from "./assets/props/barrel";
import { chest as chestAsset } from "./assets/props/chest";
import { lampPost as lampPostAsset } from "./assets/props/lamp-post";
import { bench as benchAsset } from "./assets/props/bench";
import { signpost as signpostAsset } from "./assets/props/signpost";
import { marketStall as marketStallAsset } from "./assets/props/market-stall";
import { cart as cartAsset } from "./assets/vehicles/cart";
import { car as carAsset } from "./assets/vehicles/car";
import { boat as boatAsset } from "./assets/vehicles/boat";
import { tank as tankAsset } from "./assets/vehicles/tank";
import { wheelbarrow as wheelbarrowAsset } from "./assets/vehicles/wheelbarrow";
import { makeSurface as machFlaeche, surfaceMaterial as flaechenMaterial, type Surface } from "./surfaces/define";
import type { MeshStandardNodeMaterial } from "three/webgpu";
import { cobblestone as cobblestoneSurface } from "./surfaces/stone/cobblestone";
import { planks as planksSurface } from "./surfaces/wood/planks";
import { metalPlate as metalPlateSurface } from "./surfaces/metal/metal-plate";
import { bricks as bricksSurface } from "./surfaces/stone/bricks";
import { tiles as tilesSurface } from "./surfaces/stone/tiles";
import { concrete as concreteSurface } from "./surfaces/stone/concrete";
import { marble as marbleSurface } from "./surfaces/stone/marble";
import { parquet as parquetSurface } from "./surfaces/wood/parquet";
import { corrugated as corrugatedSurface } from "./surfaces/metal/corrugated";
import { grass as grassSurface } from "./surfaces/ground/grass";
import { sand as sandSurface } from "./surfaces/ground/sand";
import { dirt as dirtSurface } from "./surfaces/ground/dirt";
import { snow as snowSurface } from "./surfaces/ground/snow";

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

export const chair = bauer(chairAsset);
export const table = bauer(tableAsset);
export const shelf = bauer(shelfAsset);
export const crate = bauer(crateAsset);
export const serverRack = bauer(serverRackAsset);
export const stairs = bauer(stairsAsset);
export const fence = bauer(fenceAsset);
export const column = bauer(columnAsset);
export const bridge = bauer(bridgeAsset);
export const tree = bauer(treeAsset);
export const rock = bauer(rockAsset);
export const bed = bauer(bedAsset);
export const door = bauer(doorAsset);
export const bush = bauer(bushAsset);
export const flowers = bauer(flowersAsset);
export const barrel = bauer(barrelAsset);
export const chest = bauer(chestAsset);
export const lampPost = bauer(lampPostAsset);
export const bench = bauer(benchAsset);
export const signpost = bauer(signpostAsset);
export const marketStall = bauer(marketStallAsset);
export const cart = bauer(cartAsset);
export const car = bauer(carAsset);
export const boat = bauer(boatAsset);
export const tank = bauer(tankAsset);
export const wheelbarrow = bauer(wheelbarrowAsset);
export const sofa = bauer(sofaAsset);
export const wardrobe = bauer(wardrobeAsset);
export const windowModel = bauer(windowAsset);

// Surfaces as three.js materials: `cobblestone({ moss: 0.5 }, seed, repeat)`; repeat = tiles across the mesh's UVs
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SurfaceInput<F extends Surface<any>> = Partial<Values<F["params"]>> & { preset?: Extract<keyof F["presets"], string> };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const flaeche = <F extends Surface<any>>(f: F) => (values: SurfaceInput<F> = {}, seed = 1, repeat: number | readonly [number, number] = 1): MeshStandardNodeMaterial =>
  flaechenMaterial(machFlaeche(f, values, seed), repeat);
export const cobblestone = flaeche(cobblestoneSurface);
export const planks = flaeche(planksSurface);
export const metalPlate = flaeche(metalPlateSurface);
export const bricks = flaeche(bricksSurface);
export const tiles = flaeche(tilesSurface);
export const concrete = flaeche(concreteSurface);
export const marble = flaeche(marbleSurface);
export const parquet = flaeche(parquetSurface);
export const corrugated = flaeche(corrugatedSurface);
export const grass = flaeche(grassSurface);
export const sand = flaeche(sandSurface);
export const dirt = flaeche(dirtSurface);
export const snow = flaeche(snowSurface);
