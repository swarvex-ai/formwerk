// The sounds of the catalogue. A new sound is one file in its category folder plus one line here.
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
import { jump } from "./movement/jump";
import { whoosh } from "./movement/whoosh";
import { pickup } from "./effects/pickup";
import { zap } from "./effects/zap";
import { effort } from "./voice/effort";
import { pain } from "./voice/pain";
import { creature } from "./voice/creature";
import { babble } from "./voice/babble";
import { wind } from "./ambience/wind";

export const SOUNDS: AnySound[] = [click, chime, pop, toggle, buzz, alert, hit, explosion, footstep, jump, whoosh, pickup, zap, effort, pain, creature, babble, wind];
export const soundById = (id: string) => SOUNDS.find((s) => s.id === id);
