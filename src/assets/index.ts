// The catalogue: every asset of Formwerk. A new asset is one file in its category folder plus one line here.
import type { AnyAsset } from "./define";
import { chair } from "./furniture/chair";
import { table } from "./furniture/table";
import { shelf } from "./furniture/shelf";
import { crate } from "./furniture/crate";
import { serverRack } from "./furniture/server-rack";
import { stairs } from "./architecture/stairs";
import { fence } from "./architecture/fence";
import { column } from "./architecture/column";
import { tree } from "./nature/tree";
import { rock } from "./nature/rock";

export const ASSETS: AnyAsset[] = [chair, table, shelf, crate, serverRack, stairs, fence, column, tree, rock];
export const assetById = (id: string) => ASSETS.find((a) => a.id === id);
