import { hex, Pixels, ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 16, H = 16;

export const crown = defineSprite({
  id: "crown", category: "items",
  title: { de: "Krone", en: "Crown" },
  description: {
    de: "Eine Krone als Pixel-Symbol: Zacken, Reif und Steine, in Gold oder Silber, mit funkelndem Glanz. 16 × 16 Pixel.",
    en: "A crown as a pixel icon: points, band and stones, in gold or silver, with a twinkling glint. 16 × 16 pixels.",
  },
  params: {
    points: {
      type: "integer", min: 3, max: 5, default: 3,
      label: { de: "Zacken", en: "Points" },
      describe: {
        de: "Anzahl der Zacken: 3 eine schlichte Königskrone, 5 eine prunkvolle.",
        en: "Number of points: 3 a plain king's crown, 5 a grand one.",
      },
    },
    height: {
      type: "integer", min: 3, max: 6, default: 4,
      label: { de: "Höhe", en: "Height" },
      describe: {
        de: "Zackenhöhe über dem Reif in Pixeln: 3 ein Diadem, 6 eine hohe Krone.",
        en: "Point height above the band in pixels: 3 a circlet, 6 a tall crown.",
      },
    },
    metal: {
      type: "color", default: "#f0b429",
      label: { de: "Metall", en: "Metal" },
      describe: {
        de: "Gold #f0b429, Silber #c8cdd6, Bronze #c07a3a.",
        en: "Gold #f0b429, silver #c8cdd6, bronze #c07a3a.",
      },
    },
    stone: {
      type: "color", default: "#e0405e",
      label: { de: "Stein", en: "Stone" },
      describe: {
        de: "Rubin #e0405e, Saphir #3f78e0, Smaragd #2fb36a.",
        en: "Ruby #e0405e, sapphire #3f78e0, emerald #2fb36a.",
      },
    },
  },
  presets: {
    king: {
      label: { de: "König", en: "King" },
      values: { points: 5, height: 5 },
    },
    circlet: {
      label: { de: "Diadem", en: "Circlet" },
      values: { points: 3, height: 3, metal: "#c8cdd6", stone: "#3f78e0" },
    },
  },
  frame: { w: W, h: H },
  directions: ["down"],
  animations: [
    { name: "idle", frames: 1, fps: 1, loop: true },
    { name: "shine", frames: 4, fps: 8, loop: true },
  ],
  grounded: false,
  build(p) {
    const m = ramp(p.metal), st = ramp(p.stone), weiss = hex("#ffffff");
    return (animation, _d, f) => {
      const b = new Pixels(W, H);

      // 1. Band: x 2..13, y 9..12. Row 9 m.light, row 12 m.dark, rows 10-11 m.base.
      for (let x = 2; x <= 13; x++) {
        b.set(x, 9, m.light);
        b.set(x, 10, m.base);
        b.set(x, 11, m.base);
        b.set(x, 12, m.dark);
      }
      // Stones: st.base at y 10, x = 4, 7, 10
      for (let x = 4; x <= 11; x += 3) {
        b.set(x, 10, st.base);
      }

      // 2. Points
      for (let i = 0; i < p.points; i++) {
        const sx = Math.round(2 + (11 * i) / (p.points - 1));
        for (let k = 1; k <= p.height; k++) {
          const y = 9 - k;
          const w = Math.floor((p.height - k) / 2);
          const xStart = Math.max(2, sx - w);
          const xEnd = Math.min(13, sx + w);
          for (let x = xStart; x <= xEnd; x++) {
            if (x < sx) {
              b.set(x, y, m.light);
            } else if (x > sx) {
              b.set(x, y, m.dark);
            } else {
              b.set(x, y, m.base);
            }
          }
        }
        // A ball m.light at (sx, 9 - height - 1)
        b.set(sx, 9 - p.height - 1, m.light);
      }

      // 3. Glint on the middle point (index floor(points/2)), at its ball
      const midIndex = Math.floor(p.points / 2);
      const midSx = Math.round(2 + (11 * midIndex) / (p.points - 1));
      const midBallY = 9 - p.height - 1;

      const g = animation === "shine" ? [0, 1, 2, 1][f] : 0;
      if (g >= 1) {
        b.set(midSx, midBallY, weiss);
      }
      if (g >= 2) {
        b.set(midSx - 1, midBallY, m.light);
        b.set(midSx + 1, midBallY, m.light);
        b.set(midSx, midBallY + 1, m.light);
      }

      return b;
    };
  },
});
