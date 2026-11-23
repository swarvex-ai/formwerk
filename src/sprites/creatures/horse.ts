import { Pixels, ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 24, H = 24;
// Floor row: the last row inside the free outer ring
const BODEN = H - 2;

// Per breed: body left x, length and height, top row; leg x from the body's left (far and near of the hind pair, far
// and near of the front pair); neck rise in rows and forward reach; tail length
const RASSEN = {
  pony: { bx: 5, L: 11, bh: 5, by: 13, beine: [0, 3, 6, 9], n: 5, nb: 4, tl: 5 },
  horse: { bx: 4, L: 14, bh: 5, by: 10, beine: [1, 4, 8, 11], n: 6, nb: 5, tl: 7 },
  draught: { bx: 3, L: 16, bh: 6, by: 10, beine: [1, 4, 10, 13], n: 5, nb: 5, tl: 6 },
} as const;

export const horse = defineSprite({
  id: "horse", category: "creatures",
  title: { de: "Pferd", en: "Horse" },
  description: {
    de: "Ein Pferd im Profil für Hof, Stall, Landstraße und Ritterszenen: steht mit schlagendem Schweif, schreitet im Kreuzgang und senkt den Hals zum Grasen. Als Pony, Reitpferd oder Kaltblut, mit Blesse, weißen Fesseln und Sattel. 24 × 24 Pixel, passend zu den 24 × 32 großen Figuren.",
    en: "A horse in profile for farm, stable, road and knight scenes: stands with a swishing tail, walks with diagonal legs together and lowers its neck to graze. As a pony, riding horse or draught horse, with a blaze, socks and a saddle. 24 × 24 pixels, to stand next to the 24 × 32 characters.",
  },
  params: {
    breed: { type: "choice", options: ["pony", "horse", "draught"], default: "horse",
      label: { de: "Rasse", en: "Breed" },
      labels: { pony: { de: "Pony", en: "Pony" }, horse: { de: "Reitpferd", en: "Riding horse" }, draught: { de: "Kaltblut", en: "Draught horse" } },
      describe: { de: "Pony mit 11 Pixel langem Rumpf, kurzen Beinen und dicker Mähne, Reitpferd mit 14 Pixeln und schlanken Beinen, Kaltblut mit 16 Pixeln, breiter Brust und Behang über den Hufen.", en: "Pony with an 11 pixel body, short legs and a thick mane, riding horse with 14 pixels and slim legs, draught horse with 16 pixels, a broad chest and feathering above the hooves." } },
    coatColour: { type: "color", default: "#8a5a34", label: { de: "Fellfarbe", en: "Coat colour" },
      describe: { de: "Grundfarbe des Fells: Brauner #8a5a34, Fuchs #a5592c, Rappe #2e2a28, Schimmel #b8b4ac.", en: "Base colour of the coat: bay #8a5a34, chestnut #a5592c, black #2e2a28, grey #b8b4ac." } },
    maneColour: { type: "color", default: "#2e2a28", label: { de: "Mähnenfarbe", en: "Mane colour" },
      describe: { de: "Farbe von Mähne und Schweif: Schwarz #2e2a28 beim Braunen, Flachs #e8e2d4 beim Haflinger oder Schimmel, Rotbraun #7a3a1e beim Fuchs.", en: "Colour of the mane and tail: black #2e2a28 on a bay, flaxen #e8e2d4 on a haflinger or grey, red-brown #7a3a1e on a chestnut." } },
    markings: { type: "choice", options: ["none", "blaze", "socks"], default: "none",
      label: { de: "Abzeichen", en: "Markings" },
      labels: { none: { de: "Keine", en: "None" }, blaze: { de: "Blesse", en: "Blaze" }, socks: { de: "Weiße Fesseln", en: "Socks" } },
      describe: { de: "Keine für ein einfarbiges Pferd, Blesse als weißer Streifen über das Gesicht, weiße Fesseln als zwei weiße Pixelreihen über den Hufen an allen vier Beinen.", en: "None for a horse of one colour, blaze as a white stripe down the face, socks as two white rows above the hooves on all four legs." } },
    saddle: { type: "boolean", default: false, label: { de: "Sattel", en: "Saddle" },
      describe: { de: "Ein = Sattel auf dem Rücken mit Sattelgurt und einem Steigbügel, der unter dem Bauch hängt, aus = ungesattelt auf der Weide.", en: "On = a saddle on the back with a girth strap and a stirrup hanging below the belly, off = unsaddled at pasture." } },
    saddleColour: { type: "color", default: "#5a3a22", label: { de: "Sattelfarbe", en: "Saddle colour" },
      describe: { de: "Farbe des Sattelleders: Dunkelbraun #5a3a22, Hellbraun #8a5a30, Schwarz #2a2422.", en: "Colour of the saddle leather: dark brown #5a3a22, tan #8a5a30, black #2a2422." } },
  },
  presets: {
    bay: { label: { de: "Brauner", en: "Bay" }, values: { coatColour: "#8a5a34" } },
    pony: { label: { de: "Pony", en: "Pony" }, values: { breed: "pony", coatColour: "#b8b4ac", maneColour: "#e8e2d4" } },
    draught: { label: { de: "Kaltblut", en: "Draught horse" }, values: { breed: "draught", coatColour: "#2e2a28", markings: "socks" } },
    riding: { label: { de: "Reitpferd", en: "Riding horse" }, values: { saddle: true, markings: "blaze", coatColour: "#a5592c" } },
  },
  frame: { w: W, h: H },
  directions: ["left", "right"],
  animations: [
    { name: "idle", frames: 2, fps: 2, loop: true },
    { name: "walk", frames: 4, fps: 8, loop: true },
    { name: "graze", frames: 2, fps: 2, loop: true },
  ],
  grounded: true,
  build(p) {
    const k = ramp(p.coatColour), m = ramp(p.maneColour), s = ramp(p.saddleColour);
    const weiss = ramp("#f0ece4").base, huf = ramp("#3a3230").base, eisen = ramp("#a8a8a8").base;
    const behang = p.markings === "socks" ? weiss : k.light;
    const { bx, L, bh, by, beine, n, nb, tl } = RASSEN[p.breed];
    const dick = p.breed === "pony";
    // Neck from the withers (base) up and forward to the poll (nx); the head hangs forward and down from it
    const basis = bx + L - 5, nx = bx + L - 6 + nb;
    const rechts = (animation: string, f: number): Pixels => {
      const b = new Pixels(W, H);
      const walk = animation === "walk", graze = animation === "graze";
      // Legs 2 px wide in diagonal pairs (hind near with front far), the forward leg of a pair lifted by one pixel
      const stride = walk ? [[-1, 1, 1, -1], [0, 0, 0, 0], [1, -1, -1, 1], [0, 0, 0, 0]][f] : [0, 0, 0, 0];
      const hebt = walk ? [[0, 0, 0, 0], [0, 1, 1, 0], [0, 0, 0, 0], [1, 0, 0, 1]][f] : [0, 0, 0, 0];
      beine.forEach((dx, i) => {
        const x = bx + dx + stride[i], fern = i % 2 === 0, fuss = BODEN - hebt[i];
        b.rect(x, by + bh, 2, fuss - (by + bh), fern ? k.dark : k.base);
        if (!fern) b.set(x, by + bh, k.light);
        if (p.markings === "socks") b.rect(x, fuss - 2, 2, 2, weiss);
        if (p.breed === "draught") for (const y of [fuss - 2, fuss - 1]) b.set(fern ? x - 1 : x + 2, y, behang);
        b.rect(x, fuss, 2, 1, huf);
      });
      // Barrel body with a deep chest below the withers; the draught horse's chest bulges forward
      b.part(bx, by, L, bh, k, true);
      b.rect(bx + L - 5, by + bh, 3, 1, k.dark);
      if (p.breed === "draught") b.rect(bx + L, by + 1, 1, bh - 3, k.dark);
      // Tail from the rump, hanging; in idle it swishes in by one pixel on the second frame
      const swish = animation === "idle" && f === 1 ? 1 : 0;
      b.rect(bx - 1, by, 1, 2, m.base);
      b.rect(bx - 2 + swish, by + 2, 1, tl - 2, m.base);
      b.set(bx - 2 + swish, by + tl - 1, m.dark);
      if (dick) b.rect(bx - 1 + swish, by + 2, 1, tl - 3, m.dark);
      if (p.saddle) {
        // Seat with cantle and pommel, the flap below, the girth around the belly and a stirrup under it
        const w = L >= 14 ? 4 : 3, sx = bx + Math.floor(L * 0.3);
        b.rect(sx, by - 1, w, 2, s.base);
        b.set(sx, by - 2, s.dark);
        b.set(sx + w - 1, by - 2, s.light);
        b.rect(sx + 1, by + 1, w - 1, 2, s.dark);
        b.rect(sx + 1, by + 3, 1, bh - 3, s.deep);
        b.rect(sx + w - 1, by + 3, 1, bh - 2, s.light);
        b.rect(sx + w - 2, by + bh + 1, 3, 1, eisen);
      }
      if (graze) {
        // Neck lowered forward and down to the grass, the muzzle on the floor row; the head nibbles forward by one pixel
        const hx = bx + L - 1 + f, oben = by - 1, unten = BODEN - 4;
        for (let y = oben; y <= unten; y++) {
          const x = Math.round(basis + 1 + ((hx - 1 - basis - 1) * (y - oben)) / (unten - oben));
          b.rect(x, y, 3, 1, k.base);
          b.set(x + 2, y, k.dark);
          if (y < by + 3) { b.set(x + 1, y, m.base); if (dick) b.set(x, y, m.dark); }
        }
        b.rect(hx, BODEN - 3, 2, 3, k.base);
        b.set(hx, BODEN - 3, k.light);
        b.set(hx - 1, BODEN - 4, k.dark);
        b.set(hx, BODEN - 2, k.deep);
        if (p.markings === "blaze") b.rect(hx + 1, BODEN - 3, 1, 3, weiss);
        b.rect(hx, BODEN, 2, 1, k.deep);
        return b;
      }
      // Neck rising forward from the chest, three pixels wide, the mane along its crest
      for (let i = 0; i < n; i++) {
        const y = by - 1 - i, x = basis + Math.round(((nx - basis) * (i + 1)) / n);
        b.rect(x, y, 3, 1, k.base);
        b.set(x, y, k.light);
        b.set(x - 1, y, m.base);
        if (dick) b.set(x - 2, y, m.dark);
      }
      b.rect(basis + 1, by, 4, 1, k.base);
      // Long head, sloping down to the muzzle; ear and forelock above the poll, eye, dark muzzle
      const hy = by - n;
      b.rect(nx, hy, 3, 1, k.base);
      b.rect(nx, hy + 1, 4, 1, k.base);
      b.rect(nx + 1, hy + 2, 4, 1, k.base);
      b.rect(nx + 2, hy + 3, 3, 1, k.dark);
      b.set(nx + 1, hy - 1, k.dark);
      b.set(nx, hy - 1, m.base);
      b.set(nx - 1, hy, m.base);
      b.set(nx + 1, hy + 1, k.deep);
      if (p.markings === "blaze") { b.set(nx + 2, hy, weiss); b.set(nx + 3, hy + 1, weiss); b.set(nx + 3, hy + 2, weiss); }
      b.rect(nx + 3, hy + 3, 2, 1, k.deep);
      b.set(nx + 4, hy + 2, k.deep);
      return b;
    };
    return (animation, d, f) => (d === "right" ? rechts(animation, f) : rechts(animation, f).mirrored());
  },
});
