"use client";

import AnimatedGradientBackground from "@/components/common/gradientBackground";
import { CircularGallery } from "@/components/common/middleCarrusel";
import { AppStoreButton, PlayStoreButton } from "@/components/common/store";
import { MoonIcon } from "@/public/icons/icons";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const handleChange = (event: MediaQueryListEvent) => {
      setIsDesktop(event.matches);
    };

    setIsDesktop(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const textY = useTransform(scrollYProgress, [0, 1], [0, -540]);
  const CarusselY = useTransform(scrollYProgress, [0, 1], [0, -240]);
  const BackgroundY = useTransform(scrollYProgress, [0, 1], [0, -540]);
  const BackgroundOpacity = useTransform(scrollYProgress, (v) => 1 - v);
  const phoneY = useTransform(scrollYProgress, [0, 1], [0, -240]);
  const phoneOpacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      ref={sectionRef}
      className="relative flex h-svh w-full flex-col items-center justify-center overflow-hidden "
    >
      {/* <div className="relative mx-auto w-full h-full"> */}
      <motion.div
        style={{ y: isDesktop ? CarusselY : 0 }}
        className="absolute top-0 left-0 z-2 hidden h-full w-full md:block"
      >
        <CircularGallery
          items={galleryItems}
          bend={10}
          borderRadius={0.1}
          scrollEase={0.002}
        />
      </motion.div>
      <motion.div
        style={{ y: isDesktop ? textY : 0 }}
        className="absolute inset-x-0  md:top-[40%] z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-4 text-center"
      >
        <h1
          style={{
            fontWeight: 600,
            letterSpacing: "-0.01em",
            lineHeight: 1.06,
            color: "#fff",
            fontSize: "clamp(3.2rem, 7vw, 6.5rem)",
          }}
        >
          <span
            style={{
              backgroundImage:
                "linear-gradient(90deg, #999999 0%, #878787 50%, #999999 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: "block",
              lineHeight: 1.1,
              marginBottom: "-0.12em",
            }}
          >
            Crea
          </span>
          <span
            style={{
              backgroundImage:
                "linear-gradient(90deg, #999999 0%, #878787 50%, #999999 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: "block",
              lineHeight: 1.1,
              marginBottom: "-0.12em",
            }}
          >
            toda tu noche
          </span>
          <span
            className="flex flex-wrap items-center justify-center gap-3 "
            style={{ color: "#fff" }}
          >
            <span style={{ color: "#999999" }}>sin</span>
            {/* <VideoIcon src={VIDEO_APP_MESSAGES} size={110} /> */}
            {/* <StarIcon className="size-10" /> */}
            <span>dar</span>

            {/* <VideoIcon src={VIDEO_APP_PLAN} size={110} /> */}
            <MoonIcon className="size-10" />
            <span>vueltas</span>
          </span>
        </h1>

        <p
          className="mt-4 max-w-xl px-2 text-center"
          style={{
            fontSize: "clamp(0.95rem, 2.2vw, 1.2rem)",
            color: "#888",
            lineHeight: 1.4,
            fontWeight: 400,
          }}
        >
          Compra y vende entradas, chatea con tu gente, haz match en los eventos y revive cada noche.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <AppStoreButton />
          <PlayStoreButton />
        </div>
      </motion.div>
      <div className="absolute bottom-0 left-0 hero-down-mask w-full z-1 "></div>
      <div className="absolute bottom-0 left-0 w-full h-full z-1 bg-black/0 backdrop-blur-3xl pointer-events-none"></div>
      <motion.div className="absolute top-0 left-0 w-full h-full rotate-180">
        <AnimatedGradientBackground
          type="pary"
          containerClassName="z-0 relative w-full h-full "
        />
      </motion.div>
    </section>
  );
}

const VIDEO_APP_MESSAGES = "/background/present.mp4";
const VIDEO_APP_PLAN = "/background/present2.mp4";

type VideoIconProps = {
  src: string;
  size?: number;
};

function VideoIcon({ src, size = 72 }: VideoIconProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  return (
    <span
      className="inline-block align-middle overflow-hidden rounded-full"
      style={{
        width: `clamp(48px, 10vw, ${size}px)`,
        height: `clamp(48px, 4vw, ${size}px)`,
        flexShrink: 0,
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
    </span>
  );
}

interface GalleryItemProps {
  image: string;
  text?: string;
}

const galleryItems: GalleryItemProps[] = [
  {
    image: "/hero/1.jpg",
    text: "sfdsf",
  },
  {
    image: "/hero/2.jpg",
    text: "Dance Floor",
  },
  {
    image: "/hero/3.jpg",
    text: "Night Event",
  },
  {
    image: "/hero/4.jpg",
    text: "Club Lights",
  },
  {
    image: "/hero/5.jpg",
    text: "Crowd",
  },
  {
    image: "/hero/6.jpg",
    text: "DJ Set",
  },
  {
    image: "/hero/7.jpg",
    text: "Santorini",
  },
  {
    image: "/hero/8.jpg",
    text: "Blurry Lights",
  },
  // {
  //   image: "https://picsum.photos/seed/9/800/600?grayscale",
  //   text: "New York",
  // },
  // {
  //   image: "https://picsum.photos/seed/10/800/600?grayscale",
  //   text: "Good Boy",
  // },
  // {
  //   image: "https://picsum.photos/seed/21/800/600?grayscale",
  //   text: "Coastline",
  // },
  // {
  //   image: "https://picsum.photos/seed/12/800/600?grayscale",
  //   text: "Palm Trees",
  // },
];
