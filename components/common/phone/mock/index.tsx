"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface PhoneMockProps {
  width: number;
  height: number;
  rotate?: number;
  className?: string;
  imageSrc?: string;
  imageAlt?: string;
}

export const PhoneMock = ({
  width = 300,
  height = 128,
  rotate = 0,
  className = "",
  imageSrc = "/features/message.png",
  imageAlt = "Vista de la app en móvil",
}: PhoneMockProps) => {
  return (
    <motion.div
      className={`relative flex h-full w-auto items-center justify-center overflow-hidden ${className}`}
    >
      <div
        className="relative z-10 my-4"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          rotate: `${rotate}deg`,
        }}
      >
        <div
          className="relative z-30 rounded-[68px] border border-[#1B1721] bg-black p-[19px] shadow-[inset_0_0_4px_2px_rgb(192,183,205),inset_0_0_0_6px_rgb(52,44,63)] "
          style={{ width: `${width}px`, height: `${height}px` }}
        >
          <div className="absolute top-[85px] left-0 z-20 h-[7px] w-5 bg-black/25" />
          <div className="absolute top-[85px] right-0 z-20 h-[7px] w-5 bg-black/25" />
          <div className="absolute bottom-[85px] left-0 z-20 h-[7px] w-5 bg-black/25" />
          <div className="absolute right-0 bottom-[85px] z-20 h-[7px] w-5 bg-black/25" />
          <div className="absolute top-0 right-[85px] z-20 h-5 w-[7px] bg-black/25" />
          <div className="absolute bottom-0 left-[85px] z-20 h-5 w-[7px] bg-black/25" />
          {/* <video
          className="relative z-20 block h-full w-full rounded-[49px] bg-black bg-center bg-cover object-top object-cover"
          src="mobile/phone.mp4"
          autoPlay
          loop
          muted
        /> */}
          <Image
            className="relative z-20 block h-full w-full rounded-[49px] bg-black bg-center bg-cover object-top object-cover"
            src={imageSrc}
            alt={imageAlt}
            width={width}
            height={height}
            priority={false}
          />
        </div>

        {/* <div className="absolute top-[29px] left-1/2 z-40 ml-[-60px] flex h-[35px] w-[120px] items-center justify-end rounded-[20px] bg-black pr-4">
          <motion.div
            className="size-2.5 rounded-full absolute top-1/2 right-[15%] -translate-y-1/2"
            style={{
              background:
                "radial-gradient(farthest-corner at 20% 20%,#6074bf 0,transparent 40%),radial-gradient(farthest-corner at 80% 80%,#513785 0,#24555e 20%,transparent 50%)",
            }}
            transition={{ duration: 0.2 }}
          ></motion.div>
        </div> */}
        <div className="block" />
        <div className="absolute top-[115px] left-[-2px] h-[32px] w-[3px] rounded-[2px] bg-[#1B1721]" />
        <div className="absolute top-[200px] right-[-2px] h-[100px] w-[3px] rounded-[2px] bg-[#1B1721]" />
        <div className="absolute top-[180px] left-[-2px] h-[70px] w-[3px] rounded-[2px] bg-[#1B1721]" />
        <div className="absolute top-[270px] left-[-2px] h-[70px] w-[3px] rounded-[2px] bg-[#1B1721]" />
        <div className="block" />
      </div>
    </motion.div>
  );
};
