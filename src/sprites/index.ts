// The sprites of the catalogue. A new sprite is one file in its category folder plus its import and its entry here,
// each on a line of its own (never two on one line: parallel tasks then merge cleanly, see .gitattributes).
import type { AnySprite } from "./define";
import { villager } from "./characters/villager";
import { wizard } from "./characters/wizard";
import { knight } from "./characters/knight";
import { slime } from "./creatures/slime";
import { potion } from "./items/potion";
import { food } from "./items/food";
import { coin } from "./items/coin";
import { gem } from "./items/gem";
import { key } from "./items/key";
import { sword } from "./items/sword";
import { shield } from "./items/shield";
import { life } from "./items/life";
import { bomb } from "./items/bomb";
import { bat } from "./creatures/bat";
import { bird } from "./creatures/bird";
import { fish } from "./creatures/fish";
import { ghost } from "./creatures/ghost";
import { spider } from "./creatures/spider";
import { snake } from "./creatures/snake";
import { crab } from "./creatures/crab";
import { skeleton } from "./creatures/skeleton";
import { rat } from "./creatures/rat";
import { frog } from "./creatures/frog";
import { chicken } from "./creatures/chicken";

export const SPRITES: AnySprite[] = [
  villager,
  wizard,
  knight,
  slime,
  bat,
  bird,
  fish,
  ghost,
  spider,
  snake,
  crab,
  skeleton,
  rat,
  frog,
  chicken,
  potion,
  food,
  coin,
  gem,
  key,
  sword,
  shield,
  life,
  bomb,
];
export const spriteById = (id: string) => SPRITES.find((s) => s.id === id);
