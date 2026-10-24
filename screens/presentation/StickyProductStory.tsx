"use client";

import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  Images,
  Heart,
  MapPin,
  MessageCircle,
  Pause,
  Mic,
  Plus,
  Search,
  Ticket,
  Video,
} from "lucide-react";
import { useMotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { EventFlyerItem } from "@/components/common/eventFlyerCard";
import { AppStoreButton, PlayStoreButton } from "@/components/common/store";
import { storiesAvatars } from "@/constants/storiesAvatars";
import { LazyVideo } from "@/components/common/lazyVideo";
import {
  AppStoreButton as HeroAppStoreButton,
  PlayStoreButton as HeroPlayStoreButton,
} from "@/components/common/store";
import { Party, Stars } from "@/screens/v2/parts";
import { Plus_Jakarta_Sans } from "next/font/google";
import "@/screens/v2/v2.css";
import "./hero-prelude.css";
import "./ios-cards.css";

gsap.registerPlugin(ScrollTrigger);

type FeatureFlowCardVariant = "discover" | "albums" | "chat";

type FeatureFlowCard = {
  id: string;
  side: "left" | "right";
  eyebrow: string;
  title: string;
  description: string;
  variant: FeatureFlowCardVariant;
  range: readonly [number, number];
};

type PartyParticle = {
  id: string;
  type: "emoji" | "avatar";
  emoji?: string;
  avatarSrc?: string;
  avatarFallback?: string;
  left: number;
  size: number;
  drift: number;
  startOffset: number;
  endOffset: number;
  rotateDirection?: 1 | -1;
};

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

// Antes de la historia hay una portada: el móvil nace gigante con el texto del
// hero y se encoge hasta su sitio. PRELUDE es su duración en unidades de la
// línea de tiempo (1 unidad = 680vh de scroll); 310vh extra de altura.
const PRELUDE = 0.456;
// La historia empieza un poco antes de que acabe la portada, así las tarjetas
// aparecen sin esperar (antes lo hacían junto al trazo del cometa).
const STORY_AT = PRELUDE - 0.08;
const STORY_HEIGHT_CLASS = "h-[1036vh]";
const PHONE_W = 390;
const PHONE_H = 790;
const PHONE_ORIGIN_Y = 0.72;

const STEP = {
  entryStart: 0.0,
  entryEnd: 0.1,

  titleExitStart: 0.06,
  titleExitEnd: 0.16,

  cardsStart: 0.14,
  cardsEnd: 0.31,

  modalStart: 0.19,
  modalEnd: 0.42,

  zoomStart: 0.32,
  zoomEnd: 0.56,

  finalTextStart: 0.34,
  finalTextEnd: 0.53,

  coverCardStart: 0.54,
  coverCardEnd: 0.66,

  finalScrollStart: 0.64,
  finalScrollEnd: 0.8,
  improvedTextStart: 0.83,

  coverShrinkStart: 0.88,
  coverShrinkEnd: 1.0,
} as const;

const PARTICLES_RANGE = {
  start: STEP.finalTextStart,
  end: STEP.coverCardEnd,
} as const;

const PARTICLE_EMIT_INTERVAL = 0.28;
const PARTICLE_MIN_DURATION = 3.8;
const PARTICLE_MAX_DURATION = 5.2;

const PHONE_INITIAL_Y = 300;
// Pose de reposo del móvil: algo más pequeño y centrado en el espacio que deja
// la cabecera fija. La escala se hace desde el 72% de la altura, así que hay
// que restar lo que ese origen desplaza el centro del móvil.
const PHONE_REST_SCALE = 0.85;
const headerHeight = () =>
  document.querySelector("header")?.getBoundingClientRect().height ?? 104;
const phoneRestY = () =>
  headerHeight() / 2 -
  (PHONE_ORIGIN_Y - 0.5) * PHONE_H * (1 - PHONE_REST_SCALE);
const PHONE_ZOOM_Y = -240;
const PHONE_ZOOM_SCALE = 4.5;

const FEATURE_MUTED_BG = "rgba(255,255,255,0.06)";
const FEATURE_MUTED_BORDER = "rgba(255,255,255,0.12)";
const FEATURE_ACTIVE_BORDER = "rgba(255,255,255,0.24)";

function addFeatureCardMicroTimeline(
  tl: gsap.core.Timeline,
  card: HTMLElement,
  start: number,
  end: number,
) {
  const variant = card.dataset.variant as FeatureFlowCardVariant | undefined;
  const innerPadding = (end - start) * 0.04;
  const innerStart = start + innerPadding;
  const innerEnd = end - innerPadding;

  if (!variant || innerEnd <= innerStart) return;

  const innerDuration = innerEnd - innerStart;
  const at = (progress: number) => innerStart + innerDuration * progress;
  const duration = (progress: number) => innerDuration * progress;
  const all = (selector: string) =>
    gsap.utils.toArray<HTMLElement>(card.querySelectorAll(selector));
  const first = (selector: string) => card.querySelector<HTMLElement>(selector);

  if (variant === "discover") {
    const search = first('[data-micro="search"]');
    const searchGlow = first('[data-micro="search-glow"]');
    const chips = all('[data-micro="chip"]');
    const rows = all('[data-micro="row"]');
    const selectedChip = first("[data-selected-chip]");
    const selectedRow = first("[data-selected-row]");
    const counter = first('[data-micro="counter"]');

    if (search) {
      tl.fromTo(
        search,
        { opacity: 0.74, x: -8, scale: 0.985 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          backgroundColor: "rgba(255,255,255,0.08)",
          borderColor: FEATURE_ACTIVE_BORDER,
          duration: duration(0.18),
          ease: "power2.out",
        },
        at(0),
      );
    }

    if (searchGlow) {
      tl.fromTo(
        searchGlow,
        { opacity: 0, xPercent: -45 },
        {
          opacity: 0.56,
          xPercent: 12,
          duration: duration(0.3),
          ease: "power1.out",
        },
        at(0.06),
      );
      tl.to(
        searchGlow,
        { opacity: 0.18, xPercent: 36, duration: duration(0.22) },
        at(0.36),
      );
    }

    if (chips.length > 0) {
      tl.fromTo(
        chips,
        { opacity: 0, x: 20, scale: 0.96 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          stagger: 0.015,
          duration: duration(0.24),
          ease: "power2.out",
        },
        at(0.12),
      );
    }

    if (selectedChip) {
      tl.to(
        selectedChip,
        {
          x: -4,
          scale: 1.03,
          color: "#6f4300",
          backgroundColor: "#fff3bf",
          borderColor: "#ffe08a",
          duration: duration(0.22),
          ease: "power2.out",
        },
        at(0.46),
      );
    }

    if (counter) {
      tl.fromTo(
        counter,
        { opacity: 0, y: 7, scale: 0.92 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: duration(0.2),
          ease: "power2.out",
        },
        at(0.76),
      );
    }

    if (rows.length > 0) {
      tl.fromTo(
        rows,
        { opacity: 0, y: 18, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.018,
          duration: duration(0.28),
          ease: "power2.out",
        },
        at(0.28),
      );
      tl.to(
        rows,
        {
          y: -6,
          stagger: 0.008,
          duration: duration(0.22),
          ease: "power1.out",
        },
        at(0.58),
      );
    }

    if (selectedRow) {
      tl.to(
        selectedRow,
        {
          x: 4,
          scale: 1.025,
          backgroundColor: "rgba(34,197,94,0.14)",
          borderColor: "rgba(134,239,172,0.55)",
          duration: duration(0.24),
          ease: "power2.out",
        },
        at(0.66),
      );
    }

    return;
  }

  if (variant === "albums") {
    const photos = all('[data-micro="photo"]');
    const featuredPhoto = first("[data-featured-photo]");
    const progress = first('[data-micro="progress"]');
    const chips = all('[data-micro="chip"]');
    const statusOld = first('[data-micro="status-old"]');
    const statusNew = first('[data-micro="status-new"]');

    if (photos.length > 0) {
      tl.fromTo(
        photos,
        { opacity: 0, y: 16, scale: 0.92, rotation: -1.5 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotation: 0,
          stagger: 0.022,
          duration: duration(0.34),
          ease: "power2.out",
        },
        at(0.06),
      );
    }

    if (featuredPhoto) {
      tl.to(
        featuredPhoto,
        {
          y: -4,
          scale: 1.07,
          borderColor: FEATURE_ACTIVE_BORDER,
          duration: duration(0.24),
          ease: "power2.out",
        },
        at(0.42),
      );
    }

    if (progress) {
      tl.fromTo(
        progress,
        { scaleX: 0 },
        { scaleX: 1, duration: duration(0.36), ease: "power1.inOut" },
        at(0.38),
      );
    }

    if (statusOld && statusNew) {
      tl.to(
        statusOld,
        { opacity: 0, y: -7, duration: duration(0.14), ease: "power1.in" },
        at(0.58),
      );
      tl.fromTo(
        statusNew,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: duration(0.18), ease: "power2.out" },
        at(0.6),
      );
    }

    if (chips.length > 0) {
      tl.fromTo(
        chips,
        { opacity: 0, y: 12, scale: 0.94 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.018,
          duration: duration(0.22),
          ease: "power2.out",
        },
        at(0.68),
      );
    }

    return;
  }

  if (variant === "chat") {
    const avatars = all('[data-micro="avatar"]');
    const friendsPill = first("[data-friends-pill]");
    const firstMessage = first("[data-chat-step='first']");
    const secondMessage = first("[data-chat-step='second']");
    const typingBubble = first("[data-chat-step='typing']");
    const typing = all('[data-micro="typing"]');
    const reactionChip = first("[data-reaction-chip]");
    const finalMessage = first("[data-final-message]");

    if (avatars.length > 0) {
      tl.fromTo(
        avatars,
        { opacity: 0, x: -10, scale: 0.88 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          stagger: 0.018,
          duration: duration(0.1),
          ease: "back.out(1.35)",
        },
        at(0),
      );
      tl.to(
        avatars,
        {
          x: (index: number) => index * 2,
          duration: duration(0.08),
          ease: "power1.inOut",
        },
        at(0.12),
      );
    }

    if (friendsPill) {
      tl.fromTo(
        friendsPill,
        { opacity: 0, x: 14, scale: 0.94 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: duration(0.1),
          ease: "power2.out",
        },
        at(0.18),
      );
    }

    if (firstMessage) {
      tl.fromTo(
        firstMessage,
        { opacity: 0, y: 16, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: duration(0.12),
          ease: "power2.out",
        },
        at(0.3),
      );
    }

    if (secondMessage) {
      tl.fromTo(
        secondMessage,
        { opacity: 0, y: 16, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: duration(0.12),
          ease: "power2.out",
        },
        at(0.44),
      );
    }

    if (typingBubble) {
      tl.fromTo(
        typingBubble,
        { opacity: 0, y: 14, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: duration(0.08),
          ease: "power2.out",
        },
        at(0.58),
      );
    }

    if (typing.length > 0) {
      tl.fromTo(
        typing,
        { opacity: 0, y: 3 },
        {
          opacity: 1,
          y: -2,
          stagger: 0.025,
          duration: duration(0.06),
          ease: "sine.inOut",
        },
        at(0.68),
      );
      tl.to(
        typing,
        {
          opacity: 0.35,
          y: 2,
          stagger: 0.02,
          duration: duration(0.06),
          ease: "sine.inOut",
        },
        at(0.76),
      );
    }

    if (reactionChip) {
      tl.fromTo(
        reactionChip,
        { opacity: 0, y: 12, scale: 0.92 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: duration(0.07),
          ease: "power2.out",
        },
        at(0.84),
      );
    }

    if (finalMessage) {
      tl.fromTo(
        finalMessage,
        { opacity: 0, y: 18, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: duration(0.07),
          ease: "power2.out",
        },
        at(0.93),
      );
    }
  }
}

