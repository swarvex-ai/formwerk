// The surfaces of the catalogue. A new surface is one file in its category folder plus its import and its entry here,
// each on a line of its own (never two on one line: parallel tasks then merge cleanly, see .gitattributes).
import type { AnySurface } from "./define";
import { cobblestone } from "./stone/cobblestone";
import { planks } from "./wood/planks";
import { thatch } from "./wood/thatch";
import { bark } from "./wood/bark";
import { metalPlate } from "./metal/metal-plate";
import { bricks } from "./stone/bricks";
import { tiles } from "./stone/tiles";
import { shingles } from "./stone/shingles";
import { concrete } from "./stone/concrete";
import { plaster } from "./stone/plaster";
import { marble } from "./stone/marble";
import { parquet } from "./wood/parquet";
import { wicker } from "./wood/wicker";
import { corrugated } from "./metal/corrugated";
import { rust } from "./metal/rust";
import { copper } from "./metal/copper";
import { grass } from "./ground/grass";
import { sand } from "./ground/sand";
import { dirt } from "./ground/dirt";
import { snow } from "./ground/snow";
import { mud } from "./ground/mud";
import { flagstone } from "./stone/flagstone";
import { leaves } from "./ground/leaves";

export const SURFACES: AnySurface[] = [
  cobblestone,
  flagstone,
  bricks,
  tiles,
  shingles,
  concrete,
  plaster,
  marble,
  planks,
  thatch,
  bark,
  parquet,
  wicker,
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
];
export const surfaceById = (id: string) => SURFACES.find((s) => s.id === id);
