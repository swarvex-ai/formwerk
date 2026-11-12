// Formwerk sounds as a library, without three.js: `import { hit, toWav } from "formwerk/sounds"`. Every sound is a
// function of its parameters (and a seed for variation) and returns finished samples: 48 kHz mono, −1 dBFS.
import type { Values } from "../core/params";
import { makeSound, type Sound } from "./define";
import { click as clickSound } from "./ui/click";
import { chime as chimeSound } from "./ui/chime";
import { hit as hitSound } from "./impact/hit";
import { explosion as explosionSound } from "./impact/explosion";
import { footstep as footstepSound } from "./movement/footstep";
import { jump as jumpSound } from "./movement/jump";
import { whoosh as whooshSound } from "./movement/whoosh";
import { pickup as pickupSound } from "./effects/pickup";
import { zap as zapSound } from "./effects/zap";
import { wind as windSound } from "./ambience/wind";
import { effort as effortSound } from "./voice/effort";
import { pain as painSound } from "./voice/pain";
import { creature as creatureSound } from "./voice/creature";
import { babble as babbleSound } from "./voice/babble";
import { pop as popSound } from "./ui/pop";
import { toggle as toggleSound } from "./ui/toggle";
import { buzz as buzzSound } from "./ui/buzz";
import { alert as alertSound } from "./ui/alert";
import { typing as typingSound } from "./ui/typing";
import { glass as glassSound } from "./impact/glass";
import { clang as clangSound } from "./impact/clang";
import { knock as knockSound } from "./impact/knock";
import { splash as splashSound } from "./movement/splash";
import { creak as creakSound } from "./movement/creak";
import { doorSwing as doorSwingSound } from "./movement/door-swing";
import { magic as magicSound } from "./effects/magic";
import { engine as engineSound } from "./effects/engine";
import { heartbeat as heartbeatSound } from "./effects/heartbeat";
import { rain as rainSound } from "./ambience/rain";
import { fire as fireSound } from "./ambience/fire";
import { hum as humSound } from "./ambience/hum";
import { thunder as thunderSound } from "./ambience/thunder";
import { coins as coinsSound } from "./effects/coins";
import { nature as natureSound } from "./ambience/nature";
import { stream as streamSound } from "./ambience/stream";
import { drip as dripSound } from "./ambience/drip";
import { saw as sawSound } from "./effects/saw";
import { swordDraw as swordDrawSound } from "./effects/sword-draw";

export { SOUNDS, soundById } from "./index";
export { makeSound, SOUND_CATEGORIES } from "./define";
export { RATE, PEAK, toWav, fromWav, metrics, spectrogram } from "../core/audio";

/** Samples into an AudioBuffer of your context (create it with `{ sampleRate: 48000 }`, or the browser resamples). */
export function toAudioBuffer(ctx: BaseAudioContext, samples: Float32Array<ArrayBuffer>): AudioBuffer {
  const b = ctx.createBuffer(1, samples.length, 48000);
  b.copyToChannel(samples, 0);
  return b;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Input<S extends Sound<any>> = Partial<Values<S["params"]>> & { preset?: Extract<keyof S["presets"], string> };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const klang = <S extends Sound<any>>(s: S) => (values: Input<S> = {}, seed = 1) => makeSound(s, values, seed).samples;

export const click = klang(clickSound);
export const chime = klang(chimeSound);
export const hit = klang(hitSound);
export const explosion = klang(explosionSound);
export const footstep = klang(footstepSound);
export const jump = klang(jumpSound);
export const whoosh = klang(whooshSound);
export const pickup = klang(pickupSound);
export const zap = klang(zapSound);
export const wind = klang(windSound);
export const effort = klang(effortSound);
export const pain = klang(painSound);
export const creature = klang(creatureSound);
export const babble = klang(babbleSound);
export const pop = klang(popSound);
export const toggle = klang(toggleSound);
export const buzz = klang(buzzSound);
export const alert = klang(alertSound);
export const typing = klang(typingSound);
export const glass = klang(glassSound);
export const clang = klang(clangSound);
export const knock = klang(knockSound);
export const splash = klang(splashSound);
export const creak = klang(creakSound);
export const doorSwing = klang(doorSwingSound);
export const magic = klang(magicSound);
export const engine = klang(engineSound);
export const heartbeat = klang(heartbeatSound);
export const rain = klang(rainSound);
export const fire = klang(fireSound);
export const hum = klang(humSound);
export const thunder = klang(thunderSound);
export const coins = klang(coinsSound);
export const nature = klang(natureSound);
export const stream = klang(streamSound);
export const drip = klang(dripSound);
export const saw = klang(sawSound);
export const swordDraw = klang(swordDrawSound);