const FEATURE_FLOW_CARDS: FeatureFlowCard[] = [
  {
    id: "day-recap",
    side: "left",
    eyebrow: "RECAP DEL DÍA",
    title: "Revive el evento",
    description: "Fotos y momentos de la noche, listos para volver a verlos.",
    variant: "albums",
    range: [0, 0.41],
  },
  {
    id: "group-chat",
    side: "right",
    eyebrow: "TODO CLARO",
    title: "El grupo responde",
    description: "Sabes quién va sin perder tiempo.",
    variant: "chat",
    range: [0.1, 0.41],
  },
];

const FINAL_HIGHLIGHT_EVENTS: EventFlyerItem[] = [
  {
    image: "/album/club-selfie-1.jpg",
    title: "Neon Night",
    handle: "Opium Barcelona",
    date: "HOY",
    gradient: "linear-gradient(145deg, #3B82F6, #000)",
    badges: ["Destacado"],
  },
  {
    image: "/album/club-selfie-2.jpg",
    title: "After Club",
    handle: "Sutton Club",
    date: "VIE",
    gradient: "linear-gradient(145deg, #ff8a3d, #000)",
    badges: ["Top plan"],
  },
  {
    image: "/album/club-selfie-3.jpg",
    title: "Beach Session",
    handle: "Pacha Barcelona",
    date: "SAB",
    gradient: "linear-gradient(145deg, #22c55e, #000)",
    badges: ["Últimas"],
  },
];

const PARTY_PARTICLES: PartyParticle[] = [
  {
    id: "e1",
    type: "emoji",
    emoji: "🤩",
    left: 8,
    size: 52,
    drift: 36,
    startOffset: 0,
    endOffset: 0.08,
    rotateDirection: 1,
  },
  {
    id: "e2",
    type: "emoji",
    emoji: "🥳",
    left: 88,
    size: 52,
    drift: -34,
    startOffset: 0.02,
    endOffset: 0.06,
    rotateDirection: -1,
  },
  {
    id: "e3",
    type: "emoji",
    emoji: "🎶",
    left: 18,
    size: 52,
    drift: 20,
    startOffset: 0.01,
    endOffset: 0.07,
    rotateDirection: 1,
  },
  {
    id: "e4",
    type: "emoji",
    emoji: "👌🏽",
    left: 82,
    size: 52,
    drift: -18,
    startOffset: 0.03,
    endOffset: 0.07,
    rotateDirection: -1,
  },
  {
    id: "e5",
    type: "emoji",
    emoji: "🔥",
    left: 28,
    size: 52,
    drift: 24,
    startOffset: 0.05,
    endOffset: 0.08,
    rotateDirection: 1,
  },
  {
    id: "e6",
    type: "emoji",
    emoji: "✨",
    left: 72,
    size: 52,
    drift: -22,
    startOffset: 0.04,
    endOffset: 0.08,
    rotateDirection: -1,
  },
  {
    id: "e7",
    type: "emoji",
    emoji: "😳",
    left: 12,
    size: 52,
    drift: 14,
    startOffset: 0.06,
    endOffset: 0.06,
    rotateDirection: 1,
  },
  {
    id: "e8",
    type: "emoji",
    emoji: "🪩",
    left: 90,
    size: 52,
    drift: -24,
    startOffset: 0.07,
    endOffset: 0.08,
    rotateDirection: -1,
  },
  {
    id: "e9",
    type: "emoji",
    emoji: "🕺🏻",
    left: 24,
    size: 52,
    drift: 28,
    startOffset: 0.08,
    endOffset: 0.07,
    rotateDirection: 1,
  },
  {
    id: "e10",
    type: "emoji",
    emoji: "🍾",
    left: 76,
    size: 52,
    drift: -24,
    startOffset: 0.09,
    endOffset: 0.06,
    rotateDirection: -1,
  },
  {
    id: "e11",
    type: "emoji",
    emoji: "🪅",
    left: 38,
    size: 52,
    drift: 20,
    startOffset: 0.1,
    endOffset: 0.07,
    rotateDirection: 1,
  },
  {
    id: "e12",
    type: "emoji",
    emoji: "🎈",
    left: 64,
    size: 52,
    drift: -18,
    startOffset: 0.11,
    endOffset: 0.08,
    rotateDirection: -1,
  },
  {
    id: "a1",
    type: "avatar",
    avatarSrc: storiesAvatars[0]?.src,
    avatarFallback: storiesAvatars[0]?.fallback ?? "SK",
    left: 6,
    size: 90,
    drift: 20,
    startOffset: 0.01,
    endOffset: 0.09,
  },
  {
    id: "a2",
    type: "avatar",
    avatarSrc: storiesAvatars[1]?.src,
    avatarFallback: storiesAvatars[1]?.fallback ?? "CN",
    left: 94,
    size: 92,
    drift: -22,
    startOffset: 0.03,
    endOffset: 0.09,
  },
  {
    id: "a3",
    type: "avatar",
    avatarSrc: storiesAvatars[2]?.src,
    avatarFallback: storiesAvatars[2]?.fallback ?? "AW",
    left: 14,
    size: 98,
    drift: 16,
    startOffset: 0.06,
    endOffset: 0.08,
  },
  {
    id: "a4",
    type: "avatar",
    avatarSrc: storiesAvatars[3]?.src,
    avatarFallback: storiesAvatars[3]?.fallback ?? "GR",
    left: 86,
    size: 90,
    drift: -20,
    startOffset: 0.08,
    endOffset: 0.08,
  },
];

