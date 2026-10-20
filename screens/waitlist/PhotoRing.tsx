"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// Fotos de fiesta, conciertos y clubs de Unsplash (licencia libre, cargadas desde su CDN;
// no se guardan en el proyecto).
const PHOTO_IDS = [
  "photo-1545128485-c400e7702796",
  "photo-1574155376612-bfa4ed8aabfd",
  "photo-1720623784273-f9388b9aa535",
  "photo-1544785316-6e58aed68a50",
  "photo-1648090317719-a57c907a7284",
  "photo-1618176581836-9dcf475e2b4a",
  "photo-1618853802485-be85de3d160f",
  "photo-1708449530051-6b3ffb524f8f",
  "photo-1578736641330-3155e606cd40",
  "photo-1687511844598-165c1fc387cc",
  "photo-1632008649281-0846891f76bd",
  "photo-1708449530105-ea7d453a6f89",
  "photo-1618176581835-d60e9c2567b9",
  "photo-1731331227578-b6745667761c",
  "photo-1647314620432-7e27193891cb",
  "photo-1594623930572-300a3011d9ae",
  "photo-1660211934853-e33d8a02201d",
  "photo-1679746556827-a4722297a613",
  "photo-1642784353725-5a79aaaaecab",
  "photo-1584352604394-c2c6f06e00c1",
  "photo-1600102975337-e66752d32557",
  "photo-1583906326458-5eb89bf0f911",
  "photo-1622386010273-646e12d1c02f",
  "photo-1730818203797-897b2838105a",
  "photo-1574793954837-b7938eb5a662",
  "photo-1642433706033-82b795d91fe3",
  "photo-1686242585106-f6f3547bc4ae",
  "photo-1713450606215-f8cb05c17f60",
  "photo-1584352877274-13baf11c17d7",
  "photo-1581974944026-5d6ed762f617",
  "photo-1459749411175-04bf5292ceea",
  "photo-1563841930606-67e2bce48b78",
  "photo-1470229722913-7c0e2dbbafd3",
  "photo-1429962714451-bb934ecdc4ec",
  "photo-1501386761578-eac5c94b800a",
  "photo-1533174072545-7a4b6ad7a6c3",
  "photo-1540039155733-5bb30b53aa14",
  "photo-1565035010268-a3816f98589a",
  "photo-1524368535928-5b5e00ddc76b",
  "photo-1514525253161-7a46d19cd819",
];
const unsplashUrl = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=512&h=512&q=70`;

// Imágenes propias de ParyUp (en /public), servidas redimensionadas por Next.
const LOCAL_IMAGES = [
  "/hero/1.jpg",
  "/hero/2.jpg",
  "/hero/3.jpg",
  "/hero/4.jpg",
  "/hero/5.jpg",
  "/hero/6.jpg",
  "/hero/7.jpg",
  "/hero/8.jpg",
  "/album/club-selfie-1.jpg",
  "/album/club-selfie-2.jpg",
  "/album/club-selfie-3.jpg",
  "/app/home.webp",
];
const localUrl = (path: string) =>
  `/_next/image?url=${encodeURIComponent(path)}&w=640&q=75`;

// Una foto propia cada tres de Unsplash, para que se mezclen por todo el anillo.
const PHOTO_URLS: string[] = (() => {
  const urls: string[] = [];
  let local = 0;
  PHOTO_IDS.forEach((id, index) => {
    urls.push(unsplashUrl(id));
    if (index % 3 === 2 && local < LOCAL_IMAGES.length) {
      urls.push(localUrl(LOCAL_IMAGES[local++]));
    }
  });
  while (local < LOCAL_IMAGES.length) urls.push(localUrl(LOCAL_IMAGES[local++]));
  return urls;
})();

const ROWS = 5;
const PER_ROW = 22;
const RING_RADIUS = 10; // radio del cilindro de fotos
const ITEM_SIZE = 2.2;
const FINAL_SPEED = 0.085; // rad/s: las fotos pasan despacio hacia la izquierda
const INTRO_MS = 2600;
const CAMERA_START_Z = 5; // la cámara arranca algo atrás y avanza hasta el centro
const MIN_TEXTURES_TO_START = 24;
const MORPH_MS = 2300; // duración del liquid morph de toda la escena

// Generador pseudoaleatorio con semilla: mismo reparto en cada carga.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Círculo con la foto. El desenfoque por profundidad se hace muestreando mipmaps.
const FRAGMENT = /* glsl */ `
  uniform sampler2D map;
  uniform float blur;
  uniform float opacity;
  uniform float shade;
  uniform float aspect;
  varying vec2 vUv;
  void main() {
    vec2 p = vUv - 0.5;
    // Recorte centrado (cover) para fotos que no son cuadradas.
    vec2 uv = vUv;
    if (aspect > 1.0) uv.x = (uv.x - 0.5) / aspect + 0.5;
    else uv.y = (uv.y - 0.5) * aspect + 0.5;
    float r = length(p) * 2.0;
    float soft = 0.015 + blur * 0.16;
    float alpha = 1.0 - smoothstep(1.0 - soft, 1.0, r);
    float lod = blur * 4.5;
    float o = blur * 0.035;
    vec4 c = textureLod(map, uv, lod);
    c += textureLod(map, uv + vec2(o, 0.0), lod);
    c += textureLod(map, uv - vec2(o, 0.0), lod);
    c += textureLod(map, uv + vec2(0.0, o), lod);
    c += textureLod(map, uv - vec2(0.0, o), lod);
    c /= 5.0;
    gl_FragColor = vec4(c.rgb * shade, alpha * opacity);
    #include <colorspace_fragment>
  }
