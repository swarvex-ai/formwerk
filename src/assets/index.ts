// The catalogue: every asset of Formwerk. A new asset is one file in its category folder plus its import and its entry here,
// each on a line of its own (never two on one line: parallel tasks then merge cleanly, see .gitattributes).
import type { AnyAsset } from "./define";
import { chair } from "./furniture/chair";
import { table } from "./furniture/table";
import { shelf } from "./furniture/shelf";
import { crate } from "./furniture/crate";
import { serverRack } from "./furniture/server-rack";
import { stairs } from "./architecture/stairs";
import { fence } from "./architecture/fence";
import { column } from "./architecture/column";
import { bridge } from "./architecture/bridge";
import { tree } from "./nature/tree";
import { rock } from "./nature/rock";
import { bed } from "./furniture/bed";
import { sofa } from "./furniture/sofa";
import { wardrobe } from "./furniture/wardrobe";
import { door } from "./architecture/door";
import { windowAsset } from "./architecture/window";
import { bush } from "./nature/bush";
import { flowers } from "./nature/flowers";
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
import { wheelbarrow } from "./vehicles/wheelbarrow";

export const ASSETS: AnyAsset[] = [
  chair,
  table,
  shelf,
  crate,
  serverRack,
  bed,
  sofa,
  wardrobe,
  stairs,
  fence,
  column,
  bridge,
  door,
  windowAsset,
  tree,
  rock,
  bush,
  flowers,
  barrel,
  chest,
  lampPost,
  bench,
  signpost,
  marketStall,
  cart,
  car,
  boat,
  tank,
  wheelbarrow,
];
export const assetById = (id: string) => ASSETS.find((a) => a.id === id);
