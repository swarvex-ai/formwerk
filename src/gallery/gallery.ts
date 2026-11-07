// The gallery: every asset with controls generated from its parameter schema, a live 3D view, a share link, a code
// snippet and a .glb download made in the visitor's browser. No server work: the page is static.
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { Mesh, Object3D } from "three";
import { ASSETS, assetById } from "../assets";
import { CATEGORIES, measure, type AnyAsset } from "../assets/define";
import { clean, defaults, random, type Param } from "../core/params";
import { rng } from "../core/rng";
import { exportMaterial } from "../materials";
import { createViewer } from "./viewer";

const de = (new URLSearchParams(location.search).get("lang") ?? navigator.language).startsWith("de");
const T = de
  ? { kategorien: { furniture: "Möbel", architecture: "Architektur", nature: "Natur" }, seed: "Seed", wuerfeln: "Würfeln", zurueck: "Zurücksetzen",
      glb: ".glb herunterladen", code: "Code kopieren", link: "Link kopieren", kopiert: "Kopiert", dreiecke: "Dreiecke", aufrufe: "Draw Calls",
      hinweis: "Jedes Asset ist Code: Parameter ändern, Link teilen, als .glb für Godot, Blender oder dein Spiel herunterladen. Lizenz der Assets: CC0.",
      beitragen: "Eigene Assets beitragen", export: "Der Export enthält Form und Grundfarben; prozedurale Muster (Maserung, Gestein) noch nicht." }
  : { kategorien: { furniture: "Furniture", architecture: "Architecture", nature: "Nature" }, seed: "Seed", wuerfeln: "Roll", zurueck: "Reset",
      glb: "Download .glb", code: "Copy code", link: "Copy link", kopiert: "Copied", dreiecke: "triangles", aufrufe: "draw calls",
      hinweis: "Every asset is code: change the parameters, share the link, download a .glb for Godot, Blender or your game. Asset licence: CC0.",
      beitragen: "Contribute your own assets", export: "The export carries shape and base colours; procedural patterns (grain, stone) not yet." };

const el = <K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}, ...kinder: (Node | string)[]) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  e.append(...kinder);
  return e;
};
const text = (t: { de: string; en: string }) => (de ? t.de : t.en);

/** Hash: #<id>?<non-default values>&seed=<n> */
function ausHash(): { asset: AnyAsset; werte: Record<string, unknown>; seed: number } {
  const [id, rest] = location.hash.slice(1).split("?");
  const asset = assetById(id) ?? ASSETS[0];
  const q = new URLSearchParams(rest ?? "");
  return { asset, werte: clean(asset.params, Object.fromEntries(q)), seed: Math.max(1, Number(q.get("seed")) || 1) };
}

