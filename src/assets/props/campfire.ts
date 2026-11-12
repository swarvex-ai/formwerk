import { BufferGeometry, CylinderGeometry, IcosahedronGeometry, Quaternion, Vector3 } from "three";
import { fbm3 } from "../../core/noise";
import { rng } from "../../core/rng";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

const UP = new Vector3(0, 1, 0), TAU = Math.PI * 2;

export const campfire = defineAsset({
  id: "campfire", category: "props",
  title: { de: "Lagerfeuer", en: "Campfire" },
  description: { de: "Ein Steinkreis um einen Holzstoß: Pyramide, Blockhütte oder flach ausgebreitet, ohne Flamme (die ist ein Effekt); die Enden der Holzscheite sind geschwärzt, Größe und Lage der Steine kommen aus dem Seed.", en: "A ring of stones around a stack of logs: teepee, log cabin or spread out flat, without a flame (that is an effect); the ends of the logs are charred, the size and place of the stones come from the seed." },
  params: {
    ringRadius: { type: "number", label: { de: "Kreisradius", en: "Ring radius" }, min: 0.25, max: 0.8, step: 0.01, default: 0.45, unit: "m",
      describe: { de: "Äußerer Radius des Steinkreises: 0,3 m Feuerstelle für eine Person, 0,45 m üblich, 0,8 m große Runde am Weg.", en: "Outer radius of the stone ring: 0.3 m a fire pit for one, 0.45 m usual, 0.8 m a big circle by the trail." } },
    stones: { type: "integer", label: { de: "Steine", en: "Stones" }, min: 6, max: 16, default: 10,
      describe: { de: "Zahl der Steine im Kreis: 6 bei einer kleinen Runde, 10 üblich, 16 dicht an dicht.", en: "Number of stones in the ring: 6 a small circle, 10 usual, 16 close side by side." } },
    stoneSize: { type: "number", label: { de: "Steingröße", en: "Stone size" }, min: 0.06, max: 0.2, step: 0.005, default: 0.11, unit: "m",
      describe: { de: "Größter Durchmesser eines Steins: 0,08 m faustgroß, 0,11 m üblich, 0,2 m kopfgroß.", en: "Widest diameter of a stone: 0.08 m fist-sized, 0.11 m usual, 0.2 m head-sized." } },
    logs: { type: "integer", label: { de: "Holzscheite", en: "Logs" }, min: 0, max: 6, default: 4,
      describe: { de: "Zahl der Holzscheite im Kreis: 0 nur die Feuerstelle, 4 üblich, 6 großer Stoß.", en: "Number of logs inside the ring: 0 the fire pit alone, 4 usual, 6 a big stack." } },
    stack: { type: "choice", label: { de: "Schichtung", en: "Stack" }, options: ["teepee", "log-cabin", "flat"],
      labels: { teepee: { de: "Pyramide", en: "Teepee" }, "log-cabin": { de: "Blockhütte", en: "Log cabin" }, flat: { de: "Flach", en: "Flat" } }, default: "teepee",
      describe: { de: "Wie das Holz liegt: Pyramide zum Anzünden, Blockhütte in Lagen gekreuzt, flach ausgebreitet als Glutbett.", en: "How the wood lies: teepee leaning to a point to light it, log cabin crossed in layers, spread out flat as a bed of embers." } },
    logLength: { type: "number", label: { de: "Holzlänge", en: "Log length" }, min: 0.3, max: 0.9, step: 0.01, default: 0.5, unit: "m",
      describe: { de: "Länge der Holzscheite: 0,3 m Reisig, 0,5 m Scheitholz, 0,9 m Kloben; der Platz im Kreis begrenzt sie.", en: "Length of the logs: 0.3 m brushwood, 0.5 m firewood, 0.9 m blocks; the room inside the ring limits them." } },
  },
  presets: {
    camp: { label: { de: "Lagerfeuer", en: "Camp" }, values: { stack: "teepee" } },
    "cooking-fire": { label: { de: "Kochfeuer", en: "Cooking fire" }, values: { stack: "log-cabin", stones: 12, logs: 6 } },
    embers: { label: { de: "Glutbett", en: "Embers" }, values: { stack: "flat", logs: 2 } },
  },
  physics: { body: "static", collider: "hull" },
  budget: { triangles: 2600, drawCalls: 3 },
  build(p, seed) {
    const r = rng(seed);
    const stein = material("stone", "#8d9096", 2 / p.stoneSize), holz = material("wood", "#6b4a2e"), kohle = material("paint", "#191619");
    stein.flatShading = true;
    const t = new Parts();
    // Stones: dented, squashed icosahedra sitting on the floor, their outer edge at ringRadius
    let innen = p.ringRadius;
    for (let i = 0; i < p.stones; i++) {
      const halbe = (p.stoneSize / 2) * (0.72 + r() * 0.48), flach = 0.62 + r() * 0.3, beule = r() * 20;
      const g = new IcosahedronGeometry(1, 1), pos = g.attributes.position;
      for (let v = 0; v < pos.count; v++) {
        const x = pos.getX(v), y = pos.getY(v), z = pos.getZ(v);
        const f = 1 + 0.3 * (fbm3(x * 1.7 + beule, y * 1.7, z * 1.7, seed) - 0.5) * 2;
        pos.setXYZ(v, x * f, y * f, z * f);
      }
      g.rotateY(r() * TAU);
      let rand = 1e-6, boden = 0;
      for (let v = 0; v < pos.count; v++) {
        rand = Math.max(rand, Math.hypot(pos.getX(v), pos.getZ(v)));
        boden = Math.min(boden, pos.getY(v));
      }
      const s = halbe / rand;
      g.scale(s, s * flach, s).computeVertexNormals();
      const wink = (i / p.stones) * TAU + (r() - 0.5) * (TAU / p.stones) * 0.45, mitte = p.ringRadius - halbe;
      g.translate(Math.cos(wink) * mitte, -boden * s * flach, Math.sin(wink) * mitte);
      innen = Math.min(innen, mitte - halbe);
      t.add(stein, g);
    }
    // Logs: they always stay inside the stones and above the floor, so their length follows the room that is left
    const lr = Math.min(0.06, 0.026 + p.logLength * 0.033), frei = innen - lr * 1.35;
    if (p.logs > 0 && frei > 0.05) {
      const lang = Math.min(p.logLength, 2 * frei * 0.98);
      const zyl = (rad: number, laenge: number, von: Vector3, richt: Vector3) => {
        const g = new CylinderGeometry(rad, rad, laenge, 10);
        g.translate(0, laenge / 2, 0).applyQuaternion(new Quaternion().setFromUnitVectors(UP, richt));
        return g.translate(von.x, von.y, von.z);
      };
      // One log along richt, its end faces blackened (1 the near end, 2 the far end), lifted onto the floor
      const stange = (von: Vector3, richt: Vector3, laenge: number, rad: number, schwarz: number) => {
        const d = richt.clone().normalize(), tip = Math.min(0.03, laenge * 0.4);
        const vorn = schwarz & 1 ? tip : 0, hinten = schwarz & 2 ? tip : 0;
        if (laenge - vorn - hinten < 0.02) return;
        const a = zyl(rad, laenge - vorn - hinten, von.clone().addScaledVector(d, vorn), d);
        const c: BufferGeometry[] = [];
        if (vorn) c.push(zyl(rad, tip, von, d));
        if (hinten) c.push(zyl(rad, tip, von.clone().addScaledVector(d, laenge - tip), d));
        let boden = 0;
        for (const g of [a, ...c]) { g.computeBoundingBox(); boden = Math.min(boden, g.boundingBox!.min.y); }
        t.add(holz, a.translate(0, -boden, 0));
        for (const g of c) t.add(kohle, g.translate(0, -boden, 0));
      };
      for (let i = 0; i < p.logs; i++) {
        const rad = lr * (0.86 + r() * 0.3);
        if (p.stack === "teepee") {
          // Logs leaning inwards; a single one lies down
          const L = lang * (0.92 + r() * 0.14), wink = (i / p.logs) * TAU + (r() - 0.5) * (TAU / p.logs) * 0.5;
          if (p.logs === 1) {
            const richt = new Vector3(Math.cos(wink), 0, Math.sin(wink));
            stange(richt.clone().multiplyScalar(-L / 2), richt, L, rad, 3);
          } else {
            // The logs lean to a small opening in the middle, so their charred ends stay to be seen
            const unten = Math.min(L * 0.68, frei - rad), oben = Math.min(unten * 0.55, rad * (p.logs > 4 ? 2.2 : 1.5), frei - rad * 1.2);
            const laeuft = unten - oben, hoehe = Math.sqrt(Math.max(0.04, L * L - laeuft * laeuft));
            const von = new Vector3(Math.cos(wink) * unten, 0, Math.sin(wink) * unten);
            const bis = new Vector3(Math.cos(wink) * oben, hoehe, Math.sin(wink) * oben);
            stange(von, bis.sub(von), Math.hypot(laeuft, hoehe), rad, 3);
          }
        } else if (p.stack === "log-cabin") {
          // Two logs per layer, crossed against the layer below, each one resting in the groove of the last
          const lage = Math.floor(i / 2), s = lr * 0.95;
          const halbe = Math.sqrt(Math.max(1e-4, frei * frei - (s + rad) * (s + rad))) - rad;
          const L = Math.min(lang, 2 * halbe), seite = new Vector3(lage % 2 ? 0 : 1, 0, lage % 2 ? 1 : 0);
          const quer = new Vector3(-seite.z, 0, seite.x).multiplyScalar(i % 2 ? s : -s);
          const von = quer.clone().addScaledVector(seite, -L / 2);
          von.y = lr * (1 + 1.85 * lage);
          stange(von, seite, L, rad, 3);
        } else {
          // Lying in the pit, each log a little further around and a little higher: a heap ready to burn down
          const L = Math.min(lang, 2 * (frei - rad - lr * 0.6)) * (0.9 + r() * 0.1), wink = r() * TAU + i * 1.9;
          const richt = new Vector3(Math.cos(wink), 0, Math.sin(wink));
          const von = richt.clone().multiplyScalar(-L / 2).addScaledVector(new Vector3(-richt.z, 0, richt.x), (i % 2 ? 1 : -1) * lr * 0.5);
          von.y = lr * (1 + 0.45 * i);
          stange(von, richt, L, rad, 3);
        }
      }
    }
    return t.group();
  },
});
