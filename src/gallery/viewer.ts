// The viewer: renderer, light, camera framed on the asset. Used by the gallery and by the scene tests.
// Two looks: "studio" for models (tone mapping, the reflections of a room, a key light with soft shadows on an
// invisible floor, a light backdrop) and "plain" for surfaces (the older fixed lights, which their tests are tuned to).
import { ACESFilmicToneMapping, AmbientLight, Box3, CircleGeometry, Color, DirectionalLight, HemisphereLight, Mesh, NoToneMapping, PCFShadowMap, PerspectiveCamera, Scene, Vector3, type Object3D, type Texture } from "three";
import { PMREMGenerator, ShadowNodeMaterial, WebGPURenderer } from "three/webgpu";
import { color, mix, screenUV, smoothstep } from "three/tsl";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/** The studio look for models: one place for the values the scene baselines depend on. */
export const STUDIO = {
  /** Backdrop from the floor line up to the top of the frame. */
  backdropLow: "#b9bdc2", backdropHigh: "#e3e6e9",
  exposure: 0.8,
  /** Reflections and fill light from a room (RoomEnvironment); the only fill, no hemisphere or ambient light. */
  environment: 0.45,
  /** Key light from front-left above, so its shadow falls back and to the right, where the camera sees it. */
  key: 2.4, keyDirection: [-0.4, 1.5, 0.55] as const,
  /** Shadow edge softness in shadow-map texels. */
  softness: 6,
  /** Darkness of the shadow on the invisible floor. */
  shadow: 0.38,
};

export type Look = "studio" | "plain";

export async function createViewer(canvas: HTMLCanvasElement, opts: { forceWebGL: boolean; antialias: boolean; background: string }) {
  const renderer = new WebGPURenderer({ canvas, antialias: opts.antialias, forceWebGL: opts.forceWebGL });
  await renderer.init();
  // PCF with a wide radius: soft shadow edges (three r187 dropped the separate soft filter)
  renderer.shadowMap.type = PCFShadowMap;
  const scene = new Scene();
  const plainBackground = new Color(opts.background);
  const hemi = new HemisphereLight("#dfe8ff", "#3a3226", 1.1), ambient = new AmbientLight("#ffffff", 0.25);
  const sun = new DirectionalLight("#ffffff", 2.4);
  sun.position.set(4, 7, 5);
  scene.add(hemi, ambient, sun, sun.target);
  // The floor shows only the shadows that fall on it, so the backdrop stays one clean surface
  const floor = new Mesh(new CircleGeometry(1, 64), new ShadowNodeMaterial({ opacity: STUDIO.shadow }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  floor.name = "studio-floor";
  scene.add(floor);
  const camera = new PerspectiveCamera(40, 16 / 9, 0.01, 500);
  let current: Object3D | null = null;
  let look: Look = "plain";
  let room: Texture | null = null;
  const center = new Vector3();

  const shadows = (o: Object3D) => o.traverse((x) => { const m = x as Mesh; if (m.isMesh) { m.castShadow = look === "studio"; m.receiveShadow = look === "studio"; } });

  const viewer = {
    renderer, scene, camera, center,
    /** Switches between the studio look (models) and the plain look (surfaces); the stage shares one renderer. */
    setLook(next: Look) {
      look = next;
      const studio = next === "studio";
      renderer.toneMapping = studio ? ACESFilmicToneMapping : NoToneMapping;
      renderer.toneMappingExposure = STUDIO.exposure;
      renderer.shadowMap.enabled = studio;
      hemi.visible = ambient.visible = !studio;
      sun.intensity = studio ? STUDIO.key : 2.4;
      sun.castShadow = studio;
      floor.visible = studio;
      if (studio) {
        room ??= new PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
        scene.environment = room;
        scene.environmentIntensity = STUDIO.environment;
        scene.background = null;
        // A soft backdrop: darker at the bottom, lighter towards the top of the frame
        scene.backgroundNode = mix(color(STUDIO.backdropLow), color(STUDIO.backdropHigh), smoothstep(0.1, 0.9, screenUV.y.oneMinus()));
      } else {
        scene.environment = null;
        scene.backgroundNode = null;
        scene.background = plainBackground;
        sun.position.set(4, 7, 5);
        sun.target.position.set(0, 0, 0);
      }
      if (current) shadows(current);
    },
    show(o: Object3D) {
      if (current) {
        scene.remove(current);
        current.traverse((x) => { const m = x as Mesh; if (m.isMesh) { m.geometry.dispose(); (Array.isArray(m.material) ? m.material : [m.material]).forEach((y) => y.dispose()); } });
      }
      current = o;
      shadows(o);
      scene.add(o);
    },
    /** Camera from front-right and a little above, so the whole object fits; in the studio also the key light, its
     *  shadow camera and the floor, fitted to the object. */
    frame() {
      if (!current) return;
      const box = new Box3().setFromObject(current), size = box.getSize(new Vector3());
      box.getCenter(center);
      const r = Math.max(0.2, size.length() / 2), dist = r / Math.sin((camera.fov * Math.PI) / 360) * 1.05;
      camera.position.copy(center).add(new Vector3(0.75, 0.45, 1).normalize().multiplyScalar(dist));
      camera.near = dist / 100; camera.far = dist * 10;
      camera.updateProjectionMatrix();
      camera.lookAt(center);
      if (look === "studio") {
        const weg = r * 4;
        sun.position.copy(center).add(new Vector3(...STUDIO.keyDirection).normalize().multiplyScalar(weg));
        sun.target.position.copy(center);
        const s = sun.shadow.camera, k = r * 1.6;
        s.left = -k; s.right = k; s.top = k; s.bottom = -k;
        s.near = weg - r * 2.5; s.far = weg + r * 2.5;
        s.updateProjectionMatrix();
        sun.shadow.mapSize.set(2048, 2048);
        sun.shadow.radius = STUDIO.softness;
        sun.shadow.bias = -0.0004;
        sun.shadow.normalBias = r * 0.004;
        sun.shadow.needsUpdate = true;
        floor.position.set(center.x, box.min.y, center.z);
        floor.scale.setScalar(r * 12);
      }
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
  return viewer;
}
