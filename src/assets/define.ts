// An asset: id, category, texts, its parameter schema, presets, movable parts (rig), physics hints, a triangle and
// draw-call budget, and a build function that turns valid values (and a seed for variation) into a three.js object.
// Origin at the centre of the floor, metres, y up, the front faces +z.
import { Box3, BoxGeometry, BufferGeometry, CylinderGeometry, Group, Mesh, Vector3, type Material, type Object3D } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { withPreset, type Presets, type Schema, type Text, type Values } from "../core/params";

// Vehicles and props came with requests from other projects in mind (a tank for a game, a market stall for a town)
export type Category = "furniture" | "architecture" | "nature" | "vehicles" | "props";
export const CATEGORIES: Category[] = ["furniture", "architecture", "nature", "vehicles", "props"];

/**
 * A movable part (lid, door, gate, drawer): a child object with this name and its origin at the hinge.
 * rotate: degrees around `axis` through the hinge; slide: metres along `axis`. 0 is the rest pose (closed), positive
 * values open. `pose(object, { lid: 80 })` moves it; engines see a named node with the pivot already in place.
 */
export type RigPart = { label: Text; type: "rotate" | "slide"; axis: [number, number, number]; min: number; max: number };
/** Physics hints: a static body (fixed in a level) or a dynamic one (props that can be pushed), and the collider that
 *  fits the shape: the bounding box, the convex hull (`hullPoints()`), or a vertical cylinder the build sets (a trunk). */
export type Physics = { body: "static" | "dynamic"; collider: "box" | "hull" | "cylinder" };

