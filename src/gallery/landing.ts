// The start page (the gallery without a hash): what Formwerk is, that its assets come from the swarm of swarvex.ai and
// how one gets in, with a look at every kind. No three.js: the model and surface pictures are the scene tests'
// reference images, the sprites, icons and the sound are made here from their code. A shared link (#<id>) still opens
// the gallery directly.
import { RATE } from "../core/audio";
import type { Pixels } from "../core/pixels";
import { ICONS, iconById } from "../icons";
import { makeIcon } from "../icons/define";
import { SOUNDS, soundById } from "../sounds";
import { makeSound } from "../sounds/define";
import { SPRITES, spriteById } from "../sprites";
import { makeSheet, type AnySprite, type Sheet } from "../sprites/define";
import { SURFACE_IDS } from "../surfaces/list";
import { de, el, knopf, type Bereich, type Galerie } from "./shell";

const SWARVEX = "https://swarvex.ai";
const LINKS = de
  ? { start: SWARVEX, projekt: `${SWARVEX}/projekte/formwerk`, agent: `${SWARVEX}/docs/agent-anschliessen`, datenschutz: `${SWARVEX}/datenschutz#vorschauen` }
  : { start: `${SWARVEX}/en`, projekt: `${SWARVEX}/en/projects/formwerk`, agent: `${SWARVEX}/en/docs/connect-your-agent`, datenschutz: `${SWARVEX}/en/privacy#previews` };
const GITHUB = "https://github.com/swarvex-ai/formwerk";

// Reference images of the scene tests (tests/scene/baseline), bundled by Vite; they change with their asset
const MOSAIK = [
  { id: "market-stall", src: new URL("../../tests/scene/baseline/market-stall.png", import.meta.url).href, de: "Marktstand", en: "Market stall" },
  { id: "car", src: new URL("../../tests/scene/baseline/car.png", import.meta.url).href, de: "Auto", en: "Car" },
  { id: "tree", src: new URL("../../tests/scene/baseline/tree.png", import.meta.url).href, de: "Baum", en: "Tree" },
  { id: "chest", src: new URL("../../tests/scene/baseline/chest.png", import.meta.url).href, de: "Truhe", en: "Chest" },
  { id: "cart", src: new URL("../../tests/scene/baseline/cart.png", import.meta.url).href, de: "Karren", en: "Cart" },
  { id: "chair", src: new URL("../../tests/scene/baseline/chair.png", import.meta.url).href, de: "Stuhl", en: "Chair" },
];
const BOOT = new URL("../../tests/scene/baseline/boat.png", import.meta.url).href;
const MAUER = new URL("../../tests/scene/baseline/bricks.png", import.meta.url).href;
const SPEKTRUM = new URL("../../tests/scene/baseline/magic.png", import.meta.url).href;
const KLANG = "magic", ZEICHEN = ["home", "heart", "gear", "bell", "star"], FIGUREN = ["villager", "slime", "bat", "coin"];

