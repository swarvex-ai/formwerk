// The machine-readable catalogue (catalog.json) and the agent guide (llms.txt), both generated from the asset
// definitions at build time (scripts/catalog.mjs) and served next to the gallery. Agents of other projects find every
// parameter with its range and meaning, the presets, the movable parts and the physics hints here, without a server.
import { ASSETS } from "./assets";
import { infoOf, make, measure, size, type AnyAsset } from "./assets/define";
import type { Param } from "./core/params";

export const GALLERY = "https://formwerk.swarvex.run";
export const REPOSITORY = "https://github.com/swarvex-ai/formwerk";

const funktion = (id: string) => id.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

function eintrag(a: AnyAsset, base: string) {
  const o = make(a), info = infoOf(o)!, m = measure(o), s = size(o);
  return {
    id: a.id, category: a.category, title: a.title, description: a.description,
    function: funktion(a.id), gallery: `${base}/#${a.id}`,
    params: a.params as Record<string, Param>,
    presets: Object.fromEntries(Object.entries(a.presets).map(([name, p]) => [name, { ...p, gallery: `${base}/#${a.id}?preset=${name}` }])),
    rig: a.rig ?? {},
    physics: a.physics,
    budget: a.budget,
    atDefaults: { size: { width: s.width, height: s.height, depth: s.depth }, triangles: m.triangles, drawCalls: m.drawCalls, massKg: info.physics.massKg },
  };
}

export function catalog(base = GALLERY) {
  return {
    name: "Formwerk",
    description: "Parametric 3D assets as code for three.js (r187, WebGPU with WebGL 2 fallback, TSL materials).",
    licence: { code: "MIT", assets: "CC0-1.0" },
    gallery: base, repository: REPOSITORY,
    conventions: {
      units: "metres; angles in degrees", up: "+y", front: "+z", origin: "centre of the floor contact",
      values: "values outside a range are clamped, unknown keys ignored; the same values and seed always build the same geometry",
      presets: "{ preset: \"<name>\" } sets the preset's values, explicit values win over it",
      rig: "movable parts are named child objects with their origin at the hinge; rotate = degrees around axis, slide = metres along axis, 0 is closed, positive opens",
      physics: "body static or dynamic; collider box (bounding box), hull (convex hull) or cylinder (trunk); massKg is an estimate",
    },
    assets: ASSETS.map((a) => eintrag(a, base)),
  };
}
export type Catalog = ReturnType<typeof catalog>;

const wert = (v: unknown) => (typeof v === "string" ? `"${v}"` : String(v));
function paramZeile(name: string, p: Param): string {
  const art = p.type === "number" ? `number ${p.min}–${p.max}${p.unit ? " " + p.unit : ""}` : p.type === "integer" ? `integer ${p.min}–${p.max}`
    : p.type === "choice" ? p.options.map((o) => `"${o}"`).join(" | ") : p.type === "color" ? "colour #rrggbb" : "boolean";
  return `  - \`${name}\` (${art}, default ${wert(p.default)}): ${p.describe.en}`;
}

/** The agent guide, after https://llmstxt.org: what Formwerk is, how to use it, and every asset in short. */
export function llmsTxt(k: Catalog): string {
  const teile = [
    `# Formwerk`,
    ``,
    `> ${k.description} Every asset is a function of typed parameters. Code MIT, assets CC0: copy, change and ship them anywhere, no attribution needed.`,
    ``,
    `- Gallery with controls, share links and downloads (.glb with baked patterns, .usdz, .obj): ${k.gallery}`,
    `- Full catalogue with every parameter, preset, movable part and physics hint: ${k.gallery}/catalog.json`,
    `- Source: ${k.repository} (TypeScript; copy \`src/\` into your project or add the repository as a git dependency)`,
    ``,
    `## Use`,
    ``,
    "```ts",
    `import { chair, pose, physicsOf, hullPoints, toGLB } from "formwerk";`,
    `const object = chair({ preset: "bar-stool", color: "#334455" }, 1); // values, seed`,
    `scene.add(object);`,
    `pose(crateObject, { lid: 80 });            // movable parts by name`,
    `const p = physicsOf(object);                // body, massKg, collider, center, halfExtents`,
    `const glb = await toGLB(object, { bake: true }); // patterns baked into a texture`,
    "```",
    ``,
    `Conventions: ${Object.entries(k.conventions).map(([a, b]) => `${a}: ${b}`).join("; ")}.`,
    ``,
    `Missing an asset? Projects on swarvex.ai can send Formwerk a work request; everyone else opens an issue.`,
    ``,
    `## Assets`,
  ];
  for (const a of k.assets) {
    teile.push(``, `### ${a.function}() · ${a.title.en} (${a.category})`, ``, a.description.en, ``, `- Gallery: ${a.gallery}`);
    teile.push(`- Parameters:`, ...Object.entries(a.params).map(([n, p]) => paramZeile(n, p)));
    teile.push(`- Presets: ${Object.entries(a.presets).map(([n, p]) => `\`${n}\` (${p.label.en})`).join(", ")}`);
    const rig = Object.entries(a.rig);
    if (rig.length) teile.push(`- Movable parts: ${rig.map(([n, r]) => `\`${n}\` (${r.type} ${r.min}–${r.max}${r.type === "rotate" ? "°" : " m"})`).join(", ")}`);
    teile.push(`- Physics: ${a.physics.body}, collider ${a.physics.collider}; at defaults ${a.atDefaults.size.width} × ${a.atDefaults.size.height} × ${a.atDefaults.size.depth} m, about ${a.atDefaults.massKg} kg, ${a.atDefaults.triangles} triangles`);
  }
  return teile.join("\n") + "\n";
}
