// The sprites of the catalogue. A new sprite is one file in its category folder plus its import and its entry here,
// each on a line of its own (never two on one line: parallel tasks then merge cleanly, see .gitattributes).
import type { AnySprite } from "./define";
import { villager } from "./characters/villager";
import { wizard } from "./characters/wizard";
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
import { skeleton } from "./creatures/skeleton";

export const SPRITES: AnySprite[] = [
  villager,
  wizard,
  slime,
  bat,
  ghost,
  spider,
  skeleton,
  potion,
  coin,
  gem,
  key,
  sword,
  shield,
  life,
  bomb,
];
export const spriteById = (id: string) => SPRITES.find((s) => s.id === id);
