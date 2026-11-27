// The models tab: every model with controls generated from its parameter schema, presets, movable parts, a live 3D
// view, a share link, a code snippet and downloads (.glb with baked patterns, .usdz, .obj) made in the browser.
import type { Object3D } from "three";
import { ASSETS, assetById } from "../assets";
import { infoOf, make, measure, pose, size, type AnyAsset } from "../assets/define";
import { defaults, random, withPreset, type Param } from "../core/params";
import { toGLB, toOBJ, toUSDZ } from "../core/export";
import { rng } from "../core/rng";
import { drawModelList } from "./model-list";
import { de, el, feld, hashSetzen, hashTeile, kebabZuCamel, knopf, kopieren, speichern, T, text, zahl, type Bereich, type Galerie } from "./shell";
import { codeBytes, kb } from "./facts";
import { createScan } from "./scan";
import { stage } from "./stage";
import { createWire } from "./wire";

const M = de
  ? { dreiecke: "Dreiecke", aufrufe: "Draw Calls", bewegen: "Bewegen", draht: "Drahtgitter", code: "Code",
      backen: "Muster als Textur backen (Maserung, Gestein; größere Datei)", backt: "Backe …",
      formate: { glb: ".glb (Godot, Blender, Web)", usdz: ".usdz (AR auf iPhone und iPad)", obj: ".obj (nur Form)" },
      koerper: { static: "statisch", dynamic: "beweglich" }, kollider: { box: "Kollider Box", hull: "Kollider Hülle", cylinder: "Kollider Zylinder" } }
  : { dreiecke: "triangles", aufrufe: "draw calls", bewegen: "Move", draht: "Wireframe", code: "code",
      backen: "Bake patterns into a texture (grain, stone; larger file)", backt: "Baking …",
      formate: { glb: ".glb (Godot, Blender, web)", usdz: ".usdz (AR on iPhone and iPad)", obj: ".obj (shape only)" },
      koerper: { static: "static", dynamic: "dynamic" }, kollider: { box: "box collider", hull: "hull collider", cylinder: "cylinder collider" } };

