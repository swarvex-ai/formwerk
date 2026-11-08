// Formwerk sprites as a library, without three.js: `import { villager, makeSheet } from "formwerk/sprites"`. Every
// sprite is a function of its parameters and returns its sheet: RGBA pixels, the frame rectangles, and helpers for
// Godot's SpriteFrames and a JSON for other engines.
import type { Values } from "../core/params";
import { makeSheet, type Sprite } from "./define";
import { villager as s1 } from "./characters/villager";
import { slime as s2 } from "./creatures/slime";
import { potion as s3 } from "./items/potion";

export { SPRITES, spriteById } from "./index";
export { makeSheet, sheetJson, godotSpriteFrames, animationName, SPRITE_CATEGORIES } from "./define";
export { Pixels, ramp, hex } from "../core/pixels";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Input<S extends Sprite<any>> = Partial<Values<S["params"]>> & { preset?: Extract<keyof S["presets"], string> };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const bogen = <S extends Sprite<any>>(s: S) => (values: Input<S> = {}, seed = 1) => makeSheet(s, values, seed);

export const villager = bogen(s1), slime = bogen(s2), potion = bogen(s3);
