// The sounds of the catalogue. A new sound is one file in its category folder plus its import and its entry here,
// each on a line of its own (never two on one line: parallel tasks then merge cleanly, see .gitattributes).
import type { AnySound } from "./define";
import { click } from "./ui/click";
import { chime } from "./ui/chime";
import { pop } from "./ui/pop";
import { toggle } from "./ui/toggle";
import { buzz } from "./ui/buzz";
import { alert } from "./ui/alert";
import { hit } from "./impact/hit";
import { explosion } from "./impact/explosion";
import { footstep } from "./movement/footstep";
import { rustle } from "./movement/rustle";
import { chain } from "./movement/chain";
import { hooves } from "./movement/hooves";
import { cartWheels } from "./movement/cart-wheels";
import { jump } from "./movement/jump";
import { whoosh } from "./movement/whoosh";
import { pickup } from "./effects/pickup";
import { zap } from "./effects/zap";
import { laser } from "./effects/laser";
import { bow } from "./effects/bow";
import { effort } from "./voice/effort";
import { pain } from "./voice/pain";
import { creature } from "./voice/creature";
import { rooster } from "./voice/rooster";
import { whinny } from "./voice/whinny";
import { crow } from "./voice/crow";
import { croak } from "./voice/croak";
import { hoot } from "./voice/hoot";
import { babble } from "./voice/babble";
import { wind } from "./ambience/wind";
import { typing } from "./ui/typing";
import { page } from "./ui/page";
import { glass } from "./impact/glass";
import { appleBite } from "./impact/apple-bite";
import { clang } from "./impact/clang";
import { knock } from "./impact/knock";
import { nailing } from "./impact/nailing";
import { lockTurn } from "./impact/lock-turn";
import { diceRoll } from "./impact/dice-roll";
import { cardShuffle } from "./effects/card-shuffle";
import { woodBreak } from "./impact/wood-break";
import { breadTear } from "./impact/bread-tear";
import { pickaxe } from "./impact/pickaxe";
import { woodpecker } from "./impact/woodpecker";
import { bones } from "./impact/bones";
import { portcullis } from "./impact/portcullis";
import { splash } from "./movement/splash";
import { flop } from "./movement/flop";
import { creak } from "./movement/creak";
import { stoneSlide } from "./movement/stone-slide";
import { doorSwing } from "./movement/door-swing";
import { drawer } from "./movement/drawer";
import { magic } from "./effects/magic";
import { stir } from "./effects/stir";
import { engine } from "./effects/engine";
import { heartbeat } from "./effects/heartbeat";
import { rain } from "./ambience/rain";
import { fire } from "./ambience/fire";
import { sizzle } from "./ambience/sizzle";
import { hum } from "./ambience/hum";
import { thunder } from "./ambience/thunder";
import { coins } from "./effects/coins";
import { sift } from "./effects/sift";
import { nature } from "./ambience/nature";
import { stream } from "./ambience/stream";
import { millstone } from "./ambience/millstone";
import { spinning } from "./ambience/spinning";
import { drip } from "./ambience/drip";
import { bubbling } from "./ambience/bubbling";
import { saw } from "./effects/saw";
import { planing } from "./effects/planing";
import { scrub } from "./effects/scrub";
import { loom } from "./ambience/loom";
import { ticking } from "./ambience/ticking";
import { kneading } from "./effects/kneading";
import { swordDraw } from "./effects/sword-draw";
import { pour } from "./effects/pour";
import { grainPour } from "./effects/grain-pour";
import { cork } from "./effects/cork";
import { fizz } from "./effects/fizz";
import { blowOut } from "./effects/blow-out";
import { waves } from "./ambience/waves";
import { shipBell } from "./effects/ship-bell";
import { horn } from "./effects/horn";
import { reel } from "./effects/reel";
import { writing } from "./effects/writing";
import { sanding } from "./effects/sanding";
import { knitting } from "./effects/knitting";
import { snip } from "./effects/snip";
import { rollingPin } from "./effects/rolling-pin";
import { bellows } from "./effects/bellows";
import { quench } from "./ambience/quench";
import { sleighBells } from "./movement/sleigh-bells";

export const SOUNDS: AnySound[] = [
  click,
  chime,
  pop,
  toggle,
  buzz,
  alert,
  typing,
  page,
  hit,
  explosion,
  glass,
  appleBite,
  clang,
  knock,
  nailing,
  lockTurn,
  diceRoll,
  cardShuffle,
  woodBreak,
  breadTear,
  pickaxe,
  woodpecker,
  bones,
  portcullis,
  footstep,
  rustle,
  chain,
  hooves,
  cartWheels,
  jump,
  whoosh,
  splash,
  flop,
  creak,
  stoneSlide,
  doorSwing,
  drawer,
  pickup,
  zap,
  laser,
  bow,
  magic,
  stir,
  engine,
  heartbeat,
  effort,
  pain,
  creature,
  rooster,
  whinny,
  crow,
  croak,
  hoot,
  babble,
  wind,
  rain,
  fire,
  sizzle,
  hum,
  thunder,
  coins,
  sift,
  nature,
  stream,
  millstone,
  spinning,
  drip,
  bubbling,
  saw,
  planing,
  scrub,
  loom,
  ticking,
  kneading,
  swordDraw,
  pour,
  grainPour,
  cork,
  fizz,
  blowOut,
  waves,
  shipBell,
  horn,
  reel,
  writing,
  sanding,
  knitting,
  snip,
  rollingPin,
  bellows,
  quench,
  sleighBells,
];
export const soundById = (id: string) => SOUNDS.find((s) => s.id === id);
