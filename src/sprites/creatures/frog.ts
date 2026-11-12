import { Pixels, ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 16, H = 16;
const PUPILLE = ramp("#1c1526");

type Pose = "stand" | "crouch" | "air" | "land";

export const frog = defineSprite({
  id: "frog", category: "creatures",
  title: { de: "Frosch", en: "Frog" },
  description: {
    de: "Ein kleiner Frosch in vier Blickrichtungen, der atmet und hüpft: Größe, Farben, Augen und Flecken frei wählbar. 16 × 16 Pixel pro Bild, Füße auf der untersten Zeile, im Sprung in der Luft eine Zeile höher.",
    en: "A small frog in four views that breathes and hops: size, colours, eyes and spots as you like. 16 × 16 pixels per frame, feet on the bottom row, one row higher in the air when hopping.",
  },
  params: {
    size: { type: "choice", options: ["small", "large"], default: "small", label: { de: "Größe", en: "Size" },
      labels: { small: { de: "klein", en: "small" }, large: { de: "groß", en: "large" } },
      describe: { de: "Wie groß der Frosch: klein wie ein Laubfrosch von zwei Zentimetern, groß wie ein Wasserfrosch von acht Zentimetern.", en: "How big the frog is: small like a two-centimetre tree frog, large like an eight-centimetre water frog." } },
    bodyColour: { type: "color", default: "#5f9e46", label: { de: "Rücken", en: "Back" },
      describe: { de: "Farbe des Rückens: Grasgrün #5f9e46, Blattgrün #66cc44, Krötenbraun #7a5a38, Giftblau #3a6ad8.", en: "Colour of the back: grass green #5f9e46, leaf green #66cc44, toad brown #7a5a38, poison blue #3a6ad8." } },
    bellyColour: { type: "color", default: "#d8e6b8", label: { de: "Bauch", en: "Belly" },
      describe: { de: "Farbe von Bauch und Kehle, meist heller als der Rücken: Creme #d8e6b8, Gelb #e8d06a.", en: "Colour of belly and throat, usually lighter than the back: cream #d8e6b8, yellow #e8d06a." } },
    eyeSize: { type: "integer", min: 1, max: 3, default: 2, label: { de: "Augen", en: "Eyes" },
      describe: { de: "Größe der Augenknubbel in Pixeln: 1 dezent, 2 üblich, 3 groß wie beim Laubfrosch.", en: "Size of the eye bumps in pixels: 1 modest, 2 usual, 3 big like a tree frog's." } },
    spots: { type: "boolean", default: false, label: { de: "Flecken", en: "Spots" },
      describe: { de: "Dunkle Flecken auf dem Rücken: das Muster einer Kröte, bei Giftfröschen schwarz auf Blau.", en: "Darker spots on the back: the pattern of a toad, on poison frogs black on blue." } },
  },
  presets: {
    "tree-frog": { label: { de: "Laubfrosch", en: "Tree frog" }, values: { bodyColour: "#66cc44", bellyColour: "#dceeb4", eyeSize: 3 } },
    toad: { label: { de: "Kröte", en: "Toad" }, values: { bodyColour: "#7a5a38", bellyColour: "#c9b688", size: "large", spots: true } },
    "poison-frog": { label: { de: "Giftfrosch", en: "Poison frog" }, values: { bodyColour: "#3a6ad8", bellyColour: "#243f7e", spots: true } },
  },
  frame: { w: W, h: H },
  directions: ["down", "left", "right", "up"],
  animations: [{ name: "idle", frames: 2, fps: 2, loop: true }, { name: "hop", frames: 4, fps: 8, loop: true }],
  grounded: true,
  build(p) {
    const k = ramp(p.bodyColour), bauch = ramp(p.bellyColour), e = p.eyeSize, gross = p.size === "large";
    const fleck = (b: Pixels, x: number, y: number) => { if (p.spots) b.set(x, y, k.deep); };

    // One frame facing right; left is its mirror. Crouched body, long back leg folded.
    const seite = (pose: Pose, puff: boolean) => {
      const b = new Pixels(W, H);
      const hub = pose === "air" ? -1 : 0, duck = pose === "crouch" || pose === "land" ? 1 : 0;
      const bred = pose === "land" ? 1 : pose === "crouch" ? 0.5 : 0;
      const rx = (gross ? 4 : 3.3) + bred, ry = (gross ? 2.9 : 2.3) - duck * 0.9;
      const ky = (gross ? 11 : 11.4) + duck * 0.6 + hub;
      if (pose === "air") {
        // stretched in the air: back leg trails behind, front leg reaches out, one row higher
        for (let t = 0; t <= 4; t++) b.set(Math.round(5 - t * 0.9), Math.round(11.5 + t * 0.35), k.dark);
        b.set(1, 13, k.base);
        for (let t = 0; t <= 3; t++) b.set(11 + t, 12, k.dark);
      } else {
        // folded back leg: thigh along the body, foot pointing back on the ground
        b.ellipse(4.5, 12.3 + duck * 0.3, 2.8 + bred * 0.5, 1.8, { ...k, base: k.dark, light: k.base });
        b.rect(1, 13, 3, 2, k.dark); b.set(1, 14, k.base);
        // front leg under the chin
        const fx = pose === "land" ? 11 : 10;
        b.rect(fx, 12, 2, 3, k.dark); b.set(fx + 2, 14, k.base);
      }
      b.ellipse(6.5, ky, rx, ry, k);
      b.ellipse(10, ky - (duck ? 0.2 : 0.4), (gross ? 2.6 : 2.2) + bred * 0.4, (gross ? 2.1 : 1.8) - duck * 0.4, k);
      // eye on top of the head, the mouth along the snout
      const ey = Math.round(ky - (gross ? 2.2 : 1.8));
      b.ellipse(9.3, ey, e, e, k);
      b.rect(9, Math.max(1, ey - Math.floor((e - 1) / 2)), 1, e, PUPILLE.deep);
      b.set(12, ky - (duck ? 0.5 : 1), k.dark); b.set(13, ky - (duck ? 0.5 : 1), k.dark);
      if (puff) { b.rect(10, ky + (duck ? 0.5 : 1), 3, 2, bauch.base); b.set(10, ky + (duck ? 0.5 : 1), bauch.light); }
      fleck(b, 4, Math.round(ky - ry + 1)); fleck(b, 7, Math.round(ky - ry)); fleck(b, 6, Math.round(ky - ry + 2));
      return b;
    };

    // From the front: two eyes on top of the head, throat between the front feet.
    const vorn = (pose: Pose, puff: boolean) => {
      const b = new Pixels(W, H);
      const hub = pose === "air" ? -1 : 0, duck = pose === "crouch" || pose === "land" ? 1 : 0;
      const bred = pose === "land" ? 1 : pose === "crouch" ? 0.5 : 0;
      const hy = (gross ? 11 : 11.4) + duck * 0.6 + hub, hw = (gross ? 4.5 : 3.7) + bred;
      // feet at the sides on the ground, in the air kicked out straight
      const fuss = (x: number) => {
        if (pose === "air") for (let t = 0; t <= 2; t++) b.set(x < 8 ? Math.max(1, x - t) : Math.min(14, x + t), 13, k.dark);
        else { b.rect(x, 13, 3, 2, k.dark); b.set(x < 8 ? 1 : 14, 14, k.base); }
      };
      fuss(duck ? 1 : 2); fuss(duck ? 12 : 11);
      b.ellipse(7.5, hy, hw, (gross ? 2.8 : 2.3) - duck * 0.8, k);
      // belly and throat between the feet
      if (puff) { b.rect(4, hy + 1, 8, 3, bauch.base); b.rect(5, hy + 1, 6, 1, bauch.light); b.rect(5, hy, 6, 1, k.dark); }
      else { b.rect(5, Math.min(13, Math.round(hy) + 2), 6, 2, bauch.base); b.rect(5, Math.round(hy) + 1, 6, 1, k.dark); }
      // the two eyes on top of the head
      for (const cx of [7.5 - (gross ? 2.6 : 2.1), 7.5 + (gross ? 2.6 : 2.1)]) {
        const ey = Math.round(hy - (gross ? 2.4 : 2));
        b.ellipse(cx, ey, e, e, k);
        b.rect(Math.round(cx), Math.max(1, ey - Math.floor((e - 1) / 2)), 1, e, PUPILLE.deep);
      }
      fleck(b, 4, Math.round(hy)); fleck(b, 11, Math.round(hy));
      fleck(b, 7, Math.round(hy - (gross ? 1.4 : 1.2))); fleck(b, 8, Math.round(hy - (gross ? 1.4 : 1.2)));
      return b;
    };

    // From behind: the back with its spots, both back legs at the sides.
    const hinten = (pose: Pose, puff: boolean) => {
      const b = new Pixels(W, H);
      const hub = pose === "air" ? -1 : 0, duck = pose === "crouch" || pose === "land" ? 1 : 0;
      const bred = pose === "land" ? 1 : pose === "crouch" ? 0.5 : 0;
      const by = (gross ? 11.3 : 11.6) + duck * 0.6 + hub;
      // back legs: haunch, foot on the ground; in the air kicked out straight
      for (const [hx, dir] of [[3.5, -1], [11.5, 1]] as const) {
        if (pose === "air") for (let t = 0; t <= 2; t++) b.set(Math.round(hx) + dir * t, 13, k.dark);
        else { b.ellipse(hx, 12.3 + duck * 0.3, 2, 1.6, { ...k, base: k.dark, light: k.base }); b.rect(dir < 0 ? 1 : 12, 13, 3, 2, k.dark); }
      }
      b.ellipse(7.5, by, (gross ? 4.4 : 3.6) + bred, (gross ? 2.9 : 2.4) - duck * 0.8, k);
      b.ellipse(7.5, by - (gross ? 2.6 : 2.2), gross ? 2.4 : 2, 1.2, { ...k, base: k.dark, light: k.base });
      if (puff) { b.set(2, Math.round(by), k.base); b.set(13, Math.round(by), k.base); b.set(2, Math.round(by) + 1, k.base); b.set(13, Math.round(by) + 1, k.base); }
      fleck(b, 5, Math.round(by) - 1); fleck(b, 10, Math.round(by) - 1);
      fleck(b, 7, Math.round(by) - 2); fleck(b, 8, Math.round(by) - 2);
      fleck(b, 6, Math.round(by) + 1); fleck(b, 9, Math.round(by) + 1);
      return b;
    };

    const spruenge: Pose[] = ["crouch", "air", "land", "crouch"];
    return (animation, d, f) => {
      const pose = animation === "hop" ? spruenge[f % 4] : "stand", puff = animation === "idle" && f === 1;
      if (d === "right") return seite(pose, puff);
      if (d === "left") return seite(pose, puff).mirrored();
      return d === "down" ? vorn(pose, puff) : hinten(pose, puff);
    };
  },
});
