import { BufferGeometry, CatmullRomCurve3, Color, Float32BufferAttribute, Vector3 } from "three";
import { rng } from "../../core/rng";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { grid, turned } from "../shapes";

const OBEN = new Vector3(0, 1, 0);

/**
 * A round tube along a curve, `radius(v)` from v = 0 to 1; a radius of 0 at an end closes it there. `bezug` is a
 * direction the curve never runs along: the rings keep their turn against it, so they never flip.
 */
function roehre(kurve: (v: number) => Vector3, radius: (v: number) => number, nv: number, um: number, bezug: Vector3): BufferGeometry {
  const rahmen = (v: number) => {
    const tg = kurve(Math.min(1, v + 1e-3)).sub(kurve(Math.max(0, v - 1e-3))).normalize();
    const quer = new Vector3().crossVectors(tg, bezug).normalize();
    return { quer, hoch: new Vector3().crossVectors(quer, tg) };
  };
  const mitte = kurve(0.5);
  return grid(um, nv, (u, v) => {
    const { quer, hoch } = rahmen(v), w = u * Math.PI * 2;
    return kurve(v).addScaledVector(quer, radius(v) * Math.cos(w)).addScaledVector(hoch, radius(v) * Math.sin(w));
  }, (q) => q.clone().sub(mitte));
}

