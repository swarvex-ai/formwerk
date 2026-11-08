// A pixel sprite: id, category, texts, its parameter schema, presets, its frame size, the directions it faces, its
// animations, and a build function that draws one frame (animation, direction, frame number) from valid values and a
// seed. The contract lays the frames out in a sheet (rows: animation × direction, columns: frames) and draws the
// outline, so every sprite of the catalogue looks like one set. Pure TypeScript (src/core/pixels.ts): no canvas, no
// three.js; the tests and the build draw the same pixels as the gallery.
import { Pixels } from "../core/pixels";
import { withPreset, type Presets, type Schema, type Text, type Values } from "../core/params";

export type SpriteCategory = "characters" | "creatures" | "items";
export const SPRITE_CATEGORIES: SpriteCategory[] = ["characters", "creatures", "items"];
export type Direction = "down" | "left" | "right" | "up";
export type Animation = { name: string; frames: number; fps: number; loop: boolean };

export type Sprite<S extends Schema = Schema> = {
  id: string; category: SpriteCategory; title: Text; description: Text; params: S;
  presets: Presets<S>;
  /** Size of one frame in pixels; the outermost ring stays empty for the outline. */
  frame: { w: number; h: number };
  /** The directions it faces; one direction (["down"]) for creatures and items that do not turn. */
  directions: readonly Direction[];
  animations: readonly Animation[];
  /** Feet on the bottom row of the frame (characters, creatures): the origin of the sprite is at its feet. */
  grounded: boolean;
  build(p: Values<S>, seed: number): (animation: string, direction: Direction, frame: number) => Pixels;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnySprite = Sprite<any>;
export const defineSprite = <const S extends Schema>(s: Sprite<S>): Sprite<S> => s;

export type SheetFrame = { animation: string; direction: Direction; frame: number; x: number; y: number; w: number; h: number };
export type Sheet = { sprite: AnySprite; values: Record<string, unknown>; seed: number; image: Pixels; frames: SheetFrame[] };

/** Name of an animation in one direction, as Godot's SpriteFrames and the JSON call it: "walk_down", or "idle". */
export const animationName = (s: AnySprite, animation: string, direction: Direction) => (s.directions.length > 1 ? `${animation}_${direction}` : animation);

/** Draws every frame of a sprite (from partial, unchecked values, a preset under `preset`, a seed) into one sheet. */
export function makeSheet(sprite: AnySprite, input: Record<string, unknown> = {}, seed = 1): Sheet {
  const values = withPreset(sprite.params, sprite.presets, input), zeichne = sprite.build(values, seed);
  const { w, h } = sprite.frame, spalten = Math.max(...sprite.animations.map((a) => a.frames));
  const zeilen = sprite.animations.length * sprite.directions.length;
  const image = new Pixels(spalten * w, zeilen * h), frames: SheetFrame[] = [];
  let zeile = 0;
  for (const a of sprite.animations) for (const d of sprite.directions) {
    for (let f = 0; f < a.frames; f++) {
      const bild = zeichne(a.name, d, f);
      bild.outline();
      image.blit(bild, f * w, zeile * h);
      frames.push({ animation: a.name, direction: d, frame: f, x: f * w, y: zeile * h, w, h });
    }
    zeile++;
  }
  return { sprite, values, seed, image, frames };
}

/** The sheet's frames and animations as JSON for any engine (Phaser, PixiJS, your own): fps, loop, rectangles. */
export function sheetJson(sheet: Sheet, image: string) {
  const s = sheet.sprite;
  return {
    image, frameWidth: s.frame.w, frameHeight: s.frame.h, origin: s.grounded ? "bottom centre of the frame (feet)" : "centre of the frame",
    animations: Object.fromEntries(s.animations.flatMap((a) => s.directions.map((d) => [animationName(s, a.name, d), {
      fps: a.fps, loop: a.loop,
      frames: sheet.frames.filter((f) => f.animation === a.name && f.direction === d).map(({ x, y, w, h }) => ({ x, y, w, h })),
    }]))),
  };
}

/**
 * Godot 4 SpriteFrames (.tres) for AnimatedSprite2D and AnimatedSprite3D: one AtlasTexture per frame on the sheet,
 * which lies next to it (`image` is a path relative to the .tres; checked on Godot 4.7.2).
 */
export function godotSpriteFrames(sheet: Sheet, image: string): string {
  const s = sheet.sprite, teile = [`[gd_resource type="SpriteFrames" format=3]`, ``, `[ext_resource type="Texture2D" path="${image}" id="1"]`, ``];
  sheet.frames.forEach((f, i) => teile.push(`[sub_resource type="AtlasTexture" id="f${i}"]`, `atlas = ExtResource("1")`, `region = Rect2(${f.x}, ${f.y}, ${f.w}, ${f.h})`, ``));
  const animationen = s.animations.flatMap((a) => s.directions.map((d) => {
    const bilder = sheet.frames.map((f, i) => [f, i] as const).filter(([f]) => f.animation === a.name && f.direction === d)
      .map(([, i]) => `{ "duration": 1.0, "texture": SubResource("f${i}") }`);
    return `{ "frames": [${bilder.join(", ")}], "loop": ${a.loop}, "name": &"${animationName(s, a.name, d)}", "speed": ${a.fps.toFixed(1)} }`;
  }));
  teile.push(`[resource]`, `animations = [${animationen.join(", ")}]`, ``);
  return teile.join("\n");
}
