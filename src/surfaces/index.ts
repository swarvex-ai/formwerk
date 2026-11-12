// The surfaces of the catalogue. A new surface is one file in its category folder plus its import and its entry here,
// each on a line of its own (never two on one line: parallel tasks then merge cleanly, see .gitattributes).
import type { AnySurface } from "./define";
import { cobblestone } from "./stone/cobblestone";
import { planks } from "./wood/planks";
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
import { grass } from "./ground/grass";
import { sand } from "./ground/sand";
import { dirt } from "./ground/dirt";
import { snow } from "./ground/snow";
import { mud } from "./ground/mud";

export const SURFACES: AnySurface[] = [
  cobblestone,
  bricks,
  tiles,
  shingles,
  concrete,
  plaster,
  marble,
  planks,
  parquet,
  wicker,
  metalPlate,
  corrugated,
  rust,
  grass,
  sand,
  dirt,
  snow,
  mud,
];
export const surfaceById = (id: string) => SURFACES.find((s) => s.id === id);
