import { BufferGeometry, CylinderGeometry, Float32BufferAttribute, Quaternion, Vector3, type Material } from "three";
import { rng } from "../../core/rng";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

// One frond: leaflets as a comb on a rachis that runs out and bends down. Every triangle is drawn twice (the
// materials render front faces only), and the geometry is not indexed, so computeVertexNormals keeps one flat
// normal per face and the faceted look survives the export (glTF has no flat shading).
function frond(t: Parts, m: Material, an: Vector3, yaw: number, tilt: number, laenge: number, durchhang: number, drehung: number, bogen: number) {
  const rich = new Vector3(Math.cos(tilt) * Math.cos(yaw), Math.sin(tilt), Math.cos(tilt) * Math.sin(yaw));
  const hoch = new Vector3(-Math.sin(tilt) * Math.cos(yaw), Math.cos(tilt), -Math.sin(tilt) * Math.sin(yaw));
  const quer = new Vector3().crossVectors(rich, hoch);
  const breit = laenge * 0.17, stufen = 12, schritt = 1 / stufen;
  const k = Math.cos(drehung), s = Math.sin(drehung);
  const punkt = (u: number, seite: number, ueber: number, out: Vector3) => {
    const y = laenge * Math.sin(tilt) * u - durchhang * u * u + ueber, z = bogen * laenge * u * u + seite;
    return out.copy(an).addScaledVector(rich, laenge * u).addScaledVector(hoch, y * k - z * s).addScaledVector(quer, y * s + z * k);
  };
  const pos: number[] = [], uv: number[] = [];
  const flaeche = (a: Vector3, ua: number, va: number, b: Vector3, ub: number, vb: number, c: Vector3, uc: number, vc: number) => {
    for (const q of [a, b, c, a, c, b]) pos.push(q.x, q.y, q.z);
    uv.push(ua, va, ub, vb, uc, vc, ua, va, uc, vc, ub, vb);
  };
  const a = new Vector3(), b = new Vector3(), c = new Vector3();
  for (let i = 0; i < stufen; i++) {
    const u0 = i * schritt, u1 = (i + 1) * schritt, uT = Math.min(1, u1 + 0.35 * schritt);
    punkt(u0, 0, 0, a); punkt(u1, 0, 0, b);
    for (const seite of [1, -1]) {
      const halbw = breit * Math.sin(Math.PI * Math.min(1, Math.pow((u0 + u1) / 2, 0.7)));
      // leaflets rise next to the crown and turn down towards the tip: the usual V of a palm leaf
      punkt(uT, seite * halbw, halbw * (0.3 - 0.7 * u1), c);
      flaeche(a, u0, 0.5 + seite * 0.4, b, u1, 0.5 + seite * 0.4, c, uT, 0.5 + seite);
    }
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  t.add(m, g);
}

export const palm = defineAsset({
  id: "palm", category: "nature",
  title: { de: "Palme", en: "Palm" },
  description: { de: "Gekrümmter, nach oben verjüngter Stamm mit einer Krone aus überhängenden Fiederblättern; jeder Seed wächst anders.", en: "A curved trunk that tapers as it rises, under a crown of drooping fronds; every seed grows differently." },
  params: {
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 3, max: 20, step: 0.1, default: 8, unit: "m",
      describe: { de: "Höhe des Stammendes über dem Boden: 3 m eine junge Palme, 8 m eine Kokospalme im Garten, 20 m eine alte Fächerpalme.", en: "Height of the trunk top above the ground: 3 m a young palm, 8 m a garden coconut palm, 20 m an old fan palm." } },
    trunkCurve: { type: "number", label: { de: "Stammkrümmung", en: "Trunk curve" }, min: 0, max: 1, step: 0.01, default: 0.35,
      describe: { de: "Neigung des Stamms aus der Lotrechten: 0 gerade, 0,35 leicht geneigt wie an der Küste, 1 stark geschwungen (die Krone rückt dabei seitlich aus).", en: "Lean of the trunk out of vertical: 0 straight, 0.35 gently leaning like on a coast, 1 strongly curved (the crown then moves sideways)." } },
    trunkRadius: { type: "number", label: { de: "Stammdicke", en: "Trunk radius" }, min: 0.08, max: 0.6, step: 0.01, default: 0.22, unit: "m",
      describe: { de: "Radius des Stamms am Boden: 0,12 m bei einer jungen Kokospalme, 0,25 m ausgewachsen, 0,5 m bei dicken Fächerpalmen; auch der Radius des Kollisionszylinders.", en: "Radius of the trunk at the ground: 0.12 m on a young coconut palm, 0.25 m grown, 0.5 m on stout fan palms; also the radius of the collision cylinder." } },
    fronds: { type: "integer", label: { de: "Blätter", en: "Fronds" }, min: 5, max: 16, default: 11,
      describe: { de: "Zahl der Fiederblätter an der Krone: 6 karg, 11 üblich, 16 eine dichte Krone.", en: "Number of fronds on the crown: 6 sparse, 11 usual, 16 a dense crown." } },
    frondLength: { type: "number", label: { de: "Blattlänge", en: "Frond length" }, min: 0.8, max: 4, step: 0.05, default: 2.6, unit: "m",
      describe: { de: "Länge eines Blatts vom Grund bis zur Spitze: 1 m an einer jungen Palme, 2,5 m an der Kokospalme, 4 m an einer alten Kokospalme.", en: "Length of one frond from base to tip: 1 m on a young palm, 2.5 m on a coconut palm, 4 m on an old coconut palm." } },
    droop: { type: "number", label: { de: "Überhang", en: "Droop" }, min: 0, max: 1, step: 0.01, default: 0.6,
      describe: { de: "Wie stark die Blätter nach unten durchbiegen: 0 steif aufwärts, 0,6 die übliche Biegung, 1 die Spitzen fast am Boden (über kurzen Stämmen begrenzt der Boden den Überhang).", en: "How far the fronds bend down: 0 stiff and rising, 0.6 the usual arch, 1 the tips near the ground (over a short trunk the floor limits the droop)." } },
    trunkColor: { type: "color", label: { de: "Stamm", en: "Trunk" }, default: "#8a7a63",
      describe: { de: "Farbe des Stamms: Grau-Braun #8a7a63, silbern #a89f8d, dunkel #5b4a3a.", en: "Colour of the trunk: grey-brown #8a7a63, silver #a89f8d, dark #5b4a3a." } },
    frondColor: { type: "color", label: { de: "Blätter", en: "Fronds" }, default: "#3f7d3a",
      describe: { de: "Farbe der Blätter: Grün #3f7d3a, Olive #6b7a3a, Blau-Grün #4a7a6a.", en: "Colour of the fronds: green #3f7d3a, olive #6b7a3a, blue-green #4a7a6a." } },
  },
  presets: {
    "coconut-palm": { label: { de: "Kokospalme", en: "Coconut palm" }, values: { height: 11, trunkCurve: 0.5, trunkRadius: 0.24, fronds: 12, frondLength: 3.4, droop: 0.8, trunkColor: "#8a7a63" } },
    "date-palm": { label: { de: "Dattelpalme", en: "Date palm" }, values: { height: 7, trunkCurve: 0.18, trunkRadius: 0.34, fronds: 16, frondLength: 3, droop: 0.3, frondColor: "#527a3a" } },
    "young-palm": { label: { de: "Junge Palme", en: "Young palm" }, values: { height: 3.4, trunkCurve: 0.08, trunkRadius: 0.12, fronds: 7, frondLength: 1.7, droop: 0.5, frondColor: "#4f8a3e" } },
  },
  // Kollision nur am Stamm: unter der Krone kann man hindurchgehen
  physics: { body: "static", collider: "cylinder" },
  budget: { triangles: 12000, drawCalls: 2 },
  build(p, seed) {
    const r = rng(seed);
    const rinde = material("bark", p.trunkColor, 1 / Math.max(0.4, p.trunkRadius * 4)),
      fieder = material("leaf", p.frondColor, 1 / Math.max(0.5, p.frondLength * 0.6)), t = new Parts();
    // Stamm: ein Bogen, der nach oben immer stärker aus dem Lot geht, dann so skaliert, dass die Krone auf `height` sitzt
    const stufen = Math.max(8, Math.min(22, Math.round(6 + p.height * 0.8))), schritt = 1 / stufen;
    const neigung = (p.trunkCurve * 45 * Math.PI) / 180;
    const punkte: Vector3[] = [new Vector3()];
    let x = 0, y = 0, z = 0, winkel = 0;
    for (let i = 0; i < stufen; i++) {
      winkel += (neigung * (0.4 + 1.6 * (i + 0.5) * schritt)) / (1.2 * stufen);
      x += Math.sin(winkel) * schritt; y += Math.cos(winkel) * schritt; z += (r() - 0.5) * 0.06 * schritt;
      punkte.push(new Vector3(x, y, z));
    }
    for (const q of punkte) q.multiplyScalar(p.height / y);
    // nach unten dünner werdend, in der Mitte leicht bauchig
    const radius = (u: number) => p.trunkRadius * (1 - 0.45 * u) * (1 + 0.12 * Math.sin(Math.PI * u));
    const oben = new Vector3(0, 1, 0);
    for (let i = 0; i < stufen; i++) {
      const a = punkte[i], b = punkte[i + 1], achse = new Vector3().subVectors(b, a), laenge = achse.length();
      const g = new CylinderGeometry(radius((i + 1) * schritt), radius(i * schritt), laenge, 10, 1, true);
      g.translate(0, laenge / 2, 0).applyQuaternion(new Quaternion().setFromUnitVectors(oben, achse.normalize())).translate(a.x, a.y, a.z);
      t.add(rinde, g);
    }
    // Kronenschaft: das kurze Stück, aus dem die Blätter treiben
    const letzte = new Vector3().subVectors(punkte[stufen], punkte[stufen - 1]).normalize();
    const schaft = Math.min(0.6, p.frondLength * 0.22);
    const g = new CylinderGeometry(radius(1) * 0.6, radius(1) * 1.5, schaft, 10, 1, true);
    g.translate(0, schaft / 2, 0).applyQuaternion(new Quaternion().setFromUnitVectors(oben, letzte)).translate(punkte[stufen].x, punkte[stufen].y, punkte[stufen].z);
    t.add(rinde, g);
    const an = punkte[stufen].clone().addScaledVector(letzte, schaft * 0.8);
    const aufrecht = Math.max(1, Math.min(3, Math.round(p.fronds / 4)));
    for (let f = 0; f < p.fronds; f++) {
      const yaw = f * 2.39996 + (r() - 0.5) * 0.35, jung = f < aufrecht;
      const tilt = ((jung ? 38 + 22 * r() : 3 + 17 * r()) * Math.PI) / 180;
      const laenge = p.frondLength * (jung ? 0.6 + 0.2 * r() : 0.82 + 0.3 * r());
      // die Spitzen bleiben über dem Boden, auch bei langem Blatt auf kurzem Stamm
      const durchhang = Math.min(p.droop * laenge * 0.85, Math.max(0, p.height + laenge * Math.sin(tilt) - 0.45));
      frond(t, fieder, an, yaw, tilt, laenge, durchhang, (r() - 0.5) * 0.3, (r() - 0.5) * 0.16);
    }
    t.cylinder(p.trunkRadius, punkte[stufen].y);
    return t.group();
  },
});
