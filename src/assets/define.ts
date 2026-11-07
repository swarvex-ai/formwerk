// An asset: id, category, texts, its parameter schema, a triangle and draw-call budget, and a build function that turns
// valid values (and a seed for variation) into a three.js object. Origin at the centre of the floor, metres, y up.
import { BoxGeometry, BufferGeometry, CylinderGeometry, Group, Mesh, type Material, type Object3D } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { Schema, Text, Values } from "../core/params";

export type Category = "furniture" | "architecture" | "nature";
export const CATEGORIES: Category[] = ["furniture", "architecture", "nature"];

export type Asset<S extends Schema = Schema> = {
  id: string; category: Category; title: Text; description: Text; params: S;
  budget: { triangles: number; drawCalls: number };
  build(p: Values<S>, seed: number): Object3D;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyAsset = Asset<any>;
export const defineAsset = <const S extends Schema>(a: Asset<S>): Asset<S> => a;

/** Collects parts per material and merges them: one draw call per material, whatever the parameters say. */
export class Parts {
  private teile = new Map<Material, BufferGeometry[]>();
  add(material: Material, geometry: BufferGeometry): this {
    for (const name of Object.keys(geometry.attributes)) if (!["position", "normal", "uv"].includes(name)) geometry.deleteAttribute(name);
    const liste = this.teile.get(material) ?? [];
    liste.push(geometry);
    this.teile.set(material, liste);
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
  group(): Group {
    const gruppe = new Group();
    for (const [material, geos] of this.teile) {
      const indiziert = geos.every((g) => g.index);
      const merged = mergeGeometries(indiziert ? geos : geos.map((g) => (g.index ? g.toNonIndexed() : g)));
      if (!merged) throw new Error("parts do not fit together (attributes differ)");
      gruppe.add(new Mesh(merged, material));
    }
    return gruppe;
  }
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
