"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Mesh, Program, Renderer, Texture, Triangle } from "ogl";

type PixelScanTextRevealProps = {
  text: string;
  className?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number | string;
  color?: string;
  align?: "left" | "center" | "right";
  mode?: 0 | 1 | 2;
  layers?: number;
  speed?: number;
  delay?: number;
  width?: number;
  threshold?: number;
  desktopMinWidth?: number;
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

const canUseWebGL = () => {
  try {
    const canvas = document.createElement("canvas");
    const opts: WebGLContextAttributes = {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
    };
    const gl =
      canvas.getContext("webgl2", opts) ||
      canvas.getContext("webgl", opts) ||
      canvas.getContext("experimental-webgl", opts);
    return !!gl;
  } catch {
    return false;
  }
};

export default function PixelScanTextReveal({
  text,
  className,
  fontFamily = "Switzer, system-ui, sans-serif",
  fontSize,
  fontWeight = 700,
  color = "#ffffff",
  align = "center",
  mode = 0,
  layers = 3,
  speed = 0.75,
  delay = 0,
  width = 0.2,
  threshold = 0.9,
  desktopMinWidth = 1025,
}: PixelScanTextRevealProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const textMeasureRef = useRef<HTMLSpanElement | null>(null);

  const rendererRef = useRef<Renderer | null>(null);
  const meshRef = useRef<Mesh | null>(null);
  const programRef = useRef<Program | null>(null);
  const textureRef = useRef<Texture | null>(null);
  const glCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const rafRef = useRef<number>(0);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const ioRef = useRef<IntersectionObserver | null>(null);

  const startTimeRef = useRef<number | null>(null);
  const hasStartedRef = useRef(false);
  const isDoneRef = useRef(false);
  const isTextureReadyRef = useRef(false);
  const textCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureUpdateIdRef = useRef(0);

  const [isDesktop, setIsDesktop] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [forceSolidText, setForceSolidText] = useState(false);

  const shouldRunWebGL = isDesktop && !useFallback && !forceSolidText;
  const shouldShowDOMText = !isDesktop || useFallback || forceSolidText;

  const updateTextTexture = useCallback(() => {
    const measureEl = textMeasureRef.current;
    const texture = textureRef.current;
    if (!measureEl || !texture || typeof window === "undefined") return;

    const styles = window.getComputedStyle(measureEl);
    const textValue = measureEl.textContent || text;
    const font = `${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`;
    const textAlign =
      styles.textAlign === "right"
        ? "right"
        : styles.textAlign === "left"
          ? "left"
          : "center";
    const fontSizePx = Number.parseFloat(styles.fontSize) || fontSize || 48;
    const lineHeightPx =
      styles.lineHeight === "normal"
        ? fontSizePx * 1.1
        : Number.parseFloat(styles.lineHeight) || fontSizePx * 1.1;
    const padX = Math.ceil(fontSizePx * 0.18);
    const padY = Math.ceil(fontSizePx * 0.16);

    const probeCanvas = document.createElement("canvas");
    const probeCtx = probeCanvas.getContext("2d");
    if (!probeCtx) return;
    probeCtx.font = font;
    probeCtx.textBaseline = "alphabetic";
    probeCtx.textAlign = textAlign;

    const metrics = probeCtx.measureText(textValue);
    const textWidth = Math.ceil(metrics.width);
    const ascent = Math.ceil(
      metrics.actualBoundingBoxAscent || fontSizePx * 0.8,
    );
    const descent = Math.ceil(
      metrics.actualBoundingBoxDescent || fontSizePx * 0.2,
    );

    const cssWidth = Math.max(1, textWidth + padX * 2);
    const cssHeight = Math.max(
      1,
      Math.ceil(Math.max(lineHeightPx, ascent + descent) + padY * 2),
    );
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const canvas = textCanvasRef.current || document.createElement("canvas");
    textCanvasRef.current = canvas;
    canvas.width = Math.ceil(cssWidth * dpr);
    canvas.height = Math.ceil(cssHeight * dpr);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = textAlign;

    const x =
      textAlign === "left"
        ? padX
        : textAlign === "right"
          ? cssWidth - padX
          : cssWidth / 2;
    const y = padY + (cssHeight - padY * 2 - (ascent + descent)) / 2 + ascent;
    ctx.fillText(textValue, x, y);
    ctx.restore();

    textureUpdateIdRef.current += 1;
    texture.image = canvas;
    texture.needsUpdate = true;
    isTextureReadyRef.current = true;
    if (rendererRef.current && programRef.current) {
      rendererRef.current.setSize(cssWidth, cssHeight);
      programRef.current.uniforms.resolution.value[0] =
        rendererRef.current.gl.drawingBufferWidth;
      programRef.current.uniforms.resolution.value[1] =
        rendererRef.current.gl.drawingBufferHeight;
      programRef.current.uniforms.offset.value[0] = 0;
      programRef.current.uniforms.offset.value[1] = 0;
    }
  }, [text, color, fontSize]);

  const updateRendererSize = useCallback(() => {
    const renderer = rendererRef.current;
    const program = programRef.current;
    const measureEl = textMeasureRef.current;
    if (!renderer || !program || !measureEl) return;

    const rect = measureEl.getBoundingClientRect();
    const w = Math.max(1, Math.ceil(rect.width));
    const h = Math.max(1, Math.ceil(rect.height));

    renderer.setSize(w, h);

    const dbw = renderer.gl.drawingBufferWidth;
    const dbh = renderer.gl.drawingBufferHeight;
    program.uniforms.resolution.value[0] = dbw;
    program.uniforms.resolution.value[1] = dbh;
    program.uniforms.offset.value[0] = 0;
    program.uniforms.offset.value[1] = 0;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia(`(min-width: ${desktopMinWidth}px)`);
    const syncDesktopState = () => setIsDesktop(mediaQuery.matches);
    syncDesktopState();
    mediaQuery.addEventListener("change", syncDesktopState);
    return () => mediaQuery.removeEventListener("change", syncDesktopState);
  }, [desktopMinWidth]);

  useEffect(() => {
    const program = programRef.current;
    if (!program) return;
    program.uniforms.mode.value = mode;
    program.uniforms.layers.value = layers;
    program.uniforms.speed.value = speed;
    program.uniforms.delay.value = delay;
    program.uniforms.width.value = width;
  }, [mode, layers, speed, delay, width]);

  useEffect(() => {
    if (!shouldRunWebGL) return;
    const canvas = glCanvasRef.current;
    if (!canvas) return;
    canvas.style.opacity = "1";
    canvas.style.visibility = "visible";
    canvas.style.transition = "opacity 160ms ease";
  }, [shouldRunWebGL]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !shouldRunWebGL) return;

    if (!canUseWebGL()) {
      queueMicrotask(() => setUseFallback(true));
      return;
    }

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        dpr: Math.min(2, window.devicePixelRatio || 1),
      });
    } catch {
      queueMicrotask(() => setUseFallback(true));
      return;
    }

    rendererRef.current = renderer;
    const gl = renderer.gl;

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.BLEND);

    Object.assign(gl.canvas.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      display: "block",
      pointerEvents: "none",
      zIndex: "2",
    } as Partial<CSSStyleDeclaration>);

    glCanvasRef.current = gl.canvas;
    container.appendChild(gl.canvas);

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      setForceSolidText(true);
    };
    gl.canvas.addEventListener(
      "webglcontextlost",
      handleContextLost as EventListener,
      {
        passive: false,
      },
    );

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

    const renderCurrentFrame = () => {
      const rendererNow = rendererRef.current;
      const programNow = programRef.current;
      const meshNow = meshRef.current;
      if (!rendererNow || !programNow || !meshNow || !isTextureReadyRef.current)
        return;

      if (isDoneRef.current) {
        const finishAt = delay + 1 / Math.max(0.0001, speed);
        programNow.uniforms.time.value = performance.now() * 0.001;
        programNow.uniforms.enterTime.value = finishAt;
        programNow.uniforms.leaveTime.value = 0;
      }

      rendererNow.render({ scene: meshNow });
    };

    const updateSizeAndTexture = () => {
      updateRendererSize();
      updateTextTexture();
      renderCurrentFrame();
    };

    resizeObserverRef.current = new ResizeObserver(() => {
      updateSizeAndTexture();
    });

    const measureEl = textMeasureRef.current;
    if (measureEl) {
      resizeObserverRef.current.observe(measureEl);
    }
    resizeObserverRef.current.observe(container);
    updateSizeAndTexture();

    const renderLoop = (now: number) => {
      const rendererNow = rendererRef.current;
      const programNow = programRef.current;
      const meshNow = meshRef.current;
      if (!rendererNow || !programNow || !meshNow) return;

      if (
        !hasStartedRef.current ||
        !isTextureReadyRef.current ||
        isDoneRef.current
      ) {
        rafRef.current = requestAnimationFrame(renderLoop);
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

      const finishAt = delay + 1 / Math.max(0.0001, speed);
      if (elapsed >= finishAt) {
        programNow.uniforms.enterTime.value = finishAt;
        programNow.uniforms.leaveTime.value = 0;
        rendererNow.render({ scene: meshNow });
        isDoneRef.current = true;
        return;
      }

      rafRef.current = requestAnimationFrame(renderLoop);
    };

    const handleVisibility = () => {
      if (document.visibilityState !== "visible") return;

      const glContext = rendererRef.current?.gl;
      if (glContext?.isContextLost?.()) {
        setForceSolidText(true);
        return;
      }

      requestAnimationFrame(() => {
        updateTextTexture();
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            renderCurrentFrame();
          });
        });
      });
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pageshow", handleVisibility);

    rafRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pageshow", handleVisibility);
      gl.canvas.removeEventListener(
        "webglcontextlost",
        handleContextLost as EventListener,
      );

      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      if (ioRef.current) {
        ioRef.current.disconnect();
        ioRef.current = null;
      }

      if (rendererRef.current?.gl.canvas.parentNode === container) {
        container.removeChild(rendererRef.current.gl.canvas);
      }

      const loseCtx =
        rendererRef.current?.gl.getExtension("WEBGL_lose_context");
      loseCtx?.loseContext();

      meshRef.current = null;
      programRef.current = null;
      textureRef.current = null;
      rendererRef.current = null;
      glCanvasRef.current = null;
      isTextureReadyRef.current = false;
      textureUpdateIdRef.current += 1;
      textCanvasRef.current = null;
    };
  }, [
    shouldRunWebGL,
    mode,
    layers,
    speed,
    delay,
    width,
    updateRendererSize,
    updateTextTexture,
  ]);

  useEffect(() => {
    hasStartedRef.current = false;
    startTimeRef.current = null;
    isDoneRef.current = false;
    isTextureReadyRef.current = false;

    if (!shouldRunWebGL || !document.fonts?.load) {
      updateTextTexture();
      return;
    }

    const styleTarget = textMeasureRef.current;
    if (!styleTarget) {
      updateTextTexture();
      return;
    }

    const styles = window.getComputedStyle(styleTarget);
    const fontSpec = `${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`;
    document.fonts
      .load(fontSpec, text)
      .then(() => {
        updateTextTexture();
      })
      .catch(() => {
        updateTextTexture();
      });
  }, [text, color, shouldRunWebGL, updateTextTexture]);

  useEffect(() => {
    if (!shouldRunWebGL) return;
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
      { threshold },
    );
    ioRef.current.observe(container);

    return () => {
      if (ioRef.current) {
        ioRef.current.disconnect();
        ioRef.current = null;
      }
    };
  }, [threshold, shouldRunWebGL]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "relative",
        display: "inline-block",
        overflow: "visible",
      }}
    >
      <span
        ref={textMeasureRef}
        aria-hidden={shouldShowDOMText ? undefined : "true"}
        style={{
          display: "inline-block",
          color: shouldShowDOMText ? color : "transparent",
          fontFamily: fontFamily || undefined,
          fontSize: fontSize || undefined,
          fontWeight: fontWeight || undefined,
          lineHeight: 0.95,
          textAlign: align,
          whiteSpace: "pre-wrap",
          position: "relative",
          zIndex: 1,
          paddingInline: "0.12em",
          paddingBlock: "0.08em",
        }}
      >
        {text}
      </span>
    </div>
  );
}
