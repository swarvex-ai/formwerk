import { BufferGeometry, CylinderGeometry, Float32BufferAttribute } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const boat = defineAsset({
  id: "boat", category: "vehicles",
  title: { de: "Ruderboot", en: "Rowboat" },
  description: { de: "Ein offenes Ruderboot mit spitzem Bug, Spiegelheck, Ruderbänken und Riemen; Länge, Breite und Tiefe frei.", en: "An open rowboat with a pointed bow, a transom stern, thwarts and oars; length, beam and depth as you like." },
  params: {
    length: { type: "number", label: { de: "Länge", en: "Length" }, min: 2, max: 6, step: 0.05, default: 3.6, unit: "m",
      describe: { de: "Länge über alles: 2,5 m ein Beiboot, 3,6 m ein Ruderboot, 5,5 m ein Fischerboot.", en: "Length overall: 2.5 m a dinghy, 3.6 m a rowboat, 5.5 m a fishing boat." } },
    beam: { type: "number", label: { de: "Breite", en: "Beam" }, min: 0.8, max: 2, step: 0.01, default: 1.3, unit: "m",
      describe: { de: "Größte Breite: 1 m schlank, 1,3 m üblich, 1,8 m breit und stabil.", en: "Greatest width: 1 m slim, 1.3 m usual, 1.8 m wide and stable." } },
    depth: { type: "number", label: { de: "Tiefe", en: "Depth" }, min: 0.3, max: 0.8, step: 0.01, default: 0.45, unit: "m",
      describe: { de: "Höhe vom Kiel bis zur Bordkante mittschiffs: 0,35 m flach, 0,45 m üblich, 0,7 m hochbordig.", en: "Height from the keel to the gunwale amidships: 0.35 m low, 0.45 m usual, 0.7 m high-sided." } },
    seats: { type: "integer", label: { de: "Bänke", en: "Seats" }, min: 1, max: 3, default: 2,
      describe: { de: "Zahl der Ruderbänke quer im Boot.", en: "Number of thwarts across the boat." } },
    oars: { type: "boolean", label: { de: "Riemen", en: "Oars" }, default: true,
      describe: { de: "Zwei Riemen liegen im Boot.", en: "Two oars lie in the boat." } },
    color: { type: "color", label: { de: "Rumpf", en: "Hull" }, default: "#e9e4d8",
      describe: { de: "Farbe des Rumpfs.", en: "Colour of the hull." } },
    trim: { type: "color", label: { de: "Bordkante", en: "Gunwale" }, default: "#2f5d8a",
      describe: { de: "Farbe der Bordkante.", en: "Colour of the gunwale." } },
    wood: { type: "color", label: { de: "Holz", en: "Wood" }, default: "#a67a4c",
      describe: { de: "Farbe von Bänken und Riemen.", en: "Colour of the seats and oars." } },
  },
  presets: {
    rowboat: { label: { de: "Ruderboot", en: "Rowboat" }, values: { length: 3.6, beam: 1.3 } },
    dinghy: { label: { de: "Beiboot", en: "Dinghy" }, values: { length: 2.4, beam: 1.2, depth: 0.38, seats: 1, color: "#d9663b", trim: "#e9e4d8" } },
    "fishing-boat": { label: { de: "Fischerboot", en: "Fishing boat" }, values: { length: 5.4, beam: 1.8, depth: 0.7, seats: 3, color: "#3f6f7a", trim: "#c9a548" } },
  },
  physics: { body: "dynamic", collider: "hull" },
  budget: { triangles: 4000, drawCalls: 3 },
  build(p) {
    const rumpf = material("paint", p.color, 1, 160), kante = material("paint", p.trim, 1, 160), holz = material("wood", p.wood, 1, 450), t = new Parts();
    const L = p.length, B = p.beam, D = p.depth, dick = 0.03, N = 18, M = 10;
    // Half the beam along the boat (u 0 at the transom, 1 at the bow), the sheer rising to the bow, the keel rising at it
    const halb = (u: number) => (B / 2) * (u < 0.4 ? 0.62 + 0.38 * Math.sin((Math.PI / 2) * (u / 0.4)) : Math.cos((Math.PI / 2) * ((u - 0.4) / 0.6)) ** 0.75);
    const bord = (u: number) => D + 0.14 * u * u, kiel = (u: number) => 0.18 * D * Math.max(0, (u - 0.7) / 0.3) ** 2;
    const punkt = (u: number, v: number, innen: boolean): [number, number, number] => {
      // v from −1 (port gunwale) over 0 (keel) to 1 (starboard): a rounded U
      const b = Math.max(0, halb(u) - (innen ? dick : 0)), k = kiel(u) + (innen ? dick : 0), phi = (v * Math.PI) / 2;
      return [b * Math.sin(phi), k + (bord(u) - k) * (1 - Math.cos(phi)) ** 0.8, -L / 2 + u * L];
    };
    const flaechen: number[] = [], uv: number[] = [], rand: number[] = [], randUv: number[] = [];
    const drei = (ziel: number[], ziel2: number[], a: number[], b: number[], c: number[]) => { ziel.push(...a, ...b, ...c); ziel2.push(0, 0, 1, 0, 0, 1); };
    for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) {
      const u0 = i / N, u1 = (i + 1) / N, v0 = -1 + (2 * j) / M, v1 = -1 + (2 * (j + 1)) / M;
      for (const innen of [false, true]) {
        const a = punkt(u0, v0, innen), b = punkt(u1, v0, innen), c = punkt(u1, v1, innen), d = punkt(u0, v1, innen);
        // Outside faces outwards, inside faces into the boat
        if (innen) { drei(flaechen, uv, a, c, b); drei(flaechen, uv, a, d, c); } else { drei(flaechen, uv, a, b, c); drei(flaechen, uv, a, c, d); }
      }
    }
    // The gunwale: a strip joining outside and inside along both sides, in the trim colour
    for (let i = 0; i < N; i++) for (const v of [-1, 1]) {
      const u0 = i / N, u1 = (i + 1) / N, a = punkt(u0, v, false), b = punkt(u1, v, false), c = punkt(u1, v, true), d = punkt(u0, v, true);
      if (v < 0) { drei(rand, randUv, a, c, b); drei(rand, randUv, a, d, c); } else { drei(rand, randUv, a, b, c); drei(rand, randUv, a, c, d); }
    }
    // The transom: the outside section at the stern, closed, facing back
    const mitte = [0, bord(0), -L / 2];
    for (let j = 0; j < M; j++) drei(flaechen, uv, mitte, punkt(0, -1 + (2 * (j + 1)) / M, false), punkt(0, -1 + (2 * j) / M, false));
    for (const [pos, tex, m] of [[flaechen, uv, rumpf], [rand, randUv, kante]] as const) {
      const g = new BufferGeometry();
      g.setAttribute("position", new Float32BufferAttribute(pos, 3));
      g.setAttribute("uv", new Float32BufferAttribute(tex, 2));
      g.computeVertexNormals();
      t.add(m, g);
    }
    // Thwarts across, just below the gunwale, and oars lying along the boat
    for (let k = 0; k < p.seats; k++) {
      const u = 0.25 + (0.45 * (k + 0.5)) / p.seats, b = 2 * (halb(u) - dick) * 0.98;
      t.box(holz, b, 0.03, 0.22, 0, bord(u) - 0.12, -L / 2 + u * L);
    }
    if (p.oars) for (const sx of [-1, 1]) {
      const lang = Math.min(L * 0.75, 2.6), x = sx * Math.min(B * 0.22, 0.3), y = bord(0.5) - 0.12 + 0.045;
      t.add(holz, new CylinderGeometry(0.02, 0.02, lang, 6).rotateX(Math.PI / 2).translate(x, y, 0.05));
      t.box(holz, 0.12, 0.012, 0.45, x, y, 0.05 + lang / 2 - 0.2);
    }
    return t.group();
  },
});