`;

// Liquid morph de toda la escena: una mancha de líquido se abre desde el centro y revela
// la imagen, que se deforma como si estuviera bajo agua hasta calmarse y quedar nítida.
const POST_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const POST_FRAGMENT = /* glsl */ `
  uniform sampler2D tDiffuse;
  uniform float progress;
  uniform float time;
  uniform vec2 resolution;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }
  float fbm(vec2 p) {
    return vnoise(p) * 0.6 + vnoise(p * 2.1 + 3.7) * 0.4;
  }

  void main() {
    float aspect = resolution.x / resolution.y;
    vec2 c = (vUv - 0.5) * vec2(aspect, 1.0);
    float t = 1.0 - progress; // 1 al empezar, 0 cuando ya está todo formado
    // El líquido nace abajo, donde está el formulario, y sube por la pantalla.
    vec2 o = c - vec2(0.0, -0.55);
    float d = length(o);

    // Deformación líquida de la imagen que se calma con el tiempo.
    vec2 w = vec2(
      fbm(c * 2.2 + vec2(time * 0.35, 0.0)),
      fbm(c * 2.2 + vec2(0.0, -time * 0.35) + 5.2)
    ) - 0.5;
    vec2 dir = o / max(d, 0.0001);
    vec2 uv = vUv + w * t * t * 0.4
      + dir * sin(d * 14.0 - time * 3.0) * 0.02 * t;

    // Frente del líquido: avanza desde el centro con el borde irregular.
    // La ondulación crece con el avance: al principio la mancha queda pegada a su origen
    // (abajo, en el centro) y no se desplaza hacia un lado.
    float wobble = 0.12 + 0.73 * smoothstep(0.0, 0.6, progress);
    float n = (fbm(c * 2.6 + time * 0.25) - 0.5) * wobble;
    float front = 0.15 + progress * 1.75;
    float edge = d + n;
    float mask = 1.0 - smoothstep(front - 0.12, front, edge);

    // Aberración cromática mientras avanza el frente.
    float shift = t * 0.012;
    vec3 col = vec3(
      texture2D(tDiffuse, uv + dir * shift).r,
      texture2D(tDiffuse, uv).g,
      texture2D(tDiffuse, uv - dir * shift).b
    );
    // Tinte rosado-violeta sobre todo lo que ya está revelado, que se apaga al formarse.
    // Va por toda la imagen (no en el borde), así no dibuja ningún anillo.
    vec3 tint = vec3(0.85, 0.4, 0.95) * t * t * t * 0.18;

    // Aura rosada alrededor de la mancha, por fuera de su borde (nunca dentro, así no
    // se forma ningún anillo): se ve el líquido creciendo y se apaga al terminar.
    float aura = (1.0 - smoothstep(front, front + 0.16, edge)) * (1.0 - mask);
    vec3 halo = vec3(0.9, 0.35, 0.8) * aura * t * 0.6;

    gl_FragColor = vec4((col + tint) * mask + halo, 1.0);
    #include <colorspace_fragment>
  }
