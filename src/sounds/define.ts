// A sound: id, category, texts, its parameter schema, presets, whether it loops, its longest length, and a build
// function that turns valid values (and a seed for variation) into samples at 48 kHz mono (src/core/audio.ts).
// The finish is the same for every sound and not the build's job: DC out, edges faded (one-shots) or the seam folded
// (loops), level to −1 dBFS. Pure TypeScript: no Web Audio, no three.js.
import { centre, foldLoop, fadeEdges, LOOP_TAIL, metrics, normalize, RATE, removeDC, type Samples } from "../core/audio";
import { withPreset, type Presets, type Schema, type Text, type Values } from "../core/params";

export type SoundCategory = "ui" | "impact" | "movement" | "effects" | "voice" | "ambience";
export const SOUND_CATEGORIES: SoundCategory[] = ["ui", "impact", "movement", "effects", "voice", "ambience"];

export type Sound<S extends Schema = Schema> = {
  id: string; category: SoundCategory; title: Text; description: Text; params: S;
  presets: Presets<S>;
  /** A loop (ambience): the build renders its length plus LOOP_TAIL seconds, the finish folds the tail into the start. */
  loop: boolean;
  /** The longest the finished sound gets at any values, in seconds (its budget). */
  maxSeconds: number;
  build(p: Values<S>, seed: number): Samples;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnySound = Sound<any>;
export const defineSound = <const S extends Schema>(s: Sound<S>): Sound<S> => s;

export type SoundInfo = { sound: string; values: Record<string, unknown>; seed: number; loop: boolean; rate: number };
export type Made = { samples: Samples; info: SoundInfo };

/** Builds a sound from (partial, unchecked) values, a preset name under `preset`, and a seed, and finishes it. */
export function makeSound(sound: AnySound, input: Record<string, unknown> = {}, seed = 1): Made {
  const values = withPreset(sound.params, sound.presets, input);
  let s = removeDC(sound.build(values, seed));
  s = sound.loop ? foldLoop(s, LOOP_TAIL) : centre(fadeEdges(s));
  normalize(s);
  return { samples: s, info: { sound: sound.id, values, seed, loop: sound.loop, rate: RATE } };
}

export { metrics };
