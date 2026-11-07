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
