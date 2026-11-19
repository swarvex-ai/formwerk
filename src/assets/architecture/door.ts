import { CurvePath, LineCurve3, QuadraticBezierCurve3, SphereGeometry, TubeGeometry, Vector3 } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { rounded, turned } from "../shapes";

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
  budget: { triangles: 13200, drawCalls: 6 },
  build(p) {
    const holz = material("wood", p.color), quer = material("wood", p.color, 1, undefined, { grain: "level" });
    const metall = material("metal", "#b8b2a6"), glas = material("plastic", "#a9c6d6"), t = new Parts();
    const W = p.width, H = p.height, d = 0.045, z = p.frame ? 0.04 : 0;
    if (p.frame) {
      // Jambs and the head between them; the hinge-side jamb is narrower, so the leaf clears it when open
      const innen = W / 2 + 0.026, aussen = W / 2 + 0.085;
      t.add(holz, rounded(aussen - innen, H + 0.08, 0.13, 0.005, -(aussen + innen) / 2, (H + 0.08) / 2, z));
      t.add(holz, rounded(0.08, H + 0.08, 0.13, 0.005, W / 2 + 0.045, (H + 0.08) / 2, z));
      t.add(quer, rounded(innen + W / 2 + 0.005, 0.08, 0.13, 0.005, (W / 2 + 0.005 - innen) / 2, H + 0.04, z));
      // Door stop behind the closed leaf, its front face 2 mm behind the leaf's back face
      const zs = z - d / 2 - 0.0095;
      t.add(holz, rounded(0.03, H - 0.03, 0.015, 0.002, -innen + 0.015, (H - 0.03) / 2, zs));
      t.add(holz, rounded(0.03, H - 0.03, 0.015, 0.002, W / 2 - 0.01, (H - 0.03) / 2, zs));
      t.add(holz, rounded(innen + W / 2 + 0.005, 0.03, 0.015, 0.002, (W / 2 + 0.005 - innen) / 2, H - 0.015, zs));
    }
    // The leaf swings on its left edge: stiles and rails, with panels and glass set into them
    const blatt = t.moving("door", -W / 2, 0, z);
    const x0 = -W / 2 + 0.005, x1 = W / 2 - 0.005, y0 = 0.005, y1 = H - 0.005, sb = 0.1, rh = 0.1, fensterAb = H * 0.62;
    const brett = (m: typeof holz, a0: number, a1: number, b0: number, b1: number) => blatt.add(m, rounded(a1 - a0, b1 - b0, d, 0.003, (a0 + a1) / 2, (b0 + b1) / 2, z));
    if (!p.panels && !p.window) brett(holz, x0, x1, y0, y1);
    else {
      for (const [a0, a1] of [[x0, x0 + sb], [x1 - sb, x1]]) brett(holz, a0, a1, y0, y1);
      brett(quer, x0 + sb, x1 - sb, y1 - rh, y1);
      const spalten = p.panels >= 4 ? 2 : 1, reihen = Math.ceil(p.panels / spalten);
      const oben = p.window ? fensterAb - (p.panels ? rh : 0) : y1 - rh;
      // Flush below the window
      if (!p.panels) brett(holz, x0 + sb, x1 - sb, y0, oben);
      else {
        brett(quer, x0 + sb, x1 - sb, y0, y0 + 0.2);
        if (p.window) brett(quer, x0 + sb, x1 - sb, oben, fensterAb);
        const bw = (x1 - x0 - 2 * sb - (spalten - 1) * rh) / spalten, bh = (oben - y0 - 0.2 - (reihen - 1) * rh) / reihen;
        for (let j = 0; j < reihen; j++) {
          const b0 = y0 + 0.2 + j * (bh + rh);
          if (j) brett(quer, x0 + sb, x1 - sb, b0 - rh, b0);
          for (let i = 0; i < spalten; i++) {
            const a0 = x0 + sb + i * (bw + rh);
            if (i) brett(holz, a0 - rh, a0, b0, b0 + bh);
            // Raised panel: 8 mm into the frame around it, the field 5 mm proud on both faces
            blatt.add(holz, rounded(bw + 0.016, bh + 0.016, 0.02, 0.003, a0 + bw / 2, b0 + bh / 2, z));
            blatt.add(holz, rounded(bw - 0.08, bh - 0.08, 0.03, 0.003, a0 + bw / 2, b0 + bh / 2, z));
          }
        }
      }
      if (p.window) {
        // Glass 8 mm into the frame, held by glazing beads on both faces
        const a0 = x0 + sb, a1 = x1 - sb, b0 = fensterAb, b1 = y1 - rh, k = 0.012;
        blatt.box(glas, a1 - a0 + 0.016, b1 - b0 + 0.016, 0.006, (a0 + a1) / 2, (b0 + b1) / 2, z);
        for (const s of [-1, 1]) {
          const zl = z + s * (0.0025 + k / 2);
          for (const b of [b0 - 0.0005 + k / 2, b1 + 0.0005 - k / 2]) blatt.add(quer, rounded(a1 - a0 + 0.001, k, k, 0.002, (a0 + a1) / 2, b, zl));
          for (const a of [a0 - 0.0005 + k / 2, a1 + 0.0005 - k / 2]) blatt.add(quer, rounded(k, b1 - b0 - 2 * k + 0.002, k, 0.002, a, (b0 + b1) / 2, zl));
        }
      }
    }
    // A lever on a rosette on both faces, its grip towards the hinge, and a keyhole escutcheon below
    const hx = W / 2 - 0.055, hy = 1.02;
    for (const s of [-1, 1]) {
      const zf = z + s * (d / 2 - 0.0005);
      const scheibe = (r: number, h: number, y: number) => blatt.add(metall, turned([[0.001, 0], [r, 0], [r, h * 0.6], [r - 0.003, h], [0.001, h]], 16).rotateX((s * Math.PI) / 2).translate(hx, y, zf));
      scheibe(0.025, 0.008, hy);
      scheibe(0.018, 0.005, hy - 0.08);
      // Neck out of the rosette, a 90° bend, the grip with a rounded end
      const zr = zf + s * 0.008, bahn = new CurvePath<Vector3>();
      bahn.add(new LineCurve3(new Vector3(hx, hy, zr - s * 0.003), new Vector3(hx, hy, zr + s * 0.04)));
      bahn.add(new QuadraticBezierCurve3(new Vector3(hx, hy, zr + s * 0.04), new Vector3(hx, hy, zr + s * 0.06), new Vector3(hx - 0.02, hy, zr + s * 0.06)));
      bahn.add(new LineCurve3(new Vector3(hx - 0.02, hy, zr + s * 0.06), new Vector3(hx - 0.115, hy, zr + s * 0.06)));
      blatt.add(metall, new TubeGeometry(bahn, 32, 0.01, 12, false));
      blatt.add(metall, new SphereGeometry(0.01, 12, 6).translate(hx - 0.115, hy, zr + s * 0.06));
    }
    return t.group();
  },
});
