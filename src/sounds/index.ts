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
import { babble } from "./voice/babble";
import { wind } from "./ambience/wind";
import { typing } from "./ui/typing";
import { page } from "./ui/page";
import { glass } from "./impact/glass";
import { clang } from "./impact/clang";
import { knock } from "./impact/knock";
import { woodBreak } from "./impact/wood-break";
import { splash } from "./movement/splash";
import { creak } from "./movement/creak";
import { doorSwing } from "./movement/door-swing";
import { magic } from "./effects/magic";
import { engine } from "./effects/engine";
import { heartbeat } from "./effects/heartbeat";
import { rain } from "./ambience/rain";
import { fire } from "./ambience/fire";
import { hum } from "./ambience/hum";
import { thunder } from "./ambience/thunder";
import { coins } from "./effects/coins";
import { nature } from "./ambience/nature";
import { stream } from "./ambience/stream";
import { drip } from "./ambience/drip";
import { saw } from "./effects/saw";
import { swordDraw } from "./effects/sword-draw";
import { pour } from "./effects/pour";
import { waves } from "./ambience/waves";
import { shipBell } from "./effects/ship-bell";

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
  woodBreak,
  footstep,
  hooves,
  jump,
  whoosh,
  splash,
  creak,
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
  babble,
  wind,
  rain,
  fire,
  hum,
  thunder,
  coins,
  nature,
  stream,
  drip,
  saw,
  swordDraw,
  pour,
  waves,
  shipBell,
];
export const soundById = (id: string) => SOUNDS.find((s) => s.id === id);
