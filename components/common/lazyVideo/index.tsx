"use client";

import { useEffect, useRef, useState } from "react";

type LazyVideoProps = React.VideoHTMLAttributes<HTMLVideoElement> & {
  rootMargin?: string;
  mountMargin?: string;
};

export function LazyVideo({
  src,
  rootMargin = "220px",
  mountMargin = "220px",
  preload = "none",
  autoPlay,
  muted,
  playsInline,
  ...props
}: LazyVideoProps) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [shouldMountSource, setShouldMountSource] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Mount the src only when the video gets near viewport.
    const mountObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldMountSource(true);
          }
        });
      },
      { rootMargin: mountMargin, threshold: 0.01 },
    );

    // Autoplay is enabled only while visible.
    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { rootMargin, threshold: 0.25 },
    );

    mountObserver.observe(element);
    visibilityObserver.observe(element);

    return () => {
      mountObserver.disconnect();
      visibilityObserver.disconnect();
    };
  }, [mountMargin, rootMargin]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (isVisible && autoPlay) {
      void element.play().catch(() => undefined);
      return;
    }

    element.pause();
  }, [isVisible, autoPlay]);

  return (
    <video
      ref={ref}
      src={shouldMountSource ? src : undefined}
      preload={shouldMountSource ? preload : "none"}
      autoPlay={isVisible ? autoPlay : undefined}
      muted={muted}
      playsInline={playsInline}
      {...props}
    />
  );
}
