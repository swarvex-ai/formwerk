import { BufferGeometry, CylinderGeometry, ExtrudeGeometry, Matrix4, Quaternion, Shape, Vector2, Vector3 } from "three";
import { grained, material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { grid, rounded, turned } from "../shapes";

export const wheelbarrow = defineAsset({
  id: "wheelbarrow", category: "vehicles",
  title: { de: "Schubkarre", en: "Wheelbarrow" },
  description: { de: "Eine Schubkarre mit Bottich aus Blech oder Holz, zwei Griffen, Stützbeinen und einem oder zwei Rädern.", en: "A wheelbarrow with a tray of sheet metal or wood, two handles, support legs and one or two wheels." },
  params: {
    trayLength: { type: "number", label: { de: "Bottichlänge", en: "Tray length" }, min: 0.6, max: 1, step: 0.05, default: 0.85, unit: "m",
      describe: { de: "Länge des Bottichs: 0,6 m klein, 0,85 m üblich, 1 m eine Bauernschubkarre.", en: "Length of the tray: 0.6 m small, 0.85 m usual, 1 m a farm barrow." } },
    trayWidth: { type: "number", label: { de: "Bottichbreite", en: "Tray width" }, min: 0.45, max: 0.75, step: 0.05, default: 0.6, unit: "m",
      describe: { de: "Breite des Bottichs: 0,45 m schmal, 0,6 m üblich, 0,75 m breit.", en: "Width of the tray: 0.45 m narrow, 0.6 m usual, 0.75 m wide." } },
    trayDepth: { type: "number", label: { de: "Bottichtiefe", en: "Tray depth" }, min: 0.18, max: 0.35, step: 0.01, default: 0.28, unit: "m",
      describe: { de: "Tiefe des Bottichs: 0,2 m flach, 0,28 m üblich, 0,35 m für Schüttgut.", en: "Depth of the tray: 0.2 m shallow, 0.28 m usual, 0.35 m for loose material." } },
    handleLength: { type: "number", label: { de: "Grifflänge", en: "Handle length" }, min: 0.4, max: 0.8, step: 0.05, default: 0.6, unit: "m",
      describe: { de: "Länge der Griffe hinter dem Bottich: 0,4 m kurz, 0,6 m üblich, 0,8 m für große Leute.", en: "Length of the handles behind the tray: 0.4 m short, 0.6 m usual, 0.8 m for tall people." } },
    wheels: { type: "choice", label: { de: "Räder", en: "Wheels" }, options: ["one", "two"], labels: { one: { de: "Ein Rad", en: "One wheel" }, two: { de: "Zwei Räder", en: "Two wheels" } }, default: "one",
      describe: { de: "Ein luftgefülltes Rad vorn oder zwei Räder für mehr Standsicherheit.", en: "One pneumatic wheel at the front, or two for steadier footing." } },
    wheelRadius: { type: "number", label: { de: "Radradius", en: "Wheel radius" }, min: 0.12, max: 0.28, step: 0.01, default: 0.18, unit: "m",
      describe: { de: "Radius des Rads: 0,15 m klein, 0,18 m üblich, 0,28 m ein Geländerad.", en: "Wheel radius: 0.15 m small, 0.18 m usual, 0.28 m an all-terrain wheel." } },
    material: { type: "choice", label: { de: "Material", en: "Material" }, options: ["metal", "wood"], labels: { metal: { de: "Blech", en: "Sheet metal" }, wood: { de: "Holz", en: "Wood" } }, default: "metal",
      describe: { de: "Verzinktes Blech oder hölzerne Kastenkarre, jeweils mit passendem Gestell.", en: "Galvanised sheet metal or a wooden barrow, each with a matching frame." } },
    color: { type: "color", label: { de: "Bottich", en: "Tray" }, default: "#9aa1a8",
      describe: { de: "Farbe des Bottichs: verzinktes Grau, grünes oder rotes Blech, Holzton.", en: "Colour of the tray: galvanised grey, green or red sheet, a wood tone." } },
  },
  presets: {
    garden: { label: { de: "Gartenschubkarre", en: "Garden barrow" }, values: { color: "#4c7a4e", trayLength: 0.8, wheelRadius: 0.17 } },
    builders: { label: { de: "Baustellen-Schubkarre", en: "Builders barrow" }, values: { trayLength: 0.95, trayWidth: 0.65, trayDepth: 0.32, handleLength: 0.65, wheelRadius: 0.2 } },
    "wooden-farm": { label: { de: "Holzkarre", en: "Wooden farm barrow" }, values: { material: "wood", color: "#8a6a42", trayLength: 1, trayWidth: 0.7, trayDepth: 0.32, wheelRadius: 0.22, wheels: "two" } },
  },
  physics: { body: "dynamic", collider: "box" },
  budget: { triangles: 6000, drawCalls: 4 },
  build(p) {
    // Drawn with thick walls but really sheet and tube: effective densities give a barrow's mass
    const holzig = p.material === "wood";
    const bottich = holzig ? material("wood", p.color, 1, 420, { grain: "part" }) : material("metal", p.color, 1, 200);
    const geruest = holzig ? material("wood", "#6b543a", 1, 500, { grain: "part" }) : material("metal", "#43474c", 1, 550);
    const stahl = material("metal", "#5a5e63", 1, 900), gummi = material("plastic", "#26262b", 1, 900);
    const t = new Parts();
    const r = p.wheelRadius, TL = p.trayLength, TW = p.trayWidth, TD = p.trayDepth;
    // Two rails splay from the axle (sf apart from the middle) to the handle ends (sb); the tray sits on two bearers across them
    const zf = TL / 2 + r + 0.01, zB = -TL / 2 - p.handleLength, zL = -TL / 2 + 0.1;
    const vorn = r, oben = r + 0.42, hang = (oben - vorn) / (zf - zB), neigung = Math.atan(hang);
    const hoehe = (z: number) => vorn + (zf - z) * hang;
    const sf = 0.07, sb = Math.max(0.27, TW / 2);
    const xr = (z: number) => sf + ((sb - sf) * (zf - z)) / (zf - zB);
    // Tray coordinates: x across, y up from the rail centre line, z along the rails; lokal() tilts them onto the rails
    const lokal = (g: BufferGeometry) => g.rotateX(neigung).translate(0, hoehe(0), 0);
    const cos = Math.cos(neigung), rr = holzig ? 0.025 : 0.016;
    // A part along the line a → b (geometry built along +y)
    const entlang = (g: BufferGeometry, a: Vector3, b: Vector3) => g.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), b.clone().sub(a).normalize())).translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
    for (const sg of [-1, 1]) {
      const a = new Vector3(sg * sf, vorn, zf), b = new Vector3(sg * sb, oben, zB), d = b.clone().sub(a).normalize();
      const g = b.clone().addScaledVector(d, -0.13), lang = a.distanceTo(g);
      // Rail up to the grip, then the grip over its end
      if (holzig) t.add(geruest, grained(entlang(rounded(0.045, lang, 0.05, 0.004), a, g), "z"));
      else t.add(geruest, entlang(new CylinderGeometry(rr, rr, lang, 12), a, g));
      const griff = turned([[0, 0], [rr + 0.004, 0], [rr + 0.006, 0.02], [rr + 0.005, 0.07], [rr + 0.007, 0.12], [rr + 0.004, 0.15], [0, 0.15]], 12);
      t.add(holzig ? geruest : gummi, entlang(griff.translate(0, -0.075, 0), g.clone().addScaledVector(d, -0.01), b.clone().addScaledVector(d, 0.01)));
      // Leg from the rail down to a foot on the floor
      const oberL = new Vector3(sg * xr(zL), hoehe(zL), zL), unten = new Vector3(sg * (xr(zL) + 0.03), 0.01, zL - 0.02);
      if (holzig) t.add(geruest, entlang(rounded(0.045, oberL.distanceTo(unten) + rr, 0.045, 0.004), oberL.clone().setY(oberL.y + rr / 2), unten));
      else {
        t.add(geruest, entlang(new CylinderGeometry(0.014, 0.014, oberL.distanceTo(unten), 10), oberL, unten));
        t.add(stahl, rounded(0.05, 0.01, 0.07, 0.003, unten.x, 0.005, unten.z));
      }
    }
    // Two bearers across the rails, the tray floor on top of them
    const bh = 0.025, y0 = rr + bh;
    for (const Z of [-TL / 4, TL / 6]) {
      const w = 2 * xr(Z * cos) + 0.06;
      t.add(holzig ? geruest : stahl, lokal(holzig ? grained(rounded(w, bh, 0.05, 0.004, 0, rr + bh / 2, Z), "x") : rounded(w, bh, 0.04, 0.003, 0, rr + bh / 2, Z)));
    }
    const bw = TW * 0.36, zb0 = -TL / 2 + 0.07, zb1 = TL * 0.1;
    if (holzig) {
      // Wooden box: a floor of boards, sides that lean out, a sloping front and a back board
      const dk = 0.022;
      t.add(bottich, lokal(grained(rounded(2 * bw + 2 * dk, dk, zb1 - zb0, 0.003, 0, y0 + dk / 2, (zb0 + zb1) / 2), "z")));
      const brett = (pts: [number, number][], m: Matrix4, achse: "x" | "z") => {
        const f = new Shape(pts.map(([u, v]) => new Vector2(u, v)));
        const g = new ExtrudeGeometry(f, { depth: dk - 0.006, bevelEnabled: true, bevelSize: 0.003, bevelThickness: 0.003, bevelOffset: -0.003, bevelSegments: 1, curveSegments: 1 });
        t.add(bottich, lokal(grained(g.translate(0, 0, -(dk - 0.006) / 2).applyMatrix4(m), achse)));
      };
      for (const sg of [-1, 1]) {
        // Side board in the plane through (bw, y0) and (TW / 2, y0 + TD); shape u along z, v up the slant
        const nx = new Vector3(TD, -(TW / 2 - bw), 0).normalize().multiplyScalar(sg), up = new Vector3(sg * (TW / 2 - bw), TD, 0);
        const S = up.length(); up.normalize();
        const m = new Matrix4().makeBasis(new Vector3(0, 0, 1), up, nx).setPosition(sg * (bw + dk / 2), y0, 0);
        brett([[zb0 - dk, 0], [zb1 + dk, 0], [TL / 2 + dk, S], [-TL / 2 - dk, S]], m, "z");
      }
      for (const [z0, z1] of [[zb1, TL / 2], [zb0, -TL / 2]]) {
        const sg = Math.sign(z1), up = new Vector3(0, TD, z1 - z0), S = up.length(); up.normalize();
        const nz = new Vector3(0, -(z1 - z0), TD).normalize();
        const m = new Matrix4().makeBasis(new Vector3(1, 0, 0), up, nz).setPosition(0, y0, z0 + sg * dk / 2);
        brett([[-bw, 0], [bw, 0], [TW / 2, S], [-TW / 2, S]], m, "x");
      }
    } else {
      // Pressed sheet pan: rounded-rectangle loop, wider and longer at the top, with a rolled rim
      const m = 6, N = 4 * (m + 1), th = 0.004;
      const ring = (v: number, ein: number) => {
        const hw = bw + (TW / 2 - bw) * v - ein, z0 = zb0 + (-TL / 2 - zb0) * v + ein, z1 = zb1 + (TL / 2 - zb1) * v - ein, rc = 0.05 + 0.04 * v - ein;
        return (i: number) => {
          const c = Math.floor((i % N) / (m + 1)), a = (c + (i % (m + 1)) / m) * (Math.PI / 2);
          const cx = c === 0 || c === 3 ? hw - rc : -(hw - rc), cz = c < 2 ? z1 - rc : z0 + rc;
          return { x: cx + rc * Math.cos(a), z: cz + rc * Math.sin(a), nx: Math.cos(a), nz: Math.sin(a) };
        };
      };
      const wand = (ein: number, ya: number, raus: number) => grid(N, 1, (u, v) => { const q = ring(v, ein)(Math.round(u * N)); return new Vector3(q.x, ya + (y0 + TD - ya) * v, q.z); }, (q) => new Vector3(q.x, 0, q.z).multiplyScalar(raus));
      const boden = (ein: number, y: number, raus: number) => grid(N, 1, (u, v) => { const q = ring(0, ein)(Math.round(u * N)); return new Vector3(q.x * v, y, (zb0 + zb1) / 2 + (q.z - (zb0 + zb1) / 2) * v); }, () => new Vector3(0, raus, 0));
      t.add(bottich, lokal(wand(0, y0, 1)));
      t.add(bottich, lokal(wand(th, y0 + th, -1)));
      t.add(bottich, lokal(boden(0, y0, -1)));
      t.add(bottich, lokal(boden(th, y0 + th, 1)));
      const rr2 = 0.009, oben2 = ring(1, th / 2);
      t.add(bottich, lokal(grid(N, 8, (u, v) => {
        const q = oben2(Math.round(u * N)), w = v * Math.PI * 2;
        const o = rr2 * 0.6 + rr2 * Math.cos(w);
        return new Vector3(q.x + q.nx * o, y0 + TD - rr2 * 0.3 + rr2 * Math.sin(w), q.z + q.nz * o);
      }, (q) => new Vector3(q.x, 0, q.z))));
    }
    // The axle through the rail ends and the wheel or wheels: tyre, pressed rim with its hub
    const zw = zf, wx = Math.max(sf + rr + 0.055, TW * 0.32);
    const raeder = p.wheels === "two" ? [wx, -wx] : [0];
    const R0 = r - 0.035;
    const reifen: [number, number][] = [];
    for (let k = 0; k <= 12; k++) { const w = -Math.PI / 2 + (k / 12) * Math.PI * 2; reifen.push([R0 + 0.035 * Math.cos(w), 0.04 * Math.sin(w)]); }
    const felge: [number, number][] = [[0, -0.045], [0.024, -0.045], [0.024, -0.016], [R0 - 0.036, -0.01], [R0 - 0.028, -0.03], [R0 - 0.018, -0.03], [R0 - 0.018, 0.03], [R0 - 0.028, 0.03], [R0 - 0.036, 0.01], [0.024, 0.016], [0.024, 0.045], [0, 0.045]];
    for (const x of raeder) {
      t.add(gummi, turned(reifen, 24).rotateZ(Math.PI / 2).translate(x, r, zw));
      t.add(stahl, turned(felge, 24).rotateZ(Math.PI / 2).translate(x, r, zw));
    }
    const achse = raeder.length === 2 ? 2 * (wx + 0.05) : 2 * (sf + rr + 0.02);
    t.add(stahl, new CylinderGeometry(0.012, 0.012, achse, 10).rotateZ(Math.PI / 2).translate(0, r, zw));
    return t.group();
  },
});
