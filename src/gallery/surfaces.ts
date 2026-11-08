// The surfaces tab: every surface on a floor of three by three tiles and a ball, with controls generated from its
// parameter schema, presets, a share link, a code snippet and a download of its maps as PNG files in a .zip, baked in
// the browser at 512 to 8192 pixels per tile. The view shows the maps baked at 1024 pixels, rebaked after every change:
// the live TSL material computes the whole surface for every pixel and every frame, too much for a large floor on a
// small GPU.
import { Group, Mesh, MeshStandardMaterial, PlaneGeometry, SphereGeometry, type Texture } from "three";
import { PMREMGenerator } from "three/webgpu";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { defaults, random, withPreset, type Param } from "../core/params";
import { rng } from "../core/rng";
import { SURFACES, surfaceById } from "../surfaces";
import { createBaker, SIZES, toTextures, toZip, type Baker } from "../surfaces/bake";
import { makeSurface, SURFACE_CATEGORIES, type AnySurface, type MapName } from "../surfaces/define";
import { de, el, feld, hashSetzen, hashTeile, kebabZuCamel, knopf, kopieren, speichern, T, text, zahl, type Bereich, type Galerie } from "./shell";
import { ENVIRONMENT, stage } from "./stage";

const O = de
  ? { kategorien: { stone: "Stein", wood: "Holz", metal: "Metall", ground: "Boden" }, groesse: "Pixel pro Kachel",
      karten: { color: "Farbe", normal: "Normal", roughness: "Rauheit", metalness: "Metall", height: "Höhe" } as Record<MapName, string>,
      zip: "Herunterladen (.zip mit PNG-Karten)", backt: "Backe", packt: "Packe …",
      gross: "8192 Pixel brauchen etwa 1 GB Speicher und einige Sekunden pro Karte.",
      kachel: "Kachel", relief: "Relief", nahtlos: "nahtlos kachelbar", normal: "Normal-Map im OpenGL-Format (Godot, Blender, three.js)", vorschau: "Vorschau mit 1024 px gebacken", backtGerade: "backe …" }
  : { kategorien: { stone: "Stone", wood: "Wood", metal: "Metal", ground: "Ground" }, groesse: "Pixels per tile",
      karten: { color: "colour", normal: "normal", roughness: "roughness", metalness: "metalness", height: "height" } as Record<MapName, string>,
      zip: "Download (.zip of PNG maps)", backt: "Baking", packt: "Packing …",
      gross: "8192 pixels need about 1 GB of memory and a few seconds per map.",
      kachel: "tile", relief: "relief", nahtlos: "tiles seamlessly", normal: "normal map in OpenGL format (Godot, Blender, three.js)", vorschau: "preview baked at 1024 px", backtGerade: "baking …" };

let umgebung: Texture | null = null;

