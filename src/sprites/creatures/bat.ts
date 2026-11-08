import { hex, Pixels, ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 24, H = 24;

export const bat = defineSprite({
  id: "bat", category: "creatures",
  title: { de: "Fledermaus", en: "Bat" },
  description: {
    de: "Eine Fledermaus im Flug, die mit den Flügeln schlägt: Spannweite, Körper und Farben frei, mit leuchtenden Augen. 24 × 24 Pixel.",
    en: "A bat in flight, flapping its wings: wingspan, body and colours as you like, with glowing eyes. 24 × 24 pixels.",
  },
  params: {
    wingspan: { type: "integer", min: 14, max: 22, default: 20, label: { de: "Spannweite", en: "Wingspan" },
      describe: { de: "Spannweite in Pixeln: 14 klein und flink, 20 üblich, 22 ein großer Flughund.", en: "Wingspan in pixels: 14 small and quick, 20 usual, 22 a big fruit bat." } },
    body: { type: "integer", min: 2, max: 4, default: 3, label: { de: "Körper", en: "Body" },
      describe: { de: "Halbe Breite des Körpers in Pixeln: 2 schlank, 3 üblich, 4 rundlich.", en: "Half the width of the body in pixels: 2 slim, 3 usual, 4 plump." } },
    color: { type: "color", default: "#4a3a5a", label: { de: "Farbe", en: "Colour" },
      describe: { de: "Farbe von Körper und Flügeln.", en: "Colour of the body and the wings." } },
    eyes: { type: "color", default: "#ff4a4a", label: { de: "Augen", en: "Eyes" },
      describe: { de: "Farbe der Augen: Rot unheimlich, Gelb freundlich.", en: "Colour of the eyes: red eerie, yellow friendly." } },
  },
  presets: {
    cave: { label: { de: "Höhlenfledermaus", en: "Cave bat" }, values: { wingspan: 18, color: "#4a3a5a" } },
    vampire: { label: { de: "Vampir", en: "Vampire" }, values: { wingspan: 22, body: 3, color: "#2a2230", eyes: "#ff2040" } },
    "fruit-bat": { label: { de: "Flughund", en: "Fruit bat" }, values: { wingspan: 22, body: 4, color: "#7a5236", eyes: "#f0c419" } },
  },
  frame: { w: W, h: H },
  directions: ["down"],
  animations: [{ name: "fly", frames: 4, fps: 10, loop: true }],
  grounded: false,
  build(p) {
    const k = ramp(p.color), auge = hex(p.eyes), halb = Math.floor(p.wingspan / 2);
    return (_a, _d, f) => {
      const b = new Pixels(W, H), schlag = [-5, -1, 4, -1][f], hoch = [1, 0, -1, 0][f], cy = 11 + hoch;
      // One wing, drawn on the right and mirrored: from the shoulder to the tip, scalloped along its lower edge
      const fluegel = new Pixels(W, H);
      for (let i = 0; i <= halb - p.body; i++) {
        const x = 12 + p.body + i - 1, t = i / Math.max(1, halb - p.body), oben = Math.round(cy - 1 + schlag * t);
        const dicke = Math.max(1, Math.round((1 - t) * 5 + 1) - (i % 3 === 2 ? 1 : 0));
        for (let j = 0; j < dicke; j++) fluegel.set(x, oben + j, j === 0 ? k.light : j === dicke - 1 ? k.dark : k.base);
      }
      b.blit(fluegel, 0, 0);
      b.blit(fluegel, 0, 0, true);
      // Body, ears and eyes
      b.ellipse(12, cy + 1, p.body, p.body + 1.5, k);
      b.set(12 - Math.max(1, p.body - 1), cy - p.body - 1, k.base); b.set(11 + Math.max(1, p.body - 1), cy - p.body - 1, k.base);
      b.set(11, cy - 1, auge); b.set(12, cy - 1, auge);
      return b;
    };
  },
});
