"use client";

import { motion, LayoutGroup } from "framer-motion";
import React, { useState, useId, useRef } from "react";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";

import { cn } from "@/lib/utils";

const PHOTOS = [
  {
    id: "photo-1",

    src: "/album/image2.png",
    alt: "Technology setup",
    rotation: -15,
    x: -90,
    y: 10,
    zIndex: 10,
  },
  {
    id: "photo-2",
    src: "/album/image1.png",
    alt: "Design research",
    rotation: -3,
    x: -10,
    y: -15,
    zIndex: 20,
  },
  {
    id: "photo-3",
    src: "/album/image3.png",
    alt: "Code and development",
    rotation: 12,
    x: 75,
    y: 5,
    zIndex: 30,
  },
];

const transition = {
  type: "spring",
  stiffness: 160,
  damping: 18,
  mass: 1,
} as const;

export function ExpandableGallery() {
  const [isExpanded, setIsExpanded] = useState(false);
  const layoutGroupId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(containerRef, () => {
    if (isExpanded) {
      setIsExpanded(false);
    }
  });

  return (
    <section className="relative w-full  px-4 md:px-8  flex flex-col items-center justify-start min-h-[850px] overflow-hidden z-0">
      <LayoutGroup id={layoutGroupId}>
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
          <motion.div
            ref={containerRef}
            layout
            className={cn(
              "relative w-full flex flex-col items-center justify-start pt-0",
            )}
            transition={transition}
          >
            <div
              className={cn(
                "relative ",
                "h-[450px] w-full flex items-center justify-center mb-8 ",
              )}
            >
              {PHOTOS.map((photo, index) => {
                const isPrimary = index < 3;
                if (!isPrimary && !isExpanded) return null;

                return (
                  <motion.div
                    key={`card-${photo.id}`}
                    layoutId={`card-container-${photo.id}`}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      rotate: photo.rotation || 0,
                      x: photo.x || 0,
                      y: photo.y || 0,
                      zIndex: photo.zIndex || 0,
                    }}
                    transition={transition}
                    whileHover={{
                      scale: 1.05,
                      y: (photo.y || 0) - 15,
                      rotate: (photo.rotation || 0) * 0.8,
                      zIndex: 50,
                      transition: {
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      },
                    }}
                    className={cn(
                      "cursor-pointer overflow-hidden bg-muted",
                      "absolute w-44 h-44 md:w-60 md:h-60 rounded-[2.5rem] md:rounded-[3rem] border-[6px] border-secondary shadow-[0_20px_50px_rgba(0,0,0,0.15)]",
                    )}
                    onClick={() => !isExpanded && setIsExpanded(true)}
                  >
                    <motion.div
                      layoutId={`image-inner-${photo.id}`}
                      layout="position"
                      className="w-full h-full relative"
                      transition={transition}
                    >
                      <img
                        src={photo.src}
                        alt={photo.alt}
                        // fill
                        className="object-cover select-none pointer-events-none h-full w-full"
                        sizes={"540px"}
                        // priority={isPrimary}
                      />
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </LayoutGroup>
    </section>
  );
}

export default ExpandableGallery;
