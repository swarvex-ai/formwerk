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

export { ASSETS, assetById } from "./assets";
export { defaults, clean, random, withPreset } from "./core/params";
export { make as build, pose, infoOf, measure, size } from "./assets/define";
export { physicsOf, hullPoints } from "./core/physics";
export { bake, exportCopy, toGLB, toUSDZ, toOBJ } from "./core/export";
export { exportMaterial } from "./materials";
export { catalog } from "./catalog";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Input<A extends Asset<any>> = Partial<Values<A["params"]>> & { preset?: Extract<keyof A["presets"], string> };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const bauer = <A extends Asset<any>>(a: A) => (values: Input<A> = {}, seed = 1): Object3D => make(a, values, seed);

export const chair = bauer(a1), table = bauer(a2), shelf = bauer(a3), crate = bauer(a4), serverRack = bauer(a5);
export const stairs = bauer(a6), fence = bauer(a7), column = bauer(a8), tree = bauer(a9), rock = bauer(a10);
