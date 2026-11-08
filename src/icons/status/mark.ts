import { arc, circle, inkBox, line, polygon, rect, reach, type Pt } from "../../core/vector";
import { area, defineIcon, detail, dot, stroke, type Part } from "../define";

type Symbol = "check" | "cross" | "plus" | "minus" | "exclamation" | "info" | "question";

// Every symbol around its centre, `halb` grid units to each side. Check, cross, plus and minus scale with the room;
// !, i and ? are laid out in grid units: their dot is a little wider than the stroke and keeps a clear gap to the line,
// so it never merges with it at 24 px.
type Zeichnung = { lines: Pt[][]; dots: Pt[]; arcs: { c: Pt; r: number; from: number; to: number }[] };
function zeichen(s: Symbol, halb: number, hw: number, eng: boolean, spitz: boolean): Zeichnung {
  const k = (pts: [number, number][]): Pt[] => pts.map(([x, y]) => [x * halb, y * halb]);
  const rd = eng ? hw : hw * 1.1, luecke = eng ? 1 : Math.max(1, hw * 0.9), punktY = halb - rd, stielBis = punktY - rd - luecke - hw;
  switch (s) {
    case "check": return { lines: [k([[-0.78, 0.04], [-0.26, 0.58], [0.8, -0.56]])], dots: [], arcs: [] };
    case "cross": return { lines: [k([[-0.68, -0.68], [0.68, 0.68]]), k([[0.68, -0.68], [-0.68, 0.68]])], dots: [], arcs: [] };
    case "plus": return { lines: [k([[-0.85, 0], [0.85, 0]]), k([[0, -0.85], [0, 0.85]])], dots: [], arcs: [] };
    case "minus": return { lines: [k([[-0.85, 0], [0.85, 0]])], dots: [], arcs: [] };
    case "exclamation": return { lines: [[[0, -halb + hw], [0, Math.max(-halb + hw, stielBis)]]], dots: [[0, punktY]], arcs: [] };
    case "info": return { lines: [[[0, Math.min(halb - hw, -halb + 2 * rd + luecke + hw)], [0, halb - hw]]], dots: [[0, -halb + rd]], arcs: [] };
    case "question": {
      // The hook as large as the room leaves above the stem, at least with an open middle
      const r = Math.max(hw + 1, Math.min(halb * 0.62, (stielBis + halb - hw) / 1.9)), my = -halb + hw + r;
      const start = spitz ? 316 : 300, haken = Array.from({ length: 21 }, (_, i): Pt => { const g = ((start + (i * (480 - start)) / 20) * Math.PI) / 180; return [r * Math.sin(g), my - r * Math.cos(g)]; });
      const knick: Pt = [r * 0.12, Math.min(stielBis, my + r + 0.2)];
      return { lines: [[...haken, knick, [0, Math.max(knick[1], stielBis)]]], dots: [[0, punktY]], arcs: [] };
    }
  }
}

