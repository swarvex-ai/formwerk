import { rng } from "../../core/rng";
import { Pixels, ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 16, H = 16;

export const wolf = defineSprite({
  id: "wolf", category: "creatures",
  title: { de: "Wolf", en: "Wolf" },
  description: {
    de: "Ein Wolf im Profil für Wälder, Friedhöfe und Nachtlevel: steht mit buschigem Schwanz, trabt auf vier Beinen und heult im Sitzen den Mond an. Grauwolf, Polarwolf, Rabenschwarz oder als Fuchs mit weißer Schwanzspitze. 16 × 16 Pixel.",
    en: "A wolf in profile for forests, graveyards and night levels: stands with a bushy tail, trots on four legs and howls at the moon sitting down. Grey wolf, arctic wolf, black wolf or a fox with a white tail tip. 16 × 16 pixels.",
  },
  params: {
    furColour: { type: "color", default: "#6a6a70", label: { de: "Fellfarbe", en: "Fur colour" },
      describe: { de: "Grundfarbe des Fells: Grau #6a6a70, Weiß #e4e4e8, Schwarz #2a2a30, Rotbraun #c8602a.", en: "Base colour of the fur: grey #6a6a70, white #e4e4e8, black #2a2a30, red-brown #c8602a." } },
    bellyColour: { type: "color", default: "#b8b4a8", label: { de: "Bauchfarbe", en: "Belly colour" },
      describe: { de: "Farbe von Bauch und Unterkiefer (und der Schwanzspitze): Hellgrau #b8b4a8, Weiß #ffffff, Creme #f0e8dc.", en: "Colour of the belly and the lower muzzle (and the tail tip): light grey #b8b4a8, white #ffffff, cream #f0e8dc." } },
    eyeColour: { type: "color", default: "#e8c040", label: { de: "Augenfarbe", en: "Eye colour" },
      describe: { de: "Farbe des Augenpixels: Gelb #e8c040, Eisblau #7ab0d8, Orange #f0a020.", en: "Colour of the eye pixel: yellow #e8c040, ice blue #7ab0d8, orange #f0a020." } },
    tailTip: { type: "boolean", default: false, label: { de: "Schwanzspitze", en: "Tail tip" },
      describe: { de: "Ein = der letzte Schwanzpixel hat die Bauchfarbe (hell wie beim Fuchs), aus = einfarbiger Schwanz.", en: "On = the last tail pixel is drawn in the belly colour (light, like a fox), off = a tail of one colour." } },
    mane: { type: "boolean", default: true, label: { de: "Mähne", en: "Mane" },
      describe: { de: "Ein = eine zusätzliche Reihe Fell über den Schultern (Nackenkragen, 1 Pixel hoch), aus = glatter Rücken.", en: "On = one extra row of fur above the shoulders (a ruff, 1 pixel high), off = a smooth back." } },
  },
  presets: {
    "grey-wolf": { label: { de: "Grauwolf", en: "Grey wolf" }, values: { furColour: "#6a6a70", bellyColour: "#b8b4a8" } },
    arctic: { label: { de: "Polarwolf", en: "Arctic wolf" }, values: { furColour: "#e4e4e8", bellyColour: "#ffffff", eyeColour: "#7ab0d8" } },
    "black-wolf": { label: { de: "Schwarzer Wolf", en: "Black wolf" }, values: { furColour: "#2a2a30", bellyColour: "#4a4a50", eyeColour: "#f0a020" } },
    fox: { label: { de: "Fuchs", en: "Fox" }, values: { furColour: "#c8602a", bellyColour: "#f0e8dc", tailTip: true, mane: false } },
  },
  frame: { w: W, h: H },
  directions: ["left", "right"],
  animations: [
    { name: "idle", frames: 2, fps: 2, loop: true },
    { name: "walk", frames: 4, fps: 8, loop: true },
    { name: "howl", frames: 2, fps: 2, loop: true },
  ],
  grounded: true,
  build(p, seed) {
    const k = ramp(p.furColour), bauch = ramp(p.bellyColour).base, auge = ramp(p.eyeColour).base;
    const r = rng(seed);
    // Two or three darker fur pixels on the back, placed by the seed (an offset along the back)
    const flecken = [0, 1, 2].slice(0, 2 + Math.floor(r() * 2)).map((i) => (i * 3 + Math.floor(r() * 3)) % 7);
    // A tail from its root to its tip; the last pixel is light with a tail tip
    const schwanz = (b: Pixels, pts: number[][]) => pts.forEach(([x, y], i) => b.set(x, y, p.tailTip && i === pts.length - 1 ? bauch : i % 2 ? k.dark : k.base));
    const rechts = (animation: string, f: number): Pixels => {
      const b = new Pixels(W, H);
      if (animation === "howl") {
        // Sitting: haunches low on the left, upright chest, head raised with the muzzle pointing up and right
        const hy = 4 - f;
        b.part(3, 10, 5, 4, k, true);
        b.rect(6, 14, 3, 1, k.dark);
        b.part(7, p.mane ? 5 : 6, 4, p.mane ? 9 : 8, k, true);
        b.rect(10, 11, 1, 3, bauch);
        b.rect(10, 14, 1, 1, k.dark);
        flecken.forEach((v) => b.set(7, 7 + (v % 4), k.deep));
        b.part(8, hy, 4, 3, k, true);
        b.set(8, hy - 1, k.base); b.set(9, hy - 1, k.dark); b.set(8, hy - 2, k.base);
        // Muzzle: a diagonal two pixels thick, the lower jaw in the belly colour
        b.set(12, hy, k.base); b.set(13, hy, bauch);
        b.set(13, hy - 1, k.base); b.set(14, hy - 1, bauch);
        b.set(10, hy + 1, auge);
        schwanz(b, [[2, 13], [1, 13], [1, 12]]);
        return b;
      }
      const walk = animation === "walk";
      const bob = walk && f % 2 === 1 ? 1 : 0, by = 8 + bob;
      // Legs in diagonal pairs: near hind, far hind, near front, far front
      const stride = walk ? [[-1, 1, 1, -1], [0, 0, 0, 0], [1, -1, -1, 1], [0, 0, 0, 0]][f] : [0, 0, 0, 0];
      const beine: [number, number, boolean][] = [[5 + stride[1], 0, true], [10 + stride[3], 0, true], [4 + stride[0], 0, false], [11 + stride[2], 0, false]];
      for (const [x, , fern] of beine) {
        b.rect(x, by + 4, 1, 14 - (by + 4), fern ? k.deep : k.base);
        b.set(x, 14, k.dark);
      }
      b.part(3, by, 10, 4, k, true);
      b.rect(4, by + 3, 8, 1, bauch);
      flecken.forEach((v) => b.set(4 + v, by, k.deep));
      if (p.mane) b.rect(8, by - 1, 3, 1, k.light);
      // Head 4 × 3 with a muzzle of two pixels, the lower one in the belly colour, one ear
      b.part(11, by - 2, 4, 3, k, true);
      b.set(14, by - 1, k.base); b.set(14, by, bauch); b.set(13, by, bauch);
      b.set(13, by - 1, auge); b.set(11, by - 3, k.base); b.set(12, by - 3, k.dark); b.set(11, by - 4, k.base);
      // Bushy tail sloping down; it lifts by one pixel on the second idle frame
      const lift = animation === "idle" && f === 1 ? -1 : 0;
      schwanz(b, [[2, by + lift], [2, by + 1 + lift], [1, by + 2 + lift], [1, by + 3 + lift]]);
      return b;
    };
    return (animation, d, f) => (d === "right" ? rechts(animation, f) : rechts(animation, f).mirrored());
  },
});
