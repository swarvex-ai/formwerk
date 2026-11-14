import { CLEAR, hex, Pixels, ramp, type RGBA } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 16, H = 16;
// Pips on a 3 × 3 grid (column, row: 0 left or top, 1 middle, 2 right or bottom), as on a real die
const AUGEN: Record<number, [number, number][]> = {
  1: [[1, 1]], 2: [[0, 0], [2, 2]], 3: [[0, 0], [1, 1], [2, 2]], 4: [[0, 0], [2, 0], [0, 2], [2, 2]],
  5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]], 6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]],
};
// While it rolls, the faces that come up one after another, as steps from the face it lands on (always four different ones)
const SCHRITTE = [3, 1, 4, 0];

export const die = defineSprite({
  id: "die", category: "items",
  title: { de: "Würfel", en: "Die" },
  description: {
    de: "Ein Spielwürfel als Pixel-Symbol für Brettspiele, Glücksspiel und Proben: Augenzahl, Größe, Ecken und Farben frei wählbar, mit einer Animation, in der er nach vorn rollt und auf der gewählten Zahl liegen bleibt. 16 × 16 Pixel.",
    en: "A gaming die as a pixel icon for board games, gambling and skill checks: face, size, corners and colours as you like, with an animation in which it rolls forward and comes to rest on the chosen number. 16 × 16 pixels.",
  },
  params: {
    face: { type: "integer", min: 1, max: 6, default: 5, label: { de: "Augenzahl", en: "Face" },
      describe: { de: "Die Zahl, die oben liegt, wenn er ruht und am Ende des Rollens: 1 bis 6.", en: "The number facing you at rest and at the end of the roll: 1 to 6." } },
    size: { type: "integer", min: 4, max: 6, default: 5, label: { de: "Größe", en: "Size" },
      describe: { de: "Wie groß der Würfel ist: 4 ein kleiner (Vorderseite 7 Pixel), 5 üblich (9 Pixel), 6 ein großer (11 Pixel).", en: "How big the die is: 4 a small one (front 7 pixels), 5 usual (9 pixels), 6 a big one (11 pixels)." } },
    corners: { type: "choice", options: ["round", "sharp"], default: "round", label: { de: "Ecken", en: "Corners" },
      labels: { round: { de: "rund", en: "round" }, sharp: { de: "scharf", en: "sharp" } },
      describe: { de: "Abgerundete Ecken wie ein gewöhnlicher Spielwürfel, oder scharfe wie ein Präzisionswürfel im Kasino.", en: "Rounded corners like an everyday die, or sharp ones like a casino precision die." } },
    body: { type: "color", default: "#ece4d0", label: { de: "Würfel", en: "Body" },
      describe: { de: "Farbe des Würfels: Elfenbein #ece4d0 üblich, Rot #b8312f im Kasino, Schwarz #30303a edel.", en: "Colour of the die: ivory #ece4d0 usual, red #b8312f in a casino, black #30303a elegant." } },
    pips: { type: "color", default: "#30303a", label: { de: "Augen", en: "Pips" },
      describe: { de: "Farbe der Augen: Schwarz #30303a auf hellem Würfel, Weiß #f4f4f4 auf rotem oder schwarzem.", en: "Colour of the pips: black #30303a on a light die, white #f4f4f4 on a red or black one." } },
  },
  presets: {
    classic: { label: { de: "Spielwürfel", en: "Classic die" }, values: { face: 5 } },
    casino: { label: { de: "Kasinowürfel", en: "Casino die" }, values: { face: 6, size: 6, corners: "sharp", body: "#b8312f", pips: "#f4f4f4" } },
    "small-black": { label: { de: "Kleiner schwarzer Würfel", en: "Small black die" }, values: { face: 3, size: 4, body: "#30303a", pips: "#f4f4f4" } },
  },
  frame: { w: W, h: H },
  directions: ["down"],
  animations: [{ name: "idle", frames: 1, fps: 1, loop: true }, { name: "roll", frames: 7, fps: 12, loop: false }],
  grounded: false,
  build(p) {
    const k = ramp(p.body), auge = hex(p.pips), a = 2 * p.size - 1, rund = p.corners === "round";
    // The die as a box seen from the front and a little from above and the right: front a × a, top and side 2 pixels
    const x0 = Math.floor((W - a - 2) / 2), y0 = Math.floor((H - a - 2) / 2);
    const raster = (n: number) => [Math.floor(n * 0.2) + (n >= 9 ? 1 : 0), (n - 1) / 2, n - 1 - Math.floor(n * 0.2) - (n >= 9 ? 1 : 0)];
    // One face: its colour, and its pips only when it faces us fully (squeezed pips would merge into bars)
    const flaeche = (b: Pixels, y: number, h: number, farbe: RGBA, zahl: number) => {
      b.rect(x0, y, a, h, farbe);
      if (h < a) return;
      const s = raster(a);
      for (const [i, j] of AUGEN[zahl]) b.set(x0 + s[i], y + s[j], auge);
    };
    return (animation, _d, f) => {
      const b = new Pixels(W, H);
      // The side on the right, darker, from the top edge down to the bottom of the front
      b.rect(x0 + a, y0 + 1, 2, a + 1, k.dark); b.set(x0 + a + 1, y0 + 1, CLEAR);
      const viertel = animation === "roll" ? f / 2 : 3, q = Math.floor(viertel), kippt = viertel !== q;
      const zahl = (s: number) => ((p.face - 1 + SCHRITTE[Math.min(3, s)]) % 6) + 1;
      if (!kippt) {
        // Resting on a face: the top as a light strip, the face towards us full size with its pips
        b.rect(x0 + 1, y0, a, 1, k.light); b.rect(x0, y0 + 1, a, 1, k.light);
        flaeche(b, y0 + 2, a, k.base, zahl(q));
      } else {
        // Halfway through a quarter turn: the next face comes over the top while the old one tips under
        const oben = Math.floor((a + 2) / 2);
        flaeche(b, y0, oben, k.light, zahl(q + 1));
        flaeche(b, y0 + oben, a + 2 - oben, k.base, zahl(q));
        b.rect(x0, y0 + oben, a, 1, k.dark);
      }
      if (rund) for (const [x, y] of [[x0, kippt ? y0 : y0 + 1], [x0, y0 + a + 1], [x0 + a + 1, y0 + a + 1]]) b.set(x, y, CLEAR);
      return b;
    };
  },
});
