// The surfaces of the catalogue. A new surface is one file in its category folder plus its import and its entry here,
// each on a line of its own (never two on one line: parallel tasks then merge cleanly, see .gitattributes).
import type { AnySurface } from "./define";
import { cobblestone } from "./stone/cobblestone";
import { planks } from "./wood/planks";
import { thatch } from "./wood/thatch";
import { bark } from "./wood/bark";
import { metalPlate } from "./metal/metal-plate";
import { bricks } from "./stone/bricks";
import { ashlar } from "./stone/ashlar";
import { tiles } from "./stone/tiles";
import { shingles } from "./stone/shingles";
import { concrete } from "./stone/concrete";
import { plaster } from "./stone/plaster";
import { marble } from "./stone/marble";
import { parquet } from "./wood/parquet";
import { endGrain } from "./wood/end-grain";
import { wicker } from "./wood/wicker";
import { leather } from "./wood/leather";
import { corrugated } from "./metal/corrugated";
import { rust } from "./metal/rust";
import { copper } from "./metal/copper";
import { grass } from "./ground/grass";
import { sand } from "./ground/sand";
import { dirt } from "./ground/dirt";
import { snow } from "./ground/snow";
import { mud } from "./ground/mud";
import { flagstone } from "./stone/flagstone";
import { slate } from "./stone/slate";
import { leaves } from "./ground/leaves";
import { moss } from "./ground/moss";
import { ice } from "./ground/ice";
import { gravel } from "./ground/gravel";

export const SURFACES: AnySurface[] = [
  cobblestone,
  flagstone,
  slate,
  bricks,
  ashlar,
  tiles,
  shingles,
  concrete,
  plaster,
  marble,
  planks,
  thatch,
  bark,
  parquet,
  endGrain,
  wicker,
  leather,
  metalPlate,
  corrugated,
  rust,
  copper,
  grass,
  sand,
  dirt,
  snow,
  mud,
  leaves,
  moss,
  ice,
  gravel,
];
export const surfaceById = (id: string) => SURFACES.find((s) => s.id === id);
