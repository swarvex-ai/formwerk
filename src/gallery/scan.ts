// The scan reveal: a glowing sheet rises through the model. On opening it reveals the shape (an accent wireframe ghost
// above the sheet); on a change the old shape stays above the sheet and the new one appears below it.
// Clipping uses ClippingGroup (WebGPURenderer, also in its WebGL 2 fallback): the objects are moved into one while the
// scan runs and back into the scene at the end, so their materials and the object itself stay untouched.
// The rim is a closed Line, not a LineLoop: the WebGPURenderer has no LineLoop.
import { AdditiveBlending, BufferGeometry, DoubleSide, Box3, Float32BufferAttribute, Group, Line, Mesh, PlaneGeometry, Plane, Vector3, type Object3D } from "three";
import { ClippingGroup, LineBasicNodeMaterial, MeshBasicNodeMaterial } from "three/webgpu";
import type { createViewer } from "./viewer";

type Viewer = Awaited<ReturnType<typeof createViewer>>;

const AKZENT = "#22d3ee";
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2);

export function createScan(viewer: Viewer) {
  const blatt = new Mesh(new PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new MeshBasicNodeMaterial({ color: AKZENT, transparent: true, opacity: 0.3, blending: AdditiveBlending, depthWrite: false, side: DoubleSide }));
  const rand = new Line(new BufferGeometry().setAttribute("position", new Float32BufferAttribute([-.5, 0, -.5, .5, 0, -.5, .5, 0, .5, -.5, 0, .5, -.5, 0, -.5], 3)), new LineBasicNodeMaterial({ color: AKZENT, depthWrite: false }));
  const lampe = new Group();
  lampe.name = "scan-sheet";
  lampe.add(blatt, rand);
  const unten = new Plane(new Vector3(0, -1, 0), 0), oben = new Plane(new Vector3(0, 1, 0), 0);
  const gruppe = (planes: Plane[]) => { const g = new ClippingGroup(); g.clippingPlanes = planes; return g; };

  let neu: Object3D | null = null, alt: Object3D | null = null;
  let gruppeNeu: ClippingGroup | null = null, gruppeAlt: ClippingGroup | null = null, gruppeGeist: ClippingGroup | null = null;
  let geist: MeshBasicNodeMaterial | null = null;
  let von = 0, bis = 0, dauer = 1, zeit = 0, laeuft = false;

  const start = (n: Object3D, a: Object3D | null, sekunden: number) => {
    const box = new Box3().setFromObject(n);
    if (a) box.union(new Box3().setFromObject(a));
    const s = box.getSize(new Vector3()), c = box.getCenter(new Vector3());
    neu = n; alt = a; dauer = sekunden; zeit = 0; von = box.min.y - 0.001; bis = box.max.y + 0.001;
    lampe.scale.set(Math.max(0.01, s.x * 1.15), 1, Math.max(0.01, s.z * 1.15));
    lampe.position.set(c.x, von, c.z);
    setzen(von);
    gruppeNeu = gruppe([unten]);
    viewer.scene.add(gruppeNeu);
    gruppeNeu.add(n);
    if (a) {
      gruppeAlt = gruppe([oben]);
      viewer.scene.add(gruppeAlt);
      gruppeAlt.add(a);
    } else {
      // Above the sheet a wireframe ghost of the new shape: one mesh per mesh, sharing its geometry, outside the asset object
      n.updateWorldMatrix(true, true);
      geist = new MeshBasicNodeMaterial({ color: AKZENT, wireframe: true, transparent: true, opacity: 0.25, depthWrite: false });
      gruppeGeist = gruppe([oben]);
      n.traverse((x) => {
        const m = x as Mesh;
        if (!m.isMesh) return;
        const g = new Mesh(m.geometry, geist!);
        g.matrixAutoUpdate = false;
        g.matrix.copy(m.matrixWorld);
        g.matrixWorld.copy(m.matrixWorld);
        gruppeGeist!.add(g);
      });
      viewer.scene.add(gruppeGeist);
    }
    viewer.scene.add(lampe);
    laeuft = true;
  };
  const setzen = (y: number) => { lampe.position.y = y; unten.constant = y; oben.constant = -y; };

  const ende = () => {
    laeuft = false;
    viewer.scene.remove(lampe);
    if (neu) viewer.scene.add(neu);
    if (alt) viewer.dispose(alt);
    for (const g of [gruppeNeu, gruppeAlt, gruppeGeist]) g?.removeFromParent();
    geist?.dispose();
    neu = alt = gruppeNeu = gruppeAlt = gruppeGeist = geist = null;
  };

  return {
    /** Opening an asset: the sheet reveals the new shape. */
    reveal(n: Object3D) { if (laeuft) ende(); start(n, null, 0.9); },
    /** A parameter or the seed changed: old shape above the sheet, new one below. */
    change(a: Object3D, n: Object3D) { if (laeuft) ende(); start(n, a, 0.6); },
    /** End at once: new shape whole, old one disposed. */
    stop() { if (laeuft) ende(); },
    get running() { return laeuft; },
    /** Called from the animation loop with the seconds since the last frame. */
    tick(seconds: number) {
      if (!laeuft) return;
      zeit += seconds;
      const t = Math.min(1, zeit / dauer);
      setzen(von + (bis - von) * ease(t));
      if (t >= 1) ende();
    },
  };
}
