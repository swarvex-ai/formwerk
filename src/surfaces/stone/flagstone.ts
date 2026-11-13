import { color, float, mix, vec2 } from "three/tsl";
import { defineSurface } from "../define";
import { fbm, ramp, voronoi, wrap } from "../noise";

export const flagstone = defineSurface({
  id: "flagstone", category: "stone",
  title: { de: "Bruchsteinplatten", en: "Flagstones" },
  description: {
    de: "Große, flache, unregelmäßige Steinplatten in Mörtel verlegt, für Küchen- und Wirtshausböden, Gartenwege und Innenhöfe. Eine Kachel ist 1,2 × 1,2 m.",
    en: "Large, flat, irregular stone slabs laid in mortar, for kitchen and tavern floors, garden paths and courtyards. One tile is 1.2 × 1.2 m.",
  },
  params: {
    stones: { type: "choice", options: ["3", "4", "6"], default: "4", label: { de: "Plattenanzahl", en: "Slabs across" },
      describe: { de: "Wie viele Platten über die Kachel laufen: 3 sehr große Platten, 4 üblich, 6 kleinere Platten.", en: "How many slabs run across the tile: 3 very large slabs, 4 usual, 6 smaller slabs." } },
    joint: { type: "number", min: 0.15, max: 0.4, step: 0.01, default: 0.2, label: { de: "Fugenbreite", en: "Joint width" },
      describe: { de: "Breite der Mörtelfuge im Verhältnis zum Voronoi-Kantenabstand: 0,15 schmale Fugen, 0,2 üblich, 0,4 breite Fugen.", en: "Width of the mortar joint as a fraction of the voronoi edge distance range: 0.15 narrow joints, 0.2 usual, 0.4 wide joints." } },
    relief: { type: "number", min: 0, max: 1, step: 0.05, default: 0.4, label: { de: "Höhenversatz", en: "Relief" },
      describe: { de: "Wie stark die Platten kippen und sich in der Höhe unterscheiden: 0 eben verlegt, 0,4 üblich, 1 alter unebener Hof.", en: "How much the slabs tilt and differ in height: 0 a smooth laid floor, 0.4 usual, 1 an old uneven yard." } },
    wear: { type: "number", min: 0, max: 1, step: 0.05, default: 0.3, label: { de: "Abnutzung", en: "Wear" },
      describe: { de: "Feine Unebenheiten, Lochfraß und abgerundete Plattenkanten: 0 glatt behauen, 0,3 üblich, 1 stark verwittert.", en: "Fine pitting and rounded slab edges from fbm: 0 freshly dressed, 0.3 usual, 1 heavily weathered." } },
    colour: { type: "color", default: "#8a8478", label: { de: "Plattenfarbe", en: "Slab colour" },
      describe: { de: "Grundfarbe der Steinplatten, z. B. Grau für Granit oder Beige für Sandstein.", en: "Base colour of the stone slabs, e.g. grey for granite or beige for sandstone." } },
    mortarColour: { type: "color", default: "#6a645a", label: { de: "Mörtelfarbe", en: "Mortar colour" },
      describe: { de: "Farbe des Fugenmörtels zwischen den Platten.", en: "Colour of the mortar joint between the slabs." } },
    variation: { type: "number", min: 0, max: 1, step: 0.05, default: 0.35, label: { de: "Farbvariation", en: "Colour variation" },
      describe: { de: "Wie stark sich die Platten in der Helligkeit voneinander unterscheiden: 0 alle gleich, 1 deutliche Unterschiede.", en: "How much each slab's colour differs: 0 all alike, 1 distinct differences." } },
  },
  presets: {
    kitchen: { label: { de: "Küche", en: "Kitchen" }, values: { stones: "4", joint: 0.2, relief: 0.4, wear: 0.3 } },
    "garden-path": { label: { de: "Gartenweg", en: "Garden path" }, values: { stones: "3", joint: 0.35, relief: 0.6, mortarColour: "#4a5a32" } },
    courtyard: { label: { de: "Innenhof", en: "Courtyard" }, values: { stones: "6", relief: 0.8, wear: 0.6 } },
  },
  tile: 1.2, depth: 0.02,
  build(p, seed) {
    const n = Number(p.stones), stein = color(p.colour), moertel = color(p.mortarColour);
    return (q, res) => {
      // Wrap q*n so cells tile cleanly
      const pCoord = wrap(q.mul(n), vec2(n, n));
      const v = voronoi(pCoord, n, 0.8, seed).toVar();
      const rand = v.y;
      const rand2 = v.y.mul(7.13).fract();

      // Fine wear noise
      const fein = fbm(q, [24, 24], res, 0.55, seed + 30).toVar();
      const poren = fbm(q, [96, 96], res, 0.7, seed + 40).toVar();

      // Drop into the joint with ramp on edge distance (v.x)
      // Edge ramp over at least 0.15 (contract rule):
      const jointEdge = p.joint * 0.5;
      const kante = ramp(v.x.sub(fein.mul(0.02 * p.wear)), jointEdge, jointEdge + 0.16 + 0.04 * p.wear).toVar();

      // Per-cell tilt: slight slope from cell centre (v.z) and random direction
      const tilt = rand2.sub(0.5).mul(v.z).mul(0.12);

      // Slab height: flat slab top with per-cell height from cell/rand, tilt, and wear
      const slabHeight = float(0.85)
        .add(rand.sub(0.5).mul(0.2 * p.relief))
        .add(tilt.mul(p.relief))
        .add(fein.mul(0.04 * p.wear))
        .add(poren.mul(0.02 * p.wear));

      const jointHeight = float(0.2).add(poren.mul(0.03));
      const height = mix(jointHeight, slabHeight, kante).clamp(0, 1);

      // Colour variation per slab by cell (rand) and variation
      const slabColour = stein.mul(rand.sub(0.5).mul(p.variation * 0.6).add(1)).mul(fein.mul(0.15 * p.wear).add(1));
      const jointColour = moertel.mul(poren.mul(0.2).add(0.9));
      const col = mix(jointColour, slabColour, kante);

      // Roughness: 0.85 on slabs, 0.95 in joints
      const roughness = mix(float(0.95), float(0.85).add(poren.mul(0.05)), kante);

      return { height, color: col, roughness, metalness: float(0) };
    };
  },
});
