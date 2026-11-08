// Formwerk sprites as a library, without three.js: `import { villager, makeSheet } from "formwerk/sprites"`. Every
// sprite is a function of its parameters and returns its sheet: RGBA pixels, the frame rectangles, and helpers for
// Godot's SpriteFrames and a JSON for other engines.
import type { Values } from "../core/params";
import { makeSheet, type Sprite } from "./define";
import { villager as s1 } from "./characters/villager";
import { slime as s2 } from "./creatures/slime";
import { potion as s3 } from "./items/potion";
import { coin as s4 } from "./items/coin";
import { gem as s5 } from "./items/gem";
import { key as s6 } from "./items/key";
import { sword as s7 } from "./items/sword";
import { shield as s8 } from "./items/shield";
import { life as s9 } from "./items/life";
import { bomb as s10 } from "./items/bomb";
import { bat as s11 } from "./creatures/bat";
import { ghost as s12 } from "./creatures/ghost";
import { spider as s13 } from "./creatures/spider";

export { SPRITES, spriteById } from "./index";
export { makeSheet, sheetJson, godotSpriteFrames, animationName, SPRITE_CATEGORIES } from "./define";
export { Pixels, ramp, hex } from "../core/pixels";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Input<S extends Sprite<any>> = Partial<Values<S["params"]>> & { preset?: Extract<keyof S["presets"], string> };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const bogen = <S extends Sprite<any>>(s: S) => (values: Input<S> = {}, seed = 1) => makeSheet(s, values, seed);

export const villager = bogen(s1), slime = bogen(s2), potion = bogen(s3);
export const coin = bogen(s4), gem = bogen(s5), key = bogen(s6), sword = bogen(s7), shield = bogen(s8), life = bogen(s9), bomb = bogen(s10), bat = bogen(s11), ghost = bogen(s12), spider = bogen(s13);
