import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AppleIcon, GooglePlayColorIcon } from "@/public/icons/icons";

type StoreButtonProps = Omit<React.ComponentProps<typeof Button>, "children">;

type StoreBadgeProps = StoreButtonProps & {
  icon: React.ComponentType<React.ComponentProps<"svg">>;
  eyebrow: string;
  label: string;
  defaultAriaLabel: string;
  tone: "light" | "dark";
};

function StoreBadge({
  className,
  icon: Icon,
  eyebrow,
  label,
  defaultAriaLabel,
  tone,
  type,
  ...props
}: StoreBadgeProps) {
  // Pareja principal y secundaria, sin borde: blanco sólido y gris translúcido.
  const toneClasses =
    tone === "light"
      ? "bg-white text-black border-transparent shadow-[0_10px_30px_rgba(255,255,255,0.12)] hover:bg-white/90"
      : "bg-white/10 text-white border-transparent hover:bg-white/15";

  const ariaLabel = props["aria-label"] ?? defaultAriaLabel;

  return (
    <Button
      type={type ?? "button"}
      aria-label={ariaLabel}
      className={cn(
        "group min-h-14 rounded-full border px-8 py-4 gap-2.5 backdrop-blur-sm transition-all duration-200",
        "hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        "[&>svg]:!size-6",
        toneClasses,
        className,
      )}
      {...props}
    >
      <Icon
        aria-hidden="true"
        className="transition-transform duration-200 group-hover:scale-105"
      />
      <span className="flex flex-col items-start leading-none">
        <span className="text-[0.62rem] font-medium uppercase tracking-[0.1em] opacity-70">
          {eyebrow}
        </span>
        <span className="text-[1.08rem] font-semibold tracking-tight">
          {label}
        </span>
      </span>
    </Button>
  );
}

export function AppStoreButton({ className, ...props }: StoreButtonProps) {
  return (
    <StoreBadge
      icon={AppleIcon}
      eyebrow="Descargar en"
      label="App Store"
      defaultAriaLabel="Download on the App Store"
      tone="light"
      className={className}
      {...props}
    />
  );
}

export function PlayStoreButton({ className, ...props }: StoreButtonProps) {
  return (
    <StoreBadge
      icon={GooglePlayColorIcon}
      eyebrow="Descargar en"
      label="Google Play"
      defaultAriaLabel="Get it on Google Play"
      tone="dark"
      className={className}
      {...props}
    />
  );
}