export default function StickyProductStory() {
  const linePathProgress = useMotionValue(0);
  const sectionRef = useRef<HTMLElement | null>(null);
  const phoneRef = useRef<HTMLDivElement | null>(null);
  const cardsLayerRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const finalTextRef = useRef<HTMLDivElement | null>(null);
  const finalTextLabelRef = useRef<HTMLParagraphElement | null>(null);
  const finalSubLabelRef = useRef<HTMLParagraphElement | null>(null);
  const preCoverLayerRef = useRef<HTMLDivElement | null>(null);
  const phoneSceneLayerRef = useRef<HTMLDivElement | null>(null);
  const heroSkyRef = useRef<HTMLDivElement | null>(null);
  const heroCopyRef = useRef<HTMLDivElement | null>(null);
  const heroBgRef = useRef<HTMLDivElement | null>(null);
  const heroFadeRef = useRef<HTMLDivElement | null>(null);
  const phoneGlowRef = useRef<HTMLDivElement | null>(null);
  const heroOnRef = useRef(true);
  const [heroOn, setHeroOn] = useState(true);
  const coverCardRef = useRef<HTMLDivElement | null>(null);
  const coverCardInnerRef = useRef<HTMLDivElement | null>(null);
  const finalScrollContentRef = useRef<HTMLDivElement | null>(null);
  const finalScrollTitleRef = useRef<HTMLHeadingElement | null>(null);
  const finalScrollSubtitleRef = useRef<HTMLParagraphElement | null>(null);
  const finalScrollBodyRef = useRef<HTMLDivElement | null>(null);
  const finalBridgeLayerRef = useRef<HTMLDivElement | null>(null);
  const finalBridgeTextRef = useRef<HTMLDivElement | null>(null);
  const particlesLayerRef = useRef<HTMLDivElement | null>(null);
  const particleRefs = useRef<Array<HTMLDivElement | null>>([]);
  const particleTweensRef = useRef<gsap.core.Animation[]>([]);
  const particlesStartedRef = useRef(false);
  const particlesInitializedRef = useRef(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    if (!phoneRef.current) return;
    if (!cardsLayerRef.current) return;
    if (!modalRef.current) return;
    if (!finalTextRef.current) return;
    if (!finalTextLabelRef.current) return;
    if (!finalSubLabelRef.current) return;
    if (!preCoverLayerRef.current) return;
    if (!phoneSceneLayerRef.current) return;
    if (!coverCardRef.current) return;
    if (!coverCardInnerRef.current) return;
    if (!finalScrollContentRef.current) return;
    if (!finalScrollTitleRef.current) return;
    if (!finalScrollSubtitleRef.current) return;
    if (!finalScrollBodyRef.current) return;
    if (!finalBridgeLayerRef.current) return;
    if (!finalBridgeTextRef.current) return;
    if (!particlesLayerRef.current) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".story-flow-card");
      const finalScrollCards =
        gsap.utils.toArray<HTMLElement>(".final-scroll-card");
      const finalCopyBlocks =
        gsap.utils.toArray<HTMLElement>(".final-copy-block");
      const finalTitleLines = gsap.utils.toArray<HTMLElement>(
        finalScrollTitleRef.current?.querySelectorAll("[data-scroll-line]") ??
          [],
      );
      const finalBridgeLines = gsap.utils.toArray<HTMLElement>(
        finalBridgeTextRef.current?.querySelectorAll("[data-scroll-line]") ??
          [],
      );
      const particlesLayerEl = particlesLayerRef.current;
      const coverCardInnerEl = coverCardInnerRef.current;
      if (!particlesLayerEl || !coverCardInnerEl) return;

      const clamp = (value: number, min: number, max: number) =>
        Math.min(max, Math.max(min, value));

      const clipParticlesToModal = () => {
        if (!modalRef.current) return;

        const rect = modalRef.current.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const insetTop = clamp(rect.top, 0, vh);
        const insetLeft = clamp(rect.left, 0, vw);
        const insetRight = clamp(vw - rect.right, 0, vw);
        const insetBottom = clamp(vh - rect.bottom, 0, vh);

        particlesLayerEl.style.clipPath = `inset(${insetTop}px ${insetRight}px ${insetBottom}px ${insetLeft}px)`;
      };

      const setParticlesInitialState = () => {
        particleRefs.current.forEach((particleEl) => {
          if (!particleEl) return;
          gsap.set(particleEl, {
            x: 0,
            y: 0,
            opacity: 0,
            rotation: 0,
            scale: 1,
          });
        });
      };

      const createParticleLoops = () => {
        if (particlesInitializedRef.current) return;
        particlesInitializedRef.current = true;
        const totalCycleDuration =
          PARTY_PARTICLES.length * PARTICLE_EMIT_INTERVAL;
        const endY = -(window.innerHeight + 320);

        particleRefs.current.forEach((particleEl, index) => {
          if (!particleEl) return;
          const particle = PARTY_PARTICLES[index];
          if (!particle) return;

          const delay = index * PARTICLE_EMIT_INTERVAL;
          const riseDuration = gsap.utils.random(
            PARTICLE_MIN_DURATION,
            PARTICLE_MAX_DURATION,
          );
          const repeatDelay = Math.max(0, totalCycleDuration - riseDuration);
          const fadeInDuration = 0.22 + (index % 3) * 0.03;
          const fadeOutDuration = 0.35;
          const startX = gsap.utils.random(-24, 24);
          const extraDrift = gsap.utils.random(-26, 26);
          const startY = gsap.utils.random(80, 180);
          const startScale = gsap.utils.random(0.88, 1.08);
          const fadeOutStart = Math.max(
            fadeInDuration + 0.2,
            riseDuration - fadeOutDuration,
          );

          const particleTimeline = gsap.timeline({
            paused: true,
            repeat: -1,
            repeatDelay,
            delay,
          });

          particleTimeline.set(
            particleEl,
            {
              x: startX,
              y: startY,
              opacity: 0,
              rotation: 0,
              scale: startScale,
            },
            0,
          );
          particleTimeline.to(
            particleEl,
            {
              opacity: 1,
              duration: fadeInDuration,
              ease: "power1.out",
            },
            0,
          );
          particleTimeline.to(
            particleEl,
            {
              y: endY,
              x: particle.drift + extraDrift,
              rotation:
                particle.type === "emoji"
                  ? (particle.rotateDirection ?? 1) * 360
                  : 0,
              duration: riseDuration,
              ease: "none",
            },
            0,
          );
          particleTimeline.to(
            particleEl,
            {
              opacity: 0,
              duration: fadeOutDuration,
              ease: "power1.in",
            },
            fadeOutStart,
          );
          particleTimeline.set(particleEl, {
            x: startX,
            y: startY,
            opacity: 0,
            rotation: 0,
            scale: startScale,
          });

          particleTweensRef.current.push(particleTimeline);
        });
      };

      // La opacidad de la capa va en la línea de tiempo (scrub); aquí solo se
      // arranca o se para el bucle de subida para no gastar fuera del rango.
      const showParticles = () => {
        createParticleLoops();
        particleTweensRef.current.forEach((tween) => tween.resume());
      };

      const hideParticles = () => {
        particleTweensRef.current.forEach((tween) => tween.pause());
      };

      const resetFinalDetails = () => {
        gsap.killTweensOf(finalScrollSubtitleRef.current);
        gsap.killTweensOf(finalScrollBodyRef.current);
        gsap.killTweensOf(finalCopyBlocks);
        gsap.killTweensOf(finalScrollCards);
        gsap.set(finalScrollSubtitleRef.current, {
          opacity: 0,
          y: 34,
        });
        gsap.set(finalScrollBodyRef.current, {
          opacity: 1,
          y: 0,
        });
        // autoAlpha: invisibles también para el ratón (llevan botones).
        gsap.set(finalCopyBlocks, {
          autoAlpha: 0,
          y: 54,
        });
        gsap.set(finalScrollCards, {
          opacity: 0,
          y: 92,
          scale: 0.94,
          rotation: 0,
          transformOrigin: "50% 70%",
        });
      };

      gsap.set(phoneRef.current, {
        y: PHONE_INITIAL_Y,
        scale: 1,
        force3D: true,
        transformOrigin: "50% 72%",
      });
      gsap.set(cardsLayerRef.current, { opacity: 1 });
      gsap.set(modalRef.current, {
        yPercent: 100,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
      });
      gsap.set(finalTextRef.current, {
        opacity: 1,
        scale: 0.2,
        transformOrigin: "50% 50%",
      });
      gsap.set(finalTextLabelRef.current, { opacity: 0, y: 30 });
      gsap.set(finalSubLabelRef.current, { opacity: 0, y: 50 });
      gsap.set(finalScrollContentRef.current, {
        y: 40,
        opacity: 0.96,
      });
      gsap.set(finalScrollTitleRef.current, { opacity: 1 });
      gsap.set(finalBridgeTextRef.current, {
        autoAlpha: 0,
        y: 40,
        scale: 1,
        transformOrigin: "50% 60%",
      });
      gsap.set(".final-bridge-extra", { autoAlpha: 0, y: 24 });
      gsap.set(".cover-card-ui", { autoAlpha: 0 });
      gsap.set([...finalTitleLines, ...finalBridgeLines], {
        yPercent: 112,
        "--chroma-pos": "100%",
      });
      resetFinalDetails();

      gsap.set(preCoverLayerRef.current, { autoAlpha: 1 });
      gsap.set(phoneSceneLayerRef.current, { autoAlpha: 1 });
      gsap.set(cards, {
        y: 96,
        opacity: 0,
        scale: 0.985,
        force3D: true,
        transformOrigin: "50% 50%",
      });
      gsap.set(coverCardRef.current, {
        opacity: 1,
        yPercent: 115,
        scale: 0.7,
        transformOrigin: "50% 50%",
      });
      gsap.set(coverCardInnerEl, {
        width: "100vw",
        height: "100vh",
        borderRadius: 0,
        filter: "brightness(0)",
        y: 0,
        x: 0,
        scale: 1,
        rotation: 0,
        transformOrigin: "50% 50%",
      });
      gsap.set(particlesLayerEl, { opacity: 0 });
      setParticlesInitialState();
      clipParticlesToModal();

      const master = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.45,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            clipParticlesToModal();
            const masterTime = self.animation?.time() ?? 0;
            const timelineTime = masterTime - STORY_AT;
            const inHero = masterTime < PRELUDE;
            if (inHero !== heroOnRef.current) {
              heroOnRef.current = inHero;
              setHeroOn(inHero);
            }
            const lineProgress = clamp(
              (timelineTime - STEP.entryStart) /
                (STEP.cardsEnd - STEP.entryStart),
              0,
              1,
            );
            const isParticlesRange =
              timelineTime >= PARTICLES_RANGE.start &&
              timelineTime < PARTICLES_RANGE.end;

            linePathProgress.set(lineProgress);

            if (isParticlesRange && !particlesStartedRef.current) {
              particlesStartedRef.current = true;
              showParticles();
            } else if (!isParticlesRange && particlesStartedRef.current) {
              particlesStartedRef.current = false;
              hideParticles();
            }
          },
          onLeave: () => {
            particlesStartedRef.current = false;
            hideParticles();
            gsap.set(finalBridgeTextRef.current, {
              autoAlpha: 1,
              y: 0,
              scale: 1,
            });
            linePathProgress.set(1);
          },
          onLeaveBack: () => {
            particlesStartedRef.current = false;
            hideParticles();
            resetFinalDetails();
            gsap.set(finalBridgeTextRef.current, {
              autoAlpha: 0,
              y: 40,
              scale: 1,
            });
            linePathProgress.set(0);
          },
          onRefresh: () => {
            clipParticlesToModal();
          },
        },
      });

      const tl = gsap.timeline({ defaults: { ease: "none" } });

      tl.to(
        phoneRef.current,
        {
          y: phoneRestY,
          duration: STEP.cardsStart - STEP.entryStart,
          ease: "none",
          force3D: true,
        },
        STEP.entryStart,
      );

      tl.to(
        phoneGlowRef.current,
        { opacity: 0, duration: 0.08 },
        STEP.zoomStart,
      );

      tl.to(
        phoneRef.current,
        {
          y: PHONE_ZOOM_Y,
          scale: PHONE_ZOOM_SCALE,
          duration: STEP.zoomEnd - STEP.zoomStart,
          ease: "power1.inOut",
          force3D: true,
        },
        STEP.zoomStart,
      );

      tl.to(
        modalRef.current,
        {
          yPercent: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          duration: STEP.modalEnd - STEP.modalStart,
        },
        STEP.modalStart,
      );

      tl.to(
        finalTextRef.current,
        {
          scale: 1,
          duration: STEP.finalTextEnd - STEP.finalTextStart,
        },
        STEP.finalTextStart,
      );

      tl.to(
        finalTextLabelRef.current,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: STEP.finalTextEnd - STEP.finalTextStart,
        },
        STEP.finalTextStart,
      );
      tl.to(
        finalSubLabelRef.current,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: STEP.finalTextEnd - STEP.finalTextStart,
        },
        STEP.finalTextStart,
      );

      tl.to(
        coverCardRef.current,
        {
          yPercent: 0,
          scale: 1,
          duration: STEP.coverCardEnd - STEP.coverCardStart,
          ease: "none",
        },
        STEP.coverCardStart,
      );
      tl.to(
        preCoverLayerRef.current,
        {
          autoAlpha: 0,
          duration: 0.02,
          ease: "none",
        },
        STEP.finalScrollStart,
      );
      tl.to(
        phoneSceneLayerRef.current,
        {
          autoAlpha: 0,
          duration: 0.02,
          ease: "none",
        },
        STEP.finalScrollStart,
      );

      // Bloque "Impulsando la noche real": todo atado al scroll. Entra entre
      // finalScrollStart y +0.07, se queda quieto y sale del todo antes de que
      // aparezca el titular final, así nunca se pisan.
      const finalExitStart = STEP.finalScrollEnd - 0.01;
      const finalExitEnd = STEP.improvedTextStart - 0.005;

      tl.to(
        particlesLayerEl,
        { opacity: 1, duration: 0.02 },
        PARTICLES_RANGE.start,
      );
      tl.to(
        particlesLayerEl,
        { opacity: 0, duration: 0.02 },
        PARTICLES_RANGE.end - 0.02,
      );

      tl.to(
        finalScrollContentRef.current,
        {
          y: -20,
          opacity: 1,
          duration: finalExitStart - STEP.finalScrollStart,
        },
        STEP.finalScrollStart,
      );
      tl.to(
        finalTitleLines,
        {
          yPercent: 0,
          duration: 0.04,
          stagger: 0.012,
          ease: "power2.out",
        },
        STEP.finalScrollStart,
      );
      tl.to(
        finalTitleLines,
        { "--chroma-pos": "0%", duration: 0.05, stagger: 0.012 },
        STEP.finalScrollStart + 0.01,
      );
      tl.to(
        finalScrollSubtitleRef.current,
        { opacity: 1, y: 0, duration: 0.04, ease: "power2.out" },
        STEP.finalScrollStart + 0.03,
      );
      tl.to(
        finalCopyBlocks,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.05,
          stagger: 0.015,
          ease: "power2.out",
        },
        STEP.finalScrollStart + 0.045,
      );
      tl.to(
        finalScrollCards,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotation: (index) => [-9, 0, 8][index] ?? 0,
          duration: 0.06,
          stagger: 0.012,
          ease: "power2.out",
        },
        STEP.finalScrollStart + 0.05,
      );

      tl.to(
        finalScrollContentRef.current,
        {
          autoAlpha: 0,
          y: -50,
          duration: finalExitEnd - finalExitStart,
          ease: "power1.in",
        },
        finalExitStart,
      );

      tl.to(
        finalBridgeTextRef.current,
        { autoAlpha: 1, y: 0, duration: 0.04, ease: "power2.out" },
        STEP.improvedTextStart,
      );
      tl.to(
        ".final-bridge-extra",
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.04,
          stagger: 0.012,
          ease: "power2.out",
        },
        STEP.improvedTextStart + 0.03,
      );
      tl.to(
        finalBridgeLines,
        {
          yPercent: 0,
          duration: 0.04,
          stagger: 0.012,
          ease: "power2.out",
        },
        STEP.improvedTextStart,
      );
      tl.to(
        finalBridgeLines,
        { "--chroma-pos": "0%", duration: 0.05, stagger: 0.012 },
        STEP.improvedTextStart + 0.01,
      );
      tl.to(
        coverCardInnerEl,
        {
          width: 400,
          height: 650,
          borderRadius: 32,
          // En la columna derecha, sin tapar el titular en pantallas anchas.
          x: () => Math.min(window.innerWidth * 0.22, 380),
          y: 30,
          filter: "brightness(1)",
          rotation: -5,
          duration: STEP.coverShrinkEnd - STEP.coverShrinkStart,
          ease: "power2.inOut",
        },
        STEP.coverShrinkStart,
      );
      tl.to(
        ".cover-card-ui",
        { autoAlpha: 1, duration: 0.04, ease: "power1.out" },
        STEP.coverShrinkEnd - 0.045,
      );

      cards.forEach((card) => {
        const start = Number(card.dataset.start ?? STEP.cardsStart);
        const end = Number(card.dataset.end ?? STEP.cardsEnd);
        const cardDuration = end - start;
        const microStart = start + cardDuration * 0.08;
        const microEnd = start + cardDuration * 0.5;
        const fadeInEnd = start + cardDuration * 0.14;
        const fadeOutStart = end - cardDuration * 0.18;

        tl.fromTo(
          card,
          {
            y: () => Math.min(120, window.innerHeight * 0.14),
            scale: 0.985,
          },
          {
            y: () => -(window.innerHeight + card.offsetHeight + 96),
            scale: 1.01,
            force3D: true,
            duration: cardDuration,
            ease: "none",
          },
          start,
        );
        tl.fromTo(
          card,
          { opacity: 0 },
          {
            opacity: 1,
            duration: fadeInEnd - start,
            ease: "power2.out",
          },
          start,
        );
        tl.to(
          card,
          {
            opacity: 0,
            duration: end - fadeOutStart,
            ease: "power2.in",
          },
          fadeOutStart,
        );
        addFeatureCardMicroTimeline(tl, card, microStart, microEnd);
      });

      // Portada: el móvil gigante se encoge hasta su sitio y la historia sigue.
      const vh = () => window.innerHeight;
      const heroScale = () => (window.innerWidth * 0.68) / PHONE_W;
      const heroY = () => {
        const layoutTop = (vh() - PHONE_H) / 2;
        const y0 = PHONE_H * PHONE_ORIGIN_Y;
        return vh() * 0.215 - layoutTop - y0 + heroScale() * y0;
      };

      master.fromTo(
        phoneRef.current,
        { scale: heroScale, y: heroY },
        {
          scale: PHONE_REST_SCALE,
          y: phoneRestY,
          duration: 0.36,
          ease: "power2.inOut",
          force3D: true,
        },
        0,
      );
      master.to(heroCopyRef.current, { autoAlpha: 0, duration: 0.1 }, 0);
      master.to(heroSkyRef.current, { autoAlpha: 0, duration: 0.34 }, 0.02);
      // El resplandor se cierra por los lados (solo ancho) mientras se apaga.
      master.to(
        heroSkyRef.current?.querySelector(".v2-sky") ?? null,
        { scaleX: 0.3, transformOrigin: "50% 50%", duration: 0.34 },
        0.02,
      );
      master.to(heroBgRef.current, { opacity: 0, duration: 0.2 }, 0.1);
      master.to(heroFadeRef.current, { opacity: 0, duration: 0.3 }, 0);
      // Resplandor amarillo que aparece según el móvil se encoge, y se apaga
      // cuando empieza el zoom grande.
      master.fromTo(
        phoneGlowRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.26, ease: "power1.in" },
        0.12,
      );
      master.add(tl, STORY_AT);

      // Entrada de la portada tras la pantalla de carga.
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (!reduced) {
        gsap
          .timeline({ delay: 1.9, defaults: { ease: "expo.out" } })
          .from(".hp-sky .v2-sky", { opacity: 0, duration: 2 }, 0)
          .from(
            ".hp-copy .v2-herocopy > *",
            { opacity: 0, y: 30, duration: 1, stagger: 0.1 },
            0.4,
          )
          .from(
            ".hp-copy .v2-party",
            { opacity: 0, scale: 0.4, duration: 1.2, stagger: 0.15 },
            0.9,
          );
      }
    }, sectionRef);

    return () => {
      particleTweensRef.current.forEach((tween) => tween.kill());
      particleTweensRef.current = [];
      particlesStartedRef.current = false;
      particlesInitializedRef.current = false;
      ctx.revert();
    };
  }, [linePathProgress]);

  return (
    <section
      ref={sectionRef}
      id="inicio"
      className={`relative w-full ${STORY_HEIGHT_CLASS}`}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div
          ref={heroSkyRef}
          className={`v2 hp-layer hp-sky ${jakarta.variable}`}
          style={{ "--ty": "21.5vh" } as React.CSSProperties}
          aria-hidden
          data-off={heroOn ? undefined : ""}
        >
          <div className="v2-sky" />
          {heroOn && <Stars />}
        </div>
        <div ref={preCoverLayerRef} className="absolute inset-0 z-30">
          <div
            ref={cardsLayerRef}
            className="pointer-events-none absolute inset-0 hidden md:block"
          >
            {FEATURE_FLOW_CARDS.map((card) => (
              <FeatureFlowCard key={card.id} card={card} />
            ))}
          </div>

          <div
            ref={finalTextRef}
            className="pointer-events-none absolute inset-0 z-40 flex flex-col items-center justify-center text-center"
          >
            <h1
              ref={finalTextLabelRef}
              className="mx-auto max-w-5xl font-semibold leading-[1.02] tracking-normal text-[#17181d]"
              style={{
                fontWeight: 600,
                letterSpacing: "-0.01em",
                lineHeight: 1.1,
                color: "#fff",
                fontSize: "clamp(2.2rem, 7vw, 6.5rem)",
              }}
            >
              <span
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #17181d 0%, #575757 50%, #17181d 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  display: "block",
                  lineHeight: 1.1,
                  marginBottom: "-0.22em",
                }}
              >
                Decide tu noche
              </span>
              <span
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #17181d 0%, #575757 50%, #17181d 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  display: "block",
                  lineHeight: 1.1,
                  marginBottom: "-0.22em",
                }}
              >
                antes de salir
              </span>
            </h1>
            <p
              ref={finalSubLabelRef}
              className="mt-8 max-w-xl px-2 text-center font-semibold"
              style={{
                fontSize: "clamp(0.95rem, 2.2vw, 1.2rem)",
                color: "#888",
                lineHeight: 1.4,
                fontWeight: 400,
              }}
            >
              Descubre eventos en el mapa, compra tu entrada y quédate con la
              gente que conoces
            </p>
          </div>

          <div
            ref={particlesLayerRef}
            className="pointer-events-none absolute inset-0 z-[60]"
          >
            {PARTY_PARTICLES.map((particle, index) => (
              <PartyParticleNode
                key={particle.id}
                particle={particle}
                registerRef={(node) => {
                  particleRefs.current[index] = node;
                }}
              />
            ))}
          </div>

          <div
            ref={phoneSceneLayerRef}
            className="absolute inset-0 z-30 flex items-center justify-center"
          >
            <div
              ref={phoneRef}
              className="relative z-10 h-[790px] w-[390px] will-change-transform"
            >
              <div ref={phoneGlowRef} className="hp-glow" aria-hidden />
              <PhoneShell>
                <div className="absolute inset-0">
                  <Image
                    src="/app/home.webp"
                    alt="Pantalla de inicio de ParyUp"
                    fill
                    className="object-cover object-top"
                    sizes="390px"
                  />
                </div>
                <div
                  ref={heroBgRef}
                  className="v2 hp-layer hp-screenbg"
                  aria-hidden
                >
                  <div className="v2-screen-bg" />
                </div>

                <div
                  ref={modalRef}
                  className="absolute inset-x-0 bottom-0 h-[94%] bg-stone-200 px-5 pt-6 shadow-[0_-20px_70px_rgba(0,0,0,0.28)]"
                >
                  {/* <div className="mx-auto mb-2 h-1.5 w-14 rounded-full bg-black/12 z-5" /> */}
                </div>
              </PhoneShell>
            </div>
          </div>
        </div>
        <div ref={heroFadeRef} className="hp-fade" aria-hidden />
        <div
          ref={heroCopyRef}
          className={`v2 hp-layer hp-copy ${jakarta.variable}`}
          style={
            {
              "--u": 1,
              "--copy-top": "calc(21.5vh + 29vh)",
            } as React.CSSProperties
          }
          data-off={heroOn ? undefined : ""}
        >
          <div className="v2-herocopy">
            <p className="v2-kicker">Entradas, chats y matches con tu gente.</p>
            <h1 className="v2-title">
              <span>Toda tu noche,</span>
              <span className="dim">en una sola app.</span>
            </h1>
            <div className="v2-badges">
              <HeroAppStoreButton />
              <HeroPlayStoreButton />
            </div>
          </div>
          <div className="v2-coins" aria-hidden>
            <Party emoji="🪩" className="v2-coin-a" delay={0.4} />
            <Party emoji="🎉" className="v2-coin-b" delay={0} />
            <Party emoji="🥂" className="v2-coin-c" delay={1.2} />
            <Party emoji="🎧" className="v2-coin-d" delay={0.8} />
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 h-100 w-100">
          <div className="relative  rounded-full w-full h-full">
            {/* <div className="spectrum-glow h-40 w-40"></div> */}
          </div>
        </div>
        <div
          ref={coverCardRef}
          className="pointer-events-none absolute inset-0 z-[60] flex items-center justify-center overflow-hidden p-0 rounded-t-4xl"
        >
          <div
            ref={coverCardInnerRef}
            className="relative h-screen w-screen overflow-hidden rounded-none"
          >
            <div className="absolute inset-0 z-10 bg-black/40" />
            <CoverCardUI />
            <LazyVideo
              className="absolute inset-0 block h-full w-full object-cover object-center brightness-120 "
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              poster="/favicon.ico"
              src="/video/fest.mp4"
            />
          </div>
        </div>

        <div
          ref={finalScrollContentRef}
          className="pointer-events-none absolute inset-x-0 top-0 z-[100] h-screen"
        >
          <div className="relative mx-auto grid h-full w-full max-w-7xl grid-cols-1 items-center gap-10 px-6 pt-[9vh] md:grid-cols-[1.05fr_0.95fr] md:px-10">
            <div className="text-left">
              <p
                ref={finalScrollSubtitleRef}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-1.5 text-[13px] font-medium text-white/75"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#30D158] shadow-[0_0_10px_#30D158]" />
                Eventos vivos, gente real, entradas listas
              </p>
              <h1
                ref={finalScrollTitleRef}
                className="mt-5 text-left font-bold text-white"
                style={{
                  fontWeight: 700,
                  letterSpacing: "-0.035em",
                  lineHeight: 0.98,
                  fontSize: "clamp(2.4rem, 5.4vw, 5.6rem)",
                }}
              >
                <ScrollLine text="Impulsando" />
                <ScrollLine text="la noche real" />
              </h1>

              <div
                ref={finalScrollBodyRef}
                className="final-copy-block mt-9 grid max-w-[560px] grid-cols-2 gap-x-6 gap-y-5"
              >
                {FINAL_FEATURES.map(({ Icon, title, text, tint }) => (
                  <div key={title} className="flex items-start gap-3">
                    <span
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] text-white"
                      style={{ background: tint }}
                    >
                      <Icon size={18} strokeWidth={2} aria-hidden />
                    </span>
                    <div className="leading-tight">
                      <p className="text-[16px] font-semibold text-white">
                        {title}
                      </p>
                      <p className="mt-1 text-[14px] text-white/55">{text}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            <FinalHighlightStack />
          </div>
        </div>

        <div
          ref={finalBridgeLayerRef}
          className="pointer-events-none absolute inset-0 z-[120]"
        >
          <div
            ref={finalBridgeTextRef}
            className="mx-auto grid h-screen max-w-7xl grid-cols-1 items-center gap-14 px-6 md:grid-cols-[1.25fr_0.75fr] md:gap-20 md:px-10"
          >
            <div>
              <p className="final-bridge-extra mb-6 text-[13px] font-semibold uppercase tracking-[0.2em] text-white/50">
                Disponible en iOS y Android
              </p>
              <h2
                className="max-w-[720px] text-left font-bold leading-[0.95] tracking-[-0.04em] text-white [text-wrap:balance]"
                style={{ fontSize: "clamp(3rem, 5.4vw, 6.4rem)" }}
              >
                <ScrollLine text="La noche" className="whitespace-nowrap" />
                <ScrollLine text="empieza aquí" className="max-w-[680px]" />
              </h2>
              <p className="final-bridge-extra mt-6 max-w-md text-[18px] leading-[1.45] text-white/65">
                Descarga ParyUp, mira qué pasa cerca de ti y entra con tu gente.
              </p>
              <div className="final-bridge-extra mt-8 flex flex-wrap gap-3">
                <AppStoreButton className="pointer-events-auto" />
                <PlayStoreButton className="pointer-events-auto" />
              </div>
            </div>
            <div aria-hidden className="hidden md:block" />
          </div>
        </div>
      </div>
    </section>
  );
}

