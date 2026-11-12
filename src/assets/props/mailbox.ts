import { CylinderGeometry, ExtrudeGeometry, Shape } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const mailbox = defineAsset({
  id: "mailbox", category: "props",
  title: { de: "Briefkasten", en: "Mailbox" },
  description: { de: "Ein Briefkasten auf einem Pfosten an der Straße oder am Tor: ein ländlicher Kasten mit gewölbtem Dach oder ein aufrechter Kasten mit Einwurfschlitz, mit Klappe und Signalflagge (bewegliche Teile „door“ und „flag“).", en: "A letterbox on a post by a road or a gate: a rural box with a rounded roof or an upright box with a slot, with a folding lid and a signal flag (movable parts \"door\" and \"flag\")." },
  params: {
    style: { type: "choice", label: { de: "Bauform", en: "Style" }, options: ["rural", "box"], labels: { rural: { de: "Ländlich", en: "Rural" }, box: { de: "Kasten", en: "Box" } }, default: "rural",
      describe: { de: "Ländlich: ein langer Kasten mit gewölbtem Dach auf einem Pfosten. Kasten: ein aufrechter Kasten mit Einwurfschlitz oben.", en: "Rural: a long box with a rounded roof on a post. Box: an upright box with a mail slot in the top." } },
    postHeight: { type: "number", label: { de: "Pfostenhöhe", en: "Post height" }, min: 0, max: 1.4, step: 0.05, default: 1, unit: "m",
      describe: { de: "Höhe des Pfostens vom Boden bis zum Kastenboden: 0 steht der Kasten auf dem Boden, 1 m an der Straße, 1,2 m am Tor.", en: "Height of the post from the floor to the bottom of the box: 0 the box stands on the ground, 1 m by a road, 1.2 m at a gate." } },
    size: { type: "number", label: { de: "Größe", en: "Size" }, min: 0.3, max: 0.7, step: 0.01, default: 0.48, unit: "m",
      describe: { de: "Größe des Kastens: beim ländlichen Kasten seine Länge entlang des Pfostens (0,48 m), beim aufrechten Kasten seine Höhe (0,55 m).", en: "Size of the box: its length along the post for a rural box (0.48 m), its height for an upright box (0.55 m)." } },
    colour: { type: "color", label: { de: "Kasten", en: "Box" }, default: "#2f4f7a",
      describe: { de: "Farbe des lackierten Kastens.", en: "Colour of the painted box." } },
    flagColour: { type: "color", label: { de: "Flagge", en: "Flag" }, default: "#c8372d",
      describe: { de: "Farbe der Signalflagge an der rechten Seite.", en: "Colour of the signal flag on the right side." } },
  },
  presets: {
    rural: { label: { de: "Ländlich", en: "Rural" }, values: { style: "rural" } },
    city: { label: { de: "Stadt", en: "City" }, values: { style: "box", size: 0.55, postHeight: 0.8, colour: "#c8372d" } },
    "wall-box": { label: { de: "Wandkasten", en: "Wall box" }, values: { style: "box", postHeight: 0, size: 0.35, colour: "#d9a300" } },
  },
  rig: {
    door: { label: { de: "Klappe", en: "Lid" }, type: "rotate", axis: [1, 0, 0], min: 0, max: 100 },
    flag: { label: { de: "Flagge", en: "Flag" }, type: "rotate", axis: [1, 0, 0], min: 0, max: 90 },
  },
  physics: { body: "static", collider: "box" },
  budget: { triangles: 2500, drawCalls: 4 },
  build(p) {
    const t = new Parts();
    const holz = material("wood", "#6b5038"), metall = material("metal", p.colour, 1, 300), lack = material("paint", p.flagColour);
    const y0 = p.postHeight;
    if (y0 > 0) t.post(holz, 0.04, y0, 0, 0, 0, 10, true);

    const rural = p.style === "rural";
    const w = rural ? 0.28 : Math.max(0.2, p.size * 0.52); // width (x)
    const bh = rural ? 0.2 : p.size;                        // box height; for the rural box the lower part under the roof
    const dp = rural ? p.size : Math.max(0.13, p.size * 0.38); // depth (z): rural length, box depth
    const frontZ = dp / 2, gap = 0.004, td = rural ? 0.014 : 0.012;

    // Body: lower box, plus a half-cylinder roof for the rural tunnel
    t.box(metall, w, bh, dp, 0, y0 + bh / 2, 0);
    if (rural) t.add(metall, new CylinderGeometry(w / 2, w / 2, dp, 16, 1, false, Math.PI / 2, Math.PI).rotateX(Math.PI / 2).translate(0, y0 + bh, 0));
    else { // mail slot in the top: a thin raised frame with a slit between the bars
      const top = y0 + bh, th = 0.008, bar = 0.013, sx = w * 0.33, sz = 0.02;
      t.box(metall, sx * 2, th, bar, 0, top + th / 2, sz);
      t.box(metall, sx * 2, th, bar, 0, top + th / 2, -sz);
      t.box(metall, bar, th, sz * 2, sx, top + th / 2, 0);
      t.box(metall, bar, th, sz * 2, -sx, top + th / 2, 0);
    }

    // Door: the front lid folds down about its bottom edge at (0, y0, hingeZ). Geometry is added from the hinge
    // (Parts recenters it on the pivot), so a rotation around x pivots cleanly on that edge and never below the floor.
    const dh = bh + (rural ? w / 2 : 0); // door reaches the top of the arch, so it also covers the rounded half
    const hingeZ = frontZ + gap + td;
    let doorMax = 100;
    for (let a = 100; a >= 0; a--) if (y0 + dh * Math.cos((a * Math.PI) / 180) >= 0) { doorMax = a; break; }
    const door = t.moving("door", 0, y0, hingeZ, { max: doorMax });
    if (rural) {
      const s = new Shape();
      s.moveTo(-w / 2, 0); s.lineTo(-w / 2, bh);
      s.absarc(0, bh, w / 2, Math.PI, 0, true);
      s.lineTo(w / 2, 0); s.closePath();
      door.add(metall, new ExtrudeGeometry(s, { depth: td, bevelEnabled: false }).translate(0, y0, frontZ + gap));
    } else door.box(metall, w, dh, td, 0, y0 + dh / 2, frontZ + gap + td / 2);

    // Flag: a thin arm on the +x side with a small plate, folded along the box (0) and swinging up about x (90)
    const arm = Math.min(0.14, dp * 0.7), flX = w / 2, flY = y0 + bh * (rural ? 0.85 : 0.55), flZ = frontZ - 0.03;
    const flag = t.moving("flag", flX, flY, flZ);
    flag.box(lack, 0.01, 0.01, arm, flX, flY, flZ - arm / 2);
    flag.box(lack, 0.006, 0.004, 0.07, flX, flY, flZ - arm + 0.05);

    return t.group();
  },
});
