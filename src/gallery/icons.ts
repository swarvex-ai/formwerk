// The icons tab: every icon with controls generated from its parameter schema (its own and the shared pen), presets,
// the icon large on a light and a dark card, in the usual interface sizes beside it, a share link, a code snippet and
// downloads made in the browser: SVG (text colour), PNG in any size, or a .zip with both. No three.js.
import { zipSync } from "three/addons/libs/fflate.module.js";
import { defaults, random, withPreset, type Param } from "../core/params";
import { rng } from "../core/rng";
import { legibility } from "../core/vector";
import type { Pixels } from "../core/pixels";
import { ICONS, iconById } from "../icons";
import { ICON_CATEGORIES, makeIcon, ownParams, type AnyIcon, type MadeIcon } from "../icons/define";
import { de, el, feld, hashSetzen, hashTeile, kebabZuCamel, knopf, kopieren, speichern, T, text, type Bereich, type Galerie } from "./shell";

const GROESSEN = [16, 20, 24, 32, 48];
const PNG_GROESSEN = [16, 24, 32, 48, 64, 96, 128, 256, 512, 1024];
const P = de
  ? { kategorien: { navigation: "Navigation", actions: "Aktionen", status: "Status", objects: "Gegenstände" }, eigene: "Form", stift: "Stift und Stil",
      svg: "SVG herunterladen", png: "PNG herunterladen", zip: "Alles (.zip: SVG und PNG von 16 bis 512 px)", groesse: "PNG-Größe",
      hinweis: "Das SVG nimmt die Textfarbe (currentColor) und skaliert verlustfrei; die Farbe gilt für die PNG-Dateien.",
      liest: "liest bei 24 px", bild: "Das Icon groß auf hellem und dunklem Grund, daneben in den üblichen Größen", raster: "Raster 24 × 24", strich: "Strich" }
  : { kategorien: { navigation: "Navigation", actions: "Actions", status: "Status", objects: "Objects" }, eigene: "Shape", stift: "Pen and style",
      svg: "Download SVG", png: "Download PNG", zip: "Everything (.zip: SVG and PNG from 16 to 512 px)", groesse: "PNG size",
      hinweis: "The SVG takes the text colour (currentColor) and scales without loss; the colour applies to the PNG files.",
      liest: "reads at 24 px", bild: "The icon large on a light and a dark background, beside it in the usual sizes", raster: "grid 24 × 24", strich: "stroke" };

const png = (p: Pixels): Promise<Uint8Array> => new Promise((ok, fehler) => {
  const c = document.createElement("canvas");
  c.width = p.w; c.height = p.h;
  c.getContext("2d")!.putImageData(new ImageData(new Uint8ClampedArray(p.data), p.w, p.h), 0, 0);
  c.toBlob(async (b) => (b ? ok(new Uint8Array(await b.arrayBuffer())) : fehler(new Error("PNG"))), "image/png");
});

