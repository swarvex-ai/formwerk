// The viewer: renderer, light, camera framed on the asset. Used by the gallery and by the scene tests.
import { AmbientLight, Box3, Color, DirectionalLight, HemisphereLight, PerspectiveCamera, Scene, Vector3, type Mesh, type Object3D } from "three";
import { WebGPURenderer } from "three/webgpu";

export async function createViewer(canvas: HTMLCanvasElement, opts: { forceWebGL: boolean; antialias: boolean; background: string }) {
  const renderer = new WebGPURenderer({ canvas, antialias: opts.antialias, forceWebGL: opts.forceWebGL });
  await renderer.init();
  const scene = new Scene();
  scene.background = new Color(opts.background);
  scene.add(new HemisphereLight("#dfe8ff", "#3a3226", 1.1), new AmbientLight("#ffffff", 0.25));
  const sun = new DirectionalLight("#ffffff", 2.4);
  sun.position.set(4, 7, 5);
  scene.add(sun);
  const camera = new PerspectiveCamera(40, 16 / 9, 0.01, 500);
  let current: Object3D | null = null;
  const center = new Vector3();

  return {
    renderer, scene, camera, center,
    show(o: Object3D) {
      if (current) {
        scene.remove(current);
        current.traverse((x) => { const m = x as Mesh; if (m.isMesh) { m.geometry.dispose(); (Array.isArray(m.material) ? m.material : [m.material]).forEach((y) => y.dispose()); } });
      }
      current = o;
      scene.add(o);
    },
    /** Camera from front-right and a little above, so the whole object fits. */
    frame() {
      if (!current) return;
      const box = new Box3().setFromObject(current), size = box.getSize(new Vector3());
      box.getCenter(center);
      const r = Math.max(0.2, size.length() / 2), dist = r / Math.sin((camera.fov * Math.PI) / 360) * 1.05;
      camera.position.copy(center).add(new Vector3(0.75, 0.45, 1).normalize().multiplyScalar(dist));
      camera.near = dist / 100; camera.far = dist * 10;
      camera.updateProjectionMatrix();
      camera.lookAt(center);
    },
    render() {
      renderer.render(scene, camera);
      return { drawCalls: renderer.info.render.drawCalls, triangles: renderer.info.render.triangles };
    },
    resize(width: number, height: number) {
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
    },
  };
}
