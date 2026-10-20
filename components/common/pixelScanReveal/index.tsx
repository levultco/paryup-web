'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Mesh, Program, Renderer, Texture, Triangle } from 'ogl';

type PixelScanRevealProps = {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  mode?: 0 | 1 | 2;
  layers?: number;
  speed?: number;
  delay?: number;
  width?: number;
  threshold?: number;
};

const VERT = /* glsl */ `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = /* glsl */ `
precision highp float;

uniform sampler2D src;
uniform vec2 resolution;
uniform vec2 offset;
uniform float time;
uniform float enterTime;
uniform float leaveTime;

uniform int mode;
uniform float layers;
uniform float speed;
uniform float delay;
uniform float width;

#define W width
const float MAX_LAYERS = 8.0;

vec4 readTex(vec2 uv) {
  if (uv.x < 0. || uv.x > 1. || uv.y < 0. || uv.y > 1.) {
    return vec4(0.0);
  }
  return texture2D(src, uv);
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(4859., 3985.))) * 3984.);
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float sdBox(vec2 p, float r) {
  vec2 q = abs(p) - r;
  return min(length(q), max(q.y, q.x));
}

float dir = 1.0;

float toRangeT(vec2 p, float scale) {
  float d = 0.0;

  if (mode == 0) {
    d = p.x / (scale * 2.) + 0.5;
  } else if (mode == 1) {
    d = 1.0 - (p.y / (scale * 2.) + 0.5);
  } else {
    d = length(p) / scale;
  }

  d = dir > 0.0 ? d : (1.0 - d);
  return d;
}

vec4 cell(vec2 p, vec2 pi, float scale, float t, float edge) {
  vec2 pc = pi + 0.5;

  vec2 uvc = pc / scale;
  uvc.y /= resolution.y / resolution.x;
  uvc = uvc * 0.5 + 0.5;
  if (uvc.x < 0. || uvc.x > 1. || uvc.y < 0. || uvc.y > 1.) {
    return vec4(0.0);
  }
  float alpha = smoothstep(0.0, 0.1, texture2D(src, uvc, 3.0).a);

  vec4 color = vec4(hsv2rgb(vec3((pc.x * 13. / pc.y * 17.) * 0.3, 1.0, 1.0)), 1.0);

  float x = toRangeT(pi, scale);
  float n = hash(pi);
  float anim = smoothstep(W * 2., 0.0, abs(x + n * W - t));
  color *= anim;

  color *= mix(
    1.0,
    clamp(0.3 / abs(sdBox(p - pc, 0.5)), 0.0, 10.0),
    edge * pow(anim, 10.0)
  );

  return color * alpha;
}

vec4 cellsColor(vec2 p, float scale, float t) {
  vec2 pi = floor(p);
  vec2 d = vec2(0.0, 1.0);

  vec4 cc = vec4(0.0);
  cc += cell(p, pi, scale, t, 0.2) * 4.0;
  cc += cell(p, pi + d.xy, scale, t, 0.9);
  cc += cell(p, pi - d.xy, scale, t, 0.9);
  cc += cell(p, pi + d.yx, scale, t, 0.9);
  cc += cell(p, pi - d.yx, scale, t, 0.9);

  return cc / 8.0;
}

