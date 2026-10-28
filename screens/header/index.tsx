"use client";

import { ParyUpIsoIcon } from "@/public/icons/icons";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Check, ChevronDown, ChevronUp, Menu, X } from "lucide-react";
import { LoginIcon } from "@/components/icons/solar";
import { NavItems, NavRightItems } from "@/constants/nav";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { LanguageItemProps, LanguageItems } from "@/constants/language";
import NumberFlow from "@number-flow/react";
import { ProfileMenuItems } from "@/constants/profile";
import { useOrganizations } from "@/components/organizations/useOrganizations";
import BorderBeam from "@/components/common/borderBeam";
import { useAuth } from "@/components/auth/AuthProvider";
import { useI18n } from "@/components/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n";
import { FloatingDisclosure } from "@/components/watermelon/floating-disclosure";

// Degradado negro con curva suave (ease) para que el texto se funda sin que se note dónde acaba.
const HEADER_FADE =
  "linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.92) 30%, rgba(0,0,0,0.74) 48%, rgba(0,0,0,0.5) 62%, rgba(0,0,0,0.28) 76%, rgba(0,0,0,0.1) 89%, transparent 100%)";

interface HeaderProps {
  isLoading?: boolean;
  showLogo?: boolean;
}

interface LenisScrollInstance {
  on: (
    event: "scroll",
    handler: ({ scroll }: { scroll: number }) => void,
  ) => void;
  off: (
    event: "scroll",
    handler: ({ scroll }: { scroll: number }) => void,
  ) => void;
}

