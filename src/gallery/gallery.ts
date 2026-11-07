// The gallery: every asset with controls generated from its parameter schema, presets, movable parts, a live 3D view,
// a share link, a code snippet and downloads (.glb with baked patterns, .usdz, .obj) made in the visitor's browser.
// No server work: the page is static, catalog.json and llms.txt next to it are generated at build time.
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { Object3D } from "three";
import { ASSETS, assetById } from "../assets";
import { CATEGORIES, infoOf, make, measure, pose, size, type AnyAsset } from "../assets/define";
import { defaults, random, withPreset, type Param } from "../core/params";
import { toGLB, toOBJ, toUSDZ } from "../core/export";
import { rng } from "../core/rng";
import { createViewer } from "./viewer";

const de = (new URLSearchParams(location.search).get("lang") ?? navigator.language).startsWith("de");
const T = de
  ? { kategorien: { furniture: "Möbel", architecture: "Architektur", nature: "Natur", vehicles: "Fahrzeuge", props: "Requisiten" }, seed: "Seed", wuerfeln: "Würfeln", zurueck: "Zurücksetzen",
      code: "Code kopieren", link: "Link kopieren", kopiert: "Kopiert", dreiecke: "Dreiecke", aufrufe: "Draw Calls",
      hinweis: "Jedes Asset ist Code: Parameter ändern, Link teilen, für Godot, Blender, AR oder dein Spiel herunterladen. Lizenz der Assets: CC0.",
      beitragen: "Eigene Assets beitragen", agenten: "Für Agenten", looks: "Looks", bewegen: "Bewegen", export: "Herunterladen",
      backen: "Muster als Textur backen (Maserung, Gestein; größere Datei)", laden: "Herunterladen", backt: "Backe …",
      formate: { glb: ".glb (Godot, Blender, Web)", usdz: ".usdz (AR auf iPhone und iPad)", obj: ".obj (nur Form)" },
      koerper: { static: "statisch", dynamic: "beweglich" }, kollider: { box: "Kollider Box", hull: "Kollider Hülle", cylinder: "Kollider Zylinder" } }
  : { kategorien: { furniture: "Furniture", architecture: "Architecture", nature: "Nature", vehicles: "Vehicles", props: "Props" }, seed: "Seed", wuerfeln: "Roll", zurueck: "Reset",
      code: "Copy code", link: "Copy link", kopiert: "Copied", dreiecke: "triangles", aufrufe: "draw calls",
      hinweis: "Every asset is code: change the parameters, share the link, download it for Godot, Blender, AR or your game. Asset licence: CC0.",
      beitragen: "Contribute your own assets", agenten: "For agents", looks: "Looks", bewegen: "Move", export: "Download",
      backen: "Bake patterns into a texture (grain, stone; larger file)", laden: "Download", backt: "Baking …",
      formate: { glb: ".glb (Godot, Blender, web)", usdz: ".usdz (AR on iPhone and iPad)", obj: ".obj (shape only)" },
      koerper: { static: "static", dynamic: "dynamic" }, kollider: { box: "box collider", hull: "hull collider", cylinder: "cylinder collider" } };

const el = <K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}, ...kinder: (Node | string)[]) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  e.append(...kinder);
  return e;
};
const text = (t: { de: string; en: string }) => (de ? t.de : t.en);
const zahl = (x: number, stellen = 2) => x.toLocaleString(de ? "de-DE" : "en-GB", { maximumFractionDigits: stellen });