export async function start(b: Bereich): Promise<Galerie> {
  const dreid = b.buehne.querySelector<HTMLCanvasElement>("canvas.dreid");
  if (dreid) dreid.hidden = true;
  let buehne = b.buehne.querySelector<HTMLElement>(".iconbild");
  if (!buehne) { buehne = el("div", { class: "iconbild", role: "img", "aria-label": P.bild }); b.buehne.prepend(buehne); }
  const flaeche = buehne;
  flaeche.hidden = false;

  let icon: AnyIcon = ICONS[0], werte: Record<string, unknown> = {}, gemacht: MadeIcon = makeIcon(icon), pngGroesse = 256;
  const nichtStandard = () => Object.fromEntries(Object.entries(werte).filter(([k, v]) => v !== icon.params[k].default));
  const name = () => icon.id + (Object.keys(nichtStandard()).length ? "-" + Object.values(nichtStandard()).map(String).join("-").replace(/[^a-z0-9.-]+/gi, "") : "");

  const zeichnen = () => {
    const svg = gemacht.svg(192), karte = (klasse: string, farbe: string) => el("div", { class: `karte ${klasse}`, style: `color:${farbe}` },
      el("div", { class: "gross" }), el("div", { class: "klein" }, ...GROESSEN.map((g) => el("span", { title: `${g} px` }))));
    const hell = karte("hell", String(werte.color)), dunkel = karte("dunkel", "#e8eaed");
    for (const k of [hell, dunkel]) {
      k.querySelector(".gross")!.innerHTML = svg;
      k.querySelectorAll(".klein span").forEach((s, i) => { s.innerHTML = gemacht.svg(GROESSEN[i]); });
    }
    flaeche.replaceChildren(hell, dunkel);
  };

  const neuBauen = () => {
    gemacht = makeIcon(icon, werte);
    zeichnen();
    const lesbar = legibility(makeIcon(icon, { ...werte, badge: false }).ops, gemacht.pen);
    b.werte.textContent = `${P.raster} · ${P.strich} ${gemacht.pen.width} · ${(gemacht.svg().length / 1024).toFixed(1)} KB SVG · ${lesbar ? "⚠ " + lesbar : "✓ " + P.liest}`;
    hashSetzen(icon.id, nichtStandard(), 1);
  };

  const listeZeichnen = () => {
    b.liste.replaceChildren(...ICON_CATEGORIES.filter((k) => ICONS.some((i) => i.category === k)).map((k) => el("section", {}, el("h2", {}, P.kategorien[k]),
      ...ICONS.filter((i) => i.category === k).map((i) => {
        const k2 = el("button", { type: "button", "aria-pressed": String(i.id === icon.id), class: "mitbild" });
        k2.innerHTML = makeIcon(i).svg(20);
        k2.append(" ", text(i.title));
        k2.onclick = () => { icon = i; werte = defaults(i.params); listeZeichnen(); reglerZeichnen(); neuBauen(); };
        return k2;
      }))));
  };

  const reglerZeichnen = () => {
    const looks = el("div", { class: "looks", role: "group", "aria-label": T.looks }, ...Object.entries(icon.presets).map(([n, p]) =>
      knopf(text(p.label), () => { werte = withPreset(icon.params, icon.presets, { preset: n }); reglerZeichnen(); neuBauen(); })));
    const feldFuer = (k: string) => feld(k, icon.params[k] as Param, werte[k], (v) => { werte = { ...werte, [k]: v }; neuBauen(); });
    const eigene = ownParams(icon), stift = Object.keys(icon.params).filter((k) => !eigene.includes(k));
    const groesse = el("select", { id: "i-groesse" }, ...PNG_GROESSEN.map((g) => el("option", { value: String(g) }, `${g} × ${g} px`))) as HTMLSelectElement;
    groesse.value = String(pngGroesse);
    groesse.onchange = () => { pngGroesse = Number(groesse.value); };
    const svgLaden = knopf(P.svg, () => speichern(gemacht.svg() + "\n", "image/svg+xml", `${name()}.svg`));
    svgLaden.classList.add("haupt");
    const pngLaden = knopf(P.png, async (k) => { k.disabled = true; try { speichern(await png(gemacht.pixels(pngGroesse)) as Uint8Array<ArrayBuffer>, "image/png", `${name()}-${pngGroesse}.png`); } finally { k.disabled = false; } });
    const zipLaden = knopf(P.zip, async (k) => {
      k.disabled = true;
      try {
        const dateien: Record<string, Uint8Array> = { [`${name()}.svg`]: new TextEncoder().encode(gemacht.svg() + "\n") };
        for (const g of PNG_GROESSEN.filter((x) => x <= 512)) dateien[`${name()}-${g}.png`] = await png(gemacht.pixels(g));
        speichern(zipSync(dateien, { level: 6 }) as Uint8Array<ArrayBuffer>, "application/zip", `${name()}.zip`);
      } finally { k.disabled = false; }
    });
    b.regler.replaceChildren(
      el("h2", {}, text(icon.title)), el("p", { class: "leise" }, text(icon.description)),
      el("h3", {}, T.looks), looks,
      el("h3", {}, P.eigene), ...eigene.map(feldFuer),
      el("h3", {}, P.stift), ...stift.map(feldFuer),
      el("div", { class: "knoepfe" },
        knopf(T.wuerfeln, () => { werte = random(icon.params, rng(Date.now() % 100000)); reglerZeichnen(); neuBauen(); }),
        knopf(T.zurueck, () => { werte = defaults(icon.params); reglerZeichnen(); neuBauen(); }),
        knopf(T.link, (k) => kopieren(k, location.href)),
        knopf(T.code, (k) => kopieren(k, `import { ${kebabZuCamel(icon.id)} } from "formwerk/icons";\n\nconst icon = ${kebabZuCamel(icon.id)}(${JSON.stringify(nichtStandard())});\nelement.innerHTML = icon.svg(24); // takes the text colour (currentColor)\nconst pixels = icon.pixels(256);   // RGBA, in the colour of \`color\`\n`))),
      el("div", { class: "export" }, el("h3", {}, T.export), el("small", {}, P.hinweis), svgLaden,
        el("div", { class: "feld" }, el("label", { for: "i-groesse" }, P.groesse), groesse), pngLaden, zipLaden));
  };

  return {
    zeigen() {
      const h = hashTeile();
      icon = iconById(h.id) ?? ICONS[0];
      werte = withPreset(icon.params, icon.presets, h.werte);
      listeZeichnen();
      reglerZeichnen();
      neuBauen();
    },
    stop() { flaeche.hidden = true; },
  };
}
