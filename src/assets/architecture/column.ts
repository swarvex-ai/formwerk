import { Vector3, type BufferGeometry } from "three";
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { grid, rounded, turned } from "../shapes";

export const column = defineAsset({
  id: "column", category: "architecture",
  title: { de: "Säule", en: "Column" },
  description: { de: "Säule mit Kanneluren, Verjüngung, Basis und Kapitell.", en: "A column with flutes, taper, base and capital." },
  params: {
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 1, max: 8, step: 0.1, default: 3, unit: "m",
      describe: { de: "Gesamthöhe mit Basis und Kapitell.", en: "Total height including base and capital." } },
    radius: { type: "number", label: { de: "Radius", en: "Radius" }, min: 0.1, max: 0.6, step: 0.01, default: 0.25, unit: "m",
      describe: { de: "Radius des Schafts unten.", en: "Radius of the shaft at the bottom." } },
    flutes: { type: "integer", label: { de: "Kanneluren", en: "Flutes" }, min: 0, max: 32, default: 16,
      describe: { de: "Senkrechte Rillen im Schaft; 0 macht ihn glatt, klassisch sind 20 bis 24.", en: "Vertical grooves in the shaft; 0 makes it smooth, 20 to 24 is classical." } },
    taper: { type: "number", label: { de: "Verjüngung", en: "Taper" }, min: 0, max: 0.3, step: 0.01, default: 0.12,
      describe: { de: "Wie stark der Schaft nach oben schmaler wird, als Anteil des Radius.", en: "How much the shaft narrows towards the top, as a fraction of the radius." } },
    base: { type: "boolean", label: { de: "Basis", en: "Base" }, default: true,
      describe: { de: "Profilierter Sockel unten.", en: "A moulded base at the bottom." } },
    capital: { type: "choice", label: { de: "Kapitell", en: "Capital" }, options: ["none", "plain", "round"], labels: { none: { de: "keins", en: "none" }, plain: { de: "Platte", en: "slab" }, round: { de: "Wulst", en: "torus" } }, default: "round",
      describe: { de: "Abschluss oben: keiner, eine Platte oder ein Wulst mit Platte.", en: "The top: none, a slab, or a torus with a slab." } },
    material: { type: "choice", label: { de: "Material", en: "Material" }, options: ["stone", "paint", "metal"], labels: { stone: { de: "Stein", en: "Stone" }, paint: { de: "lackiert", en: "Painted" }, metal: { de: "Metall", en: "Metal" } }, default: "stone",
      describe: { de: "Stein mit Struktur, lackiert oder Metall.", en: "Textured stone, painted or metal." } },
    color: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#d8d2c4",
      describe: { de: "Grundfarbe des Materials.", en: "Base colour of the material." } },
  },
  presets: {
    doric: { label: { de: "Dorisch", en: "Doric" }, values: { height: 4, flutes: 20, base: false, capital: "plain" } },
    temple: { label: { de: "Tempelsäule", en: "Temple column" }, values: { height: 6, radius: 0.45, flutes: 24 } },
    "modern-pillar": { label: { de: "Moderner Pfeiler", en: "Modern pillar" }, values: { flutes: 0, taper: 0, base: false, capital: "none", material: "paint", color: "#e9e6df" } },
  },
  physics: { body: "static", collider: "hull" },
  budget: { triangles: 20000, drawCalls: 1 },
  build(p) {
    const m = material(p.material, p.color, 0.6);
    const t = new Parts();
    const r = p.radius, unten = p.base ? r * 0.35 : 0, oben = p.capital === "none" ? 0 : r * 0.4;
    const schaft = p.height - unten - oben, rOben = r * (1 - p.taper), segmente = p.flutes ? p.flutes * 6 : 32;
    // Schaft mit Entasis: linear verjüngt plus eine sanfte Schwellung, die an beiden Enden 0 ist
    const radius = (y: number) => { const s = Math.min(Math.max(y, 0), schaft); return r + ((rOben - r) * s) / schaft + 0.012 * r * Math.sin((Math.PI * s) / schaft); };
    // Die Kanneluren laufen über die letzten 0,25 r aus (gerundetes Ende), davor bleibt ein glatter Ring
    const L = 0.25 * r, glatt = (a: number, b: number, x: number) => { const k = Math.min(Math.max((x - a) / (b - a), 0), 1); return k * k * (3 - 2 * k); };
    const tiefe = (y: number) => glatt(0.08 * r, L, y) * glatt(0.08 * r, L, schaft - y);
    // Zeilen [Radius, y ab der Schaftunterkante, Kannelurtiefe 0–1] von unten nach oben
    const zeilen: [number, number, number][] = [];
    const strecke = (a: number, b: number, n: number, ab = 0) => { for (let k = ab; k <= n; k++) { const y = a + ((b - a) * k) / n; zeilen.push([radius(y), y, tiefe(y)]); } };
    // Mit Basis steckt der Schaft 0,015 r in ihrem Plättchen, ohne steht er geschlossen auf dem Boden
    zeilen.push(p.base ? [r, -0.015 * r, 0] : [0, 0, 0]);
    const kante = 0.004, ende = p.capital === "none" ? schaft - kante : schaft;
    strecke(0, L, 6);
    strecke(L, ende - L, 24, 1);
    strecke(ende - L, ende, 6, 1);
    // Ohne Kapitell endet der Schaft in einer 4-mm-Rundung, geschlossen zur Achse; sonst steckt er im Halsring
    if (p.capital === "none") {
      for (let k = 1; k <= 3; k++) { const w = (k * Math.PI) / 6; zeilen.push([rOben - kante + kante * Math.cos(w), ende + kante * Math.sin(w), 0]); }
      zeilen.push([0, schaft, 0]);
    } else zeilen.push([rOben, schaft + 0.03 * r, 0]);
    const kehle = r * Math.min(0.09, 1.4 / Math.max(p.flutes, 1)), nv = zeilen.length - 1;
    const g: BufferGeometry = grid(segmente, nv, (u, v) => {
      const j = Math.min(Math.floor(v * nv), nv - 1), f = v * nv - j, a = zeilen[j], b = zeilen[j + 1];
      const s = (u * p.flutes) % 1, rinne = p.flutes ? kehle * Math.sqrt(Math.max(0, 1 - (2 * s - 1) ** 2)) : 0;
      const rr = Math.max(0, a[0] + (b[0] - a[0]) * f - rinne * (a[2] + (b[2] - a[2]) * f)), w = u * Math.PI * 2;
      return new Vector3(rr * Math.cos(w), unten + a[1] + (b[1] - a[1]) * f, rr * Math.sin(w));
    }, (q) => new Vector3(q.x, 0, q.z));
    // Scharf an den Stegen zwischen den Kanneluren, glatt um den Schaft und über die Naht des Gitters
    t.add(m, toCreasedNormals(g, (40 * Math.PI) / 180));
    // Bögen als Profilpunkte [Radius, y]; ein doppelter Punkt ist eine scharfe Kante
    const bogen = (cx: number, cy: number, rad: number, von: number, bis: number, k: number) => Array.from({ length: k + 1 }, (_, i): [number, number] => { const w = ((von + ((bis - von) * i) / k) * Math.PI) / 180; return [cx + rad * Math.cos(w), cy + rad * Math.sin(w)]; });
    if (p.base) {
      // Attische Basis auf der Plinthe: unterer Wulst, Kehle (Trochilus), oberer Wulst, Plättchen zum Schaft
      const yp = 0.12 * r;
      t.add(m, rounded(2.7 * r, yp, 2.7 * r, 0.005, 0, yp / 2, 0));
      const kehlung = Array.from({ length: 7 }, (_, k): [number, number] => { const w = (k * Math.PI) / 6; return [r * (1.2 - (0.08 * k) / 6 - 0.08 * Math.sin(w)), yp + r * (0.09 + 0.03 * (1 - Math.cos(w)))]; });
      t.add(m, turned([
        [1.2 * r, yp - 0.02 * r],
        ...bogen(1.26 * r, yp + 0.04 * r, 0.04 * r, -90, 90, 6),
        [1.2 * r, yp + 0.08 * r], [1.2 * r, yp + 0.08 * r],
        ...kehlung, [1.12 * r, yp + 0.15 * r],
        ...bogen(1.12 * r, yp + 0.185 * r, 0.025 * r, -90, 90, 6),
        [1.03 * r, yp + 0.21 * r], [1.03 * r, yp + 0.21 * r],
        [1.03 * r, yp + 0.22 * r], [r, unten], [r, unten], [0, unten],
      ], 32));
    }
    if (p.capital !== "none") {
      // Halsring: ein kleiner Wulst um das obere Schaftende
      const y0 = p.height - oben, y1 = y0 + 0.08 * r;
      const hals: [number, number][] = [[rOben, y0], ...bogen(rOben, y0 + 0.04 * r, 0.04 * r, -90, 90, 6), [rOben, y1]];
      if (p.capital === "plain") {
        // Dorisch: der Echinus lädt konvex bis 1,25 r aus und steckt oben im Abakus
        const abakus = 0.14 * r, h = p.height - abakus - y1;
        const echinus = Array.from({ length: 7 }, (_, k): [number, number] => [rOben + (1.25 * r - rOben) * (1 - (1 - k / 6) ** 2), y1 + (h * k) / 6]);
        t.add(m, turned([...hals, ...echinus, [1.25 * r, p.height - abakus + 0.02 * r], [0, p.height - abakus + 0.02 * r]], 32));
        t.add(m, rounded(2.6 * r, abakus, 2.6 * r, 0.005, 0, p.height - abakus / 2, 0));
      } else {
        // Wulst: konvex bis 1,4 r, senkrechter Rand, gerundete Oberkante
        const e = 0.03 * r, h = y0 + 0.6 * oben - y1;
        const wulst = Array.from({ length: 7 }, (_, k): [number, number] => { const w = (k * Math.PI) / 12; return [rOben + (1.4 * r - rOben) * Math.sin(w), y1 + h * (1 - Math.cos(w))]; });
        t.add(m, turned([...hals, ...wulst, ...bogen(1.4 * r - e, p.height - e, e, 0, 90, 3), [0, p.height]], 32));
      }
    }
    return t.group();
  },
});
