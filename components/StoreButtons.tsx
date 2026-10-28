"use client";

import { APP_STORE_URL, PLAY_STORE_URL } from "./content";
import { useI18n } from "@/components/i18n/LocaleProvider";

function AppleIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M18.546,12.763c0.024-1.87,1.004-3.597,2.597-4.576c-1.009-1.442-2.64-2.323-4.399-2.378c-1.851-0.194-3.645,1.107-4.588,1.107c-0.961,0-2.413-1.088-3.977-1.056C6.122,5.927,4.25,7.068,3.249,8.867c-2.131,3.69-0.542,9.114,1.5,12.097c1.022,1.461,2.215,3.092,3.778,3.035c1.529-0.063,2.1-0.975,3.945-0.975c1.828,0,2.364,0.975,3.958,0.938c1.64-0.027,2.674-1.467,3.66-2.942c0.734-1.041,1.299-2.191,1.673-3.408C19.815,16.788,18.548,14.879,18.546,12.763z" />
      <path d="M15.535,3.847C16.429,2.773,16.87,1.393,16.763,0c-1.366,0.144-2.629,0.797-3.535,1.829c-0.895,1.019-1.349,2.351-1.261,3.705C13.352,5.548,14.667,4.926,15.535,3.847z" />
    </svg>
  );
}

function PlayIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path fill="#00A0FF" d="M3.9 2.4v19.2l8.5-9.6z" />
      <path fill="#00E176" d="M3.9 2.4 12.4 12h2.1l2.4-2.1z" />
      <path fill="#FF3A44" d="m3.9 21.6 8.5-9.6h2.1l2.4 2.1z" />
      <path fill="#FFD400" d="M14.5 12l2.4-2.1 3.5 2.1-3.5 2.1z" />
    </svg>
  );
}

const base =
  "inline-flex items-center gap-3 rounded-full py-3 pl-5 pr-7 transition-[transform,translate,scale,background-color,box-shadow,border-color] duration-300 ease-[var(--ease-out)] hover:-translate-y-0.5 hover:scale-[1.04] active:translate-y-0 active:scale-[0.97]";

// Blanco para App Store y cristal oscuro para Google Play, como los botones de la app.
export default function StoreButtons({
  className = "",
}: {
  className?: string;
}) {
  const { t } = useI18n();
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <a
        href={APP_STORE_URL}
        className={`${base} bg-white text-black hover:shadow-[0_14px_44px_-12px_rgba(255,255,255,0.55)]`}
      >
        <AppleIcon className="size-6" />
        <span className="flex flex-col text-left leading-none">
          <span className="text-[11px] text-black/60">
            {t("store.download")}
          </span>
          <span className="mt-1 text-[17px] font-semibold">App Store</span>
        </span>
      </a>
      <a
        href={PLAY_STORE_URL}
        className={`${base} border border-white/10 bg-white/10 text-white backdrop-blur-xl hover:border-white/25 hover:bg-white/20 hover:shadow-[0_14px_44px_-12px_rgba(255,255,255,0.3)]`}
      >
        <PlayIcon className="size-6" />
        <span className="flex flex-col text-left leading-none">
          <span className="text-[11px] text-white/60">
            {t("store.available")}
          </span>
          <span className="mt-1 text-[17px] font-semibold">Google Play</span>
        </span>
      </a>
    </div>
  );
}
