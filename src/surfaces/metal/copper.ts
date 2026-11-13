import { color, float, mix } from "three/tsl";
import { defineSurface } from "../define";
import { fbm, ramp, voronoi } from "../noise";

export const copper = defineSurface({
  id: "copper", category: "metal",
  title: { de: "Gehämmertes Kupfer", en: "Hammered copper" },
  description: {
    de: "Handgehämmertes Kupferblech für Töpfe, Kessel, Theken und Dächer: runde Hammerdellen mit Graten dazwischen, von blank poliert bis grünspanig. Eine Kachel ist 0,4 × 0,4 m.",
    en: "Hand-hammered copper sheet for pots, kettles, bar tops and roofs: round hammer dents with ridges between them, from bright polished to green with age. One tile is 0.4 × 0.4 m.",
  },
  params: {
    dents: { type: "choice", options: ["6", "8", "12", "16"], default: "8", label: { de: "Dellen", en: "Dents" },
      describe: { de: "Hammerdellen quer über die Kachel (0,4 m): 6 große Schläge wie auf einem Dach, 8 ein Kupfertopf, 16 feine Treibarbeit.", en: "Hammer dents across the tile (0.4 m): 6 big blows as on a roof, 8 a copper pot, 16 fine planishing." } },
    depth: { type: "number", min: 0.2, max: 1, step: 0.05, default: 0.6, label: { de: "Tiefe", en: "Depth" },
      describe: { de: "Wie tief die Dellen sind: 0,2 leicht planiertes Blech, 0,6 handgehämmert, 1 grob gehämmert.", en: "How deep the dents are: 0.2 a lightly planished sheet, 0.6 hand-hammered, 1 heavily hammered." } },
    polish: { type: "number", min: 0, max: 1, step: 0.05, default: 0.6, label: { de: "Politur", en: "Polish" },
      describe: { de: "Glanz des blanken Kupfers: 0 matt und stumpf, 0,6 gebrauchter Topf, 1 frisch polierter Kessel.", en: "Shine of the bare copper: 0 dull and matte, 0.6 a used pot, 1 a freshly polished kettle." } },
    patina: { type: "number", min: 0, max: 1, step: 0.05, default: 0.1, label: { de: "Patina", en: "Patina" },
      describe: { de: "Grünspan in blaugrünen Flecken, der sich zuerst in den Dellen sammelt: 0 keiner, 0,1 erster Anflug, 1 altes Kupferdach.", en: "Verdigris in blue-green patches that settle in the dents first: 0 none, 0.1 a first hint, 1 an old copper roof." } },
    colour: { type: "color", default: "#b8693a", label: { de: "Kupferfarbe", en: "Copper colour" },
      describe: { de: "Farbe des blanken Kupfers, zum Beispiel #b8693a frisches Kupfer, #8a4a2a dunkel angelaufen.", en: "Colour of the bare copper, for example #b8693a fresh copper, #8a4a2a darkly tarnished." } },
    patinaColour: { type: "color", default: "#5aa08a", label: { de: "Patinafarbe", en: "Patina colour" },
      describe: { de: "Farbe des Grünspans, zum Beispiel #5aa08a blaugrün, #6fae7a grünlicher.", en: "Colour of the verdigris, for example #5aa08a blue-green, #6fae7a greener." } },
  },
  presets: {
    pot: { label: { de: "Topf", en: "Pot" }, values: { dents: "8" } },
    roof: { label: { de: "Dach", en: "Roof" }, values: { patina: 0.85, polish: 0.1, dents: "6", depth: 0.3 } },
    "bar-top": { label: { de: "Thekenplatte", en: "Bar top" }, values: { polish: 0.9, patina: 0, depth: 0.35, dents: "12" } },
  },
  tile: 0.4, depth: 0.006,
  build(p, seed) {
    const n = Number(p.dents), kupfer = color(p.colour), gruen = color(p.patinaColour);
    return (q, res) => {
      // One hammer blow per cell; the lattice wraps with the tile
      const v = voronoi(q.mul(n), n, 0.7, seed).toVar();
      const schale = ramp(v.z, 0, 0.7).toVar(); // 0 at the centre of the dent, 1 at the ridge
      const fein = fbm(q, [24, 24], res, 0.55, seed + 5, 4).toVar();
      const height = schale.mul(0.35 * p.depth).add(0.55 - 0.35 * p.depth * 0.5).add(fein.mul(0.04)).clamp(0, 1).toVar();
      const fleck = fbm(q, [4, 4], res, 0.55, seed + 9, 5).toVar();
      const maske = p.patina <= 0 ? float(0)
        : ramp(fleck.add(float(1).sub(schale).mul(0.5)).add(fein.mul(0.1)), 0.75 - p.patina * 0.9 - 0.2, 0.75 - p.patina * 0.9 + 0.2).toVar();
      const blank = kupfer.mul(schale.sub(0.5).mul(0.35).add(1)).mul(fein.mul(0.15).add(1));
      return {
        height,
        color: mix(blank, gruen.mul(fein.mul(0.2).add(1)), maske),
        roughness: mix(float(0.6 - 0.45 * p.polish).add(fein.mul(0.04)), float(0.8), maske).clamp(0.05, 1),
        metalness: mix(float(0.9), float(0.1), maske),
      };
    };
  },
});
