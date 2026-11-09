import { CylinderGeometry } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const wardrobe = defineAsset({
  id: "wardrobe", category: "furniture",
  title: { de: "Kleiderschrank", en: "Wardrobe" },
  description: { de: "Ein Kleiderschrank mit einer bis vier Türen, Sockel und Griffen; die Türen öffnen nach vorn, die mittleren zwei bilden ein Paar.", en: "A wardrobe with one to four doors, a plinth and handles; the doors open to the front, the middle two form a pair." },
  params: {
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.6, max: 2.4, step: 0.01, default: 1.2, unit: "m",
      describe: { de: "Breite von links nach rechts: 0,6 m ein schmaler Schrank, 1,2 m ein üblicher Zweitürer, 2,4 m ein breiter Viertürer.", en: "Width from left to right: 0.6 m a narrow wardrobe, 1.2 m a usual two-door, 2.4 m a wide four-door." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 1.8, max: 2.5, step: 0.01, default: 2, unit: "m",
      describe: { de: "Höhe insgesamt: 1,8 m niedrig, 2,0 m üblich, 2,5 m ein hoher Schrank.", en: "Overall height: 1.8 m low, 2.0 m usual, 2.5 m a tall wardrobe." } },
    depth: { type: "number", label: { de: "Tiefe", en: "Depth" }, min: 0.4, max: 0.8, step: 0.01, default: 0.6, unit: "m",
      describe: { de: "Tiefe von vorn nach hinten: 0,4 m flach, 0,6 m üblich, 0,8 m für Kleiderbügel.", en: "Depth from front to back: 0.4 m shallow, 0.6 m usual, 0.8 m for hangers." } },
    doors: { type: "integer", label: { de: "Türen", en: "Doors" }, min: 1, max: 4, default: 2,
      describe: { de: "Zahl der Türen: 1 für einen Einzeltürer, 2 für einen Zweitürer, 4 für einen breiten Schrank; die mittleren zwei bilden ein Paar.", en: "Number of doors: 1 for a single, 2 for a double, 4 for a wide wardrobe; the middle two form a pair." } },
    plinthHeight: { type: "number", label: { de: "Sockelhöhe", en: "Plinth height" }, min: 0.05, max: 0.2, step: 0.01, default: 0.08, unit: "m",
      describe: { de: "Höhe des Sockels unter dem Korpus: 0,05 m flach, 0,08 m üblich, 0,2 m hoch.", en: "Height of the plinth under the carcass: 0.05 m flat, 0.08 m usual, 0.2 m high." } },
    handleStyle: { type: "choice", label: { de: "Griff", en: "Handle" }, options: ["bar", "knob", "none"],
      labels: { bar: { de: "Stange", en: "Bar" }, knob: { de: "Knopf", en: "Knob" }, none: { de: "keiner", en: "None" } }, default: "bar",
      describe: { de: "Griff an der Öffnungskante: eine senkrechte Stange, ein runder Knopf oder keiner.", en: "Handle on the opening edge: a vertical bar, a round knob or none." } },
    color: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#7a5a3f",
      describe: { de: "Farbe des Holzes.", en: "Colour of the wood." } },
  },
  presets: {
    "single-door": { label: { de: "Einzeltürer", en: "Single door" }, values: { width: 0.6, height: 2, depth: 0.55, doors: 1, plinthHeight: 0.08, handleStyle: "knob", color: "#8a6a4a" } },
    "double-wardrobe": { label: { de: "Zweitürer", en: "Double wardrobe" }, values: { width: 1.6, height: 2.1, depth: 0.6, doors: 2, plinthHeight: 0.1, handleStyle: "bar", color: "#7a5a3f" } },
    "tall-closet": { label: { de: "Hoher Schrank", en: "Tall closet" }, values: { width: 1.2, height: 2.4, depth: 0.65, doors: 4, plinthHeight: 0.12, handleStyle: "bar", color: "#6b4f3a" } },
  },
  rig: {
    leftDoor: { label: { de: "Linke Tür", en: "Left door" }, type: "rotate", axis: [0, -1, 0], min: 0, max: 110 },
    centreDoor: { label: { de: "Mitteltür", en: "Centre door" }, type: "rotate", axis: [0, -1, 0], min: 0, max: 110 },
    rightDoor: { label: { de: "Rechte Tür", en: "Right door" }, type: "rotate", axis: [0, 1, 0], min: 0, max: 110 },
  },
  physics: { body: "static", collider: "box" },
  budget: { triangles: 4000, drawCalls: 4 },
  build(p) {
    const holz = material("wood", p.color, 1, 120), t = new Parts();
    const W = p.width, H = p.height, D = p.depth, P = p.plinthHeight;
    const dT = 0.02, margin = 0.01, gap = 0.004;
    const bodyH = H - P;
    // Plinth, slightly inset as a toe kick, and the solid carcass above it
    t.box(holz, W - 0.02, P, D - 0.02, 0, P / 2, -0.01);
    t.box(holz, W, bodyH, D, 0, P + bodyH / 2, 0);
    const inner = W - 2 * margin, doorW = (inner - (p.doors - 1) * gap) / p.doors;
    const doorH = H - P - 0.01, doorZ = D / 2 + dT / 2, doorY = P + 0.005 + doorH / 2;
    const leaf = (part: Parts, xLeft: number, width: number, opening: "left" | "right", handle = true) => {
      part.box(holz, width, doorH, dT, xLeft + width / 2, doorY, doorZ);
      const panelW = width - 0.08, panelH = doorH - 0.12;
      if (panelW > 0.02 && panelH > 0.02) part.box(holz, panelW, panelH, 0.006, xLeft + width / 2, doorY, doorZ + dT / 2 + 0.003);
      if (!handle || p.handleStyle === "none") return;
      const hx = opening === "left" ? xLeft + 0.03 : xLeft + width - 0.03;
      const hz = doorZ + dT / 2 + 0.01;
      if (p.handleStyle === "bar") part.box(holz, 0.02, 0.18, 0.02, hx, doorY, hz);
      else part.add(holz, new CylinderGeometry(0.02, 0.02, 0.02, 8).rotateX(Math.PI / 2).translate(hx, doorY, hz));
    };
    if (p.doors === 1) {
      const part = t.moving("leftDoor", -W / 2 + margin, doorY, doorZ);
      leaf(part, -W / 2 + margin, inner, "right");
    } else if (p.doors === 2) {
      const left = t.moving("leftDoor", -W / 2 + margin, doorY, doorZ);
      leaf(left, -W / 2 + margin, doorW, "right");
      const right = t.moving("rightDoor", W / 2 - margin, doorY, doorZ);
      leaf(right, W / 2 - margin - doorW, doorW, "left");
    } else if (p.doors === 3) {
      const left = t.moving("leftDoor", -W / 2 + margin, doorY, doorZ);
      leaf(left, -W / 2 + margin, doorW, "right");
      const centre = t.moving("centreDoor", -W / 2 + margin + doorW + gap, doorY, doorZ);
      leaf(centre, -W / 2 + margin + doorW + gap, doorW, "right");
      const right = t.moving("rightDoor", W / 2 - margin, doorY, doorZ);
      leaf(right, W / 2 - margin - doorW, doorW, "left");
    } else {
      const left = t.moving("leftDoor", -W / 2 + margin, doorY, doorZ);
      leaf(left, -W / 2 + margin, doorW, "right");
      const cx = -W / 2 + margin + doorW + gap;
      const centre = t.moving("centreDoor", cx, doorY, doorZ);
      leaf(centre, cx, doorW, "right", false);
      leaf(centre, cx + doorW + gap, doorW, "right");
      const right = t.moving("rightDoor", W / 2 - margin, doorY, doorZ);
      leaf(right, W / 2 - margin - doorW, doorW, "left");
    }
    return t.group();
  },
});
