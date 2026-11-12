import { Pixels, ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 16, H = 16;

export const fish = defineSprite({
  id: "fish", category: "creatures",
  title: { de: "Fisch", en: "Fish" },
  description: {
    de: "Ein Fisch im Profil für Wasser- und Angelspiele: Body-, Flossen- und Bauchfarbe, Form, Muster und Größe frei, mit Schweben, Schwimmen und Zappeln an Land. 16 × 16 Pixel pro Bild, Kopf nach rechts, Schwanzflosse links.",
    en: "A fish in profile for water levels and fishing games: body, fin and belly colour, shape, pattern and size as you like, with idling, swimming and flopping on land. 16 × 16 pixels per frame, head to the right, tail fin on the left.",
  },
  params: {
    bodyColour: { type: "color", default: "#6f97b5", label: { de: "Körperf", en: "Body colour" },
      describe: { de: "Farbe des Körpers: Blau #6f97b5, Oliv #6b7a4a für eine Forelle, Goldbraun #a67c34 für einen Karpfen.", en: "Colour of the body: blue #6f97b5, olive #6b7a4a for a trout, golden brown #a67c34 for a carp." } },
    finColour: { type: "color", default: "#3f6480", label: { de: "Flossen", en: "Fins" },
      describe: { de: "Farbe von Schwanz- und Rückenflosse sowie des Musters: dunkler als der Körper, Orange #d0682a beim Barsch.", en: "Colour of the tail and dorsal fin and of the pattern: darker than the body, orange #d0682a on a perch." } },
    bellyColour: { type: "color", default: "#dfe7ee", label: { de: "Bauch", en: "Belly" },
      describe: { de: "Die hellere Unterseite des Fisches: Hellgrau #dfe7ee, Cremeweiß #e8e8c8 beim Barsch.", en: "The lighter underside of the fish: light grey #dfe7ee, cream #e8e8c8 on a perch." } },
    shape: { type: "choice", options: ["slim", "round"], default: "slim", label: { de: "Form", en: "Shape" },
      labels: { slim: { de: "schlank", en: "slim" }, round: { de: "rund", en: "round" } },
      describe: { de: "Körperform: schlank 12 Pixel lang und 4 hoch wie eine Forelle, rund 10 lang und 7 hoch wie ein Karpfen.", en: "Body shape: slim 12 pixels long and 4 tall like a trout, round 10 long and 7 tall like a carp." } },
    stripes: { type: "choice", options: ["none", "bars", "spots"], default: "none", label: { de: "Muster", en: "Pattern" },
      labels: { none: { de: "ohne", en: "none" }, bars: { de: "Binden", en: "bars" }, spots: { de: "Flecken", en: "spots" } },
      describe: { de: "Zeichnung auf dem Körper in Flossenfarbe: ohne, verticale Binde wie beim Barsch, oder Punkte wie bei der Forelle.", en: "Marking on the body in the fin colour: none, vertical bars like a perch, or dots like a trout." } },
    size: { type: "choice", options: ["small", "large"], default: "large", label: { de: "Größe", en: "Size" },
      labels: { small: { de: "klein", en: "small" }, large: { de: "groß", en: "large" } },
      describe: { de: "Größe im Bild: klein ist 2 Pixel kürzer und 1 Pixel niedriger, groß füllt die Form ihre volle Länge.", en: "Size in the frame: small is 2 pixels shorter and 1 pixel lower, large fills the shape's full length." } },
  },
  presets: {
    trout: { label: { de: "Forelle", en: "Trout" }, values: { shape: "slim", bodyColour: "#6b7a4a", stripes: "spots", finColour: "#4f5a34", bellyColour: "#dfe0d0" } },
    carp: { label: { de: "Karpfen", en: "Carp" }, values: { shape: "round", bodyColour: "#a67c34", stripes: "none", finColour: "#6e5628", bellyColour: "#e6d8b4" } },
    perch: { label: { de: "Barsch", en: "Perch" }, values: { shape: "slim", bodyColour: "#9aa832", stripes: "bars", finColour: "#d0682a", bellyColour: "#e8e8c8" } },
  },
  frame: { w: W, h: H },
  directions: ["left", "right"],
  animations: [{ name: "idle", frames: 2, fps: 2, loop: true }, { name: "swim", frames: 4, fps: 8, loop: true }, { name: "flop", frames: 3, fps: 6, loop: true }],
  grounded: false,
  build(p) {
    const koerper = ramp(p.bodyColour), flosse = ramp(p.finColour), bauch = ramp(p.bellyColour);
    const dunkel = ramp("#1b1626"), weiss = ramp("#f3f5f9");
    const gross = p.size === "large";
    const lang = (p.shape === "slim" ? 12 : 10) - (gross ? 0 : 2);
    const hoch = (p.shape === "slim" ? 4 : 7) - (gross ? 0 : 1);
    const schwanz = p.shape === "slim" ? 4 : 3;
    const x0 = Math.round((W - lang) / 2), finScale = p.shape === "slim" ? 1 : 0.75;
    const a = schwanz, head = lang - 1, cy = 8;
    const hochH = (h: number) => Math.max(0, Math.floor(h * (hoch - 1) / 2));
    const runterH = (h: number) => Math.max(0, Math.floor(h * hoch / 2));
    const halbeBody = (i: number) => 0.55 + 0.45 * Math.sin((Math.PI * (i - a)) / Math.max(1, head - a));
    const halbeSchwanz = (i: number) => finScale * (1 - 0.6 * (i / Math.max(1, a - 1)));

    const draw = (baseY: number, off: (i: number) => number) => {
      const b = new Pixels(W, H);
      for (let i = 0; i < lang; i++) {
        const x = x0 + i, y0 = baseY + off(i), isTail = i < a, h = isTail ? halbeSchwanz(i) : halbeBody(i);
        const oben = y0 - hochH(h), unten = y0 + runterH(h);
        for (let y = oben; y <= unten; y++) {
          let c;
          if (isTail) c = y === oben ? flosse.light : y === unten ? flosse.dark : flosse.base;
          else if (y === oben) c = koerper.light;
          else if (y === unten) c = bauch.base;
          else if (y === unten - 1 && unten - oben >= 4) c = koerper.dark;
          else c = koerper.base;
          b.set(x, y, c);
        }
      }
      if (p.stripes === "bars") for (let i = a + 1; i < head; i += 3) {
        const h = halbeBody(i), y0 = baseY + off(i);
        for (let y = y0 - hochH(h) + 1; y <= y0 + runterH(h) - 1; y++) b.set(x0 + i, y, flosse.base);
      } else if (p.stripes === "spots") {
        [[0.3, -1], [0.45, 1], [0.6, -1], [0.4, 1], [0.7, 0]].forEach(([s, d]) => {
          const i = Math.round(a + (head - a) * s);
          b.set(x0 + i, baseY + off(i) + d, flosse.dark);
        });
      }
      const ri = Math.round(a + (head - a) * 0.45), rTop = baseY + off(ri) - hochH(halbeBody(ri));
      b.set(x0 + ri, rTop - 1, flosse.base); b.set(x0 + ri + 1, rTop - 1, flosse.base);
      if (hoch >= 6) { b.set(x0 + ri - 1, rTop - 1, flosse.dark); b.set(x0 + ri + 2, rTop - 1, flosse.dark); }
      const exI = Math.max(a + 1, head - 2), ey = Math.round(baseY + off(exI));
      b.set(x0 + exI, ey, weiss.base); b.set(x0 + exI + 1, ey, dunkel.base);
      return b;
    };

    return (animation, d, f) => {
      let baseY = cy, off: (i: number) => number;
      if (animation === "flop") {
        baseY = 14 - Math.floor(hoch / 2);
        off = (i) => {
          if (f === 0) return 0;
          const tailUp = i < a ? Math.round(3 * (1 - i / Math.max(1, a - 1))) : 0;
          if (f === 1) return -tailUp;
          const t = (i - a) / Math.max(1, head - a), headUp = t > 0.5 ? Math.round(2 * (t - 0.5) / 0.5) : 0;
          return -(tailUp + headUp);
        };
      } else {
        const schwanzHub = animation === "swim" ? [-1, 0, 1, 0][f] : f === 0 ? -1 : 1;
        const bodyHub = animation === "swim" ? [1, 0, -1, 0][f] : 0;
        off = (i) => (i < a ? schwanzHub : Math.round((bodyHub * (i - a)) / Math.max(1, head - a)));
      }
      const b = draw(baseY, off);
      return d === "right" ? b : b.mirrored();
    };
  },
});
