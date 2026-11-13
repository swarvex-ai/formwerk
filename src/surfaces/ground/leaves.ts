import { color, dot, float, floor, fract, max, mix, sqrt, vec2 } from "three/tsl";
import { defineSurface } from "../define";
import { cell, fbm, ramp, voronoi, wrap } from "../noise";
import type { F } from "../noise";

export const leaves = defineSurface({
  id: "leaves", category: "ground",
  title: { de: "Laub", en: "Leaf litter" },
  description: {
    de: "Fallenlaub auf dunkler Erde: zwei Lagen übereinander in Herbstfarben von Grün über Orange bis Braun, die oberen Blätter mit ausgefransten Umrissen, darunter ovale, einzelne fehlen, so dass Erde durchscheint. Eine Kachel ist 1 × 1 m.",
    en: "Fallen leaves on dark soil: two layers over each other in autumn colours from green over orange to brown, the upper ones with frayed outlines, oval leaves underneath, single ones missing so the soil shows through. One tile is 1 × 1 m.",
  },
  params: {
    size: { type: "choice", options: ["6", "9", "14"], default: "9",
      labels: { "6": { de: "große Blätter", en: "large leaves" }, "9": { de: "gewöhnliche Blätter", en: "usual leaves" }, "14": { de: "kleine Blätter", en: "small leaves" } },
      label: { de: "Blätter pro Meter", en: "Leaves per metre" },
      describe: { de: "Wie viele Blätter über eine Kachel von einem Meter liegen: 6 große Ahornblätter, 9 übliche Buchen- und Eichenblätter, 14 kleines Laub.", en: "How many leaves lie across a tile of one metre: 6 large maple leaves, 9 usual beech and oak leaves, 14 small litter." } },
    cover: { type: "number", min: 0.3, max: 1, step: 0.05, default: 0.75, label: { de: "Deckung", en: "Cover" },
      describe: { de: "Wie viel Erde die Blätter verdecken: 0,3 dünner Laubrechen nach dem Sturm, 0,75 ein herbstlicher Weg, 1 ein geschlossener Teppich.", en: "How much of the soil the leaves hide: 0.3 a thin drift after a storm, 0.75 an autumn path, 1 a closed carpet." } },
    season: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Jahreszeit", en: "Season" },
      describe: { de: "Farbe der Blätter: 0 grün-gelb direkt nach dem Fall, 0,5 oranges Herbstlaub, 1 braunes, trockenes Laub vom späten November.", en: "Colour of the leaves: 0 green-yellow just fallen, 0.5 orange autumn leaves, 1 brown and dry from late November." } },
    variation: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Blattvielfalt", en: "Leaf variation" },
      describe: { de: "Wie verschieden einzelne Blätter gefärbt sind: 0 ein Teppich aus einem Ton, 0,5 ein Wald wie üblich, 1 grüne neben ganz braunen Blättern.", en: "How much single leaves differ in colour: 0 a carpet of one tone, 0.5 a forest as usual, 1 green leaves beside fully brown ones." } },
    soilColour: { type: "color", default: "#3a2c20", label: { de: "Erdfarbe", en: "Soil colour" },
      describe: { de: "Farbe des Bodens zwischen den Blättern: Dunkle Walderde #3a2c20, grauer Weg #4a4640, feuchte Erde #2b2018.", en: "Colour of the ground between the leaves: dark forest soil #3a2c20, grey path #4a4640, wet earth #2b2018." } },
  },
  presets: {
    autumn: { label: { de: "Herbst", en: "Autumn" }, values: { season: 0.5, cover: 0.75 } },
    "late-autumn": { label: { de: "Spätherbst", en: "Late autumn" }, values: { season: 0.9, cover: 0.95 } },
    early: { label: { de: "Früher Laubfall", en: "Early fall" }, values: { season: 0.15, cover: 0.4 } },
  },
  tile: 1, depth: 0.015,
  build(p, seed) {
    const n = Number(p.size), erde = color(p.soilColour), raster = vec2(n, n);
    const gelb = color("#9a9a30"), orange = color("#c0602a"), braun = color("#6a4a2a");
    // How far a leaf reaches into its cell: the more cover, the closer to the cell border
    const lo = 0.09 - p.cover * 0.05;
    // The mood of one leaf: the three stops by season, shifted by the cell's random number, 15 % darker to its edge
    const stimmung = (rand: F) => float(p.season).add(rand.sub(0.5).mul(p.variation * 1.2)).clamp(0, 1);
    const laub = (ton: F, kante: F, fein: F) => mix(mix(gelb, orange, ramp(ton, 0, 0.5)), braun, ramp(ton, 0.5, 1))
      .mul(float(0.85).add(kante.mul(0.15)))
      .mul(fein.mul(0.1).add(1));
    const halde = (rand: F) => ramp(rand, float(1).sub(p.cover), float(1.02).sub(p.cover));
    return (q, res) => {
      // The uneven outline of the leaves: one fbm warp for both layers, tiling with the cells
      const warp = vec2(fbm(q, [n, n], 64, 0.5, seed + 10, 2), fbm(q, [n, n], 64, 0.5, seed + 20, 2)).mul(0.2);
      const krume = fbm(q, [42, 42], res, 0.6, seed + 50, 3).toVar();
      const lage = fbm(q, [4, 4], 256, 0.55, seed + 60, 3).toVar();
      // Upper layer: warped voronoi cells, the wide ramp on their edge distance is the leaf
      const a = voronoi(q.mul(n).add(warp), n, 0.9, seed).toVar();
      const blattA = ramp(a.x, lo, lo + 0.16).mul(halde(a.y)).toVar();
      // Lower layer half a cell on, so the leaves lie over each other. Its leaves are stretched, turned ellipses of
      // their own lattice instead of a second voronoi: the normal map samples the height five times, and ten voronoi
      // calls lose the WebGL device in the headless bake
      const z = q.mul(n).sub(warp).add(0.5).toVar();
      const zelle = wrap(floor(z), raster).toVar(), f = fract(z).toVar();
      const mittig = vec2(cell(zelle, seed + 7), cell(zelle, seed + 8)).mul(0.26).add(0.37).toVar();
      const dreh = cell(zelle, seed + 9), groesse = dreh.mul(7.13).fract();
      const laenge = mix(vec2(0.56, 0.42), vec2(0.42, 0.56), dreh.step(0.5)).mul(groesse.mul(0.22).add(0.86)).toVar();
      const ab = f.sub(mittig).div(laenge).toVar();
      const abst = sqrt(dot(ab, ab).add(0.002)).toVar();
      const tonB = cell(zelle, seed + 13);
      const blattB = ramp(float(1).sub(abst), 0, 0.3).mul(halde(tonB)).toVar();
      const boden = erde.mul(krume.mul(0.22).add(lage.mul(0.12)).add(1));
      let col = mix(boden, laub(stimmung(tonB), ramp(float(1).sub(abst), 0, 0.9), krume), blattB);
      col = mix(col, laub(stimmung(a.y), ramp(a.x, lo, lo + 0.45), krume), blattA);
      // Soil below, the lower leaves half up, the upper leaves over both; every leaf domes towards its edges
      const height = max(float(0.08).add(krume.mul(0.06)),
        blattB.mul(groesse.mul(0.06).add(0.44).sub(abst.clamp(0, 1).mul(0.1))))
        .max(blattA.mul(a.y.mul(0.06).add(0.76).sub(a.z.clamp(0, 1).mul(0.1))))
        .clamp(0, 1);
      const roughness = mix(float(0.95), float(0.7), blattA.max(blattB)).add(krume.mul(0.03)).clamp(0.04, 1);
      return { height, color: col, roughness, metalness: float(0) };
    };
  },
});
