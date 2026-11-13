import { rng } from "../../core/rng";
import { Pixels, ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 16, H = 16;

export const cat = defineSprite({
  id: "cat", category: "creatures",
  title: { de: "Katze", en: "Cat" },
  description: {
    de: "Eine Hauskatze im Profil für Tavernen, Höfe und Städte: sitzt mit eingerolltem Schwanz, läuft mit hochgehaltenem Schwanz und schläft als Brötchen. Kätzchen oder Katze, einfarbig, getigert oder mit weißen Socken. 16 × 16 Pixel.",
    en: "A house cat in profile for taverns, farms and towns: sits with its tail curled, walks with its tail held up and sleeps curled into a loaf. Kitten or cat, plain, tabby or with white socks. 16 × 16 pixels.",
  },
  params: {
    furColour: { type: "color", default: "#d8843a", label: { de: "Fellfarbe", en: "Fur colour" },
      describe: { de: "Grundfarbe des Fells: Orange #d8843a, Schwarz #2a2a30, Grau #a8a8a8.", en: "Base colour of the fur: ginger #d8843a, black #2a2a30, grey #a8a8a8." } },
    markColour: { type: "color", default: "#8a4a1e", label: { de: "Zeichnungsfarbe", en: "Mark colour" },
      describe: { de: "Farbe der Tigerstreifen auf Rücken und Schwanz: Braun #8a4a1e, Dunkelgrau #5a5a60.", en: "Colour of the tabby stripes on back and tail: brown #8a4a1e, dark grey #5a5a60." } },
    pattern: { type: "choice", options: ["plain", "tabby", "socks"], default: "tabby", label: { de: "Zeichnung", en: "Pattern" },
      labels: { plain: { de: "Einfarbig", en: "Plain" }, tabby: { de: "Getigert", en: "Tabby" }, socks: { de: "Socken", en: "Socks" } },
      describe: { de: "Einfarbig, getigert (3 bis 4 Streifen von 1 Pixel auf Rücken und Schwanz) oder Socken (weiße Pfoten und weiße Brust).", en: "Plain, tabby (3 to 4 stripes of 1 pixel on back and tail) or socks (white feet and white chest)." } },
    size: { type: "choice", options: ["kitten", "cat"], default: "cat", label: { de: "Größe", en: "Size" },
      labels: { kitten: { de: "Kätzchen", en: "Kitten" }, cat: { de: "Katze", en: "Cat" } },
      describe: { de: "Körperlänge 6 Pixel beim Kätzchen (mit größerem Kopf im Verhältnis) und 9 Pixel bei der Katze.", en: "Body length 6 pixels for a kitten (with a bigger head relative to the body) and 9 pixels for a cat." } },
    ears: { type: "choice", options: ["pointed", "folded"], default: "pointed", label: { de: "Ohren", en: "Ears" },
      labels: { pointed: { de: "Spitz", en: "Pointed" }, folded: { de: "Geknickt", en: "Folded" } },
      describe: { de: "Aufrechte, spitze Ohren oder an den Kopf geklappte Ohren wie bei der Schottischen Faltohrkatze.", en: "Upright pointed ears or ears folded flat against the head like a Scottish Fold." } },
    eyeColour: { type: "color", default: "#9ad04a", label: { de: "Augenfarbe", en: "Eye colour" },
      describe: { de: "Farbe des Augenpixels: Grün #9ad04a, Gelb #e8c84a, Blau #6aa8e0.", en: "Colour of the eye pixel: green #9ad04a, yellow #e8c84a, blue #6aa8e0." } },
  },
  presets: {
    ginger: { label: { de: "Roter Kater", en: "Ginger" }, values: { furColour: "#d8843a", pattern: "tabby" } },
    black: { label: { de: "Schwarze Katze", en: "Black cat" }, values: { furColour: "#2a2a30", pattern: "plain", eyeColour: "#e8c84a" } },
    tuxedo: { label: { de: "Smokingkatze", en: "Tuxedo" }, values: { furColour: "#2a2a30", pattern: "socks" } },
    kitten: { label: { de: "Kätzchen", en: "Kitten" }, values: { size: "kitten", furColour: "#a8a8a8", markColour: "#5a5a60" } },
  },
  frame: { w: W, h: H },
  directions: ["left", "right"],
  animations: [
    { name: "idle", frames: 2, fps: 2, loop: true },
    { name: "walk", frames: 4, fps: 8, loop: true },
    { name: "sleep", frames: 2, fps: 1, loop: true },
  ],
  grounded: true,
  build(p, seed) {
    const k = ramp(p.furColour), mark = ramp(p.markColour).base, weiss = ramp("#f4f0ea"), auge = ramp(p.eyeColour).base;
    const nase = ramp("#e89090").base, zu = ramp("#1a1418").base;
    const tabby = p.pattern === "tabby", socks = p.pattern === "socks", kitten = p.size === "kitten";
    const boden = 14, hs = kitten ? 5 : 4, hx = 11 - hs, bx = 11 - (kitten ? 6 : 9), tw = kitten ? 4 : 7;
    const versatz = Math.floor(rng(seed)() * 2);
    // Stripes across the back (top row of the torso) in the mark colour: 3 or 4 on a cat, 2 on a kitten
    const streifen = (b: Pixels, x0: number, w: number, y: number) => {
      if (!tabby) return;
      for (let x = x0 + (kitten ? 0 : versatz); x < x0 + w; x += 2) { b.set(x, y, mark); b.set(x, y + 1, mark); }
    };
    // A tail from its root to its tip; every second pixel is striped on a tabby, darker on the others
    const schwanz = (b: Pixels, pts: number[][]) => pts.forEach(([x, y], i) => b.set(x, y, i % 2 ? (tabby ? mark : k.dark) : k.base));
    const pfote = (b: Pixels, x: number, y: number, hoch = false) => {
      b.set(x, y, socks ? weiss.base : k.dark);
      if (!hoch) b.set(x, y + 1, socks ? weiss.light : k.deep);
    };
    // Head with two ear pixels, one eye pixel (a dark line when asleep) and a nose
    const kopf = (b: Pixels, y: number, schlaf = false) => {
      b.part(hx, y, hs, 4, k, true);
      if (p.ears === "pointed") { b.set(hx + 1, y - 1, k.base); b.set(hx + hs - 2, y - 1, k.dark); }
      else { b.set(hx, y, k.dark); b.set(hx + hs - 1, y, k.dark); }
      if (schlaf) { b.set(hx + hs - 3, y + 1, zu); b.set(hx + hs - 2, y + 1, zu); }
      else b.set(hx + hs - 2, y + 1, auge);
      b.set(hx + hs - 1, y + 2, nase);
    };
    const rechts = (animation: string, f: number): Pixels => {
      const b = new Pixels(W, H);
      if (animation === "idle") {
        // Sitting upright: haunches and chest as one block, two front paws, tail curled on the ground
        const sw = kitten ? 4 : 5, sx = 9 - sw + 1, bh = kitten ? 5 : 7, by = boden - bh;
        b.part(sx, by, sw, bh, k, true);
        streifen(b, sx, sw - 1, by + 1);
        for (let x = sx + 1; x < sx + sw; x++) pfote(b, x, boden - 1);
        if (socks) b.rect(sx + sw - 1, by + 2, 1, bh - 4, weiss.base);
        kopf(b, by - 3);
        const tip = f ? 13 : 14;
        schwanz(b, [[sx - 1, boden], [sx - 2, boden], [sx - 3, tip]]);
      } else if (animation === "walk") {
        const bh = kitten ? 3 : 4, ty = 13 - bh;
        // Legs in diagonal pairs: rear near + front far, then rear far + front near; a lifted paw stops one pixel up
        const hinten = kitten ? [bx, bx + 1] : [bx + 1, bx + 2], vorn = kitten ? [bx + 2, bx + 3] : [bx + tw - 3, bx + tw - 2];
        const paarA = [hinten[0], vorn[1]], paarB = [hinten[1], vorn[0]];
        const hoch = f === 0 ? paarA : f === 2 ? paarB : [];
        const vor = f === 1 ? paarA : f === 3 ? paarB : [];
        [...hinten, ...vorn].forEach((x) => pfote(b, x + (vor.includes(x) ? 1 : 0), boden - 1, hoch.includes(x)));
        b.part(bx, ty, tw, bh, k, true);
        streifen(b, bx + (kitten ? 0 : 1), tw - 1, ty);
        if (socks) b.rect(bx + tw - 1, ty + 1, 1, bh - 2, weiss.base);
        kopf(b, ty - (kitten ? 2 : 1));
        // Tail up in a hook towards the head
        const n = kitten ? 3 : 4;
        schwanz(b, [...Array.from({ length: n }, (_, i) => [bx - 1, ty + 1 - i]), [bx, ty + 1 - n]]);
      } else {
        // Loaf: body low on the ground, back rises one pixel on frame 2, head resting, tail along the front
        const bh = 4 + f, ty = boden + 1 - bh;
        b.part(bx, ty, tw, bh, k, true);
        streifen(b, bx + (kitten ? 0 : 1), tw - 1, ty);
        kopf(b, boden - 3, true);
        const t = Array.from({ length: hx + 3 - bx }, (_, i) => [bx - 1 + i, boden]);
        schwanz(b, t);
        if (socks) b.set(hx + hs - 1, boden, weiss.base);
      }
      return b;
    };
    return (animation, d, f) => (d === "right" ? rechts(animation, f) : rechts(animation, f).mirrored());
  },
});
