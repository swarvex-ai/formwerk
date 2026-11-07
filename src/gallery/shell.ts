// The gallery shell: header with the tabs (models, sounds), the three regions (list, stage, controls) and what every
// tab shares (parameter fields, buttons, copying, downloads). Each kind of asset is its own module, loaded when its
// tab opens, so three.js only comes with the models. No server work: the page is static.
import type { Param, Text } from "../core/params";
import { SOUNDS, soundById } from "../sounds";

export const de = (new URLSearchParams(location.search).get("lang") ?? navigator.language).startsWith("de");
export const T = de
  ? { reiter: { models: "Modelle", sounds: "Klänge" }, seed: "Seed", wuerfeln: "Würfeln", zurueck: "Zurücksetzen",
      code: "Code kopieren", link: "Link kopieren", kopiert: "Kopiert", looks: "Looks", export: "Herunterladen", laden: "Herunterladen",
      hinweis: "Jedes Asset ist Code: Parameter ändern, Link teilen, für Godot, Blender, AR oder dein Spiel herunterladen. Lizenz der Assets: CC0.",
      beitragen: "Eigene Assets beitragen", agenten: "Für Agenten" }
  : { reiter: { models: "Models", sounds: "Sounds" }, seed: "Seed", wuerfeln: "Roll", zurueck: "Reset",
      code: "Copy code", link: "Copy link", kopiert: "Copied", looks: "Looks", export: "Download", laden: "Download",
      hinweis: "Every asset is code: change the parameters, share the link, download it for Godot, Blender, AR or your game. Asset licence: CC0.",
      beitragen: "Contribute your own assets", agenten: "For agents" };

export const el = <K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}, ...kinder: (Node | string)[]) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  e.append(...kinder);
  return e;
};
export const text = (t: Text) => (de ? t.de : t.en);
export const zahl = (x: number, stellen = 2) => x.toLocaleString(de ? "de-DE" : "en-GB", { maximumFractionDigits: stellen });
export const kebabZuCamel = (id: string) => id.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

export const knopf = (beschriftung: string, aktion: (b: HTMLButtonElement) => void) => {
  const b = el("button", { type: "button" }, beschriftung) as HTMLButtonElement;
  b.onclick = () => aktion(b);
  return b;
};
export const kopieren = async (k: HTMLButtonElement, inhalt: string) => {
  try { await navigator.clipboard.writeText(inhalt); const alt = k.textContent; k.textContent = T.kopiert; setTimeout(() => (k.textContent = alt), 1500); } catch { /* ohne Zwischenablage */ }
};
export const speichern = (inhalt: BlobPart, typ: string, datei: string) => {
  const a = el("a", { href: URL.createObjectURL(new Blob([inhalt], { type: typ })), download: datei });
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
};

/** A control for one parameter, generated from its schema: slider, choice, colour or checkbox, with its description. */
export function feld(name: string, p: Param, wert: unknown, aendern: (v: unknown) => void): HTMLElement {
  const id = `p-${name}`, hilfe = `h-${name}`;
  const label = el("label", { for: id }, text(p.label)), beschreibung = el("small", { id: hilfe }, text(p.describe));
  let eingabe: HTMLInputElement | HTMLSelectElement;
  if (p.type === "choice") {
    eingabe = el("select", { id }, ...p.options.map((o) => el("option", { value: o }, p.labels ? text(p.labels[o]) : o))) as HTMLSelectElement;
    eingabe.value = String(wert);
    eingabe.onchange = () => aendern(eingabe.value);
  } else if (p.type === "boolean") {
    const box = el("input", { id, type: "checkbox" }) as HTMLInputElement;
    box.checked = Boolean(wert);
    box.onchange = () => aendern(box.checked);
    eingabe = box;
  } else if (p.type === "color") {
    eingabe = el("input", { id, type: "color", value: String(wert) }) as HTMLInputElement;
    eingabe.oninput = () => aendern(eingabe.value);
  } else {
    const einheit = p.type === "number" && p.unit ? " " + p.unit : "", step = p.type === "number" ? p.step : 1;
    const regler = el("input", { id, type: "range", min: String(p.min), max: String(p.max), step: String(step), value: String(wert) }) as HTMLInputElement;
    const ausgabe = el("output", { for: id }, `${zahl(Number(wert), 3)}${einheit}`);
    regler.oninput = () => { ausgabe.textContent = `${zahl(Number(regler.value), 3)}${einheit}`; aendern(Number(regler.value)); };
    regler.setAttribute("aria-describedby", hilfe);
    return el("div", { class: "feld" }, label, regler, ausgabe, beschreibung);
  }
  eingabe.setAttribute("aria-describedby", hilfe);
  return el("div", { class: "feld" }, label, eingabe, beschreibung);
}

