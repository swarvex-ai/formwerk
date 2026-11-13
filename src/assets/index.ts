// The catalogue: every asset of Formwerk. A new asset is one file in its category folder plus its import and its entry here,
// each on a line of its own (never two on one line: parallel tasks then merge cleanly, see .gitattributes).
import type { AnyAsset } from "./define";
import { chair } from "./furniture/chair";
import { table } from "./furniture/table";
import { shelf } from "./furniture/shelf";
import { workbench } from "./furniture/workbench";
import { crate } from "./furniture/crate";
import { serverRack } from "./furniture/server-rack";
import { stairs } from "./architecture/stairs";
import { fence } from "./architecture/fence";
import { column } from "./architecture/column";
import { bridge } from "./architecture/bridge";
import { pier } from "./architecture/pier";
import { fireplace } from "./architecture/fireplace";
import { tree } from "./nature/tree";
import { rock } from "./nature/rock";
import { logPile } from "./nature/log-pile";
import { bed } from "./furniture/bed";
import { sofa } from "./furniture/sofa";
import { wardrobe } from "./furniture/wardrobe";
import { desk } from "./furniture/desk";
import { door } from "./architecture/door";
import { windowAsset } from "./architecture/window";
import { bush } from "./nature/bush";
import { flowers } from "./nature/flowers";
import { mushrooms } from "./nature/mushrooms";
import { palm } from "./nature/palm";
import { cactus } from "./nature/cactus";
import { hayBale } from "./nature/hay-bale";
import { barrel } from "./props/barrel";
import { trough } from "./props/trough";
import { buoy } from "./props/buoy";
import { vase } from "./props/vase";
import { chest } from "./props/chest";
import { tankard } from "./props/tankard";
import { bucket } from "./props/bucket";
import { beehive } from "./props/beehive";
import { lampPost } from "./props/lamp-post";
import { bench } from "./props/bench";
import { signpost } from "./props/signpost";
import { gravestone } from "./props/gravestone";
import { mailbox } from "./props/mailbox";
import { marketStall } from "./props/market-stall";
import { books } from "./props/books";
import { tent } from "./props/tent";
import { torch } from "./props/torch";
import { lantern } from "./props/lantern";
import { ladder } from "./props/ladder";
import { campfire } from "./props/campfire";
import { anvil } from "./props/anvil";
import { well } from "./props/well";
import { cart } from "./vehicles/cart";
import { car } from "./vehicles/car";
import { boat } from "./vehicles/boat";
import { tank } from "./vehicles/tank";
import { wheelbarrow } from "./vehicles/wheelbarrow";
import { sled } from "./vehicles/sled";
import { anchor } from "./props/anchor";
import { candlestick } from "./props/candlestick";

export const ASSETS: AnyAsset[] = [
  chair,
  table,
  shelf,
  workbench,
  crate,
  serverRack,
  bed,
  sofa,
  wardrobe,
  desk,
  stairs,
  fence,
  column,
  bridge,
  pier,
  fireplace,
  door,
  windowAsset,
  tree,
  rock,
  logPile,
  bush,
  flowers,
  mushrooms,
  palm,
  cactus,
  hayBale,
  barrel,
  trough,
  buoy,
  vase,
  chest,
  tankard,
  bucket,
  beehive,
  lampPost,
  bench,
  signpost,
  gravestone,
  mailbox,
  marketStall,
  books,
  tent,
  torch,
  lantern,
  ladder,
  campfire,
  anvil,
  well,
  cart,
  car,
  boat,
  tank,
  wheelbarrow,
  sled,
  anchor,
  candlestick,
];
export const assetById = (id: string) => ASSETS.find((a) => a.id === id);