export type Asset<S extends Schema = Schema> = {
  id: string; category: Category; title: Text; description: Text; params: S;
  presets: Presets<S>;
  rig?: Record<string, RigPart>;
  physics: Physics;
  budget: { triangles: number; drawCalls: number };
  build(p: Values<S>, seed: number): Object3D;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyAsset = Asset<any>;
export const defineAsset = <const S extends Schema>(a: Asset<S>): Asset<S> => a;

/** What every built object carries in userData.formwerk (the .glb export keeps it as glTF extras). */
export type Info = {
  asset: string; values: Record<string, unknown>; seed: number;
  rig: Record<string, RigPart>; physics: Physics & { massKg: number; cylinder?: { radius: number; height: number } };
};

// Mass to 0.1 kg, below 1 kg to the gram, so small props (a mushroom, a coin) keep a mass above zero
const kilo = (kg: number) => (kg < 1 ? Math.round(kg * 1000) / 1000 : Math.round(kg * 10) / 10);

/** Builds an asset from (partial, unchecked) values, a preset name under `preset`, and a seed; attaches its info. */
export function make(asset: AnyAsset, input: Record<string, unknown> = {}, seed = 1): Object3D {
  const values = withPreset(asset.params, asset.presets, input);
  const o = asset.build(values, seed);
  // Movable parts that exist with these values, with the range the build gave them (a drawer opens as far as it is deep)
  const rig: Record<string, RigPart> = {};
  for (const [name, r] of Object.entries(asset.rig ?? {})) {
    const teil = partOf(o, name);
    if (teil) rig[name] = { ...r, ...(teil.userData.range as Partial<RigPart> | undefined) };
  }
  const physics: Info["physics"] = { ...asset.physics, massKg: kilo((o.userData.massKg as number) ?? 0) };
  if (asset.physics.collider === "cylinder") {
    if (!o.userData.cylinder) throw new Error(`${asset.id}: collider "cylinder" needs parts.cylinder(radius, height) in build()`);
    physics.cylinder = o.userData.cylinder as { radius: number; height: number };
  }
  const info: Info = { asset: asset.id, values, seed, rig, physics };
  o.name = asset.id;
  o.userData = { formwerk: info };
  return o;
}
export const infoOf = (o: Object3D): Info | undefined => o.userData.formwerk as Info | undefined;

/** Volume of one part: tetrahedra from its centre to every triangle. Exact for closed shapes, about 2/3 for open tubes. */
function volumen(g: BufferGeometry): number {
  const pos = g.attributes.position, idx = g.index;
  g.computeBoundingBox();
  const c = g.boundingBox!.getCenter(new Vector3());
  const a = new Vector3(), b = new Vector3(), d = new Vector3();
  const n = idx ? idx.count : pos.count;
  let v = 0;
  for (let i = 0; i < n; i += 3) {
    const i0 = idx ? idx.getX(i) : i, i1 = idx ? idx.getX(i + 1) : i + 1, i2 = idx ? idx.getX(i + 2) : i + 2;
    a.fromBufferAttribute(pos, i0).sub(c); b.fromBufferAttribute(pos, i1).sub(c); d.fromBufferAttribute(pos, i2).sub(c);
    v += a.dot(b.cross(d)) / 6;
  }
  return Math.abs(v);
}

/** Collects parts per material and merges them: one draw call per material (and per movable part), whatever the
 *  parameters say. Coordinates are always the asset's own, also inside a movable part. */
export class Parts {
  private teile = new Map<Material, BufferGeometry[]>();
  private bewegt = new Map<string, { pivot: Vector3; teile: Parts; range?: { min?: number; max?: number } }>();
  private masse = 0;
  private zylinder?: { radius: number; height: number };
  add(material: Material, geometry: BufferGeometry): this {
    for (const name of Object.keys(geometry.attributes)) if (!["position", "normal", "uv"].includes(name)) geometry.deleteAttribute(name);
    const liste = this.teile.get(material) ?? [];
    liste.push(geometry);
    this.teile.set(material, liste);
    this.masse += volumen(geometry) * ((material.userData.export?.density as number | undefined) ?? 600);
    return this;
  }
  /** A box with its centre at x, y, z. */
  box(m: Material, w: number, h: number, d: number, x: number, y: number, z: number, rotY = 0): this {
    const g = new BoxGeometry(w, h, d);
    if (rotY) g.rotateY(rotY);
    g.translate(x, y, z);
    return this.add(m, g);
  }
  /** A vertical cylinder standing on y0. */
  post(m: Material, radius: number, height: number, x: number, y0: number, z: number, segments = 10, square = false): this {
    const g = square ? new BoxGeometry(radius * 2, height, radius * 2) : new CylinderGeometry(radius, radius, height, segments);
    g.translate(x, y0 + height / 2, z);
    return this.add(m, g);
  }
  /** A movable part with its hinge at x, y, z (declare it in the asset's `rig` under the same name). `range` narrows
   *  the declared range for these values (a small drawer slides out less). */
  moving(name: string, x: number, y: number, z: number, range?: { min?: number; max?: number }): Parts {
    const teil = { pivot: new Vector3(x, y, z), teile: new Parts(), range };
    this.bewegt.set(name, teil);
    return teil.teile;
  }
  /** The collider for physics: a vertical cylinder from the floor (for assets with collider "cylinder", e.g. a trunk). */
  cylinder(radius: number, height: number): this {
    this.zylinder = { radius: Math.round(radius * 1000) / 1000, height: Math.round(height * 1000) / 1000 };
    return this;
  }
  private kg(): number {
    let m = this.masse;
    for (const { teile } of this.bewegt.values()) m += teile.kg();
    return m;
  }
  group(): Group {
    const gruppe = new Group();
    for (const [material, geos] of this.teile) {
      const indiziert = geos.every((g) => g.index);
      const merged = mergeGeometries(indiziert ? geos : geos.map((g) => (g.index ? g.toNonIndexed() : g)));
      if (!merged) {
        // name what differs: usually a hand-built geometry without the uv the primitives carry
        const namen = (g: BufferGeometry) => Object.keys(g.attributes).sort().join(", ");
        const arten = [...new Set(geos.map(namen))].map((a) => `[${a}]`).join(" vs ");
        throw new Error(`parts do not fit together: attributes differ (${arten}); give every geometry the same attributes, e.g. add a uv attribute`);
      }
      gruppe.add(new Mesh(merged, material));
    }
    for (const [name, { pivot, teile, range }] of this.bewegt) {
      if (!teile.teile.size) continue;
      const g = teile.group();
      for (const k of g.children) (k as Mesh).geometry.translate(-pivot.x, -pivot.y, -pivot.z);
      g.name = name;
      g.position.copy(pivot);
      g.userData = range ? { rest: pivot.toArray(), range } : { rest: pivot.toArray() };
      gruppe.add(g);
    }
    gruppe.userData = this.zylinder ? { massKg: this.kg(), cylinder: this.zylinder } : { massKg: this.kg() };
    return gruppe;
  }
}

/** A movable part by name, never the root itself (the root carries the asset id, which a part may share: the door's "door"). */
export function partOf(o: Object3D, name: string): Object3D | undefined {
  for (const c of o.children) { const t = c.getObjectByName(name); if (t) return t; }
  return undefined;
}

/** Moves the movable parts of a built object: `pose(chest, { lid: 80 })`. Values are clamped to the rig's range. */
export function pose(o: Object3D, values: Record<string, number>): Object3D {
  const rig = infoOf(o)?.rig ?? {};
  for (const [name, wert] of Object.entries(values)) {
    const r = rig[name], teil = partOf(o, name);
    if (!r || !teil) continue;
    const v = Math.min(r.max, Math.max(r.min, wert)), achse = new Vector3(...r.axis).normalize();
    const rest = new Vector3().fromArray((teil.userData.rest as number[] | undefined) ?? [0, 0, 0]);
    if (r.type === "rotate") { teil.position.copy(rest); teil.quaternion.setFromAxisAngle(achse, (v * Math.PI) / 180); }
    else { teil.quaternion.identity(); teil.position.copy(rest).addScaledVector(achse, v); }
  }
  o.updateMatrixWorld(true);
  return o;
}

/** Triangles and draw calls of an object (for budgets and the gallery). */
export function measure(o: Object3D): { triangles: number; drawCalls: number } {
  let triangles = 0, drawCalls = 0;
  o.traverse((x) => {
    const g = (x as Mesh).geometry as BufferGeometry | undefined;
    if (!(x as Mesh).isMesh || !g) return;
    drawCalls++;
    triangles += (g.index ? g.index.count : g.attributes.position.count) / 3;
  });
  return { triangles: Math.round(triangles), drawCalls };
}

/** Size and floor point of an object in metres. */
export function size(o: Object3D): { width: number; height: number; depth: number; minY: number } {
  o.updateMatrixWorld(true);
  const b = new Box3().setFromObject(o), s = b.getSize(new Vector3());
  const r = (x: number) => Math.round(x * 1000) / 1000;
  return { width: r(s.x), height: r(s.y), depth: r(s.z), minY: r(b.min.y) };
}
