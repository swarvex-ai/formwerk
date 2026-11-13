import { Pixels, ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 16, H = 16;
const PUPILLE = ramp("#1c1526").base;

export const hare = defineSprite({
  id: "hare", category: "creatures",
  title: { de: "Hase", en: "Hare" },
  description: {
    de: "Ein Hase oder Kaninchen im Profil für Wiesen, Wälder und Schneelevel: sitzt mit zuckender Nase, hüpft und richtet sich lauschend auf. Ohrenlänge, Fellfarbe, dunkle Ohrspitzen und weißes Schwänzchen frei wählbar. 16 × 16 Pixel.",
    en: "A hare or rabbit in profile for meadows, forests and snowy levels: sits with a twitching nose, hops and sits up to listen. Ear length, fur colour, dark ear tips and white tail tuft as you like. 16 × 16 pixels.",
  },
  params: {
    furColour: { type: "color", default: "#a08060", label: { de: "Fellfarbe", en: "Fur colour" },
      describe: { de: "Grundfarbe des Fells: Feldhasenbraun #a08060, Winterweiß #eef2f6, Grau #c8c0b8.", en: "Base colour of the fur: brown hare #a08060, winter white #eef2f6, grey #c8c0b8." } },
    bellyColour: { type: "color", default: "#e8dcc8", label: { de: "Bauchfarbe", en: "Belly colour" },
      describe: { de: "Farbe von Bauch, Nase und Schwänzchen, heller als das Fell: Creme #e8dcc8, Weiß #ffffff.", en: "Colour of belly, nose and tail, lighter than the fur: cream #e8dcc8, white #ffffff." } },
    ears: { type: "integer", min: 3, max: 5, default: 4, label: { de: "Ohrenlänge", en: "Ear length" },
      describe: { de: "Länge der Ohren in Pixeln: 3 kurz wie beim Kaninchen, 4 üblich, 5 lang wie beim Feldhasen.", en: "Length of the ears in pixels: 3 short like a rabbit, 4 usual, 5 long like a brown hare." } },
    earTips: { type: "boolean", default: true, label: { de: "Ohrspitzen", en: "Ear tips" },
      describe: { de: "Dunkle Spitzen an den Ohren wie beim Feldhasen; aus für ein Kaninchen.", en: "Dark tips on the ears like a brown hare; off for a rabbit." } },
    tail: { type: "boolean", default: true, label: { de: "Schwänzchen", en: "Tail" },
      describe: { de: "Weißes Schwänzchen von 2 × 2 Pixeln am Hinterteil.", en: "A white tail tuft of 2 × 2 pixels at the rear." } },
  },
  presets: {
    "brown-hare": { label: { de: "Feldhase", en: "Brown hare" }, values: { furColour: "#a08060", bellyColour: "#e8dcc8" } },
    "snow-hare": { label: { de: "Schneehase", en: "Snow hare" }, values: { furColour: "#eef2f6", bellyColour: "#ffffff" } },
    bunny: { label: { de: "Kaninchen", en: "Bunny" }, values: { furColour: "#c8c0b8", ears: 3, earTips: false } },
  },
  frame: { w: W, h: H },
  directions: ["left", "right"],
  animations: [
    { name: "idle", frames: 2, fps: 2, loop: true },
    { name: "hop", frames: 4, fps: 8, loop: true },
    { name: "alert", frames: 2, fps: 3, loop: true },
  ],
  grounded: true,
  build(p) {
    const k = ramp(p.furColour), bauch = ramp(p.bellyColour), n = p.ears;
    // by: body shift, hy: head and ears shift, up: the front half of the body is raised by this much from x 7 on
    const rechts = (animation: string, f: number): Pixels => {
      const b = new Pixels(W, H);
      let by = 0, hy = 0, up = 0, extra = 0, farCut = 0;
      let hind: "foot" | "diag" = "foot", paw = [10, 13], pawW = 2;
      if (animation === "idle") farCut = f;
      else if (animation === "hop") {
        if (f === 0 || f === 3) by = hy = 1;
        else {
          by = hy = -1; hind = "diag"; pawW = 2;
          paw = f === 1 ? [12, 12] : [12, 13];
        }
      } else {
        hy = -1; up = 1; paw = [10, 12];
        if (f === 1 && 6 - n - 1 >= 1) extra = 1;
      }
      // tail tuft
      if (p.tail) b.rect(2, 10 + by, 2, 2, bauch.light);
      // hind foot
      if (hind === "foot") for (let x = 4; x <= 8; x++) b.set(x, 14, k.dark);
      else for (let t = 0; t < 3; t++) { b.set(3 + t, 12 + t, k.dark); b.set(4 + t, 12 + t, k.dark); }
      // front paws
      b.rect(paw[0], paw[1], pawW, 2, k.dark);
      // body, front half raised when sitting up
      const body = new Pixels(W, H), top = new Pixels(W, H);
      body.ellipse(7, 11.5 + by, 4, 2.5, k);
      if (up) {
        top.ellipse(7, 11.5 + by - up, 4, 2.5, k);
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          const src = x >= 7 ? top : body;
          if (src.alpha(x, y)) b.set(x, y, src.get(x, y));
        }
      } else b.blit(body, 0, 0);
      // belly: lowest body row
      const bottom = 14 + by;
      for (let x = 6; x <= 9; x++) if (!up && b.alpha(x, bottom)) b.set(x, bottom, bauch.base);
      if (up) for (let x = 6; x <= 9; x++) if (b.alpha(x, 13)) b.set(x, 13, bauch.base);
      // ears: far then near, so the near ear stays in front
      const topNear = 7 - n + hy - extra;
      for (let y = topNear + 1 + farCut; y <= 6 + hy; y++) b.set(9, y, k.deep);
      for (let y = topNear; y <= 6 + hy; y++) for (const x of [10, 11]) b.set(x, y, p.earTips && y < topNear + 2 ? k.deep : k.base);
      // head, eye, nose
      b.ellipse(11.5, 8.5 + hy, 2, 2, k);
      b.set(12, 8 + hy, PUPILLE);
      b.set(13, (animation === "idle" && f === 1 ? 8 : 9) + hy, bauch.light);
      return b;
    };
    return (animation, d, f) => (d === "right" ? rechts(animation, f) : rechts(animation, f).mirrored());
  },
});
