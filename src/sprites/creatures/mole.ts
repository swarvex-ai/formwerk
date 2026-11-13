import { Pixels, ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 16, H = 16;
// How wide and high the mound of earth is in each dig frame: the mole buries itself under it.
const HUEGEL: readonly [number, number][] = [[6, 2], [9, 3], [12, 5], [13, 7]];

export const mole = defineSprite({
  id: "mole", category: "creatures",
  title: { de: "Maulwurf", en: "Mole" },
  description: {
    de: "Ein Maulwurf von der Seite mit rosa Rüssel und großen rosa Grabhänden, der schnüffelt, entlangstapft und sich in einen Erdhaufen gräbt: Größe, Rüssellänge und Farben frei. 16 × 16 Pixel pro Bild, Füße auf der untersten Zeile.",
    en: "A mole seen from the side with a pink snout and big pink digging hands that sniffs, shuffles along and digs itself into a mound of earth: size, snout length and colours as you like. 16 × 16 pixels per frame, feet on the bottom row.",
  },
  params: {
    furColour: { type: "color", default: "#3a3440", label: { de: "Fell", en: "Fur" },
      describe: { de: "Farbe des Samtfells: Samtschwarz #3a3440 wie beim Europäischen Maulwurf, Goldbraun #b08a50, Grau #6a6a72.", en: "Colour of the velvet fur: velvet black #3a3440 like a European mole, golden brown #b08a50, grey #6a6a72." } },
    skinColour: { type: "color", default: "#e8a0a0", label: { de: "Rüssel und Hände", en: "Snout and hands" },
      describe: { de: "Farbe von Rüssel, Grabhänden, Füßen und Schwanz: Rosa #e8a0a0 üblich, Hellrosa #f0c0b0, Grau #b0a8a8 bei alten Tieren.", en: "Colour of snout, digging hands, feet and tail: pink #e8a0a0 usual, pale pink #f0c0b0, grey #b0a8a8 on old animals." } },
    dirtColour: { type: "color", default: "#6a4a30", label: { de: "Erde", en: "Earth" },
      describe: { de: "Farbe des Erdhaufens beim Graben: Gartenkrume #6a4a30, Lehm #8a5a34, dunkle Walderde #4a3624.", en: "Colour of the mound it digs: garden loam #6a4a30, clay #8a5a34, dark forest earth #4a3624." } },
    size: { type: "integer", min: 3, max: 5, default: 4, label: { de: "Größe", en: "Size" },
      describe: { de: "Körpergröße in Pixeln: 3 ein Jungtier, 4 ein gewöhnlicher Maulwurf von 15 Zentimetern, 5 ein großer Europäischer Maulwurf von 20 Zentimetern.", en: "Body size in pixels: 3 a young mole, 4 the usual mole of 15 centimetres, 5 a large European mole of 20 centimetres." } },
    snout: { type: "integer", min: 1, max: 3, default: 2, label: { de: "Rüssellänge", en: "Snout length" },
      describe: { de: "Länge des Rüssels in Pixeln: 1 kurz und stumpf, 2 üblich, 3 lang wie beim Rattenigel.", en: "Length of the snout in pixels: 1 short and blunt, 2 usual, 3 long like a star-nosed mole's." } },
  },
  presets: {
    mole: { label: { de: "Maulwurf", en: "Mole" }, values: { size: 4 } },
    "golden-mole": { label: { de: "Goldmaulwurf", en: "Golden mole" }, values: { furColour: "#b08a50", size: 3 } },
    "giant-mole": { label: { de: "Riesenmaulwurf", en: "Giant mole" }, values: { size: 5, snout: 3 } },
  },
  frame: { w: W, h: H },
  directions: ["left", "right"],
  animations: [{ name: "idle", frames: 2, fps: 2, loop: true }, { name: "walk", frames: 4, fps: 8, loop: true }, { name: "dig", frames: 4, fps: 6, loop: false }],
  grounded: true,
  build(p) {
    const fell = ramp(p.furColour), haut = ramp(p.skinColour), erde = ramp(p.dirtColour), n = p.snout;

    // One frame facing right; left is its mirror. No eye: it would vanish in the dark fur.
    const rechts = (animation: string, f: number): Pixels => {
      const b = new Pixels(W, H);
      const schritt = animation === "walk" ? f % 2 : 0;
      const schnupper = animation === "idle" && f === 1 ? 1 : 0;
      const ky = 11 - schritt * 0.5;
      b.ellipse(6.5, ky, p.size + 0.9, p.size - 0.6, fell);
      b.set(1, 12, haut.base);
      b.rect(3 - schritt, 14, 3, 1, haut.dark);
      // The digging hand: a broad pink paw with two claws in front of the chest
      b.rect(9 + schritt, 12, 3, 3, haut.base);
      b.set(9 + schritt, 12, haut.light);
      b.set(12 + schritt, 14, haut.dark);
      b.set(12 + schritt, 13, haut.dark);
      b.rect(14 - n, 11 - schnupper, n, 2, haut.base);
      b.set(14, 11 - schnupper, haut.light);
      b.set(14 - n, 12 - schnupper, haut.dark);
      if (animation === "dig") {
        // The mound grows over the mole until only tail and snout tip stick out
        const [w, h] = HUEGEL[f % HUEGEL.length];
        for (let j = 0; j < h; j++) {
          const half = Math.max(1, Math.round((w / 2) * Math.sqrt(1 - (j / h) ** 2)));
          b.rect(8 - half, 14 - j, 2 * half, 1, j === h - 1 ? erde.light : j === 0 ? erde.dark : erde.base);
        }
        if (h >= 3) { b.set(6, 13, erde.deep); b.set(10, 12, erde.deep); }
      }
      return b;
    };

    return (animation, d, f) => d === "left" ? rechts(animation, f).mirrored() : rechts(animation, f);
  },
});
