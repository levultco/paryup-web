import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AppleStoreButtonProps = React.ComponentProps<typeof Button>;

export function AppleStoreButton({
  className,
  ...props
}: Omit<AppleStoreButtonProps, "children">) {
  return (
    <Button
      className={cn(
        "h-15 gap-2 bg-[#141414]/30 px-10 py-5 border-2 border-white/10 hover:bg-[#fff]/20",
        className,
      )}
      {...props}
    >
      <AppleIcon className="size-5 text-white" />
      <div className="text-left flex flex-col items-start justify-center pr-2 gap-1">
        <span className="text-[12px] leading-none font-light tracking-tighter text-white/60">
          Descargar en
        </span>
        <p className="text-base font-bold leading-none text-white">App Store</p>
      </div>
    </Button>
  );
}

function AppleIcon({
  fill = "currentColor",
  ...props
}: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill={fill} {...props}>
      <g id="_Group_2">
        <g id="_Group_3">
          <path
            id="_Path_"
            d="M18.546,12.763c0.024-1.87,1.004-3.597,2.597-4.576c-1.009-1.442-2.64-2.323-4.399-2.378    c-1.851-0.194-3.645,1.107-4.588,1.107c-0.961,0-2.413-1.088-3.977-1.056C6.122,5.927,4.25,7.068,3.249,8.867    c-2.131,3.69-0.542,9.114,1.5,12.097c1.022,1.461,2.215,3.092,3.778,3.035c1.529-0.063,2.1-0.975,3.945-0.975    c1.828,0,2.364,0.975,3.958,0.938c1.64-0.027,2.674-1.467,3.66-2.942c0.734-1.041,1.299-2.191,1.673-3.408    C19.815,16.788,18.548,14.879,18.546,12.763z"
          />
          <path
            id="_Path_2"
            d="M15.535,3.847C16.429,2.773,16.87,1.393,16.763,0c-1.366,0.144-2.629,0.797-3.535,1.829    c-0.895,1.019-1.349,2.351-1.261,3.705C13.352,5.548,14.667,4.926,15.535,3.847z"
          />
        </g>
      </g>
    </svg>
  );
}

type PlayStoreButtonProps = React.ComponentProps<typeof Button>;

export function PlayStoreButton({
  className,
  ...props
}: Omit<PlayStoreButtonProps, "children">) {
  return (
    <Button
      className={cn(
        "h-16 gap-2 bg-[#141414]/20 px-10 py-5 border-2 border-white/10 hover:bg-[#fff]/20 ",
        className,
      )}
      {...props}
    >
      <PlayStoreIcon className="size-5 text-white" />
      <div className="text-left flex flex-col items-start justify-center pr-2 gap-1">
        <span className="text-[12px] leading-none font-light tracking-tighter text-white/60">
          Disponible en
        </span>
        <p className="text-base font-bold leading-none text-white">
          Google Play
        </p>
      </div>
    </Button>
  );
}

function PlayStoreIcon({
  fill = "currentColor",
  ...props
}: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill={fill} {...props}>
      <path
        fill="currentColor"
        d="M5.4 21c-.17.003-.34-.026-.5-.086l8.054-8.057l2.666 2.669l-9.255 5.2A1.998 1.998 0 0 1 5.4 21Zm-1.164-.665a1.9 1.9 0 0 1-.236-.97V4.66a2.13 2.13 0 0 1 .1-.658l8.233 8.235l-8.1 8.1l.003-.002Zm12.179-5.258l-2.841-2.839l3.133-3.132l2.783 1.563c.534.24.892.755.928 1.339a1.574 1.574 0 0 1-.929 1.34l-3.074 1.729Zm-3.461-3.463l-8.34-8.339c.229-.17.506-.26.791-.261c.336.012.664.107.955.277l9.551 5.368l-2.956 2.955h-.001Z"
      />
    </svg>
  );
}