/** Hash: #<id>?<non-default values>&seed=<n>, or #<id>?preset=<name> from the catalogue. */
export function hashTeile(): { id: string; werte: Record<string, string>; seed: number } {
  const [id, rest] = location.hash.slice(1).split("?");
  const q = new URLSearchParams(rest ?? "");
  return { id, werte: Object.fromEntries(q), seed: Math.max(1, Number(q.get("seed")) || 1) };
}
export function hashSetzen(id: string, abweichend: Record<string, unknown>, seed: number) {
  const q = new URLSearchParams(Object.entries(abweichend).map(([k, v]) => [k, String(v)]));
  if (seed !== 1) q.set("seed", String(seed));
  history.replaceState(null, "", `#${id}${q.size ? "?" + q : ""}`);
}

export type Bereich = { liste: HTMLElement; regler: HTMLElement; buehne: HTMLElement; werte: HTMLElement };
export type Galerie = { zeigen(): void; stop(): void };
type Art = keyof typeof T.reiter;

export async function startShell() {
  const wurzel = document.querySelector("#app")!, buehne = document.querySelector<HTMLElement>(".buehne")!;
  const b: Bereich = { liste: el("nav", { class: "liste", "aria-label": "Assets" }), regler: el("form", { class: "regler" }), buehne, werte: el("p", { class: "werte" }) };
  const reiter = Object.fromEntries((Object.keys(T.reiter) as Art[]).map((art) => [art, knopf(T.reiter[art], () => {
    // Models: an empty hash shows the first model; sounds: the first sound
    location.hash = art === "sounds" ? SOUNDS[0].id : "";
  })])) as Record<Art, HTMLButtonElement>;
  wurzel.append(
    el("header", {}, el("h1", {}, "Formwerk"), el("nav", { class: "reiter", "aria-label": de ? "Arten" : "Kinds" }, ...Object.values(reiter)),
      el("p", {}, T.hinweis),
      el("span", { class: "links" }, el("a", { href: "https://github.com/swarvex-ai/formwerk" }, T.beitragen), " · ",
        `${T.agenten}: `, el("a", { href: "./llms.txt" }, "llms.txt"), " ", el("a", { href: "./catalog.json" }, "catalog.json"))),
    b.liste, b.regler);
  buehne.append(b.werte);

  let art: Art | null = null, aktiv: Galerie | null = null, laeuft: Promise<void> = Promise.resolve();
  const laden = async () => {
    const neu: Art = soundById(hashTeile().id) ? "sounds" : "models";
    if (neu === art && aktiv) { aktiv.zeigen(); return; }
    aktiv?.stop();
    aktiv = null;
    art = neu;
    for (const [k, knopfE] of Object.entries(reiter)) knopfE.setAttribute("aria-current", String(k === neu));
    const modul = neu === "sounds" ? await import("./sounds") : await import("./models");
    if (art !== neu) return;
    aktiv = await modul.start(b);
    aktiv.zeigen();
  };
  addEventListener("hashchange", () => { laeuft = laeuft.then(laden); });
  laeuft = laeuft.then(laden);
  await laeuft;
}
