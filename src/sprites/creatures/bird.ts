import { Pixels, ramp, type Ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 16, H = 16;

/** A wing from the shoulder to the tip as a tapering band, light on top and dark below; gaps between columns are filled. */
function fluegel(b: Pixels, k: Ramp, x0: number, y0: number, x1: number, y1: number, dicke: number) {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  let vor = Math.round(y0);
  for (let s = 0; s <= n; s++) {
    const t = s / n, x = Math.round(x0 + (x1 - x0) * t), y = Math.round(y0 + (y1 - y0) * t), d = Math.max(1, Math.round(dicke * (1 - t * 0.6)));
    for (let yy = Math.min(y, vor); yy <= Math.max(y, vor) + d - 1; yy++) {
      if (x < 1 || x > 14 || yy < 1 || yy > 14) continue;
      b.set(x, yy, yy === Math.min(y, vor) ? k.light : yy >= Math.max(y, vor) + d - 1 && d > 1 ? k.dark : k.base);
    }
    vor = y;
  }
}

export const bird = defineSprite({
  id: "bird", category: "creatures",
  title: { de: "Vogel", en: "Bird" },
  description: {
    de: "Ein kleiner Vogel im Flug, von der Seite, von vorn und von hinten: Flügelschlag und Gleiten, Größe, Schwanz und Haube wählbar. 16 × 16 Pixel.",
    en: "A small bird in flight, seen from the side, front and back: flapping and gliding, size, tail and crest as you like. 16 × 16 pixels.",
  },
  params: {
    bodyColour: { type: "color", default: "#8a6a48", label: { de: "Körperfarbe", en: "Body colour" },
      describe: { de: "Farbe von Körper und Kopf: Braun #8a6a48 Spatz, Schwarz #26262e Rabe, Grün #3aa04a Papagei.", en: "Colour of body and head: brown #8a6a48 sparrow, black #26262e crow, green #3aa04a parrot." } },
    wingColour: { type: "color", default: "#6a4e34", label: { de: "Flügelfarbe", en: "Wing colour" },
      describe: { de: "Farbe der Flügel und des Schwanzes: dunkler als der Körper wirkt natürlich, Rot #d8382c ein Papagei.", en: "Colour of wings and tail: darker than the body looks natural, red #d8382c a parrot." } },
    beakColour: { type: "color", default: "#e0a030", label: { de: "Schnabelfarbe", en: "Beak colour" },
      describe: { de: "Farbe des Schnabels: Orange #e0a030 üblich, Gelb #f0c419 Papagei, Grau #8a8a90 Rabe.", en: "Colour of the beak: orange #e0a030 usual, yellow #f0c419 parrot, grey #8a8a90 crow." } },
    size: { type: "choice", options: ["small", "large"], default: "small", label: { de: "Größe", en: "Size" },
      labels: { small: { de: "klein", en: "small" }, large: { de: "groß", en: "large" } },
      describe: { de: "Klein misst mit gespreizten Flügeln 10 Pixel (Spatz), groß 14 Pixel (Rabe).", en: "Small spans 10 pixels with the wings spread (sparrow), large 14 pixels (crow)." } },
    tail: { type: "choice", options: ["short", "fork", "long"], default: "short", label: { de: "Schwanz", en: "Tail" },
      labels: { short: { de: "kurz", en: "short" }, fork: { de: "gegabelt", en: "fork" }, long: { de: "lang", en: "long" } },
      describe: { de: "Kurz wie beim Spatz, gegabelt wie bei der Schwalbe oder lang wie beim Papagei.", en: "Short like a sparrow, forked like a swallow or long like a parrot." } },
    crest: { type: "boolean", default: false, label: { de: "Haube", en: "Crest" },
      describe: { de: "Zwei Pixel Federhaube auf dem Kopf, wie beim Papagei (Kakadu).", en: "A two-pixel feather crest on the head, like a parrot (cockatoo)." } },
  },
  presets: {
    sparrow: { label: { de: "Spatz", en: "Sparrow" }, values: { bodyColour: "#8a6a48", wingColour: "#6a4e34", size: "small", tail: "short" } },
    crow: { label: { de: "Rabe", en: "Crow" }, values: { bodyColour: "#2c2c36", wingColour: "#1e1e28", beakColour: "#8a8a90", size: "large", tail: "fork" } },
    parrot: { label: { de: "Papagei", en: "Parrot" }, values: { bodyColour: "#3aa04a", wingColour: "#d8382c", beakColour: "#f0c419", size: "small", tail: "long", crest: true } },
  },
  frame: { w: W, h: H },
  directions: ["down", "left", "right", "up"],
  animations: [{ name: "fly", frames: 4, fps: 10, loop: true }, { name: "glide", frames: 2, fps: 3, loop: true }],
  grounded: false,
  build(p) {
    const kb = ramp(p.bodyColour), kf = ramp(p.wingColour), ks = ramp(p.beakColour), gross = p.size === "large";
    const half = gross ? 7 : 5, nrx = gross ? 3 : 2, lang = p.tail === "short" ? 2 : p.tail === "fork" ? 3 : 4;
    // Wing tip height against the shoulder: wings up, level, down, level; gliding the wings stay spread, one pixel up
    const hub = gross ? [-5, 0, 4, 0] : [-4, 0, 3, 0];
    const draw = (px: Pixels, x: number, y: number, c: Ramp["base"]) => { if (x >= 1 && x <= 14 && y >= 1 && y <= 14) px.set(x, y, c); };
    const rechts = (a: string, f: number) => {
      const b = new Pixels(W, H), fliegt = a === "fly", dy = fliegt ? hub[f] : -1;
      const cy = 8 + (fliegt ? [1, 0, -1, 0][f] : f), cx = gross ? 7 : 8;
      // Tail behind the body: two thick, forked with two tines, or long
      const sx = gross ? 3 : 4;
      for (let i = 0; i < lang; i++) for (let j = 0; j < 2; j++) {
        const gabel = p.tail === "fork" && i === lang - 1;
        if (gabel ? j === 0 : false) { draw(b, sx - i, cy - 1, kf.dark); draw(b, sx - i, cy + 2, kf.dark); }
        else if (!gabel) draw(b, sx - i, cy + j, j ? kf.dark : kf.base);
      }
      b.ellipse(cx, cy, gross ? 3.5 : 3, gross ? 3 : 2.5, kb);
      const hw = gross ? 4 : 3, hx = 9, hy = cy - hw;
      b.part(hx, hy, hw, hw, kb, true);
      draw(b, hx + hw - 1, hy + 1, kb.deep);
      draw(b, hx + hw, hy + 1, ks.base); if (gross) draw(b, hx + hw + 1, hy + 1, ks.dark);
      if (p.crest) { draw(b, hx + 1, hy - 1, kb.dark); draw(b, hx, hy - 2, kb.dark); }
      // Wing from the shoulder back and up or down
      fluegel(b, kf, cx - 1, cy - 1, cx - (gross ? 6 : 5), cy - 1 + dy, 2);
      return b;
    };
    const vorn = (a: string, f: number, hinten: boolean) => {
      const b = new Pixels(W, H), fliegt = a === "fly", dy = fliegt ? hub[f] : -1;
      const cy = 8 + (fliegt ? [1, 0, -1, 0][f] : f);
      for (const s of [0, 1]) {
        const fl = new Pixels(W, H);
        fluegel(fl, kf, 8 + nrx, cy - 1, 7 + half, cy - 1 + dy, 3);
        b.blit(fl, 0, 0, !!s);
      }
      const hw = gross ? 4 : 4, hy = cy - 4;
      if (hinten) {
        // Seen from behind: the tail hangs below the body
        for (let i = 0; i < lang; i++) {
          const gabel = p.tail === "fork" && i === lang - 1;
          for (const x of gabel ? [6, 9] : [7, 8]) draw(b, x, cy + 4 + i, i === lang - 1 ? kf.dark : kf.base);
          if (!gabel && gross) { draw(b, 6, cy + 4 + i, kf.dark); draw(b, 9, cy + 4 + i, kf.dark); }
        }
      }
      b.ellipse(8, cy + 0.5, nrx + 0.5, 3, kb);
      b.part(8 - hw / 2, hy, hw, 3, kb, true);
      if (!hinten) { draw(b, 7, hy + 1, kb.deep); draw(b, 8, hy + 1, kb.deep); draw(b, 7, hy + 2, ks.base); draw(b, 8, hy + 2, ks.dark); }
      if (p.crest) { draw(b, 7, hy - 1, kb.dark); draw(b, 8, hy - 1, kb.dark); }
      return b;
    };
    return (a, d, f) => d === "right" ? rechts(a, f) : d === "left" ? rechts(a, f).mirrored() : vorn(a, f, d === "up");
  },
});
