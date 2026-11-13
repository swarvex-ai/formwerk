import { rng } from "../../core/rng";
import { Pixels, ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 16, H = 16;

export const deer = defineSprite({
  id: "deer", category: "creatures",
  title: { de: "Hirsch", en: "Deer" },
  description: {
    de: "Ein Reh oder Hirsch im Profil für Wälder und Jagdspiele: steht mit zuckendem Wedel, schreitet auf langen Beinen und senkt den Kopf zum Äsen. Ohne Geweih, mit Spießen oder mit Kronengeweih, als Kitz mit Tupfen. 16 × 16 Pixel.",
    en: "A deer in profile for forests and hunting games: stands with a flicking tail, walks on long legs and lowers its head to graze. Without antlers, with spikes or with a crown of antlers, as a fawn with spots. 16 × 16 pixels.",
  },
  params: {
    furColour: { type: "color", default: "#9a6a3e", label: { de: "Fellfarbe", en: "Fur colour" },
      describe: { de: "Grundfarbe des Fells: Rehbraun #9a6a3e, Rotwild #7a4a2e, Wintergrau-Braun #6e6458.", en: "Base colour of the fur: roe brown #9a6a3e, red deer #7a4a2e, winter grey-brown #6e6458." } },
    bellyColour: { type: "color", default: "#e8dcc4", label: { de: "Bauchfarbe", en: "Belly colour" },
      describe: { de: "Farbe von Bauch, Spiegelfleck am Wedel und den Tupfen: Creme #e8dcc4, Weiß #ffffff.", en: "Colour of the belly, the rump patch at the tail and the spots: cream #e8dcc4, white #ffffff." } },
    antlers: { type: "choice", options: ["none", "spikes", "crown"], default: "crown",
      label: { de: "Geweih", en: "Antlers" },
      labels: { none: { de: "Keins", en: "None" }, spikes: { de: "Spieße", en: "Spikes" }, crown: { de: "Krone", en: "Crown" } },
      describe: { de: "Keins für Ricke und Kitz, Spieße als zwei Pixel hohe Stangen für einen jungen Spießer, eine Krone als drei Pixel breites Geweih für einen Hirsch.", en: "None for a doe or fawn, spikes two pixels tall for a young buck, a crown three pixels wide for a stag." } },
    antlerColour: { type: "color", default: "#d8c8a0", label: { de: "Geweihfarbe", en: "Antler colour" },
      describe: { de: "Farbe des Geweihs: Elfenbein #d8c8a0, Bast #8a7050, Dunkel #5a4a38.", en: "Colour of the antlers: ivory #d8c8a0, velvet #8a7050, dark #5a4a38." } },
    spots: { type: "boolean", default: false, label: { de: "Tupfen", en: "Spots" },
      describe: { de: "Ein = drei bis vier helle Tupfen auf dem Rücken wie beim Kitz, aus = einfarbiges Fell.", en: "On = three or four light spots on the back like a fawn, off = fur of one colour." } },
  },
  presets: {
    stag: { label: { de: "Hirsch", en: "Stag" }, values: { furColour: "#7a4a2e", antlers: "crown" } },
    doe: { label: { de: "Ricke", en: "Doe" }, values: { antlers: "none" } },
    fawn: { label: { de: "Kitz", en: "Fawn" }, values: { antlers: "none", spots: true, furColour: "#b07a48" } },
    "young-buck": { label: { de: "Spießer", en: "Young buck" }, values: { antlers: "spikes" } },
  },
  frame: { w: W, h: H },
  directions: ["left", "right"],
  animations: [
    { name: "idle", frames: 2, fps: 2, loop: true },
    { name: "walk", frames: 4, fps: 8, loop: true },
    { name: "graze", frames: 2, fps: 2, loop: true },
  ],
  grounded: true,
  build(p, seed) {
    const k = ramp(p.furColour), bauch = ramp(p.bellyColour).base, geweih = ramp(p.antlerColour);
    const r = rng(seed);
    // Three or four light spots on the back (like a fawn), placed by the seed
    const flecken = [0, 1, 2, 3].slice(0, 3 + Math.floor(r() * 2)).map((i) => [3 + i * 2 + Math.floor(r() * 2), 8 + Math.floor(r() * 2)]);
    // Head 3 × 2 with a dark nose and eye, one ear behind; above it the antlers as spikes or as a crown
    const kopf = (b: Pixels, hx: number, hy: number) => {
      b.part(hx, hy, 3, 2, k, true);
      b.set(hx + 3, hy + 1, k.deep);
      b.set(hx + 1, hy, k.deep);
      b.set(hx, hy - 1, k.dark);
      if (p.antlers === "spikes") { b.set(hx + 1, hy - 1, geweih.base); b.set(hx + 1, hy - 2, geweih.light); }
      if (p.antlers === "crown") { b.set(hx + 1, hy - 1, geweih.base); b.set(hx + 1, hy - 2, geweih.base); b.set(hx, hy - 2, geweih.light); b.set(hx + 2, hy - 2, geweih.light); }
    };
    const rechts = (animation: string, f: number): Pixels => {
      const b = new Pixels(W, H);
      const walk = animation === "walk";
      const bob = walk && f % 2 === 1 ? 1 : 0, by = 7 + bob;
      // Legs in diagonal pairs on long thin shanks: hind near, hind far, front near, front far
      const stride = walk ? [[-1, 1, 1, -1], [0, 0, 0, 0], [1, -1, -1, 1], [0, 0, 0, 0]][f] : [0, 0, 0, 0];
      const beine: [number, boolean][] = [[3 + stride[0], false], [4 + stride[1], true], [8 + stride[2], false], [9 + stride[3], true]];
      for (const [x, fern] of beine) {
        b.rect(x, by + 4, 1, 14 - (by + 4), fern ? k.deep : k.base);
        b.set(x, 14, k.deep);
      }
      b.part(2, by, 8, 4, k, true);
      b.rect(3, by + 3, 6, 1, bauch);
      if (p.spots) flecken.forEach(([x, y]) => b.set(x, y + bob, bauch));
      // White rump patch under the dark tail; the tail flicks up by one pixel on the second idle frame
      const flick = animation === "idle" && f === 1 ? -1 : 0;
      b.set(1, by + 1 + flick, bauch);
      b.set(1, by + flick, k.dark);
      if (animation === "graze") {
        // Neck bent down to the ground, the head chews by one pixel
        b.rect(10, by + 1, 1, 2, k.base);
        b.set(11, by + 3, k.base);
        kopf(b, 11, 11 + f);
        return b;
      }
      // Neck rising from the shoulder, the head high above it
      b.rect(9, by - 3, 2, 4, k.base);
      b.set(9, by - 3, k.light);
      kopf(b, 10, by - 4);
      return b;
    };
    return (animation, d, f) => (d === "right" ? rechts(animation, f) : rechts(animation, f).mirrored());
  },
});
