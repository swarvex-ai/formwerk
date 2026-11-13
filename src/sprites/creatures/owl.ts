import { hex, Pixels, ramp } from "../../core/pixels";
import { rng } from "../../core/rng";
import { defineSprite } from "../define";

const W = 16, H = 16;

export const owl = defineSprite({
  id: "owl", category: "creatures",
  title: { de: "Eule", en: "Owl" },
  description: {
    de: "Eine Eule, die aufrecht sitzt und den Betrachter ansieht, atmet, blinzelt und die Augen schweifen lässt: Federn, Gesicht, Augen und Schnabel in freien Farben, mit oder ohne Federohren. 16 × 16 Pixel.",
    en: "An owl sitting upright and facing the viewer that breathes, blinks and looks around: feathers, face, eyes and beak in colours as you like, with or without ear tufts. 16 × 16 pixels.",
  },
  params: {
    featherColour: { type: "color", default: "#8a6a48", label: { de: "Federfarbe", en: "Feather colour" },
      describe: { de: "Farbe von Körper und Flügeln: Braun #8a6a48, Schneeeule #e8e8ec, Schleiereule #c8a070.", en: "Colour of the body and the wings: brown #8a6a48, snowy white #e8e8ec, barn owl #c8a070." } },
    faceColour: { type: "color", default: "#d8c8a8", label: { de: "Gesichtsfarbe", en: "Face colour" },
      describe: { de: "Farbe der hellen Gesichtsscheiben um die Augen: Beige #d8c8a8, Weiß #f8f8f8.", en: "Colour of the lighter facial discs around the eyes: beige #d8c8a8, white #f8f8f8." } },
    eyeColour: { type: "color", default: "#f0c419", label: { de: "Augenfarbe", en: "Eye colour" },
      describe: { de: "Farbe der Augen: Gelb #f0c419, Orange #f08a20 beim Uhu, fast Schwarz #26262e bei der Schleiereule.", en: "Colour of the eyes: yellow #f0c419, orange #f08a20 for an eagle owl, nearly black #26262e for a barn owl." } },
    beakColour: { type: "color", default: "#c8a040", label: { de: "Schnabelfarbe", en: "Beak colour" },
      describe: { de: "Farbe von Schnabel und Krallen: Hornfarben #c8a040, Grau #8a8a80.", en: "Colour of the beak and the talons: horn #c8a040, grey #8a8a80." } },
    ears: { type: "boolean", default: true, label: { de: "Federohren", en: "Ear tufts" },
      describe: { de: "Zwei Federbüschel von 1 Pixel an den oberen Ecken des Kopfes, wie beim Uhu; ohne sind sie rund wie bei der Schleiereule.", en: "Two 1-pixel feather tufts at the top corners of the head, as on an eagle owl; without them the head is round like a barn owl's." } },
    size: { type: "choice", options: ["small", "large"], default: "small", label: { de: "Größe", en: "Size" },
      labels: { small: { de: "Klein", en: "Small" }, large: { de: "Groß", en: "Large" } },
      describe: { de: "Klein: Körper 8 Pixel breit und 11 hoch, wie ein Waldkauz; groß: 10 breit und 12 hoch, wie ein Uhu.", en: "Small: body 8 pixels wide and 11 tall, like a tawny owl; large: 10 wide and 12 tall, like an eagle owl." } },
    pattern: { type: "choice", options: ["plain", "speckled", "barred"], default: "plain", label: { de: "Muster", en: "Pattern" },
      labels: { plain: { de: "Einfarbig", en: "Plain" }, speckled: { de: "Gesprenkelt", en: "Speckled" }, barred: { de: "Gebändert", en: "Barred" } },
      describe: { de: "Brust einfarbig, mit einzelnen hellen Punkten (Platz nach dem Seed) oder mit dunklen Querbändern alle 2 Zeilen.", en: "Chest plain, with single lighter dots (placed by the seed) or with darker cross bars every 2 rows." } },
  },
  presets: {
    "brown-owl": { label: { de: "Waldkauz", en: "Brown owl" }, values: { featherColour: "#8a6a48", faceColour: "#d8c8a8", eyeColour: "#f0c419", beakColour: "#c8a040", ears: true, size: "small", pattern: "plain" } },
    snowy: { label: { de: "Schneeeule", en: "Snowy owl" }, values: { featherColour: "#e8e8ec", faceColour: "#f8f8f8", ears: false, pattern: "speckled" } },
    "eagle-owl": { label: { de: "Uhu", en: "Eagle owl" }, values: { size: "large", featherColour: "#a06a30", eyeColour: "#f08a20", pattern: "barred" } },
    "barn-owl": { label: { de: "Schleiereule", en: "Barn owl" }, values: { featherColour: "#c8a070", faceColour: "#f4ece0", eyeColour: "#26262e", ears: false } },
  },
  frame: { w: W, h: H },
  directions: ["down"],
  animations: [
    { name: "idle", frames: 2, fps: 2, loop: true },
    { name: "blink", frames: 2, fps: 4, loop: false },
    { name: "look", frames: 2, fps: 2, loop: true },
  ],
  grounded: true,
  build(p, seed) {
    const k = ramp(p.featherColour), gesicht = ramp(p.faceColour), schnabel = ramp(p.beakColour).base;
    const auge = hex(p.eyeColour), boden = 14, gross = p.size === "large";
    const links = gross ? 3 : 4, rechts = 15 - links, oben = gross ? 2 : 3, hoehe = gross ? 12 : 11;
    // Speckles: places on the chest (offsets from the top of the body) fixed by the seed
    const r = rng(seed), punkte: [number, number][] = [];
    for (let i = 0; i < (gross ? 7 : 5); i++) punkte.push([links + 2 + Math.floor(r() * (rechts - links - 3)), 6 + Math.floor(r() * 4)]);
    return (animation, _d, f) => {
      const b = new Pixels(W, H), y0 = oben + (animation === "idle" ? f : 0), ay = y0 + 3;
      // Body and head in one piece; the wings are its darker sides
      b.ellipse(8, y0 + hoehe / 2, (rechts - links + 1) / 2, hoehe / 2, k);
      for (let y = y0 + 5; y < y0 + hoehe; y++) for (let x = 0; x < W; x++) {
        if (!b.alpha(x, y)) continue;
        if (x <= links + 1 || x >= rechts - 1) b.set(x, y, k.dark);
        else b.set(x, y, k.base);
      }
      // Chest pattern
      const brust = (x: number, y: number) => b.alpha(x, y) && x > links + 1 && x < rechts - 1 && y >= y0 + 6 && y < y0 + hoehe - 1;
      if (p.pattern === "speckled") punkte.forEach(([x, y]) => { if (brust(x, y0 + y)) b.set(x, y0 + y, gesicht.light); });
      if (p.pattern === "barred") for (let y = y0 + 6; y < y0 + hoehe - 1; y += 2) for (let x = links + 2; x < rechts - 1; x++) if (brust(x, y)) b.set(x, y, k.dark);
      // Ear tufts on the top corners of the head
      if (p.ears) { b.set(links + 2, y0 - 1, k.dark); b.set(rechts - 2, y0 - 1, k.dark); }
      // Facial discs with the eyes in them: pupils at the left (look 1), the right (look 2) or the middle
      b.ellipse(6, ay + 1, 2.2, 2.6, gesicht); b.ellipse(10, ay + 1, 2.2, 2.6, gesicht);
      const pupille = animation === "look" ? f : 1, dunkel = k.deep;
      for (const ex of [5, 9]) {
        if (animation === "blink" && f === 1) { b.rect(ex, ay + 1, 2, 1, dunkel); continue; }
        b.rect(ex, ay, 2, 2, auge);
        b.set(ex + pupille, ay + 1, dunkel);
      }
      b.set(7, ay + 2, schnabel);
      // Talons stay on the ground in every frame
      b.set(6, boden, schnabel); b.set(9, boden, schnabel);
      return b;
    };
  },
});
