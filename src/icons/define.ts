// An icon: id, category, texts, its own parameter schema, presets, and a build function that turns valid values into
// parts on the 24 × 24 grid (src/core/vector.ts). The pen is the same for every icon and not the build's job: stroke
// width, round or sharp corners, the style (outline, duotone, filled), the notification badge and the colour of the
// PNG files are shared parameters the contract adds, so every icon of the catalogue looks like one set. The build
// says what each shape is (an area, a line, a cut-out detail ...), the contract paints it for the chosen style.
// Pure TypeScript: no canvas, no DOM; the tests, the build and the gallery draw the same pixels.
import type { Pixels } from "../core/pixels";
import { withPreset, type Presets, type Schema, type Text, type Values } from "../core/params";
import { circle, GRID, rasterize, toSvg, type Op, type Pen, type Shape } from "../core/vector";

export type IconCategory = "navigation" | "actions" | "status" | "objects";
export const ICON_CATEGORIES: IconCategory[] = ["navigation", "actions", "status", "objects"];
export type IconStyle = "outline" | "duotone" | "filled";

export const STYLE = {
  stroke: { type: "number", min: 1, max: 2.25, step: 0.25, default: 2, label: { de: "Strichstärke", en: "Stroke" },
    describe: { de: "Strichbreite in Rasterpunkten (das Raster ist 24 breit): 1,5 wirkt fein, 2 ist üblich, 2,25 kräftig für kleine Größen und dunkle Hintergründe.", en: "Stroke width in grid units (the grid is 24 wide): 1.5 looks fine, 2 is usual, 2.25 bold for small sizes and dark backgrounds." } },
  corners: { type: "choice", options: ["round", "sharp"], default: "round", label: { de: "Ecken", en: "Corners" },
    labels: { round: { de: "Rund", en: "Round" }, sharp: { de: "Spitz", en: "Sharp" } },
    describe: { de: "Runde Enden und Ecken wirken freundlich, spitze sachlich und technisch.", en: "Round ends and corners feel friendly, sharp ones factual and technical." } },
  style: { type: "choice", options: ["outline", "duotone", "filled"], default: "outline", label: { de: "Stil", en: "Style" },
    labels: { outline: { de: "Umriss", en: "Outline" }, duotone: { de: "Zweiton", en: "Duotone" }, filled: { de: "Gefüllt", en: "Filled" } },
    describe: { de: "Umriss für Listen und Werkzeugleisten, gefüllt für den aktiven Reiter, Zweiton mit hellerer Fläche für Illustrationen.", en: "Outline for lists and toolbars, filled for the active tab, duotone with a lighter area for illustrations." } },
  badge: { type: "boolean", default: false, label: { de: "Hinweispunkt", en: "Badge" },
    describe: { de: "Ein Punkt oben rechts mit freiem Rand, etwa für ungelesene Nachrichten oder neue Einträge.", en: "A dot at the top right with a clear margin, for unread messages or new items." } },
  color: { type: "color", default: "#1f2328", label: { de: "Farbe (PNG)", en: "Colour (PNG)" },
    describe: { de: "Farbe der PNG-Dateien. Das SVG nimmt immer die Textfarbe um sich herum (currentColor).", en: "Colour of the PNG files. The SVG always takes the colour of the text around it (currentColor)." } },
} as const satisfies Schema;
export type StyleSchema = typeof STYLE;

/** What a shape is; the contract paints it for the style. */
export type Part =
  /** A closed shape (body of a house, a bell, a frame): outline stroked, duotone with a light fill, filled solid. */
  | { role: "area"; shape: Shape }
  /** Always a stroke (a handle, a slash, an open curve). */
  | { role: "line"; shape: Shape }
  /** Always filled (the dot of an i, a small knob). */
  | { role: "dot"; shape: Shape }
  /** Something inside an area (a door, a check mark): drawn on outline and duotone, cut out of a filled area. */
  | { role: "detail"; shape: Shape; fill: boolean }
  /** A hole through an area (the middle of a gear): stays empty in every style, its rim is a stroke. */
  | { role: "hole"; shape: Shape }
  /** A clear margin around a shape drawn after it (a slash, a person in front): erases `extra` grid units beyond its
   *  stroke, and its inside with `fill`. */
  | { role: "gap"; shape: Shape; extra: number; fill: boolean };
