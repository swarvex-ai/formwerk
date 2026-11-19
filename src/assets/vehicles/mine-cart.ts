import { DodecahedronGeometry, ExtrudeGeometry, Shape, Vector2, Vector3 } from "three";
import { rng } from "../../core/rng";
import { grained, material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { grid, rounded, turned } from "../shapes";

export const mineCart = defineAsset({
  id: "mine-cart", category: "vehicles",
  title: { de: "Loren", en: "Mine cart" },
  description: {
    de: "Eine kleine Lore auf vier Spurkranzrädern für Minenstollen, Zwergenhallen, Steinbrüche und Grubenbahnen, wahlweise mit Gleis und Erzladung.",
    en: "A small open tub on four flanged wheels for mine tunnels, dwarf halls, quarries and railways, optionally on track with an ore heap.",
  },
  params: {
    length: { type: "number", label: { de: "Länge", en: "Length" }, min: 0.8, max: 1.6, step: 0.05, default: 1, unit: "m",
      describe: { de: "Länge des Kastens: 0,8 m ein Handkarren, 1 m üblich, 1,6 m ein großer Förderkasten.", en: "Length of the tub: 0.8 m a hand tub, 1 m usual, 1.6 m a large hopper." } },
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.5, max: 1, step: 0.01, default: 0.7, unit: "m",
      describe: { de: "Außenbreite des Kastens.", en: "Outer width of the tub." } },
    depth: { type: "number", label: { de: "Tiefe", en: "Depth" }, min: 0.3, max: 0.7, step: 0.01, default: 0.45, unit: "m",
      describe: { de: "Höhe der Kastenwände.", en: "Height of the tub walls." } },
    wheelRadius: { type: "number", label: { de: "Radradius", en: "Wheel radius" }, min: 0.1, max: 0.2, step: 0.005, default: 0.14, unit: "m",
      describe: { de: "Radius der Räder.", en: "Radius of the wheels." } },
    body: { type: "choice", label: { de: "Kasten", en: "Body" }, options: ["wood", "metal"], labels: { wood: { de: "Holz", en: "Wood" }, metal: { de: "Metall", en: "Metal" } }, default: "wood",
      describe: { de: "Geplankter Holzkasten oder genieteter Stahlkasten.", en: "Planked wooden tub or riveted steel tub." } },
    rails: { type: "boolean", label: { de: "Gleis", en: "Rails" }, default: true,
      describe: { de: "Ein Stück Schiene mit Holzschwellen unter der Lore.", en: "A piece of track with sleepers under the cart." } },
    load: { type: "number", label: { de: "Ladung", en: "Load" }, min: 0, max: 1, step: 0.05, default: 0.6,
      describe: { de: "Haufen im Kasten: 0 leer, 0,6 üblich, 1 über den Rand gehäuft.", en: "Heap in the tub: 0 empty, 0.6 usual, 1 heaped over the rim." } },
    color: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#7a5a3a",
      describe: { de: "Farbe des Kastens.", en: "Colour of the tub." } },
    metalColor: { type: "color", label: { de: "Metall", en: "Metal" }, default: "#3c3c3c",
      describe: { de: "Farbe von Rädern, Achsen, Eckbeschlägen und Schienen.", en: "Colour of wheels, axles, corner irons and rails." } },
    loadColor: { type: "color", label: { de: "Ladungsfarbe", en: "Load colour" }, default: "#4a4642",
      describe: { de: "Farbe der Füllung: Gestein oder Kohle.", en: "Colour of the fill: rock or coal." } },
  },
  presets: {
    "ore-cart": { label: { de: "Erzlore", en: "Ore cart" }, values: { load: 0.6, rails: true } },
    "coal-tub": { label: { de: "Kohlelore", en: "Coal tub" }, values: { body: "metal", color: "#5a5e62", loadColor: "#1e1e20", load: 0.9 } },
    "big-hopper": { label: { de: "Großförderkasten", en: "Big hopper" }, values: { length: 1.6, width: 1, depth: 0.7, wheelRadius: 0.2 } },
    empty: { label: { de: "Leer", en: "Empty" }, values: { load: 0, rails: false } },
  },
  physics: { body: "dynamic", collider: "box" },
  budget: { triangles: 30000, drawCalls: 4 },
  build(p, seed) {
    const L = p.length, W = p.width, D = p.depth, r = p.wheelRadius, g = W * 0.7;
    const holzig = p.body === "wood";
    // Drawn solid but really boards or sheet: effective densities give a tub's mass
    const wanne = holzig ? material("wood", p.color, 1, 500, { grain: "part" }) : material("metal", p.color, 1, 1200);
    const eisen = material("iron", p.metalColor, 2, 3000, { rust: 0.25 });
    const balken = material("wood", "#5e4630", 1, 500, { grain: "part" });
    const t = new Parts();
    // Without track the cart stands on its flanges, so the flange touches the floor
    const base = p.rails ? 0.07 : 0.012;
    const yb = base + 2 * r + 0.03;

    if (p.rails) {
      // Sleepers of eased timber, two flat-bottom rails (foot, web, head) on top
      const n = Math.ceil((L + 0.6) / 0.35);
      for (let i = 0; i < n; i++) {
        t.add(balken, grained(rounded(g + 0.3, 0.04, 0.12, 0.006, 0, 0.02, -(L + 0.6) / 2 + 0.06 + (i * (L + 0.6 - 0.12)) / (n - 1)), "x"));
      }
      const profil = new Shape([[-0.024, 0], [0.024, 0], [0.024, 0.004], [0.005, 0.008], [0.005, 0.018], [0.011, 0.02], [0.011, 0.03], [-0.011, 0.03], [-0.011, 0.02], [-0.005, 0.018], [-0.005, 0.008], [-0.024, 0.004]].map(([x, y]) => new Vector2(x, y)));
      for (const s of [-1, 1]) {
        t.add(eisen, new ExtrudeGeometry(profil, { depth: L + 0.6, bevelEnabled: false, curveSegments: 1 }).translate((s * g) / 2, 0.04, -(L + 0.6) / 2));
      }
    }

    // Flanged wheels: a dished web between hub and a coned tread, the flange on the inner side; a turned axle, and a
    // bearing block where each beam rests on it
    const rad: [number, number][] = [[0, -0.04], [0.035, -0.04], [0.04, -0.032], [0.04, -0.012], [r - 0.016, -0.012], [r - 0.014, -0.025], [r - 0.004, -0.025], [r, 0.018], [r + 0.012, 0.022], [r + 0.012, 0.03], [r - 0.006, 0.034], [r - 0.02, 0.012], [0.04, 0.012], [0.04, 0.03], [0, 0.03]];
    const az = Math.max(r + 0.02, L / 2 - r - 0.08), xb = g / 2 - 0.08;
    for (const z of [-az, az]) {
      t.add(eisen, turned([[0, 0], [0.022, 0], [0.022, g + 0.06], [0, g + 0.06]], 12).rotateZ(Math.PI / 2).translate(g / 2 + 0.03, base + r, z));
      for (const s of [-1, 1]) {
        const rad3 = turned(rad, 28).rotateZ(Math.PI / 2);
        if (s < 0) rad3.rotateY(Math.PI);
        t.add(eisen, rad3.translate((s * g) / 2, base + r, z));
        t.add(eisen, rounded(0.07, 0.08, 0.1, 0.008, s * xb, base + r + 0.005, z, 1));
      }
    }
    // Two beams on the bearing blocks carry the tub
    const hb = yb - (base + r + 0.045);
    for (const s of [-1, 1]) t.add(balken, grained(rounded(0.06, hb, L * 0.9, 0.006, s * xb, base + r + 0.045 + hb / 2, 0), "z"));

    const d = 0.03;
    if (holzig) {
      // Boarded tub: floor boards and side boards along the cart, end boards across, 4 mm joints
      const nb = Math.max(3, Math.round((W - 2 * d) / 0.12)), bb = (W - 2 * d) / nb;
      for (let i = 0; i < nb; i++) t.add(wanne, grained(rounded(bb - 0.004, d, L - 2 * d, 0.004, -(W - 2 * d) / 2 + bb * (i + 0.5), yb + d / 2, 0), "z"));
      const reihen = Math.max(2, Math.ceil(D / 0.13)), bh = D / reihen;
      for (let k = 0; k < reihen; k++) {
        const y = yb + bh * (k + 0.5);
        for (const s of [-1, 1]) {
          t.add(wanne, grained(rounded(d, bh - 0.004, L, 0.004, s * (W / 2 - d / 2), y, 0), "z"));
          t.add(wanne, grained(rounded(W - 2 * d - 0.002, bh - 0.004, d, 0.004, 0, y, s * (L / 2 - d / 2)), "x"));
        }
      }
    } else {
      // Sheet steel tub: floor and walls as plates, a rolled bead round the top
      t.add(wanne, rounded(W - 2 * d + 0.004, 0.012, L - 2 * d + 0.004, 0.003, 0, yb + 0.006, 0));
      for (const s of [-1, 1]) {
        t.add(wanne, rounded(0.012, D, L, 0.004, s * (W / 2 - 0.006), yb + D / 2, 0));
        t.add(wanne, rounded(W - 0.024, D, 0.012, 0.004, 0, yb + D / 2, s * (L / 2 - 0.006)));
      }
      for (const s of [-1, 1]) {
        t.add(wanne, turned([[0, 0], [0.012, 0], [0.012, L], [0, L]], 10).rotateX(Math.PI / 2).translate(s * (W / 2 - 0.006), yb + D, -L / 2));
        t.add(wanne, turned([[0, 0], [0.012, 0], [0.012, W], [0, W]], 10).rotateZ(-Math.PI / 2).translate(-W / 2, yb + D, s * (L / 2 - 0.006)));
      }
    }
    // Iron: straps round the tub at the bottom and below the rim, angle irons up each corner, rivets through them
    const niet = (x: number, y: number, z: number, nx: number, nz: number) => {
      const k = turned([[0, 0], [0.008, 0], [0.007, 0.003], [0, 0.005]], 8);
      t.add(eisen, (nx ? k.rotateZ(-nx * Math.PI / 2) : k.rotateX(nz * Math.PI / 2)).translate(x, y, z));
    };
    for (const y of [yb + 0.035, yb + D - 0.04]) {
      for (const s of [-1, 1]) {
        t.add(eisen, rounded(0.006, 0.04, L + 0.012, 0.002, s * (W / 2 + 0.003), y, 0, 1));
        t.add(eisen, rounded(W, 0.04, 0.006, 0.002, 0, y, s * (L / 2 + 0.003), 1));
        for (const f of [-0.3, 0, 0.3]) niet(s * (W / 2 + 0.006), y, f * L, s, 0);
        niet(0, y, s * (L / 2 + 0.006), 0, s);
      }
    }
    for (const s of [-1, 1]) for (const zs of [-1, 1]) {
      t.add(eisen, rounded(0.009, D + 0.01, 0.06, 0.002, s * (W / 2 + 0.0045), yb + (D + 0.01) / 2, zs * (L / 2 - 0.021), 1));
      t.add(eisen, rounded(0.06, D + 0.01, 0.009, 0.002, s * (W / 2 - 0.021), yb + (D + 0.01) / 2, zs * (L / 2 + 0.0045), 1));
      for (const y of [yb + 0.1, yb + D - 0.1]) {
        niet(s * (W / 2 + 0.009), y, zs * (L / 2 - 0.025), s, 0);
        niet(s * (W / 2 - 0.025), y, zs * (L / 2 + 0.009), 0, zs);
      }
    }

    if (p.load > 0.02) {
      // The load: a heaped surface of broken rock between the walls, with loose lumps lying on it
      const erz = material("stone", p.loadColor), zr = rng(seed + 1);
      const hw = W / 2 - d - 0.002, hl = L / 2 - d - 0.002, y0 = yb + d + (D - d) * p.load * 0.85, kuppe = D * 0.5 * p.load + 0.02;
      const hoehe = (x: number, z: number) => {
        const u = x / hw, v = z / hl;
        return y0 + kuppe * (1 - u * u) * (1 - v * v) + 0.012 * Math.sin(x * 37 + 1.3) * Math.sin(z * 29 + 0.7) + 0.008 * Math.sin(x * 71 + z * 53);
      };
      t.add(erz, grid(14, 18, (u, v) => { const x = (u * 2 - 1) * hw, z = (v * 2 - 1) * hl; return new Vector3(x, hoehe(x, z), z); }, () => new Vector3(0, 1, 0)));
      const brocken = Math.round(8 + 14 * p.load);
      for (let i = 0; i < brocken; i++) {
        const x = (zr() * 2 - 1) * hw * 0.85, z = (zr() * 2 - 1) * hl * 0.85, s = 0.04 + 0.05 * zr();
        const st = new DodecahedronGeometry(s, 0);
        st.scale(1, 0.6 + 0.4 * zr(), 0.7 + 0.5 * zr()).rotateY(zr() * Math.PI).rotateX((zr() - 0.5) * 0.8);
        st.computeVertexNormals();
        t.add(erz, st.translate(x, hoehe(x, z) + s * 0.25, z));
      }
    }

    return t.group();
  },
});
