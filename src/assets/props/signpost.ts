import { ConeGeometry, ExtrudeGeometry, Shape } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const signpost = defineAsset({
  id: "signpost", category: "props",
  title: { de: "Wegweiser", en: "Signpost" },
  description: { de: "Ein Wegweiser aus Holz mit einem bis vier Schildern in verschiedene Richtungen, als Pfeil oder gerade.", en: "A wooden signpost with one to four boards in different directions, as arrows or straight." },
  params: {
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 1.4, max: 3.2, step: 0.05, default: 2.3, unit: "m",
      describe: { de: "Höhe des Pfostens: 1,6 m an einem Wanderweg, 2,3 m an einer Kreuzung, 3 m in einer Stadt.", en: "Height of the post: 1.6 m on a trail, 2.3 m at a crossroads, 3 m in a town." } },
    boards: { type: "integer", label: { de: "Schilder", en: "Boards" }, min: 1, max: 4, default: 2,
      describe: { de: "Zahl der Schilder übereinander.", en: "Number of boards one above the other." } },
    boardLength: { type: "number", label: { de: "Schildlänge", en: "Board length" }, min: 0.4, max: 1.2, step: 0.01, default: 0.75, unit: "m",
      describe: { de: "Länge eines Schilds vom Pfosten bis zur Spitze.", en: "Length of a board from the post to its tip." } },
    spread: { type: "number", label: { de: "Richtungen", en: "Spread" }, min: 0, max: 180, step: 5, default: 70, unit: "°",
      describe: { de: "Winkel zwischen aufeinanderfolgenden Schildern: 0 alle in eine Richtung, 90° an einer Kreuzung, 180° nach links und rechts.", en: "Angle between consecutive boards: 0 all one way, 90° at a crossroads, 180° left and right." } },
    pointed: { type: "boolean", label: { de: "Pfeile", en: "Arrows" }, default: true,
      describe: { de: "Schilder mit Pfeilspitze; aus sind es gerade Bretter.", en: "Boards with an arrow tip; off they are straight planks." } },
    color: { type: "color", label: { de: "Holz", en: "Wood" }, default: "#9c7a52",
      describe: { de: "Farbe des Holzes.", en: "Colour of the wood." } },
  },
  presets: {
    crossroads: { label: { de: "Kreuzung", en: "Crossroads" }, values: { boards: 3, spread: 90 } },
    trail: { label: { de: "Wanderweg", en: "Trail" }, values: { height: 1.6, boards: 1, boardLength: 0.6 } },
    town: { label: { de: "Stadt", en: "Town" }, values: { height: 3, boards: 4, spread: 45, color: "#6b5038" } },
  },
  physics: { body: "static", collider: "cylinder" },
  budget: { triangles: 800, drawCalls: 1 },
  build(p) {
    const holz = material("wood", p.color), t = new Parts(), h = p.height, hb = 0.16, db = 0.03;
    t.box(holz, 0.1, h, 0.1, 0, h / 2, 0);
    t.add(holz, new ConeGeometry(0.085, 0.08, 4).rotateY(Math.PI / 4).translate(0, h + 0.04, 0));
    for (let k = 0; k < p.boards; k++) {
      // Each board turns further than the one above, alternating sides
      const y = h - 0.18 - k * (hb + 0.07), winkel = ((k % 2 ? -1 : 1) * Math.ceil(k / 2) * p.spread * Math.PI) / 180, l = p.boardLength;
      const s = new Shape();
      s.moveTo(0.05, -hb / 2);
      if (p.pointed) { s.lineTo(l - hb / 2, -hb / 2); s.lineTo(l, 0); s.lineTo(l - hb / 2, hb / 2); }
      else { s.lineTo(l, -hb / 2); s.lineTo(l, hb / 2); }
      s.lineTo(0.05, hb / 2);
      s.closePath();
      t.add(holz, new ExtrudeGeometry(s, { depth: db, bevelEnabled: false }).translate(0, 0, 0.05).rotateY(winkel).translate(0, y, 0));
    }
    return t.cylinder(0.07, h).group();
  },
});
