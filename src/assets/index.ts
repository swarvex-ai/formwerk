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
import { bed } from "./furniture/bed";
import { sofa } from "./furniture/sofa";
import { door } from "./architecture/door";
import { bush } from "./nature/bush";
import { barrel } from "./props/barrel";
import { chest } from "./props/chest";
import { lampPost } from "./props/lamp-post";
import { bench } from "./props/bench";
import { signpost } from "./props/signpost";
import { marketStall } from "./props/market-stall";
import { cart } from "./vehicles/cart";
import { car } from "./vehicles/car";
import { boat } from "./vehicles/boat";
import { tank } from "./vehicles/tank";

export const ASSETS: AnyAsset[] = [
  chair, table, shelf, crate, serverRack, bed, sofa,
  stairs, fence, column, door,
  tree, rock, bush,
  barrel, chest, lampPost, bench, signpost, marketStall,
  cart, car, boat, tank,
];
export const assetById = (id: string) => ASSETS.find((a) => a.id === id);