export async function startGallery() {
  const wurzel = document.querySelector("#app")!;
  const canvas = document.querySelector("canvas")!;
  const viewer = await createViewer(canvas, { forceWebGL: new URLSearchParams(location.search).has("webgl"), antialias: true, background: "#16191d" });
  const controls = new OrbitControls(viewer.camera, canvas);
  controls.enableDamping = true;
  const liste = el("nav", { class: "liste", "aria-label": "Assets" });
  const regler = el("form", { class: "regler" });
  const werteZeile = el("p", { class: "werte" });
  wurzel.append(el("header", {}, el("h1", {}, "Formwerk"), el("p", {}, T.hinweis), el("a", { href: "https://github.com/swarvex-ai/formwerk" }, T.beitragen)), liste, regler);
  document.querySelector(".buehne")!.append(werteZeile);

  let { asset, werte, seed } = ausHash();
  let objekt: Object3D | null = null;

  const nichtStandard = () => Object.fromEntries(Object.entries(werte).filter(([k, v]) => v !== asset.params[k].default));
  const hashSetzen = () => {
    const q = new URLSearchParams(Object.entries(nichtStandard()).map(([k, v]) => [k, String(v)]));
    if (seed !== 1) q.set("seed", String(seed));
    history.replaceState(null, "", `#${asset.id}${q.size ? "?" + q : ""}`);
  };
  const neuBauen = (rahmen = false) => {
    objekt = asset.build(clean(asset.params, werte), seed);
    viewer.show(objekt);
    if (rahmen) { viewer.frame(); controls.target.copy(viewer.center); }
    const m = measure(objekt);
    werteZeile.textContent = `${m.triangles.toLocaleString()} ${T.dreiecke} · ${m.drawCalls} ${T.aufrufe}`;
    hashSetzen();
  };

  const listeZeichnen = () => {
    liste.replaceChildren(...CATEGORIES.map((k) => el("section", {}, el("h2", {}, T.kategorien[k]),
      ...ASSETS.filter((a) => a.category === k).map((a) => {
        const b = el("button", { type: "button", "aria-pressed": String(a.id === asset.id) }, text(a.title));
        b.onclick = () => { asset = a; werte = defaults(a.params); seed = 1; listeZeichnen(); reglerZeichnen(); neuBauen(true); };
        return b;
      }))));
  };

  const feld = (name: string, p: Param) => {
    const id = `p-${name}`;
    const label = el("label", { for: id }, text(p.label));
    let eingabe: HTMLInputElement | HTMLSelectElement;
    const aendern = (v: unknown) => { werte = { ...werte, [name]: v }; neuBauen(); };
    if (p.type === "choice") {
      eingabe = el("select", { id }, ...p.options.map((o) => el("option", { value: o }, p.labels ? text(p.labels[o]) : o))) as HTMLSelectElement;
      eingabe.value = String(werte[name]);
      eingabe.onchange = () => aendern(eingabe.value);
    } else if (p.type === "boolean") {
      eingabe = el("input", { id, type: "checkbox" }) as HTMLInputElement;
      (eingabe as HTMLInputElement).checked = Boolean(werte[name]);
      eingabe.onchange = () => aendern((eingabe as HTMLInputElement).checked);
    } else if (p.type === "color") {
      eingabe = el("input", { id, type: "color", value: String(werte[name]) }) as HTMLInputElement;
      eingabe.oninput = () => aendern(eingabe.value);
    } else {
      const step = p.type === "number" ? p.step : 1;
      eingabe = el("input", { id, type: "range", min: String(p.min), max: String(p.max), step: String(step), value: String(werte[name]) }) as HTMLInputElement;
      const zahl = el("output", { for: id }, `${werte[name]}${p.type === "number" && p.unit ? " " + p.unit : ""}`);
      eingabe.oninput = () => { zahl.textContent = `${eingabe.value}${p.type === "number" && p.unit ? " " + p.unit : ""}`; aendern(Number(eingabe.value)); };
      return el("div", { class: "feld" }, label, eingabe, zahl);
    }
    return el("div", { class: "feld" }, label, eingabe);
  };

  const kopieren = async (knopf: HTMLButtonElement, inhalt: string) => {
    try { await navigator.clipboard.writeText(inhalt); const alt = knopf.textContent; knopf.textContent = T.kopiert; setTimeout(() => (knopf.textContent = alt), 1500); } catch { /* ohne Zwischenablage */ }
  };
  const knopf = (beschriftung: string, aktion: (b: HTMLButtonElement) => void) => { const b = el("button", { type: "button" }, beschriftung) as HTMLButtonElement; b.onclick = () => aktion(b); return b; };

  const reglerZeichnen = () => {
    const seedFeld = el("input", { id: "p-seed", type: "number", min: "1", step: "1", value: String(seed) }) as HTMLInputElement;
    seedFeld.onchange = () => { seed = Math.max(1, Math.round(Number(seedFeld.value)) || 1); neuBauen(); };
    regler.replaceChildren(
      el("h2", {}, text(asset.title)), el("p", { class: "leise" }, text(asset.description)),
      ...Object.entries(asset.params).map(([k, p]) => feld(k, p as Param)),
      el("div", { class: "feld" }, el("label", { for: "p-seed" }, T.seed), seedFeld),
      el("div", { class: "knoepfe" },
        knopf(T.wuerfeln, () => { werte = random(asset.params, rng(Date.now() % 100000)); seed = 1 + Math.floor(Math.random() * 999); reglerZeichnen(); neuBauen(true); }),
        knopf(T.zurueck, () => { werte = defaults(asset.params); seed = 1; reglerZeichnen(); neuBauen(true); }),
        knopf(T.link, (b) => kopieren(b, location.href)),
        knopf(T.code, (b) => {
          const name = asset.id.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
          kopieren(b, `import { ${name} } from "formwerk";\n\nconst object = ${name}(${JSON.stringify(nichtStandard())}${seed !== 1 ? `, ${seed}` : ""});\nscene.add(object);\n`);
        }),
        knopf(T.glb, async () => {
          if (!objekt) return;
          const kopie = objekt.clone(true);
          kopie.traverse((x) => { const m = x as Mesh; if (m.isMesh) m.material = exportMaterial(m.material as import("three").Material); });
          const glb = (await new GLTFExporter().parseAsync(kopie, { binary: true })) as ArrayBuffer;
          const a = el("a", { href: URL.createObjectURL(new Blob([glb], { type: "model/gltf-binary" })), download: `${asset.id}.glb` });
          a.click();
          setTimeout(() => URL.revokeObjectURL(a.href), 5000);
        })),
      el("p", { class: "leise klein" }, T.export));
  };

  const groesse = () => viewer.resize(canvas.clientWidth, canvas.clientHeight);
  addEventListener("resize", groesse);
  addEventListener("hashchange", () => { ({ asset, werte, seed } = ausHash()); listeZeichnen(); reglerZeichnen(); neuBauen(true); });
  groesse();
  listeZeichnen();
  reglerZeichnen();
  neuBauen(true);
  viewer.renderer.setAnimationLoop(() => { controls.update(); viewer.render(); });
}
