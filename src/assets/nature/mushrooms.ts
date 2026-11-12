import { CylinderGeometry, LatheGeometry, Matrix4, Quaternion, SphereGeometry, Vector2, Vector3, type Material } from "three";
import { rng } from "../../core/rng";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

type CapShape = "dome" | "flat" | "cone";

// Cross-section of a cap from the underside centre to the top: the lathe closes both poles at x = 0.
function capProfile(shape: CapShape, R: number): Vector2[] {
  const h = shape === "dome" ? R * 0.78 : shape === "flat" ? R * 0.34 : R * 0.95;
  const rimY = shape === "cone" ? h * 0.05 : shape === "flat" ? h * 0.16 : h * 0.2;
  const rim = [
    new Vector2(0, 0),
    new Vector2(R * 0.35, 0),
    new Vector2(R * 0.8, h * 0.03),
    new Vector2(R, rimY),
  ];
  const top = shape === "dome"
    ? [[0.94, 0.46], [0.78, 0.7], [0.52, 0.89], [0.25, 0.98], [0, 1]]
    : shape === "flat"
      ? [[0.98, 0.44], [0.85, 0.7], [0.55, 0.9], [0.22, 0.99], [0, 1]]
      : [[0.7, 0.18], [0.45, 0.42], [0.24, 0.68], [0.1, 0.88], [0, 1]];
  return [...rim, ...top.map(([r, y]) => new Vector2(R * r, h * y))];
}

// Small flattened spheres on the upper profile, oriented along its surface normal.
function spots(t: Parts, m: Material, rs: () => number, pts: Vector2[], stemTop: number, M: Matrix4, R: number) {
  const first = 3, segments = pts.length - 1 - first;
  const n = Math.max(4, Math.round(5 + 7 * rs()));
  for (let k = 0; k < n; k++) {
    const segment = first + Math.floor(rs() * segments);
    const a = pts[segment], b = pts[segment + 1];
    const u = 0.15 + 0.7 * rs();
    const rad = a.x + (b.x - a.x) * u, y = a.y + (b.y - a.y) * u;
    const tr = b.x - a.x, ty = b.y - a.y, len = Math.hypot(tr, ty) || 1;
    // The upper profile runs inward and upward: its outward normal is (dy, -dr).
    const nr = ty / len, ny = -tr / len, angle = (k / n) * Math.PI * 2 + rs() * 0.8;
    const size = R * (0.09 + 0.05 * rs()), thickness = size * 0.42;
    const cx = Math.cos(angle), cz = Math.sin(angle);
    const normal = new Vector3(nr * cx, ny, nr * cz).normalize();
    const g = new SphereGeometry(1, 8, 6).scale(size, thickness, size)
      .applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), normal));
    g.translate(rad * cx + normal.x * thickness * 0.1, stemTop + y + normal.y * thickness * 0.1, rad * cz + normal.z * thickness * 0.1);
    g.applyMatrix4(M).computeBoundingBox();
    if (g.boundingBox!.min.y >= -0.0005) t.add(m, g);
  }
}

