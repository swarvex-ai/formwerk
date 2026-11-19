import { BufferGeometry, CatmullRomCurve3, Color, Float32BufferAttribute, Vector3, type Material } from "three";
import { rng } from "../../core/rng";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { grid } from "../shapes";

const OBEN = new Vector3(0, 1, 0);

/**
 * A round tube along a curve, `radius(v)` from v = 0 to 1; a radius of 0 at an end closes it there. `bezug` is a
 * direction the curve never runs along: the rings keep their turn against it, so they never flip. With `boden` the first
 * ring lies flat on the floor.
 */
function roehre(kurve: (v: number) => Vector3, radius: (v: number) => number, nv: number, um: number, bezug: Vector3, boden = false): BufferGeometry {
  const rahmen = (v: number) => {
    const tg = kurve(Math.min(1, v + 1e-3)).sub(kurve(Math.max(0, v - 1e-3))).normalize();
    const quer = new Vector3().crossVectors(tg, bezug).normalize();
    return { quer, hoch: new Vector3().crossVectors(quer, tg) };
  };
  const mitte = kurve(0.5);
  return grid(um, nv, (u, v) => {
    const { quer, hoch } = rahmen(v), w = u * Math.PI * 2;
    const q = kurve(v).addScaledVector(quer, radius(v) * Math.cos(w)).addScaledVector(hoch, radius(v) * Math.sin(w));
    if (boden && v === 0) q.y = 0;
    return q;
  }, (q) => q.clone().sub(mitte));
}

/** Leaflets of one shade: folded along the midrib, both faces, lit from above the frond. */
class Fiedern {
  pos: number[] = []; nor: number[] = []; uv: number[] = [];
  fieder(basis: Vector3, achse: Vector3, oben: Vector3, laenge: number, breite: number) {
    const quer = new Vector3().crossVectors(achse, oben).normalize(), spitze = basis.clone().addScaledVector(achse, laenge);
    const mitte = basis.clone().addScaledVector(achse, laenge * 0.4), knick = oben.clone().multiplyScalar(-breite * 0.3);
    const l = mitte.clone().addScaledVector(quer, -breite / 2).add(knick), r = mitte.clone().addScaledVector(quer, breite / 2).add(knick);
    const licht = oben.clone().multiplyScalar(0.8).addScaledVector(OBEN, 0.4).normalize();
    const vorn = [basis, l, mitte, mitte, l, spitze, basis, mitte, r, mitte, spitze, r];
    const uvs = [[0.5, 0], [0, 0.4], [0.5, 0.4], [0.5, 0.4], [0, 0.4], [0.5, 1], [0.5, 0], [0.5, 0.4], [1, 0.4], [0.5, 0.4], [0.5, 1], [1, 0.4]];
    for (const seite of [0, 1]) for (let k = 0; k < 12; k += 3) for (const i of seite ? [k, k + 2, k + 1] : [k, k + 1, k + 2]) {
      const q = vorn[i]; this.pos.push(q.x, q.y, q.z); this.nor.push(licht.x, licht.y, licht.z); this.uv.push(uvs[i][0], uvs[i][1]);
    }
  }
  geometrie(): BufferGeometry {
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(this.pos, 3));
    g.setAttribute("normal", new Float32BufferAttribute(this.nor, 3));
    g.setAttribute("uv", new Float32BufferAttribute(this.uv, 2));
    return g;
  }
}

/**
 * One frond: a tapering rachis that runs out from the crown and bends down, with leaflets on both sides that rise
 * beside it near the crown (the V of a palm leaf) and hang down towards the tip.
 */