`;

type Item = {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  texture: number;
  angle: number;
  radius: number;
  y: number;
};

const normalizeAngle = (angle: number) => {
  const wrapped = angle % (Math.PI * 2);
  if (wrapped > Math.PI) return wrapped - Math.PI * 2;
  if (wrapped < -Math.PI) return wrapped + Math.PI * 2;
  return wrapped;
};

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * Cilindro de fotos visto desde dentro: arranca con la cámara algo atrás y las fotos borrosas
 * que se van enfocando mientras la cámara avanza hasta cubrir la pantalla, y luego las fotos pasan despacio
 * hacia la izquierda, renovándose por la derecha.
 */
export function PhotoRing({ onReveal }: { onReveal?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      onReveal?.(); // sin WebGL: se queda el fondo negro con el formulario
      return;
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 1);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = "width:100%;height:100%;display:block;";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 120);

    // La escena se dibuja primero en una textura y luego se pasa por el shader de morph.
    const target = new THREE.WebGLRenderTarget(1, 1, {
      type: THREE.HalfFloatType,
      samples: 4,
    });
    const postUniforms = {
      tDiffuse: { value: target.texture },
      progress: { value: 0 },
      time: { value: 0 },
      resolution: { value: new THREE.Vector2(1, 1) },
    };
    const postMaterial = new THREE.ShaderMaterial({
      vertexShader: POST_VERTEX,
      fragmentShader: POST_FRAGMENT,
      uniforms: postUniforms,
      depthTest: false,
      depthWrite: false,
    });
    const postGeometry = new THREE.PlaneGeometry(2, 2);
    const postScene = new THREE.Scene();
    postScene.add(new THREE.Mesh(postGeometry, postMaterial));
    const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const bufferSize = new THREE.Vector2();

    const resize = () => {
      const width = container.clientWidth || 1;
      const height = container.clientHeight || 1;
      renderer.setSize(width, height, false);
      renderer.getDrawingBufferSize(bufferSize);
      target.setSize(bufferSize.x, bufferSize.y);
      postUniforms.resolution.value.copy(bufferSize);
      camera.aspect = width / height;
      // En pantallas estrechas ampliamos el campo de visión para que quepan más fotos.
      camera.fov = camera.aspect < 1 ? 70 : 50;
      camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    // Cada foto se descarga una sola vez y la comparten varios círculos.
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    const textures: (THREE.Texture | null)[] = PHOTO_URLS.map(() => null);
    PHOTO_URLS.forEach((url, index) => {
      loader.load(url, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.anisotropy = 4;
        textures[index] = texture;
        // Sube la textura a la GPU ahora, repartido mientras cargan, y no de golpe al
        // empezar la animación (eso provocaba un pequeño tirón al principio).
        renderer.initTexture(texture);
      });
    });

    const rand = mulberry32(11);
    const geometry = new THREE.PlaneGeometry(ITEM_SIZE, ITEM_SIZE);
    const items: Item[] = [];

    for (let row = 0; row < ROWS; row++) {
      for (let slot = 0; slot < PER_ROW; slot++) {
        const material = new THREE.ShaderMaterial({
          vertexShader: VERTEX,
          fragmentShader: FRAGMENT,
          transparent: true,
          depthWrite: false,
          side: THREE.FrontSide, // solo se ve la cara de dentro
          uniforms: {
            map: { value: null },
            blur: { value: 0 },
            opacity: { value: 0 },
            shade: { value: 1 },
            aspect: { value: 1 },
          },
        });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        // Las vecinas alternan profundidad, así se solapan menos en pantalla.
        const radius =
          RING_RADIUS + (slot % 2 ? 1.6 : -1.6) + (rand() - 0.5) * 4.5;
        // Orden de dibujado fijo (lo lejano primero): evita que dos fotos
        // solapadas se alternen delante y detrás al moverse.
        mesh.renderOrder = -Math.round(radius * 100);
        items.push({
          mesh,
          material,
          texture: (slot * 7 + row * 13) % PHOTO_URLS.length,
          angle: normalizeAngle(
            ((slot + (row % 2) * 0.5) / PER_ROW) * Math.PI * 2 +
              (rand() - 0.5) * 0.06,
          ),
          radius,
          y: (row - (ROWS - 1) / 2) * 3.3 + (rand() - 0.5) * 0.7,
        });
      }
    }

    const created = performance.now();
    let start = reduceMotion ? created - INTRO_MS : 0;
    let last = created;
    let raf = 0;
    let spin = 0;
    let introClock = 0;

    const render = (now: number) => {
      const delta = Math.min((now - last) / 1000, 0.1);
      last = now;

      // La apertura empieza cuando ya hay fotos cargadas (o tras unos segundos de espera).
      if (!start) {
        const ready = textures.filter(Boolean).length;
        if (ready >= MIN_TEXTURES_TO_START || now - created > 3000) {
          start = now;
          onReveal?.();
        }
      }
      // El reloj de la entrada avanza con pasos acotados: si un fotograma se retrasa,
      // la animación no da un salto para ponerse al día.
      if (start && !reduceMotion) introClock += Math.min(delta, 0.034) * 1000;
      const elapsed = reduceMotion ? INTRO_MS * 4 : start ? introClock : 0;

      const progress = Math.min(1, elapsed / INTRO_MS);
      const open = easeOut(progress);
      postUniforms.time.value = now / 1000;
      postUniforms.progress.value = reduceMotion
        ? 1
        : easeOut(Math.min(1, elapsed / MORPH_MS));

      // Las fotos van girando solo cuando la apertura ya ha terminado.
      const cruise = easeInOut(Math.min(1, Math.max(0, (progress - 0.7) / 0.3)));
      if (!reduceMotion) spin += FINAL_SPEED * cruise * delta;

      const settle = progress >= 1 ? 1 : open;
      camera.position.set(
        Math.sin(elapsed / 6000) * 1.0 * settle,
        Math.cos(elapsed / 7500) * 0.6 * settle,
        CAMERA_START_Z * (1 - open),
      );
      camera.lookAt(0, 0, -RING_RADIUS);

      items.forEach((item) => {
        // Con el ángulo decreciendo, las fotos de delante avanzan hacia la izquierda.
        const angle = item.angle - spin;
        item.mesh.position.set(
          item.radius * Math.sin(angle),
          item.y,
          -item.radius * Math.cos(angle),
        );
        // La cara visible mira hacia el eje del cilindro.
        item.mesh.lookAt(0, item.mesh.position.y, 0);

        const uniforms = item.material.uniforms;
        const texture = textures[item.texture];
        if (texture && uniforms.map.value !== texture) {
          uniforms.map.value = texture;
          const image = texture.image as { width: number; height: number };
          uniforms.aspect.value = image.width / image.height;
        }

        // La escena ya está completa cuando empieza el morph: se enfoca al mismo ritmo.
        const reveal = postUniforms.progress.value;

        // Más lejos o más cerca que el radio medio = más desenfoque y más oscuro.
        // Al abrirse, todo parte desenfocado y se va enfocando.
        const offset = item.radius - RING_RADIUS;
        const depthBlur = Math.max(0, offset * 0.2 + 0.05, -offset * 0.3);
        uniforms.blur.value = Math.min(1, depthBlur + (1 - reveal) * 0.6);
        uniforms.shade.value = 1 - Math.min(0.6, Math.max(0, offset) * 0.14);

        // Las fotos que pasan pegadas a la cámara se desvanecen.
        const gap = item.mesh.position.distanceTo(camera.position);
        const nearFade = Math.min(1, Math.max(0, (gap - 1.5) / 3));
        const target = texture && start ? nearFade : 0;
        // Las fotos están ya visibles en el primer fotograma del morph.
        uniforms.opacity.value =
          elapsed < 150 ? target : uniforms.opacity.value + (target - uniforms.opacity.value) * 0.35;
      });

      renderer.setRenderTarget(target);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      renderer.render(postScene, postCamera);
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      geometry.dispose();
      postGeometry.dispose();
      postMaterial.dispose();
      target.dispose();
      items.forEach((item) => item.material.dispose());
      textures.forEach((texture) => texture?.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    />
  );
}
