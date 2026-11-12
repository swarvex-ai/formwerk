import { defineIcon } from "../define";
import { curveParts } from "./undo";

export const redo = defineIcon({
  id: "redo", category: "actions",
  title: { de: "Wiederholen", en: "Redo" },
  description: {
    de: "Ein geschwungener Pfeil, der nach rechts vorwärtsdreht, für Wiederholen und Vorwärts; das Spiegelbild von Rückgängig.",
    en: "A curved arrow turning forward to the right for redo and forward; the mirror image of undo.",
  },
  params: {
    sweep: { type: "number", min: 90, max: 270, step: 10, default: 180, label: { de: "Bogen", en: "Sweep" },
      describe: { de: "Wie weit der Bogen um den Mittelpunkt läuft: 90 ein Viertelkreis, 180 ein Halbkreis, 270 fast ein ganzer Kreis.", en: "How far the arc runs around its centre: 90 a quarter circle, 180 a half circle, 270 almost a full circle." } },
    head: { type: "choice", options: ["open", "filled"], default: "filled", label: { de: "Spitze", en: "Head" },
      labels: { open: { de: "Offen", en: "Open" }, filled: { de: "Gefüllt", en: "Filled" } },
      describe: { de: "Eine offene Spitze aus zwei Strichen wie ein Pfeil oder eine gefüllte Dreiecksspitze für kräftige Werkzeugleisten.", en: "An open head of two strokes like an arrow or a solid triangular head for bold toolbars." } },
    radius: { type: "number", min: 6, max: 7.5, step: 0.25, default: 6.5, label: { de: "Radius", en: "Radius" },
      describe: { de: "Radius des Bogens in Rasterpunkten: 6 eng und kompakt, 6,5 üblich, 7,5 weit und ausholend.", en: "Radius of the arc in grid units: 6 tight and compact, 6.5 usual, 7.5 wide and sweeping." } },
  },
  presets: {
    "full-turn": { label: { de: "Ganze Drehung", en: "Full turn" }, values: { sweep: 270 } },
    "open-head": { label: { de: "Offene Spitze", en: "Open head" }, values: { head: "open" } },
  },
  build(p, pen) {
    return curveParts(p, pen, 1);
  },
});
