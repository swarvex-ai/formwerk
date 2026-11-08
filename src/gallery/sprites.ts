// The sprites tab: every sprite with controls generated from its parameter schema, presets, the chosen animation
// playing large in the chosen direction, the whole sheet beside it, a share link, a code snippet and a .zip with the
// sheet (.png), Godot SpriteFrames (.tres) and a JSON for other engines, made in the browser. No three.js.
import { zipSync } from "three/addons/libs/fflate.module.js";
import { defaults, random, withPreset, type Param } from "../core/params";
import { rng } from "../core/rng";
import type { Pixels } from "../core/pixels";
import { SPRITES, spriteById } from "../sprites";
import { animationName, godotSpriteFrames, makeSheet, sheetJson, SPRITE_CATEGORIES, type AnySprite, type Direction, type Sheet } from "../sprites/define";
import { de, el, feld, hashSetzen, hashTeile, kebabZuCamel, knopf, kopieren, speichern, T, text, type Bereich, type Galerie } from "./shell";

const P = de
  ? { kategorien: { characters: "Figuren", creatures: "Kreaturen", items: "Gegenstände" }, animation: "Animation", richtung: "Richtung",
      richtungen: { down: "↓ vorn", left: "← links", right: "→ rechts", up: "↑ hinten" } as Record<Direction, string>,
      zip: "Herunterladen (.zip: PNG-Bogen, Godot SpriteFrames, JSON)", pixel: "Pixel pro Bild", bilder: "Bilder", farben: "Farben",
      hinweis: "In Godot: Filter der Textur auf Nearest stellen, die .tres als SpriteFrames eines AnimatedSprite2D oder AnimatedSprite3D nutzen.",
      bild: "Der Sprite groß in der gewählten Animation und Richtung, daneben der ganze Bogen" }
  : { kategorien: { characters: "Characters", creatures: "Creatures", items: "Items" }, animation: "Animation", richtung: "Direction",
      richtungen: { down: "↓ front", left: "← left", right: "→ right", up: "↑ back" } as Record<Direction, string>,
      zip: "Download (.zip: PNG sheet, Godot SpriteFrames, JSON)", pixel: "pixels per frame", bilder: "frames", farben: "colours",
      hinweis: "In Godot: set the texture filter to Nearest and use the .tres as SpriteFrames of an AnimatedSprite2D or AnimatedSprite3D.",
      bild: "The sprite large in the chosen animation and direction, the whole sheet beside it" };

const zuCanvas = (p: Pixels) => {
  const c = document.createElement("canvas");
  c.width = p.w; c.height = p.h;
  c.getContext("2d")!.putImageData(new ImageData(new Uint8ClampedArray(p.data), p.w, p.h), 0, 0);
  return c;
};
const png = (p: Pixels): Promise<Uint8Array> => new Promise((ok, fehler) => zuCanvas(p).toBlob(async (b) => (b ? ok(new Uint8Array(await b.arrayBuffer())) : fehler(new Error("PNG"))), "image/png"));

