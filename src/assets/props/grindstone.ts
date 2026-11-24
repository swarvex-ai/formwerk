import { ExtrudeGeometry, Shape, Vector3 } from "three";
import { material, grained } from "../../materials";
import { defineAsset, Parts } from "../define";
import { rng } from "../../core/rng";
import { grid, rounded, turned } from "../shapes";

export const grindstone = defineAsset({
  id: "grindstone", category: "props",
  title: { de: "Schleifstein", en: "Grindstone" },
  description: { de: "Ein Schleifstein: ein aufrechtes rundes Steinrad auf einer Eisenwelle in einem Holzgestell, mit Kurbel und kleinem Wassertrog; Rad, Welle und Kurbel drehen sich als bewegliches Teil „wheel“, die Unebenheit des abgenutzten Rads kommt vom Seed.", en: "A sharpening grindstone: an upright round stone wheel on an iron axle in a wooden frame, with a crank and a small water trough; wheel, axle and crank turn as the movable part \"wheel\", and the unevenness of a worn wheel comes from the seed." },
  params: {
    diameter: { type: "number", label: { de: "Durchmesser", en: "Diameter" }, min: 0.4, max: 1.2, step: 0.05, default: 0.7, unit: "m",
      describe: { de: "Durchmesser des Steinrads: 0,45 m ein Messerschleifer, 0,7 m ein Hofschleifstein, 1,1 m ein Mühlen- oder Zeughausrad.", en: "Diameter of the stone wheel: 0.45 m a knife grinder, 0.7 m a farm grindstone, 1.1 m a mill or armoury wheel." } },
    thickness: { type: "number", label: { de: "Stärke", en: "Thickness" }, min: 0.06, max: 0.2, step: 0.01, default: 0.1, unit: "m",
      describe: { de: "Breite des Rads entlang der Welle: 0,07 m ein schmaler Messerstein, 0,1 m üblich, 0,18 m ein schweres Mühlenrad.", en: "Width of the wheel along the axle: 0.07 m a narrow knife stone, 0.1 m usual, 0.18 m a heavy mill wheel." } },
    frame: { type: "choice", label: { de: "Gestell", en: "Frame" }, options: ["trestle", "posts"], labels: { trestle: { de: "Bock", en: "Trestle" }, posts: { de: "Pfosten", en: "Posts" } }, default: "trestle",
      describe: { de: "Bock: zwei A-förmige Seiten mit gespreizten Beinen, unten durch zwei Riegel verbunden; Pfosten: zwei aufrechte Pfosten auf einem Bodenbalken.", en: "Trestle: two A-shaped sides with splayed legs joined low by two rails; posts: two upright posts standing on a floor beam." } },
    trough: { type: "boolean", label: { de: "Trog", en: "Trough" }, default: true,
      describe: { de: "Ein kleiner hölzerner Wassertrog unter dem Rad, das Rad taucht 3 cm unter seinen Rand; aus für einen trockenen Stein.", en: "A small wooden water trough under the wheel, which dips 3 cm below its rim; off for a dry stone." } },
    wear: { type: "number", label: { de: "Abnutzung", en: "Wear" }, min: 0, max: 1, step: 0.05, default: 0.3,
      describe: { de: "0 ein neues, rundlaufendes Rad; 1 ein altes mit unebener Lauffläche (Radius bis 1,5 cm verschieden) und gerundeten Kanten; 0,3 üblich.", en: "0 a new, true wheel; 1 an old one with an uneven running face (radius varying by up to 1.5 cm) and rounded edges; 0.3 usual." } },
    stone: { type: "color", label: { de: "Stein", en: "Stone" }, default: "#9a9488",
      describe: { de: "Farbe des Steinrads: Sandstein #9a9488, roter Sandstein #8a5f4e, grauer Schleifstein #77746e.", en: "Colour of the stone wheel: sandstone #9a9488, red sandstone #8a5f4e, grey whetstone #77746e." } },
    wood: { type: "color", label: { de: "Holz", en: "Wood" }, default: "#7a5a3a",
      describe: { de: "Farbe des Holzgestells und des Trogs: Eiche #7a5a3a, verwittert #8a8070.", en: "Colour of the wooden frame and the trough: oak #7a5a3a, weathered #8a8070." } },
  },
  presets: {
    farm: { label: { de: "Hofschleifstein", en: "Farm grindstone" }, values: { diameter: 0.7, frame: "trestle", trough: true } },
    "knife-grinder": { label: { de: "Messerschleifer", en: "Knife grinder" }, values: { diameter: 0.45, thickness: 0.07, frame: "posts", trough: false } },
    "mill-wheel": { label: { de: "Mühlenrad", en: "Mill wheel" }, values: { diameter: 1.1, thickness: 0.18, wear: 0.7 } },
  },
  rig: { wheel: { label: { de: "Rad", en: "Wheel" }, type: "rotate", axis: [1, 0, 0], min: 0, max: 360 } },
  physics: { body: "static", collider: "box" },
  budget: { triangles: 8000, drawCalls: 3 },
  build(p, seed) {
    const stein = material("stone", p.stone, 1), eisen = material("iron", "#4a4642", 3, undefined, { rust: 0.35 }),
      holz = material("wood", p.wood, 1, undefined, { grain: "part" });
    const t = new Parts(), R = p.diameter / 2, T = p.thickness, A = R + 0.2;
    // Frame sides 3 cm outside the wheel faces, 6 cm thick: centre sx, outer face xo
    const b = 0.06, sx = T / 2 + 0.03 + b / 2, xo = sx + b / 2;
    // A beam in the y-z plane from its outline [z, y] (corners in order), b thick along x, centred on x, edges eased
    const balken = (pkt: [number, number][], x: number, achse: "y" | "z", dicke = b) => {
      const f = 0.004, s = new Shape();
      pkt.forEach(([z, y], i) => (i ? s.lineTo(-z, y) : s.moveTo(-z, y)));
      const g = new ExtrudeGeometry(s, { depth: dicke - 2 * f, bevelEnabled: true, bevelThickness: f, bevelSize: f, bevelOffset: -f, bevelSegments: 1 });
      return grained(g.translate(0, 0, -dicke / 2 + f).rotateY(Math.PI / 2).translate(x, 0, 0), achse);
    };
    // Trough: rim 3 cm above the wheel's lowest point, fitting between the frame sides, long enough for the dipping wheel
    const rand = A - R + 0.03, brett = 0.018, tx = T / 2 + 0.025, tz = Math.max(0.15, Math.sqrt(R * R - (R - 0.03) ** 2) + 0.04) + brett;
    const trog = (y0: number) => {
      const h = rand - y0;
      for (const s of [-1, 1]) {
        t.add(holz, grained(rounded(brett, h, 2 * tz, 0.004, s * (tx - brett / 2), y0 + h / 2, 0, 1), "z"));
        t.add(holz, grained(rounded(2 * tx - 2 * brett, h, brett, 0.004, 0, y0 + h / 2, s * (tz - brett / 2), 1), "x"));
      }
      t.add(holz, grained(rounded(2 * tx - 2 * brett, brett, 2 * tz - 2 * brett, 0.004, 0, y0 + brett / 2, 0, 1), "z"));
    };
    if (p.frame === "trestle") {
      // Two A-frames: splayed legs from the bearing block to the floor, a brace across them, two rails low between the sides
      const zf = 0.3 + 0.2 * p.diameter, yt = A - 0.03, zt = 0.035, w = 0.06;
      // The leg's centre line: z at height y
      const zLeg = (y: number) => zf + ((zt - zf) * y) / yt;
      const yr = 0.1, yb = yt * 0.5;
      for (const x of [-sx, sx]) {
        for (const s of [-1, 1]) t.add(holz, balken([[s * (zf - w / 2), 0], [s * (zf + w / 2), 0], [s * (zt + w / 2), yt], [s * (zt - w / 2), yt]], x, "y"));
        t.add(holz, rounded(b, 0.12, 0.16, 0.004, x, A, 0, 1));
        t.add(holz, grained(rounded(0.04, 0.05, 2 * zLeg(yb), 0.004, x, yb, 0, 1), "z"));
      }
      // Rails through both legs of each side, on the legs' centre line at their height
      for (const s of [-1, 1]) t.add(holz, grained(rounded(2 * xo + 0.08, 0.05, 0.05, 0.004, 0, yr, s * zLeg(yr), 1), "x"));
      if (p.trough) trog(0);
    } else {
      // Two upright posts on a floor beam along x, crossed by a foot under each post, a strut each way from foot to post
      const zf = 0.2 + 0.15 * p.diameter, hb = 0.07, top = A + 0.08;
      t.add(holz, grained(rounded(2 * xo + 0.12, hb, 0.08, 0.004, 0, hb / 2, 0, 1), "x"));
      for (const x of [-sx, sx]) {
        t.add(holz, grained(rounded(0.07, hb, 2 * zf, 0.004, x, hb / 2, 0, 1), "z"));
        t.add(holz, grained(rounded(b, top - hb, 0.09, 0.004, x, (hb + top) / 2, 0, 1), "y"));
        const z0 = 0.04, z1 = zf - 0.05, d = z1 - z0, k = 0.05;
        for (const s of [-1, 1]) t.add(holz, balken([[s * z0, hb + d - k], [s * (z1 - k), hb], [s * z1, hb], [s * z0, hb + d]], x, "z", 0.045));
      }
      if (p.trough) trog(hb);
    }
    // Wheel, axle and crank turn together about the axle
    const rad = t.moving("wheel", 0, A, 0), ri = 0.03, e = Math.min(0.006 + 0.02 * p.wear, T * 0.3);
    // Closed profile [r, x] around the wheel's section: hole, face, eased edge, running face, eased edge, face, hole
    const profil: [number, number][] = [[ri, 0], [ri, -T / 2], [R * 0.6, -T / 2], [R - e - 0.01, -T / 2]];
    const ecke = (cx: number, sgn: number, von: number) => { for (let i = 0; i <= 4; i++) { const w = ((von + (sgn * i) / 4) * Math.PI) / 2; profil.push([R - e + e * Math.cos(w), cx + e * Math.sin(w)]); } };
    ecke(-T / 2 + e, 1, -1);
    profil.push([R, 0]);
    ecke(T / 2 - e, 1, 0);
    profil.push([R - e - 0.01, T / 2], [R * 0.6, T / 2], [ri, T / 2], [ri, 0]);
    // Wear: the running face falls back by up to 1.5 cm in a few uneven waves around the wheel, from the seed
    const zufall = rng(seed), wellen = [1, 2, 3, 5].map((k) => ({ k, a: 0.3 + zufall(), ph: zufall() * Math.PI * 2 }));
    const summe = wellen.reduce((s, q) => s + q.a, 0);
    const delle = (w: number) => (p.wear * 0.015 * (1 + wellen.reduce((s, q) => s + q.a * Math.sin(q.k * w + q.ph), 0) / summe)) / 2;
    const n = profil.length - 1;
    rad.add(stein, grid(48, n, (u, v) => {
      const w = u * Math.PI * 2, k = Math.min(n - 1, Math.floor(v * n)), f = v * n - k;
      const r = profil[k][0] + (profil[k + 1][0] - profil[k][0]) * f, x = profil[k][1] + (profil[k + 1][1] - profil[k][1]) * f, lauf = Math.min(1, Math.max(0, (r - (R - 0.05)) / 0.05));
      const rr = r - delle(w) * lauf;
      return new Vector3(x, A + rr * Math.cos(w), rr * Math.sin(w));
    }, (q) => new Vector3(0, q.y - A, q.z)));
    // Axle: 5 cm past the -x side, through the wheel with an iron washer on each face, out to the crank on +x
    const ax0 = -(xo + 0.05), ax1 = xo + 0.04, xa = xo + 0.03;
    rad.add(eisen, turned([[0.001, 0], [0.024, 0], [0.024, 0.006], [0.02, 0.01], [0.02, ax1 - ax0 - 0.002], [0.001, ax1 - ax0]], 16).rotateZ(Math.PI / 2).translate(ax1, A, 0));
    for (const s of [-1, 1]) rad.add(eisen, turned([[0.02, 0], [0.05, 0], [0.05, 0.012], [0.02, 0.012]], 16).rotateZ(-Math.PI / 2).translate(s > 0 ? T / 2 : -T / 2 - 0.012, A, 0));
    // Crank: an arm 0.15 m at right angles to the axle and a turned handle 0.12 m along it
    rad.add(eisen, rounded(0.02, 0.19, 0.04, 0.004, xa, A + 0.075, 0, 1));
    rad.add(eisen, turned([[0.012, 0], [0.015, 0.02], [0.017, 0.07], [0.014, 0.11], [0.008, 0.12], [0.001, 0.122]], 12).rotateZ(-Math.PI / 2).translate(xa, A + 0.15, 0));
    return t.group();
  },
});
