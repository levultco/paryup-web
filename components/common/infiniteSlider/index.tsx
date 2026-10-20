'use client';
import { cn } from '@/lib/utils';
import { useMotionValue, animate, motion } from 'framer-motion';
import { useMemo, useState, useEffect } from 'react';
import useMeasure from 'react-use-measure';
import React from 'react';

type InfiniteSliderProps = {
  children: React.ReactNode;
  gap?: number;
  duration?: number;
  durationOnHover?: number;
  direction?: 'horizontal' | 'vertical';
  reverse?: boolean;
  className?: string;
};

export function InfiniteSlider({
  children,
  gap = 16,
  duration = 25,
  durationOnHover,
  direction = 'horizontal',
  reverse = false,
  className,
}: InfiniteSliderProps) {
  const [currentDuration, setCurrentDuration] = useState(duration);
  const [trackRef, trackBounds] = useMeasure();
  const [setRef, setBounds] = useMeasure();
  const translation = useMotionValue(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    let controls;
    const setSize =
      direction === 'horizontal' ? setBounds.width : setBounds.height;
    const contentSize = setSize + gap;
    const from = reverse ? -contentSize : 0;
    const to = reverse ? 0 : -contentSize;

    if (!setSize) return;

    if (isTransitioning) {
      controls = animate(translation, [translation.get(), to], {
        ease: 'linear',
        duration:
          currentDuration * Math.abs((translation.get() - to) / contentSize),
        onComplete: () => {
          setIsTransitioning(false);
          setKey((prevKey) => prevKey + 1);
        },
      });
    } else {
      controls = animate(translation, [from, to], {
        ease: 'linear',
        duration: currentDuration,
        repeat: Infinity,
        repeatType: 'loop',
        repeatDelay: 0,
      });
    }

    return controls?.stop;
  }, [
    key,
    translation,
    currentDuration,
    setBounds.width,
    setBounds.height,
    gap,
    isTransitioning,
    direction,
    reverse,
  ]);

  const hoverProps = durationOnHover
    ? {
        onHoverStart: () => {
          setIsTransitioning(true);
          setCurrentDuration(durationOnHover);
        },
        onHoverEnd: () => {
          setIsTransitioning(true);
          setCurrentDuration(duration);
        },
      }
    : {};

  const childrenArray = useMemo(() => React.Children.toArray(children), [children]);

  const repeats = useMemo(() => {
    const trackSize =
      direction === 'horizontal' ? trackBounds.width : trackBounds.height;
    const setSize =
      direction === 'horizontal' ? setBounds.width : setBounds.height;
    if (!trackSize || !setSize) return 2;
    return Math.max(2, Math.ceil((trackSize + gap) / (setSize + gap)) + 1);
  }, [
    trackBounds.width,
    trackBounds.height,
    setBounds.width,
    setBounds.height,
    gap,
    direction,
  ]);

  return (
    <div className={cn('overflow-hidden', className)} ref={trackRef}>
      <motion.div
        className='flex w-max'
        style={{
          ...(direction === 'horizontal'
            ? { x: translation }
            : { y: translation }),
          gap: `${gap}px`,
          flexDirection: direction === 'horizontal' ? 'row' : 'column',
        }}
        {...hoverProps}
      >
        <div
          ref={setRef}
          className={cn(
            'flex w-max',
            direction === 'horizontal' ? 'flex-row' : 'flex-col'
          )}
          style={{ gap: `${gap}px` }}
        >
          {childrenArray}
        </div>
        {Array.from({ length: repeats - 1 }).map((_, groupIndex) => (
          <div
            key={`repeat-${groupIndex}`}
            className={cn(
              'flex w-max',
              direction === 'horizontal' ? 'flex-row' : 'flex-col'
            )}
            style={{ gap: `${gap}px` }}
          >
            {childrenArray.map((child, childIndex) => (
              <React.Fragment key={`item-${groupIndex}-${childIndex}`}>
                {child}
              </React.Fragment>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
