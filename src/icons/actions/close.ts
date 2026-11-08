import { line } from "../../core/vector";
import { defineIcon } from "../define";
import { fit, FRAME, FRAME_SIZE, framed, inkRadius } from "../shared";

export const close = defineIcon({
  id: "close", category: "actions",
  title: { de: "Schließen", en: "Close" },
  description: {
    de: "Ein Kreuz zum Schließen, Abbrechen und Leeren, frei oder in Kreis und Quadrat.",
    en: "A cross to close, cancel and clear, free or in a circle or square.",
  },
  params: {
    size: { type: "number", min: 10, max: 18, step: 0.5, default: 12, label: { de: "Größe", en: "Size" },
      describe: { de: "Breite des Kreuzes in Rasterpunkten (von 24): 10 zurückhaltend in Dialogen, 12 üblich, 16 groß für Touch-Flächen; im Rahmen wird es so weit kleiner, wie es nötig ist.", en: "Width of the cross in grid units (of 24): 10 discreet in dialogs, 12 usual, 16 big for touch targets; inside a frame it shrinks as far as needed." } },
    angle: { type: "number", min: 30, max: 60, step: 1, default: 45, unit: "°", label: { de: "Winkel", en: "Angle" },
      describe: { de: "Neigung der Balken gegen die Waagrechte: 45° ein gleichmäßiges Kreuz, 35° breiter und flacher, 55° hoch und schmal.", en: "Slope of the bars against the horizontal: 45° an even cross, 35° wider and flatter, 55° tall and narrow." } },
    frame: FRAME,
    frameSize: FRAME_SIZE,
  },
  presets: {
    dismiss: { label: { de: "Schließen (frei)", en: "Dismiss (free)" }, values: { frame: "none", size: 13 } },
    "clear-field": { label: { de: "Feld leeren", en: "Clear field" }, values: { frame: "circle", frameSize: 17, size: 12, style: "filled" } },
    cancel: { label: { de: "Abbrechen", en: "Cancel" }, values: { frame: "square" } },
  },
  build(p, pen) {
    const f = framed(p.frame, pen, p.frameSize), a = (p.angle * Math.PI) / 180, l = (p.size / 2) * Math.SQRT2;
    const k = fit([[l * Math.cos(a), l * Math.sin(a)]], inkRadius(pen), f), dx = l * Math.cos(a) * k, dy = l * Math.sin(a) * k;
    return [...f.parts, f.mark(line([12 - dx, 12 - dy], [12 + dx, 12 + dy])), f.mark(line([12 - dx, 12 + dy], [12 + dx, 12 - dy]))];
  },
});
