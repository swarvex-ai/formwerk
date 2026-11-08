// The surfaces of the catalogue. A new surface is one file in its category folder plus one line here.
import type { AnySurface } from "./define";
import { cobblestone } from "./stone/cobblestone";
import { planks } from "./wood/planks";
import { metalPlate } from "./metal/metal-plate";

export const SURFACES: AnySurface[] = [cobblestone, planks, metalPlate];
export const surfaceById = (id: string) => SURFACES.find((s) => s.id === id);