export async function start(b: Bereich): Promise<Galerie> {
  const dreid = b.buehne.querySelector<HTMLCanvasElement>("canvas.dreid");
  if (dreid) dreid.hidden = true;
  let canvas = b.buehne.querySelector<HTMLCanvasElement>("canvas.spritebild");
  if (!canvas) { canvas = el("canvas", { class: "spritebild", role: "img", "aria-label": P.bild }) as HTMLCanvasElement; b.buehne.prepend(canvas); }
  const flaeche = canvas;
  flaeche.hidden = false;
  const g = flaeche.getContext("2d")!;

  let sprite: AnySprite = SPRITES[0], werte: Record<string, unknown> = {}, seed = 1, sheet: Sheet = makeSheet(sprite);
  let animation = sprite.animations[0].name, richtung: Direction = sprite.directions[0], bogen: HTMLCanvasElement = zuCanvas(sheet.image);
  let bild = 0, zuletzt = 0, rahmen = 0;
  const nichtStandard = () => Object.fromEntries(Object.entries(werte).filter(([k, v]) => v !== sprite.params[k].default));

  // Checker background, the animation large on the left, the sheet on the right; whole-number zoom keeps pixels sharp
  const zeichnen = (zeit: number) => {
    const breite = Math.max(64, Math.round(flaeche.clientWidth)), hoehe = Math.max(64, Math.round(flaeche.clientHeight));
    if (flaeche.width !== breite || flaeche.height !== hoehe) { flaeche.width = breite; flaeche.height = hoehe; }
    g.fillStyle = "#16191d"; g.fillRect(0, 0, breite, hoehe);
    const { w, h } = sprite.frame, a = sprite.animations.find((x) => x.name === animation)!;
    if (zeit - zuletzt > 1000 / a.fps) { bild = (bild + 1) % a.frames; zuletzt = zeit; }
    const frames = sheet.frames.filter((f) => f.animation === animation && f.direction === richtung), f = frames[bild % frames.length];
    const links = Math.floor(breite * 0.45), gross = Math.max(1, Math.floor(Math.min((links - 32) / w, (hoehe - 48) / h)));
    const x0 = Math.floor((links - w * gross) / 2), y0 = Math.floor((hoehe - h * gross) / 2);
    for (let y = 0; y < h * gross; y += 8 * gross / 2) for (let x = 0; x < w * gross; x += 8 * gross / 2) {
      g.fillStyle = ((x + y) / (4 * gross)) % 2 ? "#262a31" : "#1e2227";
      g.fillRect(x0 + x, y0 + y, Math.min(4 * gross, w * gross - x), Math.min(4 * gross, h * gross - y));
    }
    g.imageSmoothingEnabled = false;
    g.drawImage(bogen, f.x, f.y, w, h, x0, y0, w * gross, h * gross);
    const rest = breite - links - 24, klein = Math.max(1, Math.floor(Math.min(rest / sheet.image.w, (hoehe - 48) / sheet.image.h)));
    g.drawImage(bogen, 0, 0, sheet.image.w, sheet.image.h, links + 8, Math.floor((hoehe - sheet.image.h * klein) / 2), sheet.image.w * klein, sheet.image.h * klein);
    rahmen = requestAnimationFrame(zeichnen);
  };

  const neuBauen = () => {
    sheet = makeSheet(sprite, werte, seed);
    bogen = zuCanvas(sheet.image);
    b.werte.textContent = `${sprite.frame.w} × ${sprite.frame.h} ${P.pixel} · ${sheet.frames.length} ${P.bilder} · ${sheet.image.colours()} ${P.farben} · ${sheet.image.w} × ${sheet.image.h} px`;
    hashSetzen(sprite.id, nichtStandard(), seed);
  };

  const listeZeichnen = () => {
    b.liste.replaceChildren(...SPRITE_CATEGORIES.filter((k) => SPRITES.some((s) => s.category === k)).map((k) => el("section", {}, el("h2", {}, P.kategorien[k]),
      ...SPRITES.filter((s) => s.category === k).map((s) => {
        const k2 = el("button", { type: "button", "aria-pressed": String(s.id === sprite.id) }, text(s.title));
        k2.onclick = () => { sprite = s; werte = defaults(s.params); seed = 1; animation = s.animations[s.animations.length - 1].name; richtung = s.directions[0]; listeZeichnen(); reglerZeichnen(); neuBauen(); };
        return k2;
      }))));
  };

  const reglerZeichnen = () => {
    const seedFeld = el("input", { id: "p-seed", type: "number", min: "1", step: "1", value: String(seed) }) as HTMLInputElement;
    seedFeld.onchange = () => { seed = Math.max(1, Math.round(Number(seedFeld.value)) || 1); neuBauen(); };
    const looks = el("div", { class: "looks", role: "group", "aria-label": T.looks }, ...Object.entries(sprite.presets).map(([name, p]) =>
      knopf(text(p.label), () => { werte = withPreset(sprite.params, sprite.presets, { preset: name }); seed = 1; reglerZeichnen(); neuBauen(); })));
    const anim = el("select", { id: "s-animation" }, ...sprite.animations.map((a) => el("option", { value: a.name }, `${a.name} (${a.frames} · ${a.fps} fps)`))) as HTMLSelectElement;
    anim.value = animation;
    anim.onchange = () => { animation = anim.value; bild = 0; };
    const richtungen = el("div", { class: "looks", role: "group", "aria-label": P.richtung }, ...sprite.directions.map((d) => {
      const k = knopf(P.richtungen[d], () => { richtung = d; reglerZeichnen(); });
      k.setAttribute("aria-pressed", String(d === richtung));
      return k;
    }));
    const laden = knopf(P.zip, async (k) => {
      k.disabled = true;
      try {
        const name = `${sprite.id}${seed !== 1 ? "-" + seed : ""}`, enc = new TextEncoder();
        const zip = zipSync({
          [`${name}.png`]: await png(sheet.image),
          [`${name}.tres`]: enc.encode(godotSpriteFrames(sheet, `${name}.png`)),
          [`${name}.json`]: enc.encode(JSON.stringify(sheetJson(sheet, `${name}.png`), null, 1) + "\n"),
        }, { level: 6 });
        speichern(zip as Uint8Array<ArrayBuffer>, "application/zip", `${name}.zip`);
      } finally { k.disabled = false; }
    });
    laden.classList.add("haupt");
    b.regler.replaceChildren(
      el("h2", {}, text(sprite.title)), el("p", { class: "leise" }, text(sprite.description)),
      el("div", { class: "feld" }, el("label", { for: "s-animation" }, P.animation), anim),
      ...(sprite.directions.length > 1 ? [el("h3", {}, P.richtung), richtungen] : []),
      el("h3", {}, T.looks), looks,
      ...Object.entries(sprite.params).map(([k, p]) => feld(k, p as Param, werte[k], (v) => { werte = { ...werte, [k]: v }; neuBauen(); })),
      el("div", { class: "feld" }, el("label", { for: "p-seed" }, T.seed), seedFeld),
      el("div", { class: "knoepfe" },
        knopf(T.wuerfeln, () => { werte = random(sprite.params, rng(Date.now() % 100000)); seed = 1 + Math.floor(Math.random() * 999); reglerZeichnen(); neuBauen(); }),
        knopf(T.zurueck, () => { werte = defaults(sprite.params); seed = 1; reglerZeichnen(); neuBauen(); }),
        knopf(T.link, (k) => kopieren(k, location.href)),
        knopf(T.code, (k) => {
          const name = kebabZuCamel(sprite.id), an = animationName(sprite, animation, richtung);
          kopieren(k, `import { ${name}, godotSpriteFrames } from "formwerk/sprites";\n\nconst sheet = ${name}(${JSON.stringify(nichtStandard())}${seed !== 1 ? `, ${seed}` : ""}); // RGBA pixels, frames\nconst frames = sheet.frames.filter((f) => f.animation === "${animation}" && f.direction === "${richtung}"); // "${an}"\n`);
        })),
      el("div", { class: "export" }, el("h3", {}, T.export), el("small", {}, P.hinweis), laden));
  };

  rahmen = requestAnimationFrame(zeichnen);
  return {
    zeigen() {
      const h = hashTeile();
      sprite = spriteById(h.id) ?? SPRITES[0];
      werte = withPreset(sprite.params, sprite.presets, h.werte);
      seed = h.seed;
      animation = sprite.animations[sprite.animations.length - 1].name;
      richtung = sprite.directions[0];
      listeZeichnen();
      reglerZeichnen();
      neuBauen();
    },
    stop() {
      cancelAnimationFrame(rahmen);
      flaeche.hidden = true;
    },
  };
}
