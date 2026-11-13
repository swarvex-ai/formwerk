import { hex, Pixels, ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 16, H = 16;

export const bee = defineSprite({
  id: "bee", category: "creatures",
  title: { de: "Biene", en: "Bee" },
  description: {
    de: "Eine Biene oder Hummel von der Seite für Gärten, Wiesen und Küchen mit Honig: Körperlänge, Streifen, Stachel und Farben frei, mit Fliegen und Schweben. 16 × 16 Pixel.",
    en: "A bumblebee or honeybee seen from the side, for gardens, meadows and kitchens with honey: body length, stripes, sting and colours as you like, with flying and hovering. 16 × 16 pixels.",
  },
  params: {
    length: { type: "integer", min: 3, max: 5, default: 4, label: { de: "Länge", en: "Length" },
      describe: { de: "Halbe Länge des Körpers in Pixeln: 3 eine Honigbiene, 4 üblich, 5 eine dicke Hummel.", en: "Half-length of the body in pixels: 3 a honeybee, 4 usual, 5 a fat bumblebee." } },
    stripes: { type: "integer", min: 2, max: 4, default: 3, label: { de: "Streifen", en: "Stripes" },
      describe: { de: "Anzahl dunkler Streifen über dem Hinterleib: 2 bis 4 Streifen.", en: "Number of dark stripes across the abdomen: 2 to 4 stripes." } },
    sting: { type: "boolean", default: true, label: { de: "Stachel", en: "Sting" },
      describe: { de: "Ob die Biene einen spitzen Stachel am Hinterleib trägt.", en: "Whether the bee bears a pointed sting at the rear of its body." } },
    colour: { type: "color", default: "#f0c419", label: { de: "Farbe", en: "Colour" },
      describe: { de: "Grundfarbe des Körpers: Gelb #f0c419, Bernsteingold #e8a820.", en: "Base colour of the body: yellow #f0c419, amber gold #e8a820." } },
    stripeColour: { type: "color", default: "#2a2220", label: { de: "Streifenfarbe", en: "Stripe colour" },
      describe: { de: "Farbe der dunklen Querstreifen und des Kopfes: Dunkelbraun #2a2220.", en: "Colour of the dark stripes and head: dark brown #2a2220." } },
    wings: { type: "color", default: "#d8eef8", label: { de: "Flügel", en: "Wings" },
      describe: { de: "Farbe der Flügel: Zartes Hellblau #d8eef8.", en: "Colour of the wings: delicate pale blue #d8eef8." } },
  },
  presets: {
    honeybee: { label: { de: "Honigbiene", en: "Honeybee" }, values: { length: 3, stripes: 3, colour: "#e8a820" } },
    bumblebee: { label: { de: "Hummel", en: "Bumblebee" }, values: { length: 5, stripes: 2, colour: "#f0c419", sting: false } },
  },
  frame: { w: W, h: H },
  directions: ["left", "right"],
  animations: [
    { name: "fly", frames: 2, fps: 16, loop: true },
    { name: "hover", frames: 4, fps: 12, loop: true },
  ],
  grounded: false,
  build(p) {
    const k = ramp(p.colour), sFarbe = ramp(p.stripeColour), wFarbe = ramp(p.wings);
    const augeFarbe = hex("#ffffff");

    const rechts = (animation: string, f: number): Pixels => {
      const b = new Pixels(W, H);
      const isFly = animation === "fly";
      const wingsUp = isFly ? f === 0 : f % 2 === 0;
      const bobY = isFly ? (f === 0 ? -1 : 0) : 0;
      const driftX = isFly ? 0 : [0, -1, -1, 0][f];

      const cy = 9 + bobY;
      const cx = 7 + driftX;

      // 1. Body: ellipse centred at (cx, cy), half-width length, half-height 3
      b.ellipse(cx, cy, p.length, 3, k);

      // 2. Head: circle of radius 2 centred at (cx + length, cy) in stripeColour
      // Drawn over the front of the body
      for (let y = cy - 2; y <= cy + 2; y++) {
        for (let x = cx + p.length - 2; x <= cx + p.length + 2; x++) {
          const dx = x - (cx + p.length), dy = y - cy;
          if (dx * dx + dy * dy <= 4) {
            b.set(x, y, sFarbe.base);
          }
        }
      }

      // 3. Stripes: p.stripes dark bands across the body, each 1 px wide,
      // evenly spaced over the body's back two thirds; the rest of the body is body colour.
      const xRear = cx - p.length;
      const xFront = cx + p.length;
      const xBackEnd = Math.floor(xRear + (2 / 3) * (xFront - xRear));
      const nStripes = p.stripes;
      for (let i = 0; i < nStripes; i++) {
        const stripeX = nStripes === 1
          ? Math.round((xRear + xBackEnd) / 2)
          : Math.round(xRear + (i / (nStripes - 1)) * (xBackEnd - xRear));

        // Draw vertical band inside the body ellipse
        for (let y = cy - 3; y <= cy + 3; y++) {
          const dx = (stripeX + 0.5 - cx) / p.length;
          const dy = (y + 0.5 - cy) / 3;
          if (dx * dx + dy * dy <= 1) {
            b.set(stripeX, y, sFarbe.base);
          }
        }
      }

      // 4. Sting (boolean sting): one dark pixel at (cx - length - 1, cy)
      // in hover draw the sting only when x >= 1
      if (p.sting) {
        const stingX = cx - p.length - 1;
        if (stingX >= 1) {
          b.set(stingX, cy, sFarbe.base);
        }
      }

      // 5. Wings: two small ellipses (half-width 2, half-height 2) centred at (6, 4) and (8, 4);
      // in the wings-down frame they are squashed to half-height 1 and centred at y = 5.
      // Move everything up with bobY so wing tops never reach y = 0.
      const wingRy = wingsUp ? 2 : 1;
      const wingCy = (wingsUp ? 4 : 5) + bobY;
      const wing1Cx = 6 + driftX;
      const wing2Cx = 8 + driftX;
      b.ellipse(wing1Cx, wingCy, 2, wingRy, wFarbe);
      b.ellipse(wing2Cx, wingCy, 2, wingRy, wFarbe);

      // 6. Eye: one highlight pixel on the head at (cx + length + 1, cy - 1)
      b.set(cx + p.length + 1, cy - 1, augeFarbe);

      return b;
    };

    return (animation, d, f) => {
      const b = rechts(animation, f);
      return d === "right" ? b : b.mirrored();
    };
  },
});
