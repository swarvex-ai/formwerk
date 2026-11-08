// The sprites of the catalogue. A new sprite is one file in its category folder plus one line here.
import type { AnySprite } from "./define";
import { villager } from "./characters/villager";
import { slime } from "./creatures/slime";
import { potion } from "./items/potion";
import { coin } from "./items/coin";
import { gem } from "./items/gem";
import { key } from "./items/key";
import { sword } from "./items/sword";
import { shield } from "./items/shield";
import { life } from "./items/life";
import { bomb } from "./items/bomb";
import { bat } from "./creatures/bat";
import { ghost } from "./creatures/ghost";
import { spider } from "./creatures/spider";

export const SPRITES: AnySprite[] = [villager, slime, bat, ghost, spider, potion, coin, gem, key, sword, shield, life, bomb];
export const spriteById = (id: string) => SPRITES.find((s) => s.id === id);
