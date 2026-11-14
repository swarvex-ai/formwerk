// Collections: named groups of models for the gallery's filter. Ids that are not in the catalogue yet (a coffin, a
// scarecrow on its way) are skipped when drawing, not removed here.
import type { Text } from "../core/params";

export const COLLECTIONS: { id: string; label: Text; ids: string[] }[] = [
  { id: "camp", label: { de: "Lager", en: "Camp" }, ids: ["tent", "campfire", "log-pile", "cauldron", "lantern", "torch", "crate", "barrel", "chest"] },
  { id: "village", label: { de: "Dorf", en: "Village" }, ids: ["well", "market-stall", "cart", "signpost", "mailbox", "lamp-post", "fence", "bench", "hay-bale", "trough", "door", "window"] },
  { id: "harbour", label: { de: "Hafen", en: "Harbour" }, ids: ["pier", "buoy", "anchor", "boat", "barrel", "crate"] },
  { id: "farm", label: { de: "Hof", en: "Farm" }, ids: ["hay-bale", "trough", "fence", "wheelbarrow", "beehive", "bucket", "cart", "scarecrow"] },
  { id: "tavern", label: { de: "Schenke", en: "Tavern" }, ids: ["table", "chair", "bench", "barrel", "tankard", "candlestick", "fireplace"] },
  { id: "castle", label: { de: "Burg", en: "Castle" }, ids: ["throne", "battlement", "banner", "door", "column", "stairs", "torch", "chest", "anvil"] },
  { id: "graveyard", label: { de: "Friedhof", en: "Graveyard" }, ids: ["gravestone", "coffin", "lantern", "fence", "tree"] },
  { id: "forest", label: { de: "Wald", en: "Forest" }, ids: ["tree", "stump", "fern", "mushrooms", "bush", "rock", "log-pile", "reeds"] },
  { id: "home", label: { de: "Wohnung und Büro", en: "Home and office" }, ids: ["desk", "chair", "sofa", "wardrobe", "bed", "shelf", "table", "books", "vase", "server-rack"] },
  { id: "workshop", label: { de: "Werkstatt", en: "Workshop" }, ids: ["workbench", "anvil", "ladder", "bucket", "crate", "wheelbarrow", "mine-cart"] },
];

/** Models rebuilt in the realistic look (stage 2 and 3); empty for now. */
export const REALISTIC: string[] = [];