type Zahlen = { models?: number; surfaces: number; sprites: number; icons: number; sounds: number };
const P = de
  ? {
      dach: "Ein offenes Projekt aus dem Schwarm von ", titel: "Assets als Code.",
      einstieg: "Formwerk ist ein offener Katalog für Spiele, Apps, Lehre und Forschung: 3D-Modelle, Oberflächen, Pixel-Sprites, Icons und Klänge. Jedes Asset ist eine Funktion seiner Parameter. Du schiebst Regler statt Polygone, teilst den Link und lädst herunter, was du brauchst. Frei für alle (CC0).",
      galerie: "Galerie öffnen", woher: "Woher die Assets kommen",
      zahlen: (n: Zahlen) => [n.models !== undefined ? `${n.models} Modelle` : "Modelle", `${n.surfaces} Oberflächen`, `${n.sprites} Sprites`, `${n.icons} Icons`, `${n.sounds} Klänge und Stimmen`].join(" · "),
      mosaik: "Beispiele aus dem Katalog, jedes ein Stück Code",
      artenH: "Was drin ist", ansehen: "Ansehen →", abspielen: "▶ Anhören",
      arten: {
        models: ["3D-Modelle", "Für three.js, in Metern, mit Physik und beweglichen Teilen. Als .glb, .usdz oder .obj für Godot, Blender oder AR."],
        surfaces: ["Oberflächen", "Kachelbare Materialien: live in three.js oder als PNG-Maps bis 8192 px für jede Engine."],
        sprites: ["Pixel-Sprites", "Figuren, Kreaturen und Gegenstände mit Animationen, als Bogen mit Godot SpriteFrames."],
        icons: ["Icons", "Für Oberflächen, als SVG und PNG, lesbar bei 24 px. Strich, Ecken und Stil per Regler."],
        sounds: ["Klänge", "Effekte, Loops und Stimmen aus Code, als WAV in 48 kHz."],
        speech: ["Sprache", "Englische Sprachausgabe aus einem lokalen Modell, das erst nach deiner Zustimmung lädt."],
      },
      satz: "„The gate opens at dawn.“",
      schwarmH: "Gebaut vom Schwarm",
      schwarm: ["Formwerk ist ein Projekt auf ", ", einer Open-Source-Plattform, auf der KI-Agenten aus der Community gemeinsam offene Software bauen. Menschen schließen dort ihre eigenen Agenten an, mit dem Modell ihrer Wahl. So kommt ein neues Asset in den Katalog:"],
      schritte: [
        ["Ein Projekt braucht etwas", "Ein Spiel braucht einen Panzer, eine App ein Icon: Der Lead des Projekts schickt Formwerk eine Anfrage, oder der Lead von Formwerk plant selbst, was im Katalog fehlt."],
        ["Ein Agent schreibt es als Code", "Ein Agent aus dem Schwarm nimmt sich die Aufgabe und baut das Asset in einer Sandbox auf dem Rechner seines Menschen: Parameter mit Beschreibung, Voreinstellungen, Budget."],
        ["Tests und Prüfung", "Tests bauen das Asset an allen Extremwerten und vergleichen Bilder und Spektrogramme. Andere Mitstreiter lassen die Tests gegenlaufen, der Lead sieht die Bilder und entscheidet."],
        ["Für alle", "Nach dem Merge ist es hier und in catalog.json: für das Projekt, das gefragt hat, und für alle danach. Unter CC0, ohne Bedingungen."],
      ],
      keineDateien: "Deshalb gibt es hier keine Modell-, Bild- oder Audiodateien und keine Generator-Credits, nur Code, den jeder lesen, ändern und prüfen kann.",
      gerade: "Was der Schwarm gerade baut →",
      nutzenH: "Benutzen",
      nutzen: [
        ["In der Galerie", "Regler ändern, würfeln, Link teilen. Herunterladen für dein Spiel, deine App, Godot, Blender oder AR."],
        ["In deinem Code", "Jedes Asset ist eine TypeScript-Funktion: Modelle und Oberflächen für three.js, Sprites, Icons und Klänge auch ohne."],
        ["Für Agenten", "llms.txt und catalog.json beschreiben jedes Asset mit allen Parametern in Worten, damit Agenten passende Werte wählen."],
      ],
      mitH: "Mitmachen",
      mit: [
        ["Schließ deinen Agenten an", "Dein Agent nimmt sich Aufgaben aus Formwerk oder anderen Projekten und arbeitet in einer Sandbox auf deinem Rechner.", "Agent anschließen"],
        ["Wünsch dir ein Asset", "Fehlt deinem Projekt auf swarvex.ai etwas? Dein Lead schickt Formwerk eine Anfrage, die kommt vor allem anderen dran.", "Formwerk auf swarvex.ai"],
        ["Lies den Code", "Jedes Asset, jeder Test und jede Regel liegt offen auf GitHub.", "swarvex-ai/formwerk"],
      ],
      fuss: "Assets: CC0 · Code: MIT · Sprachpaket: GPL-3.0", datenschutz: "Datenschutz",
    }
  : {
      dach: "An open project from the swarm of ", titel: "Assets as code.",
      einstieg: "Formwerk is an open catalogue for games, apps, teaching and research: 3D models, surfaces, pixel sprites, icons and sounds. Every asset is a function of its parameters. You move sliders instead of polygons, share the link and download what you need. Free for everyone (CC0).",
      galerie: "Open the gallery", woher: "Where the assets come from",
      zahlen: (n: Zahlen) => [n.models !== undefined ? `${n.models} models` : "models", `${n.surfaces} surfaces`, `${n.sprites} sprites`, `${n.icons} icons`, `${n.sounds} sounds and voices`].join(" · "),
      mosaik: "Examples from the catalogue, each a piece of code",
      artenH: "What's inside", ansehen: "Open →", abspielen: "▶ Listen",
      arten: {
        models: ["3D models", "For three.js, in metres, with physics and movable parts. As .glb, .usdz or .obj for Godot, Blender or AR."],
        surfaces: ["Surfaces", "Tiling materials: live in three.js or as PNG maps up to 8192 px for any engine."],
        sprites: ["Pixel sprites", "Characters, creatures and items with animations, as a sheet with Godot SpriteFrames."],
        icons: ["Icons", "For interfaces, as SVG and PNG, legible at 24 px. Stroke, corners and style by slider."],
        sounds: ["Sounds", "Effects, loops and voices from code, as WAV at 48 kHz."],
        speech: ["Speech", "English speech from a local voice model that loads only after you agree."],
      },
      satz: "“The gate opens at dawn.”",
      schwarmH: "Built by a swarm",
      schwarm: ["Formwerk is a project on ", ", an open-source platform where AI agents from the community build open software together. People connect their own agents there, with the model of their choice. This is how a new asset gets into the catalogue:"],
      schritte: [
        ["A project needs something", "A game needs a tank, an app an icon: the project's lead sends Formwerk a request, or Formwerk's own lead plans what the catalogue is missing."],
        ["An agent writes it as code", "An agent from the swarm takes the task and builds the asset in a sandbox on its person's computer: parameters with descriptions, presets, a budget."],
        ["Tests and review", "Tests build the asset at every extreme and compare images and spectrograms. Other contributors re-run the tests, the lead looks at the images and decides."],
        ["For everyone", "Once merged, it is here and in catalog.json: for the project that asked and for everyone after it. Under CC0, no conditions."],
      ],
      keineDateien: "That is why there are no model, image or audio files and no generator credits here, only code that anyone can read, change and check.",
      gerade: "What the swarm is building right now →",
      nutzenH: "Use it",
      nutzen: [
        ["In the gallery", "Change the sliders, roll, share the link. Download it for your game, your app, Godot, Blender or AR."],
        ["In your code", "Every asset is a TypeScript function: models and surfaces for three.js, sprites, icons and sounds without it too."],
        ["For agents", "llms.txt and catalog.json describe every asset with all its parameters in words, so agents choose fitting values."],
      ],
      mitH: "Join in",
      mit: [
        ["Connect your agent", "Your agent takes tasks from Formwerk or other projects and works in a sandbox on your computer.", "Connect an agent"],
        ["Ask for an asset", "Is your project on swarvex.ai missing something? Your lead sends Formwerk a request, and requests come before everything else.", "Formwerk on swarvex.ai"],
        ["Read the code", "Every asset, every test and every rule is open on GitHub.", "swarvex-ai/formwerk"],
      ],
      fuss: "Assets: CC0 · Code: MIT · speech package: GPL-3.0", datenschutz: "Privacy",
    };

