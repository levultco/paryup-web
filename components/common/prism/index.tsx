'use client';

import React, { useEffect, useRef } from 'react';
import { Renderer, Triangle, Program, Mesh } from 'ogl';

type PrismProps = {
  height?: number;
  baseWidth?: number;
  animationType?: 'rotate' | 'hover' | '3drotate';
  glow?: number;
  offset?: { x?: number; y?: number };
  noise?: number;
  transparent?: boolean;
  scale?: number;
  hueShift?: number;
  colorFrequency?: number;
  hoverStrength?: number;
  inertia?: number;
  bloom?: number;
  suspendWhenOffscreen?: boolean;
  timeScale?: number;
};

type RuntimeConfig = {
  height: number;
  baseWidth: number;
  animationType: 'rotate' | 'hover' | '3drotate';
  glow: number;
  offsetX: number;
  offsetY: number;
  noise: number;
  transparent: boolean;
  scale: number;
  hueShift: number;
  colorFrequency: number;
  hoverStrength: number;
  inertia: number;
  bloom: number;
  suspendWhenOffscreen: boolean;
  timeScale: number;
};

const Prism: React.FC<PrismProps> = ({
  height = 3.5,
  baseWidth = 5.5,
  animationType = 'rotate',
  glow = 1,
  offset = { x: 0, y: 0 },
  noise = 0.5,
  transparent = true,
  scale = 3.6,
  hueShift = 0,
  colorFrequency = 1,
  hoverStrength = 2,
  inertia = 0.05,
  bloom = 1,
  suspendWhenOffscreen = false,
  timeScale = 0.5,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const programRef = useRef<Program | null>(null);
  const meshRef = useRef<Mesh | null>(null);

  const rafRef = useRef<number>(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const resizeRafRef = useRef<number>(0);

  const hoverMoveHandlerRef = useRef<((e: PointerEvent) => void) | null>(null);
  const hoverLeaveHandlerRef = useRef<(() => void) | null>(null);

  const stateRef = useRef({
    yaw: 0,
    pitch: 0,
    roll: 0,
    targetYaw: 0,
    targetPitch: 0,
    pointer: { x: 0, y: 0, inside: false },
    wX: 0,
    wY: 0,
    wZ: 0,
    phX: 0,
    phZ: 0,
    t0: 0,
    isVisible: true,
    offscreenHeartbeatAt: 0,
    isHoverListening: false,
  });

  const buffersRef = useRef({
    rotBuf: new Float32Array(9),
    iResBuf: new Float32Array(2),
    offsetPxBuf: new Float32Array(2),
  });

  const sizeCacheRef = useRef({
    cssW: 0,
    cssH: 0,
    dbW: 0,
    dbH: 0,
    pxScale: Number.NaN,
  });

  const staticUniformCacheRef = useRef({
    height: Number.NaN,
    baseHalf: Number.NaN,
    glow: Number.NaN,
    noise: Number.NaN,
    saturation: Number.NaN,
    scale: Number.NaN,
    hueShift: Number.NaN,
    colorFreq: Number.NaN,
    bloom: Number.NaN,
    centerShift: Number.NaN,
    invBaseHalf: Number.NaN,
    invHeight: Number.NaN,
    minAxis: Number.NaN,
    timeScale: Number.NaN,
    useBaseWobble: Number.NaN,
    offsetX: Number.NaN,
    offsetY: Number.NaN,
    dpr: Number.NaN,
  });

  const configRef = useRef<RuntimeConfig>({
    height,
    baseWidth,
    animationType,
    glow,
    offsetX: offset?.x ?? 0,
    offsetY: offset?.y ?? 0,
    noise,
    transparent,
    scale,
    hueShift,
    colorFrequency,
    hoverStrength,
    inertia,
    bloom,
    suspendWhenOffscreen,
    timeScale,
  });

  useEffect(() => {
    const rnd = () => Math.random();
    const state = stateRef.current;
    state.wX = 0.3 + rnd() * 0.6;
    state.wY = 0.2 + rnd() * 0.7;
    state.wZ = 0.1 + rnd() * 0.5;
    state.phX = rnd() * Math.PI * 2;
    state.phZ = rnd() * Math.PI * 2;
    state.t0 = performance.now();
  }, []);

  const setMat3FromEuler = (yawY: number, pitchX: number, rollZ: number, out: Float32Array) => {
    const cy = Math.cos(yawY);
    const sy = Math.sin(yawY);
    const cx = Math.cos(pitchX);
    const sx = Math.sin(pitchX);
    const cz = Math.cos(rollZ);
    const sz = Math.sin(rollZ);

    const cc = cy * cz;
    const cs = cy * sz;
    const sc = sy * cz;
    const ss = sy * sz;

    out[0] = cc + ss * sx;
    out[1] = cx * sz;
    out[2] = -sc + cs * sx;

    out[3] = -cs + sc * sx;
    out[4] = cx * cz;
    out[5] = ss + cc * sx;

    out[6] = sy * cx;
    out[7] = -sx;
    out[8] = cy * cx;

    return out;
  };

  const setIdentity = (out: Float32Array) => {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 1;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 1;
  };

  const attachCanvasIfNeeded = () => {
    const container = containerRef.current;
    const canvas = rendererRef.current?.gl.canvas;
    if (!container || !canvas) return;
    if (canvas.parentNode === container) return;

    if (canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
    container.appendChild(canvas);
  };

  const updateSizeIfNeeded = () => {
    const container = containerRef.current;
    const renderer = rendererRef.current;
    const program = programRef.current;
    if (!container || !renderer || !program) return;

    const cssW = Math.max(1, container.clientWidth || 1);
    const cssH = Math.max(1, container.clientHeight || 1);

    if (cssW !== sizeCacheRef.current.cssW || cssH !== sizeCacheRef.current.cssH) {
      renderer.setSize(cssW, cssH);
      sizeCacheRef.current.cssW = cssW;
      sizeCacheRef.current.cssH = cssH;
    }

    const gl = renderer.gl;
    const dbW = gl.drawingBufferWidth;
    const dbH = gl.drawingBufferHeight;

    if (dbW !== sizeCacheRef.current.dbW) {
      buffersRef.current.iResBuf[0] = dbW;
      sizeCacheRef.current.dbW = dbW;
    }
    if (dbH !== sizeCacheRef.current.dbH) {
      buffersRef.current.iResBuf[1] = dbH;
      sizeCacheRef.current.dbH = dbH;
    }

    const s = Math.max(0.001, configRef.current.scale);
    const pxScale = 1 / ((dbH || 1) * 0.1 * s);
    if (pxScale !== sizeCacheRef.current.pxScale) {
      program.uniforms.uPxScale.value = pxScale;
      sizeCacheRef.current.pxScale = pxScale;
    }
  };

  const scheduleResize = () => {
    if (resizeRafRef.current) return;
    resizeRafRef.current = requestAnimationFrame(() => {
      resizeRafRef.current = 0;
      updateSizeIfNeeded();
    });
  };

  const applyStaticUniformsIfNeeded = () => {
    const program = programRef.current;
    const renderer = rendererRef.current;
    if (!program || !renderer) return;

    const cfg = configRef.current;
    const cache = staticUniformCacheRef.current;

    const H = Math.max(0.001, cfg.height);
    const BW = Math.max(0.001, cfg.baseWidth);
    const BASE_HALF = BW * 0.5;
    const SCALE = Math.max(0.001, cfg.scale);
    const GLOW = Math.max(0.0, cfg.glow);
    const NOISE = Math.max(0.0, cfg.noise);
    const SAT = cfg.transparent ? 1.5 : 1;
    const HUE = cfg.hueShift || 0;
    const FREQ = Math.max(0.0, cfg.colorFrequency || 1);
    const BLOOM = Math.max(0.0, cfg.bloom || 1);
    const TS = Math.max(0, cfg.timeScale || 1);
    const centerShift = H * 0.25;
    const invBaseHalf = 1 / BASE_HALF;
    const invHeight = 1 / H;
    const minAxis = Math.min(BASE_HALF, H);
    const useBaseWobble = cfg.animationType === 'hover' || cfg.animationType === '3drotate' ? 0 : 1;

    if (H !== cache.height) {
      program.uniforms.uHeight.value = H;
      cache.height = H;
    }
    if (BASE_HALF !== cache.baseHalf) {
      program.uniforms.uBaseHalf.value = BASE_HALF;
      cache.baseHalf = BASE_HALF;
    }
    if (GLOW !== cache.glow) {
      program.uniforms.uGlow.value = GLOW;
      cache.glow = GLOW;
    }
    if (NOISE !== cache.noise) {
      program.uniforms.uNoise.value = NOISE;
      cache.noise = NOISE;
    }
    if (SAT !== cache.saturation) {
      program.uniforms.uSaturation.value = SAT;
      cache.saturation = SAT;
    }
    if (SCALE !== cache.scale) {
      program.uniforms.uScale.value = SCALE;
      cache.scale = SCALE;
      sizeCacheRef.current.pxScale = Number.NaN;
    }
    if (HUE !== cache.hueShift) {
      program.uniforms.uHueShift.value = HUE;
      cache.hueShift = HUE;
    }
    if (FREQ !== cache.colorFreq) {
      program.uniforms.uColorFreq.value = FREQ;
      cache.colorFreq = FREQ;
    }
    if (BLOOM !== cache.bloom) {
      program.uniforms.uBloom.value = BLOOM;
      cache.bloom = BLOOM;
    }
    if (centerShift !== cache.centerShift) {
      program.uniforms.uCenterShift.value = centerShift;
      cache.centerShift = centerShift;
    }
    if (invBaseHalf !== cache.invBaseHalf) {
      program.uniforms.uInvBaseHalf.value = invBaseHalf;
      cache.invBaseHalf = invBaseHalf;
    }
    if (invHeight !== cache.invHeight) {
      program.uniforms.uInvHeight.value = invHeight;
      cache.invHeight = invHeight;
    }
    if (minAxis !== cache.minAxis) {
      program.uniforms.uMinAxis.value = minAxis;
      cache.minAxis = minAxis;
    }
    if (TS !== cache.timeScale) {
      program.uniforms.uTimeScale.value = TS;
      cache.timeScale = TS;
    }
    if (useBaseWobble !== cache.useBaseWobble) {
      program.uniforms.uUseBaseWobble.value = useBaseWobble;
      cache.useBaseWobble = useBaseWobble;
    }

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const pxX = (cfg.offsetX || 0) * dpr;
    const pxY = (cfg.offsetY || 0) * dpr;
    if (pxX !== cache.offsetX || pxY !== cache.offsetY || dpr !== cache.dpr) {
      buffersRef.current.offsetPxBuf[0] = pxX;
      buffersRef.current.offsetPxBuf[1] = pxY;
      cache.offsetX = pxX;
      cache.offsetY = pxY;
      cache.dpr = dpr;
    }

    const dbH = renderer.gl.drawingBufferHeight || 1;
    const pxScale = 1 / (dbH * 0.1 * SCALE);
    if (pxScale !== sizeCacheRef.current.pxScale) {
      program.uniforms.uPxScale.value = pxScale;
      sizeCacheRef.current.pxScale = pxScale;
    }
  };

  const removeHoverListeners = () => {
    if (hoverMoveHandlerRef.current) {
      window.removeEventListener('pointermove', hoverMoveHandlerRef.current);
    }
    if (hoverLeaveHandlerRef.current) {
      window.removeEventListener('mouseleave', hoverLeaveHandlerRef.current);
      window.removeEventListener('blur', hoverLeaveHandlerRef.current);
    }
    hoverMoveHandlerRef.current = null;
    hoverLeaveHandlerRef.current = null;
    stateRef.current.isHoverListening = false;
    stateRef.current.pointer.inside = false;
  };

  const syncHoverListeners = () => {
    const cfg = configRef.current;
    const state = stateRef.current;
    const shouldListen = cfg.animationType === 'hover';

    if (shouldListen && !state.isHoverListening) {
      hoverMoveHandlerRef.current = (e: PointerEvent) => {
        const ww = Math.max(1, window.innerWidth);
        const wh = Math.max(1, window.innerHeight);
        const cx = ww * 0.5;
        const cy = wh * 0.5;

        const nx = Math.max(-1, Math.min(1, (e.clientX - cx) / (ww * 0.5)));
        const ny = Math.max(-1, Math.min(1, (e.clientY - cy) / (wh * 0.5)));

        if (
          Math.abs(nx - state.pointer.x) < 0.0005 &&
          Math.abs(ny - state.pointer.y) < 0.0005 &&
          state.pointer.inside
        ) {
          return;
        }

        state.pointer.x = nx;
        state.pointer.y = ny;
        state.pointer.inside = true;
      };

      hoverLeaveHandlerRef.current = () => {
        state.pointer.inside = false;
      };

      window.addEventListener('pointermove', hoverMoveHandlerRef.current, { passive: true });
      window.addEventListener('mouseleave', hoverLeaveHandlerRef.current);
      window.addEventListener('blur', hoverLeaveHandlerRef.current);
      state.isHoverListening = true;
      return;
    }

    if (!shouldListen && state.isHoverListening) {
      removeHoverListeners();
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const renderer = new Renderer({
      dpr,
      alpha: transparent,
      antialias: false,
      depth: false,
      stencil: false,
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
    } as Partial<CSSStyleDeclaration>);

    attachCanvasIfNeeded();

    const vertex = /* glsl */ `
                attribute vec2 position;
                void main() {
                    gl_Position = vec4(position, 0.0, 1.0);
                }
            `;

    const fragment = /* glsl */ `
                precision highp float;

                uniform vec2  iResolution;
                uniform float iTime;

                uniform float uHeight;
                uniform float uBaseHalf;
                uniform mat3  uRot;
                uniform int   uUseBaseWobble;
                uniform float uGlow;
                uniform vec2  uOffsetPx;
                uniform float uNoise;
                uniform float uSaturation;
                uniform float uScale;
                uniform float uHueShift;
                uniform float uColorFreq;
                uniform float uBloom;
                uniform float uCenterShift;
                uniform float uInvBaseHalf;
                uniform float uInvHeight;
                uniform float uMinAxis;
                uniform float uPxScale;
                uniform float uTimeScale;

                vec4 tanh4(vec4 x){
                    vec4 e2x = exp(2.0*x);
                    return (e2x - 1.0) / (e2x + 1.0);
                }

                float rand(vec2 co){
                    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453123);
                }

                float sdOctaAnisoInv(vec3 p){
                    vec3 q = vec3(abs(p.x) * uInvBaseHalf, abs(p.y) * uInvHeight, abs(p.z) * uInvBaseHalf);
                    float m = q.x + q.y + q.z - 1.0;
                    return m * uMinAxis * 0.5773502691896258;
                }

                float sdPyramidUpInv(vec3 p){
                    float oct = sdOctaAnisoInv(p);
                    float halfSpace = -p.y;
                    return max(oct, halfSpace);
                }

                mat3 hueRotation(float a){
                    float c = cos(a), s = sin(a);
                    mat3 W = mat3(
                        0.299, 0.587, 0.114,
                        0.299, 0.587, 0.114,
                        0.299, 0.587, 0.114
                    );
                    mat3 U = mat3(
                        0.701, -0.587, -0.114,
                        -0.299,  0.413, -0.114,
                        -0.300, -0.588,  0.886
                    );
                    mat3 V = mat3(
                        0.168, -0.331,  0.500,
                        0.328,  0.035, -0.500,
                        -0.497,  0.296,  0.201
                    );
                    return W + U * c + V * s;
                }

                void main(){
                    vec2 f = (gl_FragCoord.xy - 0.5 * iResolution.xy - uOffsetPx) * uPxScale;

                    float z = 5.0;
                    float d = 0.0;

                    vec3 p;
                    vec4 o = vec4(0.0);

                    float centerShift = uCenterShift;
                    float cf = uColorFreq;

                    mat2 wob = mat2(1.0);
                    if (uUseBaseWobble == 1) {
                        float t = iTime * uTimeScale;
                        float c0 = cos(t + 0.0);
                        float c1 = cos(t + 33.0);
                        float c2 = cos(t + 11.0);
                        wob = mat2(c0, c1, c2, c0);
                    }


                    const int STEPS = 40;
                    for (int i = 0; i < STEPS; i++) {
                        p = vec3(f, z);
                        p.xz = p.xz * wob;
                        p = uRot * p;
                        vec3 q = p;
                        q.y += centerShift;
                        d = 0.1 + 0.2 * abs(sdPyramidUpInv(q));
                        z -= d;
                        o += (sin((p.y + z) * cf + vec4(0.0, 1.0, 2.0, 3.0)) + 1.0) / d;
                    }

                    o = tanh4(o * o * (uGlow * uBloom) / 1e5);

                    vec3 col = o.rgb;
                    float n = rand(gl_FragCoord.xy + vec2(iTime));
                    col += (n - 0.5) * uNoise;
                    col = clamp(col, 0.0, 1.0);

                    float L = dot(col, vec3(0.2126, 0.7152, 0.0722));
                    col = clamp(mix(vec3(L), col, uSaturation), 0.0, 1.0);

                    if(abs(uHueShift) > 0.0001){
                        col = clamp(hueRotation(uHueShift) * col, 0.0, 1.0);
                    }

                    gl_FragColor = vec4(col, o.a);
                }
            `;

    const geometry = new Triangle(gl);

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iResolution: { value: buffersRef.current.iResBuf },
        iTime: { value: 0 },
        uHeight: { value: height },
        uBaseHalf: { value: baseWidth * 0.5 },
        uUseBaseWobble: { value: 1 },
        uRot: { value: buffersRef.current.rotBuf },
        uGlow: { value: glow },
        uOffsetPx: { value: buffersRef.current.offsetPxBuf },
        uNoise: { value: noise },
        uSaturation: { value: transparent ? 1.5 : 1 },
        uScale: { value: scale },
        uHueShift: { value: hueShift },
        uColorFreq: { value: colorFrequency },
        uBloom: { value: bloom },
        uCenterShift: { value: height * 0.25 },
        uInvBaseHalf: { value: 1 / (baseWidth * 0.5) },
        uInvHeight: { value: 1 / height },
        uMinAxis: { value: Math.min(baseWidth * 0.5, height) },
        uPxScale: { value: 1 },
        uTimeScale: { value: timeScale },
      },
    });
    programRef.current = program;

    const mesh = new Mesh(gl, { geometry, program });
    meshRef.current = mesh;

    // Possible bottlenecks diagnosed:
    // 1) resize cascades causing redundant setSize + uniform writes
    // 2) restart/rehydration cost when returning from offscreen pause
    // 3) extra listener churn when animation mode changes
    resizeObserverRef.current = new ResizeObserver(() => {
      scheduleResize();
    });
    resizeObserverRef.current.observe(container);

    applyStaticUniformsIfNeeded();
    updateSizeIfNeeded();
    syncHoverListeners();

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }

      if (resizeRafRef.current) {
        cancelAnimationFrame(resizeRafRef.current);
        resizeRafRef.current = 0;
      }

      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      removeHoverListeners();

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }

      const canvas = rendererRef.current?.gl.canvas;
      if (canvas && canvas.parentNode === container) {
        container.removeChild(canvas);
      }

      const glCtx = rendererRef.current?.gl;
      if (glCtx) {
        const loseCtx = glCtx.getExtension('WEBGL_lose_context');
        loseCtx?.loseContext();
      }

      meshRef.current = null;
      programRef.current = null;
      rendererRef.current = null;
    };
  }, [transparent]);

  useEffect(() => {
    configRef.current = {
      height,
      baseWidth,
      animationType,
      glow,
      offsetX: offset?.x ?? 0,
      offsetY: offset?.y ?? 0,
      noise,
      transparent,
      scale,
      hueShift,
      colorFrequency,
      hoverStrength,
      inertia,
      bloom,
      suspendWhenOffscreen,
      timeScale,
    };

    applyStaticUniformsIfNeeded();
    updateSizeIfNeeded();
    syncHoverListeners();
  }, [
    height,
    baseWidth,
    animationType,
    glow,
    offset,
    noise,
    transparent,
    scale,
    hueShift,
    colorFrequency,
    hoverStrength,
    inertia,
    bloom,
    suspendWhenOffscreen,
    timeScale,
  ]);

  useEffect(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const render = (t: number) => {
      const renderer = rendererRef.current;
      const program = programRef.current;
      const mesh = meshRef.current;
      if (!renderer || !program || !mesh) return;

      const state = stateRef.current;
      const cfg = configRef.current;

      if (cfg.suspendWhenOffscreen && !state.isVisible) {
        if (t - state.offscreenHeartbeatAt > 250) {
          state.offscreenHeartbeatAt = t;
          const time = (t - state.t0) * 0.001;
          program.uniforms.iTime.value = time;
          renderer.render({ scene: mesh });
        }
        rafRef.current = requestAnimationFrame(render);
        return;
      }

      const time = (t - state.t0) * 0.001;
      program.uniforms.iTime.value = time;

      const TS = Math.max(0, cfg.timeScale || 1);
      const HOVSTR = Math.max(0, cfg.hoverStrength || 1);
      const INERT = Math.max(0, Math.min(1, cfg.inertia || 0.12));

      if (cfg.animationType === 'hover') {
        const maxPitch = 0.6 * HOVSTR;
        const maxYaw = 0.6 * HOVSTR;

        state.targetYaw = (state.pointer.inside ? -state.pointer.x : 0) * maxYaw;
        state.targetPitch = (state.pointer.inside ? state.pointer.y : 0) * maxPitch;

        state.yaw = lerp(state.yaw, state.targetYaw, INERT);
        state.pitch = lerp(state.pitch, state.targetPitch, INERT);
        state.roll = lerp(state.roll, 0, 0.1);

        setMat3FromEuler(state.yaw, state.pitch, state.roll, buffersRef.current.rotBuf);
      } else if (cfg.animationType === '3drotate') {
        const tScaled = time * TS;
        state.yaw = tScaled * state.wY;
        state.pitch = Math.sin(tScaled * state.wX + state.phX) * 0.6;
        state.roll = Math.sin(tScaled * state.wZ + state.phZ) * 0.5;
        setMat3FromEuler(state.yaw, state.pitch, state.roll, buffersRef.current.rotBuf);
      } else {
        setIdentity(buffersRef.current.rotBuf);
      }

      renderer.render({ scene: mesh });
      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, []);

  useEffect(() => {
    if (!suspendWhenOffscreen || !containerRef.current) {
      stateRef.current.isVisible = true;
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      return;
    }

    observerRef.current = new IntersectionObserver((entries) => {
      const entry = entries[0];
      stateRef.current.isVisible = entry.isIntersecting;
    });

    observerRef.current.observe(containerRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [suspendWhenOffscreen]);

  return <div className="w-full h-full relative" ref={containerRef} />;
};

export default Prism;
