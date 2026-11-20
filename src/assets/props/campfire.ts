import { BufferGeometry, CircleGeometry, CylinderGeometry, Float32BufferAttribute, IcosahedronGeometry, Quaternion, Vector3, type Material } from "three";
import { mergeVertices, toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";
import { fbm3 } from "../../core/noise";
import { rng } from "../../core/rng";
import { grained, material } from "../../materials";
import { defineAsset, Parts } from "../define";

const UP = new Vector3(0, 1, 0), TAU = Math.PI * 2;

export const campfire = defineAsset({
  id: "campfire", category: "props",
  title: { de: "Lagerfeuer", en: "Campfire" },
  description: { de: "Ein Steinkreis um einen Holzstoß auf einem Aschebett: Pyramide, Blockhütte oder flach ausgebreitet, ohne Flamme (die ist ein Effekt); die Enden der Holzscheite sind geschwärzt, Größe und Lage der Steine kommen aus dem Seed.", en: "A ring of stones around a stack of logs on a bed of ash: teepee, log cabin or spread out flat, without a flame (that is an effect); the ends of the logs are charred, the size and place of the stones come from the seed." },
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
  budget: { triangles: 9000, drawCalls: 4 },
  build(p, seed) {
    const r = rng(seed);
    const stein = material("stone", "#8d9096", 2 / p.stoneSize);
    // Bark and the charred wood follow each log's own axis (grain "part"): furrows along the bark, cracks along the charred ends
    const rinde = material("bark", "#4e3a29", 3, undefined, { grain: "part" });
    const kohle = material("wood", "#1f1b18", 4, undefined, { grain: "part" });
    const asche = material("stone", "#4f4a46", 6);
    const t = new Parts();
    // Stones: broken field stones like the rock, each with a few flat fracture faces and a flat base, their outer edge at ringRadius
    let innen = p.ringRadius;
    for (let i = 0; i < p.stones; i++) {
      const halbe = (p.stoneSize / 2) * (0.72 + r() * 0.48), flach = 0.55 + r() * 0.3, beule = r() * 20;
      let g: BufferGeometry = new IcosahedronGeometry(1, 3);
      g.deleteAttribute("normal");
      g.deleteAttribute("uv");
      g = mergeVertices(g);
      const ebenen: { n: Vector3; d: number }[] = [];
      for (let k = 0; k < 7; k++) ebenen.push({ n: new Vector3(r() * 2 - 1, (r() * 2 - 1) * 0.6, r() * 2 - 1).normalize(), d: 0.48 + r() * 0.22 });
      const pos = g.attributes.position, v = new Vector3();
      for (let j = 0; j < pos.count; j++) {
        v.fromBufferAttribute(pos, j);
        v.multiplyScalar(1 + 0.45 * (fbm3(v.x * 1.6 + beule, v.y * 1.6, v.z * 1.6, seed) - 0.5));
        for (const { n, d } of ebenen) { const s = v.dot(n) - d; if (s > 0) v.addScaledVector(n, -s); }
        v.y = Math.max(v.y, -0.5);
        pos.setXYZ(j, v.x, v.y, v.z);
      }
      g = toCreasedNormals(g, (50 * Math.PI) / 180);
      const uv = new Float32Array(g.attributes.position.count * 2);
      for (let j = 0; j < g.attributes.position.count; j++) {
        v.fromBufferAttribute(g.attributes.position, j).normalize();
        uv[2 * j] = 0.5 + Math.atan2(v.z, v.x) / TAU; uv[2 * j + 1] = 0.5 + Math.asin(Math.max(-1, Math.min(1, v.y))) / Math.PI;
      }
      g.setAttribute("uv", new Float32BufferAttribute(uv, 2));
      g.rotateY(r() * TAU);
      g.computeBoundingBox();
      const bb = g.boundingBox!, rand = Math.max(1e-6, -bb.min.x, bb.max.x, -bb.min.z, bb.max.z);
      const s = halbe / rand;
      g.scale(s, s * flach, s).computeBoundingBox();
      const wink = (i / p.stones) * TAU + (r() - 0.5) * (TAU / p.stones) * 0.45, mitte = p.ringRadius - halbe;
      g.translate(Math.cos(wink) * mitte, -g.boundingBox!.min.y, Math.sin(wink) * mitte);
      innen = Math.min(innen, mitte - halbe);
      t.add(stein, g);
    }
    // Ash bed: a low grey mound that fills the ring and fades into the floor at its edge
    const R = Math.max(0.05, innen * 0.88), hoch = Math.min(0.025, R * 0.08), RINGE = 6, SEKT = 48;
    const ap: number[] = [0, hoch, 0], au: number[] = [0.5, 0.5], ai: number[] = [];
    for (let k = 1; k <= RINGE; k++) for (let j = 0; j < SEKT; j++) {
      const q = k / RINGE, a = (j / SEKT) * TAU, x = Math.cos(a), z = Math.sin(a);
      const rr = R * q * (1 + 0.35 * q * q * (fbm3(x * 1.5, 3, z * 1.5, seed + 2) - 0.5));
      const y = k === RINGE ? 0 : hoch * (1 - q * q) * (0.7 + 0.6 * fbm3(x * q * 3, 7, z * q * 3, seed + 3));
      ap.push(x * rr, y, z * rr);
      au.push(0.5 + (x * rr) / (2 * R), 0.5 + (z * rr) / (2 * R));
    }
    for (let j = 0; j < SEKT; j++) ai.push(0, 1 + ((j + 1) % SEKT), 1 + j);
    for (let k = 1; k < RINGE; k++) for (let j = 0; j < SEKT; j++) {
      const a = 1 + (k - 1) * SEKT + j, b = 1 + (k - 1) * SEKT + ((j + 1) % SEKT), c = a + SEKT, d = b + SEKT;
      ai.push(a, b, c, b, d, c);
    }
    const bett = new BufferGeometry();
    bett.setAttribute("position", new Float32BufferAttribute(ap, 3));
    bett.setAttribute("uv", new Float32BufferAttribute(au, 2));
    bett.setIndex(ai);
    bett.computeVertexNormals();
    t.add(asche, bett);
    // Logs: they always stay inside the stones and above the floor, so their length follows the room that is left
    const lr = Math.min(0.06, 0.026 + p.logLength * 0.033), frei = innen - lr * 1.35;
    if (p.logs > 0 && frei > 0.05) {
      const lang = Math.min(p.logLength, 2 * frei * 0.98), SEG = 16;
      // One log from von along richt: bark not quite round with a slight taper, both ends charred and burnt
      // down a little, with a ragged edge where the charcoal meets the bark; lifted onto the floor
      const scheit = (von: Vector3, richt: Vector3, L: number, rad: number, oben = 1) => {
        const d = richt.clone().normalize(), dreh = new Quaternion().setFromUnitVectors(UP, d);
        const f1 = r() * TAU, f2 = r() * TAU, f3 = r() * TAU, taper = 0.05 * (r() * 2 - 1);
        const tip0 = Math.min(L * 0.3, rad * (1.4 + r() * 1.4)), tip1 = Math.min(L * 0.3, rad * (1.4 + r() * 1.4)) * oben;
        const girth = (a: number) => 1 + 0.035 * Math.sin(3 * a + f1) + 0.025 * Math.sin(5 * a + f2) - 0.06;
        const kante = (a: number) => rad * 0.35 * Math.sin(2 * a + f3), kante1 = (a: number) => kante(a + 1) * oben;
        const brand = (u: number) => 1 - 0.2 * Math.max(0, 1 - u / tip0) ** 2 - 0.2 * Math.max(0, 1 - (L - u) / tip1) ** 2;
        const radius = (u: number, a: number) => rad * girth(a) * (1 + taper * (u / L - 0.5)) * brand(u);
        // A tube from u0(a) to u1(a) along the local y axis
        const stueck = (u0: (a: number) => number, u1: (a: number) => number, ringe: number) => {
          const g = new CylinderGeometry(1, 1, 1, SEG, ringe, true), ps = g.attributes.position;
          for (let j = 0; j < ps.count; j++) {
            const a = Math.atan2(ps.getZ(j), ps.getX(j)), u = u0(a) + (ps.getY(j) + 0.5) * (u1(a) - u0(a)), R = radius(u, a);
            ps.setXYZ(j, Math.cos(a) * R, u, Math.sin(a) * R);
          }
          return g;
        };
        // An end: a low cone, so the burnt end is rounded off
        const ende = (u: number, s: number) => {
          const g = new CircleGeometry(1, SEG).rotateX((-s * Math.PI) / 2), ps = g.attributes.position;
          for (let j = 0; j < ps.count; j++) {
            if (j === 0) { ps.setXYZ(j, 0, u + s * rad * 0.18, 0); continue; }
            const a = Math.atan2(ps.getZ(j), ps.getX(j)), R = radius(u, a);
            ps.setXYZ(j, Math.cos(a) * R, u, Math.sin(a) * R);
          }
          return g;
        };
        // The ends carry their pith (the centre of the cut), so the charred cut shows rings
        const teile: [Material, BufferGeometry, number?][] = [
          [kohle, stueck(() => 0, (a) => tip0 + kante(a), 4)],
          [rinde, stueck((a) => tip0 + kante(a), (a) => L - tip1 - kante1(a), 2)],
          [kohle, stueck((a) => L - tip1 - kante1(a), () => L, 4)],
          [kohle, ende(0, -1), 0], [kohle, ende(L, 1), L],
        ];
        let boden = Infinity;
        for (const [, g] of teile) { g.applyQuaternion(dreh).translate(von.x, von.y, von.z); g.computeVertexNormals(); g.computeBoundingBox(); boden = Math.min(boden, g.boundingBox!.min.y); }
        const achse = Math.abs(d.y) >= Math.max(Math.abs(d.x), Math.abs(d.z)) ? "y" : Math.abs(d.x) >= Math.abs(d.z) ? "x" : "z";
        const hebt = -Math.min(0, boden);
        for (const [m, g, u] of teile) {
          const mark = u === undefined ? undefined : von.clone().addScaledVector(d, u).add(new Vector3(0, hebt, 0)).toArray();
          t.add(m, grained(g.translate(0, hebt, 0), achse, mark));
        }
      };
      for (let i = 0; i < p.logs; i++) {
        const rad = lr * (0.86 + r() * 0.3);
        if (p.stack === "teepee") {
          // Logs leaning together and crossing at the top; a single one lies down
          const L = lang * (0.92 + r() * 0.14), wink = (i / p.logs) * TAU + (r() - 0.5) * (TAU / p.logs) * 0.5;
          if (p.logs === 1) {
            const richt = new Vector3(Math.cos(wink), 0, Math.sin(wink));
            scheit(richt.clone().multiplyScalar(-L / 2), richt, L, rad);
          } else {
            const unten = Math.min(L * 0.62, frei - rad), ueber = rad * 2.6;
            const laeuft = unten + ueber, hoehe = Math.sqrt(Math.max(0.04 * L * L, L * L - laeuft * laeuft));
            const von = new Vector3(Math.cos(wink) * unten, 0, Math.sin(wink) * unten);
            const bis = new Vector3(-Math.cos(wink) * ueber, hoehe, -Math.sin(wink) * ueber);
            scheit(von, bis.sub(von), L, rad, 0.3);
          }
        } else if (p.stack === "log-cabin") {
          // Two logs per layer, crossed against the layer below, each one resting on the two below
          const lage = Math.floor(i / 2), s = lr * 1.6;
          const halbe = Math.sqrt(Math.max(1e-4, frei * frei - (s + rad) * (s + rad))) - rad;
          const L = Math.min(lang, 2 * halbe), seite = new Vector3(lage % 2 ? 0 : 1, 0, lage % 2 ? 1 : 0);
          const quer = new Vector3(-seite.z, 0, seite.x).multiplyScalar(i % 2 ? s : -s);
          const von = quer.clone().addScaledVector(seite, -L / 2);
          von.y = lr * (1 + 1.8 * lage);
          scheit(von, seite, L, rad);
        } else {
          // Lying in the ash, crossed loosely, each a little higher: a heap burning down
          const L = Math.min(lang, 2 * (frei - rad - lr * 0.6)) * (0.9 + r() * 0.1), wink = (i % 2 ? Math.PI / 2 : 0) + (r() - 0.5) * 0.5;
          const richt = new Vector3(Math.cos(wink), 0, Math.sin(wink));
          const von = richt.clone().multiplyScalar(-L / 2).addScaledVector(new Vector3(-richt.z, 0, richt.x), (r() - 0.5) * lr * 2);
          von.y = lr * (1 + 0.9 * Math.floor(i / 2) + (i % 2) * 0.9);
          scheit(von, richt, L, rad);
        }
      }
    }
    return t.group();
  },
});
