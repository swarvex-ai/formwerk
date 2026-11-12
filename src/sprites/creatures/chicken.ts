import { Pixels, ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 16, H = 16;

export const chicken = defineSprite({
  id: "chicken", category: "creatures",
  title: { de: "Huhn", en: "Chicken" },
  description: {
    de: "Ein Huhn vom Hof im Profil, das scharrt, läuft und pickt: Hahn mit Schwanzfedern, Küken oder Henne, Farben frei. 16 × 16 Pixel.",
    en: "A farm chicken in profile that stands, walks and pecks: rooster with a plume, chick or hen, colours as you like. 16 × 16 pixels.",
  },
  params: {
    bodyColour: { type: "color", default: "#f2efe6", label: { de: "Körperfarbe", en: "Body colour" },
      describe: { de: "Farbe des Gefieders: Weiß #f2efe6, Braun #8a5a34, Küken Gelb #f2d04a.", en: "Colour of the feathers: white #f2efe6, brown #8a5a34, chick yellow #f2d04a." } },
    combColour: { type: "color", default: "#d8322c", label: { de: "Kammfarbe", en: "Comb colour" },
      describe: { de: "Farbe von Kamm und Kehllappen: Rot #d8322c.", en: "Colour of the comb and the wattle: red #d8322c." } },
    legColour: { type: "color", default: "#e8a22a", label: { de: "Beinfarbe", en: "Leg colour" },
      describe: { de: "Farbe von Beinen und Schnabel: Orange #e8a22a, Grau #8a8a80.", en: "Colour of the legs and the beak: orange #e8a22a, grey #8a8a80." } },
    size: { type: "choice", options: ["chick", "hen"], default: "hen", label: { de: "Größe", en: "Size" },
      labels: { chick: { de: "Küken", en: "Chick" }, hen: { de: "Henne", en: "Hen" } },
      describe: { de: "Küken sind 8 Pixel hoch, Hennen 12 (ohne Kamm und Schwanz).", en: "A chick is 8 pixels tall, a hen 12 (without comb and tail)." } },
    tail: { type: "choice", options: ["short", "plume"], default: "short", label: { de: "Schwanz", en: "Tail" },
      labels: { short: { de: "kurz", en: "Short" }, plume: { de: "Schweif", en: "Plume" } },
      describe: { de: "Kurzer Stummel wie bei der Henne oder ein Hahnenschweif aus drei Federbögen über dem Rücken.", en: "A short stub like a hen's or a rooster tail of three feather arcs above the back." } },
    comb: { type: "boolean", default: true, label: { de: "Kamm", en: "Comb" },
      describe: { de: "Roter Kamm auf dem Kopf und Kehllappen unter dem Schnabel.", en: "Red comb on the head and a wattle under the beak." } },
  },
  presets: {
    hen: { label: { de: "Henne", en: "Hen" }, values: { size: "hen", bodyColour: "#f2efe6", tail: "short", comb: true } },
    rooster: { label: { de: "Hahn", en: "Rooster" }, values: { size: "hen", bodyColour: "#8a5a34", tail: "plume", comb: true } },
    chick: { label: { de: "Küken", en: "Chick" }, values: { size: "chick", bodyColour: "#f2d04a", tail: "short", comb: false } },
  },
  frame: { w: W, h: H },
  directions: ["left", "right"],
  animations: [
    { name: "idle", frames: 1, fps: 1, loop: true },
    { name: "walk", frames: 4, fps: 8, loop: true },
    { name: "peck", frames: 3, fps: 6, loop: false },
  ],
  grounded: true,
  build(p) {
    const k = ramp(p.bodyColour), kamm = ramp(p.combColour), bein = ramp(p.legColour), augen = ramp(p.bodyColour).deep;
    const hen = p.size === "hen", boden = 14;
    const hh = hen ? 4 : 3, hy = hen ? 3 : 7, hx = 8;
    const rechts = (animation: string, f: number): Pixels => {
      const b = new Pixels(W, H);
      // Head: bobs forward one pixel on walk frames 2 and 4; pecking puts it on the ground in front
      let dx = animation === "walk" && f % 2 ? 1 : 0, dy = 0;
      if (animation === "peck" && f === 1) { dx = 2; dy = boden - (hy + hh - 1); }
      // Legs: one steps forward while the other goes back, then both pass under the body
      const schritt = animation === "walk" ? [1, 0, -1, 0][f] : 0;
      [[hen ? 5 : 4, schritt], [hen ? 8 : 7, -schritt]].forEach(([x, s]) => {
        if (hen) b.set(x, boden - 1, bein.dark);
        b.set(x + s, boden, bein.base); b.set(x + s + 1, boden, bein.base);
      });
      // Tail behind the back: a stub, or three arcs of feathers
      const oben = hen ? 6 : 8;
      if (p.tail === "plume") {
        const bogen = [[[1, oben + 1], [0 + 1, oben - 1], [2, oben - 3], [3, oben - 3]], [[2, oben], [2, oben - 2], [3, oben - 2], [4, oben - 2]], [[1, oben + 2], [1, oben], [1, oben - 2]]];
        bogen.forEach((a, i) => a.forEach(([x, y]) => b.set(x, y, [k.dark, k.light, k.deep][i])));
      } else {
        b.set(1, oben + 1, k.dark); b.set(2, oben, k.base); b.set(1, oben, k.base);
      }
      // Body
      if (hen) b.ellipse(6.5, 9.5, 4.6, 3.4, k); else b.ellipse(5.5, 11, 3.6, 2.7, k);
      b.set(hen ? 5 : 4, hen ? 9 : 11, k.dark); b.set(hen ? 6 : 5, hen ? 9 : 11, k.dark);
      // Head, eye, beak, comb and wattle
      const x0 = hx + dx, y0 = hy + dy;
      b.part(x0, y0, hh, hh, k, true);
      b.set(x0 + hh - 2, y0 + 1, augen);
      b.set(x0 + hh, y0 + hh - 2, bein.light);
      if (p.comb) {
        b.set(x0 + hh - 3, y0 - 1, kamm.base); if (hen) b.set(x0 + hh - 2, y0 - 1, kamm.light);
        if (y0 + hh <= boden) b.set(x0 + hh - 1, y0 + hh, kamm.dark);
      }
      return b;
    };
    return (animation, d, f) => (d === "right" ? rechts(animation, f) : rechts(animation, f).mirrored());
  },
});
