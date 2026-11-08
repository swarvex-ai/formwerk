import { line } from "../../core/vector";
import { defineIcon } from "../define";
import { fit, FRAME, FRAME_SIZE, framed, inkRadius } from "../shared";

export const plus = defineIcon({
  id: "plus", category: "actions",
  title: { de: "Plus", en: "Plus" },
  description: {
    de: "Ein Plus zum Hinzufügen und Anlegen, frei oder in Kreis und Quadrat.",
    en: "A plus to add and create, free or in a circle or square.",
  },
  params: {
    size: { type: "number", min: 13, max: 20, step: 0.5, default: 14, label: { de: "Größe", en: "Size" },
      describe: { de: "Spannweite der Balken in Rasterpunkten (von 24): 13 zurückhaltend, 14 üblich, 18 groß für eine Schaltfläche „Neu“; im Rahmen wird es so weit kleiner, wie es nötig ist.", en: "Span of the bars in grid units (of 24): 13 discreet, 14 usual, 18 big for a \"New\" button; inside a frame it shrinks as far as needed." } },
    ratio: { type: "number", min: 0.7, max: 1, step: 0.05, default: 1, label: { de: "Seitenverhältnis", en: "Ratio" },
      describe: { de: "Länge des waagrechten Balkens im Verhältnis zum senkrechten: 1 ein gleichmäßiges Plus, 0,8 wirkt schlanker.", en: "Length of the horizontal bar relative to the vertical one: 1 an even plus, 0.8 looks slimmer." } },
    frame: FRAME,
    frameSize: FRAME_SIZE,
  },
  presets: {
    add: { label: { de: "Hinzufügen (frei)", en: "Add (free)" }, values: { frame: "none", size: 15 } },
    "add-circle": { label: { de: "Neu im Kreis", en: "New in a circle" }, values: { frame: "circle", style: "filled" } },
    "add-square": { label: { de: "Neu im Quadrat", en: "New in a square" }, values: { frame: "square", frameSize: 19 } },
  },
  build(p, pen) {
    const f = framed(p.frame, pen, p.frameSize), h = p.size / 2, b = h * p.ratio;
    const k = fit([[0, h], [b, 0]], inkRadius(pen), f);
    return [...f.parts, f.mark(line([12, 12 - h * k], [12, 12 + h * k])), f.mark(line([12 - b * k, 12], [12 + b * k, 12]))];
  },
});
