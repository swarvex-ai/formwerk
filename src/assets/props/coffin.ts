import { ExtrudeGeometry, Shape } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

// The outline in plan: the shape's y runs to the head end (the asset's -z), extruded along its own z and stood up
function kontur(outline: string, L: number, W: number): Shape {
  const eck = outline === "box"
    ? [[-W / 2, L / 2], [W / 2, L / 2], [W / 2, -L / 2], [-W / 2, -L / 2]]
    : [[-0.3 * W, L / 2], [0.3 * W, L / 2], [0.5 * W, 0.2 * L], [0.225 * W, -L / 2], [-0.225 * W, -L / 2], [-0.5 * W, 0.2 * L]];
  const s = new Shape();
  s.moveTo(eck[0][0], eck[0][1]);
  for (const [x, y] of eck.slice(1)) s.lineTo(x, y);
  return s;
}
// The outline as a prism of the given thickness, rising from y = 0 (the shape's y becomes -z, so the head stays at -z)
function prism(k: Shape, dicke: number) {
  return new ExtrudeGeometry(k, { depth: dicke, bevelEnabled: false }).rotateX(-Math.PI / 2);
}

export const coffin = defineAsset({
  id: "coffin", category: "props",
  title: { de: "Sarg", en: "Coffin" },
  description: { de: "Ein hölzerner Sarg für Friedhof, Gruft, Vampirlager und Bestattungshaus: rechteckige oder sechseckige Form mit drei Metallgriffen an jeder Längsseite, der Deckel klappt auf (bewegliches Teil „lid“), auf Wunsch mit erhabenem Kreuz.", en: "A wooden coffin for graveyards, crypts, vampire lairs and undertakers' shops: box or six-sided outline with three metal handles on each long side, the lid opens (movable part \"lid\"), optionally with a raised cross." },
  params: {
    outline: { type: "choice", label: { de: "Umriss", en: "Outline" }, options: ["box", "tapered"],
      labels: { box: { de: "Rechteckig", en: "Box" }, tapered: { de: "Sechseckig", en: "Tapered" } }, default: "tapered",
      describe: { de: "Form von oben: Rechteck oder die klassische sechseckige Form, am breitesten an den Schultern, zum Kopf- und Fußende schmaler.", en: "Shape in plan: a rectangle or the classic six-sided outline, widest at the shoulders, narrower at the head and foot ends." } },
    length: { type: "number", label: { de: "Länge", en: "Length" }, min: 1.6, max: 2.2, step: 0.01, default: 1.9, unit: "m",
      describe: { de: "Länge von Kopf- bis Fußende: 1,7 m ein Kindersarg, 1,9 m üblich, 2,1 m für eine große Person.", en: "Length from the head to the foot end: 1.7 m a child's coffin, 1.9 m usual, 2.1 m for a tall person." } },
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.45, max: 0.75, step: 0.01, default: 0.6, unit: "m",
      describe: { de: "Breite an den Schultern: 0,5 m schmal, 0,6 m üblich, 0,7 m breit.", en: "Width at the shoulders: 0.5 m narrow, 0.6 m usual, 0.7 m broad." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.3, max: 0.5, step: 0.01, default: 0.38, unit: "m",
      describe: { de: "Höhe des Kastens ohne Deckel: 0,3 m flach, 0,38 m üblich, 0,5 m hoch.", en: "Height of the body without the lid: 0.3 m low, 0.38 m usual, 0.5 m tall." } },
    handles: { type: "boolean", label: { de: "Griffe", en: "Handles" }, default: true,
      describe: { de: "Drei Metallgriffe an jeder Längsseite: 12 cm lange Stäbe, 3 cm von der Wand abgesetzt, auf halber Höhe.", en: "Three metal handles on each long side: 12 cm bars standing 3 cm out from the side, at mid height." } },
    cross: { type: "boolean", label: { de: "Kreuz", en: "Cross" }, default: false,
      describe: { de: "Ein erhaben aufgesetztes Kreuz auf dem Deckel: 1 cm hoch, eine halbe Länge lang, aus dem Holz des Deckels.", en: "A raised cross on the lid: 1 cm proud, half the length long, of the lid's wood." } },
    colour: { type: "color", label: { de: "Holz", en: "Wood" }, default: "#5a3a24",
      describe: { de: "Farbe des Holzes: #5a3a24 dunkle Eiche, #8a5a33 Kiefer, #2a1a18 fast schwarz.", en: "Colour of the wood: #5a3a24 dark oak, #8a5a33 pine, #2a1a18 nearly black." } },
    metalColour: { type: "color", label: { de: "Griffe", en: "Handles" }, default: "#8a7a5a",
      describe: { de: "Farbe der Griffe: Messing #8a7a5a, altes Silber #b0a080, Eisen #4a4a4a.", en: "Colour of the handles: brass #8a7a5a, old silver #b0a080, iron #4a4a4a." } },
  },
  presets: {
    tapered: { label: { de: "Klassisch sechseckig", en: "Classic tapered" }, values: { outline: "tapered" } },
    "plain-box": { label: { de: "Schlichtes Rechteck", en: "Plain box" }, values: { outline: "box", handles: false } },
    vampire: { label: { de: "Vampirsarg", en: "Vampire coffin" }, values: { cross: true, colour: "#2a1a18", metalColour: "#b0a080" } },
  },
  rig: { lid: { label: { de: "Deckel", en: "Lid" }, type: "rotate", axis: [0, 0, 1], min: 0, max: 100 } },
  physics: { body: "dynamic", collider: "hull" },
  budget: { triangles: 1500, drawCalls: 3 },
  build(p) {
    const L = p.length, W = p.width, H = p.height;
    // Drawn solid but hollow inside, so an effective density of 300; the fibres run along the length of the boards
    const holz = material("wood", p.colour, 1, 300, { grain: "z" }), metall = material("metal", p.metalColour);
    const k = kontur(p.outline, L, W), t = new Parts();
    t.add(holz, prism(k, H));
    // The hinge runs along z through the shoulders' left corner; inside the moving part (define.ts shifts by the
    // pivot) the lid then spans x = 0 to W and y = 0 to 0.05 from the hinge: positive rotation about z lifts its
    // +x edge, the lid swings up over the left side and never into the body, and at 0 it sits on the body's top
    const deckel = t.moving("lid", -W / 2, H, 0);
    deckel.add(holz, prism(k, 0.05).translate(0, H, 0));
    if (p.cross) {
      // Resting on the lid's top surface, 1 cm proud, centred along z at 0.4 × length from the head end
      const zK = -L / 2 + 0.4 * L;
      deckel.box(holz, 0.09, 0.01, 0.5 * L, 0, H + 0.055, zK);
      deckel.box(holz, 0.26, 0.01, 0.09, 0, H + 0.055, zK - 0.16 * L);
    }
    if (p.handles) {
      // Three bars per long side, from the shoulder to the foot (box: the whole side), turned to follow the slanting face
      for (const s of [-1, 1]) {
        const ax = s * W / 2, az = p.outline === "tapered" ? -0.2 * L : -L / 2;
        const dx = (p.outline === "tapered" ? s * 0.225 * W : s * W / 2) - ax, dz = L / 2 - az;
        const len = Math.hypot(dx, dz), nx = (s * dz) / len, nz = (-s * dx) / len;
        for (const f of [0.25, 0.5, 0.75]) {
          t.box(metall, 0.014, 0.02, 0.12, ax + f * dx + 0.03 * nx, H / 2, az + f * dz + 0.03 * nz, Math.atan2(dx, dz));
        }
      }
    }
    return t.group();
  },
});
