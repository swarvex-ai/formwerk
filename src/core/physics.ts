// Physics data of a built asset for any engine: body type, estimated mass, and the collider the asset recommends
// (box, convex hull or a vertical cylinder). Rapier example:
//   const p = physicsOf(object);
//   const body = world.createRigidBody(p.body === "static" ? RigidBodyDesc.fixed() : RigidBodyDesc.dynamic());
//   const shape = p.collider === "hull" ? ColliderDesc.convexHull(hullPoints(object))
//     : p.collider === "cylinder" ? ColliderDesc.cylinder(p.cylinder.height / 2, p.cylinder.radius).setTranslation(0, p.cylinder.height / 2, 0)
//     : ColliderDesc.cuboid(...p.halfExtents).setTranslation(...p.center);
//   world.createCollider(shape.setMass(p.massKg), body);
import { Box3, Vector3, type Object3D } from "three";
import { ConvexHull } from "three/addons/math/ConvexHull.js";
import { infoOf, type Info } from "../assets/define";

export type PhysicsData = Info["physics"] & { center: [number, number, number]; halfExtents: [number, number, number] };

const mm = (x: number) => Math.round(x * 1000) / 1000;

/** Body, mass, collider type and the bounding box of a built asset (in its own coordinates). */
export function physicsOf(o: Object3D): PhysicsData {
  const info = infoOf(o);
  if (!info) throw new Error("physicsOf: not a Formwerk object (build it with make() or the library functions)");
  o.updateMatrixWorld(true);
  const box = new Box3().setFromObject(o), c = box.getCenter(new Vector3()), h = box.getSize(new Vector3()).multiplyScalar(0.5);
  return { ...info.physics, center: [mm(c.x), mm(c.y), mm(c.z)], halfExtents: [mm(h.x), mm(h.y), mm(h.z)] };
}

/** The corner points of the convex hull, flat as x, y, z (for ColliderDesc.convexHull and similar). */
export function hullPoints(o: Object3D): Float32Array {
  o.updateMatrixWorld(true);
  const hull = new ConvexHull().setFromObject(o);
  const punkte = new Map<string, Vector3>();
  for (const f of hull.faces) {
    let e = f.edge;
    do {
      const p = e.head().point;
      punkte.set(`${mm(p.x)},${mm(p.y)},${mm(p.z)}`, p);
      e = e.next;
    } while (e !== f.edge);
  }
  return new Float32Array([...punkte.values()].flatMap((p) => [mm(p.x), mm(p.y), mm(p.z)]));
}
