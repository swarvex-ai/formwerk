import { BufferGeometry, ConeGeometry, Float32BufferAttribute, type Material } from "three";
import { rng } from "../../core/rng";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

function leaflet(t: Parts, m: Material, a: number[], b: number[], tip: number[]) {
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute([...a, ...b, ...tip, ...a, ...b, ...tip], 3));
  g.setIndex([0, 1, 2, 3, 5, 4]);
  g.computeVertexNormals();
  t.add(m, g);
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
  budget: { triangles: 4000, drawCalls: 2 },
  build(p, seed) {
    const r = rng(seed), laub = material("leaf", p.leafColor), grund = material("bark", "#4a3a2a"), t = new Parts();
    const H = p.height, n = 8;
    t.add(grund, new ConeGeometry(H * 0.06, H * 0.08, 7).translate(0, H * 0.04, 0));
    for (let f = 0; f < p.fronds; f++) {
      const yaw = (f / p.fronds) * Math.PI * 2 + r() * 0.5;
      const len = H * (0.8 + 0.4 * r());
      const neig = (p.spread + (r() - 0.5) * 12) * Math.PI / 180;
      const c = Math.cos(yaw), s = Math.sin(yaw);
      const pkt: [number, number, number][] = [[0, H * 0.05, 0]];
      for (let i = 1; i <= n; i++) {
        const w = neig + p.arch * 1.9 * (i / n) ** 1.5;
        const d = len / n;
        const v = pkt[i - 1];
        pkt.push([v[0] + c * Math.sin(w) * d, Math.max(0.01, v[1] + Math.cos(w) * d), v[2] + s * Math.sin(w) * d]);
      }
      const an = (u: number): [number, number, number] => {
        const k = Math.min(n - 1, Math.floor(u * n));
        const q = u * n - k;
        const p0 = pkt[k], p1 = pkt[k + 1];
        return [p0[0] + (p1[0] - p0[0]) * q, p0[1] + (p1[1] - p0[1]) * q, p0[2] + (p1[2] - p0[2]) * q];
      };
      for (let j = 0; j < p.leaflets; j++) {
        const u0 = 0.15 + (0.83 * j) / p.leaflets;
        const u1 = u0 + 0.83 / p.leaflets;
        const a = an(u0), b = an(u1);
        const lang = len * 0.2 * Math.sin(Math.PI * Math.min(1, (u0 - 0.05) / 0.95) ** 0.7) + len * 0.02;
        for (const seite of [-1, 1]) {
          const mx = (a[0] + b[0]) / 2, mz = (a[2] + b[2]) / 2;
          const fx = -s * seite, fz = c * seite;
          const tip: [number, number, number] = [
            mx + fx * lang + (b[0] - a[0]) * 0.8,
            Math.max(0.005, (a[1] + b[1]) / 2 - lang * 0.25),
            mz + fz * lang + (b[2] - a[2]) * 0.8,
          ];
          leaflet(t, laub, a, b, tip);
        }
      }
    }
    return t.group();
  },
});