function wedel(t: Parts, ader: Material, fiedern: [Fiedern, Fiedern], an: Vector3, yaw: number, tilt: number, laenge: number, durchhang: number, drehung: number, bogen: number, r: () => number) {
  const rich = new Vector3(Math.cos(tilt) * Math.cos(yaw), Math.sin(tilt), Math.cos(tilt) * Math.sin(yaw));
  const hoch = new Vector3(-Math.sin(tilt) * Math.cos(yaw), Math.cos(tilt), -Math.sin(tilt) * Math.sin(yaw));
  const quer = new Vector3().crossVectors(rich, hoch);
  const k = Math.cos(drehung), s = Math.sin(drehung);
  const punkt = (u: number) => {
    const y = laenge * Math.sin(tilt) * u - durchhang * u * u, z = bogen * laenge * u * u;
    return an.clone().addScaledVector(rich, laenge * u).addScaledVector(hoch, y * k - z * s).addScaledVector(quer, y * s + z * k);
  };
  const rb = Math.min(0.05, Math.max(0.012, laenge * 0.014));
  t.add(ader, roehre(punkt, (v) => (v > 0.995 ? 0 : rb * (1 - 0.8 * v)), 14, 6, quer));
  // Leaflets: longest in the middle of the frond, rising beside the rachis near the crown and hanging at the tip
  const n = Math.max(10, Math.min(40, Math.round(laenge * 11))), breit = laenge * 0.2;
  for (let i = 0; i < n; i++) {
    const u = 0.1 + (0.88 * (i + 0.5)) / n, b = punkt(u), tg = punkt(Math.min(1, u + 0.01)).sub(punkt(Math.max(0, u - 0.01))).normalize();
    const seitlich = new Vector3().crossVectors(tg, OBEN).normalize(), oben = new Vector3().crossVectors(seitlich, tg).normalize();
    const ll = breit * Math.sin(Math.PI * Math.min(1, Math.pow(u, 0.7))) + laenge * 0.03;
    for (const sg of [1, -1]) {
      const achse = seitlich.clone().multiplyScalar(sg * 0.75).addScaledVector(tg, 0.55).addScaledVector(oben, 0.45 - 1.1 * u).addScaledVector(OBEN, -0.15).normalize();
      fiedern[r() < 0.5 ? 0 : 1].fieder(b, achse, oben, ll * (0.9 + 0.2 * r()), ll * 0.09);
    }
  }
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
  budget: { triangles: 60000, drawCalls: 3 },
  build(p, seed) {
    const r = rng(seed), blattZufall = rng(seed + 1);
    const rinde = material("bark", p.trunkColor, 1 / Math.max(0.4, p.trunkRadius * 4));
    // Leaflets in two shades of plain colour, the rachis in the darker one (thousands of cards would not fit a bake atlas)
    const ton = (f: number) => { const c = new Color(p.frondColor); c.multiplyScalar(f); return `#${c.getHexString()}`; };
    const hell = material("leaf", p.frondColor, 1, undefined, { plain: true }), dunkel = material("leaf", ton(0.72), 1, undefined, { plain: true });
    const t = new Parts();
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
    // The crown shaft continues the trunk's last direction; the trunk is one smooth tube through both
    const letzte = new Vector3().subVectors(punkte[stufen], punkte[stufen - 1]).normalize();
    const schaft = Math.min(0.6, p.frondLength * 0.22), spitze = punkte[stufen].clone().addScaledVector(letzte, schaft);
    const kurve = new CatmullRomCurve3([...punkte, spitze]);
    const gesamt = kurve.getLength(), sStamm = gesamt - schaft;
    // Thinner towards the top and slightly bellied, flared at the foot, ringed with old leaf scars, swelling into the
    // crown shaft and closing over it
    const abstand = Math.max(0.07, p.trunkRadius * 0.45);
    const radius = (v: number) => {
      const s = v * gesamt;
      if (s > sStamm) { const w = (s - sStamm) / schaft, r1 = p.trunkRadius * 0.55; return w >= 0.999 ? 0 : r1 * (1 + 0.35 * Math.sin(Math.PI * Math.min(1, w * 1.4))) * Math.sqrt(1 - w * w); }
      const u = s / sStamm, ring = 1 + 0.045 * Math.pow(Math.abs(Math.cos((Math.PI * s) / abstand)), 6) * Math.min(1, s / 0.3);
      return p.trunkRadius * (1 - 0.45 * u) * (1 + 0.12 * Math.sin(Math.PI * u)) * (1 + 0.45 * Math.exp(-s / (0.2 + p.trunkRadius))) * ring;
    };
    const ringe = Math.round((sStamm / abstand) * 5) + 12;
    t.add(rinde, roehre((v) => kurve.getPointAt(v), radius, ringe, 14, new Vector3(0, 0, 1), true));
    // The foot: a disc closing the trunk where it stands on the floor
    t.add(rinde, grid(14, 1, (u, v) => new Vector3(Math.cos(u * Math.PI * 2) * radius(0) * v, 0, Math.sin(u * Math.PI * 2) * radius(0) * v), () => new Vector3(0, -1, 0)));
    const an = punkte[stufen].clone().addScaledVector(letzte, schaft * 0.55);
    const blaetter: [Fiedern, Fiedern] = [new Fiedern(), new Fiedern()];
    const aufrecht = Math.max(1, Math.min(3, Math.round(p.fronds / 4)));
    for (let f = 0; f < p.fronds; f++) {
      const yaw = f * 2.39996 + (r() - 0.5) * 0.35, jung = f < aufrecht;
      const tilt = ((jung ? 38 + 22 * r() : 3 + 17 * r()) * Math.PI) / 180;
      const laenge = p.frondLength * (jung ? 0.6 + 0.2 * r() : 0.82 + 0.3 * r());
      // die Spitzen bleiben über dem Boden, auch bei langem Blatt auf kurzem Stamm
      const durchhang = Math.min(p.droop * laenge * 0.85, Math.max(0, p.height + laenge * Math.sin(tilt) - 0.45));
      wedel(t, dunkel, blaetter, an, yaw, tilt, laenge, durchhang, (r() - 0.5) * 0.3, (r() - 0.5) * 0.16, blattZufall);
    }
    t.add(hell, blaetter[0].geometrie());
    t.add(dunkel, blaetter[1].geometrie());
    t.cylinder(p.trunkRadius, punkte[stufen].y);
    return t.group();
  },
});