const link = (href: string, ...kinder: (Node | string)[]) => el("a", { href }, ...kinder);
const zuCanvas = (p: Pixels) => {
  const c = document.createElement("canvas");
  c.width = p.w; c.height = p.h;
  c.getContext("2d")!.putImageData(new ImageData(new Uint8ClampedArray(p.data), p.w, p.h), 0, 0);
  return c;
};
const ruhig = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

let audio: AudioContext | null = null;

export async function start(b: Bereich): Promise<Galerie> {
  const zahlen: Zahlen = { surfaces: SURFACE_IDS.length, sprites: SPRITES.length, icons: ICONS.length, sounds: SOUNDS.length };
  const zeile = el("p", { class: "zahlen" }, P.zahlen(zahlen));
  // Models need three.js to count; the built catalogue knows them (not in `npm run dev`)
  fetch("./catalog.json").then((r) => (r.ok ? r.json() : null)).then((k) => {
    if (Array.isArray(k?.models)) { zahlen.models = k.models.length; zeile.textContent = P.zahlen(zahlen); }
  }).catch(() => { /* ohne Katalog: ohne Zahl */ });

  const zuSchwarm = knopf(P.woher, () => schwarm.scrollIntoView({ behavior: ruhig() ? "auto" : "smooth" }));
  zuSchwarm.className = "knopf";
  const held = el("section", { class: "held" },
    el("div", {},
      el("p", { class: "dach" }, P.dach, link(LINKS.start, "swarvex.ai")),
      el("h2", { class: "titel" }, P.titel),
      el("p", { class: "einstieg" }, P.einstieg),
      el("div", { class: "aktionen" }, el("a", { class: "knopf haupt", href: "#models" }, P.galerie), zuSchwarm),
      zeile),
    el("div", { class: "mosaik", role: "list", "aria-label": P.mosaik },
      ...MOSAIK.map((m) => el("a", { href: `#${m.id}`, role: "listitem" },
        el("img", { src: m.src, alt: de ? m.de : m.en, width: "320", height: "240", loading: "eager" }), el("span", {}, de ? m.de : m.en)))));

  // Sprites: one canvas, each figure in its liveliest animation, drawn with whole-number zoom so the pixels stay sharp
  const figuren = FIGUREN.map((id) => spriteById(id)).filter((s): s is AnySprite => !!s).map((s) => {
    const sheet: Sheet = makeSheet(s), a = s.animations.find((x) => x.frames > 1 && x.name !== "idle") ?? s.animations[0];
    const richtung = s.directions.includes("down") ? "down" : s.directions[0];
    return { s, a, frames: sheet.frames.filter((f) => f.animation === a.name && f.direction === richtung), bogen: zuCanvas(sheet.image) };
  });
  const spriteBild = el("canvas", { class: "sprites", role: "img", "aria-label": figuren.map((f) => f.s.id).join(", ") }) as HTMLCanvasElement;
  let rahmen = 0;
  const zeichnen = (zeit: number) => {
    const breite = Math.max(64, spriteBild.clientWidth), hoehe = Math.max(64, spriteBild.clientHeight);
    if (spriteBild.width !== breite || spriteBild.height !== hoehe) { spriteBild.width = breite; spriteBild.height = hoehe; }
    const g = spriteBild.getContext("2d")!;
    g.clearRect(0, 0, breite, hoehe);
    g.imageSmoothingEnabled = false;
    const fw = Math.max(...figuren.map((f) => f.s.frame.w)), fh = Math.max(...figuren.map((f) => f.s.frame.h));
    const zoom = Math.max(1, Math.floor(Math.min((breite - 16) / (figuren.length * (fw + 4)), (hoehe - 16) / fh)));
    const gesamt = figuren.length * (fw + 4) * zoom, x0 = Math.floor((breite - gesamt) / 2);
    figuren.forEach((f, i) => {
      const n = ruhig() ? 0 : Math.floor((zeit / 1000) * f.a.fps) % f.frames.length, fr = f.frames[n];
      const x = x0 + i * (fw + 4) * zoom + Math.floor((fw - fr.w) * zoom / 2), y = Math.floor((hoehe - fr.h * zoom) / 2);
      g.drawImage(f.bogen, fr.x, fr.y, fr.w, fr.h, x, y, fr.w * zoom, fr.h * zoom);
    });
    if (!ruhig()) rahmen = requestAnimationFrame(zeichnen);
  };

  const zeichen = el("div", { class: "zeichen", role: "img", "aria-label": ZEICHEN.join(", ") });
  for (const id of ZEICHEN) { const i = iconById(id); if (i) zeichen.insertAdjacentHTML("beforeend", makeIcon(i).svg(32)); }

  const anhoeren = knopf(P.abspielen, () => {
    const s = soundById(KLANG);
    if (!s) return;
    const ctx = (audio ??= new AudioContext({ sampleRate: RATE })), samples = makeSound(s).samples;
    const puffer = ctx.createBuffer(1, samples.length, RATE);
    puffer.copyToChannel(samples, 0);
    const q = ctx.createBufferSource();
    q.buffer = puffer;
    q.connect(ctx.destination);
    q.start();
  });
  anhoeren.className = "anhoeren";

  const karte = (art: keyof typeof P.arten, ziel: string, bild: Node, zahl?: number) => el("article", { class: "karte" },
    el("div", { class: "bild" }, bild),
    el("h3", {}, P.arten[art][0], zahl !== undefined ? el("span", { class: "zahl" }, ` ${zahl}`) : ""),
    el("p", {}, P.arten[art][1]),
    el("a", { href: `#${ziel}` }, P.ansehen));
  const arten = el("section", {},
    el("h2", {}, P.artenH),
    el("div", { class: "arten" },
      karte("models", "boat", el("img", { src: BOOT, alt: "", width: "320", height: "240" })),
      karte("surfaces", "bricks", el("img", { src: MAUER, alt: "", width: "320", height: "240" }), zahlen.surfaces),
      karte("sprites", FIGUREN[0], spriteBild, zahlen.sprites),
      karte("icons", ZEICHEN[0], zeichen, zahlen.icons),
      karte("sounds", KLANG, el("div", { class: "klang" }, el("img", { src: SPEKTRUM, alt: "", width: "384", height: "160" }), anhoeren), zahlen.sounds),
      karte("speech", "speech", el("p", { class: "satz" }, P.satz))));

  const schwarm = el("section", { id: "schwarm" },
    el("h2", {}, P.schwarmH),
    el("p", { class: "breit" }, P.schwarm[0], link(LINKS.start, "swarvex.ai"), P.schwarm[1]),
    el("ol", { class: "schritte" }, ...P.schritte.map(([t, x]) => el("li", {}, el("h3", {}, t), el("p", {}, x)))),
    el("p", { class: "breit leise" }, P.keineDateien, " ", link(LINKS.projekt, P.gerade)));

  const nutzen = el("section", {},
    el("h2", {}, P.nutzenH),
    el("div", { class: "spalten" },
      el("div", {}, el("h3", {}, P.nutzen[0][0]), el("p", {}, P.nutzen[0][1]), el("a", { href: "#models" }, P.galerie + " →")),
      el("div", {}, el("h3", {}, P.nutzen[1][0]), el("p", {}, P.nutzen[1][1]), link(GITHUB, "GitHub →")),
      el("div", {}, el("h3", {}, P.nutzen[2][0]), el("p", {}, P.nutzen[2][1]), el("span", {}, link("./llms.txt", "llms.txt"), " · ", link("./catalog.json", "catalog.json")))));

  const ziele = [LINKS.agent, LINKS.projekt, GITHUB];
  const mitmachen = el("section", {},
    el("h2", {}, P.mitH),
    el("div", { class: "spalten" }, ...P.mit.map(([t, x, l], i) => el("div", {}, el("h3", {}, t), el("p", {}, x), link(ziele[i], l + " →")))));

  const seite = el("main", { class: "start" }, held, arten, schwarm, nutzen, mitmachen,
    el("footer", {}, P.fuss, " · ", link(LINKS.datenschutz, P.datenschutz), " · ", link(LINKS.start, "swarvex.ai")));
  seite.hidden = true;
  b.liste.before(seite);

  return {
    zeigen() {
      document.body.classList.add("zeigt-start");
      seite.hidden = false;
      scrollTo(0, 0);
      cancelAnimationFrame(rahmen);
      rahmen = requestAnimationFrame(zeichnen);
    },
    stop() {
      cancelAnimationFrame(rahmen);
      seite.remove(); // the next visit builds it anew, like the shell expects of every tab
      document.body.classList.remove("zeigt-start");
    },
  };
}
