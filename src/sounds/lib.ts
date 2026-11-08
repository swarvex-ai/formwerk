// Formwerk sounds as a library, without three.js: `import { hit, toWav } from "formwerk/sounds"`. Every sound is a
// function of its parameters (and a seed for variation) and returns finished samples: 48 kHz mono, −1 dBFS.
import type { Values } from "../core/params";
import { makeSound, type Sound } from "./define";
import { click as s1 } from "./ui/click";
import { chime as s2 } from "./ui/chime";
import { hit as s3 } from "./impact/hit";
import { explosion as s4 } from "./impact/explosion";
import { footstep as s5 } from "./movement/footstep";
import { jump as s6 } from "./movement/jump";
import { whoosh as s7 } from "./movement/whoosh";
import { pickup as s8 } from "./effects/pickup";
import { zap as s9 } from "./effects/zap";
import { wind as s10 } from "./ambience/wind";
import { effort as s11 } from "./voice/effort";
import { pain as s12 } from "./voice/pain";
import { creature as s13 } from "./voice/creature";
import { babble as s14 } from "./voice/babble";
import { pop as s15 } from "./ui/pop";
import { toggle as s16 } from "./ui/toggle";
import { buzz as s17 } from "./ui/buzz";
import { alert as s18 } from "./ui/alert";
import { typing as s19 } from "./ui/typing";
import { glass as s20 } from "./impact/glass";
import { clang as s21 } from "./impact/clang";
import { knock as s22 } from "./impact/knock";
import { splash as s23 } from "./movement/splash";
import { creak as s24 } from "./movement/creak";
import { magic as s25 } from "./effects/magic";
import { engine as s26 } from "./effects/engine";
import { heartbeat as s27 } from "./effects/heartbeat";
import { rain as s28 } from "./ambience/rain";
import { fire as s29 } from "./ambience/fire";
import { hum as s30 } from "./ambience/hum";
import { thunder as s31 } from "./ambience/thunder";

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

export const click = klang(s1), chime = klang(s2), hit = klang(s3), explosion = klang(s4), footstep = klang(s5);
export const jump = klang(s6), whoosh = klang(s7), pickup = klang(s8), zap = klang(s9), wind = klang(s10);
export const effort = klang(s11), pain = klang(s12), creature = klang(s13), babble = klang(s14);
export const pop = klang(s15), toggle = klang(s16), buzz = klang(s17), alert = klang(s18);
export const typing = klang(s19), glass = klang(s20), clang = klang(s21), knock = klang(s22), splash = klang(s23), creak = klang(s24);
export const magic = klang(s25), engine = klang(s26), heartbeat = klang(s27), rain = klang(s28), fire = klang(s29), hum = klang(s30), thunder = klang(s31);
