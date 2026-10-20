import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import BorderBeam from "../borderBeam/borderBeams";

const AUDIO_SRC =
  "/audio/music_136610469445635_VGxcimBg4YHBACHr7fhYid_zbzheo.mp3";

export const MusicToggleButton = () => {
  const bars = 5;

  const getRandomHeights = () => {
    return Array.from({ length: bars }, () => Math.random() * 0.8 + 0.2);
  };

  const [heights, setHeights] = useState(getRandomHeights());

  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isPlaying) {
      const waveformIntervalId = setInterval(() => {
        setHeights(getRandomHeights());
      }, 100);

      return () => {
        clearInterval(waveformIntervalId);
      };
    }
    setHeights(Array(bars).fill(0.1));
  }, [isPlaying]);

  const handleClick = () => {
    const maybeAudio =
      audio ??
      (() => {
        const element = new Audio(AUDIO_SRC);
        element.preload = "none";
        element.loop = true;
        element.volume = 0.3;
        setAudio(element);
        return element;
      })();

    if (isPlaying) {
      maybeAudio.pause();
      setIsPlaying(false);
      return;
    }

    void maybeAudio.play().then(() => setIsPlaying(true));
  };

  useEffect(() => {
    return () => {
      audio?.pause();
    };
  }, [audio]);

  return (
    <>
      <BorderBeam size="sm" colorVariant={isPlaying ? "pary" : "mono"}>
        <motion.div
          onClick={handleClick}
          key="audio"
          initial={{ padding: "14px 14px " }}
          whileHover={{ padding: "18px 22px " }}
          whileTap={{ padding: "18px 22px " }}
          transition={{ duration: 1, bounce: 0.6, type: "spring" }}
          className="bg-secondary/20 cursor-pointer rounded-full p-2"
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
            {/* Waveform visualization */}
            {heights.map((height, index) => (
              <motion.div
                key={index}
                className="bg-foreground w-[1px] rounded-full"
                initial={{ height: 1 }}
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
      </BorderBeam>
    </>
  );
};