// Interfaz de evento en directo sobre el vídeo; solo aparece cuando el vídeo
// ya se ha convertido en tarjeta al final de la historia.
function CoverCardUI() {
  return (
    <div className="cover-card-ui absolute inset-0 z-20 flex flex-col justify-between bg-gradient-to-b from-black/30 via-transparent to-black/85 p-5 text-white">
      <div className="flex items-center justify-between">
        <span className="ios-glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold tracking-[0.04em]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#FF453A]" />
          EN DIRECTO
        </span>
        <span className="ios-glass rounded-full px-3 py-1.5 text-[12px] font-medium text-white/85">
          Neon Vault
        </span>
      </div>

      <div>
        <p className="text-[34px] font-bold leading-none tracking-[-0.03em]">
          Neon Night
        </p>
        <p className="mt-2 flex items-center gap-1 text-[14px] text-white/70">
          <MapPin size={13} strokeWidth={2.2} aria-hidden />
          Barcelona · Sáb 00:15
        </p>
        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center">
            {["#64D2FF", "#FFD60A", "#DA8FFF", "#30D158"].map((color, i) => (
              <span
                key={color}
                className={`h-8 w-8 rounded-full border-2 border-black ${i > 0 ? "-ml-2.5" : ""}`}
                style={{ background: color }}
              />
            ))}
            <span className="ml-2.5 text-[13px] font-medium text-white/85">
              1,2k dentro
            </span>
          </div>
          <span className="rounded-full bg-white px-5 py-2.5 text-[14px] font-semibold text-black">
            Entrar
          </span>
        </div>
      </div>
    </div>
  );
}

