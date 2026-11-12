import { abs, color, float, mix } from "three/tsl";
import { defineSurface } from "../define";
import { fbm, ramp, wrap1 } from "../noise";

export const mud = defineSurface({
  id: "mud", category: "ground",
  title: { de: "Schlamm", en: "Mud" },
  description: {
    de: "Nasser Schlamm mit flachen, glänzenden Pfützen, Wagenrinnen und Erdschollen: Feldwege nach dem Regen, Sümpfe und Bauernhöfe. Eine Kachel ist 2 × 2 m.",
    en: "Wet mud with flat, glossy puddles, cart ruts and clods: field paths after rain, swamps and farmyards. One tile is 2 × 2 m.",
  },
  params: {
    wetness: { type: "number", min: 0, max: 1, step: 0.05, default: 0.55, label: { de: "Nässe", en: "Wetness" },
      describe: { de: "Anteil glänzender Pfützen: 0 keine, 0,55 ein Weg nach dem Regen, 1 fast überflutet.", en: "How much of the tile is glossy puddle: 0 none, 0.55 a path after rain, 1 almost flooded." } },
    puddleSize: { type: "integer", min: 1, max: 6, default: 3, label: { de: "Pfützengröße", en: "Puddle size" },
      describe: { de: "Pfützen über die Kachel: 1 eine große, 3 üblich, 6 viele kleine.", en: "Puddles across a tile: 1 one large, 3 usual, 6 many small." } },
    ruts: { type: "number", min: 0, max: 1, step: 0.05, default: 0.15, label: { de: "Wagenspuren", en: "Ruts" },
      describe: { de: "Tiefe zweier Radspuren in Fahrtrichtung: 0 keine, 0,4 ein Feldweg, 1 tiefe Wagenrinnen.", en: "Depth of two wheel ruts along the tile: 0 none, 0.4 a farm track, 1 deep cart ruts." } },
    clods: { type: "number", min: 0, max: 1, step: 0.05, default: 0.5, label: { de: "Schollen", en: "Clods" },
      describe: { de: "Welligkeit der trockenen Flächen: 0 glatt, 0,5 frisch gegrubbert, 1 grob und klumpig.", en: "How lumpy the dry areas are: 0 smooth, 0.5 freshly dug, 1 rough and cloddy." } },
    color: { type: "color", default: "#5a4430", label: { de: "Farbe", en: "Colour" },
      describe: { de: "Brauner Schlamm #5a4430, grauer Lehm #6a645a, rötliches Moor #5e3a28.", en: "Brown mud #5a4430, grey clay #6a645a, reddish fen #5e3a28." } },
    waterColour: { type: "color", default: "#3b3326", label: { de: "Wasserfarbe", en: "Water colour" },
      describe: { de: "Farbe der Pfützen: trübes Braun #3b3326, dunkles Moorwasser #2a2a1e, grauer Himmelsspiegel #5a6068.", en: "Colour of the puddles: muddy brown #3b3326, dark fen water #2a2a1e, grey sky reflection #5a6068." } },
  },
  presets: {
    puddles: { label: { de: "Pfützen", en: "Puddles" }, values: { wetness: 0.55 } },
    swamp: { label: { de: "Sumpf", en: "Swamp" }, values: { wetness: 0.8, puddleSize: 2, color: "#3f3f2a" } },
    "cart-track": { label: { de: "Wagenspur", en: "Cart track" }, values: { ruts: 0.8, wetness: 0.35 } },
  },
  tile: 2, depth: 0.04,
  build(p, seed) {
    const schlamm = color(p.color), wasser = color(p.waterColour);
    return (q, res) => {
      // Low areas decide where water stands, clods make the dry ground lumpy, fine noise is the grain of the mud
      const tief = fbm(q, [p.puddleSize, p.puddleSize], 256, 0.55, seed + 1, 5).toVar();
      const scholle = fbm(q, [28, 28], res, 0.6, seed + 2).toVar();
      const fein = fbm(q, [96, 96], res, 0.65, seed + 3).toVar();
      // Two ruts along y: a smooth periodic dip in x, so the same at x = 0 and x = 1 and the tile joins
      const rinne = (c: number) => float(1).sub(ramp(abs(wrap1(q.x.sub(c), 1)), 0, 0.085));
      const spuren = rinne(0.25).add(rinne(0.75)).mul(p.ruts * 0.5).toVar();
      const ground = float(0.5).add(tief.mul(0.3)).add(scholle.mul(0.07 + 0.13 * p.clods)).add(fein.mul(0.02)).sub(spuren.mul(0.4)).clamp(0, 1);
      // The water level rises with wetness; below it the low areas fill flat and turn glossy (wetness 0 stays dry)
      const level = float(p.wetness).mul(0.42).add(0.22);
      const flut = ramp(ground, level.add(0.008), level.sub(0.004)).mul(ramp(float(p.wetness), 0, 0.12)).toVar();
      const feucht = ramp(ground, level.add(0.15), level).mul(float(p.wetness).mul(1.5).clamp(0, 1)).toVar();
      const ton = schlamm.mul(fein.mul(0.16).add(scholle.mul(0.1)).add(tief.mul(0.08)).add(1)).mul(float(1).sub(spuren.mul(0.35)));
      const col = mix(ton.mul(float(1).sub(feucht.mul(0.4))), wasser.mul(fein.mul(0.06).add(0.92)), flut);
      const height = mix(ground, level, flut).clamp(0, 1);
      const roughness = mix(mix(float(0.92).add(scholle.mul(0.05)), float(0.45), feucht), float(0.05), flut);
      return { height, color: col, roughness: roughness.clamp(0.05, 1), metalness: float(0) };
    };
  },
});
