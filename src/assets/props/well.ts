import { ConeGeometry, CylinderGeometry, RingGeometry, TorusGeometry } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { rng } from "../../core/rng";

export const well = defineAsset({
  id: "well", category: "props",
  title: { de: "Brunnen", en: "Well" },
  description: { de: "Ein Dorfbrunnen mit runder Steinmauer, zwei Pfosten, kleinem Dach und Kurbel mit Eimer am Seil; die Kurbel ist das bewegliche Teil „crank“, bei gesetzten Steinen legt der Seed die Fugen fest.", en: "A village well with a round stone wall, two posts, a small roof and a crank with a bucket on a rope; the crank is the movable part \"crank\", and with set stones the seed sets the joints." },
  params: {
    radius: { type: "number", label: { de: "Radius", en: "Radius" }, min: 0.4, max: 1.2, step: 0.01, default: 0.7, unit: "m",
      describe: { de: "Äußerer Radius der Steinmauer: 0,5 m ein kleiner Ziehbrunnen, 0,7 m üblich, 1,1 m ein großer Dorfbrunnen.", en: "Outer radius of the stone wall: 0.5 m a small draw well, 0.7 m usual, 1.1 m a large village well." } },
    wallHeight: { type: "number", label: { de: "Mauerhöhe", en: "Wall height" }, min: 0.5, max: 1.1, step: 0.01, default: 0.8, unit: "m",
      describe: { de: "Höhe der Steinmauer über dem Boden: 0,5 m ein niedriger Ring, 0,8 m üblich, 1,1 m hoch gemauert.", en: "Height of the stone wall above the ground: 0.5 m a low ring, 0.8 m usual, 1.1 m high masonry." } },
    roof: { type: "choice", label: { de: "Dach", en: "Roof" }, options: ["none", "gable", "cone"], labels: { none: { de: "Keins", en: "None" }, gable: { de: "Satteldach", en: "Gable" }, cone: { de: "Kegeldach", en: "Cone" } }, default: "gable",
      describe: { de: "Keins für den offenen Ring, Sattel- oder Kegeldach auf den Pfosten, der First über der Welle.", en: "None for the open ring, a gable or a cone roof on the posts with the ridge above the axle." } },
    roofHeight: { type: "number", label: { de: "Dachhöhe", en: "Roof height" }, min: 0.3, max: 1.2, step: 0.01, default: 0.45, unit: "m",
      describe: { de: "Höhe des Dachs über den Pfosten: 0,3 m flach, 0,45 m üblich, 1,2 m steil mit hohem First.", en: "Height of the roof above the posts: 0.3 m low, 0.45 m usual, 1.2 m steep with a high ridge." } },
    stones: { type: "choice", label: { de: "Mauerwerk", en: "Masonry" }, options: ["smooth", "blocks"], labels: { smooth: { de: "Glatt", en: "Smooth" }, blocks: { de: "Quader", en: "Blocks" } }, default: "blocks",
      describe: { de: "Glatte Rundwand oder gesetzte Steine in Schichten, deren Fugen und Sprünge vom Seed kommen.", en: "A smooth round wall or set stones in courses, whose joints and jumps come from the seed." } },
  },
  presets: {
    "village-well": { label: { de: "Dorfbrunnen", en: "Village well" }, values: { roof: "gable", stones: "blocks", roofHeight: 0.55 } },
    "stone-ring": { label: { de: "Steinring", en: "Stone ring" }, values: { roof: "none", stones: "blocks", wallHeight: 0.6 } },
    "covered-well": { label: { de: "Überdachter Brunnen", en: "Covered well" }, values: { roof: "cone", roofHeight: 0.8 } },
  },
  rig: { crank: { label: { de: "Kurbel", en: "Crank" }, type: "rotate", axis: [1, 0, 0], min: 0, max: 360 } },
  physics: { body: "static", collider: "cylinder" },
  budget: { triangles: 4200, drawCalls: 4 },
  build(p, seed) {
    // The wall is drawn as a hollow ring, so its mass comes from the shell only: an effective density for mortared rubble
    const stein = material("stone", "#8f8a80", 0.7, 620), holz = material("wood", "#7a5836", 1, 340),
      metall = material("metal", "#5c564e", 1, 500);
    const t = new Parts();
    const R = p.radius, h = p.wallHeight, dicke = Math.min(0.1 + R * 0.1, 0.22), innen = R - dicke;
    const kap = 0.06, mauerH = h - kap, rand = R + 0.05;
    // Courses of set stones: one jitter value per course and block, staggered by half a block, joints recessed
    const quader = p.stones === "blocks", NB = Math.max(6, Math.min(48, Math.round((2 * Math.PI * R) / 0.26)));
    const wuerfeln = rng(seed), schichten = Math.max(3, Math.min(9, Math.round(mauerH / 0.16))), segmente = quader ? NB : 24;
    const spruenge = Array.from({ length: 10 * 48 }, () => wuerfeln());
    const wand = (radius: number, drinnen: boolean) => {
      const g = new CylinderGeometry(radius, radius, mauerH, segmente, quader ? schichten : 1, true);
      if (quader) {
        const pos = g.attributes.position, schicht = mauerH / schichten, rille = (w: number) => (w < 0.16 ? 1 - w / 0.16 : 0);
        const klemme = (w: number) => Math.max(0, Math.min(1, w));
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i), z = pos.getZ(i), y = mauerH * klemme((pos.getY(i) + mauerH / 2) / mauerH);
          const s = Math.min(schichten - 1, Math.floor(y / schicht));
          const steinF = ((Math.atan2(z, x) + Math.PI) / (2 * Math.PI)) * NB + (s % 2) * 0.5;
          const block = Math.floor(steinF) % 48, fuge = Math.max(rille(klemme(y / schicht - s)), rille(steinF - Math.floor(steinF)) * 0.7);
          const neu = radius + (spruenge[s * 48 + block] - 0.5) * 0.03 + (drinnen ? 0.014 : -0.014) * fuge, laenge = Math.hypot(x, z);
          pos.setX(i, (x / laenge) * neu); pos.setZ(i, (z / laenge) * neu);
        }
        const flach = g.toNonIndexed(); flach.computeVertexNormals();
        return flach.translate(0, mauerH / 2, 0);
      }
      return g.translate(0, mauerH / 2, 0);
    };
    t.add(stein, wand(R, false));
    t.add(stein, wand(innen, true).scale(-1, 1, 1));
    t.add(stein, new RingGeometry(innen, R, segmente).rotateX(Math.PI / 2));
    t.add(stein, new RingGeometry(innen, rand, 32).rotateX(-Math.PI / 2).translate(0, h, 0));
    t.add(stein, new RingGeometry(R, rand, 32).rotateX(Math.PI / 2).translate(0, mauerH, 0));
    t.add(stein, new CylinderGeometry(rand, rand, kap, 32, 1, true).translate(0, mauerH + kap / 2, 0));
    t.cylinder(R, h);
    if (p.roof !== "none") {
      // Posts beside the wall, the roof across them with the ridge above the axle, so the crank stays free outside the post
      const pfosten = R + 0.055, dachY = h + 0.5, welle = h + 0.3;
      for (const seite of [-1, 1]) t.box(holz, 0.09, dachY, 0.09, seite * pfosten, dachY / 2, 0);
      if (p.roof === "gable") {
        // A wedge along x: the triangular profile stands in the yz plane, the ridge runs over the axle
        const kante = (R + 0.12) / 0.866, laenge = 2 * (pfosten + 0.07);
        t.add(holz, new CylinderGeometry(kante, kante, laenge, 3, 1, false, -Math.PI / 2).rotateZ(-Math.PI / 2)
          .scale(1, (p.roofHeight * 2) / (3 * kante), 1).translate(0, dachY + p.roofHeight / 3, 0));
      } else {
        t.add(holz, new ConeGeometry(pfosten + 0.14, p.roofHeight, 12).translate(0, dachY + p.roofHeight / 2, 0));
      }
      // Bucket on its rope, hanging over the shaft
      const eimerR = Math.min(0.17, innen - 0.04), eimerH = 0.2, eimerY = 0.14, bugel = eimerR * 0.95;
      t.add(metall, new CylinderGeometry(eimerR, eimerR * 0.85, eimerH, 16).translate(0, eimerY + eimerH / 2, 0));
      t.add(metall, new CylinderGeometry(eimerR + 0.01, eimerR + 0.01, 0.022, 16, 1, true).translate(0, eimerY + eimerH - 0.011, 0));
      t.add(metall, new TorusGeometry(bugel, 0.008, 4, 10, Math.PI).translate(0, eimerY + eimerH, 0));
      t.post(metall, 0.012, welle - eimerY - eimerH - bugel, 0, eimerY + eimerH + bugel, 0, 8);
      // Crank: axle, winding drum, arm and handle, all of them turn together about the axle
      const kurbel = t.moving("crank", 0, welle, 0);
      kurbel.add(holz, new CylinderGeometry(0.035, 0.035, 2 * pfosten + 0.2, 12).rotateZ(Math.PI / 2).translate(0, welle, 0));
      kurbel.add(holz, new CylinderGeometry(0.075, 0.075, 0.2, 12).rotateZ(Math.PI / 2).translate(0, welle, 0));
      kurbel.box(holz, 0.045, 0.18, 0.045, pfosten + 0.09, welle + 0.07, 0);
      kurbel.add(holz, new CylinderGeometry(0.024, 0.024, 0.12, 8).rotateZ(Math.PI / 2).translate(pfosten + 0.165, welle + 0.12, 0));
    }
    return t.group();
  },
});