export async function start(b: Bereich): Promise<Galerie> {
  const canvas = b.buehne.querySelector<HTMLCanvasElement>("canvas.dreid")!;
  canvas.hidden = false;
  const { viewer, controls } = await stage(canvas);
  umgebung ??= new PMREMGenerator(viewer.renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  viewer.scene.environment = umgebung;
  viewer.scene.environmentIntensity = ENVIRONMENT;

  let flaeche: AnySurface = SURFACES[0], werte: Record<string, unknown> = {}, seed = 1, groesse = 2048;
  const nichtStandard = () => Object.fromEntries(Object.entries(werte).filter(([k, v]) => v !== flaeche.params[k].default));
  // One baker (one WebGL context) for the whole visit: the preview and the downloads
  let baker: Baker | null = null, auftrag = 0, texturen: Texture[] = [];
  const holeBaker = async () => (baker ??= await createBaker());
  // A floor of 3 × 3 tiles and a ball (its UVs: 3 tiles around, 1.5 from pole to pole); the maps come when baked
  const boden = new Mesh(new PlaneGeometry(1, 1), new MeshStandardMaterial({ color: "#3a3d42" }));
  const kugel = new Mesh(new SphereGeometry(0.5, 96, 48), new MeshStandardMaterial({ color: "#3a3d42" }));
  boden.rotation.x = -Math.PI / 2;
  const gruppe = new Group().add(boden, kugel);
  viewer.show(gruppe);
  const info = (zusatz = "") => {
    const t = flaeche.tile;
    b.werte.textContent = `${O.kachel} ${zahl(t)} × ${zahl(t)} m · ${O.relief} ${zahl(flaeche.depth * 100, 1)} cm · ${O.nahtlos} · ${O.normal} · ${zusatz || O.vorschau}`;
  };

  const neuBauen = (rahmen = false) => {
    const t = flaeche.tile, mein = ++auftrag;
    boden.scale.set(3 * t, 3 * t, 1);
    kugel.scale.setScalar(t);
    kugel.position.set(0.4 * t, 0.5 * t, 0.2 * t);
    if (rahmen) { viewer.frame(); controls.target.copy(viewer.center); }
    hashSetzen(flaeche.id, nichtStandard(), seed);
    info(O.backtGerade);
    // Bake shortly after the last change (sliders send many), keep the old maps until the new ones are there
    setTimeout(async () => {
      if (mein !== auftrag) return;
      const made = makeSurface(flaeche, werte, seed), bk = await holeBaker(), maps = [];
      for (const map of ["color", "normal", "roughness", "metalness"] as const) {
        maps.push(await bk.bake(made, map, 1024));
        if (mein !== auftrag) return;
      }
      const tBoden = toTextures(maps), tKugel = Object.fromEntries(Object.entries(tBoden).map(([k, x]) => [k, x.clone()])) as typeof tBoden;
      for (const x of Object.values(tBoden)) x.repeat.set(3, 3);
      for (const x of Object.values(tKugel)) x.repeat.set(3, 1.5);
      const material = (x: typeof tBoden) => new MeshStandardMaterial({ map: x.color, normalMap: x.normal, roughnessMap: x.roughness, metalnessMap: x.metalness, roughness: 1, metalness: 1 });
      boden.material.dispose(); kugel.material.dispose();
      boden.material = material(tBoden); kugel.material = material(tKugel);
      for (const x of texturen) x.dispose();
      texturen = [...Object.values(tBoden), ...Object.values(tKugel)];
      info();
    }, 150);
  };

  const listeZeichnen = () => {
    b.liste.replaceChildren(...SURFACE_CATEGORIES.filter((k) => SURFACES.some((s) => s.category === k)).map((k) => el("section", {}, el("h2", {}, O.kategorien[k]),
      ...SURFACES.filter((s) => s.category === k).map((s) => {
        const k2 = el("button", { type: "button", "aria-pressed": String(s.id === flaeche.id) }, text(s.title));
        k2.onclick = () => { flaeche = s; werte = defaults(s.params); seed = 1; listeZeichnen(); reglerZeichnen(); neuBauen(true); };
        return k2;
      }))));
  };

  const exportZeichnen = () => {
    const wahl = el("select", { id: "e-groesse", "aria-label": O.groesse }, ...SIZES.map((n) => el("option", { value: String(n) }, `${n} × ${n}`))) as HTMLSelectElement;
    wahl.value = String(groesse);
    const hinweis = el("small", {}, O.gross);
    hinweis.hidden = groesse < 8192;
    wahl.onchange = () => { groesse = Number(wahl.value); hinweis.hidden = groesse < 8192; };
    const laden = knopf(O.zip, async (k) => {
      k.disabled = true;
      try {
        const made = makeSurface(flaeche, werte, seed);
        const zip = await toZip(made, groesse, undefined, (map) => { k.textContent = `${O.backt} ${O.karten[map]} …`; }, await holeBaker());
        k.textContent = O.packt;
        speichern(zip, "application/zip", `${flaeche.id}${seed !== 1 ? "-" + seed : ""}-${groesse}.zip`);
      } finally { k.disabled = false; k.textContent = O.zip; }
    });
    laden.classList.add("haupt");
    return el("div", { class: "export" }, el("h3", {}, T.export), el("label", { for: "e-groesse" }, O.groesse), wahl, hinweis, laden);
  };

  const reglerZeichnen = () => {
    const seedFeld = el("input", { id: "p-seed", type: "number", min: "1", step: "1", value: String(seed) }) as HTMLInputElement;
    seedFeld.onchange = () => { seed = Math.max(1, Math.round(Number(seedFeld.value)) || 1); neuBauen(); };
    const looks = el("div", { class: "looks", role: "group", "aria-label": T.looks }, ...Object.entries(flaeche.presets).map(([name, p]) =>
      knopf(text(p.label), () => { werte = withPreset(flaeche.params, flaeche.presets, { preset: name }); seed = 1; reglerZeichnen(); neuBauen(); })));
    b.regler.replaceChildren(
      el("h2", {}, text(flaeche.title)), el("p", { class: "leise" }, text(flaeche.description)),
      el("h3", {}, T.looks), looks,
      ...Object.entries(flaeche.params).map(([k, p]) => feld(k, p as Param, werte[k], (v) => { werte = { ...werte, [k]: v }; neuBauen(); })),
      el("div", { class: "feld" }, el("label", { for: "p-seed" }, T.seed), seedFeld),
      el("div", { class: "knoepfe" },
        knopf(T.wuerfeln, () => { werte = random(flaeche.params, rng(Date.now() % 100000)); seed = 1 + Math.floor(Math.random() * 999); reglerZeichnen(); neuBauen(); }),
        knopf(T.zurueck, () => { werte = defaults(flaeche.params); seed = 1; reglerZeichnen(); neuBauen(); }),
        knopf(T.link, (k) => kopieren(k, location.href)),
        knopf(T.code, (k) => {
          const name = kebabZuCamel(flaeche.id);
          kopieren(k, `import { ${name}, bakedMaterial, makeSurface, surfaceById } from "formwerk";\n\n// Live in three.js (TSL, no textures; costly per pixel); 4 = tiles across the mesh's UVs (one tile is ${flaeche.tile} m)\nmesh.material = ${name}(${JSON.stringify(nichtStandard())}, ${seed}, 4);\n// Or baked once into textures, cheap to render:\nmesh.material = await bakedMaterial(makeSurface(surfaceById("${flaeche.id}")!, ${JSON.stringify(nichtStandard())}, ${seed}), 2048, 4);\n`);
        })),
      exportZeichnen());
  };

  const groesseAendern = () => viewer.resize(canvas.clientWidth, canvas.clientHeight);
  addEventListener("resize", groesseAendern);
  groesseAendern();
  viewer.renderer.setAnimationLoop(() => { controls.update(); viewer.render(); });

  return {
    zeigen() {
      const h = hashTeile();
      flaeche = surfaceById(h.id) ?? SURFACES[0];
      werte = withPreset(flaeche.params, flaeche.presets, h.werte);
      seed = h.seed;
      listeZeichnen();
      reglerZeichnen();
      neuBauen(true);
    },
    stop() {
      auftrag++;
      viewer.renderer.setAnimationLoop(null);
      for (const x of texturen) x.dispose();
      texturen = [];
      baker?.dispose();
      baker = null;
      removeEventListener("resize", groesseAendern);
      viewer.scene.environment = null;
      canvas.hidden = true;
    },
  };
}
