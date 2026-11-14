import { CLEAR, Pixels, ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 16, H = 16;

export const duck = defineSprite({
  id: "duck", category: "creatures",
  title: { de: "Ente", en: "Duck" },
  description: {
    de: "Eine Ente im Profil für Teiche, Höfe und Parks: steht, watschelt und schwimmt tief im Wasser mit einer kleinen Welle. Stockerpel mit grünem Kopf und weißem Halsring, gesprenkelte Ente, gelbes Küken oder weiße Hausente. 16 × 16 Pixel.",
    en: "A duck in profile for ponds, farms and parks: stands, waddles and swims low in the water with a small ripple. Mallard drake with a green head and a white neck ring, mottled hen, yellow duckling or white farm duck. 16 × 16 pixels.",
  },
  params: {
    bodyColour: { type: "color", default: "#8e8574", label: { de: "Körperfarbe", en: "Body colour" },
      describe: { de: "Farbe des Gefieders am Körper: Stockerpel Graubraun #8e8574, Ente Braun #8a6a44, Küken Gelb #f2d04a, Hausente Weiß #f2efe6.", en: "Colour of the body feathers: mallard drake grey-brown #8e8574, hen brown #8a6a44, duckling yellow #f2d04a, farm duck white #f2efe6." } },
    headColour: { type: "color", default: "#2f6b3a", label: { de: "Kopffarbe", en: "Head colour" },
      describe: { de: "Farbe von Kopf und Hals: Stockerpel Grün #2f6b3a, Ente Braun #7a5a38, Küken Gelb #f2d04a, Hausente Weiß #f2efe6.", en: "Colour of the head and the neck: mallard drake green #2f6b3a, hen brown #7a5a38, duckling yellow #f2d04a, farm duck white #f2efe6." } },
    billColour: { type: "color", default: "#e0b53a", label: { de: "Schnabelfarbe", en: "Bill colour" },
      describe: { de: "Farbe von Schnabel und Füßen: Stockerpel Gelb #e0b53a, Ente Orangebraun #c8823a, Hausente Orange #e8902a.", en: "Colour of the bill and the feet: mallard drake yellow #e0b53a, hen orange-brown #c8823a, farm duck orange #e8902a." } },
    size: { type: "choice", options: ["duckling", "adult"], default: "adult", label: { de: "Größe", en: "Size" },
      labels: { duckling: { de: "Küken", en: "Duckling" }, adult: { de: "Erwachsen", en: "Adult" } },
      describe: { de: "Ein Küken ist 10 Pixel hoch mit rundem Körper, eine erwachsene Ente 12 Pixel hoch mit langem Körper und Hals.", en: "A duckling is 10 pixels tall with a round body, an adult duck 12 pixels tall with a long body and a neck." } },
    ring: { type: "boolean", default: true, label: { de: "Halsring", en: "Neck ring" },
      describe: { de: "Weißer Ring unten am Hals wie beim Stockerpel; Enten und Küken haben keinen.", en: "White ring at the bottom of the neck like a mallard drake's; hens and ducklings have none." } },
    mottled: { type: "boolean", default: false, label: { de: "Gesprenkelt", en: "Mottled" },
      describe: { de: "Dunkle Tupfen im Gefieder wie bei der braunen Stockente; aus für glatte Erpel, Küken und Hausenten.", en: "Dark speckles in the feathers like a brown mallard hen's; off for smooth drakes, ducklings and farm ducks." } },
  },
  presets: {
    mallard: { label: { de: "Stockerpel", en: "Mallard drake" }, values: { size: "adult", bodyColour: "#8e8574", headColour: "#2f6b3a", billColour: "#e0b53a", ring: true, mottled: false } },
    hen: { label: { de: "Stockente", en: "Mallard hen" }, values: { size: "adult", bodyColour: "#8a6a44", headColour: "#7a5a38", billColour: "#c8823a", ring: false, mottled: true } },
    duckling: { label: { de: "Entenküken", en: "Duckling" }, values: { size: "duckling", bodyColour: "#f2d04a", headColour: "#f2d04a", billColour: "#e8902a", ring: false, mottled: false } },
    white: { label: { de: "Hausente", en: "Farm duck" }, values: { size: "adult", bodyColour: "#f2efe6", headColour: "#f2efe6", billColour: "#e8902a", ring: false, mottled: false } },
  },
  frame: { w: W, h: H },
  directions: ["left", "right"],
  animations: [
    { name: "idle", frames: 1, fps: 1, loop: true },
    { name: "walk", frames: 4, fps: 8, loop: true },
    { name: "swim", frames: 2, fps: 3, loop: true },
  ],
  grounded: true,
  build(p) {
    const k = ramp(p.bodyColour), kopf = ramp(p.headColour), schnabel = ramp(p.billColour), weiss = ramp("#f4f2ea");
    const wasser = ramp("#5a9ad8"), augen = ramp(p.headColour).deep;
    const gross = p.size === "adult", boden = 14;
    const rechts = (animation: string, f: number): Pixels => {
      const b = new Pixels(W, H);
      const schwimmt = animation === "swim", laeuft = animation === "walk";
      // Waddle: the body rocks up one pixel on frames 2 and 4 while the legs pass under it; swimming sinks it low
      const dy = schwimmt ? (gross ? 2 : 1) : laeuft && f % 2 ? -1 : 0;
      // The head bobs forward with every step and paddles forward a pixel on the second swim frame
      const vor = (laeuft || schwimmt) && f % 2 ? 1 : 0;
      // Legs and webbed feet (not when swimming): one steps forward while the other goes back
      if (!schwimmt) {
        const schritt = laeuft ? [1, 0, -1, 0][f] : 0;
        [[gross ? 6 : 5, schritt], [gross ? 9 : 7, -schritt]].forEach(([x, s]) => {
          for (let y = 12 + dy; y < boden; y++) b.set(x, y, schnabel.dark);
          b.set(x + s, boden, schnabel.base); b.set(x + s + 1, boden, schnabel.base);
        });
      }
      const hx = (gross ? 8 : 7) + vor, hy = (gross ? 3 : 5) + dy;
      const kopfZeichnen = () => {
        b.part(hx, hy, 4, 4, kopf, true);
        b.set(hx + 2, hy + 1, augen);
        // A flat bill: two pixels long at the height of the eye's lower edge, the underside darker
        b.set(hx + 4, hy + 2, schnabel.light); b.set(hx + 5, hy + 2, schnabel.base);
        b.set(hx + 4, hy + 3, schnabel.dark);
      };
      // The duckling's head sits straight on its round body, so the body covers the head's lower edge
      if (!gross) kopfZeichnen();
      // Body: a long low oval (a round ball for the duckling) with a darker wing along the side
      const cx = gross ? 7 : 6, cy = (gross ? 10 : 11) + dy, my = Math.round(cy);
      b.ellipse(cx, cy, gross ? 5.2 : 3.8, gross ? 2.7 : 2.4, k);
      const wx = cx - (gross ? 3 : 2);
      for (let n = 0; n < (gross ? 6 : 4); n++) b.set(wx + n, my - (gross ? 1 : 0) + (n > (gross ? 2 : 1) ? 1 : 0), k.dark);
      if (p.mottled) [[-4, 0], [-1, -1], [2, -1], [-2, 1], [1, 1], [3, 0]].forEach(([x, y]) => {
        if (b.alpha(cx + x, my + y)) b.set(cx + x, my + y, k.deep);
      });
      // Tail: a short flick up and back behind the body
      if (gross) { b.set(2, my - 2, k.base); b.set(1, my - 3, k.base); b.set(1, my - 4, k.light); }
      else { b.set(2, my - 2, k.base); b.set(2, my - 3, k.light); }
      // The adult's neck rises from the front of the body, with the white ring at its foot
      if (gross) {
        b.rect(hx + 1, hy + 4, 2, 2, kopf.base); b.set(hx + 2, hy + 5, kopf.dark);
        if (p.ring) { b.set(hx + 1, hy + 5, weiss.base); b.set(hx + 2, hy + 5, weiss.dark); }
        kopfZeichnen();
      }
      if (schwimmt) {
        // Under the waterline the body is hidden; a ripple runs along the water in front of and behind it
        for (let x = 1; x < W - 1; x++) b.set(x, boden, CLEAR);
        const welle = f % 2 ? [1, 2, 4, 5, 6, 7, 8, 9, 10, 12, 13] : [2, 3, 4, 5, 6, 7, 8, 9, 11, 12];
        welle.forEach((x) => b.set(x, boden, (x + f) % 3 ? wasser.light : wasser.base));
      }
      return b;
    };
    return (animation, d, f) => (d === "right" ? rechts(animation, f) : rechts(animation, f).mirrored());
  },
});
