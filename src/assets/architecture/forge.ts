import { DodecahedronGeometry, ExtrudeGeometry, Shape } from "three";
import { rng } from "../../core/rng";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { rounded } from "../shapes";

export const forge = defineAsset({
  id: "forge", category: "architecture",
  title: { de: "Schmiedeesse", en: "Forge" },
  description: {
    de: "Eine gemauerte Schmiedeesse mit Kohlebett in einer Mulde, Rauchfang hinten und Haube über dem Feuer, für Schmieden, Waffenkammern und Werkstätten.",
    en: "A blacksmith's stone hearth with a coal bed in a recess, a stack at the back and a hood over the fire, for smithies, armouries and workshops.",
  },
  params: {
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.8, max: 1.8, step: 0.05, default: 1.2, unit: "m",
      describe: { de: "Breite der Esse entlang x: 0,8 m bei einer Feldesse, 1,2 m in einer Dorfschmiede, 1,8 m in einer Zunftschmiede.", en: "Hearth width along x: 0.8 m a small field forge, 1.2 m a village smithy, 1.8 m a guild forge." } },
    depth: { type: "number", label: { de: "Tiefe", en: "Depth" }, min: 0.6, max: 1.2, step: 0.05, default: 0.8, unit: "m",
      describe: { de: "Tiefe der Esse entlang z samt Rauchfang: 0,6 m bei einer Feldesse, 0,8 m üblich, 1,1 m in einer Zunftschmiede.", en: "Hearth depth along z, stack included: 0.6 m a field forge, 0.8 m usual, 1.1 m a guild forge." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.6, max: 0.9, step: 0.05, default: 0.75, unit: "m",
      describe: { de: "Höhe der Herdplatte, die Arbeitshöhe: 0,7 m bei einer Feldesse, 0,75 m üblich, 0,9 m für große Schmiede.", en: "Height of the hearth top, the working height: 0.7 m a field forge, 0.75 m usual, 0.9 m for a tall smith." } },
    chimney: { type: "number", label: { de: "Schornstein", en: "Chimney" }, min: 1.6, max: 3, step: 0.1, default: 2.4, unit: "m",
      describe: { de: "Gesamthöhe des Rauchfangs über dem Boden: 1,6 m bei einer Feldesse, 2,4 m in einer Dorfschmiede, 3 m bis unters Dach einer Halle.", en: "Total height of the back stack above the floor: 1.6 m a field forge, 2.4 m a village smithy, 3 m up to a hall roof." } },
    hood: { type: "choice", label: { de: "Haube", en: "Hood" }, options: ["stone", "iron", "none"],
      labels: { stone: { de: "Stein", en: "Stone" }, iron: { de: "Eisen", en: "Iron" }, none: { de: "Keine", en: "None" } }, default: "iron",
      describe: { de: "Schräge Haube 0,55 m über der Herdplatte, die vom Rauchfang über das Kohlebett ragt: gemauert, aus Eisenblech oder keine.", en: "Sloping hood 0.55 m above the hearth top, leaning from the stack over the coal bed: stone masonry, sheet iron, or none." } },
    fire: { type: "boolean", label: { de: "Feuer", en: "Fire" }, default: true,
      describe: { de: "Glühende Kohlen im Bett oder kalte schwarze Kohlen.", en: "Glowing coals in the bed, or cold black coals." } },
    stone: { type: "color", label: { de: "Stein", en: "Stone" }, default: "#8a8278",
      describe: { de: "Farbe des Mauerwerks von Esse, Rauchfang und Steinhaube; grauer Bruchstein #8a8278, roter Ziegel #8a5a48.", en: "Colour of the masonry of hearth, stack and stone hood; grey rubble #8a8278, red brick #8a5a48." } },
  },
  presets: {
    village: { label: { de: "Dorfschmiede", en: "Village smithy" }, values: { width: 1.2, depth: 0.8, chimney: 2.4, hood: "iron" } },
    "field-forge": { label: { de: "Feldesse", en: "Field forge" }, values: { width: 0.8, depth: 0.6, height: 0.7, chimney: 1.6, hood: "none" } },
    guild: { label: { de: "Zunftschmiede", en: "Guild forge" }, values: { width: 1.8, depth: 1.1, chimney: 3, hood: "stone" } },
    cold: { label: { de: "Kalt", en: "Cold" }, values: { fire: false } },
  },
  physics: { body: "static", collider: "box" },
  budget: { triangles: 6000, drawCalls: 4 },
  build(p, seed) {
    const r = rng(seed);
    const stein = material("stone", p.stone, 1, undefined, { moss: 0 });
    const t = new Parts();

    const w = p.width, d = p.depth, h = p.height;
    const back = -d / 2, front = d / 2;
    const stackD = 0.3, stackFront = back + stackD;
    const rim = 0.1, bedDrop = 0.1, coalTop = h - 0.04;

    // Coal recess in front of the stack, at least `rim` of stone on every side
    const rw = Math.min(0.4, w - 2 * rim);
    const rd = Math.min(0.35, front - stackFront - 2 * rim);
    const rz = (stackFront + front) / 2;
    const r0 = rz - rd / 2, r1 = rz + rd / 2;

    // 1. Hearth: the body up to the recess floor, then the top course around the recess
    t.add(stein, rounded(w, h - bedDrop, d, 0.02, 0, (h - bedDrop) / 2, 0));
    const course = (x0: number, x1: number, z0: number, z1: number) =>
      t.add(stein, rounded(x1 - x0, bedDrop, z1 - z0, 0.015, (x0 + x1) / 2, h - bedDrop / 2, (z0 + z1) / 2));
    course(-w / 2, w / 2, back, r0);
    course(-w / 2, w / 2, r1, front);
    course(-w / 2, -rw / 2, r0, r1);
    course(rw / 2, w / 2, r0, r1);

    // 2. Coal bed: a layer up to 0.04 m below the top, dark lumps from the seed half sunk in it, glow between them
    const lumpM = material("stone", "#2a2826", 4, undefined, { moss: 0 });
    const kohle = p.fire ? material("glow", "#ff7a2a") : lumpM;
    const bedH = coalTop - (h - bedDrop);
    t.box(kohle, rw, bedH, rd, 0, h - bedDrop + bedH / 2, rz);
    const lumps = Math.max(4, Math.round((rw * rd) / 0.0028));
    for (let i = 0; i < lumps; i++) {
      const s = 0.028 + r() * 0.02;
      const g = new DodecahedronGeometry(s, 0);
      g.rotateX(r() * Math.PI).rotateY(r() * Math.PI);
      g.scale(1, 0.7, 1);
      g.translate((r() - 0.5) * (rw - 2 * s), coalTop, r0 + s + r() * (rd - 2 * s));
      t.add(lumpM, g);
    }

    // 3. Hood: a closed wedge, flat underside 0.55 m above the top, sloping from the stack face over the coals
    const hoodY = h + 0.55, hoodRise = 0.4, lip = 0.08;
    const top = Math.max(p.chimney, h + (p.hood === "none" ? 0.8 : 0.55 + hoodRise + 0.15));
    if (p.hood !== "none") {
      const iron = p.hood === "iron";
      const m = iron ? material("iron", "#3a3633", 2, undefined, { rust: 0.35 }) : stein;
      const hoodW = Math.max(rw + 0.2, w - 0.12);
      const reach = Math.min(front - 0.05, r1 + 0.05) - stackFront;
      const fase = iron ? 0.004 : 0.012;
      // Profile in (-z, y) from the stack face, extruded along x
      const s = new Shape();
      s.moveTo(0, 0);
      s.lineTo(-reach, 0);
      s.lineTo(-reach, lip);
      s.lineTo(0, hoodRise);
      s.closePath();
      const g = new ExtrudeGeometry(s, { depth: hoodW - 2 * fase, bevelEnabled: true, bevelSize: fase, bevelThickness: fase, bevelOffset: -fase, bevelSegments: 1 });
      g.rotateY(Math.PI / 2);
      g.translate(-hoodW / 2 + fase, hoodY, stackFront);
      t.add(m, g);
    }

    // 4. Stack: full width, flush with the back, from the hearth top up
    t.add(stein, rounded(w, top - h, stackD, 0.02, 0, h + (top - h) / 2, back + stackD / 2));

    return t.group();
  },
});
