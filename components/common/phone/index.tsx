"use client";

import { cn } from "@/lib/utils";
import { ParyUpIsoIcon } from "@/public/icons/icons";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const DynamicIsland = () => {
  const [state, setState] = useState<"idle" | "message" | "notification">(
    "idle",
  );

  useEffect(() => {
    let mounted = true;

    const playSequence = async () => {
      while (mounted) {
        setState("idle");
        await new Promise((r) => setTimeout(r, 2000));
        if (!mounted) break;

        setState("message");
        await new Promise((r) => setTimeout(r, 6000));
        if (!mounted) break;

        setState("idle");
        await new Promise((r) => setTimeout(r, 2000));
        if (!mounted) break;

        setState("notification");
        await new Promise((r) => setTimeout(r, 6000));
      }
    };

    playSequence();

    return () => {
      mounted = false;
    };
  }, []);

  const springTransition = {
    type: "spring" as const,
    stiffness: 180,
    damping: 22,
    mass: 1,
  };

  return (
    <motion.div
      className="absolute  left-1/2 -translate-x-1/2 z-[60] top-[36px]"
      initial={false}
    >
      <motion.div
        className="bg-black/70 overflow-hidden relative z-20 flex items-center justify-center border-1 border-[#fff]/[0.01] backdrop-blur-md shadow-lg shadow-black/50"
        initial={{ width: 170, height: 44, borderRadius: 20 }}
        animate={{
          width: state === "idle" ? 152 : state === "message" ? 380 : 380,
          height: state === "idle" ? 44 : state === "message" ? 94 : 96,
          borderRadius: state === "idle" ? 20 : 36,
        }}
        transition={springTransition}
      >
        <motion.div
          className="size-2.5 rounded-full absolute top-1/2 right-[15%] -translate-y-1/2"
          style={{
            background:
              "radial-gradient(farthest-corner at 20% 20%,#6074bf 0,transparent 40%),radial-gradient(farthest-corner at 80% 80%,#513785 0,#24555e 20%,transparent 50%)",
          }}
          animate={{ opacity: state === "idle" ? 0.5 : 0 }}
          transition={{ duration: 0.2 }}
        ></motion.div>

        <AnimatePresence>
          {state === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              className="w-full h-full"
            />
          )}

          {state === "message" && (
            <motion.div
              key="message"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: 1,
                scale: 1,
                transition: { delay: 0.15, duration: 0.3 },
              }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.1 } }}
              className="absolute inset-0 flex items-center justify-between px-4 w-full h-full "
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative">
                  <div
                    className="w-14 h-14 rounded-full  flex items-center justify-center text-md font-bold text-white  overflow-hidden
                                    "
                  >
                    <img
                      src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=200&auto=format&fit=crop"
                      alt=""
                    />
                  </div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-secondary border-2 border-black rounded-full">
                    <ParyUpIsoIcon className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                </div>
                <div className="flex flex-col justify-center min-w-0 pr-1">
                  {/* <span className="text-[9px] text-gray-400 font-medium tracking-wide uppercase leading-tight">Paryup</span> */}
                  <span className="text-white text-md font-semibold truncate leading-snug">
                    Jose
                  </span>
                  <span className="text-white/80 text-[12px] truncate leading-snug">
                    ¿Vas a la fiesta hoy? 🎉
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0 w-6 h-full py-5 rounded-full  flex items-start justify-center">
                <span className="text-[11px] text-white/40">Ahora</span>
              </div>
            </motion.div>
          )}

          {state === "notification" && (
            <motion.div
              key="notification"
              initial={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
              animate={{
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
                transition: { delay: 0.15, duration: 0.3 },
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                filter: "blur(4px)",
                transition: { duration: 0.1 },
              }}
              className="absolute inset-0 flex items-center gap-3 px-4 w-full h-full"
            >
              <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0  relative">
                <img
                  src="https://fourvenues.com/cdn-cgi/imagedelivery/kWuoTchaMsk7Xnc_FNem7A/db036cce-c94a-44e6-851d-6074ff113000/w=1350"
                  alt="Event"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col justify-center min-w-0 flex-1 py-1">
                <span className="text-md font-bold text-white truncate leading-tight mb-0.5">
                  Hoy en Opium
                </span>
                <span className="text-[11px] text-white/70 leading-tight line-clamp-2">
                  Esta noche te espera, revisa tu plan.
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

interface PhoneProps {
  imageSrc?: string;
  className?: string;
}

export const Phone = (props: PhoneProps) => {
  const { imageSrc, className } = props;

  return (
    <motion.div
      className={cn(
        "relative flex h-full w-auto items-center justify-center overflow-hidden",
        className,
      )}
    >
      <div className="relative z-10 my-4  h-[668px] 2xl:h-[868px] w-[528px]">
        <div className="relative z-30 h-[1068px] w-[528px] rounded-[68px] border border-[#1B1721] bg-black p-[19px] shadow-[inset_0_0_4px_2px_rgb(192,183,205),inset_0_0_0_6px_rgb(52,44,63)] ">
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
          <img
            className="relative z-20 block h-full w-full rounded-[49px] bg-black bg-center bg-cover object-top object-cover"
            src={imageSrc || "mobile/plan2.png"}
          />
          <div className=" z-[50] ">
            <motion.div className="absolute inset-0 z-30 flex flex-col items-center justify-center ">
              <DynamicIsland />
            </motion.div>
          </div>
        </div>

        {/* <div className="absolute top-[29px] left-1/2 z-40 ml-[-60px] flex h-[35px] w-[120px] items-center justify-end rounded-[20px] bg-black pr-4">
        <div
          className="size-2.5 rounded-full "
          style={{
            background:
              "radial-gradient(farthest-corner at 20% 20%,#6074bf 0,transparent 40%),radial-gradient(farthest-corner at 80% 80%,#513785 0,#24555e 20%,transparent 50%)",
          }}
        >
           
        </div>
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
