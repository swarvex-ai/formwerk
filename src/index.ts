// Formwerk as a library: every asset as a function of its parameters (and a seed for variation). Values outside the
// ranges are clamped, unknown ones ignored, so `chair({ legs: 99 })` still builds a valid chair.
import type { Object3D } from "three";
import { clean, type Values } from "./core/params";
import type { Asset, AnyAsset } from "./assets/define";
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

export { ASSETS, assetById } from "./assets";
export { defaults, clean, random } from "./core/params";
export { exportMaterial } from "./materials";

/** Builds any asset from (partial, unchecked) values. */
export function build(asset: AnyAsset, values: Record<string, unknown> = {}, seed = 1): Object3D {
  return asset.build(clean(asset.params, values), seed);
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const bauer = <A extends Asset<any>>(a: A) => (values: Partial<Values<A["params"]>> = {}, seed = 1): Object3D => build(a, values, seed);

export const chair = bauer(a1), table = bauer(a2), shelf = bauer(a3), crate = bauer(a4), serverRack = bauer(a5);
export const stairs = bauer(a6), fence = bauer(a7), column = bauer(a8), tree = bauer(a9), rock = bauer(a10);
