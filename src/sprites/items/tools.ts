import { hex, Pixels, ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 16, H = 16;
const ROST = ramp("#8a4228");

export const tools = defineSprite({
  id: "tools", category: "items",
  title: { de: "Bauernwerkzeuge", en: "Farm tools" },
  description: {
    de: "Bäuerliche und gärtnerische Werkzeuge als Inventar-Gegenstände: Mistgabel, Hacke, Sichel oder Gießkanne mit wanderndem Metallglanz und Rostspuren. 16 × 16 Pixel.",
    en: "Farm and garden tools as inventory items and pick-ups: pitchfork, hoe, sickle or watering can with a glint moving along the metal and rust marks. 16 × 16 pixels.",
  },
  params: {
    kind: { type: "choice", options: ["pitchfork", "hoe", "sickle", "watering-can"], default: "pitchfork", label: { de: "Art", en: "Kind" },
      labels: { pitchfork: { de: "Mistgabel", en: "pitchfork" }, hoe: { de: "Hacke", en: "hoe" }, sickle: { de: "Sichel", en: "sickle" }, "watering-can": { de: "Gießkanne", en: "watering can" } },
      describe: { de: "Art des Werkzeugs: Mistgabel mit drei Zinken, Feldhacke mit Querblatt, geschwungene Sichel oder Gießkanne mit Tülle und Brause.", en: "Kind of tool: pitchfork with three tines, hoe with flat blade, curved sickle or watering can with spout and rose." } },
    handleColour: { type: "color", default: "#8a6a40", label: { de: "Stielfarbe", en: "Handle colour" },
      describe: { de: "Farbe des Holzgriffs oder Holzstiels, typisch hellbraun #8a6a40 oder abgenutzt dunkel #5e4325.", en: "Colour of the wooden handle or shaft, typically light brown #8a6a40 or weathered dark #5e4325." } },
    metalColour: { type: "color", default: "#9aa0a8", label: { de: "Metallfarbe", en: "Metal colour" },
      describe: { de: "Farbe der Metallteile: Eisen #9aa0a8, dunkler Stahl #70757d oder Bronze #c88a4a.", en: "Colour of metal parts: iron #9aa0a8, dark steel #70757d or bronze #c88a4a." } },
    angle: { type: "choice", options: ["diagonal", "upright"], default: "diagonal", label: { de: "Ausrichtung", en: "Angle" },
      labels: { diagonal: { de: "diagonal", en: "diagonal" }, upright: { de: "aufrecht", en: "upright" } },
      describe: { de: "Ausrichtung langer Werkzeuge: diagonal von links unten nach rechts oben oder senkrecht aufrecht.", en: "Orientation of long tools: diagonal from bottom left to top right or vertical upright." } },
    worn: { type: "boolean", default: false, label: { de: "Abgenutzt", en: "Worn" },
      describe: { de: "Abgenutztes Werkzeug mit dunklerem Stiel und rostbraunen Flecken auf dem Metall.", en: "Worn tool with a darker handle and rust-brown marks on the metal." } },
  },
  presets: {
    pitchfork: { label: { de: "Mistgabel", en: "Pitchfork" }, values: { kind: "pitchfork" } },
    hoe: { label: { de: "Hacke", en: "Hoe" }, values: { kind: "hoe" } },
    sickle: { label: { de: "Sichel", en: "Sickle" }, values: { kind: "sickle" } },
    "watering-can": { label: { de: "Gießkanne", en: "Watering can" }, values: { kind: "watering-can" } },
    "old-hoe": { label: { de: "Alte Hacke", en: "Old hoe" }, values: { kind: "hoe", worn: true } },
  },
  frame: { w: W, h: H },
  directions: ["down"],
  animations: [{ name: "idle", frames: 1, fps: 1, loop: true }, { name: "shine", frames: 3, fps: 6, loop: true }],
  grounded: false,
  build(p) {
    const rawH = ramp(p.handleColour);
    // When worn, handle is darker
    const h = p.worn ? { light: rawH.base, base: rawH.dark, dark: rawH.deep, deep: rawH.deep } : rawH;
    const m = ramp(p.metalColour);
    const weiss = hex("#ffffff");

    return (animation, _d, f) => {
      const b = new Pixels(W, H);
      const isShine = animation === "shine";

      if (p.kind === "pitchfork") {
        if (p.angle === "diagonal") {
          // 1. Handle, 7 px: for i = 0..6 set (1+i, 13-i); i = 0 hDark, otherwise alternate hBase/hLight as now.
          for (let i = 0; i <= 6; i++) {
            b.set(1 + i, 13 - i, i === 0 ? h.dark : i % 2 === 1 ? h.base : h.light);
          }
          // 2. Crossbar, 2 px thick, perpendicular: for i = 0..6 set (4+i, 6+i) mDark; for i = 0..5 set (5+i, 6+i) mBase.
          for (let i = 0; i <= 6; i++) b.set(4 + i, 6 + i, m.dark);
          for (let i = 0; i <= 5; i++) b.set(5 + i, 6 + i, m.base);
          // 3. Three tines as 2-px staircases going up-right:
          // tine(x0, y0) sets, for i = 0..3, (x0+i, y0-i) mLight and (x0+i+1, y0-i) mBase.
          const tine = (x0: number, y0: number) => {
            for (let i = 0; i <= 3; i++) {
              b.set(x0 + i, y0 - i, m.light);
              b.set(x0 + i + 1, y0 - i, m.base);
            }
          };
          tine(4, 5);
          tine(7, 8);
          tine(10, 11);
          // 4. Worn rust and shine glints
          if (p.worn) {
            b.set(6, 8, ROST.base);
            b.set(8, 10, ROST.dark);
          }
          if (isShine) {
            const glints: [number, number][] = [[5, 4], [8, 5], [11, 8]];
            const [gx, gy] = glints[f];
            b.set(gx, gy, weiss);
          }
        } else {
          // Upright pitchfork:
          // Handle: vertical, x = 7, y = 5..14 (10 px)
          for (let y = 5; y <= 14; y++) {
            b.set(7, y, y % 2 === 0 ? h.base : h.light);
          }
          b.set(7, 14, h.dark);
          // Crossbar: y = 5, x = 4..10
          for (let x = 4; x <= 10; x++) {
            b.set(x, 5, m.dark);
          }
          // Three vertical tines: x = 4, 7, 10; y = 1..4 (4 px)
          for (const tx of [4, 7, 10]) {
            for (let y = 1; y <= 4; y++) {
              b.set(tx, y, y === 1 ? m.light : m.base);
            }
          }
          if (p.worn) {
            b.set(5, 5, ROST.base);
            b.set(8, 5, ROST.dark);
          }
          if (isShine) {
            const tx = [4, 7, 10][f];
            b.set(tx, 2, weiss);
          }
        }
      } else if (p.kind === "hoe") {
        if (p.angle === "diagonal") {
          // Handle: 13 px from (1, 14) to (13, 2)
          for (let i = 0; i < 13; i++) {
            b.set(1 + i, 14 - i, i === 0 ? h.dark : i % 2 === 1 ? h.base : h.light);
          }
          // Flat blade at top: 4 × 2 pixels perpendicular (along top-left to bottom-right axis)
          // Near (12, 3), blade extends perpendicular to diagonal (dx = +1, dy = +1)
          // 4 px long perpendicular: (10, 1), (11, 2), (12, 3), (13, 4)
          // 2 px thick: (11, 1), (12, 2), (13, 3), (14, 4)
          for (let i = 0; i < 4; i++) {
            b.set(10 + i, 1 + i, m.light);
            b.set(11 + i, 1 + i, m.dark);
          }
          if (p.worn) {
            b.set(12, 3, ROST.base);
            b.set(11, 2, ROST.dark);
          }
          if (isShine) {
            const bladeShine: [number, number][] = [[10, 1], [11, 2], [13, 4]];
            const [gx, gy] = bladeShine[f];
            b.set(gx, gy, weiss);
          }
        } else {
          // Upright hoe: vertical handle at x = 7, y = 3..14
          for (let y = 3; y <= 14; y++) {
            b.set(7, y, y % 2 === 0 ? h.base : h.light);
          }
          b.set(7, 14, h.dark);
          // Flat horizontal blade of 4 × 2 pixels at top: x = 6..9, y = 1..2
          for (let x = 6; x <= 9; x++) {
            b.set(x, 1, m.light);
            b.set(x, 2, m.dark);
          }
          if (p.worn) {
            b.set(7, 2, ROST.base);
            b.set(8, 1, ROST.dark);
          }
          if (isShine) {
            const shineX = [6, 7, 9][f];
            b.set(shineX, 1, weiss);
          }
        }
      } else if (p.kind === "sickle") {
        if (p.angle === "diagonal") {
          // Short handle: 4 pixels at bottom left: (2, 13), (3, 12), (4, 11), (5, 10)
          for (let i = 0; i < 4; i++) {
            b.set(2 + i, 13 - i, i === 0 ? h.dark : i % 2 === 1 ? h.base : h.light);
          }
          // Curved blade: thick arc of about 200°, 1-2 pixels wide, radius 5 around centre (8, 6)
          // Arc sweeping from handle (5, 10) through right/top to tip on left
          const arcPixels: [number, number, boolean][] = [
            [5, 9, false], [6, 9, true],
            [6, 8, false], [7, 8, true],
            [8, 9, false], [9, 9, true],
            [10, 8, false], [11, 8, true],
            [11, 7, false], [12, 7, true],
            [12, 6, false], [13, 6, true],
            [12, 5, false], [13, 5, true],
            [11, 4, false], [12, 4, true],
            [10, 3, false], [11, 3, true],
            [8, 2, false], [9, 2, true],
            [7, 2, false], [6, 2, true],
            [5, 3, false], [4, 3, false],
            [3, 4, false],
          ];
          for (const [x, y, isDark] of arcPixels) {
            b.set(x, y, isDark ? m.dark : m.base);
          }
          // Highlight edge on the inner curve
          b.set(9, 4, m.light);
          b.set(10, 5, m.light);
          b.set(11, 6, m.light);

          if (p.worn) {
            b.set(11, 7, ROST.base);
            b.set(8, 2, ROST.dark);
          }
          if (isShine) {
            const sickleGlints: [number, number][] = [[12, 5], [9, 2], [4, 3]];
            const [gx, gy] = sickleGlints[f];
            b.set(gx, gy, weiss);
          }
        } else {
          // Upright sickle: handle vertical at (7, 11..14)
          for (let y = 11; y <= 14; y++) {
            b.set(7, y, y === 14 ? h.dark : y % 2 === 0 ? h.base : h.light);
          }
          // Curved blade curving up and over
          const arcPixels: [number, number, boolean][] = [
            [7, 10, false], [8, 10, true],
            [8, 9, false], [9, 9, true],
            [10, 8, false], [11, 8, true],
            [11, 7, false], [12, 7, true],
            [11, 6, false], [12, 6, true],
            [10, 5, false], [11, 5, true],
            [9, 4, false], [10, 4, true],
            [8, 3, false], [9, 3, true],
            [6, 3, false], [7, 3, true],
            [5, 4, false], [4, 4, false],
            [3, 5, false],
          ];
          for (const [x, y, isDark] of arcPixels) {
            b.set(x, y, isDark ? m.dark : m.base);
          }
          b.set(8, 5, m.light);
          b.set(9, 6, m.light);

          if (p.worn) {
            b.set(10, 8, ROST.base);
            b.set(7, 3, ROST.dark);
          }
          if (isShine) {
            const sickleGlints: [number, number][] = [[11, 6], [8, 3], [4, 4]];
            const [gx, gy] = sickleGlints[f];
            b.set(gx, gy, weiss);
          }
        }
      } else {
        // watering-can: body 7 × 6 pixels, spout rising to the right with rose (2 × 3) at end, handle loop on top
        // in metalColour, not rotated by angle.
        // Body: 7 wide × 6 high: x = 3..9, y = 8..13
        for (let y = 8; y <= 13; y++) {
          for (let x = 3; x <= 9; x++) {
            const edge = x === 3 || y === 8;
            const darkEdge = x === 9 || y === 13;
            b.set(x, y, edge ? m.light : darkEdge ? m.dark : m.base);
          }
        }
        // Handle loop on top: from (4, 7) up to y=5, across to (8, 5), down to (8, 7)
        for (let y = 5; y <= 7; y++) {
          b.set(4, y, m.base);
          b.set(8, y, m.dark);
        }
        for (let x = 4; x <= 8; x++) {
          b.set(x, 5, m.light);
        }
        // Spout rising to the right: from (10, 11) up-right to (12, 8)
        b.set(10, 11, m.base);
        b.set(10, 10, m.light);
        b.set(11, 10, m.base);
        b.set(11, 9, m.light);
        b.set(12, 9, m.base);
        b.set(12, 8, m.light);
        // Rose (2 × 3) at end of spout: x = 13..14, y = 7..9
        for (let y = 7; y <= 9; y++) {
          b.set(13, y, m.base);
          b.set(14, y, y === 7 ? m.light : m.dark);
        }

        if (p.worn) {
          b.set(6, 12, ROST.base);
          b.set(11, 10, ROST.dark);
        }
        if (isShine) {
          // Glint moving along spout / top
          const canGlints: [number, number][] = [[5, 8], [11, 9], [13, 7]];
          const [gx, gy] = canGlints[f];
          b.set(gx, gy, weiss);
        }
      }

      return b;
    };
  },
});
