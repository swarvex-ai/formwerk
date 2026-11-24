import { rng } from "../../core/rng";
import { Pixels, hex, ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 16, H = 16;

export const dog = defineSprite({
  id: "dog", category: "creatures",
  title: { de: "Hund", en: "Dog" },
  description: {
    de: "Ein Hund im Profil für Höfe, Mühlen, Dörfer und Städte: steht und wedelt mit dem Schwanz, läuft auf vier Beinen und bellt mit gehobenem Kopf. Hofhund, Terrier, schwarzer Hund oder gefleckt, mit Halsband. 16 × 16 Pixel.",
    en: "A dog in profile for farms, mills, villages and towns: stands wagging its tail, walks on four legs and barks with its head raised. Farm dog, terrier, black dog or spotted, with a collar. 16 × 16 pixels.",
  },
  params: {
    size: { type: "choice", options: ["small", "large"], default: "large", label: { de: "Größe", en: "Size" },
      labels: { small: { de: "klein", en: "Small" }, large: { de: "groß", en: "Large" } },
      describe: { de: "Klein wie ein Terrier (Beine 1 Pixel kürzer, Körper 8 statt 10 Pixel lang) oder groß wie ein Hofhund.", en: "Small like a terrier (legs 1 pixel shorter, a body 8 instead of 10 pixels long) or large like a farm dog." } },
    ears: { type: "choice", options: ["floppy", "pricked"], default: "floppy", label: { de: "Ohren", en: "Ears" },
      labels: { floppy: { de: "Schlappohren", en: "Floppy" }, pricked: { de: "Stehohren", en: "Pricked" } },
      describe: { de: "Schlappohren hängen neben dem Kopf herab (Hofhund, Jagdhund), Stehohren stehen auf wie beim Wolf (Terrier, Schäferhund).", en: "Floppy ears hang down beside the head (farm dog, hound), pricked ears stand up as on the wolf (terrier, shepherd)." } },
    tail: { type: "choice", options: ["up", "down"], default: "up", label: { de: "Schwanz", en: "Tail" },
      labels: { up: { de: "hoch", en: "Up" }, down: { de: "hängend", en: "Down" } },
      describe: { de: "Hoch über den Rücken gebogen (fröhlich, Spitz) oder nach hinten herabhängend (ruhig, Jagdhund).", en: "Curving up over the back (cheerful, spitz) or hanging down behind (calm, hound)." } },
    collar: { type: "boolean", default: true, label: { de: "Halsband", en: "Collar" },
      describe: { de: "Ein = ein Halsband aus einem Pixel um den Hals in der Halsbandfarbe (Hofhund), aus = ohne (Streuner).", en: "On = a one-pixel collar round the neck in the collar colour (farm dog), off = none (stray)." } },
    patch: { type: "boolean", default: false, label: { de: "Flecken", en: "Patch" },
      describe: { de: "Ein = ein Fleck in der Fleckenfarbe um das Auge und auf dem Rücken (gefleckter Hund), aus = einfarbig.", en: "On = a patch in the spot colour round the eye and on the back (spotted dog), off = one colour." } },
    furColour: { type: "color", default: "#8a5a30", label: { de: "Fellfarbe", en: "Fur colour" },
      describe: { de: "Grundfarbe des Fells: Braun #8a5a30, Sandfarben #c8a070, Schwarz #262220, Weiß #ece6da.", en: "Base colour of the fur: brown #8a5a30, sandy #c8a070, black #262220, white #ece6da." } },
    bellyColour: { type: "color", default: "#d8b890", label: { de: "Bauchfarbe", en: "Belly colour" },
      describe: { de: "Farbe von Bauch und Unterkiefer: Hellbraun #d8b890, Weiß #ffffff, Dunkelgrau #4a4440.", en: "Colour of the belly and the lower jaw: light brown #d8b890, white #ffffff, dark grey #4a4440." } },
    spotColour: { type: "color", default: "#2a2018", label: { de: "Fleckenfarbe", en: "Spot colour" },
      describe: { de: "Farbe der Flecken an Auge und Rücken (nur mit Flecken): Schwarzbraun #2a2018, Braun #6a4020.", en: "Colour of the patches at the eye and on the back (only with a patch): black-brown #2a2018, brown #6a4020." } },
    collarColour: { type: "color", default: "#b02a2a", label: { de: "Halsbandfarbe", en: "Collar colour" },
      describe: { de: "Farbe des Halsbands: Rot #b02a2a, Blau #2a50b0, Leder #5a3a1a.", en: "Colour of the collar: red #b02a2a, blue #2a50b0, leather #5a3a1a." } },
  },
  presets: {
    "farm-dog": { label: { de: "Hofhund", en: "Farm dog" }, values: { size: "large", ears: "floppy", furColour: "#8a5a30" } },
    terrier: { label: { de: "Terrier", en: "Terrier" }, values: { size: "small", ears: "pricked", furColour: "#c8a070" } },
    "black-dog": { label: { de: "Schwarzer Hund", en: "Black dog" }, values: { furColour: "#262220", bellyColour: "#4a4440" } },
    spotted: { label: { de: "Gefleckt", en: "Spotted" }, values: { patch: true, furColour: "#ece6da", bellyColour: "#ffffff" } },
  },
  frame: { w: W, h: H },
  directions: ["left", "right"],
  animations: [
    { name: "idle", frames: 2, fps: 2, loop: true },
    { name: "walk", frames: 4, fps: 8, loop: true },
    { name: "bark", frames: 2, fps: 4, loop: true },
  ],
  grounded: true,
  build(p, seed) {
    const k = ramp(p.furColour), bauch = ramp(p.bellyColour).base, fleck = ramp(p.spotColour).base;
    const band = ramp(p.collarColour).base, auge = hex("#120c08");
    const r = rng(seed);
    const klein = p.size === "small";
    // Body from x0 to x = 12; a small dog has a body two pixels shorter and stands one pixel lower
    const x0 = klein ? 5 : 3, len = 13 - x0;
    // Two or three darker fur pixels on the back, placed by the seed (an offset along the back)
    const flecken = [0, 1, 2].slice(0, 2 + Math.floor(r() * 2)).map((i) => (i * 3 + Math.floor(r() * 3)) % (len - 3));
    const rechts = (animation: string, f: number): Pixels => {
      const b = new Pixels(W, H);
      const walk = animation === "walk";
      const bob = walk && f % 2 === 1 ? 1 : 0, by = (klein ? 9 : 8) + bob;
      // Legs in diagonal pairs: near hind, far hind, near front, far front
      const stride = walk ? [[-1, 1, 1, -1], [0, 0, 0, 0], [1, -1, -1, 1], [0, 0, 0, 0]][f] : [0, 0, 0, 0];
      const beine: [number, boolean][] = [[x0 + 2 + stride[1], true], [10 + stride[3], true], [x0 + 1 + stride[0], false], [11 + stride[2], false]];
      for (const [x, fern] of beine) {
        b.rect(x, by + 4, 1, 14 - (by + 4), fern ? k.deep : k.base);
        b.set(x, 14, k.dark);
      }
      b.part(x0, by, len, 4, k, true);
      b.rect(x0 + 1, by + 3, len - 2, 1, bauch);
      flecken.forEach((v) => b.set(x0 + 1 + v, by, k.deep));
      if (p.patch) b.rect(x0 + 2, by, 3, 2, fleck);
      // Round head 4 × 4 with cut corners; it rises by one pixel on the second bark frame
      const bellt = animation === "bark" && f === 1, hy = by - (bellt ? 1 : 0);
      b.part(10, hy - 3, 4, 4, k, true);
      if (p.patch) b.rect(11, hy - 3, 2, 2, fleck);
      b.set(12, hy - 2, auge);
      // Blunt muzzle ending at x = 13: a dark nose on top, the lower jaw in the belly colour, a pixel apart when barking
      b.set(13, hy - 1, k.deep);
      b.set(12, hy + (bellt ? 1 : 0), bauch); b.set(13, hy + (bellt ? 1 : 0), bauch);
      if (bellt) b.set(12, hy, k.base);
      if (p.ears === "pricked") { b.set(11, hy - 4, k.base); b.set(11, hy - 5, k.base); b.set(12, hy - 4, k.dark); }
      else { b.rect(10, hy - 3, 1, 3, k.deep); b.set(11, hy - 3, k.dark); }
      if (p.collar) b.rect(10, hy, 1, by + 2 - hy, band);
      // Tail curving up over the back or hanging down; it lifts by one pixel on the second idle frame
      const lift = animation === "idle" && f === 1 ? -1 : 0;
      const schwanz = p.tail === "up" ? [[x0, by - 1], [x0 - 1, by - 2], [x0 - 1, by - 3], [x0, by - 4]] : [[x0 - 1, by + 1], [x0 - 1, by + 2], [x0 - 2, by + 3]];
      schwanz.forEach(([x, y], i) => b.set(x, y + lift, i % 2 ? k.dark : k.base));
      return b;
    };
    return (animation, d, f) => (d === "right" ? rechts(animation, f) : rechts(animation, f).mirrored());
  },
});
