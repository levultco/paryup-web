"use client";

import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  Check,
  Images,
  Heart,
  MapPin,
  MessageCircle,
  Search,
  Users,
} from "lucide-react";
import { motion, useMotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { EventFlyerItem } from "@/components/common/eventFlyerCard";
import { AppStoreButton, PlayStoreButton } from "@/components/common/store";
import { storiesAvatars } from "@/constants/storiesAvatars";
import BounceInText from "@/components/common/bounceText";
import { LazyVideo } from "@/components/common/lazyVideo";
import { LinePathMobile } from "@/components/common/linePathMobile";

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

const STORY_HEIGHT_CLASS = "h-[780vh]";

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
  improvedTextStart: 0.82,

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
const PHONE_CENTER_Y = 0;
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
  const [isFinalHeadlineActive, setIsFinalHeadlineActive] = useState(false);
  const [isImprovedVersionActive, setIsImprovedVersionActive] = useState(false);
  const linePathProgress = useMotionValue(0);
  const sectionRef = useRef<HTMLElement | null>(null);
  const titleRef = useRef<HTMLParagraphElement | null>(null);
  const phoneRef = useRef<HTMLDivElement | null>(null);
  const cardsLayerRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const finalTextRef = useRef<HTMLDivElement | null>(null);
  const finalTextLabelRef = useRef<HTMLParagraphElement | null>(null);
  const finalSubLabelRef = useRef<HTMLParagraphElement | null>(null);
  const preCoverLayerRef = useRef<HTMLDivElement | null>(null);
  const phoneSceneLayerRef = useRef<HTMLDivElement | null>(null);
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
  const finalHeadlineActiveRef = useRef(false);
  const improvedVersionActiveRef = useRef(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    if (!titleRef.current) return;
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

      const showParticles = () => {
        createParticleLoops();
        gsap.killTweensOf(particlesLayerEl);
        gsap.to(particlesLayerEl, {
          opacity: 1,
          duration: 0.35,
          ease: "power2.out",
          overwrite: true,
        });
        particleTweensRef.current.forEach((tween) => tween.resume());
      };

      const hideParticles = () => {
        gsap.killTweensOf(particlesLayerEl);
        gsap.to(particlesLayerEl, {
          opacity: 0,
          duration: 0.35,
          ease: "power2.out",
          overwrite: true,
          onComplete: () => {
            particleTweensRef.current.forEach((tween) => tween.pause());
          },
        });
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
        gsap.set(finalCopyBlocks, {
          opacity: 0,
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

      gsap.set(titleRef.current, { y: 260, opacity: 1 });
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
        y: 180,
        opacity: 0.96,
      });
      gsap.set(finalScrollTitleRef.current, {
        opacity: 0,
        y: 56,
        scale: 0.97,
        transformOrigin: "0% 60%",
      });
      gsap.set(finalBridgeTextRef.current, {
        opacity: 0,
        y: 90,
        scale: 0.96,
        transformOrigin: "50% 60%",
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

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.45,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            clipParticlesToModal();
            const timelineTime = self.animation?.time() ?? 0;
            const lineProgress = clamp(
              (timelineTime - STEP.entryStart) /
                (STEP.cardsEnd - STEP.entryStart),
              0,
              1,
            );
            const isParticlesRange =
              timelineTime >= PARTICLES_RANGE.start &&
              timelineTime < PARTICLES_RANGE.end;
            const isFinalHeadlineRange =
              timelineTime >= STEP.finalScrollStart &&
              timelineTime < STEP.finalScrollEnd;
            const isImprovedVersionRange =
              timelineTime >= STEP.improvedTextStart;

            linePathProgress.set(lineProgress);

            if (isParticlesRange && !particlesStartedRef.current) {
              particlesStartedRef.current = true;
              showParticles();
            } else if (!isParticlesRange && particlesStartedRef.current) {
              particlesStartedRef.current = false;
              hideParticles();
            }

            if (isFinalHeadlineRange !== finalHeadlineActiveRef.current) {
              finalHeadlineActiveRef.current = isFinalHeadlineRange;
              setIsFinalHeadlineActive(isFinalHeadlineRange);
            }

            if (isImprovedVersionRange !== improvedVersionActiveRef.current) {
              improvedVersionActiveRef.current = isImprovedVersionRange;
              setIsImprovedVersionActive(isImprovedVersionRange);
            }
          },
          onLeave: () => {
            particlesStartedRef.current = false;
            hideParticles();
            finalHeadlineActiveRef.current = false;
            setIsFinalHeadlineActive(false);
            improvedVersionActiveRef.current = true;
            setIsImprovedVersionActive(true);
            gsap.set(finalBridgeTextRef.current, {
              opacity: 1,
              y: 0,
              scale: 1,
            });
            linePathProgress.set(1);
          },
          onLeaveBack: () => {
            particlesStartedRef.current = false;
            hideParticles();
            finalHeadlineActiveRef.current = false;
            setIsFinalHeadlineActive(false);
            improvedVersionActiveRef.current = false;
            setIsImprovedVersionActive(false);
            resetFinalDetails();
            gsap.set(finalBridgeTextRef.current, {
              opacity: 0,
              y: 90,
              scale: 0.96,
            });
            linePathProgress.set(0);
          },
          onRefresh: () => {
            clipParticlesToModal();
          },
        },
      });

      tl.to(
        titleRef.current,
        { y: 0, duration: STEP.entryEnd - STEP.entryStart },
        STEP.entryStart,
      );

      tl.to(
        titleRef.current,
        {
          y: -180,
          opacity: 0,
          duration: STEP.titleExitEnd - STEP.titleExitStart,
        },
        STEP.titleExitStart,
      );

      tl.to(
        phoneRef.current,
        {
          y: PHONE_CENTER_Y,
          duration: STEP.cardsStart - STEP.entryStart,
          ease: "none",
          force3D: true,
        },
        STEP.entryStart,
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

      tl.to(
        finalScrollContentRef.current,
        {
          y: -220,
          opacity: 1,
          duration: STEP.finalScrollEnd - STEP.finalScrollStart,
          ease: "none",
        },
        STEP.finalScrollStart,
      );
      tl.to(
        finalScrollTitleRef.current,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.11,
          ease: "power3.out",
        },
        STEP.finalScrollStart,
      );
      tl.to(
        finalScrollSubtitleRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.08,
          ease: "power2.out",
        },
        STEP.finalScrollStart + 0.02,
      );
      tl.to(
        finalCopyBlocks,
        {
          opacity: 1,
          y: 0,
          duration: 0.1,
          stagger: 0.03,
          ease: "power3.out",
        },
        STEP.finalScrollStart + 0.05,
      );
      tl.to(
        finalScrollCards,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotation: (index) => [-8, 3, 9][index] ?? 0,
          duration: 0.11,
          stagger: 0.03,
          ease: "power3.out",
        },
        STEP.finalScrollStart + 0.06,
      );
      tl.to(
        finalScrollSubtitleRef.current,
        {
          opacity: 0,
          y: -18,
          duration: 0.05,
          ease: "power2.inOut",
        },
        STEP.finalScrollEnd - 0.01,
      );
      tl.to(
        finalCopyBlocks,
        {
          opacity: 0,
          y: -26,
          duration: 0.06,
          stagger: 0.02,
          ease: "power2.inOut",
        },
        STEP.finalScrollEnd - 0.01,
      );
      tl.to(
        finalScrollCards,
        {
          opacity: 0,
          y: -24,
          scale: 0.97,
          duration: 0.06,
          stagger: 0.018,
          ease: "power2.inOut",
        },
        STEP.finalScrollEnd - 0.008,
      );
      tl.to(
        finalScrollContentRef.current,
        {
          opacity: 0,
          y: -320,
          duration: 0.07,
          ease: "power2.inOut",
        },
        STEP.finalScrollEnd + 0.01,
      );
      tl.to(
        finalBridgeTextRef.current,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.08,
          ease: "power3.out",
        },
        STEP.improvedTextStart,
      );
      tl.to(
        coverCardInnerEl,
        {
          width: 400,
          height: 650,
          borderRadius: 32,
          x: 250,
          y: 30,
          filter: "brightness(1)",
          rotation: -5,
          duration: STEP.coverShrinkEnd - STEP.coverShrinkStart,
          ease: "power2.inOut",
        },
        STEP.coverShrinkStart,
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
      className={`relative w-full ${STORY_HEIGHT_CLASS}`}
    >
      <div className="sticky top-0 h-screen overflow-hidden">
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
              Descubre eventos en el mapa, compra tu entrada y quédate con la gente que conoces
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

          <LinePathMobile
            progress={linePathProgress}
            className="absolute top-0 left-0 w-full h-screen !-z-20"
          />

          <div
            ref={phoneSceneLayerRef}
            className="absolute inset-0 z-30 flex items-center justify-center"
          >
            <h1
              ref={titleRef}
              className="pointer-events-none absolute -top-[15%] z-20 text-center font-semibold leading-none tracking-normal text-white"
              style={{
                fontWeight: 600,
                letterSpacing: "-0.01em",
                lineHeight: 1.1,
                color: "#fff",
                fontSize: "clamp(2.2rem, 7vw, 6.5rem)",
              }}
            >
              <div className="flex flex-col items-center justify-center">
                <BounceInText
                  as="span"
                  text="La experiencia "
                  triggerOnView
                  className="block  leading-[1.1] text-white"
                />
                <BounceInText
                  as="span"
                  text="se cuenta sola"
                  triggerOnView
                  delay={0.2}
                  className="block  leading-[1.1] text-white"
                />
              </div>
            </h1>

            <div
              ref={phoneRef}
              className="relative z-10 h-[790px] w-[390px] will-change-transform"
            >
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
                  ref={modalRef}
                  className="absolute inset-x-0 bottom-0 h-[94%] bg-stone-200 px-5 pt-6 shadow-[0_-20px_70px_rgba(0,0,0,0.28)]"
                >
                  {/* <div className="mx-auto mb-2 h-1.5 w-14 rounded-full bg-black/12 z-5" /> */}
                </div>
              </PhoneShell>
            </div>
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
          className="pointer-events-none absolute inset-x-0 top-0 z-[100] min-h-[160vh]"
        >
          <div className="mx-auto flex min-h-[160vh] w-full max-w-7xl flex-col px-6 md:px-10">
            <div className="pt-[16vh] text-left">
              <h1
                ref={finalScrollTitleRef}
                className="max-w-4xl text-left  leading-[0.96] tracking-normal font-bold "
                style={{
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                  lineHeight: 1.1,
                  color: "#fff",
                  fontSize: "clamp(2.2rem, 7vw, 6.5rem)",
                }}
              >
                {/* <BlurText
                  as="span"
                  text="Impulsando la noche real"
                  className="block leading-[1.1] text-white"
                /> */}
                <BounceInText
                  as="span"
                  text="Impulsando "
                  play={isFinalHeadlineActive}
                  className="block leading-[1.1] text-white"
                />
                <BounceInText
                  as="span"
                  text="la noche real"
                  play={isFinalHeadlineActive}
                  delay={0.2}
                  className="block leading-[1.1] text-white"
                />
              </h1>
              <p
                ref={finalScrollSubtitleRef}
                className="mt-6 max-w-xl text-left text-shadow-md text-shadow-black/30"
                style={{
                  fontSize: "clamp(0.95rem, 2.2vw, 1.2rem)",
                  color: "rgba(255,255,255,0.78)",
                  lineHeight: 1.4,
                  fontWeight: 400,
                }}
              >
                {/* <BounceInText
                  as="span"
                  text="Eventos vivos, gente real y entradas listas para salir sin perder tiempo."
                  className="inline"
                /> */}
                Eventos vivos, gente real y entradas listas para salir sin
                perder tiempo.
              </p>
            </div>

            <div
              ref={finalScrollBodyRef}
              className="mt-[5vh] grid grid-cols-1 items-center gap-14 md:grid-cols-[0.78fr_1.22fr]"
            >
              <div className="final-copy-block max-w-md">
                <div className="rounded-[28px] border border-white/10 bg-black/20 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-[14px] md:p-7">
                  <p className="text-xl font-medium leading-8 tracking-normal text-white/82 md:text-2xl md:leading-9">
                    Compra y vende entradas, chatea con tu gente, haz match con
                    quienes te cruzas y revive cada evento en tu perfil.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <AppStoreButton className="pointer-events-auto" />
                    <PlayStoreButton className="pointer-events-auto" />
                  </div>
                </div>
                <div className="mt-4 h-px w-28 bg-white/12" />
              </div>

              <FinalHighlightStack />
            </div>
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
            <h2
              className="max-w-[720px] text-left  leading-[0.95] tracking-[-0.04em] whitespace-normal text-white [text-wrap:balance] break-normal text-shadow-lg text-shadow-white/0 font-bold"
              style={{
                fontSize: "clamp(3rem, 5.4vw, 6.4rem)",
              }}
            >
              <BounceInText
                as="span"
                text="La noche"
                play={isImprovedVersionActive}
                className="block whitespace-nowrap leading-[0.95] text-white"
              />
              <BounceInText
                as="span"
                text="empieza aquí"
                play={isImprovedVersionActive}
                delay={0.18}
                className="block max-w-[680px] leading-[0.95] text-white"
              />
            </h2>
            <div aria-hidden className="hidden md:block" />
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalHighlightStack() {
  const cardStyles = [
    {
      className:
        "left-[3%] top-[17%] z-30 h-[230px] w-[300px] md:h-[260px] md:w-[340px]",
      sizes: "(min-width: 768px) 340px, 300px",
    },
    {
      className:
        "left-[34%] top-[9%] z-20 h-[218px] w-[286px] md:h-[246px] md:w-[320px]",
      sizes: "(min-width: 768px) 320px, 286px",
    },
    {
      className:
        "left-[55%] top-[27%] z-10 h-[205px] w-[268px] md:h-[230px] md:w-[300px]",
      sizes: "(min-width: 768px) 300px, 268px",
    },
  ];

  return (
    <div className="relative mx-auto h-[360px] w-full max-w-[660px]">
      {FINAL_HIGHLIGHT_EVENTS.map((item, index) => {
        const style = cardStyles[index] ?? cardStyles[0];

        return (
          <div
            key={`${item.title}-${item.date}`}
            className={`final-scroll-card absolute will-change-transform ${style.className}`}
          >
            <div className="relative h-full w-full overflow-hidden rounded-[34px] shadow-[0_32px_64px_rgba(0,0,0,0.46)]">
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes={style.sizes}
                className="object-cover"
              />
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
      className={`story-flow-card absolute top-full ${sideClass} hidden w-[450px] will-change-transform 2xl:block`}
    >
      <div className="relative overflow-hidden rounded-[34px] border border-white/12 bg-[#08080a]/95 p-5 text-white shadow-[0_28px_80px_rgba(0,0,0,0.52),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
        <motion.div
          aria-hidden
          animate={{ scale: [1, 1.08, 1], opacity: [0.18, 0.28, 0.18] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute right-6 top-6 h-16 w-16 rounded-full blur-[32px]"
          style={{
            background:
              "linear-gradient(90deg, #c679c4 0%, #fa3d1d 25%, #ffb005 50%, #e1e1fe 75%, #0358f7 100%)",
          }}
        />

        <div className="relative">
          <div className="flex items-start justify-between gap-5">
            <div className="max-w-[28ch]">
              <motion.p
                aria-hidden={false}
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{
                  duration: 3.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="inline-flex rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/72"
              >
                {card.eyebrow}
              </motion.p>
              <h3 className="mt-3 text-[1.55rem] font-semibold leading-[1.02] tracking-[-0.03em] text-white">
                {card.title}
              </h3>
            </div>
            <FeatureFlowIcon variant={card.variant} />
          </div>

          <p className="mt-2.5 max-w-[30ch] text-sm leading-5 text-white/62">
            {card.description}
          </p>

          <div className="mt-5">
            <FeatureFlowCardBody variant={card.variant} />
          </div>
        </div>
      </div>
    </article>
  );
}

function FeatureFlowIcon({ variant }: { variant: FeatureFlowCardVariant }) {
  const Icon =
    variant === "discover"
      ? Search
      : variant === "albums"
        ? Images
        : MessageCircle;

  return (
    <div
      className="grid h-11 w-11 shrink-0 place-items-center rounded-[16px] border border-white/10 text-white shadow-[0_10px_24px_rgba(0,0,0,0.24)]"
      style={{
        background:
          variant === "chat"
              ? "linear-gradient(135deg, rgba(198,121,196,0.26), rgba(250,61,29,0.16))"
              : variant === "albums"
                ? "linear-gradient(135deg, rgba(255,176,5,0.24), rgba(225,225,254,0.14))"
                : "linear-gradient(135deg, rgba(250,61,29,0.22), rgba(255,176,5,0.18))",
      }}
    >
      <Icon size={18} strokeWidth={1.8} aria-hidden />
    </div>
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
  const photos = [
    { src: "/album/club-selfie-1.jpg", alt: "Foto del evento 1", featured: true },
    { src: "/album/club-selfie-2.jpg", alt: "Foto del evento 2" },
    { src: "/album/club-selfie-3.jpg", alt: "Foto del evento 3" },
    { src: "/hero/3.jpg", alt: "Foto del evento 4" },
    { src: "/hero/5.jpg", alt: "Foto del evento 5" },
  ];
  const stats = [
    { label: "Asistentes", value: "312" },
    { label: "Fotos", value: "48" },
    { label: "Amigos", value: "9" },
  ];

  return (
    <div className="rounded-[28px] p-1">
      <div className="grid h-[190px] grid-cols-3 grid-rows-2 gap-2">
        {photos.map((photo) => (
          <div
            key={photo.src}
            data-micro="photo"
            data-featured-photo={photo.featured ? true : undefined}
            className={`relative overflow-hidden rounded-2xl border border-white/10 will-change-transform ${
              photo.featured ? "col-span-2 row-span-2" : ""
            }`}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              className="object-cover"
              sizes={photo.featured ? "260px" : "120px"}
            />
            {photo.featured ? (
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                <div className="absolute inset-x-3 bottom-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/65">
                    Sáb 10 oct
                  </p>
                  <p className="text-lg font-semibold leading-tight text-white">
                    Neon Night
                  </p>
                </div>
              </>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {stats.map((stat) => (
          <div
            key={stat.label}
            data-micro="chip"
            className="rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2.5 text-center will-change-transform"
          >
            <p className="text-lg font-semibold leading-none text-white">
              {stat.value}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-white/50">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="relative h-4 min-w-0 flex-1 overflow-hidden">
            <span
              data-micro="status-old"
              className="absolute left-0 top-0 text-sm font-medium leading-4 text-white/55"
            >
              Preparando tu recap…
            </span>
            <span
              data-micro="status-new"
              className="absolute left-0 top-0 text-sm font-semibold leading-4 text-white opacity-0"
            >
              Recap listo
            </span>
          </div>
          <Check size={15} strokeWidth={2.2} className="text-emerald-300" aria-hidden />
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
          <span
            data-micro="progress"
            className="block h-full origin-left rounded-full bg-gradient-to-r from-[#0358f7] via-[#c679c4] to-[#ffb005] will-change-transform"
          />
        </div>
      </div>
    </div>
  );
}

function ChatFeatureCard() {
  const avatars = [
    { label: "LU", className: "bg-[#8fd3ff] text-zinc-950" },
    { label: "MA", className: "bg-[#ffe08a] text-[#7a4d00]" },
    { label: "IN", className: "bg-[#d8b4fe] text-[#522785]" },
  ];

  return (
    <div className="rounded-[28px] p-1">
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center pl-1">
            {avatars.map((avatar) => (
              <div
                key={avatar.label}
                data-micro="avatar"
                className={`-ml-2.5 grid h-9 w-9 place-items-center rounded-full border-2 border-[#101012] text-[11px] font-bold will-change-transform first:ml-0 ${avatar.className}`}
              >
                {avatar.label}
              </div>
            ))}
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-white">Neon Night</p>
            <p className="text-[11px] text-white/50">Grupo · 3 dentro</p>
          </div>
        </div>
        <span
          data-micro="chip"
          data-friends-pill
          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase text-emerald-300 will-change-transform"
        >
          <Users size={12} strokeWidth={1.9} aria-hidden />
          En vivo
        </span>
      </div>

      <div className="mt-3 space-y-2.5 rounded-2xl border border-white/10 bg-[#0e0e11] p-3.5">
        <div
          data-micro="message"
          data-chat-step="first"
          className="mr-14 will-change-transform"
        >
          <p className="mb-1 pl-2 text-[10px] font-medium text-white/40">Lucía</p>
          <div className="rounded-[20px] rounded-tl-md bg-[#1c1c21] px-4 py-2.5 text-sm leading-5 text-white/85">
            Ya estoy en la cola 🙌
          </div>
        </div>
        <div
          data-micro="message"
          data-chat-step="second"
          className="ml-14 rounded-[20px] rounded-tr-md bg-gradient-to-br from-[#2f6bff] to-[#0358f7] px-4 py-2.5 text-sm font-medium leading-5 text-white will-change-transform"
        >
          Os guardo sitio, entro ya
        </div>
        <div
          data-micro="message"
          data-chat-step="typing"
          className="mr-14 flex w-fit items-center gap-1.5 rounded-[20px] rounded-tl-md bg-[#1c1c21] px-4 py-3 will-change-transform"
        >
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              data-micro="typing"
              className="h-1.5 w-1.5 rounded-full bg-white/60 will-change-transform"
            />
          ))}
        </div>
        <div
          data-micro="chip"
          data-reaction-chip
          className="ml-auto flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/80 will-change-transform"
        >
          <Heart size={12} strokeWidth={1.9} className="text-pink-400" aria-hidden />
          3 entradas listas
        </div>
        <div
          data-micro="message"
          data-final-message
          className="ml-10 flex items-center justify-between gap-2 rounded-[20px] rounded-tr-md bg-gradient-to-br from-[#2f6bff] to-[#0358f7] px-4 py-2.5 text-sm font-medium leading-5 text-white will-change-transform"
        >
          Nos vemos dentro
          <Check size={15} strokeWidth={2.2} aria-hidden />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white/40">
        <span className="flex-1">Escribe un mensaje…</span>
        <MessageCircle size={15} strokeWidth={1.8} aria-hidden />
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
