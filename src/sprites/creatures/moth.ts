import { Pixels, ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 16, H = 16;

export const moth = defineSprite({
  id: "moth", category: "creatures",
  title: { de: "Nachtfalter", en: "Moth" },
  description: {
    de: "Ein Nachtfalter von der Seite für Laternen, Nächte und Dachböden: schlägt mit breiten Flügeln oder ruht mit flach gefalteten Flügeln. Flügelgröße, Muster, Fühler und Farben frei. 16 × 16 Pixel.",
    en: "A moth seen from the side for lanterns, nights and attics: beats its broad wings or rests with its wings folded flat. Wing size, pattern, antennae and colours as you like. 16 × 16 pixels.",
  },
  params: {
    span: { type: "integer", min: 4, max: 6, default: 5, label: { de: "Flügelgröße", en: "Wing size" },
      describe: { de: "Höhe eines erhobenen Flügels in Pixeln: 4 eine kleine Motte, 5 ein Nachtfalter, 6 ein großer Spinner.", en: "Height of a raised wing in pixels: 4 a small clothes moth, 5 a moth, 6 a large silk moth." } },
    body: { type: "integer", min: 2, max: 4, default: 3, label: { de: "Körperlänge", en: "Body length" },
      describe: { de: "Halbe Länge des Körpers in Pixeln: 2 zierlich, 3 üblich, 4 ein dicker Schwärmer.", en: "Half-length of the body in pixels: 2 slender, 3 usual, 4 a stout hawk moth." } },
    pattern: { type: "choice", options: ["plain", "eyespots", "bands"], default: "bands", label: { de: "Muster", en: "Pattern" },
      labels: { plain: { de: "Schlicht", en: "Plain" }, eyespots: { de: "Augenflecken", en: "Eyespots" }, bands: { de: "Bänder", en: "Bands" } },
      describe: { de: "Zeichnung der Flügel: schlicht wie eine Kleidermotte, Augenflecken wie ein Pfauenspinner, ein dunkles Band wie die meisten Nachtfalter.", en: "Marking on the wings: plain like a clothes moth, eyespots like an emperor moth, a dark band like most moths." } },
    feathered: { type: "boolean", default: false, label: { de: "Gefiederte Fühler", en: "Feathered antennae" },
      describe: { de: "Breite, gefiederte Fühler wie bei Spinner-Männchen; aus für dünne Fühler.", en: "Broad feathered antennae like a male silk moth's; off for thin ones." } },
    wingColour: { type: "color", default: "#9a8a70", label: { de: "Flügelfarbe", en: "Wing colour" },
      describe: { de: "Grundfarbe der Flügel: Graubraun #9a8a70, Mondspinner Blassgrün #b8dca0, Bärenspinner Orange #d8782a.", en: "Base colour of the wings: grey-brown #9a8a70, luna moth pale green #b8dca0, tiger moth orange #d8782a." } },
    bodyColour: { type: "color", default: "#6a5a48", label: { de: "Körperfarbe", en: "Body colour" },
      describe: { de: "Farbe von Körper und Fühlern: Braun #6a5a48, Cremeweiß #e8e0c8, Schwarz #2a2420.", en: "Colour of the body and the antennae: brown #6a5a48, cream white #e8e0c8, black #2a2420." } },
  },
  presets: {
    moth: { label: { de: "Nachtfalter", en: "Moth" }, values: { span: 5, body: 3, pattern: "bands", feathered: false, wingColour: "#9a8a70", bodyColour: "#6a5a48" } },
    luna: { label: { de: "Mondspinner", en: "Luna moth" }, values: { span: 6, body: 3, pattern: "eyespots", feathered: true, wingColour: "#b8dca0", bodyColour: "#e8e0c8" } },
    "tiger-moth": { label: { de: "Bärenspinner", en: "Tiger moth" }, values: { span: 5, body: 4, pattern: "bands", feathered: false, wingColour: "#d8782a", bodyColour: "#2a2420" } },
    "clothes-moth": { label: { de: "Kleidermotte", en: "Clothes moth" }, values: { span: 4, body: 2, pattern: "plain", feathered: false, wingColour: "#c8b890", bodyColour: "#a89878" } },
  },
  frame: { w: W, h: H },
  directions: ["left", "right"],
  animations: [
    { name: "idle", frames: 1, fps: 1, loop: true },
    { name: "fly", frames: 4, fps: 12, loop: true },
  ],
  grounded: false,
  build(p) {
    const fl = ramp(p.wingColour), k = ramp(p.bodyColour), auge = ramp("#1a1612");
    const rechts = (animation: string, f: number): Pixels => {
      const b = new Pixels(W, H);
      const fliegt = animation === "fly";
      // Wing beat: up, level, down, level; on the down-stroke the body lifts a pixel
      const schlag = fliegt ? (["up", "level", "down", "level"] as const)[f] : "rest";
      const cx = 7, cy = schlag === "down" ? 7 : 8;
      // One wing as rows away from the body (dir −1 up, +1 down): broad at the root, swept back towards its tip
      const fluegel = (rows: number, dir: number) => {
        for (let d = 1; d <= rows; d++) {
          const y = cy + dir * (d + 1);
          const xl = cx - 3 - Math.floor(d * 0.6), xr = cx + 2 - Math.floor(d * 0.9) + (d === 1 ? 1 : 0);
          for (let x = xl; x <= xr; x++) b.set(x, y, d === rows || x === xl ? fl.dark : fl.base);
          // The marking: a dark band two thirds out, or an eyespot near the outer edge
          if (p.pattern === "bands" && d === Math.round(rows * 0.6)) for (let x = xl + 1; x < xr; x++) b.set(x, y, fl.deep);
          if (p.pattern === "eyespots" && d === rows - 1) { const m = Math.round((xl + xr) / 2); b.set(m, y, fl.deep); b.set(m - 1, y, fl.light); }
        }
        // the wing root joins the body
        b.set(cx, cy + dir, fl.base); b.set(cx + 1, cy + dir, fl.base);
      };
      if (schlag === "up") fluegel(p.span, -1);
      if (schlag === "down") fluegel(p.span - 1, 1);
      // Body: a long furry oval with a darker underside
      b.ellipse(cx, cy, p.body, 1.5, k);
      for (let x = cx - p.body + 1; x < cx + p.body; x++) b.set(x, cy + 1, k.dark);
      // Head and eye in front of the body, antennae sweeping up and forward
      const hx = cx + p.body + 1;
      b.set(hx, cy, k.base); b.set(hx, cy - 1, k.light); b.set(hx + 1, cy, auge.base);
      b.set(hx + 1, cy - 2, k.dark); b.set(hx + 2, cy - 3, k.dark);
      if (p.feathered) { b.set(hx, cy - 3, k.dark); b.set(hx + 1, cy - 4, k.dark); b.set(hx + 2, cy - 2, k.base); }
      if (schlag === "level") {
        // Seen edge-on the wings are a flat blade along the body's back
        for (let x = cx - p.body; x <= cx + 1; x++) b.set(x, cy - 2, fl.dark);
        for (let x = cx - p.body - 1; x <= cx + 2; x++) b.set(x, cy - 1, fl.base);
      }
      if (schlag === "rest") {
        // At rest the wings fold flat like a roof over the body, reaching past its tail
        for (let x = cx - p.body - 2; x <= cx + p.body - 1; x++) b.set(x, cy - 1, fl.base);
        for (let x = cx - p.body - 1; x <= cx + p.body - 2; x++) b.set(x, cy - 2, fl.dark);
        if (p.pattern === "bands") b.set(cx - 1, cy - 1, fl.deep);
        if (p.pattern === "eyespots") b.set(cx - p.body, cy - 1, fl.deep);
      }
      return b;
    };
    return (animation, d, f) => (d === "right" ? rechts(animation, f) : rechts(animation, f).mirrored());
  },
});
