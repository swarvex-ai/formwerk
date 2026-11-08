import { circle, polygon, rect, type Pt, type Shape } from "../../core/vector";
import { defineIcon } from "../define";
import { CLEAR, fit, FRAME, framed, inkRadius } from "../shared";

export const play = defineIcon({
  id: "play", category: "actions",
  title: { de: "Abspielen", en: "Play" },
  description: {
    de: "Die Medien-Zeichen Abspielen, Pause, Stopp und Aufnahme, frei oder in Kreis und Quadrat.",
    en: "The media signs play, pause, stop and record, free or in a circle or square.",
  },
  params: {
    symbol: { type: "choice", options: ["play", "pause", "stop", "record"], default: "play", label: { de: "Zeichen", en: "Symbol" },
      labels: { play: { de: "Abspielen", en: "Play" }, pause: { de: "Pause", en: "Pause" }, stop: { de: "Stopp", en: "Stop" }, record: { de: "Aufnahme", en: "Record" } },
      describe: { de: "Dreieck zum Abspielen, zwei Balken für Pause, Quadrat für Stopp, Kreis für Aufnahme.", en: "A triangle to play, two bars for pause, a square for stop, a circle for record." } },
    size: { type: "number", min: 11, max: 18, step: 0.5, default: 15, label: { de: "Größe", en: "Size" },
      describe: { de: "Höhe des Zeichens in Rasterpunkten (von 24): 11 klein, 15 üblich, 18 groß; im Rahmen wird es so weit kleiner, wie es nötig ist.", en: "Height of the sign in grid units (of 24): 11 small, 15 usual, 18 big; inside a frame it shrinks as far as needed." } },
    frame: { ...FRAME, default: "none" },
  },
  presets: {
    "play-circle": { label: { de: "Abspielen im Kreis", en: "Play in a circle" }, values: { frame: "circle" } },
    pause: { label: { de: "Pause", en: "Pause" }, values: { symbol: "pause", size: 14 } },
    record: { label: { de: "Aufnahme", en: "Record" }, values: { symbol: "record", size: 13, style: "filled" } },
  },
  build(p, pen) {
    const f = framed(p.frame, pen), s = p.size / 2;
    let roh: Pt[], formen: (k: number) => Shape[];
    switch (p.symbol) {
      case "play": {
        // Pointing right, a little to the right of the middle so it looks centred
        const b = 2 * s * 0.8, v = s * 0.08;
        roh = [[-b * 0.45 + v, -s], [b * 0.55 + v, 0], [-b * 0.45 + v, s]];
        formen = (k) => [polygon(...roh.map(([x, y]): Pt => [12 + x * k, 12 + y * k]))];
        break;
      }
      case "pause": {
        const balken = Math.max(s * 0.56, pen.width + CLEAR), luecke = Math.max(s * 0.44, pen.width + CLEAR), w = balken * 2 + luecke;
        roh = [[-w / 2, -s], [w / 2, s]];
        formen = (k) => [rect(12 - (w / 2) * k, 12 - s * k, balken * k, 2 * s * k, 1), rect(12 + (w / 2 - balken) * k, 12 - s * k, balken * k, 2 * s * k, 1)];
        break;
      }
      case "stop": roh = [[-s * 0.85, -s * 0.85], [s * 0.85, s * 0.85]]; formen = (k) => [rect(12 - s * 0.85 * k, 12 - s * 0.85 * k, 1.7 * s * k, 1.7 * s * k, 1.5)]; break;
      default: roh = [[0, -s * 0.9], [s * 0.9, 0]]; formen = (k) => [circle([12, 12], s * 0.9 * k)];
    }
    // Inside a frame the sign is a filled detail without a stroke of its own
    const k = fit(roh, f.kind === "none" ? inkRadius(pen, 60) : 0, f);
    return [...f.parts, ...formen(k).map((x) => f.mark(x, true))];
  },
});