export const mushrooms = defineAsset({
  id: "mushrooms", category: "nature",
  title: { de: "Pilzgruppe", en: "Mushroom cluster" },
  description: { de: "Eine kleine Gruppe Waldpilze, jeder Stiel mit Hut; Anzahl, Größe, Hutform und Sprenkel machen daraus Fliegenpilze, Pfifferlinge oder einen Riesenschirmling.", en: "A small cluster of forest mushrooms, each a stem with a cap; count, size, cap shape and spots make fly agarics, chanterelles or a giant toadstool." },
  params: {
    count: { type: "integer", label: { de: "Pilze", en: "Mushrooms" }, min: 1, max: 7, default: 3,
      describe: { de: "Zahl der Pilze: 1 ein Einzelpilz, 3 eine kleine Gruppe, 7 ein dichtes Nest.", en: "Number of mushrooms: 1 a single one, 3 a small cluster, 7 a dense nest." } },
    capRadius: { type: "number", label: { de: "Hutradius", en: "Cap radius" }, min: 0.02, max: 0.25, step: 0.005, default: 0.06, unit: "m",
      describe: { de: "Radius des größten Huts: 0,02 m ein kleiner Waldpilz, 0,06 m ein Speisepilz, 0,25 m ein Riesenschirmling.", en: "Radius of the largest cap: 0.02 m a small woodland mushroom, 0.06 m an edible one, 0.25 m a giant toadstool." } },
    stemHeight: { type: "number", label: { de: "Stielhöhe", en: "Stem height" }, min: 0.03, max: 0.4, step: 0.01, default: 0.08, unit: "m",
      describe: { de: "Höhe des größten Stiels: 0,03 m kurz und gedrungen, 0,08 m ein typischer Pilz, 0,4 m ein hoher Schirmling.", en: "Height of the largest stem: 0.03 m short and stout, 0.08 m a typical mushroom, 0.4 m a tall toadstool." } },
    capShape: { type: "choice", label: { de: "Hutform", en: "Cap shape" }, options: ["dome", "flat", "cone"],
      labels: { dome: { de: "gewölbt", en: "dome" }, flat: { de: "flach", en: "flat" }, cone: { de: "kegelig", en: "cone" } }, default: "dome",
      describe: { de: "Gewölbter, flacher oder kegeliger Hut: Fliegenpilz gewölbt, Pfifferling flach, Schirmling kegelig.", en: "Domed, flat or conical cap: fly agaric domed, chanterelle flat, toadstool conical." } },
    spots: { type: "boolean", label: { de: "Sprenkel", en: "Spots" }, default: false,
      describe: { de: "Helle Sprenkel auf den Hüten, etwa für den Fliegenpilz; aus bleiben die Hüte glatt.", en: "Light spots on the caps, e.g. for the fly agaric; off leaves the caps smooth." } },
    capColor: { type: "color", label: { de: "Hutfarbe", en: "Cap colour" }, default: "#8a5a34",
      describe: { de: "Farbe der Hüte: Braun #8a5a34, Rot #c0392b, Gelb-orange #e2a33b.", en: "Colour of the caps: brown #8a5a34, red #c0392b, yellow-orange #e2a33b." } },
    stemColor: { type: "color", label: { de: "Stielfarbe", en: "Stem colour" }, default: "#e7dcc4",
      describe: { de: "Farbe der Stiele: Creme #e7dcc4, Weiß #f4f1e8, Gelb #e8c27a.", en: "Colour of the stems: cream #e7dcc4, white #f4f1e8, yellow #e8c27a." } },
  },
  presets: {
    "fly-agaric": { label: { de: "Fliegenpilz", en: "Fly agaric" }, values: { count: 1, capShape: "dome", spots: true, capColor: "#c0392b", stemColor: "#f4f1e8" } },
    chanterelles: { label: { de: "Pfifferlinge", en: "Chanterelles" }, values: { count: 5, capShape: "flat", spots: false, capColor: "#e2a33b", stemColor: "#e8c27a" } },
    "giant-toadstool": { label: { de: "Riesenschirmling", en: "Giant toadstool" }, values: { count: 3, capRadius: 0.25, stemHeight: 0.4, capShape: "dome", spots: true, capColor: "#b5482f" } },
  },
  physics: { body: "static", collider: "hull" },
  budget: { triangles: 15000, drawCalls: 3 },
  build(p, seed) {
    const r = rng(seed), rs = rng(seed + 1);
    const capMat = material("paint", p.capColor), stemMat = material("paint", p.stemColor), spotMat = material("paint", "#f2ead6");
    const t = new Parts(), R = p.capRadius, H = p.stemHeight;
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < p.count; i++) {
      // The largest mushroom sits at the centre; the others are 0.4 to 0.9 of its size and lean up to 15 degrees.
      let x = 0, z = 0, scale = 1, lean = 0, dir = 0;
      if (i > 0) {
        scale = 0.4 + 0.5 * r();
        const angle = (i - 1) * golden + (r() - 0.5) * 0.9;
        const dist = R * (1 + 1.5 * r());
        x = Math.cos(angle) * dist;
        z = Math.sin(angle) * dist;
        lean = r() * (15 * Math.PI) / 180;
        dir = r() * Math.PI * 2;
      }
      const rc = R * scale, hs = H * scale, bottom = rc * 0.17, top = rc * 0.11;
      const profile = capProfile(p.capShape, rc);
      // A large cap on a short stem may only lean until its rim reaches the floor.
      for (const q of profile) {
        const dr = q.x - bottom;
        if (dr > 0) lean = Math.min(lean, Math.atan2(hs + q.y, dr));
      }
      // A tilted base disc dips by its radius times sin(lean); lift it so the lowest point rests on the floor.
      const lift = bottom * Math.sin(lean);
      const M = new Matrix4().compose(new Vector3(x, lift, z),
        new Quaternion().setFromAxisAngle(new Vector3(Math.cos(dir), 0, Math.sin(dir)), lean), new Vector3(1, 1, 1));
      const stem = new CylinderGeometry(top, bottom, hs, 10).translate(0, hs / 2, 0).applyMatrix4(M);
      t.add(stemMat, stem);
      t.add(capMat, new LatheGeometry(profile, 18).translate(0, hs, 0).applyMatrix4(M));
      if (p.spots) spots(t, spotMat, rs, profile, hs, M, rc);
    }
    return t.group();
  },
});
