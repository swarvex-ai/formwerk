// The model list as a catalogue overview: a filter bar (collection, material, colour, style, order), a line that counts
// what matches, and one entry per model with a small line of its triangles and code size. The list appears at once with
// its titles; the numbers fill in a few assets per slice so the tab stays responsive. Filter and order choices live in
// this module: they survive switching assets and tabs, and never go into the hash.
import { ASSETS } from "../assets";
import { CATEGORIES, type AnyAsset, type Category } from "../assets/define";
import type { Text } from "../core/params";
import { MATERIALS, type MaterialKind } from "../materials";
import { COLLECTIONS, REALISTIC } from "./collections";
import { codeBytes, factsAtDefaults, kb, type Colour } from "./facts";
import { de, el, knopf, text, zahl } from "./shell";

type Reihenfolge = "kategorie" | "dreiecke" | "code" | "mischen";

const M = de
  ? { sammlung: "Sammlung", material: "Material", farbe: "Farbe", stil: "Stil", reihenfolge: "Reihenfolge", alle: "Alle", von: "von",
      kategorien: { furniture: "Möbel", architecture: "Architektur", nature: "Natur", vehicles: "Fahrzeuge", props: "Requisiten" } as Record<Category, string>,
      orden: { kategorie: "Nach Kategorie", dreiecke: "Wenigste Dreiecke", code: "Kleinster Code", mischen: "Mischen" } as Record<Reihenfolge, string>,
      stilen: { stylised: "Stilisiert", realistic: "Realistisch" },
      mischen: "Neu mischen", keine: "Kein Modell passt", zurueck: "Filter zurücksetzen" }
  : { sammlung: "Collection", material: "Material", farbe: "Colour", stil: "Style", reihenfolge: "Order", alle: "All", von: "of",
      kategorien: { furniture: "Furniture", architecture: "Architecture", nature: "Nature", vehicles: "Vehicles", props: "Props" } as Record<Category, string>,
      orden: { kategorie: "By category", dreiecke: "Fewest triangles", code: "Smallest code", mischen: "Shuffle" } as Record<Reihenfolge, string>,
      stilen: { stylised: "Stylised", realistic: "Realistic" },
      mischen: "Shuffle again", keine: "No model matches", zurueck: "Reset filters" };

// Labels for the material kinds of src/materials; a kind without a label shows its id.
const MATERIALNAMEN: Partial<Record<MaterialKind, Text>> = {
  wood: { de: "Holz", en: "Wood" }, metal: { de: "Metall", en: "Metal" }, iron: { de: "Eisen", en: "Iron" },
  paint: { de: "Lack", en: "Paint" }, stone: { de: "Stein", en: "Stone" }, plastic: { de: "Kunststoff", en: "Plastic" },
  bark: { de: "Rinde", en: "Bark" }, leaf: { de: "Laub", en: "Leaves" }, glow: { de: "Leuchten", en: "Glow" },
};
const FARBNAMEN: Record<Colour, Text> = {
  red: { de: "Rot", en: "Red" }, orange: { de: "Orange", en: "Orange" }, yellow: { de: "Gelb", en: "Yellow" },
  green: { de: "Grün", en: "Green" }, blue: { de: "Blau", en: "Blue" }, purple: { de: "Violett", en: "Purple" },
  brown: { de: "Braun", en: "Brown" }, black: { de: "Schwarz", en: "Black" }, white: { de: "Weiß", en: "White" },
  grey: { de: "Grau", en: "Grey" },
};

type Stand = { dreiecke?: number; byte?: number; materialien: MaterialKind[]; farben: Colour[] };
const stand = new Map<string, Stand>();
const zustand = { sammlung: "alle", material: "alle", farbe: "alle", stil: "stylised", reihenfolge: "kategorie" as Reihenfolge };
let mischung: string[] = [];
let aktuell = "", auswahl: (a: AnyAsset) => void = () => {};
let balken: HTMLElement | null = null, status: HTMLElement | null = null, eintraege: HTMLElement | null = null;
let mischKnopf: HTMLButtonElement | null = null;
const felder: Record<string, HTMLSelectElement> = {};