export const mark = defineIcon({
  id: "mark", category: "status",
  title: { de: "Zeichen", en: "Mark" },
  description: {
    de: "Häkchen, Kreuz, Plus, Minus, Ausrufezeichen, Info und Fragezeichen, frei oder in Kreis, Quadrat oder Dreieck: Erfolg, Fehler, Warnung und Hilfe.",
    en: "Check, cross, plus, minus, exclamation, info and question mark, free or in a circle, square or triangle: success, error, warning and help.",
  },
  params: {
    symbol: { type: "choice", options: ["check", "cross", "plus", "minus", "exclamation", "info", "question"], default: "check", label: { de: "Zeichen", en: "Symbol" },
      labels: { check: { de: "Häkchen", en: "Check" }, cross: { de: "Kreuz", en: "Cross" }, plus: { de: "Plus", en: "Plus" }, minus: { de: "Minus", en: "Minus" },
        exclamation: { de: "Ausrufezeichen", en: "Exclamation" }, info: { de: "Info", en: "Info" }, question: { de: "Fragezeichen", en: "Question" } },
      describe: { de: "Häkchen für Erfolg, Kreuz für Fehler und Schließen, Ausrufezeichen für Warnungen, Info für Hinweise, Fragezeichen für Hilfe.", en: "Check for success, cross for errors and close, exclamation for warnings, info for notes, question mark for help." } },
    frame: { type: "choice", options: ["none", "circle", "square", "triangle"], default: "circle", label: { de: "Rahmen", en: "Frame" },
      labels: { none: { de: "Ohne", en: "None" }, circle: { de: "Kreis", en: "Circle" }, square: { de: "Quadrat", en: "Square" }, triangle: { de: "Dreieck", en: "Triangle" } },
      describe: { de: "Kreis für Status, Quadrat für Kästchen und Knöpfe, Dreieck für Warnungen (ein Fragezeichen steht dort im Kreis), ohne für Werkzeugleisten.", en: "Circle for status, square for boxes and buttons, triangle for warnings (a question mark stands in a circle there), none for toolbars." } },
    size: { type: "number", min: 0.6, max: 1, step: 0.05, default: 0.85, label: { de: "Größe", en: "Size" },
      describe: { de: "Größe des Zeichens im Rahmen: 0,7 mit viel Luft, 0,85 üblich, 1 so groß wie möglich.", en: "Size of the symbol in its frame: 0.7 with plenty of room, 0.85 usual, 1 as large as it fits." } },
  },
  presets: {
    success: { label: { de: "Erfolg", en: "Success" }, values: { symbol: "check", frame: "circle" } },
    error: { label: { de: "Fehler", en: "Error" }, values: { symbol: "cross", frame: "circle" } },
    warning: { label: { de: "Warnung", en: "Warning" }, values: { symbol: "exclamation", frame: "triangle" } },
    info: { label: { de: "Info", en: "Info" }, values: { symbol: "info", frame: "circle" } },
    help: { label: { de: "Hilfe", en: "Help" }, values: { symbol: "question", frame: "circle" } },
    add: { label: { de: "Hinzufügen", en: "Add" }, values: { symbol: "plus", frame: "none", size: 1 } },
  },
  build(p, pen) {
    // A question mark needs the room of its hook: in a triangle it stands in a circle instead
    const frame = p.frame === "triangle" && p.symbol === "question" ? "circle" : p.frame;
    // Upright symbols (!, i, ?) may use the full height of the room, the others a square in it; upright ones keep
    // a narrower margin to the frame, they touch it only with their ends
    const hoch = p.symbol === "exclamation" || p.symbol === "info" || p.symbol === "question";
    const hw = pen.width / 2, luft = hoch ? 1.25 : Math.max(1.5, pen.width * 0.75);
    const teile: Part[] = [];
    let mitte: Pt = [12, 12], halb: number;
    if (frame === "circle") {
      const r = 12 - Math.max(2, 1 + hw);
      teile.push(area(circle(mitte, r)));
      // The hook of the question mark is wide near the top, where the circle narrows
      halb = (r - hw - luft - hw) / (p.symbol === "question" ? 1.2 : hoch ? 1.08 : Math.SQRT2);
    } else if (frame === "square") {
      const m = Math.max(2, 1 + reach(pen, 90));
      teile.push(area(rect(m, m, 24 - 2 * m, 24 - 2 * m, 4)));
      halb = 12 - m - hw - luft - hw;
    } else if (frame === "triangle") {
      // As large as the live area allows with the real reach of the stroke at the corners (miter tips when sharp)
      // Sharp corners get a blunt tip (0.8 wide, invisible at 24 px): its miter reaches far less above the apex
      const stumpf = pen.corners === "sharp" ? 0.4 : 0;
      const dreieck = (k: number): Pt[] => [...(stumpf ? [[12 - stumpf, 12 - 10 * k], [12 + stumpf, 12 - 10 * k]] as Pt[] : [[12, 12 - 10 * k]] as Pt[]), [12 + 10.5 * k, 12 + 10 * k], [12 - 10.5 * k, 12 + 10 * k]];
      let k = 1;
      for (let s = 0.5, schritt = 0.25; schritt > 0.001; schritt /= 2) {
        const [x0, y0, x1, y1] = inkBox(polygon(...dreieck(s)) as Parameters<typeof inkBox>[0], pen);
        if (x0 >= 1 && y0 >= 1 && x1 <= 23 && y1 <= 23 - (y0 - 1)) { k = s; s += schritt; } else s -= schritt;
      }
      const roh = dreieck(k), [, y0, , y1] = inkBox(polygon(...roh) as Parameters<typeof inkBox>[0], pen), dy = 12 - (y0 + y1) / 2;
      const ecken = roh.map(([x, y]): Pt => [x, y + dy]), a: Pt = [12, ecken[0][1]], b = ecken[ecken.length - 2], c = ecken[ecken.length - 1], top = a[1], basis = b[1], links = c[0];
      teile.push(area(polygon(...ecken)));
      const innenUnten = basis - hw - (hoch && p.symbol !== "question" ? 1 : luft) - hw;
      if (hoch && p.symbol !== "question") {
        // From where the slopes leave room for the stroke beside them down to the base; the triangle is tight, so
        // the margins are one grid unit and the dot as wide as the stroke
        const schraeg = (basis - top) / (12 - links), oben = top + (2 * hw + 1) * Math.hypot(1, schraeg);
        mitte = [12, (oben + innenUnten) / 2];
        halb = (innenUnten - oben) / 2;
      } else {
        // The symbol sits in the inscribed circle
        const ab = Math.hypot(b[0] - a[0], b[1] - a[1]), bc = b[0] - c[0], flaeche = (bc * (basis - top)) / 2, rho = (2 * flaeche) / (2 * ab + bc);
        mitte = [12, basis - rho];
        halb = (rho - hw - luft - hw) * 0.9;
      }
    } else halb = 12 - Math.max(2, 1 + reach(pen, 90)) - hw;
    // Smaller only as far as an upright symbol still has a stem between its line and its dot
    const eng = hoch && frame === "triangle" && p.symbol !== "question";
    const mindestens = hoch ? Math.min(halb, ((eng ? 2 : 2.2) * hw + (eng ? 1 : Math.max(1, hw * 0.9)) + 2 * hw + (p.symbol === "question" ? 4 : 1.5)) / 2) : 1.5;
    halb = Math.max(mindestens, halb * p.size);
    // A square cap reaches further: with sharp corners the hook of the question mark starts a little later
    const z = zeichen(p.symbol as Symbol, halb, hw, eng, pen.corners === "sharp"), auf = (q: Pt): Pt => [mitte[0] + q[0], mitte[1] + q[1]];
    const innen = frame !== "none";
    for (const l of z.lines) { const s = line(...l.map(auf)); teile.push(innen ? detail(s) : stroke(s)); }
    for (const b of z.arcs) { const s = arc(auf(b.c), b.r, b.from, b.to); teile.push(innen ? detail(s) : stroke(s)); }
    for (const d of z.dots) { const s = circle(auf(d), eng ? hw : hw * 1.1); teile.push(innen ? detail(s, true) : dot(s)); }
    return teile;
  },
});
