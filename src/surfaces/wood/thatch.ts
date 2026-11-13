import { cos, color, float, floor, fract, mix, vec2, vec3 } from "three/tsl";
import { defineSurface } from "../define";
import { cell, fbm, ramp, wrap1 } from "../noise";

export const thatch = defineSurface({
  id: "thatch", category: "wood",
  title: { de: "Strohdach", en: "Thatch" },
  description: {
    de: "Ein Dach aus Stroh oder Reet: Reihen von Bündeln, übereinander gelegt, mit feiner Halmstruktur und einer Stufe an jeder Unterkante. Für Hütten, Scheunen und Cottages. Eine Kachel ist 0,5 × 0,5 m.",
    en: "A straw or reed roof: rows of bundles laid over each other, with a fine strand grain and a step at the lower edge of each row. For huts, barns and cottages. One tile is 0.5 × 0.5 m.",
  },
  params: {
    courses: { type: "choice", options: ["3", "4", "6", "8"], default: "4", label: { de: "Reihen", en: "Courses" },
      describe: { de: "Wie viele Reihen Bündel auf eine Kachel (0,5 m) kommen: 3 grobes Scheunendach, 4 Strohdach, 8 feines Reet.", en: "How many rows of bundles fit on a tile (0.5 m): 3 coarse barn roof, 4 straw thatch, 8 fine reed." } },
    strands: { type: "choice", options: ["24", "32", "48", "64"], default: "32", label: { de: "Halme", en: "Strands" },
      describe: { de: "Wie viele feine Halme quer über die Kachel laufen: 24 grobes Stroh, 32 normal, 64 dichtes Reet.", en: "How many fine strands run across the tile: 24 coarse straw, 32 normal, 64 dense reed." } },
    overlap: { type: "number", min: 0.2, max: 0.6, step: 0.01, default: 0.35, label: { de: "Überlappung", en: "Overlap" },
      describe: { de: "Wie weit jede Reihe über die untere hängt, also wie tief die Stufe an der Unterkante ist: 0,2 flach, 0,35 Strohdach, 0,5 dicke Schichten.", en: "How much each row hangs over the one below, which sets the depth of the step at its lower edge: 0.2 flat, 0.35 straw thatch, 0.5 thick layers." } },
    wear: { type: "number", min: 0, max: 1, step: 0.05, default: 0.3, label: { de: "Verwitterung", en: "Wear" },
      describe: { de: "Flecken aus grauem, altem Stroh und etwas Moos: 0 frisch gedeckt, 0,3 einige Jahre, 0,85 alte Scheune.", en: "Patches of grey weathered straw and some moss: 0 freshly laid, 0.3 a few years, 0.85 an old barn." } },
    colour: { type: "color", default: "#c8a45a", label: { de: "Farbe", en: "Colour" },
      describe: { de: "Farbe des frischen Strohs: Goldgelb für Weizenstroh, Graubraun für Reet.", en: "Colour of fresh straw: golden for wheat straw, grey-brown for reed." } },
    oldColour: { type: "color", default: "#7a7060", label: { de: "Farbe, verwittert", en: "Weathered colour" },
      describe: { de: "Farbe des verwitterten Strohs: Silbergrau für altes Stroh, Dunkelbraun für nasses.", en: "Colour of weathered straw: silver grey for old straw, dark brown for wet." } },
  },
  presets: {
    straw: { label: { de: "Stroh", en: "Straw" }, values: { courses: "4", strands: "32", wear: 0.3 } },
    reed: { label: { de: "Reet", en: "Reed" }, values: { strands: "64", courses: "6", colour: "#a8905a" } },
    "old-barn": { label: { de: "Alte Scheune", en: "Old barn" }, values: { wear: 0.85, courses: "3", overlap: 0.5 } },
  },
  tile: 0.5, depth: 0.03,
  build(p, seed) {
    const courses = Number(p.courses), strands = Number(p.strands);
    const stroh = color(p.colour), alt = color(p.oldColour), moos = vec3(0.35, 0.42, 0.23);
    return (q, res) => {
      const y = q.y.mul(courses), reihe = floor(y), v = fract(y).toVar();
      // Each row shifts the strand ridges by its own phase so the grain does not line up
      const phase = cell(vec2(wrap1(reihe, courses), 0), seed);
      const rille = cos(q.x.mul(strands).add(phase).mul(Math.PI * 2)).mul(0.5).add(0.5).toVar();
      const fasern = fbm(q, [strands / 2, courses * 4], res, 0.6, seed + 1, 4).toVar();
      const grob = fbm(q, [4, 4], 256, 0.5, seed + 2, 4).toVar();
      // The row rises from under the row above to its lower edge; the next row starts low again
      const stufe = ramp(v, 0.03, 0.97).mul(p.overlap).mul(1.3);
      const height = float(0.1).add(stufe).add(rille.mul(0.08)).add(fasern.mul(0.08)).add(grob.mul(0.04)).clamp(0, 1);
      const alter = ramp(grob.add(fasern.mul(0.3)).add(p.wear * 1.1), 0.7, 1.3).mul(p.wear).toVar();
      const mooszone = ramp(fbm(q, [3, 3], 256, 0.5, seed + 3, 4).add(p.wear * 0.8), 0.95, 1.3).mul(p.wear).mul(0.6);
      const schatten = ramp(v, 0.03, 0.8).mul(0.45).add(0.55);
      const rinne = rille.mul(0.3).add(0.7);
      const frisch = stroh.mul(schatten).mul(rinne).mul(fasern.mul(0.3).add(0.85));
      const verwittert = alt.mul(schatten).mul(rinne).mul(fasern.mul(0.3).add(0.85));
      const col = mix(mix(frisch, verwittert, alter), moos.mul(schatten).mul(rinne), mooszone);
      const roughness = float(0.85).add(rille.mul(0.05)).add(alter.mul(0.05));
      return { height, color: col, roughness, metalness: float(0) };
    };
  },
});
