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
import { crow } from "./voice/crow";
import { croak } from "./voice/croak";
import { hoot } from "./voice/hoot";
import { babble } from "./voice/babble";
import { wind } from "./ambience/wind";
import { typing } from "./ui/typing";
import { page } from "./ui/page";
import { glass } from "./impact/glass";
import { clang } from "./impact/clang";
import { knock } from "./impact/knock";
import { lockTurn } from "./impact/lock-turn";
import { woodBreak } from "./impact/wood-break";
import { pickaxe } from "./impact/pickaxe";
import { woodpecker } from "./impact/woodpecker";
import { portcullis } from "./impact/portcullis";
import { splash } from "./movement/splash";
import { creak } from "./movement/creak";
import { stoneSlide } from "./movement/stone-slide";
import { doorSwing } from "./movement/door-swing";
import { magic } from "./effects/magic";
import { engine } from "./effects/engine";
import { heartbeat } from "./effects/heartbeat";
import { rain } from "./ambience/rain";
import { fire } from "./ambience/fire";
import { sizzle } from "./ambience/sizzle";
import { hum } from "./ambience/hum";
import { thunder } from "./ambience/thunder";
import { coins } from "./effects/coins";
import { nature } from "./ambience/nature";
import { stream } from "./ambience/stream";
import { drip } from "./ambience/drip";
import { bubbling } from "./ambience/bubbling";
import { saw } from "./effects/saw";
import { swordDraw } from "./effects/sword-draw";
import { pour } from "./effects/pour";
import { waves } from "./ambience/waves";
import { shipBell } from "./effects/ship-bell";
import { horn } from "./effects/horn";
import { writing } from "./effects/writing";
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
  clang,
  knock,
  lockTurn,
  woodBreak,
  pickaxe,
  woodpecker,
  portcullis,
  footstep,
  rustle,
  chain,
  hooves,
  jump,
  whoosh,
  splash,
  creak,
  stoneSlide,
  doorSwing,
  pickup,
  zap,
  laser,
  bow,
  magic,
  engine,
  heartbeat,
  effort,
  pain,
  creature,
  rooster,
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
  nature,
  stream,
  drip,
  bubbling,
  saw,
  swordDraw,
  pour,
  waves,
  shipBell,
  horn,
  writing,
  sleighBells,
];
export const soundById = (id: string) => SOUNDS.find((s) => s.id === id);
