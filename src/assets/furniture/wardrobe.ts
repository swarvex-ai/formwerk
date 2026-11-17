import { material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { rounded, turned } from "../shapes";

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
  budget: { triangles: 13000, drawCalls: 4 },
  build(p) {
    const holz = material("wood", p.color, 1, 120), t = new Parts();
    const W = p.width, H = p.height, D = p.depth, P = p.plinthHeight;
    const sT = 0.019, topT = 0.025, backT = 0.008, dT = 0.02, reveal = 0.0035, vGap = 0.0035;
    const topY = H - topT;
    // Plinth set back as a toe kick under the carcass
    t.add(holz, rounded(W - 0.03, P, D - 0.07, 0.003, 0, P / 2, -0.015, 2));
    // Carcass: two sides, the bottom and the back panel between them, the top with a cornice over sides and doors
    for (const s of [-1, 1]) t.add(holz, rounded(sT, topY - P, D, 0.003, s * (W / 2 - sT / 2), (P + topY) / 2, 0, 2));
    t.add(holz, rounded(W - 2 * sT, sT, D - backT, 0.003, 0, P + sT / 2, backT / 2, 2));
    t.add(holz, rounded(W - 2 * sT, topY - P, backT, 0.002, 0, (P + topY) / 2, -D / 2 + backT / 2, 2));
    const front = D / 2 + dT + 0.015;
    t.add(holz, rounded(W + 0.03, topT, front + D / 2, 0.004, 0, topY + topT / 2, (front - D / 2) / 2, 2));
    // Overlay doors: 3.5 mm reveals to the carcass edges and between the doors, back face 0.5 mm before the front
    const inner = W - 2 * reveal, doorW = (inner - (p.doors - 1) * vGap) / p.doors;
    const doorH = topY - P - 2 * reveal, doorZ = D / 2 + 0.0005 + dT / 2, doorY = P + reveal + doorH / 2;
    const face = doorZ + dT / 2, hz = face + 0.03, groove = 0.006;
    const leaf = (part: Parts, xLeft: number, width: number, opening: "left" | "right", handle = true) => {
      const frameW = Math.min(0.07, width * 0.22), cx = xLeft + width / 2;
      // Frame: two stiles over the full height, two rails between them, their faces a millimetre back
      for (const s of [-1, 1]) part.add(holz, rounded(frameW, doorH, dT, 0.0025, cx + (s * (width - frameW)) / 2, doorY, doorZ, 2));
      for (const s of [-1, 1]) part.add(holz, rounded(width - 2 * frameW + 0.002, frameW, dT * 0.9, 0.0025, cx, doorY + (s * (doorH - frameW)) / 2, doorZ, 2));
      // The panel sits in grooves of the frame, so no light passes around it: a raised field with a bevel, a few
      // millimetres behind the face of the frame, and its flat margin (four strips running under the field)
      const panelW = width - 2 * frameW + 2 * groove, panelH = doorH - 2 * frameW + 2 * groove;
      const inset = groove + Math.min(0.03, (width - 2 * frameW) * 0.2), sw = Math.min(inset + 0.01, panelW / 2 - 0.002);
      part.add(holz, rounded(panelW - 2 * inset, panelH - 2 * inset, 0.014, 0.004, cx, doorY, doorZ - 0.002, 2));
      for (const s of [-1, 1]) part.add(holz, rounded(sw, panelH, 0.008, 0.001, cx + (s * (panelW - sw)) / 2, doorY, doorZ - 0.004, 1));
      for (const s of [-1, 1]) part.add(holz, rounded(panelW - 2 * sw, sw, 0.008, 0.001, cx, doorY + (s * (panelH - sw)) / 2, doorZ - 0.004, 1));
      if (!handle || p.handleStyle === "none") return;
      const hx = opening === "left" ? xLeft + frameW / 2 : xLeft + width - frameW / 2;
      if (p.handleStyle === "bar") {
        // The pull stands off the door on two posts that reach the door face
        part.add(holz, rounded(0.02, 0.24, 0.016, 0.003, hx, doorY, hz, 2));
        for (const s of [-1, 1]) part.add(holz, rounded(0.014, 0.02, 0.024, 0.002, hx, doorY + s * 0.1, face + 0.011, 2));
      } else {
        // A knob turned about z: a neck on the door face, a round head in front
        part.add(holz, turned([[0.008, 0], [0.007, 0.012], [0.016, 0.018], [0.018, 0.026], [0.012, 0.032], [0.0001, 0.034]], 12).rotateX(Math.PI / 2).translate(hx, doorY, face - 0.001));
      }
    };
    const xStart = -W / 2 + reveal;
    if (p.doors === 1) {
      const part = t.moving("leftDoor", xStart, doorY, doorZ);
      leaf(part, xStart, inner, "right");
    } else {
      const left = t.moving("leftDoor", xStart, doorY, doorZ);
      leaf(left, xStart, doorW, "right");
      if (p.doors >= 3) {
        // With 4 doors the centre pair is one rigid part with one handle, on its right leaf
        const cx = xStart + doorW + vGap;
        const centre = t.moving("centreDoor", cx, doorY, doorZ);
        if (p.doors === 4) leaf(centre, cx, doorW, "right", false);
        leaf(centre, xStart + (p.doors - 2) * (doorW + vGap), doorW, "right");
      }
      const right = t.moving("rightDoor", W / 2 - reveal, doorY, doorZ);
      leaf(right, W / 2 - reveal - doorW, doorW, "left");
    }
    return t.group();
  },
});
