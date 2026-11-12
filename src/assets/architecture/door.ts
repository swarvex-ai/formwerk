import { CylinderGeometry } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const door = defineAsset({
  id: "door", category: "architecture",
  title: { de: "Tür", en: "Door" },
  description: { de: "Eine Tür mit Zarge, Füllungen, Klinke und auf Wunsch einem Fenster; sie öffnet sich um die linke Kante (bewegliches Teil „door“).", en: "A door with a frame, panels, a handle and, if you like, a window; it swings open on its left edge (movable part \"door\")." },
  params: {
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.7, max: 1.3, step: 0.01, default: 0.9, unit: "m",
      describe: { de: "Breite des Türblatts: 0,8 m eine Zimmertür, 1 m eine Haustür, 1,2 m breit und barrierefrei.", en: "Width of the door leaf: 0.8 m an interior door, 1 m a front door, 1.2 m wide and accessible." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 1.9, max: 2.5, step: 0.01, default: 2.05, unit: "m",
      describe: { de: "Höhe des Türblatts: 2 m üblich, 2,2 m eine Haustür, 2,4 m im Altbau.", en: "Height of the door leaf: 2 m usual, 2.2 m a front door, 2.4 m in an old building." } },
    panels: { type: "integer", label: { de: "Füllungen", en: "Panels" }, min: 0, max: 6, default: 4,
      describe: { de: "Zahl der erhabenen Füllungen: 0 glatt, 2 übereinander, 4 und 6 in zwei Reihen (ungerade wird aufgerundet).", en: "Number of raised panels: 0 flush, 2 stacked, 4 and 6 in two columns (odd numbers round up)." } },
    window: { type: "boolean", label: { de: "Fenster", en: "Window" }, default: false,
      describe: { de: "Ein Fenster im oberen Drittel statt der oberen Füllungen.", en: "A window in the top third instead of the upper panels." } },
    frame: { type: "boolean", label: { de: "Zarge", en: "Frame" }, default: true,
      describe: { de: "Ein Rahmen um die Tür; ohne steht nur das Türblatt (etwa für eine Wandöffnung).", en: "A frame around the door; without it only the leaf (for an opening in a wall)." } },
    color: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#7a4e2d",
      describe: { de: "Farbe des Holzes.", en: "Colour of the wood." } },
  },
  presets: {
    "front-door": { label: { de: "Haustür", en: "Front door" }, values: { width: 1, height: 2.2, panels: 6, color: "#7a2e2a" } },
    interior: { label: { de: "Zimmertür", en: "Interior door" }, values: { width: 0.85, panels: 0, color: "#e8e2d6" } },
    "garden-door": { label: { de: "Gartentür", en: "Garden door" }, values: { window: true, panels: 2, color: "#4f6b4a" } },
  },
  rig: { door: { label: { de: "Tür", en: "Door" }, type: "rotate", axis: [0, -1, 0], min: 0, max: 100 } },
  physics: { body: "static", collider: "box" },
  budget: { triangles: 2000, drawCalls: 4 },
  build(p) {
    const holz = material("wood", p.color), metall = material("metal", "#b8b2a6"), glas = material("plastic", "#a9c6d6"), t = new Parts();
    const W = p.width, H = p.height, d = 0.045, z = p.frame ? 0.04 : 0;
    if (p.frame) {
      for (const sx of [-1, 1]) t.box(holz, 0.08, H + 0.08, 0.13, sx * (W / 2 + 0.045), (H + 0.08) / 2, z);
      t.box(holz, W + 0.17, 0.08, 0.13, 0, H + 0.04, z);
    }
    // The leaf swings on its left edge
    const blatt = t.moving("door", -W / 2, 0, z);
    blatt.box(holz, W - 0.01, H - 0.01, d, 0, H / 2, z);
    const spalten = p.panels >= 4 ? 2 : 1, reihen = Math.ceil(p.panels / spalten), fensterAb = H * 0.62;
    const rand = 0.09, oben = p.window ? fensterAb - 0.06 : H - rand, unten = 0.12;
    const bw = (W - 2 * rand - (spalten - 1) * rand) / spalten, bh = reihen ? (oben - unten - (reihen - 1) * rand) / reihen : 0;
    // Raised panels on both faces
    for (let i = 0; i < spalten; i++) for (let j = 0; j < reihen; j++) for (const s of [-1, 1]) {
      blatt.box(holz, bw, bh, 0.02, -W / 2 + rand + bw / 2 + i * (bw + rand), unten + bh / 2 + j * (bh + rand), z + s * (d / 2 + 0.01));
    }
    if (p.window) blatt.box(glas, W - 2 * rand, H - rand - fensterAb, d + 0.006, 0, (fensterAb + H - rand) / 2, z);
    // A lever handle on both sides
    for (const s of [-1, 1]) {
      blatt.box(metall, 0.035, 0.16, 0.012, W / 2 - 0.08, 1.02, z + s * (d / 2 + 0.006));
      blatt.add(metall, new CylinderGeometry(0.01, 0.01, 0.12, 8).rotateZ(Math.PI / 2).translate(W / 2 - 0.13, 1.06, z + s * (d / 2 + 0.05)));
      blatt.box(metall, 0.02, 0.02, 0.045, W / 2 - 0.08, 1.06, z + s * (d / 2 + 0.028));
    }
    return t.group();
  },
});