export const Header = ({ isLoading = false, showLogo = true }: HeaderProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, status: authStatus, logout } = useAuth();
  const { t, locale, setLocale } = useI18n();
  const orgAccess = useOrganizations();
  const hasOrganizations =
    orgAccess.status === "ready" &&
    (orgAccess.canCreateOrganization ||
      orgAccess.organizations.length > 0 ||
      orgAccess.pendingInvites.length > 0);
  // El header puede hidratarse después de que AuthProvider ya conozca la sesión
  // (está dentro de un Suspense). Hasta hidratar se pinta como "cargando", igual
  // que el HTML del servidor, para que no haya desajuste de hidratación.
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const status = hydrated ? authStatus : "loading";
  const ticketsHref =
    status === "authenticated" ? "/tickets" : "/login?next=/tickets";
  const displayName = user?.name || user?.nickname || t("header.account");
  const handle = user?.nickname ? `@${user.nickname}` : user?.email;
  const initial = displayName.trim().charAt(0).toUpperCase() || "P";
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeItem: LanguageItemProps =
    LanguageItems.find((item) => item.title.toLowerCase() === locale) ??
    LanguageItems[0];
  const setActiveItem = (item: LanguageItemProps) =>
    setLocale(item.title.toLowerCase() as Locale);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [activeDropdownPath, setActiveDropdownPath] = useState<string | null>(
    null,
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileMenuOpenPath, setMobileMenuOpenPath] = useState<string | null>(
    null,
  );

  const isRouteMobileMenuOpen =
    isMobileMenuOpen && mobileMenuOpenPath === pathname;
  const routeActiveDropdown =
    activeDropdownPath === pathname ? activeDropdown : null;

  const scrollY = useMotionValue(0);

  const gradientOpacityRaw = useTransform(scrollY, [0, 180], [0, 1]);
  const gradientOpacity = useSpring(gradientOpacityRaw, {
    stiffness: 140,
    damping: 24,
    mass: 0.3,
  });

  useEffect(() => {
    if (!activeDropdown) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [activeDropdown]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const setupLenisListener = async () => {
      const lenis = (window as unknown as { lenis?: LenisScrollInstance })
        .lenis;

      // Lenis guarda también su versión en window.lenis: solo vale si es la instancia
      if (typeof lenis?.on === "function") {
        const handleScroll = ({ scroll }: { scroll: number }) => {
          scrollY.set(scroll);
        };

        lenis.on("scroll", handleScroll);
        cleanup = () => lenis.off("scroll", handleScroll);
        return;
      }

      const handleNativeScroll = () => {
        scrollY.set(window.scrollY);
      };

      handleNativeScroll();
      window.addEventListener("scroll", handleNativeScroll, { passive: true });
      cleanup = () => window.removeEventListener("scroll", handleNativeScroll);
    };

    setupLenisListener();

    return () => {
      cleanup?.();
    };
  }, [scrollY]);

  return (
    <header className="fixed inset-x-0 top-0 z-[1000] w-full py-5 text-white">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[clamp(120px,17vh,170px)]"
        style={{ opacity: gradientOpacity, background: HEADER_FADE }}
      />

      <div className="relative flex items-center justify-center">
        <div
          role="banner"
          className="relative w-full max-w-[1800px] px-[clamp(1.25rem,3vw,3.5rem)]"
        >
          <div className="relative flex h-14 items-center justify-between md:h-16">
            <div className="flex items-center gap-2 md:gap-6">
              <motion.button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-secondary/35 text-white/85 transition hover:bg-white/10 lg:hidden"
                onClick={() => {
                  setIsMobileMenuOpen((prev) => {
                    const next = !prev;
                    if (next) {
                      setMobileMenuOpenPath(pathname);
                    } else {
                      setMobileMenuOpenPath(null);
                    }
                    return next;
                  });
                }}
                aria-label={t("header.openNav")}
                aria-expanded={isRouteMobileMenuOpen}
                whileTap={{ scale: 0.95 }}
              >
                {isRouteMobileMenuOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </motion.button>

              <nav className="hidden items-center gap-1 text-xs font-medium tracking-wide text-white/70 sm:text-sm lg:-ml-3 lg:flex">
                {NavItems.map(({ labelKey, href, icon }) => {
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={labelKey}
                      href={href}
                      className={`group inline-flex items-center gap-2 rounded-full px-3 py-2.5 transition-colors  ${
                        isActive
                          ? "text-white"
                          : "text-white/50 hover:text-white"
                      }`}
                    >
                      <span className="relative flex items-center justify-center ">
                        {icon}
                        {isActive ? (
                          <span
                            className="absolute -bottom-2 h-1 w-1 rounded-full  bg-white"
                            aria-hidden
                          />
                        ) : null}
                      </span>
                      <span className="hidden sm:inline clamp-span">
                        {t(labelKey)}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <Link
              href="/"
              className="absolute left-1/2 -translate-x-1/2 rounded-full p-2.5"
              aria-label="ParyUp Home"
            >
              <span
                data-paryup-header-logo-target
                className="flex h-10 w-10 items-center justify-center"
              >
                {isLoading || !showLogo ? (
                  <span className="block h-10 w-10" aria-hidden="true" />
                ) : (
                  <ParyUpIsoIcon className="h-10 w-10" />
                )}
              </span>
            </Link>

            <div className="flex items-center gap-2 md:gap-3">
              <div ref={dropdownRef} className="relative hidden lg:block">
                <motion.button
                  type="button"
                  className="relative inline-flex h-9 items-center gap-2 rounded-full px-3 text-xs font-medium text-white/80 transition hover:text-white md:h-10"
                  onClick={() => {
                    const next = routeActiveDropdown === 1 ? null : 1;
                    setActiveDropdown(next);
                    setActiveDropdownPath(next === null ? null : pathname);
                  }}
                  aria-haspopup="listbox"
                  aria-expanded={routeActiveDropdown === 1}
                  whileTap={{ scale: 0.96 }}
                >
                  <div className="flex items-center gap-2">
                    <activeItem.Icon className="h-4 w-4" />
                    <NumberFlow
                      value={0}
                      className="hide-number font-semibold text-white/80"
                      suffix={activeItem.title}
                    />
                  </div>
                  {routeActiveDropdown === 1 ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </motion.button>

                <AnimatePresence>
                  {activeDropdown === 1 ? (
                    <motion.div
                      className="absolute left-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-white/5 bg-secondary p-2 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12 }}
                    >
                      <div className="flex items-center justify-between px-2 pb-1 text-[11px] uppercase tracking-[0.2em] text-white/40">
                        {t("header.language")}
                        <button
                          type="button"
                          className="rounded-full p-1 text-white/50 transition hover:text-white"
                          onClick={() => {
                            setActiveDropdown(null);
                            setActiveDropdownPath(null);
                          }}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex flex-col">
                        {LanguageItems.map((item) => (
                          <motion.button
                            key={item.title}
                            type="button"
                            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-white/80 transition hover:bg-white/5 hover:text-white"
                            onClick={() => {
                              setActiveItem(item);
                              setActiveDropdown(null);
                              setActiveDropdownPath(null);
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center gap-2">
                              <item.Icon className="h-4 w-4 text-white/60" />
                              <div className="flex flex-col items-start leading-tight">
                                <NumberFlow
                                  value={0}
                                  className="hide-number font-medium text-white/80"
                                  suffix={item.title}
                                />
                                <motion.span
                                  className="text-xs text-white/40"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{
                                    opacity: 0,
                                    transition: { duration: 0.05 },
                                  }}
                                >
                                  {item.description}
                                </motion.span>
                              </div>
                            </div>
                            {activeItem.title === item.title ? (
                              <motion.div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white">
                                <Check className="h-4 w-4" />
                              </motion.div>
                            ) : (
                              <motion.div className="h-6 w-6 rounded-full border border-white/10" />
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              <div
                className={`hidden flex-row items-center justify-center ${
                  status === "authenticated" ? "lg:flex" : ""
                }`}
              >
                {NavRightItems.map(({ labelKey, icon }) => (
                  <BorderBeam
                    key={labelKey}
                    size="md"
                    colorVariant="pary"
                    duration={2.4}
                    strength={0.7}
                  >
                    <Link
                      href={ticketsHref}
                      className={`group inline-flex h-11 items-center gap-2.5 rounded-full bg-white/80 border border-white px-5 text-xs font-medium tracking-wide ring-1 ring-white/7 transition-colors ${
                        pathname === "/tickets"
                          ? "text-white"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      <span className="relative flex items-center justify-center text-black/70 group-hover:text-black">
                        {icon}
                        {pathname === "/tickets" ? (
                          <span
                            className="absolute -bottom-1.5 h-1 w-1 rounded-full bg-black"
                            aria-hidden
                          />
                        ) : null}
                      </span>
                      <span className="hidden text-sm font-semibold text-black sm:inline">
                        {t(labelKey)}
                      </span>
                    </Link>
                  </BorderBeam>
                ))}
              </div>

              {status === "unauthenticated" ? (
                <Link
                  href={
                    pathname === "/login"
                      ? "/login"
                      : `/login?next=${encodeURIComponent(pathname)}`
                  }
                  aria-label={t("header.login")}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-3.5 text-sm font-semibold text-black shadow-[0_0_24px_rgba(255,255,255,0.18)] transition hover:bg-white/90 active:scale-[0.97] sm:pl-4 sm:pr-5"
                >
                  <LoginIcon className="h-5 w-5" />
                  <span className="hidden sm:inline">{t("header.login")}</span>
                </Link>
              ) : status === "loading" || !user ? (
                <div
                  aria-hidden
                  className="h-11 w-11 animate-pulse rounded-full bg-white/10"
                />
              ) : (
                <FloatingDisclosure
                  label={t("header.userMenu")}
                  trigger={
                    user.image ? (
                      <img
                        src={user.image}
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center bg-white/15 text-base font-semibold text-white">
                        {initial}
                      </span>
                    )
                  }
                  header={
                    <div className="flex items-center gap-3 pr-2">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/15">
                        {user.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.image}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-base font-semibold text-white">
                            {initial}
                          </span>
                        )}
                      </span>
                      <span className="flex min-w-0 flex-col leading-tight">
                        <span className="truncate text-[15px] font-semibold text-neutral-100">
                          {displayName}
                        </span>
                        {handle ? (
                          <span className="truncate text-[13px] text-neutral-500">
                            {handle}
                          </span>
                        ) : null}
                      </span>
                    </div>
                  }
                  items={ProfileMenuItems.filter(
                    (item) =>
                      item.requires !== "organizations" || hasOrganizations,
                  ).map((item) => ({
                    title: t(item.labelKey),
                    description: t(item.descriptionKey),
                    icon: item.icon,
                    danger: item.action === "logout",
                    onSelect: async () => {
                      if (item.action === "logout") {
                        await logout();
                        if (pathname === "/tickets") router.push("/");
                        return;
                      }
                      if (item.href) router.push(item.href);
                    },
                  }))}
                />
              )}
            </div>

            <AnimatePresence>
              {isRouteMobileMenuOpen ? (
                <motion.div
                  className="absolute left-0 right-0 top-full mt-3 rounded-2xl border border-white/10 bg-secondary/95 p-3 shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur-sm lg:hidden"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex flex-col gap-2">
                    <nav className="grid grid-cols-2 gap-2">
                      {NavItems.map(({ labelKey, href, icon }) => {
                        const isActive = pathname === href;
                        return (
                          <Link
                            key={`mobile-${labelKey}`}
                            href={href}
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              setMobileMenuOpenPath(null);
                            }}
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-2.5 text-sm transition ${
                              isActive
                                ? "bg-white/10 text-white"
                                : "text-white/75 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            <span className="text-white/80">{icon}</span>
                            <span>{t(labelKey)}</span>
                          </Link>
                        );
                      })}
                    </nav>

                    <div className="grid gap-2">
                      {(status === "authenticated" ? NavRightItems : []).map(
                        ({ labelKey, icon }) => (
                          <Link
                            key={`mobile-right-${labelKey}`}
                            href={ticketsHref}
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              setMobileMenuOpenPath(null);
                            }}
                            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/80 px-3 py-2.5 text-sm text-black transition hover:bg-white"
                          >
                            <span>{icon}</span>
                            <span>{t(labelKey)}</span>
                          </Link>
                        ),
                      )}
                      {status === "unauthenticated" ? (
                        <Link
                          href="/login"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            setMobileMenuOpenPath(null);
                          }}
                          className="inline-flex items-center justify-center rounded-full bg-white px-3 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
                        >
                          <LoginIcon className="mr-2 h-5 w-5" />
                          {t("header.login")}
                        </Link>
                      ) : null}
                    </div>

                    <div className="mt-1 border-t border-white/10 pt-2">
                      <p className="px-1 pb-2 text-[11px] uppercase tracking-[0.2em] text-white/45">
                        {t("header.language")}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {LanguageItems.map((item) => (
                          <button
                            key={`mobile-lang-${item.title}`}
                            type="button"
                            onClick={() => setActiveItem(item)}
                            className={`inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-sm transition ${
                              activeItem.title === item.title
                                ? "bg-white/10 text-white"
                                : "text-white/70 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            <item.Icon className="h-4 w-4" />
                            <span>{item.description}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};
