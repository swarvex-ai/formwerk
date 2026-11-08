import { line, type Pt } from "../../core/vector";
import { defineIcon } from "../define";
import { fit, FRAME, FRAME_SIZE, framed, inkRadius, turn } from "../shared";

const RICHTUNG = { right: 0, down: 90, left: 180, up: 270 } as const;

export const arrow = defineIcon({
  id: "arrow", category: "navigation",
  title: { de: "Pfeil", en: "Arrow" },
  description: {
    de: "Ein Pfeil für Weiter, Zurück, Hoch und Runter, frei oder in Kreis und Quadrat wie bei Blätter-Knöpfen.",
    en: "An arrow for next, back, up and down, free or in a circle or square like paging buttons.",
  },
  params: {
    direction: { type: "choice", options: ["right", "down", "left", "up"], default: "right", label: { de: "Richtung", en: "Direction" },
      labels: { right: { de: "Rechts", en: "Right" }, down: { de: "Unten", en: "Down" }, left: { de: "Links", en: "Left" }, up: { de: "Oben", en: "Up" } },
      describe: { de: "Wohin der Pfeil zeigt: rechts für Weiter, links für Zurück, oben und unten für Sortieren und Scrollen.", en: "Where the arrow points: right for next, left for back, up and down for sorting and scrolling." } },
    length: { type: "number", min: 12, max: 20, step: 0.5, default: 14, label: { de: "Länge", en: "Length" },
      describe: { de: "Länge von der Spitze bis zum Ende in Rasterpunkten (von 24): 12 kompakt, 14 üblich, 18 lang für Weiterleitungen; im Rahmen wird er so weit kürzer, wie es nötig ist.", en: "Length from tip to tail in grid units (of 24): 12 compact, 14 usual, 18 long for redirects; inside a frame it shrinks as far as needed." } },
    head: { type: "number", min: 4.5, max: 8, step: 0.25, default: 5.5, label: { de: "Spitze", en: "Head" },
      describe: { de: "Länge der Schenkel der Spitze: 4,5 klein und dezent, 5,5 üblich, 7 groß und deutlich.", en: "Length of the arms of the head: 4.5 small and subtle, 5.5 usual, 7 big and clear." } },
    frame: FRAME,
    frameSize: FRAME_SIZE,
  },
  presets: {
    next: { label: { de: "Weiter (frei)", en: "Next (free)" }, values: { frame: "none" } },
    back: { label: { de: "Zurück", en: "Back" }, values: { frame: "none", direction: "left" } },
    "scroll-down": { label: { de: "Nach unten", en: "Scroll down" }, values: { direction: "down", frame: "circle", style: "filled" } },
  },
  build(p, pen) {
    const f = framed(p.frame, pen, p.frameSize), hw = pen.width / 2, kopf = p.head * Math.SQRT1_2;
    // Pointing right around the centre, then turned; the head's arms meet at a right angle
    const roh: Pt[] = [[-p.length / 2, 0], [p.length / 2, 0], [p.length / 2 - kopf, -kopf], [p.length / 2 - kopf, kopf]];
    const k = fit(roh, inkRadius(pen), f), [schwanz, spitze, a, b] = roh.map(([x, y]): Pt => [12 + x * k, 12 + y * k]);
    // A square cap stops short of the tip, so it never pokes out of the head's corner
    const ende: Pt = pen.corners === "sharp" ? [spitze[0] - hw, spitze[1]] : spitze;
    const grad = RICHTUNG[p.direction as keyof typeof RICHTUNG];
    return [...f.parts, f.mark(line(...turn([schwanz, ende], grad))), f.mark(line(...turn([a, spitze, b], grad)))];
  },
});