vec4 draw(vec2 uv, vec2 p, float t, float scale) {
  vec4 c = readTex(uv);

  vec2 pi = floor(p * scale);

  float n = hash(pi);
  t = t * (1.0 + W * 4.0) - W * 2.0;

  float x = toRangeT(pi, scale);
  float a1 = smoothstep(t, t - W, x + n * W);
  c *= a1;

  c += cellsColor(p * scale, scale, t) * 1.5;
  return c;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - offset) / resolution;
  vec2 p = uv * 2.0 - 1.0;
  p.y *= resolution.y / resolution.x;

  float t = 0.0;

  if (leaveTime > 0.0) {
    dir = -1.0;
    t = clamp(leaveTime * speed, 0.0, 1.0);
  } else {
    t = clamp((enterTime - delay) * speed, 0.0, 1.0);
  }
  t = (fract(t * 0.99999) - 0.5) * dir + 0.5;

  vec4 outColor = vec4(0.0);
  float usedLayers = clamp(layers, 1.0, MAX_LAYERS);

  for (float i = 0.0; i < MAX_LAYERS; i++) {
    if (i >= usedLayers) break;
    float s = cos(i) * 7.3 + 10.0;
    outColor += draw(uv, p, t, abs(s));
  }

  outColor /= usedLayers;
  outColor *= smoothstep(0.0, 0.01, t);
  gl_FragColor = outColor;
}
`;

export default function PixelScanReveal({
  src,
  alt,
  className,
  imgClassName,
  mode = 0,
  layers = 3,
  speed = 0.75,
  delay = 0,
  width = 0.2,
  threshold = 0.9,
}: PixelScanRevealProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const meshRef = useRef<Mesh | null>(null);
  const programRef = useRef<Program | null>(null);
  const textureRef = useRef<Texture | null>(null);
  const rafRef = useRef<number>(0);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const ioRef = useRef<IntersectionObserver | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const hasStartedRef = useRef(false);
  const isImageReadyRef = useRef(false);
  const isDoneRef = useRef(false);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [isDone, setIsDone] = useState(false);
  const configRef = useRef({ mode, layers, speed, delay, width });

  // Keep init/dispose tied to mount lifecycle to avoid recreating WebGL resources on prop changes.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      dpr: Math.min(2, window.devicePixelRatio || 1),
    });
    rendererRef.current = renderer;

    const gl = renderer.gl;
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.BLEND);

    Object.assign(gl.canvas.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      display: 'block',
      pointerEvents: 'none',
    } as Partial<CSSStyleDeclaration>);

    container.appendChild(gl.canvas);

    const texture = new Texture(gl, { generateMipmaps: false });
    textureRef.current = texture;

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        src: { value: texture },
        resolution: { value: [1, 1] },
        offset: { value: [0, 0] },
        time: { value: 0 },
        enterTime: { value: 0 },
        leaveTime: { value: 0 },
        mode: { value: mode },
        layers: { value: layers },
        speed: { value: speed },
        delay: { value: delay },
        width: { value: width },
      },
      transparent: true,
    });
    programRef.current = program;

    const mesh = new Mesh(gl, {
      geometry: new Triangle(gl),
      program,
    });
    meshRef.current = mesh;

    const updateSize = () => {
      if (!rendererRef.current || !programRef.current || !containerRef.current) return;
      const w = Math.max(1, containerRef.current.clientWidth);
      const h = Math.max(1, containerRef.current.clientHeight);
      rendererRef.current.setSize(w, h);
      const dbw = rendererRef.current.gl.drawingBufferWidth;
      const dbh = rendererRef.current.gl.drawingBufferHeight;
      programRef.current.uniforms.resolution.value[0] = dbw;
      programRef.current.uniforms.resolution.value[1] = dbh;
      programRef.current.uniforms.offset.value[0] = 0;
      programRef.current.uniforms.offset.value[1] = 0;
    };

    resizeObserverRef.current = new ResizeObserver(updateSize);
    resizeObserverRef.current.observe(container);
    updateSize();

    const render = (now: number) => {
      const rendererNow = rendererRef.current;
      const programNow = programRef.current;
      const meshNow = meshRef.current;
      if (!rendererNow || !programNow || !meshNow) return;

      if (!hasStartedRef.current || !isImageReadyRef.current || isDoneRef.current) {
        rafRef.current = requestAnimationFrame(render);
        return;
      }

      if (startTimeRef.current === null) {
        startTimeRef.current = now;
      }

      const elapsed = (now - startTimeRef.current) * 0.001;
      programNow.uniforms.time.value = now * 0.001;
      programNow.uniforms.enterTime.value = elapsed;
      programNow.uniforms.leaveTime.value = 0;
      rendererNow.render({ scene: meshNow });

      const finishAt = configRef.current.delay + 1 / Math.max(0.0001, configRef.current.speed);
      if (elapsed >= finishAt) {
        isDoneRef.current = true;
        setIsDone(true);
        return;
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (ioRef.current) ioRef.current.disconnect();
      if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
      if (rendererRef.current?.gl.canvas.parentNode === container) {
        container.removeChild(rendererRef.current.gl.canvas);
      }
      const loseCtx = rendererRef.current?.gl.getExtension('WEBGL_lose_context');
      loseCtx?.loseContext();
      meshRef.current = null;
      programRef.current = null;
      textureRef.current = null;
      rendererRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    configRef.current = { mode, layers, speed, delay, width };
    if (!programRef.current) return;
    programRef.current.uniforms.mode.value = mode;
    programRef.current.uniforms.layers.value = layers;
    programRef.current.uniforms.speed.value = speed;
    programRef.current.uniforms.delay.value = delay;
    programRef.current.uniforms.width.value = width;
  }, [mode, layers, speed, delay, width]);

  useEffect(() => {
    const imgEl = imageRef.current;
    if (!imgEl) return;

    const setTextureImage = () => {
      if (!textureRef.current) return;
      isDoneRef.current = false;
      setIsDone(false);
      startTimeRef.current = null;
      textureRef.current.image = imgEl;
      textureRef.current.needsUpdate = true;
      isImageReadyRef.current = true;
    };

    if (imgEl.complete && imgEl.naturalWidth > 0) {
      setTextureImage();
    } else {
      imgEl.addEventListener('load', setTextureImage, { once: true });
      return () => {
        imgEl.removeEventListener('load', setTextureImage);
      };
    }
  }, [src]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || hasStartedRef.current) return;

    ioRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasStartedRef.current) {
          hasStartedRef.current = true;
          if (ioRef.current) {
            ioRef.current.disconnect();
            ioRef.current = null;
          }
        }
      },
      { threshold }
    );

    ioRef.current.observe(container);

    return () => {
      if (ioRef.current) {
        ioRef.current.disconnect();
        ioRef.current = null;
      }
    };
  }, [threshold]);

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative', overflow: 'hidden' }}>
      {/* We use a real <img> element so OGL can sample the decoded image element directly as a texture source. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className={imgClassName}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          objectFit: 'cover',
          opacity: isDone ? 1 : 0,
        }}
      />
    </div>
  );
}
