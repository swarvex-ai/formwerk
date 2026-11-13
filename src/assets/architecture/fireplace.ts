import { CylinderGeometry, ExtrudeGeometry, Shape, Vector3 } from "three";
import { rng } from "../../core/rng";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const fireplace = defineAsset({
  id: "fireplace", category: "architecture",
  title: { de: "Kamin", en: "Fireplace" },
  description: { de: "Ein offener Kamin an einer Wand für Gasthäuser, Küchen und Hallen.", en: "An open hearth against a wall, for inns, kitchens and halls." },
  params: {
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.9, max: 2.4, step: 0.05, default: 1.4, unit: "m",
      describe: { de: "Gesamtbreite des Kamins: 1 m im Kaminzimmer, 1,4 m üblich, 2,2 m in einer Burgküche.", en: "Total width of the fireplace: 1 m in a cottage, 1.4 m usual, 2.2 m in a hall." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.8, max: 1.6, step: 0.05, default: 1.1, unit: "m",
      describe: { de: "Höhe bis zur Oberkante des Kaminsimses.", en: "Height to the top of the mantelpiece." } },
    depth: { type: "number", label: { de: "Tiefe", en: "Depth" }, min: 0.35, max: 0.8, step: 0.01, default: 0.5, unit: "m",
      describe: { de: "Tiefe von der Wand bis zur Vorderseite des Kaminkörpers.", en: "Depth from the wall to the front face of the fireplace body." } },
    opening: { type: "choice", label: { de: "Öffnung", en: "Opening" }, options: ["square", "arch"],
      labels: { square: { de: "Eckig", en: "Square" }, arch: { de: "Bogen", en: "Arch" } }, default: "arch",
      describe: { de: "Form des Kaminmunds: rechteckig oder mit Rundbogen oben.", en: "Shape of the opening: square or with an arched top." } },
    openingWidth: { type: "number", label: { de: "Öffnungsbreite", en: "Opening width" }, min: 0.4, max: 0.75, step: 0.01, default: 0.6,
      describe: { de: "Breite der Feuerungsöffnung als Anteil der Gesamtbreite.", en: "Width of the opening as a fraction of total width." } },
    mantel: { type: "boolean", label: { de: "Kaminsims", en: "Mantel" }, default: true,
      describe: { de: "Hölzerner Sims oben auf dem Kamin; ragt nach vorn und zu den Seiten über.", en: "Wooden shelf along the top; overhangs to the front and sides." } },
    chimney: { type: "number", label: { de: "Schornstein", en: "Chimney" }, min: 0, max: 1.5, step: 0.05, default: 0.6, unit: "m",
      describe: { de: "Höhe des verjüngten Schornsteins über dem Sims; 0 für keinen.", en: "Height of the narrower chimney breast above the mantel; 0 for none." } },
    fire: { type: "choice", label: { de: "Feuer", en: "Fire" }, options: ["none", "embers", "logs"],
      labels: { none: { de: "Keins", en: "None" }, embers: { de: "Glut", en: "Embers" }, logs: { de: "Holz", en: "Logs" } }, default: "logs",
      describe: { de: "Zustand des Feuers: erloschen, flaches Glutbett oder brennende Holzscheite mit Glut.", en: "State of the fire: extinguished, flat glowing embers, or crossed logs with glow." } },
    stoneColour: { type: "color", label: { de: "Stein", en: "Stone" }, default: "#8a8278",
      describe: { de: "Farbe des Mauerwerks.", en: "Colour of the masonry." } },
    woodColour: { type: "color", label: { de: "Holz", en: "Wood" }, default: "#5a3a22",
      describe: { de: "Farbe von Kaminsims und Holzscheiten.", en: "Colour of the mantel shelf and logs." } },
  },
  presets: {
    inn: { label: { de: "Gasthaus", en: "Inn" }, values: { width: 1.4, height: 1.1, depth: 0.5, opening: "arch", fire: "logs" } },
    kitchen: { label: { de: "Küche", en: "Kitchen" }, values: { width: 2.2, height: 1.4, opening: "square", openingWidth: 0.7, chimney: 1.2 } },
    cottage: { label: { de: "Kate", en: "Cottage" }, values: { width: 1, height: 0.9, mantel: false, fire: "embers" } },
    cold: { label: { de: "Kalt", en: "Cold" }, values: { fire: "none", opening: "square" } },
  },
  physics: { body: "static", collider: "box" },
  budget: { triangles: 4000, drawCalls: 4 },
  build(p, seed) {
    const r = rng(seed);
    const stein = material("stone", p.stoneColour);
    const holz = material("wood", p.woodColour);
    const glut = material("glow", "#ff7a2a");
    const t = new Parts();

    const w = p.width;
    const h = p.height;
    const d = p.depth;
    const ow = w * p.openingWidth;
    const oh = 0.65 * h;
    const halfOw = ow / 2;
    const frontD = 0.12;

    // 1. Front face with opening (Shape + ExtrudeGeometry)
    // Outer rect: from x = -w/2 to w/2, y = 0 to h
    const shape = new Shape();
    shape.moveTo(-w / 2, 0);
    shape.lineTo(w / 2, 0);
    shape.lineTo(w / 2, h);
    shape.lineTo(-w / 2, h);
    shape.closePath();

    const hole = new Shape();
    if (p.opening === "square") {
      hole.moveTo(-halfOw, 0);
      hole.lineTo(halfOw, 0);
      hole.lineTo(halfOw, oh);
      hole.lineTo(-halfOw, oh);
      hole.closePath();
    } else {
      // Arched opening: opening top must stay exactly at oh = 0.65 * h
      hole.moveTo(-halfOw, 0);
      hole.lineTo(halfOw, 0);
      if (halfOw <= 0.5 * oh) {
        // Half-round top
        const archY = oh - halfOw;
        hole.lineTo(halfOw, archY);
        hole.absarc(0, archY, halfOw, 0, Math.PI, false);
        hole.lineTo(-halfOw, 0);
      } else {
        // Segmental arch with rise s = 0.5 * oh
        const s = 0.5 * oh;
        const R = (halfOw * halfOw + s * s) / (2 * s);
        const a = Math.asin((oh - s - (oh - R)) / R);
        hole.lineTo(halfOw, oh - s);
        hole.absarc(0, oh - R, R, a, Math.PI - a, false);
        hole.lineTo(-halfOw, 0);
      }
      hole.closePath();
    }
    shape.holes.push(hole);

    // Front face extruded by frontD = 0.12, positioned from z = -frontD to 0
    const frontGeo = new ExtrudeGeometry(shape, { depth: frontD, bevelEnabled: false, curveSegments: 24 });
    frontGeo.translate(0, 0, -frontD);
    t.add(stein, frontGeo);

    // 2. Firebox
    // Back wall, side walls and cavity floor
    const wallThick = (w - ow) / 2;
    const backWallThick = 0.08;
    const cavityDepth = d - frontD - backWallThick;
    const cavityZ = -d + backWallThick + cavityDepth / 2;

    // Back wall: thickness backWallThick at z = -d + backWallThick/2
    t.box(stein, w, h, backWallThick, 0, h / 2, -d + backWallThick / 2);

    // Left and right side walls of firebox
    if (cavityDepth > 0.001) {
      t.box(stein, wallThick, h, cavityDepth, -w / 2 + wallThick / 2, h / 2, cavityZ);
      t.box(stein, wallThick, h, cavityDepth, w / 2 - wallThick / 2, h / 2, cavityZ);
    }

    // Top enclosure / lintel ceiling over cavity
    const topH = h - oh;
    if (topH > 0.001 && cavityDepth > 0.001) {
      t.box(stein, ow, topH, cavityDepth, 0, oh + topH / 2, cavityZ);
    }

    // Firebox floor behind front opening
    const floorH = 0.04;
    if (cavityDepth > 0.001) {
      t.box(stein, ow, floorH, cavityDepth, 0, floorH / 2, cavityZ);
    }

    // Hearth slab: 0.04 m high, 0.3 m deep in front, spans full width w
    t.box(stein, w, 0.04, 0.3, 0, 0.02, 0.15);

    // 3. Mantel
    if (p.mantel) {
      const mantelThick = 0.06;
      const overhang = 0.08;
      const mantelW = w + 2 * overhang;
      const mantelD = d + overhang;
      // Sticking out 0.08 m to the front (up to z = 0.08) and wall at z = -d
      t.box(holz, mantelW, mantelThick, mantelD, 0, h + mantelThick / 2, -d + mantelD / 2);
    }

    // Chimney breast
    if (p.chimney > 0) {
      const chimW = 0.7 * w;
      const chimH = p.chimney;
      const chimY0 = h + (p.mantel ? 0.06 : 0);
      t.box(stein, chimW, chimH, d, 0, chimY0 + chimH / 2, -d / 2);
    }

    // 4. Fire
    if (p.fire !== "none") {
      const fireW = ow * 0.7;
      const minCavityZ = -d + backWallThick;
      const maxCavityZ = -frontD;
      const sideDepth = maxCavityZ - minCavityZ; // = cavityDepth
      const fireCenterZ = (minCavityZ + maxCavityZ) / 2;

      // Glow embers bed
      const emberD = Math.max(0.08, sideDepth * 0.7);
      const emberH = 0.025;
      t.box(glut, fireW, emberH, emberD, 0, floorH + emberH / 2, fireCenterZ);

      if (p.fire === "logs") {
        const logR = Math.min(0.045, Math.max(0.025, ow * 0.04));
        const maxRot = 0.32;
        // Clamp log length so rotated logs never pierce back wall (z = -d) or front cavity edge
        const maxLByDepth = Math.max(0.08, (sideDepth - 2 * logR - 0.02) / Math.sin(maxRot));
        const logL = Math.min(0.85 * fireW, maxLByDepth);

        const addCylinder = (rad: number, len: number, pos: Vector3, rotY: number, tiltX: number) => {
          const g = new CylinderGeometry(rad, rad, len, 10);
          g.rotateZ(Math.PI / 2);
          if (tiltX !== 0) g.rotateX(tiltX);
          if (rotY !== 0) g.rotateY(rotY);
          g.translate(pos.x, pos.y, pos.z);
          t.add(holz, g);
        };

        // Log 1: bottom-left-to-right
        const rot1 = (r() - 0.5) * 0.25;
        const y1 = floorH + emberH + logR;
        const z1 = fireCenterZ - 0.02 + (r() - 0.5) * 0.02;
        addCylinder(logR, logL, new Vector3((r() - 0.5) * 0.02, y1, z1), rot1, 0);

        // Log 2: bottom-right-to-left
        const rot2 = (r() - 0.5) * 0.25;
        const y2 = floorH + emberH + logR;
        const z2 = fireCenterZ + 0.02 + (r() - 0.5) * 0.02;
        addCylinder(logR * 0.95, logL * 0.95, new Vector3((r() - 0.5) * 0.02, y2, z2), rot2, 0);

        // Log 3: crossed on top
        const rot3 = (r() > 0.5 ? 1 : -1) * (0.2 + r() * 0.12);
        const y3 = floorH + emberH + logR * 2 + 0.01;
        const z3 = fireCenterZ + (r() - 0.5) * 0.02;
        addCylinder(logR * 0.9, logL * 0.85, new Vector3(0, y3, z3), rot3, (r() - 0.5) * 0.05);

        // Small glowing ember cluster in between
        t.box(glut, fireW * 0.45, 0.02, emberD * 0.45, 0, y1 + logR * 0.5, fireCenterZ);
      }
    }

    return t.group();
  },
});
