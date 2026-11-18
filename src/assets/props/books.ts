import { ExtrudeGeometry, Matrix4, Shape, Vector3 } from "three";
import { rng } from "../../core/rng";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { grid, rounded } from "../shapes";

export const books = defineAsset({
  id: "books", category: "props",
  title: { de: "Bücher", en: "Books" },
  description: { de: "Ein paar Bücher, flach gestapelt auf einem Tisch oder aufrecht in einer Reihe im Regal; das letzte Buch der Reihe lehnt sich an.", en: "A few books, lying in a stack on a desk or standing in a row on a shelf; the last book of a row leans against its neighbour." },
  params: {
    count: { type: "integer", label: { de: "Anzahl", en: "Count" }, min: 1, max: 8, default: 4,
      describe: { de: "Anzahl der Bücher: 1 ein Wälzer, 4 ein Stapel, 8 ein ganzes Regalbrett.", en: "Number of books: 1 a single tome, 4 a stack, 8 a whole shelf." } },
    layout: { type: "choice", label: { de: "Anordnung", en: "Layout" }, options: ["stack", "row"], labels: { stack: { de: "Stapel", en: "Stack" }, row: { de: "Reihe", en: "Row" } }, default: "stack",
      describe: { de: "Stapel: flach aufeinander, das größte unten; Reihe: aufrecht nebeneinander, Rücken nach +z.", en: "Stack: lying flat on top of each other, the biggest at the bottom; row: standing side by side, spines facing +z." } },
    size: { type: "number", label: { de: "Größe", en: "Size" }, min: 0.15, max: 0.35, step: 0.01, default: 0.24, unit: "m",
      describe: { de: "Seitenhöhe eines Buchs: 0,18 m Taschenbuch, 0,24 m Roman, 0,34 m Folioband; die Breite ist 0,7 × Größe.", en: "Page height of a book: 0.18 m paperback, 0.24 m novel, 0.34 m folio; the width is 0.7 × size." } },
    thickness: { type: "number", label: { de: "Dicke", en: "Thickness" }, min: 0.015, max: 0.08, step: 0.001, default: 0.035, unit: "m",
      describe: { de: "Dicke des Rückens: 0,02 m ein Heft, 0,035 m ein Roman, 0,08 m ein dicker Wälzer.", en: "Thickness of the spine: 0.02 m a booklet, 0.035 m a novel, 0.08 m a heavy tome." } },
    lean: { type: "number", label: { de: "Neigung", en: "Lean" }, min: 0, max: 25, step: 1, default: 10, unit: "°",
      describe: { de: "In einer Reihe lehnt sich das letzte Buch (auf +x) an seinen Nachbarn: 0° aufrecht, 12° im Regal, 25° fast umgefallen; beim Stapel ohne Wirkung.", en: "In a row the last book (on +x) leans against its neighbour: 0° upright, 12° on a shelf, 25° nearly fallen; no effect on a stack." } },
    coverColour: { type: "color", label: { de: "Einband", en: "Cover" }, default: "#7a2a22",
      describe: { de: "Farbe des Einbands: Weinrot #7a2a22, Leder #3a2a1a.", en: "Colour of the cover: wine red #7a2a22, leather #3a2a1a." } },
    secondColour: { type: "color", label: { de: "Zweiter Einband", en: "Second cover" }, default: "#2a4a3a",
      describe: { de: "Farbe jedes zweiten Buchs: Tannengrün #2a4a3a, Marineblau #223355.", en: "Colour of every second book: fir green #2a4a3a, navy #223355." } },
    pageColour: { type: "color", label: { de: "Seiten", en: "Pages" }, default: "#e8dfc8",
      describe: { de: "Farbe der Seitenkanten: Creme #e8dfc8, Weiß #f4f1e8, vergilbt #cdb98f.", en: "Colour of the page edges: cream #e8dfc8, white #f4f1e8, yellowed #cdb98f." } },
  },
  presets: {
    "desk-stack": { label: { de: "Stapel auf dem Tisch", en: "Desk stack" }, values: { layout: "stack", count: 4 } },
    "shelf-row": { label: { de: "Reihe im Regal", en: "Shelf row" }, values: { layout: "row", count: 6, lean: 12 } },
    tome: { label: { de: "Wälzer", en: "Tome" }, values: { count: 1, size: 0.34, thickness: 0.08, coverColour: "#3a2a1a" } },
  },
  physics: { body: "dynamic", collider: "box" },
  budget: { triangles: 6100, drawCalls: 3 },
  build(p, seed) {
    const r = rng(seed), t = new Parts();
    const covers = [material("paint", p.coverColour), material("paint", p.secondColour)], pages = material("paint", p.pageColour);
    const vary = () => 1 + (r() * 2 - 1) * 0.12;
    const list = Array.from({ length: p.count }, () => {
      const H = p.size * vary();
      return { H, T: p.thickness * vary(), W: 0.7 * H };
    });
    // A book in its own frame: thickness along x from 0, height along y from 0, width along z, spine at +z.
    // Two boards with eased edges, 3 mm larger than the page block (the squares), a round spine between them that
    // bulges out on +z, and the page block with a rounded back, 1 mm clear of boards and spine (no shared faces).
    const book = (b: (typeof list)[number], i: number, m: Matrix4) => {
      const { H, T, W } = b, cover = covers[i % 2], f = 0.0025, sq = 0.003, gap = 0.001, n = 12;
      const d = Math.max(0.006, 0.3 * T), zs = W / 2 - d;
      for (const x of [f / 2, T - f / 2]) t.add(cover, rounded(f, H, zs + 0.001 + W / 2, 0.001, x, H / 2, (zs + 0.001 - W / 2) / 2).applyMatrix4(m));
      // Spine: a shell f thick on a half ellipse across the thickness, closed inside and at both ends
      const arc = (s: number, u: number, y: number) => {
        const a = Math.PI * u;
        return new Vector3(T / 2 - (T / 2 - s) * Math.cos(a), y, zs + (d - s) * Math.sin(a));
      };
      const out = (q: Vector3) => new Vector3(q.x - T / 2, 0, q.z - zs);
      t.add(cover, grid(n, 1, (u, v) => arc(0, u, v * H), out).applyMatrix4(m));
      t.add(cover, grid(n, 1, (u, v) => arc(f, u, v * H), (q) => out(q).negate()).applyMatrix4(m));
      for (const y of [0, H]) t.add(cover, grid(n, 1, (u, v) => arc(f * v, u, y), () => new Vector3(0, y ? 1 : -1, 0)).applyMatrix4(m));
      // Its edges against the boards, so the joint behind their eased ends stays closed
      for (const u of [0, 1]) t.add(cover, grid(1, 1, (s, v) => arc(f * s, u, v * H), () => new Vector3(0, 0, -1)).applyMatrix4(m));
      // Page block: its cross-section in x/z (shape y = -z), extruded upwards
      const x0 = f + gap, x1 = T - f - gap, s = new Shape();
      s.moveTo(x0, W / 2 - sq);
      for (let k = 0; k <= n; k++) {
        const a = (Math.PI * k) / n;
        s.lineTo((x0 + x1) / 2 - ((x1 - x0) / 2) * Math.cos(a), -(zs + (d - f - gap) * Math.sin(a)));
      }
      s.lineTo(x1, W / 2 - sq);
      t.add(pages, new ExtrudeGeometry(s, { depth: H - 2 * sq, bevelEnabled: false, curveSegments: 1 }).rotateX(-Math.PI / 2).translate(0, sq, 0).applyMatrix4(m));
    };
    if (p.layout === "stack") {
      list.sort((a, c) => c.H - a.H);
      let y = 0;
      list.forEach((b, i) => {
        const dx = (r() * 2 - 1) * 0.015, dz = (r() * 2 - 1) * 0.015, ang = (r() * 2 - 1) * (8 * Math.PI) / 180;
        const m = new Matrix4().makeTranslation(dx, y + b.T / 2, dz).multiply(new Matrix4().makeRotationY(ang))
          .multiply(new Matrix4().makeRotationZ(Math.PI / 2)).multiply(new Matrix4().makeTranslation(-b.T / 2, -b.H / 2, 0));
        book(b, i, m);
        y += b.T;
      });
    } else {
      let x = -list.reduce((s, b) => s + b.T, 0) / 2;
      list.forEach((b, i) => {
        if (i === list.length - 1 && i > 0 && p.lean > 0) {
          // Turned about z so the top points towards -x; its lowest corner is the inner bottom one, its top touches the neighbour
          const a = (p.lean * Math.PI) / 180;
          book(b, i, new Matrix4().makeTranslation(x + b.H * Math.sin(a), 0, 0).multiply(new Matrix4().makeRotationZ(a)));
        } else book(b, i, new Matrix4().makeTranslation(x, 0, 0));
        x += b.T;
      });
    }
    return t.group();
  },
});