export async function start(b: Bereich): Promise<Galerie> {
  const canvas = b.buehne.querySelector<HTMLCanvasElement>("canvas.dreid")!;
  canvas.hidden = false;
  const { viewer, controls } = await stage(canvas);
  viewer.setLook("gallery");
  const scan = createScan(viewer);
  const wire = createWire(viewer);
  // Wireframe toggle (top right) and how light the asset is (top left), on the stage while the models tab is open
  const leicht = el("p", { class: "leicht", "aria-live": "polite" });
  let leichtStand = 0;
  const leichtZeichnen = () => {
    const stand = ++leichtStand;
    leicht.hidden = !wire.on || !objekt;
    if (leicht.hidden || !objekt) return;
    const m = measure(objekt), id = asset.id;
    void codeBytes(id).then((bytes) => {
      if (stand === leichtStand) leicht.textContent = `${zahl(m.triangles, 0)} ${M.dreiecke} · ${m.drawCalls} ${M.aufrufe} · ${kb(bytes)} ${M.code}`;
    });
  };
  const drahtKnopf = knopf(M.draht, () => {
    scan.stop();
    wire.set(!wire.on);
    drahtKnopf.setAttribute("aria-pressed", String(wire.on));
    leichtZeichnen();
  });
  drahtKnopf.classList.add("draht");
  drahtKnopf.setAttribute("aria-pressed", String(wire.on));
  b.buehne.append(drahtKnopf, leicht);
  const ohneBewegung = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  let asset: AnyAsset = ASSETS[0], werte: Record<string, unknown> = {}, seed = 1;
  let objekt: Object3D | null = null;
  let haltung: Record<string, number> = {};
  const bewegen = el("div", { class: "bewegen" });

  const nichtStandard = () => Object.fromEntries(Object.entries(werte).filter(([k, v]) => v !== asset.params[k].default));
  const bewegenZeichnen = () => {
    const teile = Object.entries(objekt ? infoOf(objekt)!.rig : {});
    bewegen.replaceChildren(...(teile.length ? [el("h3", {}, M.bewegen)] : []), ...teile.map(([name, r]) => {
      const id = `r-${name}`, wert = haltung[name] ?? 0, einheit = r.type === "rotate" ? "°" : " m";
      const eingabe = el("input", { id, type: "range", min: String(r.min), max: String(r.max), step: r.type === "rotate" ? "1" : "0.01", value: String(wert) }) as HTMLInputElement;
      const anzeige = el("output", { for: id }, `${zahl(wert)}${einheit}`);
      eingabe.oninput = () => { haltung[name] = Number(eingabe.value); anzeige.textContent = `${zahl(haltung[name])}${einheit}`; scan.stop(); if (objekt) { pose(objekt, { [name]: haltung[name] }); wire.sync(); } };
      return el("div", { class: "feld" }, el("label", { for: id }, text(r.label)), eingabe, anzeige);
    }));
  };
  const neuBauen = (rahmen = false) => {
    // A rebuild while a scan runs ends it and shows the newest shape whole, so dragging a slider stays live
    const gescannt = scan.running;
    scan.stop();
    objekt = make(asset, werte, seed);
    pose(objekt, haltung);
    const vorher = viewer.show(objekt, { keepPrevious: true });
    if (rahmen) { viewer.frame(); controls.target.copy(viewer.center); }
    // The wireframe overlay follows the shapes: the old one stays above the sheet while a change scans
    const wechsel = !(gescannt || ohneBewegung()) && !rahmen && !!vorher;
    const drahtVorher = wire.attach(objekt, wechsel), draht = wire.group ? [wire.group] : [];
    if (gescannt || ohneBewegung()) { if (vorher) viewer.dispose(vorher); }
    else if (rahmen || !vorher) { if (vorher) viewer.dispose(vorher); scan.reveal(objekt, { new: draht }); }
    else scan.change(vorher, objekt, { new: draht, old: drahtVorher ? [drahtVorher] : [] });
    leichtZeichnen();
    const m = measure(objekt), s = size(objekt), ph = infoOf(objekt)!.physics;
    b.werte.textContent = `${zahl(s.width)} × ${zahl(s.height)} × ${zahl(s.depth)} m · ≈ ${zahl(ph.massKg, ph.massKg < 100 ? 1 : 0)} kg · ${M.koerper[ph.body]}, ${M.kollider[ph.collider]} · ${zahl(m.triangles, 0)} ${M.dreiecke} · ${m.drawCalls} ${M.aufrufe}`;
    bewegenZeichnen();
    hashSetzen(asset.id, nichtStandard(), seed);
  };

  const listeZeichnen = () => drawModelList(b.liste, asset.id, (a) => {
    asset = a; werte = defaults(a.params); seed = 1; haltung = {}; listeZeichnen(); reglerZeichnen(); neuBauen(true);
  });

  const exportZeichnen = () => {
    const format = el("select", { id: "e-format", "aria-label": T.export }, ...(["glb", "usdz", "obj"] as const).map((f) => el("option", { value: f }, M.formate[f]))) as HTMLSelectElement;
    const backen = el("input", { id: "e-backen", type: "checkbox" }) as HTMLInputElement;
    backen.checked = true;
    const backenFeld = el("label", { class: "haken", for: "e-backen" }, backen, M.backen);
    format.onchange = () => { backenFeld.hidden = format.value === "obj"; };
    const laden = knopf(T.laden, async (k) => {
      if (!objekt) return;
      scan.stop();
      k.disabled = true; k.textContent = M.backt;
      try {
        const opts = { bake: backen.checked };
        if (format.value === "glb") speichern(await toGLB(objekt, opts), "model/gltf-binary", `${asset.id}.glb`);
        else if (format.value === "usdz") speichern(await toUSDZ(objekt, opts) as Uint8Array<ArrayBuffer>, "model/vnd.usdz+zip", `${asset.id}.usdz`);
        else speichern(await toOBJ(objekt), "model/obj", `${asset.id}.obj`);
      } finally { k.disabled = false; k.textContent = T.laden; }
    });
    laden.classList.add("haupt");
    return el("div", { class: "export" }, el("h3", {}, T.export), format, backenFeld, laden);
  };

  const reglerZeichnen = () => {
    const seedFeld = el("input", { id: "p-seed", type: "number", min: "1", step: "1", value: String(seed) }) as HTMLInputElement;
    seedFeld.onchange = () => { seed = Math.max(1, Math.round(Number(seedFeld.value)) || 1); neuBauen(); };
    const looks = el("div", { class: "looks", role: "group", "aria-label": T.looks }, ...Object.entries(asset.presets).map(([name, p]) =>
      knopf(text(p.label), () => { werte = withPreset(asset.params, asset.presets, { preset: name }); seed = 1; haltung = {}; reglerZeichnen(); neuBauen(true); })));
    b.regler.replaceChildren(
      el("h2", {}, text(asset.title)), el("p", { class: "leise" }, text(asset.description)),
      el("h3", {}, T.looks), looks,
      ...Object.entries(asset.params).map(([k, p]) => feld(k, p as Param, werte[k], (v) => { werte = { ...werte, [k]: v }; neuBauen(); })),
      el("div", { class: "feld" }, el("label", { for: "p-seed" }, T.seed), seedFeld),
      bewegen,
      el("div", { class: "knoepfe" },
        knopf(T.wuerfeln, () => { werte = random(asset.params, rng(Date.now() % 100000)); seed = 1 + Math.floor(Math.random() * 999); reglerZeichnen(); neuBauen(true); }),
        knopf(T.zurueck, () => { werte = defaults(asset.params); seed = 1; haltung = {}; reglerZeichnen(); neuBauen(true); }),
        knopf(T.link, (k) => kopieren(k, location.href)),
        knopf(T.code, (k) => {
          const name = kebabZuCamel(asset.id), posen = Object.entries(haltung).filter(([, v]) => v);
          kopieren(k, `import { ${name}${posen.length ? ", pose" : ""} } from "formwerk";\n\nconst object = ${name}(${JSON.stringify(nichtStandard())}${seed !== 1 ? `, ${seed}` : ""});\n${posen.length ? `pose(object, ${JSON.stringify(Object.fromEntries(posen))});\n` : ""}scene.add(object);\n`);
        })),
      exportZeichnen());
  };

  const groesse = () => viewer.resize(canvas.clientWidth, canvas.clientHeight);
  addEventListener("resize", groesse);
  groesse();
  let zuletzt = performance.now();
  viewer.renderer.setAnimationLoop(() => { const jetzt = performance.now(); scan.tick(Math.min(0.1, (jetzt - zuletzt) / 1000)); zuletzt = jetzt; controls.update(); viewer.render(); });

  return {
    zeigen() {
      const h = hashTeile();
      asset = assetById(h.id) ?? ASSETS[0];
      werte = withPreset(asset.params, asset.presets, h.werte);
      seed = h.seed;
      haltung = {};
      listeZeichnen();
      reglerZeichnen();
      neuBauen(true);
    },
    stop() {
      scan.stop();
      wire.dispose();
      drahtKnopf.remove();
      leicht.remove();
      viewer.renderer.setAnimationLoop(null);
      removeEventListener("resize", groesse);
      canvas.hidden = true;
    },
  };
}
