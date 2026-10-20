'use client';

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { AppleIcon, ArrowIcon, AndroidIcon } from "@/public/icons/icons";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import useSound from "use-sound";


const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 cursor-pointer ",
    {
        variants: {
            variant: {
                default: "bg-secondary text-foreground shadow hover:bg-primary/90",
                secondary: "bg-accent/20 text-foreground shadow-sm hover:bg-accent/30",
                outline: "border border-white/10 shadow-sm hover:bg-white/10 text-foreground ",
                ghost: "hover:brightness-110 text-foreground hover:[&>div>svg]:scale-120 hover:[&>div>svg]:brightness-110 [&>div>svg]:transition-all transition-all ",
                link: "text-accent hover:text-accent-secondary hover:brightness-110 ",
            },
            size: {
                default: "h-full px-2 py-2",
                sm: "h-9 rounded-xl px-3 ",
                lg: "h-10 rounded-md px-8",
                icon: "h-10 w-10 py-1 px-1",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);


export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };


interface buttonProps {
    children?: React.ReactNode;
    onClick?: () => void;
    className?: string;
}

type ButtonDeviceProps = React.ComponentProps<typeof Button>;


export const DownloadButton = ({
    className,
  ...props
}:Omit<ButtonDeviceProps, "children">) => {
    const [osType, setOsType] = useState<'apple' | 'android'>('apple');
    const [buttonText, setButtonText] = useState<string>("Descargar para iOS");

    useEffect(() => {
        const userAgent = navigator.userAgent.toLowerCase();

        if (/android/.test(userAgent)) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setOsType('android');
            setButtonText("Descargar para Android");
        } else if (/windows/.test(userAgent)) {
            setOsType('android');
            setButtonText("Descargar para Android");
        } else if (/macintosh|mac os x/.test(userAgent)) {
            setOsType('apple');
            setButtonText("Descargar para iOS");
        } else {
            setOsType('apple');
            setButtonText("Descargar para iOS");
        }
    }, []);

    return (
       <Button className={cn(" gap-2 bg-white text-black", className)} {...props}>
        {osType === 'apple' ? <AppleIcon className="h-5 w-5" /> : <AndroidIcon className="h-5 w-5" />}
        <div className="text-left flex flex-col items-start justify-center pr-2">
        <span className="text-[10px] leading-none tracking-tighter">
          Descargar en
        </span>
        <p className="text-base font-bold leading-none">{
            osType === 'apple' ? 'App Store' : 'Google Play'
        }</p>
      </div>
       </Button>
    )
}


export const SeeButton = (props: buttonProps) => {

    const [isHovered, setIsHovered] = useState(false);

    const { children, onClick, className } = props;


    return (
        <motion.button
            className={`
        relative flex items-center gap-4 overflow-hidden
        cursor-pointer
        px-6 py-4 pl-7
        rounded-full bg-white
        font-medium uppercase
        shadow-lg
        pointer-events-auto
        transition-colors duration-200 ease-out
        hover:bg-accent hover:text-white
        ${className || ''}
      `}
            style={{
                fontSize: 'clamp(0.875rem, 1vw, 1.75vw)',
                fontFamily: 'Aeonik, sans-serif',
                height: '3.375vw',
                color: 'var(--project-details-btn-text, #000)',
                boxShadow: '0 6px 10px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.04)',
                willChange: 'transform'
            }}
            onClick={onClick}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            whileHover={{
                transition: {
                    backgroundColor: {
                        duration: 0.5,
                        delay: 0.3,
                        ease: [0.35, 0, 0, 1]
                    }
                }
            }}
        >
            {/* Dot */}
            <motion.span
                className="inline-block relative w-2 h-2 bg-black rounded-full z-10"
                style={{
                    backgroundColor: 'var(--color-black, #000)'
                }}
                animate={isHovered ? {
                    x: '3em',
                    scale: 50,
                    backgroundColor: 'var(--color-accent, #3b82f6)'
                } : {
                    x: 0,
                    scale: 1,
                    backgroundColor: 'var(--color-black, #000)'
                }}
                transition={{
                    duration: 0.4,
                    ease: [0.35, 0, 0, 1]
                }}
            />

            <motion.span
                className={`relative z-10 ${isHovered ? 'text-white' : 'text-black'}`}
                animate={isHovered ? {
                    x: '-1.5em'
                } : {
                    x: 0
                }}
                transition={{
                    duration: 0.4,
                    ease: [0.35, 0, 0, 1]
                }}
            >
                {children}
            </motion.span>

            {/* Arrow */}
            <motion.span
                className="absolute flex justify-center items-center right-4 w-5 h-5 z-10 rounded-full"
                style={{
                    color: 'var(--color-blue, #3b82f6)'
                }}
                animate={isHovered ? {
                    x: 0
                } : {
                    x: '3em'
                }}
                transition={{
                    duration: 0.4,
                    ease: [0.4, 0, 0, 1]
                }}
            >
                <motion.div
                    className="w-full h-full"
                    animate={isHovered ? {
                        color: 'var(--color-white, #fff)'
                    } : {
                        color: 'var(--color-blue, #3b82f6)'
                    }}
                    transition={{
                        duration: 0.5
                    }}
                >
                    <ArrowIcon />
                </motion.div>
            </motion.span>
        </motion.button>
    )
}

export const MusicToggleButton = () => {
    const bars = 5;

    const getRandomHeights = () => {
        return Array.from({ length: bars }, () => Math.random() * 0.8 + 0.2);
    };

    const [heights, setHeights] = useState(getRandomHeights());

    const [isPlaying, setIsPlaying] = useState(false);

    const [play, { pause, sound }] = useSound("/audio/audio.m4a", {
        loop: true,
        onplay: () => setIsPlaying(true),
        onend: () => setIsPlaying(false),
        onpause: () => setIsPlaying(false),
        onstop: () => setIsPlaying(false),
        soundEnabled: true,
    });

    useEffect(() => {
        if (isPlaying) {
            const waveformIntervalId = setInterval(() => {
                setHeights(getRandomHeights());
            }, 100);

            return () => {
                clearInterval(waveformIntervalId);
            };
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHeights(Array(bars).fill(0.1));
    }, [isPlaying]);

    const handleClick = () => {
        if (isPlaying) {
            pause();
            setIsPlaying(false);
            return;
        }
        play();
        setIsPlaying(true);
    };

    return (
        <>
            <motion.div
                onClick={handleClick}
                key="audio"
                initial={{ padding: "14px 10px " }}
                whileHover={{ padding: "18px 22px " }}
                whileTap={{ padding: "18px 22px " }}
                transition={{ duration: 1, bounce: 0.6, type: "spring" }}
                className="bg-[#e4e6ee] cursor-pointer rounded-full p-2 "
            >
                <motion.div
                    initial={{ opacity: 0, filter: "blur(4px)" }}
                    animate={{
                        opacity: 1,
                        filter: "blur(0px)",
                    }}
                    exit={{ opacity: 0, filter: "blur(4px)" }}
                    transition={{ type: "spring", bounce: 0.35 }}
                    className="flex h-[18px] w-full items-center gap-1 rounded-full"
                >
                    {heights.map((height, index) => (
                        <motion.div
                            key={index}
                            className="bg-black w-[2px] rounded-full"
                            initial={{ height: 5 }}
                            animate={{
                                height: Math.max(4, height * 14),
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 10,
                            }}
                        />
                    ))}
                </motion.div>
            </motion.div>
        </>
    );
};