import { ConeGeometry, CylinderGeometry, IcosahedronGeometry, Quaternion, Vector3 } from "three";
import { rng } from "../../core/rng";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const tree = defineAsset({
  id: "tree", category: "nature",
  title: { de: "Baum", en: "Tree" },
  description: { de: "Laub- oder Nadelbaum aus rekursiven Ästen; jeder Seed wächst anders.", en: "A broadleaf or conifer grown from recursive branches; every seed grows differently." },
  params: {
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 1, max: 16, step: 0.1, default: 6, unit: "m",
      describe: { de: "Gesamthöhe des Baums.", en: "Total height of the tree." } },
    trunk: { type: "number", label: { de: "Stammradius", en: "Trunk radius" }, min: 0.04, max: 0.6, step: 0.01, default: 0.18, unit: "m",
      describe: { de: "Radius des Stamms am Boden; auch der Radius des Kollisionszylinders.", en: "Radius of the trunk at the ground; also the radius of the collision cylinder." } },
    crown: { type: "choice", label: { de: "Krone", en: "Crown" }, options: ["round", "cone", "bare"], labels: { round: { de: "Laub", en: "broadleaf" }, cone: { de: "Nadelbaum", en: "conifer" }, bare: { de: "kahl", en: "bare" } }, default: "round",
      describe: { de: "Laubkrone, kegelförmiger Nadelbaum oder kahle Äste (Winter).", en: "Broadleaf crown, conical conifer, or bare branches (winter)." } },
    levels: { type: "integer", label: { de: "Astebenen", en: "Branch levels" }, min: 1, max: 5, default: 3,
      describe: { de: "Wie oft sich die Äste verzweigen; jede Ebene vervielfacht die Dreiecke.", en: "How often the branches fork; every level multiplies the triangles." } },
    branches: { type: "integer", label: { de: "Äste je Gabel", en: "Branches per fork" }, min: 2, max: 5, default: 3,
      describe: { de: "Äste je Verzweigung.", en: "Branches at each fork." } },
    spread: { type: "number", label: { de: "Spreizung", en: "Spread" }, min: 10, max: 70, step: 1, default: 35, unit: "°",
      describe: { de: "Winkel der Äste zu ihrem Mutterast: klein wirkt schlank, groß ausladend.", en: "Angle of the branches to their parent: small looks slender, large looks spreading." } },
    leafSize: { type: "number", label: { de: "Laubgröße", en: "Leaf size" }, min: 0.3, max: 2, step: 0.05, default: 1,
      describe: { de: "Größe der Laubbüschel oder Nadelkegel relativ zum Ast.", en: "Size of the leaf clusters or needle cones relative to the branch." } },
    barkColor: { type: "color", label: { de: "Rinde", en: "Bark" }, default: "#6b4a2f",
      describe: { de: "Farbe der Rinde.", en: "Colour of the bark." } },
    leafColor: { type: "color", label: { de: "Laub", en: "Leaves" }, default: "#3f7d3a",
      describe: { de: "Farbe von Laub oder Nadeln.", en: "Colour of the leaves or needles." } },
  },
  presets: {
    oak: { label: { de: "Eiche", en: "Oak" }, values: { height: 9, trunk: 0.35, levels: 4, spread: 45, leafSize: 1.2 } },
    fir: { label: { de: "Tanne", en: "Fir" }, values: { height: 10, trunk: 0.25, crown: "cone", leafColor: "#2f5d3a" } },
    winter: { label: { de: "Winterbaum", en: "Winter tree" }, values: { crown: "bare", levels: 4 } },
    sapling: { label: { de: "Setzling", en: "Sapling" }, values: { height: 1.5, trunk: 0.04, levels: 2 } },
  },
  // Kollision nur am Stamm: unter der Krone kann man hindurchgehen
  physics: { body: "static", collider: "cylinder" },
  budget: { triangles: 120000, drawCalls: 2 },
  build(p, seed) {
    const r = rng(seed);
    const rinde = material("bark", p.barkColor, 1 / Math.max(0.5, p.trunk * 5)), laub = material("leaf", p.leafColor);
    laub.flatShading = true;
    const t = new Parts();
    const oben = new Vector3(0, 1, 0);
    if (p.crown === "cone") {
      t.add(rinde, new CylinderGeometry(p.trunk * 0.4, p.trunk, p.height, 8, 1, true).translate(0, p.height / 2, 0));
      t.cylinder(p.trunk, p.height);
      const stufen = p.levels * 2 + 2;
      for (let i = 0; i < stufen; i++) {
        const k = i / stufen, rad = p.height * 0.28 * (1 - k) * p.leafSize + 0.1, hh = (p.height * 0.75) / stufen * 1.8;
        t.add(laub, new ConeGeometry(rad, hh, 10, 1, true).translate(0, p.height * 0.22 + k * p.height * 0.75 + hh / 2, 0));
      }
      return t.group();
    }
    const stamm = p.height * 0.42;
    t.cylinder(p.trunk, stamm);
    const ast = (start: Vector3, richtung: Vector3, laenge: number, radius: number, ebene: number) => {
      const g = new CylinderGeometry(radius * 0.72, radius, laenge, ebene === 0 ? 8 : 6, 1, true);
      g.translate(0, laenge / 2, 0);
      g.applyQuaternion(new Quaternion().setFromUnitVectors(oben, richtung));
      g.translate(start.x, start.y, start.z);
      t.add(rinde, g);
      const ende = start.clone().addScaledVector(richtung, laenge);
      if (ebene >= p.levels) {
        // Laub nie unter den Boden
        if (p.crown === "round") t.add(laub, new IcosahedronGeometry(Math.min(laenge * 0.9 * p.leafSize, ende.y * 0.95), 0).translate(ende.x, ende.y, ende.z));
        return;
      }
      for (let i = 0; i < p.branches; i++) {
        const um = (i / p.branches) * Math.PI * 2 + r() * 1.2, neig = (p.spread * (0.7 + r() * 0.6) * Math.PI) / 180;
        const neu = richtung.clone().applyAxisAngle(new Vector3(Math.cos(um), 0, Math.sin(um)), neig).normalize();
        if (neu.y < 0.15) { neu.y = 0.15; neu.normalize(); } // Äste wachsen nicht in den Boden
        ast(ende, neu, laenge * (0.62 + r() * 0.12), radius * 0.62, ebene + 1);
      }
    };
    ast(new Vector3(0, 0, 0), oben.clone(), stamm, p.trunk, 0);
    return t.group();
  },
});
