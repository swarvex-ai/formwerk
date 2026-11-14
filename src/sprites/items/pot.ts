import { hex, Pixels, ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 16, H = 16;
const RISS = hex("#2a1a14");

export const pot = defineSprite({
  id: "pot", category: "items",
  title: { de: "Tonkrug", en: "Clay pot" },
  description: {
    de: "Ein Tonkrug als Pixel-Symbol für Dungeons und Dörfer, den man zerschlagen kann: Höhe, Bauch und Hals frei wählbar, mit einer Animation, in der er wackelt, einen Riss bekommt und in Scherben fällt. 16 × 16 Pixel.",
    en: "A clay pot as a pixel icon for dungeons and villages, made to be smashed: height, belly and neck as you like, with an animation in which it wobbles, cracks and falls apart into shards. 16 × 16 pixels.",
  },
  params: {
    height: { type: "integer", min: 6, max: 11, default: 9, label: { de: "Höhe", en: "Height" },
      describe: { de: "Höhe des Krugs in Pixeln, vom Boden bis zum Rand: 6 eine flache Schale, 9 üblich, 11 eine hohe Amphore.", en: "Height of the pot in pixels, from the floor to the rim: 6 a squat bowl, 9 usual, 11 a tall amphora." } },
    belly: { type: "integer", min: 3, max: 5, default: 4, label: { de: "Bauch", en: "Belly" },
      describe: { de: "Halbe Breite des Bauchs in Pixeln: 3 ein schlanker Krug, 4 üblich, 5 ein dicker Topf.", en: "Half the width of the belly in pixels: 3 a slender jug, 4 usual, 5 a fat pot." } },
    neck: { type: "choice", options: ["short", "long", "none"], default: "short", label: { de: "Hals", en: "Neck" },
      labels: { short: { de: "kurz", en: "short" }, long: { de: "lang", en: "long" }, none: { de: "ohne", en: "none" } },
      describe: { de: "Der Hals über dem Bauch: kurz wie ein Vorratskrug, lang wie eine Amphore, ohne wie ein offener Topf.", en: "The neck above the belly: short like a storage jar, long like an amphora, none like an open pot." } },
    clay: { type: "color", default: "#b5653a", label: { de: "Ton", en: "Clay" },
      describe: { de: "Farbe des Tons: Terrakotta #b5653a, heller Ton #c9a77a, grün glasiert #4f7a5a.", en: "Colour of the clay: terracotta #b5653a, pale clay #c9a77a, green glaze #4f7a5a." } },
  },
  presets: {
    jar: { label: { de: "Vorratskrug", en: "Storage jar" }, values: { height: 9, belly: 4, neck: "short" } },
    amphora: { label: { de: "Amphore", en: "Amphora" }, values: { height: 11, belly: 3, neck: "long", clay: "#c9a77a" } },
    cookpot: { label: { de: "Kochtopf", en: "Cooking pot" }, values: { height: 6, belly: 5, neck: "none", clay: "#4f7a5a" } },
  },
  frame: { w: W, h: H },
  directions: ["down"],
  animations: [{ name: "idle", frames: 1, fps: 1, loop: true }, { name: "smash", frames: 4, fps: 10, loop: false }],
  grounded: false,
  build(p) {
    const ton = ramp(p.clay), boden = 13, hals = p.neck === "long" ? 3 : p.neck === "short" ? 2 : 0;
    // The belly fills the height under the neck; the rim is one pixel
    const bh = p.height - hals - 1, cy = boden + 1 - bh / 2, hw = Math.max(1, Math.round(p.belly / 2));
    const krug = (b: Pixels, dx: number) => {
      b.ellipse(7.5 + dx, cy, p.belly + 0.5, bh / 2, ton);
      // the neck, narrower than the belly, then a rim one pixel wider on each side
      const oben = boden + 1 - bh;
      if (hals) b.part(8 + dx - hw, oben - hals, 2 * hw, hals + 1, ton);
      const rand = oben - hals - 1, rw = hals ? hw + 1 : p.belly;
      b.rect(8 + dx - rw, rand, 2 * rw, 1, ton.light);
      b.set(7 + dx + rw, rand, ton.dark);
      // a dark mouth when there is no neck
      if (!hals) b.rect(9 + dx - rw, rand + 1, 2 * rw - 2, 1, ton.deep);
    };
    // Where the shards fly in the third frame and land in the fourth: the same pieces, from left to right
    const stuecke = [-5, -2, 1, 4].map((s) => ({ x: Math.round(7.5 + s * Math.min(1, p.belly / 4)), w: 2 }));
    return (animation, _d, f) => {
      const b = new Pixels(W, H);
      if (animation !== "smash" || f < 2) {
        // idle; smash starts with a wobble to the left, then the pot stands upright and cracks
        krug(b, animation === "smash" && f === 0 ? -1 : 0);
        if (animation === "smash" && f === 1) {
          // a zigzag crack down the belly, as long as the belly allows
          const top = boden + 2 - bh, lang = Math.min(4, bh - 1);
          for (let k = 0; k < lang; k++) b.set(7 + (k % 2), top + k, RISS);
          if (lang > 2) { b.set(6, top + lang - 1, RISS); b.set(9, top + lang - 2, RISS); }
        }
        return b;
      }
      // the pieces: in the air in frame 3, then a heap of shards on the floor in frame 4
      stuecke.forEach((s, i) => {
        if (f === 2) { const y = boden - 4 - (i % 2 ? 3 : 1); b.part(s.x - 1, y, s.w, 2, ton); b.set(s.x + (i < 2 ? 1 : -1), y + 2, ton.dark); }
        else b.part(s.x - 1, boden - (i % 2), s.w, 1 + (i % 2), ton);
      });
      return b;
    };
  },
});
