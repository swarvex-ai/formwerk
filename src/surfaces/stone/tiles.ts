import { abs, color, float, floor, fract, max, min, mix, vec2 } from "three/tsl";
import { defineSurface } from "../define";
import { cell, fbm, ramp, wrap } from "../noise";

export const tiles = defineSurface({
  id: "tiles", category: "stone",
  title: { de: "Fliesen", en: "Tiles" },
  description: {
    de: "Keramikfliesen mit Fugen für Bad, Küche und Böden: einfarbig, im Schachbrett oder versetzt, glasiert oder matt. Eine Kachel ist 1 × 1 m.",
    en: "Ceramic tiles with grout for bathrooms, kitchens and floors: plain, chequered or offset, glazed or matt. One tile is 1 × 1 m.",
  },
  params: {
    count: { type: "integer", min: 2, max: 10, default: 5, label: { de: "Fliesen pro Meter", en: "Tiles per metre" },
      describe: { de: "Fliesen nebeneinander auf einem Meter: 3 große Bodenfliesen (33 cm), 5 übliche (20 cm), 10 kleine Wandfliesen (10 cm).", en: "Tiles side by side in a metre: 3 large floor tiles (33 cm), 5 usual (20 cm), 10 small wall tiles (10 cm)." } },
    grout: { type: "number", min: 0.001, max: 0.01, step: 0.0005, default: 0.003, unit: "m", label: { de: "Fuge", en: "Grout" },
      describe: { de: "Breite der Fuge: 0,002 m fein, 0,003 m üblich, 0,008 m breit wie bei Terrakotta.", en: "Width of the grout: 0.002 m fine, 0.003 m usual, 0.008 m wide like terracotta." } },
    pattern: { type: "choice", options: ["plain", "checker", "offset"], default: "plain", label: { de: "Muster", en: "Pattern" },
      labels: { plain: { de: "einfarbig", en: "plain" }, checker: { de: "Schachbrett", en: "chequered" }, offset: { de: "versetzt", en: "offset" } },
      describe: { de: "Alle gleich, im Schachbrett aus zwei Farben, oder jede Reihe um eine halbe Fliese versetzt wie bei Metrofliesen.", en: "All alike, chequered in two colours, or every row offset by half a tile like metro tiles." } },
    glaze: { type: "number", min: 0, max: 1, step: 0.05, default: 0.7, label: { de: "Glasur", en: "Glaze" },
      describe: { de: "Wie glänzend: 0 matt wie Terrakotta, 0,7 glasiert, 1 spiegelnd.", en: "How glossy: 0 matt like terracotta, 0.7 glazed, 1 mirror-like." } },
    color: { type: "color", default: "#e9e6df", label: { de: "Farbe", en: "Colour" },
      describe: { de: "Farbe der Fliesen.", en: "Colour of the tiles." } },
    color2: { type: "color", default: "#2f3a45", label: { de: "Zweite Farbe", en: "Second colour" },
      describe: { de: "Farbe der dunklen Felder im Schachbrett.", en: "Colour of the dark squares in the chequered pattern." } },
    groutColor: { type: "color", default: "#a8a49b", label: { de: "Fugenfarbe", en: "Grout colour" },
      describe: { de: "Farbe der Fugen.", en: "Colour of the grout." } },
  },
  presets: {
    bathroom: { label: { de: "Bad", en: "Bathroom" }, values: { count: 7, color: "#e9e6df", glaze: 0.85 } },
    "chequered-floor": { label: { de: "Schachbrettboden", en: "Chequered floor" }, values: { count: 4, pattern: "checker", color: "#ece8de", color2: "#2a2a2a" } },
    terracotta: { label: { de: "Terrakotta", en: "Terracotta" }, values: { count: 3, grout: 0.008, glaze: 0.05, color: "#b5603b", groutColor: "#cbbfa8" } },
    metro: { label: { de: "Metrofliesen", en: "Metro tiles" }, values: { count: 6, pattern: "offset", color: "#f2f2ee", glaze: 0.9 } },
  },
  tile: 1, depth: 0.006,
  build(p, seed) {
    const n = p.count, a = color(p.color), b = color(p.color2), fuge = color(p.groutColor);
    // Offset tiles are twice as wide as tall (metro), so the rows still fit the tile
    const nx = p.pattern === "offset" ? Math.max(1, Math.round(n / 2)) : n, ny = p.pattern === "offset" ? n + (n % 2) : n;
    return (q, res) => {
      const reihe = floor(q.y.mul(ny)).toVar(), versatz = p.pattern === "offset" ? fract(reihe.mul(0.5)) : float(0);
      const z = vec2(q.x.mul(nx).add(versatz), q.y.mul(ny)).toVar(), f = fract(z).toVar(), c = wrap(floor(z), vec2(nx, ny)).toVar();
      const id = cell(c, seed).toVar();
      const kante = min(min(f.x, float(1).sub(f.x)).div(nx), min(f.y, float(1).sub(f.y)).div(ny)).toVar();
      const fliese = ramp(kante, p.grout / 2, p.grout / 2 + 0.0015).toVar();
      const schach = p.pattern === "checker" ? abs(fract(c.x.add(c.y).mul(0.5)).mul(2)) : float(0);
      const fein = fbm(q, [24, 24], res, 0.6, seed + 1).toVar();
      const farbe = mix(a, b, schach).mul(id.sub(0.5).mul(0.06).add(1)).mul(fein.mul(0.04).add(1));
      const col = mix(fuge.mul(fein.mul(0.1).add(0.95)), farbe, fliese);
      // Slightly domed glaze, a little uneven per tile
      const height = fliese.mul(float(0.85).add(id.mul(0.1))).add(fein.mul(0.02)).clamp(0, 1);
      const rau = max(float(0.04), float(0.75).sub(p.glaze * 0.68));
      return { height, color: col, roughness: mix(float(0.9), rau.add(fein.abs().mul(0.04)), fliese), metalness: float(0) };
    };
  },
});
