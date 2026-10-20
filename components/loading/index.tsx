"use client";
import styles from "./style.module.scss";
import { useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { animate, motion, useMotionValue, usePresence } from "framer-motion";
import { slideUp } from "./anim";

const logoPath =
  "M293.548,125.108C356.276,132.811 376.871,216.338 321.213,252.05C303.638,263.327 295.891,262.59 222.502,262.34C212.515,262.306 220.276,277.917 215.222,283.266C214.569,283.958 179.659,318.912 178.574,319.595C175.983,321.226 173.621,320.638 173.58,316.496C172.809,238.924 173.575,237.955 177.738,232.689C185.421,222.97 187.608,224.852 250.501,224.722C280.628,224.659 301.607,228.514 311.685,204.578C319.442,186.155 305.58,161.942 282.499,161.57C249.48,161.038 201.865,163.066 196.835,160.032C196.019,159.54 165.956,129.853 165.439,128.528C163.999,124.842 169.062,124.796 169.504,124.792C179.427,124.7 274.598,123.823 293.548,125.108Z";
const logoTransform = "matrix(2.479424 0 0 2.479424 -386.321583 -302.061859)";
const logoMoveTransition = {
  duration: 0.72,
  delay: 0.16,
  ease: [0.22, 1, 0.36, 1] as const,
};

function AnimatedLogo() {
  const id = useId().replace(/:/g, "");
  const glowFilterId = `${id}-glow`;
  const shineFilterId = `${id}-shine`;
  const shineGradientId = `${id}-shine-gradient`;
  const maskId = `${id}-mask`;

  return (
    <svg viewBox="0 0 500 500" className={styles.logoSvg} aria-hidden="true">
      <defs>
        <filter id={glowFilterId} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <filter id={shineFilterId} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <linearGradient id={shineGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="35%" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.96" />
          <stop offset="65%" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <mask id={maskId} maskUnits="userSpaceOnUse">
          <rect width="500" height="500" fill="black" />
          <g transform={logoTransform}>
            <path d={logoPath} fill="white" />
          </g>
        </mask>
      </defs>

      <motion.g
        filter={`url(#${glowFilterId})`}
        style={{ originX: "50%", originY: "50%" }}
        animate={{
          opacity: [0.22, 0.55, 0.22],
          scale: [0.96, 1.05, 0.96],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <g transform={logoTransform}>
          <path d={logoPath} fill="#8af7ff" />
        </g>
      </motion.g>

      <g transform={logoTransform}>
        <path d={logoPath} fill="#f3f3f3" />
      </g>

      <g mask={`url(#${maskId})`}>
        <motion.rect
          x={-120}
          y={88}
          width={72}
          height={324}
          rx={24}
          fill={`url(#${shineGradientId})`}
          filter={`url(#${shineFilterId})`}
          transform="rotate(10 250 250)"
          animate={{ x: [-120, 510] }}
          transition={{
            duration: 1.65,
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: 0.2,
          }}
        />
      </g>
    </svg>
  );
}

const serverViewportSnapshot = { width: 0, height: 0 };
let viewportSnapshot = serverViewportSnapshot;

function subscribeToViewport(onStoreChange: () => void) {
  window.addEventListener("resize", onStoreChange);
  return () => window.removeEventListener("resize", onStoreChange);
}

function getViewportSnapshot() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  if (viewportSnapshot.width !== width || viewportSnapshot.height !== height) {
    viewportSnapshot = { width, height };
  }

  return viewportSnapshot;
}

function getServerViewportSnapshot() {
  return serverViewportSnapshot;
}

export default function Loader() {
  const [isPresent, safeToRemove] = usePresence();
  const [showFloatingLogo, setShowFloatingLogo] = useState(true);
  const dimension = useSyncExternalStore(
    subscribeToViewport,
    getViewportSnapshot,
    getServerViewportSnapshot,
  );
  const logoRef = useRef<HTMLDivElement>(null);
  const hasStartedExitRef = useRef(false);
  const logoX = useMotionValue(0);
  const logoY = useMotionValue(0);
  const logoScale = useMotionValue(1);

  useLayoutEffect(() => {
    if (isPresent || hasStartedExitRef.current) return;
    hasStartedExitRef.current = true;

    const logoElement = logoRef.current;
    const targetElement = document.querySelector<HTMLElement>(
      "[data-paryup-header-logo-target]",
    );
    const animations = [];

    if (logoElement && targetElement) {
      const logoRect = logoElement.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();
      const deltaX =
        targetRect.left + targetRect.width / 2 -
        (logoRect.left + logoRect.width / 2);
      const deltaY =
        targetRect.top + targetRect.height / 2 -
        (logoRect.top + logoRect.height / 2);
      const targetScale = targetRect.width / logoRect.width;

      animations.push(animate(logoX, deltaX, logoMoveTransition));
      animations.push(animate(logoY, deltaY, logoMoveTransition));
      animations.push(animate(logoScale, targetScale, logoMoveTransition));
    }

    const hideLogoTimeout = window.setTimeout(() => {
      setShowFloatingLogo(false);
    }, (logoMoveTransition.delay + logoMoveTransition.duration) * 1000);
    const removalTimeout = window.setTimeout(safeToRemove, 1300);

    return () => {
      animations.forEach((animation) => animation.stop());
      window.clearTimeout(hideLogoTimeout);
      window.clearTimeout(removalTimeout);
    };
  }, [isPresent, logoScale, logoX, logoY, safeToRemove]);

  const initialPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} ${dimension.height + 300} 0 ${dimension.height}  L0 0`;
  const targetPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} ${dimension.height} 0 ${dimension.height}  L0 0`;

  const curve = {
    initial: {
      d: initialPath,
      transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] },
    },
    exit: {
      d: targetPath,
      transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1], delay: 0.45 },
    },
  };

  return (
    <motion.div
      variants={slideUp}
      initial="initial"
      exit="exit"
      className={styles.introduction}
    >
      {dimension.width > 0 && (
        <>
          {showFloatingLogo && (
            <motion.div
              className={styles.logoWrapper}
              style={{ x: logoX, y: logoY }}
            >
              <motion.div
                ref={logoRef}
                className={styles.sharedLogo}
                style={{ scale: logoScale }}
                animate={{
                  filter: ["brightness(1)", "brightness(1.08)", "brightness(1)"],
                }}
                transition={{
                  filter: { duration: 1.6, repeat: Infinity, ease: "easeInOut" },
                }}
              >
                <AnimatedLogo />
              </motion.div>
            </motion.div>
          )}
          <svg className={styles.curveSvg}>
            <motion.path
              variants={curve}
              initial="initial"
              exit="exit"
            ></motion.path>
          </svg>
        </>
      )}
    </motion.div>
  );
}