/** Pinnae of one shade: lobed leaflets, cupped along the midrib, both faces lit from above the frond. */
class Fiedern {
  pos: number[] = []; nor: number[] = []; uv: number[] = [];
  fieder(basis: Vector3, achse: Vector3, oben: Vector3, laenge: number, breite: number, lappen: number) {
    const quer = new Vector3().crossVectors(achse, oben).normalize(), licht = oben.clone().multiplyScalar(0.8).addScaledVector(OBEN, 0.4).normalize();
    const n = lappen * 2, mitte: Vector3[] = [], rand: Vector3[][] = [[], []];
    for (let j = 0; j <= n; j++) {
      // Lobes: tips at the odd stations, notches between them; narrow at the base, widest near it, to a point at the tip
      const s = j / n, w = j === n ? 0 : (breite / 2) * Math.pow(1 - s, 0.6) * (j % 2 ? 1 : 0.55) * Math.min(1, 0.4 + s * 3);
      const m = basis.clone().addScaledVector(achse, laenge * s).addScaledVector(oben, -laenge * 0.12 * s * s);
      mitte.push(m);
      for (const k of [0, 1]) rand[k].push(m.clone().addScaledVector(quer, (k ? 1 : -1) * w).addScaledVector(oben, w * 0.3));
    }
    const punkt = (q: Vector3, u: number, v: number) => {
      // never below the floor, also where a frond arches down to it
      this.pos.push(q.x, Math.max(0.004, q.y), q.z); this.nor.push(licht.x, licht.y, licht.z); this.uv.push(u, v);
    };
    for (let j = 0; j < n; j++) for (const k of [0, 1]) {
      const a = { q: mitte[j], u: 0.5, v: j / n }, b = { q: rand[k][j], u: k, v: j / n };
      const c = { q: rand[k][j + 1], u: k, v: (j + 1) / n }, d = { q: mitte[j + 1], u: 0.5, v: (j + 1) / n };
      // both faces of each triangle
      for (const tri of [[a, b, c], [a, c, d], [a, c, b], [a, d, c]]) for (const e of tri) punkt(e.q, e.u, e.v);
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

export const fern = defineAsset({
  id: "fern", category: "nature",
  title: { de: "Farn", en: "Fern" },
  description: {
    de: "Ein Farn aus gefiederten Wedeln, die aus einer Mitte wachsen und sich nach außen neigen: vom kleinen Waldfarn bis zum hüfthohen Adlerfarn.",
    en: "A fern of feathered fronds that grow from one centre and arch outward: from a small wood fern to waist-high bracken.",
  },
  params: {
    height: {
      type: "number", label: { de: "Wedellänge", en: "Frond length" }, min: 0.25, max: 1.5, step: 0.05, default: 0.7, unit: "m",
      describe: { de: "Länge der Wedel: 0,3 m ein kleiner Waldfarn, 0,7 m üblich, 1,4 m hoher Adlerfarn.", en: "Frond length: 0.3 m a small wood fern, 0.7 m usual, 1.4 m tall bracken." },
    },
    fronds: {
      type: "integer", label: { de: "Wedel", en: "Fronds" }, min: 3, max: 16, default: 9,
      describe: { de: "Zahl der Wedel: 4 ein junger Farn, 9 üblich, 16 ein dichter Horst.", en: "Number of fronds: 4 a young fern, 9 usual, 16 a dense clump." },
    },
    spread: {
      type: "number", label: { de: "Öffnung", en: "Spread" }, min: 10, max: 70, step: 1, default: 40, unit: "°",
      describe: { de: "Neigung an der Basis zur Senkrechten: 15° aufrecht wie ein Trichterfarn, 40° üblich, 65° flach ausgebreitet.", en: "Lean at the base from vertical: 15° upright like an ostrich fern, 40° usual, 65° spread flat." },
    },
    arch: {
      type: "number", label: { de: "Bogen", en: "Arch" }, min: 0, max: 1, step: 0.05, default: 0.5,
      describe: { de: "Krümmung der Wedel: 0 gerade, 0,5 üblich, 1 bis zum Boden überhängend.", en: "Arching of the fronds: 0 straight, 0.5 usual, 1 drooping to the ground." },
    },
    leaflets: {
      type: "integer", label: { de: "Fiedern", en: "Leaflets" }, min: 5, max: 20, default: 12,
      describe: { de: "Fiederpaare je Wedel: 6 grob, 12 üblich, 20 fein gefiedert.", en: "Leaflet pairs per frond: 6 coarse, 12 usual, 20 finely divided." },
    },
    leafColor: {
      type: "color", label: { de: "Laub", en: "Leaves" }, default: "#4f8a3a",
      describe: { de: "Farbe der Fiedern: #4f8a3a frisches Grün, #3d6e34 dunkel im Schatten, #b0782f herbstbraun.", en: "Colour of the leaves: #4f8a3a fresh green, #3d6e34 dark in the shade, #b0782f autumn brown." },
    },
  },
  presets: {
    "wood-fern": { label: { de: "Waldfarn", en: "Wood fern" }, values: { height: 0.4, fronds: 7, spread: 45, arch: 0.6 } },
    bracken: { label: { de: "Adlerfarn", en: "Bracken" }, values: { height: 1.3, fronds: 6, spread: 30, arch: 0.35, leaflets: 16, leafColor: "#5a8f3c" } },
    "ostrich-fern": { label: { de: "Trichterfarn", en: "Ostrich fern" }, values: { fronds: 12, spread: 18, arch: 0.25, leaflets: 16 } },
    autumn: { label: { de: "Herbstfarn", en: "Autumn fern" }, values: { arch: 0.85, leafColor: "#b0782f" } },
  },
  physics: { body: "static", collider: "hull" },
  budget: { triangles: 40000, drawCalls: 3 },
  build(p, seed) {
    const r = rng(seed), jung = rng(seed + 1), t = new Parts();
    // Pinnae in two shades of plain colour like the tree's leaves (thousands of cards would not fit a bake atlas): the
    // fronds alternate between them; the rachis in the darker one
    const ton = (k: number) => { const c = new Color(p.leafColor); c.multiplyScalar(k); return `#${c.getHexString()}`; };
    const hell = material("leaf", p.leafColor, 1, undefined, { plain: true }), dunkel = material("leaf", ton(0.74), 1, undefined, { plain: true });
    const grund = material("bark", "#4a3a2a", 4), H = p.height, n = 12, blaetter = [new Fiedern(), new Fiedern()];
    // The crown: a low mound of old stipe bases and roots that the fronds grow out of
    const kr = H * 0.07, kh = H * 0.06;
    t.add(grund, turned([[0, 0], [kr, 0], [kr * 0.95, kh * 0.4], [kr * 0.7, kh * 0.85], [kr * 0.3, kh], [0, kh]], 12));
    for (let f = 0; f < p.fronds; f++) {
      const yaw = (f / p.fronds) * Math.PI * 2 + r() * 0.5, len = H * (0.8 + 0.4 * r()), neig = ((p.spread + (r() - 0.5) * 12) * Math.PI) / 180;
      const c = Math.cos(yaw), s = Math.sin(yaw), seite = new Vector3(-s, 0, c);
      // The frond's line: leaning out at the base, arching further towards the tip, never below the floor
      const pkt = [new Vector3(c * kr * 0.3, kh * 0.6, s * kr * 0.3)];
      for (let i = 1; i <= n; i++) {
        const w = neig + p.arch * 1.9 * (i / n) ** 1.5, d = len / n, v = pkt[i - 1];
        pkt.push(new Vector3(v.x + c * Math.sin(w) * d, Math.max(0.012, v.y + Math.cos(w) * d), v.z + s * Math.sin(w) * d));
      }
      const kurve = new CatmullRomCurve3(pkt), an = (u: number) => kurve.getPointAt(u), rb = Math.max(0.0025, len * 0.006);
      t.add(dunkel, roehre(an, (v) => (v > 0.995 ? 0 : rb * (1 - 0.75 * v)), 16, 5, seite));
      for (let j = 0; j < p.leaflets; j++) {
        // A bare stipe at the base, then pairs of pinnae: longest in the lower middle, shorter towards the stipe and the tip
        const u = 0.17 + (0.8 * (j + 0.5)) / p.leaflets, b = an(u), tg = an(Math.min(1, u + 0.01)).sub(an(Math.max(0, u - 0.01))).normalize();
        const oben = new Vector3().crossVectors(seite, tg).normalize();
        const lang = len * (0.2 * Math.sin(Math.PI * Math.min(1, (u - 0.1) / 0.92) ** 0.8) + 0.025);
        for (const sg of [-1, 1]) {
          const achse = seite.clone().multiplyScalar(sg).addScaledVector(tg, 0.6).addScaledVector(oben, -0.1).normalize();
          blaetter[f % 2].fieder(b, achse, oben, lang, lang * 0.32, 3);
        }
      }
    }
    // Young fronds: one to three fiddleheads, still curled, rising from the crown (their own random stream)
    for (let k = 0, m = Math.min(3, Math.max(1, Math.round(p.fronds / 5))); k < m; k++) {
      const a = jung() * Math.PI * 2, dir = new Vector3(Math.cos(a), 0, Math.sin(a)), seite = new Vector3(-dir.z, 0, dir.x);
      const hs = H * (0.12 + 0.08 * jung()), rc = H * 0.045, fuss = dir.clone().multiplyScalar(kr * 0.25 * jung()).setY(kh * 0.5);
      const pkt: Vector3[] = [];
      for (let i = 0; i <= 4; i++) pkt.push(fuss.clone().addScaledVector(OBEN, ((hs - fuss.y) * i) / 4));
      for (let i = 1; i <= 20; i++) {
        // the coil: it turns over towards the outside and rolls in on itself
        const th = (i / 20) * 2.6 * Math.PI, rho = rc * Math.exp(-0.25 * th);
        pkt.push(fuss.clone().setY(hs).addScaledVector(dir, rc - rho * Math.cos(th)).addScaledVector(OBEN, rho * Math.sin(th)));
      }
      const kurve = new CatmullRomCurve3(pkt), rbc = Math.max(0.0025, H * 0.011);
      t.add(hell, roehre((v) => kurve.getPointAt(v), (v) => (v > 0.995 ? 0 : rbc * (1 - 0.5 * v)), 40, 6, seite));
    }
    t.add(hell, blaetter[0].geometrie());
    t.add(dunkel, blaetter[1].geometrie());
    return t.group();
  },
});
