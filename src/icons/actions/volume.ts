import { arc, line, polygon, type Pt } from "../../core/vector";
import { area, defineIcon, stroke, type Part } from "../define";
import { CLEAR, centre, fits } from "../shared";

export const volume = defineIcon({
  id: "volume", category: "actions",
  title: { de: "Lautstärke", en: "Volume" },
  description: {
    de: "Ein Lautsprecher mit null bis drei Schallwellen für die Lautstärke, mit Kreuz statt Wellen für stumm.",
    en: "A speaker with zero to three sound waves for volume, with a cross instead of waves for muted.",
  },
  params: {
    waves: { type: "integer", min: 0, max: 3, default: 2, label: { de: "Wellen", en: "Waves" },
      describe: { de: "Zahl der Schallwellen: 0 nur Lautsprecher, 1 leise, 2 mittel, 3 laut; bei kräftigem Strich werden es automatisch weniger, damit sie ins Raster passen.", en: "Number of sound waves: 0 speaker only, 1 quiet, 2 medium, 3 loud; with a heavy stroke fewer are drawn so they fit the grid." } },
    muted: { type: "boolean", default: false, label: { de: "Stumm", en: "Muted" },
      describe: { de: "Ein Kreuz statt der Wellen: Ton aus.", en: "A cross instead of the waves: sound off." } },
    speakerSize: { type: "number", min: 11, max: 16, step: 0.5, default: 13, label: { de: "Lautsprechergröße", en: "Speaker size" },
      describe: { de: "Höhe des Lautsprechers in Rasterpunkten (von 24): 11 klein, 13 üblich, 16 groß.", en: "Height of the speaker in grid units (of 24): 11 small, 13 usual, 16 large." } },
    spread: { type: "number", min: 60, max: 100, step: 10, default: 80, label: { de: "Öffnungswinkel", en: "Spread" },
      describe: { de: "Öffnungswinkel der Wellen in Grad: 60 schmal, 80 üblich, 100 weit.", en: "Opening angle of the waves in degrees: 60 narrow, 80 usual, 100 wide." } },
  },
  presets: {
    loud: { label: { de: "Laut", en: "Loud" }, values: { waves: 3, spread: 90 } },
    quiet: { label: { de: "Leise", en: "Quiet" }, values: { waves: 1, speakerSize: 14 } },
    muted: { label: { de: "Stumm", en: "Muted" }, values: { muted: true } },
  },
  build(p, pen) {
    const hw = pen.width / 2, step = pen.width + CLEAR, spread = p.spread;
    const make = (n: number, h = p.speakerSize / 2 - hw): Part[] => {
      // Origin at the mouth of the cone, which opens towards +x
      const body: Pt[] = [[-1.5 * h, -0.5 * h], [-0.8 * h, -0.5 * h], [0, -h], [0, h], [-0.8 * h, 0.5 * h], [-1.5 * h, 0.5 * h]];
      const teile: Part[] = [area(polygon(...body.map(([x, y]): Pt => [12 + x, 12 + y])))];
      if (p.muted) {
        // The cross stands clear of the mouth, as far from it as a wave would
        const c = Math.min(0.55 * h, 3.5), cx = step + c + 0.5;
        teile.push(stroke(line([12 + cx - c, 12 - c], [12 + cx + c, 12 + c])), stroke(line([12 + cx - c, 12 + c], [12 + cx + c, 12 - c])));
      } else {
        const c: Pt = [12 - 0.3 * h, 12], r1 = (0.3 * h + step) / Math.cos((spread / 2 * Math.PI) / 180);
        for (let i = 0; i < n; i++) teile.push(stroke(arc(c, r1 + i * step, 90 - spread / 2, 90 + spread / 2)));
      }
      return teile;
    };
    let n = p.muted ? 0 : p.waves, parts = make(n);
    while (n > 0 && !fits(parts, pen)) parts = make(--n);
    // Muted has no waves to drop: the speaker gives way instead
    for (let h = p.speakerSize / 2 - hw; !fits(parts, pen) && h > 3; h -= 0.25) parts = make(n, h);
    return centre(parts, pen);
  },
});
