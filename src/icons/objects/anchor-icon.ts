import { arc, circle, line, onCircle, type Pt } from "../../core/vector";
import { area, defineIcon, stroke, type Part } from "../define";
import { EDGE } from "../shared";

export const anchorIcon = defineIcon({
  id: "anchor-icon",
  category: "objects",
  title: { de: "Anker", en: "Anchor" },
  description: {
    de: "Ein Schiffsanker mit Ring, Schaft, Querstange und gebogenen Armen für Schifffahrt, Hafen und Halt.",
    en: "A ship anchor with ring, shank, crossbar and curved arms for maritime, harbour and hold.",
  },
  params: {
    ring: {
      type: "number",
      min: 1.5,
      max: 2.5,
      step: 0.25,
      default: 2,
      label: { de: "Ring", en: "Ring" },
      describe: {
        de: "Radius des Rings oben in Rasterpunkten: 1,5 klein, 2 üblich, 2,5 weit; bleibt weit genug offen.",
        en: "Radius of the top ring in grid units: 1.5 small, 2 usual, 2.5 wide; stays open enough.",
      },
    },
    arms: {
      type: "number",
      min: 100,
      max: 160,
      step: 10,
      default: 130,
      unit: "°",
      label: { de: "Arme", en: "Arms" },
      describe: {
        de: "Bogenwinkel der Ankerarme in Grad: 100 steil, 130 üblich, 160 weit ausladend.",
        en: "Arc angle of the anchor arms in degrees: 100 steep, 130 usual, 160 swept wide.",
      },
    },
    bar: {
      type: "boolean",
      default: true,
      label: { de: "Querstange", en: "Crossbar" },
      describe: {
        de: "Waagrechter Stock unter dem Ring; ohne wirkt der Anker einfacher und moderner.",
        en: "Horizontal crossbar below the ring; without it the anchor looks simpler and modern.",
      },
    },
    tips: {
      type: "choice",
      options: ["plain", "barbs"],
      default: "plain",
      label: { de: "Spitzen", en: "Tips" },
      labels: {
        plain: { de: "Glatt", en: "Plain" },
        barbs: { de: "Flunken", en: "Barbs" },
      },
      describe: {
        de: "Enden der Arme: glatt abgeschnitten oder mit nach außen abstehenden Flunken.",
        en: "Ends of the arms: plain cut or with outward pointing barbs.",
      },
    },
  },
  presets: {
    ship: {
      label: { de: "Schiff", en: "Ship" },
      values: { tips: "barbs" },
    },
    simple: {
      label: { de: "Einfach", en: "Simple" },
      values: { bar: false, arms: 110 },
    },
  },
  build(p, pen) {
    const hw = pen.width / 2;
    const top = EDGE + hw;
    const bottom = 24 - EDGE - hw;
    const rr = Math.max(p.ring, (2.5 + pen.width) / 2);

    const parts: Part[] = [
      area(circle([12, top + rr], rr)),
      stroke(line([12, top + 2 * rr], [12, bottom])),
    ];

    if (p.bar) {
      const y = top + 2 * rr + 1.5;
      parts.push(stroke(line([8, y], [16, y])));
    }

    const arcCenter: Pt = [12, bottom - 7];
    parts.push(stroke(arc(arcCenter, 7, 180 - p.arms / 2, 180 + p.arms / 2)));

    if (p.tips === "barbs") {
      // Left barb at 180 - arms/2: outward is -x (pointing straight up and 1 outward)
      const eLeft = onCircle(arcCenter, 7, 180 - p.arms / 2);
      const qLeft: Pt = [eLeft[0] - 1, eLeft[1] - 2.4];
      parts.push(stroke(line(eLeft, qLeft)));

      // Right barb at 180 + arms/2: outward is +x
      const eRight = onCircle(arcCenter, 7, 180 + p.arms / 2);
      const qRight: Pt = [eRight[0] + 1, eRight[1] - 2.4];
      parts.push(stroke(line(eRight, qRight)));
    }

    return parts;
  },
});
