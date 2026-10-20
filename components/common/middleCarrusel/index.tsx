"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

export interface GalleryItem {
  image: string;
  text?: string;
}

interface CircularGalleryProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: GalleryItem[];
  bend?: number;
  borderRadius?: number;
  scrollSpeed?: number;
  scrollEase?: number;
  fontClassName?: string;
}

type MediaNode = {
  card: HTMLDivElement | null;
  extra: number;
  width: number;
  widthTotal: number;
  x: number;
  topAnchorY: number;
};

type Screen = {
  width: number;
  height: number;
};

function lerp(p1: number, p2: number, t: number) {
  return p1 + (p2 - p1) * t;
}

function getViewport(screen: Screen): Viewport {
  const fov = (45 * Math.PI) / 180;
  const cameraZ = 20;
  const height = 2 * Math.tan(fov / 2) * cameraZ;
  const width = height * (screen.width / screen.height);

  return { width, height };
}

const defaultItems: GalleryItem[] = [
  { image: "https://picsum.photos/seed/1/800/600?grayscale", text: "Bridge" },
  {
    image: "https://picsum.photos/seed/2/800/600?grayscale",
    text: "Desk Setup",
  },
  {
    image: "https://picsum.photos/seed/3/800/600?grayscale",
    text: "Waterfall",
  },
];

const CircularGallery = ({
  items,
  bend = 3,
  borderRadius = 0.09375,
  scrollSpeed = 2,
  scrollEase = 0.05,
  className,
  fontClassName,
  ...props
}: CircularGalleryProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mediaNodesRef = useRef<MediaNode[]>([]);
  const rafRef = useRef<number>(0);

  const galleryItems = useMemo(() => {
    const source = items && items.length > 0 ? items : defaultItems;
    return [...source, ...source];
  }, [items]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
    const startedAt = performance.now();
    const autoScrollSpeed = Math.max(0.015, scrollSpeed * 0.008);
    const autoScrollDelayMs = 900;
    let screen: Screen = {
      width: container.clientWidth,
      height: container.clientHeight,
    };
    let viewport = getViewport(screen);

    mediaNodesRef.current = mediaNodesRef.current.slice(0, galleryItems.length);
    mediaNodesRef.current.forEach((node) => {
      node.extra = 0;
    });

    const updateMetrics = () => {
      screen = {
        width: container.clientWidth,
        height: container.clientHeight,
      };

      if (!screen.width || !screen.height) return;

      viewport = getViewport(screen);

      const scale = screen.height / 1500;
      const planeHeight = (viewport.height * (360 * scale)) / screen.height;
      const planeWidth = (viewport.width * (360 * scale)) / screen.width;
      const topAnchorY = viewport.height / 2 - planeHeight / 2 - 1.5;
      const padding = 2;
      const width = planeWidth + padding;
      const widthTotal = width * galleryItems.length;

      mediaNodesRef.current.forEach((node, index) => {
        if (!node.card) return;

        node.width = width;
        node.widthTotal = widthTotal;
        node.x = width * index;
        node.topAnchorY = topAnchorY;

        const cardWidthPx = (planeWidth / viewport.width) * screen.width;
        const cardHeightPx = (planeHeight / viewport.height) * screen.height;

        node.card.style.width = `${cardWidthPx}px`;
        node.card.style.height = `${cardHeightPx}px`;
        node.card.style.borderRadius = `${borderRadius * 100}%`;
      });
    };

    const renderFrame = () => {
      if (performance.now() - startedAt >= autoScrollDelayMs) {
        scroll.target += autoScrollSpeed;
      }

      scroll.current = lerp(scroll.current, scroll.target, scroll.ease);
      const direction = scroll.current > scroll.last ? "right" : "left";

      mediaNodesRef.current.forEach((node) => {
        if (!node.card) return;

        let positionX = node.x - scroll.current - node.extra;
        const halfViewportWidth = viewport.width / 2;
        const planeOffset = node.width / 2;

        const isBefore = positionX + planeOffset < -halfViewportWidth;
        const isAfter = positionX - planeOffset > halfViewportWidth;

        if (direction === "right" && isBefore) {
          node.extra -= node.widthTotal;
          positionX = node.x - scroll.current - node.extra;
        }

        if (direction === "left" && isAfter) {
          node.extra += node.widthTotal;
          positionX = node.x - scroll.current - node.extra;
        }

        let positionY = node.topAnchorY;
        let rotation = 0;

        if (bend !== 0) {
          const bendAbs = Math.abs(bend);
          const radius =
            (halfViewportWidth * halfViewportWidth + bendAbs * bendAbs) /
            (2 * bendAbs);
          const effectiveX = Math.min(Math.abs(positionX), halfViewportWidth);
          const arc =
            radius - Math.sqrt(radius * radius - effectiveX * effectiveX);
          const angle = Math.asin(effectiveX / radius);

          if (bend > 0) {
            positionY = node.topAnchorY - arc;
            rotation = Math.sign(positionX) * angle;
          } else {
            positionY = node.topAnchorY + arc;
            rotation = -Math.sign(positionX) * angle;
          }
        }

        const centerX =
          screen.width / 2 + (positionX / viewport.width) * screen.width;
        const centerY =
          screen.height / 2 - (positionY / viewport.height) * screen.height;
        const cardWidthPx = node.card.offsetWidth;
        const cardHeightPx = node.card.offsetHeight;
        const left = centerX - cardWidthPx / 2;
        const top = centerY - cardHeightPx / 2;

        node.card.style.transform = `translate3d(${left}px, ${top}px, 0) rotate(${rotation}rad)`;
      });

      scroll.last = scroll.current;
      rafRef.current = window.requestAnimationFrame(renderFrame);
    };

    updateMetrics();
    renderFrame();

    const handleResize = () => {
      updateMetrics();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [galleryItems, bend, borderRadius, scrollEase, scrollSpeed]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute top-0 left-0 h-full w-full overflow-hidden",
        "text-foreground font-bold text-[30px]",
        fontClassName,
        className,
      )}
      {...props}
    >
      {galleryItems.map((item, index) => (
        <div
          key={`${item.image}-${index}`}
          ref={(element) => {
            mediaNodesRef.current[index] = mediaNodesRef.current[index] ?? {
              card: null,
              extra: 0,
              width: 0,
              widthTotal: 0,
              x: 0,
              topAnchorY: 0,
            };

            mediaNodesRef.current[index].card = element;
          }}
          className="absolute left-0 top-0 will-change-transform rounded-3xl overflow-hidden pointer-events-none"
          style={{ transformOrigin: "center center" }}
        >
          <div className="relative size-full overflow-hidden">
            <Image
              src={item.image}
              alt={item.text || "Gallery image"}
              fill
              sizes="(max-width: 768px) 240px, 360px"
              quality={58}
              loading="eager"
              className="object-cover"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export { CircularGallery };
