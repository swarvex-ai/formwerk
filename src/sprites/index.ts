// The sprites of the catalogue. A new sprite is one file in its category folder plus its import and its entry here,
// each on a line of its own (never two on one line: parallel tasks then merge cleanly, see .gitattributes).
import type { AnySprite } from "./define";
import { villager } from "./characters/villager";
import { wizard } from "./characters/wizard";
import { knight } from "./characters/knight";
import { slime } from "./creatures/slime";
import { potion } from "./items/potion";
import { food } from "./items/food";
import { drinks } from "./items/drinks";
import { coin } from "./items/coin";
import { gem } from "./items/gem";
import { crown } from "./items/crown";
import { scroll } from "./items/scroll";
import { key } from "./items/key";
import { chest } from "./items/chest";
import { sword } from "./items/sword";
import { shield } from "./items/shield";
import { life } from "./items/life";
import { bomb } from "./items/bomb";
import { tools } from "./items/tools";
import { torch } from "./items/torch";
import { spikes } from "./items/spikes";
import { lever } from "./items/lever";
import { pot } from "./items/pot";
import { bee } from "./creatures/bee";
import { bat } from "./creatures/bat";
import { bird } from "./creatures/bird";
import { fish } from "./creatures/fish";
import { ghost } from "./creatures/ghost";
import { spider } from "./creatures/spider";
import { snake } from "./creatures/snake";
import { crab } from "./creatures/crab";
import { skeleton } from "./creatures/skeleton";
import { rat } from "./creatures/rat";
import { mole } from "./creatures/mole";
import { frog } from "./creatures/frog";
import { chicken } from "./creatures/chicken";
import { pig } from "./creatures/pig";
import { cat } from "./creatures/cat";
import { hare } from "./creatures/hare";
import { owl } from "./creatures/owl";
import { wolf } from "./creatures/wolf";
import { deer } from "./creatures/deer";
import { duck } from "./creatures/duck";
import { snail } from "./creatures/snail";
import { moth } from "./creatures/moth";

export const SPRITES: AnySprite[] = [
  villager,
  wizard,
  knight,
  slime,
  bee,
  bat,
  bird,
  fish,
  ghost,
  spider,
  snake,
  crab,
  skeleton,
  rat,
  mole,
  frog,
  chicken,
  pig,
  cat,
  hare,
  owl,
  wolf,
  deer,
  duck,
  snail,
  moth,
  potion,
  food,
  drinks,
  coin,
  gem,
  crown,
  scroll,
  key,
  chest,
  sword,
  shield,
  life,
  bomb,
  tools,
  torch,
  spikes,
  lever,
  pot,
];
export const spriteById = (id: string) => SPRITES.find((s) => s.id === id);