// Línea de titular que se revela con el scroll: máscara que sube y barrido de
// color, ambos controlados desde la línea de tiempo principal.
function ScrollLine({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  return (
    <span className={`block overflow-hidden pb-[0.1em] ${className}`}>
      <span
        data-scroll-line
        className="scroll-line-text inline-block will-change-transform"
      >
        {text}
      </span>
    </span>
  );
}

const FINAL_FEATURES = [
  {
    Icon: Ticket,
    title: "Entradas",
    text: "Compra y revende sin líos",
    tint: "linear-gradient(135deg, #FF375F, #FF9F0A)",
  },
  {
    Icon: MessageCircle,
    title: "Chats",
    text: "Tu grupo en cada plan",
    tint: "linear-gradient(135deg, #0A84FF, #5E5CE6)",
  },
  {
    Icon: Heart,
    title: "Match",
    text: "Con quien te cruzas",
    tint: "linear-gradient(135deg, #BF5AF2, #FF375F)",
  },
  {
    Icon: Images,
    title: "Recap",
    text: "Tu noche, guardada",
    tint: "linear-gradient(135deg, #FFD60A, #FF9F0A)",
  },
];

// Abanico de flyers de eventos: el central delante, los laterales abiertos.
// La rotación final la pone la línea de tiempo (ver finalScrollCards).
function FinalHighlightStack() {
  const cardStyles = [
    { className: "left-0 top-[14%] z-10", going: "86 van" },
    { className: "left-[calc(50%-128px)] top-0 z-30", going: "312 van" },
    { className: "right-0 top-[14%] z-20", going: "140 van" },
  ];

  return (
    <div className="relative mx-auto hidden h-[440px] w-full max-w-[720px] md:block">
      {FINAL_HIGHLIGHT_EVENTS.map((item, index) => {
        const style = cardStyles[index] ?? cardStyles[0];

        return (
          <div
            key={`${item.title}-${item.date}`}
            className={`final-scroll-card absolute h-[360px] w-[256px] will-change-transform ${style.className}`}
          >
            <div className="relative h-full w-full overflow-hidden rounded-[30px] border border-white/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]">
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="256px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30" />

              <div className="absolute inset-x-3.5 top-3.5 flex items-start justify-between">
                <span className="ios-glass rounded-[12px] px-2.5 py-1.5 text-center leading-none text-white">
                  <span className="block text-[10px] font-semibold tracking-[0.12em] text-white/70">
                    {item.date}
                  </span>
                  <span className="mt-1 block text-[15px] font-bold">
                    23:30
                  </span>
                </span>
                {item.badges?.[0] ? (
                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-black">
                    {item.badges[0]}
                  </span>
                ) : null}
              </div>

              <div className="absolute inset-x-4 bottom-4">
                <p className="text-[22px] font-bold leading-tight tracking-[-0.02em] text-white">
                  {item.title}
                </p>
                <p className="mt-1 flex items-center gap-1 text-[13px] text-white/70">
                  <MapPin size={12} strokeWidth={2.2} aria-hidden />
                  {item.handle}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center">
                    {["#64D2FF", "#FFD60A", "#DA8FFF"].map((color, i) => (
                      <span
                        key={color}
                        className={`h-6 w-6 rounded-full border-2 border-black ${i > 0 ? "-ml-2" : ""}`}
                        style={{ background: color }}
                      />
                    ))}
                    <span className="ml-2 text-[12px] font-medium text-white/80">
                      {style.going}
                    </span>
                  </div>
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-black">
                    <ArrowRight size={15} strokeWidth={2.4} aria-hidden />
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 rounded-[44px] border border-[#1B1721] bg-black p-[10px] shadow-[inset_0_0_4px_2px_rgb(169,228,243),inset_0_0_0_6px_rgb(52,44,63)]">
        <div className="relative h-full overflow-hidden rounded-[34px] bg-[#0b0d12]">
          {children}
        </div>
      </div>

      <div className="absolute left-1/2 top-[14px] z-30 h-7 w-[120px] -translate-x-1/2 rounded-full bg-black" />
      <div className="absolute left-[-2px] top-[120px] h-[34px] w-[3px] rounded-[2px] bg-[#a9e4f3]" />
      <div className="absolute left-[-2px] top-[180px] h-[74px] w-[3px] rounded-[2px] bg-[#a9e4f3]" />
      <div className="absolute left-[-2px] top-[270px] h-[74px] w-[3px] rounded-[2px] bg-[#a9e4f3]" />
      <div className="absolute right-[-2px] top-[205px] h-[104px] w-[3px] rounded-[2px] bg-[#a9e4f3]" />
    </div>
  );
}

function FeatureFlowCard({ card }: { card: FeatureFlowCard }) {
  const sideClass =
    card.side === "left"
      ? "left-[max(1rem,calc(50%_-_690px))]"
      : "right-[max(1rem,calc(50%_-_690px))]";
  const [start, end] = card.range;

  return (
    <article
      data-start={start}
      data-end={end}
      data-variant={card.variant}
      className={`story-flow-card absolute top-full ${sideClass} hidden w-[400px] antialiased will-change-transform 2xl:block`}
    >
      <header className="mb-3 px-3">
        <p className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[rgba(235,235,245,0.45)]">
          {card.eyebrow}
        </p>
        <h3 className="mt-0.5 text-[22px] font-bold leading-tight tracking-[-0.02em] text-white">
          {card.title}
        </h3>
        <p className="mt-0.5 text-[15px] leading-[1.35] tracking-[-0.01em] text-[rgba(235,235,245,0.6)]">
          {card.description}
        </p>
      </header>

      <div className="ios-surface relative overflow-hidden rounded-[38px] text-white">
        <FeatureFlowCardBody variant={card.variant} />
      </div>
    </article>
  );
}

function FeatureFlowCardBody({ variant }: { variant: FeatureFlowCardVariant }) {
  if (variant === "discover") return <DiscoverFeatureCard />;
  if (variant === "albums") return <AlbumsFeatureCard />;
  return <ChatFeatureCard />;
}

function DiscoverFeatureCard() {
  const filters = [
    {
      label: "Hoy",
      className: "border-[#ffe08a] bg-[#fff7d6] text-[#7a4d00]",
    },
    {
      label: "Cerca",
      className: "border-[#b8daff] bg-[#eef7ff] text-[#064b82]",
    },
    {
      label: "Techno",
      className: "border-[#c7f9d4] bg-[#effcf2] text-[#17642d]",
    },
    {
      label: "Gratis",
      className: "border-[#ead5ff] bg-[#fbf5ff] text-[#62318d]",
    },
  ];
  const rows = [
    {
      title: "Pulse Room",
      meta: "Eixample",
      time: "23:30",
      accent: "bg-[#8fd3ff]",
      tag: "Techno",
      tagClass: "border-[#b8daff] bg-[#f0f7ff] text-[#064b82]",
    },
    {
      title: "Bass Garden",
      meta: "1.8 km",
      time: "Gratis",
      accent: "bg-[#a7f3d0]",
      tag: "Cerca",
      tagClass: "border-[#c3e6cb] bg-[#f3faf4] text-[#155724]",
    },
    {
      title: "Late Club",
      meta: "Born",
      time: "01:00",
      accent: "bg-[#d8b4fe]",
      tag: "Nuevo",
      tagClass: "border-[#e8d1ff] bg-[#fcf5ff] text-[#522785]",
    },
  ];

  return (
    <div className="rounded-[28px]  p-5">
      <div
        data-micro="search"
        className="relative flex h-11 items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-[#1a1a1a] px-4 will-change-transform"
      >
        <div
          data-micro="search-glow"
          className="pointer-events-none absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-transparent via-white/18 to-transparent"
        />
        <Search
          size={16}
          strokeWidth={1.8}
          className="relative text-white/48"
          aria-hidden
        />
        <span className="relative flex-1 text-[15px] font-medium text-white/52">
          Buscar fiestas
        </span>
        <span
          data-micro="counter"
          className="relative rounded-full border border-[#c7f9d4] bg-[#effcf2] px-3 py-1.5 text-xs font-semibold text-[#17642d] will-change-transform"
        >
          12 fiestas cerca
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <span
            key={filter.label}
            data-micro="chip"
            data-selected-chip={filter.label === "Techno" ? true : undefined}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-normal will-change-transform ${filter.className}`}
          >
            {filter.label}
          </span>
        ))}
      </div>

      <div className="mt-4 divide-y divide-white/[0.08]">
        {rows.map((row, index) => (
          <div
            key={row.title}
            data-micro="row"
            data-selected-row={index === 1 ? true : undefined}
            className="flex items-center gap-4 rounded-3xl border border-transparent px-1 py-3 will-change-transform"
          >
            <div
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-zinc-950 shadow-[0_0_0_3px_rgba(255,255,255,0.05)] ${row.accent}`}
            >
              {index === 1 ? (
                <Check size={16} strokeWidth={2.2} aria-hidden />
              ) : (
                <MapPin size={16} strokeWidth={2} aria-hidden />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold leading-none text-white">
                {row.title}
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-sm font-medium leading-none text-white/48">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {row.meta}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-medium uppercase ${row.tagClass}`}
              >
                {row.tag}
              </span>
              <span className="text-xs font-semibold text-white/42">
                {row.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlbumsFeatureCard() {
  const stats = [
    { value: "312", label: "personas en la pista", color: "#FFD60A" },
    { value: "48", label: "fotos de la noche", color: "#FF375F" },
    { value: "9", label: "amigos contigo", color: "#64D2FF" },
  ];
  const collage = [
    {
      src: "/album/club-selfie-2.jpg",
      alt: "Foto del evento 2",
      className: "right-5 top-[86px] rotate-[7deg]",
    },
    {
      src: "/album/club-selfie-3.jpg",
      alt: "Foto del evento 3",
      className: "right-[74px] top-[142px] -rotate-[6deg]",
    },
  ];

  return (
    // Recap en formato story, como un vídeo de Wrapped: segmentos arriba,
    // tipografía enorme y la canción de la noche sonando abajo.
    <div className="relative h-[560px] overflow-hidden bg-black">
      <div
        data-featured-photo
        className="absolute inset-0 will-change-transform"
      >
        <Image
          src="/album/club-selfie-1.jpg"
          alt="Foto del evento 1"
          fill
          className="ios-kenburns object-cover"
          sizes="400px"
        />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(94,92,230,0.82)_0%,rgba(191,90,242,0.55)_42%,rgba(0,0,0,0.92)_78%)] mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/85" />

      <div className="absolute inset-x-3.5 top-3.5 flex gap-1">
        {[0, 1, 2, 3, 4].map((segment) => (
          <span
            key={segment}
            className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/30"
          >
            {segment < 2 ? (
              <span className="block h-full w-full bg-white" />
            ) : segment === 2 ? (
              <span
                data-micro="progress"
                className="block h-full origin-left bg-white will-change-transform"
              />
            ) : null}
          </span>
        ))}
      </div>

      <div className="absolute inset-x-4 top-7 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#FF375F] to-[#FF9F0A] text-[11px] font-bold text-white">
            PU
          </span>
          <div className="leading-tight">
            <p className="text-[14px] font-semibold text-white">
              Tu recap · Neon Night
            </p>
            <p className="text-[12px] text-white/65">Sáb 10 oct</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="ios-glass grid h-8 w-8 place-items-center rounded-full text-white">
            <Pause size={14} fill="currentColor" strokeWidth={0} aria-hidden />
          </span>
          <span className="ios-glass grid h-8 w-8 place-items-center rounded-full text-white">
            <Ellipsis size={16} strokeWidth={2.4} aria-hidden />
          </span>
        </div>
      </div>

      {collage.map((photo) => (
        <div
          key={photo.src}
          data-micro="photo"
          className={`absolute h-[118px] w-[92px] overflow-hidden rounded-[16px] border-[3px] border-white shadow-[0_18px_40px_rgba(0,0,0,0.45)] will-change-transform ${photo.className}`}
        >
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            className="object-cover"
            sizes="92px"
          />
        </div>
      ))}

      <div className="absolute inset-x-5 top-[104px]">
        <p className="text-[15px] font-semibold text-white/80">Tu noche en</p>
        <p className="text-[40px] font-black leading-[0.9] tracking-[-0.045em] text-white">
          números
        </p>
      </div>

      <div className="absolute inset-x-5 bottom-[112px] space-y-1">
        {stats.map((stat) => (
          <div
            key={stat.label}
            data-micro="chip"
            className="flex items-baseline gap-3 will-change-transform"
          >
            <span
              className="text-[56px] font-black leading-[0.95] tracking-[-0.05em]"
              style={{ color: stat.color }}
            >
              {stat.value}
            </span>
            <span className="text-[17px] font-semibold leading-tight tracking-[-0.01em] text-white">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      <div className="absolute inset-x-3.5 bottom-3.5">
        <div className="ios-glass flex items-center gap-3 rounded-[20px] p-2 pr-3">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[10px]">
            <Image
              src="/hero/5.jpg"
              alt="Portada de la canción"
              fill
              className="object-cover"
              sizes="44px"
            />
          </div>
          <div className="relative h-9 min-w-0 flex-1 overflow-hidden">
            <div
              data-micro="status-old"
              className="absolute inset-x-0 top-0 leading-tight"
            >
              <p className="text-[14px] font-semibold text-white">
                Montando tu recap…
              </p>
              <p className="text-[12px] text-white/65">
                Eligiendo los mejores momentos
              </p>
            </div>
            <div
              data-micro="status-new"
              className="absolute inset-x-0 top-0 leading-tight opacity-0"
            >
              <p className="truncate text-[14px] font-semibold text-white">
                Classic XX&apos;
              </p>
              <p className="truncate text-[12px] text-white/65">
                Sonó a las 00:15 · Neon Vault
              </p>
            </div>
          </div>
          <span className="ios-eq flex h-4 items-end gap-[3px]" aria-hidden>
            {[0, 1, 2, 3].map((bar) => (
              <span key={bar} className="w-[3px] rounded-full bg-[#30D158]" />
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}

function ChatFeatureCard() {
  const avatars = [
    { label: "LU", className: "from-[#64D2FF] to-[#0A84FF]" },
    { label: "MA", className: "from-[#FFD60A] to-[#FF9F0A]" },
    { label: "IN", className: "from-[#DA8FFF] to-[#BF5AF2]" },
  ];

  return (
    <div className="flex flex-col bg-black">
      {/* Barra de navegación de Mensajes */}
      <div className="ios-bar relative flex items-start justify-between px-4 pb-2.5 pt-4">
        <span className="flex items-center text-[#0A84FF]">
          <ChevronLeft size={26} strokeWidth={2.4} aria-hidden />
          <span className="-ml-0.5 grid h-[22px] min-w-[22px] place-items-center rounded-full bg-[#0A84FF] px-1.5 text-[12px] font-semibold text-white">
            12
          </span>
        </span>

        <div className="flex flex-col items-center">
          <div className="flex items-center">
            {avatars.map((avatar, index) => (
              <div
                key={avatar.label}
                data-micro="avatar"
                className={`grid h-10 w-10 place-items-center rounded-full border-2 border-[#161618] bg-gradient-to-b text-[13px] font-semibold text-white will-change-transform ${avatar.className} ${
                  index > 0 ? "-ml-3" : ""
                }`}
              >
                {avatar.label}
              </div>
            ))}
          </div>
          <p className="mt-1 flex items-center text-[12px] font-medium text-white">
            Neon Night
            <ChevronRight
              size={12}
              strokeWidth={2.6}
              className="text-[rgba(235,235,245,0.3)]"
              aria-hidden
            />
          </p>
          <p
            data-friends-pill
            className="mt-0.5 flex items-center gap-1 text-[11px] text-[#30D158] will-change-transform"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#30D158]" />3 dentro
          </p>
        </div>

        <span className="pt-0.5 text-[#0A84FF]">
          <Video size={24} strokeWidth={1.9} aria-hidden />
        </span>
      </div>

      <div className="flex flex-col gap-1 px-3 pb-3 pt-3">
        <p className="mb-2 text-center text-[11px] text-[rgba(235,235,245,0.6)]">
          <span className="font-semibold">Hoy</span> 23:41
        </p>

        <div
          data-chat-step="first"
          className="flex items-end gap-2 will-change-transform"
        >
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-b from-[#64D2FF] to-[#0A84FF] text-[10px] font-semibold text-white">
            LU
          </div>
          <div>
            <p className="mb-0.5 pl-3 text-[11px] text-[rgba(235,235,245,0.6)]">
              Lucía
            </p>
            <div className="ios-bubble ios-bubble-in relative">
              Ya estoy en la cola 🙌
              <span className="ios-tapback">❤️</span>
            </div>
          </div>
        </div>

        <div
          data-chat-step="second"
          className="mt-1 flex justify-end will-change-transform"
        >
          <div className="ios-bubble ios-bubble-out">
            Os guardo sitio, entro ya
          </div>
        </div>

        <div
          data-reaction-chip
          className="mt-1.5 flex items-end gap-2 will-change-transform"
        >
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-b from-[#FFD60A] to-[#FF9F0A] text-[10px] font-semibold text-white">
            MA
          </div>
          <div className="w-[210px] overflow-hidden rounded-[18px] bg-[#262629]">
            <div className="flex items-center gap-3 px-3 py-2.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-gradient-to-br from-[#FF375F] to-[#FF9F0A] text-white">
                <Ticket size={19} strokeWidth={2} aria-hidden />
              </span>
              <div className="min-w-0 leading-tight">
                <p className="text-[14px] font-semibold text-white">
                  3 entradas listas
                </p>
                <p className="mt-0.5 text-[12px] text-[rgba(235,235,245,0.6)]">
                  Neon Night · 00:15
                </p>
              </div>
            </div>
            <div className="border-t border-[rgba(84,84,88,0.55)] py-2 text-center text-[13px] font-medium text-[#0A84FF]">
              Ver entradas
            </div>
          </div>
        </div>

        <div
          data-chat-step="typing"
          className="ios-typing mt-1.5 ml-9 flex w-fit items-center gap-1 rounded-full bg-[#262629] px-3.5 py-3 will-change-transform"
        >
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              data-micro="typing"
              className="h-2 w-2 rounded-full bg-[rgba(235,235,245,0.45)] will-change-transform"
            />
          ))}
        </div>

        <div
          data-final-message
          className="mt-1 flex flex-col items-end will-change-transform"
        >
          <div className="ios-bubble ios-bubble-out">Nos vemos dentro</div>
          <p className="mt-1 pr-1 text-[11px] text-[rgba(235,235,245,0.6)]">
            <span className="font-semibold">Leído</span> 23:42
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 pb-4 pt-1">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#262629] text-[rgba(235,235,245,0.6)]">
          <Plus size={20} strokeWidth={2.2} aria-hidden />
        </span>
        <div className="flex h-9 flex-1 items-center justify-between rounded-full border border-[rgba(84,84,88,0.65)] pl-4 pr-3 text-[16px] text-[rgba(235,235,245,0.3)]">
          Mensaje
          <Mic size={18} strokeWidth={2} aria-hidden />
        </div>
      </div>
    </div>
  );
}

function PartyParticleNode({
  particle,
  registerRef,
}: {
  particle: PartyParticle;
  registerRef: (node: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={registerRef}
      style={{ left: `${particle.left}%` }}
      className="absolute bottom-[-140px] -translate-x-1/2 z-0"
    >
      {particle.type === "emoji" ? (
        <div
          style={{ fontSize: `${particle.size}px`, lineHeight: 1 }}
          className="select-none"
          aria-hidden
        >
          {particle.emoji}
        </div>
      ) : (
        <div
          style={{ width: particle.size, height: particle.size }}
          className="overflow-hidden rounded-full border border-white/25 bg-gradient-to-br from-zinc-200 to-zinc-400 shadow-[0_8px_22px_rgba(0,0,0,0.35)]"
        >
          {particle.avatarSrc ? (
            <Image
              src={particle.avatarSrc}
              alt="Avatar particle"
              width={particle.size}
              height={particle.size}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-sm font-semibold text-[#111]">
              {particle.avatarFallback ?? "U"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
