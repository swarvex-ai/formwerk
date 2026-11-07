// Parameters: every asset describes its controls as a schema. The gallery controls, the code snippet, the share link
// and the tests (defaults, extremes, random values) all come from it. Pure TypeScript: no three.js, no DOM.
export type Text = { de: string; en: string };
export type NumberParam = { type: "number"; label: Text; min: number; max: number; step: number; default: number; unit?: "m" | "°" };
export type IntegerParam = { type: "integer"; label: Text; min: number; max: number; default: number };
export type ChoiceParam<O extends string = string> = { type: "choice"; label: Text; options: readonly O[]; labels?: Record<O, Text>; default: O };
export type ColorParam = { type: "color"; label: Text; default: string };
export type BooleanParam = { type: "boolean"; label: Text; default: boolean };
export type Param = NumberParam | IntegerParam | ChoiceParam | ColorParam | BooleanParam;
export type Schema = Record<string, Param>;
export type Values<S extends Schema> = {
  [K in keyof S]: S[K] extends ChoiceParam<infer O> ? O : S[K] extends ColorParam ? string : S[K] extends BooleanParam ? boolean : number;
};

const FARBE = /^#[0-9a-f]{6}$/;

/** The default values of a schema. */
export function defaults<S extends Schema>(s: S): Values<S> {
  return Object.fromEntries(Object.entries(s).map(([k, p]) => [k, p.default])) as Values<S>;
}

/** Takes any input (URL, JSON, a user) and returns valid values: unknown keys dropped, numbers clamped and stepped. */
export function clean<S extends Schema>(s: S, input: Record<string, unknown> = {}): Values<S> {
  const out: Record<string, unknown> = {};
  for (const [k, p] of Object.entries(s)) {
    const v = input[k];
    switch (p.type) {
      case "number": {
        const n = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN;
        out[k] = Number.isFinite(n) ? Math.min(p.max, Math.max(p.min, Math.round(n / p.step) * p.step)) : p.default;
        out[k] = Number((out[k] as number).toFixed(6));
        break;
      }
      case "integer": {
        const n = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN;
        out[k] = Number.isFinite(n) ? Math.min(p.max, Math.max(p.min, Math.round(n))) : p.default;
        break;
      }
      case "choice": out[k] = typeof v === "string" && p.options.includes(v) ? v : p.default; break;
      case "color": out[k] = typeof v === "string" && FARBE.test(v.toLowerCase()) ? v.toLowerCase() : p.default; break;
      case "boolean": out[k] = typeof v === "boolean" ? v : v === "true" || v === "1" ? true : v === "false" || v === "0" ? false : p.default; break;
    }
  }
  return out as Values<S>;
}

/** Values the tests try: defaults, every number at its minimum and maximum, every option of every choice. */
export function extremes<S extends Schema>(s: S): Values<S>[] {
  const basis = defaults(s);
  const faelle: Values<S>[] = [basis];
  const alleMin = { ...basis } as Record<string, unknown>, alleMax = { ...basis } as Record<string, unknown>;
  for (const [k, p] of Object.entries(s)) {
    if (p.type === "number" || p.type === "integer") { alleMin[k] = p.min; alleMax[k] = p.max; }
    if (p.type === "choice") for (const o of p.options) faelle.push({ ...basis, [k]: o });
    if (p.type === "boolean") faelle.push({ ...basis, [k]: !p.default });
  }
  faelle.push(alleMin as Values<S>, alleMax as Values<S>);
  return faelle;
}

/** Random valid values from a seeded generator (for tests and the gallery's dice). */
export function random<S extends Schema>(s: S, r: () => number): Values<S> {
  const out: Record<string, unknown> = {};
  for (const [k, p] of Object.entries(s)) {
    switch (p.type) {
      case "number": out[k] = p.min + r() * (p.max - p.min); break;
      case "integer": out[k] = Math.floor(p.min + r() * (p.max - p.min + 1)); break;
      case "choice": out[k] = p.options[Math.floor(r() * p.options.length)]; break;
      case "color": out[k] = "#" + Math.floor(r() * 0xffffff).toString(16).padStart(6, "0"); break;
      case "boolean": out[k] = r() < 0.5; break;
    }
  }
  return clean(s, out);
}

/** Problems with a schema itself (labels, ranges, defaults); empty when it is fine. */
export function schemaProblems(s: Schema): string[] {
  const f: string[] = [];
  for (const [k, p] of Object.entries(s)) {
    if (!/^[a-z][a-zA-Z0-9]*$/.test(k)) f.push(`${k}: names are camelCase`);
    if (!p.label.de.trim() || !p.label.en.trim()) f.push(`${k}: label in German and English`);
    if ((p.type === "number" || p.type === "integer") && !(p.min < p.max && p.default >= p.min && p.default <= p.max)) f.push(`${k}: min < max and the default inside`);
    if (p.type === "number" && !(p.step > 0)) f.push(`${k}: step > 0`);
    if (p.type === "choice" && (!p.options.length || !p.options.includes(p.default))) f.push(`${k}: options with the default among them`);
    if (p.type === "color" && !FARBE.test(p.default)) f.push(`${k}: default colour as #rrggbb`);
  }
  return f;
}
