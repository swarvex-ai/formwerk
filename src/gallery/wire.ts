// The wireframe overlay of the models tab: the triangle edges of every mesh over the shaded model. The lines live in a
// group of their own in the scene (never inside the asset object, so measure() counts the asset alone) and copy each
// mesh's world matrix; sync() follows posed parts. Built once per rebuild, disposed with every rebuild.
import { Group, LineSegments, WireframeGeometry, type Mesh, type Object3D } from "three";
import { LineBasicNodeMaterial } from "three/webgpu";
import { cameraProjectionMatrix, positionView, vec4 } from "three/tsl";
import type { createViewer } from "./viewer";

type Viewer = Awaited<ReturnType<typeof createViewer>>;

// The choice stays while switching assets and tabs
let gemerkt = false;

export function createWire(viewer: Viewer) {
  const linie = new LineBasicNodeMaterial({ color: "#1b1f24", transparent: true, opacity: 0.55, depthWrite: false });
  // A little towards the camera (0.1 % of the distance), so the edges lie over their own faces instead of fighting them
  linie.vertexNode = cameraProjectionMatrix.mul(vec4(positionView.mul(0.999), 1));
  let quelle: Object3D | null = null, gruppe: Group | null = null;
  let paare: [Mesh, LineSegments][] = [];

  const lagern = (l: LineSegments, m: Mesh) => { l.matrix.copy(m.matrixWorld); l.matrixWorld.copy(m.matrixWorld); };
  /** Takes the overlay out of the scene; disposes its geometries unless it is handed on (returned). */
  const abbauen = (behalten: boolean): Object3D | null => {
    const g = gruppe;
    gruppe = null;
    paare = [];
    if (!g) return null;
    g.removeFromParent();
    if (behalten) return g;
    g.traverse((x) => (x as LineSegments).geometry?.dispose());
    return null;
  };
  const bauen = () => {
    if (!gemerkt || !quelle) return;
    quelle.updateWorldMatrix(true, true);
    gruppe = new Group();
    gruppe.name = "wireframe";
    quelle.traverse((x) => {
      const m = x as Mesh;
      if (!m.isMesh) return;
      const l = new LineSegments(new WireframeGeometry(m.geometry), linie);
      l.matrixAutoUpdate = false;
      lagern(l, m);
      gruppe!.add(l);
      paare.push([m, l]);
    });
    viewer.scene.add(gruppe);
  };

  return {
    get on() { return gemerkt; },
    /** The overlay of the current asset object, or null while off. */
    get group(): Object3D | null { return gruppe; },
    set(on: boolean) { gemerkt = on; abbauen(false); bauen(); },
    /** Rebuild the overlay for a new asset object. The previous overlay is disposed, or with keepPrevious only taken
     *  out of the scene and returned (the caller disposes its geometries, e.g. the scan). */
    attach(objekt: Object3D, keepPrevious = false): Object3D | null {
      const vorher = abbauen(keepPrevious);
      quelle = objekt;
      bauen();
      return vorher;
    },
    /** Follow posed parts (after a rig slider moved). */
    sync() {
      if (!quelle) return;
      quelle.updateWorldMatrix(true, true);
      for (const [m, l] of paare) lagern(l, m);
    },
    dispose() { abbauen(false); quelle = null; linie.dispose(); },
  };
}
