// The catalogue: every asset of Formwerk. A new asset is one file in its category folder plus its import and its entry here,
// each on a line of its own (never two on one line: parallel tasks then merge cleanly, see .gitattributes).
import type { AnyAsset } from "./define";
import { chair } from "./furniture/chair";
import { throne } from "./furniture/throne";
import { table } from "./furniture/table";
import { shelf } from "./furniture/shelf";
import { breadRack } from "./furniture/bread-rack";
import { workbench } from "./furniture/workbench";
import { crate } from "./furniture/crate";
import { serverRack } from "./furniture/server-rack";
import { stairs } from "./architecture/stairs";
import { fence } from "./architecture/fence";
import { hitchingPost } from "./architecture/hitching-post";
import { column } from "./architecture/column";
import { battlement } from "./architecture/battlement";
import { bridge } from "./architecture/bridge";
import { pier } from "./architecture/pier";
import { waterWheel } from "./architecture/water-wheel";
import { fireplace } from "./architecture/fireplace";
import { forge } from "./architecture/forge";
import { breadOven } from "./architecture/bread-oven";
import { tree } from "./nature/tree";
import { rock } from "./nature/rock";
import { logPile } from "./nature/log-pile";
import { stump } from "./nature/stump";
import { reeds } from "./nature/reeds";
import { fern } from "./nature/fern";
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
import { washtub } from "./props/washtub";
import { trough } from "./props/trough";
import { doughTrough } from "./props/dough-trough";
import { buoy } from "./props/buoy";
import { vase } from "./props/vase";
import { chest } from "./props/chest";
import { tankard } from "./props/tankard";
import { jar } from "./props/jar";
import { bucket } from "./props/bucket";
import { washboard } from "./props/washboard";
import { beehive } from "./props/beehive";
import { lampPost } from "./props/lamp-post";
import { bench } from "./props/bench";
import { swing } from "./props/swing";
import { signpost } from "./props/signpost";
import { gravestone } from "./props/gravestone";
import { mailbox } from "./props/mailbox";
import { marketStall } from "./props/market-stall";
import { books } from "./props/books";
import { tent } from "./props/tent";
import { torch } from "./props/torch";
import { banner } from "./props/banner";
import { lantern } from "./props/lantern";
import { ladder } from "./props/ladder";
import { peel } from "./props/peel";
import { dryingRack } from "./props/drying-rack";
import { sawhorse } from "./props/sawhorse";
import { campfire } from "./props/campfire";
import { anvil } from "./props/anvil";
import { spinningWheel } from "./props/spinning-wheel";
import { well } from "./props/well";
import { cart } from "./vehicles/cart";
import { mineCart } from "./vehicles/mine-cart";
import { car } from "./vehicles/car";
import { boat } from "./vehicles/boat";
import { tank } from "./vehicles/tank";
import { wheelbarrow } from "./vehicles/wheelbarrow";
import { sled } from "./vehicles/sled";
import { anchor } from "./props/anchor";
import { candlestick } from "./props/candlestick";
import { scales } from "./props/scales";
import { grindstone } from "./props/grindstone";
import { cauldron } from "./props/cauldron";
import { scarecrow } from "./props/scarecrow";
import { coffin } from "./props/coffin";
import { sack } from "./props/sack";

export const ASSETS: AnyAsset[] = [
  chair,
  throne,
  table,
  shelf,
  breadRack,
  workbench,
  crate,
  serverRack,
  bed,
  sofa,
  wardrobe,
  desk,
  stairs,
  fence,
  hitchingPost,
  column,
  battlement,
  bridge,
  pier,
  waterWheel,
  fireplace,
  forge,
  breadOven,
  door,
  windowAsset,
  tree,
  rock,
  logPile,
  stump,
  reeds,
  fern,
  bush,
  flowers,
  mushrooms,
  palm,
  cactus,
  hayBale,
  barrel,
  washtub,
  trough,
  doughTrough,
  buoy,
  vase,
  chest,
  tankard,
  jar,
  bucket,
  washboard,
  beehive,
  lampPost,
  bench,
  swing,
  signpost,
  gravestone,
  mailbox,
  marketStall,
  books,
  tent,
  torch,
  banner,
  lantern,
  ladder,
  peel,
  dryingRack,
  sawhorse,
  campfire,
  anvil,
  spinningWheel,
  well,
  cart,
  mineCart,
  car,
  boat,
  tank,
  wheelbarrow,
  sled,
  anchor,
  candlestick,
  scales,
  grindstone,
  cauldron,
  scarecrow,
  coffin,
  sack,
];
export const assetById = (id: string) => ASSETS.find((a) => a.id === id);
