"use client";

import { Noise } from "@/components/common/noise";
import { Toaster } from "sonner";
import Lenis from "lenis";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Header } from "@/screens/header";
import { AnimatePresence } from "framer-motion";
import Loading from "./loading";
import { usePathname } from "next/navigation";

gsap.registerPlugin(ScrollTrigger);

interface ClientWrapperProps {
  children: React.ReactNode;
}

export default function ClientWrapper(props: ClientWrapperProps) {
  const container = useRef<HTMLElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();
  const isWaitlist = pathname === "/waitlist";
  const [isLoading, setIsLoading] = useState(!isWaitlist);

  const { children } = props;

  useEffect(() => {
    if (!container.current) return;

    const previousScrollRestoration =
      "scrollRestoration" in window.history
        ? window.history.scrollRestoration
        : null;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const navigationEntry = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    const isReload = navigationEntry?.type === "reload";

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenisRef.current = lenis;
    (window as Window & { lenis?: Lenis }).lenis = lenis;

    if (isReload) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      lenis.scrollTo(0, { immediate: true });
    }

    ScrollTrigger.scrollerProxy(container.current, {
      scrollTop(value) {
        if (typeof value === "number") {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      pinType: "transform",
    });

    let rafId = 0;
    const onRefresh = () => lenis.resize();

    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    lenis.on("scroll", ScrollTrigger.update);

    ScrollTrigger.addEventListener("refresh", onRefresh);
    ScrollTrigger.refresh();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
      delete (window as Window & { lenis?: Lenis }).lenis;
      ScrollTrigger.getAll().forEach((t) => t.kill());
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      if (previousScrollRestoration && "scrollRestoration" in window.history) {
        window.history.scrollRestoration = previousScrollRestoration;
      }
    };
  }, []);

  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      lenisRef.current?.scrollTo(0, { immediate: true });
      lenisRef.current?.resize();
      ScrollTrigger.refresh();
    });

    const refreshTimeoutId = window.setTimeout(() => {
      lenisRef.current?.resize();
      ScrollTrigger.refresh();
    }, 180);

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(refreshTimeoutId);
    };
  }, [pathname]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsLoading(false);
      document.body.style.cursor = "default";
      window.scrollTo(0, 0);
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <>
      <main
        ref={container}
        id="scroll-container"
        className="relative flex flex-col w-full min-h-screen bg-background"
      >
        <AnimatePresence mode="wait">
          {isLoading && !isWaitlist && <Loading />}
        </AnimatePresence>
        {!isWaitlist && <Header />}
        {children}
        {!isWaitlist && <Noise opacity={0.01} />}
      </main>
      <Toaster />
    </>
  );
}
