import { BufferGeometry, ConeGeometry, Float32BufferAttribute, Quaternion, Vector3 } from "three";
import { rng } from "../../core/rng";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { turned } from "../shapes";

const TAU = Math.PI * 2, OBEN = new Vector3(0, 1, 0);

/** The circular arc that rounds a body of radius `r1` into a dome of height `kuppe` whose tip sits at `hoehe`. */
const kappenArc = (r1: number, hoehe: number, kuppe: number) => {
  const rho = (r1 * r1 + kuppe * kuppe) / (2 * kuppe);
  return { rho, ym: hoehe - rho };
};

/**
 * Ribbed body of revolution around its own y axis: `profil(u)` in metres from the floor to `hoehe - kuppe`, then the
 * dome to the tip (0 leaves the top open); the bottom closes flat on the floor. The rib crests reach exactly `profil`
 * and the grooves fall back by `amp`, so the widest point of the body is the profile itself and a collision cylinder
 * of that radius encloses it.
 */
function koerper(profil: (u: number) => number, hoehe: number, ribs: number, amp: number, stufen: number, kuppe: number): BufferGeometry {
  const um = Math.max(24, ribs * 4), pos: number[] = [], uv: number[] = [], idx: number[] = [];
  const rippe = (phi: number) => 1 - amp * Math.pow(Math.abs(Math.sin((ribs * phi) / 2)), 0.75);
  const ring = (r: number, y: number) => {
    const start = pos.length / 3;
    for (let i = 0; i <= um; i++) {
      const phi = (i / um) * TAU, rr = r * rippe(phi);
      pos.push(rr * Math.cos(phi), y, rr * Math.sin(phi));
      uv.push(i / um, y / hoehe);
    }
    return start;
  };
  const rand: [number, number][] = [];
  for (let i = 0; i <= stufen; i++) rand.push([profil(i / stufen), (i / stufen) * (hoehe - kuppe)]);
  if (kuppe > 0) {
    const { rho, ym } = kappenArc(rand[rand.length - 1][0], hoehe, kuppe);
    for (let i = 1; i <= 6; i++) {
      const y = hoehe - kuppe + (kuppe * i) / 7;
      rand.push([Math.sqrt(Math.max(1e-8, rho * rho - (y - ym) * (y - ym))), y]);
    }
    rand.push([0, hoehe]);
  }
  const unten = ring(rand[0][0], 0);
  let vorher = unten;
  for (const [r, y] of rand.slice(1)) {
    if (r <= 1e-4) {
      const spitze = pos.length / 3;
      pos.push(0, y, 0); uv.push(0.5, 1);
      for (let i = 0; i < um; i++) idx.push(vorher + i, spitze, vorher + i + 1);
      break;
    }
    const jetzt = ring(r, y);
    for (let i = 0; i < um; i++) idx.push(vorher + i, jetzt + i + 1, vorher + i + 1, vorher + i, jetzt + i, jetzt + i + 1);
    vorher = jetzt;
  }
  const boden = pos.length / 3;
  pos.push(0, 0, 0); uv.push(0.5, 0);
  for (let i = 0; i < um; i++) idx.push(boden, unten + i + 1, unten + i);
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** A point on a path: centre, unit tangent and radius over the rib crests. */
type Stelle = { c: Vector3; t: Vector3; r: number };

/**
 * Ribbed tube along a path in the plane normal to `seite` (the side vector): one ring at each point of `stellen`, the
 * crests at the same angles as koerper(); a radius of 0 at the last point closes it in a tip.
 */
function rohr(stellen: Stelle[], seite: Vector3, ribs: number, amp: number): BufferGeometry {
  const um = Math.max(16, ribs * 4), pos: number[] = [], uv: number[] = [], idx: number[] = [];
  const rippe = (phi: number) => 1 - amp * Math.pow(Math.abs(Math.sin((ribs * phi) / 2)), 0.75);
  let vorher = -1;
  stellen.forEach(({ c, t, r }, j) => {
    const n = new Vector3().crossVectors(t, seite).normalize();
    if (r <= 1e-4) {
      const spitze = pos.length / 3;
      pos.push(c.x, c.y, c.z); uv.push(0.5, 1);
      for (let i = 0; i < um; i++) idx.push(vorher + i, spitze, vorher + i + 1);
      return;
    }
    const start = pos.length / 3;
    for (let i = 0; i <= um; i++) {
      const phi = (i / um) * TAU, rr = r * rippe(phi);
      pos.push(c.x + rr * (Math.cos(phi) * seite.x + Math.sin(phi) * n.x), c.y + rr * (Math.cos(phi) * seite.y + Math.sin(phi) * n.y), c.z + rr * (Math.cos(phi) * seite.z + Math.sin(phi) * n.z));
      uv.push(i / um, j / (stellen.length - 1));
    }
    if (vorher >= 0) for (let i = 0; i < um; i++) idx.push(vorher + i, start + i + 1, vorher + i + 1, vorher + i, start + i, start + i + 1);
    vorher = start;
  });
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export const cactus = defineAsset({
  id: "cactus", category: "nature",
  title: { de: "Kaktus", en: "Cactus" },
  description: { de: "Säulen- oder Fasskaktus mit scharf geripptem Körper und seitlich abgehenden, aufwärts gebogenen Armen; jeder Seed setzt die Arme anders.", en: "A column or barrel cactus with a sharply ribbed body and arms that leave it sideways and bend back up; every seed sets the arms differently." },
  params: {
    form: { type: "choice", label: { de: "Wuchsform", en: "Growth form" }, options: ["column", "barrel"], labels: { column: { de: "Säule", en: "column" }, barrel: { de: "Fass", en: "barrel" } }, default: "column",
      describe: { de: "Säule mit aufwärts gebogenen Armen wie ein Saguaro, oder die kugelige Fassform ohne Arme.", en: "A column with upward-bent arms like a saguaro, or the ball-shaped barrel form without arms." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.2, max: 8, step: 0.05, default: 2.5, unit: "m",
      describe: { de: "Höhe über dem Boden: 0,4 m ein Jungtier im Topf, 2,5 m eine junge Saguaro-Säule, 8 m ein alter Kaktus; beim Fasskaktus die Höhe der Kugel.", en: "Height above the ground: 0.4 m a young plant in a pot, 2.5 m a young saguaro column, 8 m an old cactus; on a barrel cactus the height of the ball." } },
    radius: { type: "number", label: { de: "Radius", en: "Radius" }, min: 0.05, max: 0.6, step: 0.01, default: 0.25, unit: "m",
      describe: { de: "Radius des Körpers an der breitesten Stelle über den Rippen: 0,06 m bei einem jungen Säulenkaktus, 0,25 m an einer Saguaro-Säule, 0,5 m an einem fetten Fasskaktus; auch der Radius des Kollisionszylinders.", en: "Radius of the body at its widest point over the rib crests: 0.06 m on a young column cactus, 0.25 m on a saguaro column, 0.5 m on a stout barrel cactus; also the radius of the collision cylinder." } },
    ribs: { type: "integer", label: { de: "Rippen", en: "Ribs" }, min: 6, max: 24, default: 12,
      describe: { de: "Zahl der scharfen Rippen im Querschnitt: 8 an einer schlanken Säule, 12 am Saguaro, 24 am tief gerillten Fasskaktus.", en: "Number of sharp ribs around the cross-section: 8 on a slim column, 12 on a saguaro, 24 on a deeply fluted barrel cactus." } },
    arms: { type: "integer", label: { de: "Arme", en: "Arms" }, min: 0, max: 6, default: 3,
      describe: { de: "Zahl der seitlich abgehenden und dann aufwärts gebogenen Arme (nur bei der Säule): 0 ohne Arme, 3 der klassische Saguaro, 6 ein stark verzweigter Kaktus.", en: "Number of arms that leave the trunk sideways and then bend upward (column only): 0 without arms, 3 the classic saguaro, 6 a strongly branched cactus." } },
    bodyColor: { type: "color", label: { de: "Körper", en: "Body" }, default: "#4f7d52",
      describe: { de: "Farbe des Körpers: Grau-Grün #4f7d52, Blau-Grün #5b8a6a, Dunkelgrün #3a6a3f.", en: "Colour of the body: grey-green #4f7d52, blue-green #5b8a6a, dark green #3a6a3f." } },
    flowerColor: { type: "color", label: { de: "Blüten", en: "Flowers" }, default: "#e8b23a",
      describe: { de: "Farbe der Blüten auf den Spitzen: Gelb #e8b23a, Weiß #f2ecd8, Rosa #e0788a.", en: "Colour of the flowers on the tips: yellow #e8b23a, white #f2ecd8, pink #e0788a." } },
  },
  presets: {
    saguaro: { label: { de: "Saguaro", en: "Saguaro" }, values: { height: 5.5, radius: 0.3, ribs: 12, arms: 3, bodyColor: "#5b8a6a", flowerColor: "#f2ecd8" } },
    barrel: { label: { de: "Fasskaktus", en: "Barrel cactus" }, values: { form: "barrel", height: 0.9, radius: 0.45, ribs: 18, bodyColor: "#4f7d52", flowerColor: "#e8b23a" } },
    "young-column": { label: { de: "Junge Säule", en: "Young column" }, values: { height: 0.7, radius: 0.08, ribs: 9, arms: 0 } },
  },
  // Kollision am Körper: Arme und Blüten ragen über den Zylinder hinaus, wie bei der Palme der Stamm
  physics: { body: "static", collider: "cylinder" },
  budget: { triangles: 50000, drawCalls: 3 },
  build(p, seed) {
    const r = rng(seed), t = new Parts();
    // the body is solid pulp, not air-filled foliage
    const gruene = material("leaf", p.bodyColor, 1 / Math.max(0.5, p.radius * 2.2), 400), bluete = material("paint", p.flowerColor);
    const dorn = material("paint", "#d9cfae");
    const tonne = p.form === "barrel", amp = tonne ? 0.24 : 0.16;
    const welle = (u: number) => 0.5 - 0.5 * Math.cos(Math.PI * u);
    // the crests of the ribs carry the profile, so the body is never wider than p.radius
    const profil = tonne
      ? (u: number) => p.radius * (u < 0.45 ? 0.8 + 0.2 * Math.sin((Math.PI / 2) * (u / 0.45)) : 1 - 0.3 * welle((u - 0.45) / 0.55))
      : (u: number) => p.radius * (1 - 0.14 * u);
    const kuppe = Math.max(0.015, Math.min(p.height * (tonne ? 0.3 : 0.26), p.radius * (tonne ? 0.9 : 1.1)));
    t.add(gruene, koerper(profil, p.height, p.ribs, amp, Math.max(8, Math.min(40, Math.round(8 + p.height * 4))), kuppe));
    // Spines: a pair of short pale spikes at every areole along the rib crests, spaced by the body's size
    const abstand = Math.max(0.03, p.radius * 0.25, p.height / 60), dl = Math.min(0.04, Math.max(0.012, p.radius * 0.12));
    const stachel = (at: Vector3, raus: Vector3) => {
      for (const neig of [0.35, -0.35]) {
        const d = new Vector3(raus.x, raus.y + neig, raus.z).normalize();
        t.add(dorn, new ConeGeometry(dl * 0.1, dl, 3, 1, true).translate(0, dl / 2, 0).applyQuaternion(new Quaternion().setFromUnitVectors(OBEN, d)).translate(at.x, at.y, at.z));
      }
    };
    for (let k = 0; k < p.ribs; k++) {
      const phi = (k / p.ribs) * TAU, raus = new Vector3(Math.cos(phi), 0, Math.sin(phi));
      for (let y = abstand * 0.6; y < p.height - kuppe; y += abstand) {
        const rr = profil(y / (p.height - kuppe));
        stachel(new Vector3(rr * raus.x, y, rr * raus.z), raus);
      }
    }
    // Flowers: small open cups standing out of the surface
    const bluem = Math.min(0.05, Math.max(0.012, p.height * 0.02));
    const becher = turned([[0, 0], [0.3, 0], [0.45, 0.35], [1, 0.85], [0.85, 1], [0.35, 0.6], [0, 0.55]], 10);
    const blume = (x: number, y: number, z: number, s: number, n: Vector3) =>
      t.add(bluete, becher.clone().scale(s, s, s).applyQuaternion(new Quaternion().setFromUnitVectors(OBEN, n.clone().normalize())).translate(x, y, z));
    // a crown of flowers around the shoulder of the tip
    const { rho, ym } = kappenArc(profil(1), p.height, kuppe), yBl = p.height - kuppe * 0.55;
    const rBl = Math.sqrt(Math.max(0, rho * rho - (yBl - ym) * (yBl - ym)));
    const kranz = Math.max(4, Math.min(8, Math.round(p.ribs / 2)));
    for (let i = 0; i < kranz; i++) {
      const phi = (i / kranz) * TAU + (r() - 0.5) * 0.3, n = new Vector3(rBl * Math.cos(phi), yBl - ym, rBl * Math.sin(phi));
      blume(rBl * 0.97 * Math.cos(phi), yBl, rBl * 0.97 * Math.sin(phi), bluem, n.lerp(OBEN.clone().multiplyScalar(n.length()), 0.4));
    }
    // arms on the rib crests: one ribbed tube that leaves the trunk sideways, bends up round an elbow and ends in a dome
    const armRibs = Math.max(6, Math.round(p.ribs * 0.55));
    if (!tonne) for (let i = 0; i < p.arms; i++) {
      const crest = (i * Math.max(1, Math.floor(p.ribs / Math.max(1, p.arms))) + Math.floor(r() * 2)) % p.ribs;
      const dir = new Vector3(Math.cos((crest / p.ribs) * TAU), 0, Math.sin((crest / p.ribs) * TAU));
      const seite = new Vector3().crossVectors(dir, OBEN).normalize();
      const uA = 0.34 + 0.18 * r(), yA = p.height * uA, stammR = p.radius * (1 - 0.14 * uA);
      // elbow and stub keep their whole thickness above the floor, even on a short trunk
      const armR = Math.min(stammR * 0.42, yA * 0.45), bogenR = armR * 1.3, stub = stammR * 0.75 + armR * 0.3;
      const rise = p.height * (0.16 + 0.14 * r()), armK = armR * 0.85;
      const start = new Vector3().copy(dir).multiplyScalar(stammR * 0.35).setY(yA);
      const bei = (a: number, b: number, ta: number, tb: number, rr: number): Stelle => ({ c: start.clone().addScaledVector(dir, a).setY(yA + b), t: dir.clone().multiplyScalar(ta).setY(tb), r: rr });
      const stellen: Stelle[] = [bei(0, 0, 1, 0, armR), bei(stub, 0, 1, 0, armR)];
      for (let k = 1; k <= 8; k++) { const w = -Math.PI / 2 + (k / 8) * (Math.PI / 2); stellen.push(bei(stub + bogenR * Math.cos(w), bogenR + bogenR * Math.sin(w), -Math.sin(w), Math.cos(w), armR)); }
      const aX = stub + bogenR, yTop = bogenR + rise, stufenA = Math.max(2, Math.round(rise * 4));
      for (let k = 1; k <= stufenA; k++) stellen.push(bei(aX, bogenR + ((rise - armK) * k) / stufenA, 0, 1, armR * (1 - 0.1 * (k / stufenA))));
      const { rho: rA, ym: yM } = kappenArc(armR * 0.9, yTop, armK);
      for (let k = 1; k <= 6; k++) { const y = yTop - armK + (armK * k) / 7; stellen.push(bei(aX, y, 0, 1, Math.sqrt(Math.max(1e-8, rA * rA - (y - yM) * (y - yM))))); }
      stellen.push(bei(aX, yTop, 0, 1, 0));
      t.add(gruene, rohr(stellen, seite, armRibs, amp));
      // spines on the arm's crests where it stands clear of the trunk, below its dome
      for (let k = 0; k < armRibs; k++) {
        const phi = (k / armRibs) * TAU;
        for (let y = bogenR + abstand * 0.5; y < yTop - armK; y += abstand) {
          const raus = new Vector3().addScaledVector(seite, Math.cos(phi)).addScaledVector(new Vector3().crossVectors(OBEN, seite).normalize(), Math.sin(phi));
          stachel(start.clone().addScaledVector(dir, aX).setY(yA + y).addScaledVector(raus, armR * (1 - 0.1 * ((y - bogenR) / Math.max(1e-3, rise - armK)))), raus);
        }
      }
      blume(start.x + dir.x * aX, yA + yTop - armR * 0.1, start.z + dir.z * aX, bluem * 0.9, OBEN);
    }
    t.cylinder(p.radius, p.height);
    return t.group();
  },
});