const mischen = () => {
  const ids = ASSETS.map((a) => a.id);
  for (let i = ids.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [ids[i], ids[j]] = [ids[j], ids[i]]; }
  return ids;
};

function passt(a: AnyAsset): boolean {
  if (zustand.sammlung !== "alle") {
    const s = COLLECTIONS.find((c) => c.id === zustand.sammlung);
    if (s && !s.ids.includes(a.id)) return false;
  }
  if (REALISTIC.length && (zustand.stil === "realistic") !== REALISTIC.includes(a.id)) return false;
  const f = stand.get(a.id);
  if (!f) return true; // facts not yet known: never hidden by material or colour
  if (zustand.material !== "alle" && !f.materialien.includes(zustand.material as MaterialKind)) return false;
  if (zustand.farbe !== "alle" && !f.farben.includes(zustand.farbe as Colour)) return false;
  return true;
}

function reihen(liste: AnyAsset[]): AnyAsset[] {
  if (zustand.reihenfolge === "dreiecke") return [...liste].sort((x, y) => (stand.get(x.id)?.dreiecke ?? Infinity) - (stand.get(y.id)?.dreiecke ?? Infinity));
  if (zustand.reihenfolge === "code") return [...liste].sort((x, y) => (stand.get(x.id)?.byte ?? Infinity) - (stand.get(y.id)?.byte ?? Infinity));
  if (zustand.reihenfolge === "mischen") {
    const rang = new Map(mischung.map((id, i) => [id, i]));
    return [...liste].sort((x, y) => (rang.get(x.id) ?? 0) - (rang.get(y.id) ?? 0));
  }
  return liste;
}

function eintrag(a: AnyAsset): HTMLElement {
  const f = stand.get(a.id), teile: string[] = [];
  if (f?.dreiecke !== undefined) teile.push(`${zahl(f.dreiecke, 0)} △`);
  if (f?.byte) teile.push(kb(f.byte));
  const kn = el("button", { type: "button", class: "modell-eintrag", "aria-pressed": String(a.id === aktuell) }, text(a.title));
  kn.append(el("small", {}, teile.join(" · ")));
  kn.onclick = () => auswahl(a);
  return kn;
}

function zeichnen() {
  if (!status || !eintraege) return;
  const sichtbar = reihen(ASSETS.filter(passt));
  const zeilen: (Node | HTMLElement)[] = [el("span", {}, `${zahl(sichtbar.length, 0)} ${M.von} ${zahl(ASSETS.length, 0)}`)];
  if (!sichtbar.length) zeilen.push(knopf(M.zurueck, () => { zustand.sammlung = zustand.material = zustand.farbe = "alle"; zustand.stil = "stylised"; anpassen(); }));
  status.replaceChildren(...zeilen);
  if (!sichtbar.length) { eintraege.replaceChildren(el("p", { class: "leise" }, M.keine)); return; }
  if (zustand.reihenfolge === "kategorie") {
    eintraege.replaceChildren(...CATEGORIES.filter((k) => sichtbar.some((a) => a.category === k)).map((k) =>
      el("section", {}, el("h2", {}, M.kategorien[k]), ...sichtbar.filter((a) => a.category === k).map(eintrag))));
  } else eintraege.replaceChildren(...sichtbar.map(eintrag));
}

function anpassen() {
  for (const [k, s] of Object.entries(felder)) s.value = k === "reihenfolge" ? zustand.reihenfolge : (zustand as Record<string, string>)[k];
  if (mischKnopf) mischKnopf.hidden = zustand.reihenfolge !== "mischen";
  zeichnen();
}

