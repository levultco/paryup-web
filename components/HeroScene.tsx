"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type Props = {
  /** Captura real de la app: su color y su luz forman el fondo. */
  screen: string;
};

const SCREEN_ASPECT = 920 / 2000;

// Fondo: la propia captura, muy desenfocada y con un leve movimiento líquido,
// fundida a negro hacia abajo. Es el mismo recurso que usa la app.
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uTex;
  uniform float uTime;
  uniform float uAspect;
  uniform float uImgAspect;
  uniform float uFade;
  uniform vec2 uMouse;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  vec3 blurSample(vec2 uv) {
    vec3 c = vec3(0.0);
    float r = 0.035;
    for (int x = -1; x <= 1; x++) {
      for (int y = -1; y <= 1; y++) {
        c += texture2D(uTex, uv + vec2(float(x), float(y)) * r).rgb;
      }
    }
    return c / 9.0;
  }

  void main() {
    vec2 uv = vUv;
    vec2 st = uv - 0.5;
    st.y *= uImgAspect / uAspect;
    st *= 0.62;
    vec2 imgUv = st + vec2(0.5, 0.58);

    float t = uTime * 0.06;
    vec2 flow = vec2(noise(uv * 2.2 + t), noise(uv * 2.2 - t + 7.3)) - 0.5;
    vec2 toMouse = uv - uMouse;
    float m = exp(-dot(toMouse, toMouse) * 9.0);
    imgUv += flow * 0.09 + toMouse * m * 0.06;

    vec3 col = blurSample(clamp(imgUv, 0.0, 1.0)) * 0.85;

    float fade = smoothstep(0.05, 0.85, uv.y);
    float vignette = smoothstep(1.2, 0.3, length((uv - vec2(0.5, 0.78)) * vec2(1.1, 1.0)));
    col *= fade * vignette * uFade;

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

const easeOut = (x: number) => 1 - Math.pow(1 - Math.min(Math.max(x, 0), 1), 3);

export default function HeroScene({ screen }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let disposed = false;

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(1);
    renderer.setClearColor("#000000", 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.cssText = "display:block;width:100%;height:100%";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const uniforms = {
      uTex: { value: null as THREE.Texture | null },
      uTime: { value: 0 },
      uAspect: { value: 1 },
      uImgAspect: { value: SCREEN_ASPECT },
      uFade: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.7) },
    };
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      depthWrite: false,
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);

    const mouse = new THREE.Vector2(0.5, 0.7);
    const mouseSmooth = new THREE.Vector2(0.5, 0.7);
    const onPointerMove = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      mouse.set(
        (e.clientX - rect.left) / rect.width,
        1 - (e.clientY - rect.top) / rect.height,
      );
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const draw = () => renderer.render(scene, camera);

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      renderer.setSize(w, h, false);
      uniforms.uAspect.value = w / h;
      if (reduced) draw();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);
    resize();

    let texture: THREE.CanvasTexture | null = null;
    let loadedAt = -1;
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      if (disposed) return;
      // Versión diminuta de la captura: al ampliarla en el shader queda desenfocada
      const small = document.createElement("canvas");
      small.width = 24;
      small.height = 52;
      small.getContext("2d")!.drawImage(img, 0, 0, small.width, small.height);
      texture = new THREE.CanvasTexture(small);
      texture.colorSpace = THREE.SRGBColorSpace;
      uniforms.uTex.value = texture;
      loadedAt = performance.now();
      if (reduced) {
        uniforms.uFade.value = 1;
        draw();
      }
    };
    img.src = screen;

    function cleanup() {
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      quad.geometry.dispose();
      material.dispose();
      texture?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    }

    if (reduced) {
      return () => {
        disposed = true;
        cleanup();
      };
    }

    let raf = 0;
    let visible = true;
    let last = performance.now();
    let clock = 0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const dt = Math.min(Math.max((now - last) / 1000, 0), 1 / 20);
      last = now;
      clock += dt;
      mouseSmooth.lerp(mouse, 1 - Math.pow(0.02, dt));
      uniforms.uTime.value = clock;
      uniforms.uFade.value =
        loadedAt < 0 ? 0 : easeOut((now - loadedAt) / 1400);
      uniforms.uMouse.value.copy(mouseSmooth);
      draw();
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      last = performance.now();
    });
    io.observe(mount);
    raf = requestAnimationFrame(frame);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      cleanup();
    };
  }, [screen]);

  return <div ref={mountRef} aria-hidden className="absolute inset-0" />;
}