export const area = (shape: Shape): Part => ({ role: "area", shape });
export const stroke = (shape: Shape): Part => ({ role: "line", shape });
export const dot = (shape: Shape): Part => ({ role: "dot", shape });
export const detail = (shape: Shape, fill = false): Part => ({ role: "detail", shape, fill });
export const hole = (shape: Shape): Part => ({ role: "hole", shape });
export const gap = (shape: Shape, extra = 1.25, fill = false): Part => ({ role: "gap", shape, extra, fill });

export type Icon<S extends Schema = Schema> = {
  id: string; category: IconCategory; title: Text; description: Text;
  /** Its own parameters followed by the shared ones of the contract (STYLE). */
  params: S & StyleSchema;
  presets: Presets<S & StyleSchema>;
  build(p: Values<S & StyleSchema>, pen: Pen): Part[];
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyIcon = Icon<any>;
export const defineIcon = <const S extends Schema>(s: Omit<Icon<S>, "params"> & { params: S }): Icon<S> =>
  ({ ...s, params: { ...s.params, ...STYLE } as S & StyleSchema });
/** The icon's own parameters, without the shared ones. */
export const ownParams = (icon: AnyIcon) => Object.keys(icon.params).filter((k) => !(k in STYLE));

/** Where the badge sits, and its size. */
export const BADGE = { c: [19, 5] as const, r: 3, margin: 1.5 };
const TINT = 0.3;

/** The parts painted for a style, in order: ink and erase steps (src/core/vector.ts). */
export function paint(parts: readonly Part[], style: IconStyle, pen: Pen): Op[] {
  const ops: Op[] = [];
  for (const t of parts) {
    switch (t.role) {
      case "area":
        if (style === "duotone") ops.push({ shape: t.shape, paint: "fill", opacity: TINT });
        if (style === "filled") ops.push({ shape: t.shape, paint: "fill" });
        ops.push({ shape: t.shape, paint: "stroke" });
        break;
      case "line": ops.push({ shape: t.shape, paint: "stroke" }); break;
      case "dot": ops.push({ shape: t.shape, paint: "fill" }); break;
      case "detail": ops.push({ shape: t.shape, paint: t.fill ? "fill" : "stroke", erase: style === "filled" }); break;
      case "hole": ops.push({ shape: t.shape, paint: "fill", erase: true }, { shape: t.shape, paint: "stroke" }); break;
      case "gap":
        if (t.fill) ops.push({ shape: t.shape, paint: "fill", erase: true });
        if (t.extra > 0) ops.push({ shape: t.shape, paint: "stroke", erase: true, width: pen.width + 2 * t.extra });
        break;
    }
  }
  return ops;
}

export type MadeIcon = {
  icon: AnyIcon; values: Record<string, unknown>; pen: Pen; ops: Op[];
  /** SVG text, `currentColor`, `size` pixels wide (24 by default; it scales without loss). */
  svg(size?: number): string;
  /** Pixels at `size` × `size` in the colour of the `color` parameter (or another). */
  pixels(size: number, colour?: string): Pixels;
};

// A short, stable fingerprint of the drawing: mask ids of different drawings never collide on one page
function fingerprint(text: string): string {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(36);
}

/** Builds an icon from (partial, unchecked) values or a preset under `preset`, and paints it for its style. */
export function makeIcon(icon: AnyIcon, input: Record<string, unknown> = {}): MadeIcon {
  const values = withPreset(icon.params, icon.presets, input) as Values<StyleSchema> & Record<string, unknown>;
  const pen: Pen = { width: values.stroke, corners: values.corners };
  const parts = icon.build(values, pen);
  if (values.badge) parts.push(gap(circle(BADGE.c, BADGE.r + BADGE.margin), 0, true), dot(circle(BADGE.c, BADGE.r)));
  const ops = paint(parts, values.style, pen), id = `fw-${icon.id}-${fingerprint(JSON.stringify(ops) + JSON.stringify(pen))}`;
  return { icon, values, pen, ops, svg: (size = GRID) => toSvg(ops, pen, id, size), pixels: (size, colour = values.color) => rasterize(ops, pen, size, colour) };
}