/** Hash: #<id>?<non-default values>&seed=<n>, or #<id>?preset=<name> from the catalogue */
function ausHash(): { asset: AnyAsset; werte: Record<string, unknown>; seed: number } {
  const [id, rest] = location.hash.slice(1).split("?");
  const asset = assetById(id) ?? ASSETS[0];
  const q = new URLSearchParams(rest ?? "");
  return { asset, werte: withPreset(asset.params, asset.presets, Object.fromEntries(q)), seed: Math.max(1, Number(q.get("seed")) || 1) };
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
  wurzel.append(
    el("header", {}, el("h1", {}, "Formwerk"), el("p", {}, T.hinweis),
      el("span", { class: "links" }, el("a", { href: "https://github.com/swarvex-ai/formwerk" }, T.beitragen), " · ",
        `${T.agenten}: `, el("a", { href: "./llms.txt" }, "llms.txt"), " ", el("a", { href: "./catalog.json" }, "catalog.json"))),
    liste, regler);
  document.querySelector(".buehne")!.append(werteZeile);

  let { asset, werte, seed } = ausHash();
  let objekt: Object3D | null = null;
  let haltung: Record<string, number> = {};
  const bewegen = el("div", { class: "bewegen" });

  const nichtStandard = () => Object.fromEntries(Object.entries(werte).filter(([k, v]) => v !== asset.params[k].default));
  const hashSetzen = () => {
    const q = new URLSearchParams(Object.entries(nichtStandard()).map(([k, v]) => [k, String(v)]));
    if (seed !== 1) q.set("seed", String(seed));
    history.replaceState(null, "", `#${asset.id}${q.size ? "?" + q : ""}`);
  };
  const bewegenZeichnen = () => {
    const rig = objekt ? infoOf(objekt)!.rig : {};
    const teile = Object.entries(rig);
    bewegen.replaceChildren(...(teile.length ? [el("h3", {}, T.bewegen)] : []), ...teile.map(([name, r]) => {
      const id = `r-${name}`, wert = haltung[name] ?? 0, einheit = r.type === "rotate" ? "°" : " m";
      const eingabe = el("input", { id, type: "range", min: String(r.min), max: String(r.max), step: r.type === "rotate" ? "1" : "0.01", value: String(wert) }) as HTMLInputElement;
      const anzeige = el("output", { for: id }, `${zahl(wert)}${einheit}`);
      eingabe.oninput = () => { haltung[name] = Number(eingabe.value); anzeige.textContent = `${zahl(haltung[name])}${einheit}`; if (objekt) pose(objekt, { [name]: haltung[name] }); };
      return el("div", { class: "feld" }, el("label", { for: id }, text(r.label)), eingabe, anzeige);
    }));
  };
  const neuBauen = (rahmen = false) => {
    objekt = make(asset, werte, seed);
    pose(objekt, haltung);
    viewer.show(objekt);
    if (rahmen) { viewer.frame(); controls.target.copy(viewer.center); }
    const m = measure(objekt), s = size(objekt), ph = infoOf(objekt)!.physics;
    werteZeile.textContent = `${zahl(s.width)} × ${zahl(s.height)} × ${zahl(s.depth)} m · ≈ ${zahl(ph.massKg, ph.massKg < 100 ? 1 : 0)} kg · ${T.koerper[ph.body]}, ${T.kollider[ph.collider]} · ${m.triangles.toLocaleString()} ${T.dreiecke} · ${m.drawCalls} ${T.aufrufe}`;
    bewegenZeichnen();
    hashSetzen();
  };

  const listeZeichnen = () => {
    liste.replaceChildren(...CATEGORIES.filter((k) => ASSETS.some((a) => a.category === k)).map((k) => el("section", {}, el("h2", {}, T.kategorien[k]),
      ...ASSETS.filter((a) => a.category === k).map((a) => {
        const b = el("button", { type: "button", "aria-pressed": String(a.id === asset.id) }, text(a.title));
        b.onclick = () => { asset = a; werte = defaults(a.params); seed = 1; haltung = {}; listeZeichnen(); reglerZeichnen(); neuBauen(true); };
        return b;
      }))));
  };

  const feld = (name: string, p: Param) => {
    const id = `p-${name}`, hilfe = `h-${name}`;
    const label = el("label", { for: id }, text(p.label));
    const beschreibung = el("small", { id: hilfe }, text(p.describe));
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
      const ausgabe = el("output", { for: id }, `${werte[name]}${p.type === "number" && p.unit ? " " + p.unit : ""}`);
      eingabe.oninput = () => { ausgabe.textContent = `${eingabe.value}${p.type === "number" && p.unit ? " " + p.unit : ""}`; aendern(Number(eingabe.value)); };
      eingabe.setAttribute("aria-describedby", hilfe);
      return el("div", { class: "feld" }, label, eingabe, ausgabe, beschreibung);
    }
    eingabe.setAttribute("aria-describedby", hilfe);
    return el("div", { class: "feld" }, label, eingabe, beschreibung);
  };

  const kopieren = async (knopf: HTMLButtonElement, inhalt: string) => {
    try { await navigator.clipboard.writeText(inhalt); const alt = knopf.textContent; knopf.textContent = T.kopiert; setTimeout(() => (knopf.textContent = alt), 1500); } catch { /* ohne Zwischenablage */ }
  };
  const knopf = (beschriftung: string, aktion: (b: HTMLButtonElement) => void) => { const b = el("button", { type: "button" }, beschriftung) as HTMLButtonElement; b.onclick = () => aktion(b); return b; };
  const speichern = (inhalt: BlobPart, typ: string, datei: string) => {
    const a = el("a", { href: URL.createObjectURL(new Blob([inhalt], { type: typ })), download: datei });
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  };

  const exportZeichnen = () => {
    const format = el("select", { id: "e-format", "aria-label": T.export }, ...(["glb", "usdz", "obj"] as const).map((f) => el("option", { value: f }, T.formate[f]))) as HTMLSelectElement;
    const backen = el("input", { id: "e-backen", type: "checkbox" }) as HTMLInputElement;
    backen.checked = true;
    const backenFeld = el("label", { class: "haken", for: "e-backen" }, backen, T.backen);
    format.onchange = () => { backenFeld.hidden = format.value === "obj"; };
    const laden = knopf(T.laden, async (b) => {
      if (!objekt) return;
      b.disabled = true; b.textContent = T.backt;
      try {
        const opts = { bake: backen.checked };
        if (format.value === "glb") speichern(await toGLB(objekt, opts), "model/gltf-binary", `${asset.id}.glb`);
        else if (format.value === "usdz") speichern(await toUSDZ(objekt, opts) as Uint8Array<ArrayBuffer>, "model/vnd.usdz+zip", `${asset.id}.usdz`);
        else speichern(await toOBJ(objekt), "model/obj", `${asset.id}.obj`);
      } finally { b.disabled = false; b.textContent = T.laden; }
    });
    laden.classList.add("haupt");
    return el("div", { class: "export" }, el("h3", {}, T.export), format, backenFeld, laden);
  };

  const reglerZeichnen = () => {
    const seedFeld = el("input", { id: "p-seed", type: "number", min: "1", step: "1", value: String(seed) }) as HTMLInputElement;
    seedFeld.onchange = () => { seed = Math.max(1, Math.round(Number(seedFeld.value)) || 1); neuBauen(); };
    const looks = el("div", { class: "looks", role: "group", "aria-label": T.looks }, ...Object.entries(asset.presets).map(([name, p]) =>
      knopf(text(p.label), () => { werte = withPreset(asset.params, asset.presets, { preset: name }); seed = 1; haltung = {}; reglerZeichnen(); neuBauen(true); })));
    regler.replaceChildren(
      el("h2", {}, text(asset.title)), el("p", { class: "leise" }, text(asset.description)),
      el("h3", {}, T.looks), looks,
      ...Object.entries(asset.params).map(([k, p]) => feld(k, p as Param)),
      el("div", { class: "feld" }, el("label", { for: "p-seed" }, T.seed), seedFeld),
      bewegen,
      el("div", { class: "knoepfe" },
        knopf(T.wuerfeln, () => { werte = random(asset.params, rng(Date.now() % 100000)); seed = 1 + Math.floor(Math.random() * 999); reglerZeichnen(); neuBauen(true); }),
        knopf(T.zurueck, () => { werte = defaults(asset.params); seed = 1; haltung = {}; reglerZeichnen(); neuBauen(true); }),
        knopf(T.link, (b) => kopieren(b, location.href)),
        knopf(T.code, (b) => {
          const name = asset.id.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
          const posen = Object.entries(haltung).filter(([, v]) => v);
          kopieren(b, `import { ${name}${posen.length ? ", pose" : ""} } from "formwerk";\n\nconst object = ${name}(${JSON.stringify(nichtStandard())}${seed !== 1 ? `, ${seed}` : ""});\n${posen.length ? `pose(object, ${JSON.stringify(Object.fromEntries(posen))});\n` : ""}scene.add(object);\n`);
        })),
      exportZeichnen());
  };

  const groesse = () => viewer.resize(canvas.clientWidth, canvas.clientHeight);
  addEventListener("resize", groesse);
  addEventListener("hashchange", () => { ({ asset, werte, seed } = ausHash()); haltung = {}; listeZeichnen(); reglerZeichnen(); neuBauen(true); });
  groesse();
  listeZeichnen();
  reglerZeichnen();
  neuBauen(true);
  viewer.renderer.setAnimationLoop(() => { controls.update(); viewer.render(); });
}
