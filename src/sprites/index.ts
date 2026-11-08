// The sprites of the catalogue. A new sprite is one file in its category folder plus one line here.
import type { AnySprite } from "./define";
import { villager } from "./characters/villager";
import { slime } from "./creatures/slime";
import { potion } from "./items/potion";

export const SPRITES: AnySprite[] = [villager, slime, potion];
export const spriteById = (id: string) => SPRITES.find((s) => s.id === id);