function wahlFeld(id: string, beschriftung: string, key: "sammlung" | "material" | "farbe" | "stil", werte: [string, string][]) {
  const select = el("select", { id }, ...werte.map(([w, t]) => el("option", { value: w }, t)));
  select.value = (zustand as Record<string, string>)[key];
  select.onchange = () => { (zustand as Record<string, string>)[key] = select.value; zeichnen(); };
  felder[key] = select;
  return el("div", { class: "modell-feld" }, el("label", { for: id }, beschriftung), select);
}

function baue() {
  const paar = (werte: string[], labeln: Record<string, Text | undefined>) => werte.map((w) => [w, text(labeln[w] ?? { de: w, en: w })] as [string, string]);
  const reihenSelect = el("select", { id: "f-reihenfolge" }, ...(Object.keys(M.orden) as Reihenfolge[]).map((o) => el("option", { value: o }, M.orden[o])));
  reihenSelect.value = zustand.reihenfolge;
  reihenSelect.onchange = () => {
    zustand.reihenfolge = reihenSelect.value as Reihenfolge;
    if (zustand.reihenfolge === "mischen" && !mischung.length) mischung = mischen();
    if (mischKnopf) mischKnopf.hidden = zustand.reihenfolge !== "mischen";
    zeichnen();
  };
  felder.reihenfolge = reihenSelect;
  mischKnopf = knopf("↻", () => { mischung = mischen(); zeichnen(); });
  mischKnopf.className = "knopf-mischen";
  mischKnopf.setAttribute("aria-label", M.mischen);
  mischKnopf.hidden = zustand.reihenfolge !== "mischen";
  const stilFeld = wahlFeld("f-stil", M.stil, "stil", [["stylised", M.stilen.stylised], ["realistic", M.stilen.realistic]]);
  stilFeld.hidden = REALISTIC.length === 0;
  balken = el("div", { class: "modell-filter" },
    wahlFeld("f-sammlung", M.sammlung, "sammlung", [["alle", M.alle], ...COLLECTIONS.map((c) => [c.id, text(c.label)] as [string, string])]),
    wahlFeld("f-material", M.material, "material", [["alle", M.alle], ...paar([...MATERIALS], MATERIALNAMEN)]),
    wahlFeld("f-farbe", M.farbe, "farbe", [["alle", M.alle], ...paar(Object.keys(FARBNAMEN), FARBNAMEN)]),
    stilFeld,
    el("div", { class: "modell-feld" }, el("label", { for: "f-reihenfolge" }, M.reihenfolge), el("div", { class: "reihenfolge-feld" }, reihenSelect, mischKnopf)));
  status = el("p", { class: "modell-status" });
  eintraege = el("div");
}

let rechnet = false, neuFällig = false;
const neuZeichnen = () => {
  if (neuFällig) return;
  neuFällig = true;
  setTimeout(() => { neuFällig = false; zeichnen(); }, 50);
};
/** Triangles and draw calls from one build at defaults, code size from the raw source; a few assets per slice. */
function berechne() {
  if (rechnet) return;
  const schlange = ASSETS.filter((a) => !stand.has(a.id));
  if (!schlange.length) return;
  rechnet = true;
  const abarbeiten = () => {
    for (let i = 0; i < 3 && schlange.length; i++) {
      const a = schlange.shift()!;
      const f = factsAtDefaults(a);
      const s: Stand = { dreiecke: f.triangles, materialien: f.materials, farben: f.colours };
      stand.set(a.id, s);
      codeBytes(a.id).then((bytes) => { s.byte = bytes; neuZeichnen(); });
    }
    neuZeichnen();
    if (schlange.length) setTimeout(abarbeiten, 0); else rechnet = false;
  };
  setTimeout(abarbeiten, 0);
}

/** The models tab's list: filter bar, count line and the entries; `pick` opens a model. */
export function drawModelList(liste: HTMLElement, current: string, pick: (a: AnyAsset) => void) {
  aktuell = current;
  auswahl = pick;
  if (!balken) baue();
  if (mischKnopf) mischKnopf.hidden = zustand.reihenfolge !== "mischen";
  liste.replaceChildren(balken!, status!, eintraege!);
  zeichnen();
  berechne();
}
