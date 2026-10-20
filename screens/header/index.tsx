"use client";

import {
  FilterIcon,
  MarqueeIcon,
  ParyUpIsoIcon,
  SearchIcon,
} from "@/public/icons/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, ChevronDown, ChevronUp, Menu, X } from "lucide-react";
import { NavItems, NavRightItems } from "@/constants/nav";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { LanguageItemProps, LanguageItems } from "@/constants/language";
import NumberFlow from "@number-flow/react";
import { ProfileMenuItems } from "@/constants/profile";
import BorderBeam from "@/components/common/borderBeam";
import { MusicToggleButton } from "@/components/common/musicButton";

const user = {
  name: "Player One",
  avatar:
    "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=200&auto=format&fit=crop",
};

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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const [activeItem, setActiveItem] = useState<LanguageItemProps>(
    LanguageItems[0],
  );
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [activeDropdownPath, setActiveDropdownPath] = useState<string | null>(
    null,
  );
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileOpenPath, setProfileOpenPath] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileMenuOpenPath, setMobileMenuOpenPath] = useState<string | null>(
    null,
  );

  const isRouteProfileOpen = isProfileOpen && profileOpenPath === pathname;
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
    if (!isProfileOpen) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isProfileOpen]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const setupLenisListener = async () => {
      const lenis = (window as unknown as { lenis?: LenisScrollInstance }).lenis;

      if (lenis) {
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
        className="pointer-events-none absolute inset-0 header-top-mask"
        style={{ opacity: gradientOpacity }}
      />

      <div className="relative flex items-center justify-center">
        <div
          role="banner"
          className="relative w-full max-w-[110rem] px-4 sm:px-6 lg:px-10"
        >
            <div className="relative flex h-14 items-center justify-between md:h-16">
              <div className="flex items-center gap-2 md:gap-6">
                <motion.button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-secondary/35 text-white/85 transition hover:bg-white/10 lg:hidden"
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
                  aria-label="Open navigation menu"
                  aria-expanded={isRouteMobileMenuOpen}
                  whileTap={{ scale: 0.95 }}
                >
                  {isRouteMobileMenuOpen ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Menu className="h-4 w-4" />
                  )}
                </motion.button>

                <nav className="hidden items-center gap-2 text-xs font-medium tracking-wide text-white/70 sm:gap-4 sm:text-sm lg:flex">
                {NavItems.map(({ label, href, icon }) => {
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={label}
                      href={href}
                      className={`group inline-flex items-center gap-2 rounded-full px-2 py-1 transition-colors  ${
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
                        {label}
                      </span>
                    </Link>
                  );
                })}
              </nav>
                <div className="hidden xl:block">
                  <BorderBeam
                    size="line"
                    colorVariant="pary"
                    duration={2.4}
                    strength={0.7}
                  >
                    <div className="flex h-9 items-center gap-2 rounded-full bg-secondary/30 px-3 ring-1 ring-white/5 transition focus-within:ring-2 focus-within:ring-white/10 md:h-10">
                      <SearchIcon className="h-5 w-5 text-white/50" />
                      <input
                        type="text"
                        placeholder="Buscar eventos..."
                        className="w-[7.5rem] bg-transparent text-xs text-white/90 placeholder:text-white/35 focus:outline-none sm:w-[8rem] sm:text-sm md:w-[8.5rem] lg:w-[10rem]"
                      />
                      <button
                        type="button"
                        className="flex h-6 w-6 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/20 hover:text-white/90"
                        aria-label="Search filters"
                      >
                        <FilterIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </BorderBeam>
                </div>
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
                        Idioma
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

              <div className="hidden flex-row items-center justify-center lg:flex">
                {NavRightItems.map(({ label, href, icon }) => (
                  <BorderBeam
                    key={label}
                    size="md"
                    colorVariant="pary"
                    duration={2.4}
                    strength={0.7}
                  >
                    <Link
                      href={href}
                      className={`group inline-flex h-8 items-center gap-2 rounded-full bg-white/80 border border-white px-3 text-xs font-medium tracking-wide ring-1 ring-white/7 transition-colors md:h-10 ${
                        pathname === href
                          ? "text-white"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      <span className="relative flex items-center justify-center text-black/70 group-hover:text-black">
                        {icon}
                        {pathname === href ? (
                          <span
                            className="absolute -bottom-1.5 h-1 w-1 rounded-full bg-black"
                            aria-hidden
                          />
                        ) : null}
                      </span>
                      <span className="hidden sm:inline clamp-span text-black">
                        {label}
                      </span>
                    </Link>
                  </BorderBeam>
                ))}
              </div>

              <div ref={profileRef} className="relative">
                <motion.button
                  type="button"
                  className="relative h-10 w-10 overflow-hidden rounded-xl md:h-11 md:w-11"
                  aria-label="Open user menu"
                  onClick={() => {
                    setIsProfileOpen((prev) => {
                      const next = !prev;
                      if (next) {
                        setProfileOpenPath(pathname);
                      } else {
                        setProfileOpenPath(null);
                      }
                      return next;
                    });
                  }}
                  whileTap={{ scale: 0.96 }}
                >
                  <motion.div
                    className="h-full w-full overflow-hidden rounded-xl"
                    animate={{
                      opacity: isRouteProfileOpen ? 0.55 : 1,
                      scale: isRouteProfileOpen ? 0.94 : 1,
                    }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                    <MarqueeIcon className="w-5 h-5 text-red-500 z-50" />
                  </motion.div>
                </motion.button>

                <AnimatePresence initial={false}>
                  {isRouteProfileOpen ? (
                    <motion.div
                      className="absolute right-0 top-full z-30 mt-2 w-48 overflow-hidden rounded-2xl border border-white/5 bg-secondary p-2 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <motion.div className="rounded-2xl pb-3">
                        <div className="flex items-center justify-between px-2  relative">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[15px] font-medium text-white/90">
                              {user.name}
                            </span>
                            <span className="text-[11px] uppercase tracking-[0.25em] text-white/45">
                              Cuenta
                            </span>
                          </div>
                          <div className="flex items-center relative">
                            <motion.div
                              className="h-9 w-9 overflow-hidden relative rounded-xl relative"
                              initial={{ opacity: 0, scale: 0.86, y: -4 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.86, y: -4 }}
                              transition={{
                                duration: 0.18,
                                ease: [0.22, 1, 0.36, 1],
                              }}
                            >
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="h-full w-full object-cover "
                              />
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>

                      <div className="flex flex-col gap-0.5">
                        {ProfileMenuItems.map((item) => {
                          const Icon = item.icon;
                          const content = (
                            <span className="flex items-center gap-2">
                              {Icon}
                              <span className="clamp-span text-white/85">
                                {item.label}
                              </span>
                            </span>
                          );

                          if (item.action === "logout") {
                            return (
                              <motion.button
                                key={item.label}
                                type="button"
                                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm text-white/80 transition hover:bg-white/5 hover:text-white"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                  setIsProfileOpen(false);
                                  setProfileOpenPath(null);
                                }}
                              >
                                {content}
                              </motion.button>
                            );
                          }

                          return (
                            <motion.div
                              key={item.label}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Link
                                href={item.href ?? "#"}
                                 className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm text-white/80 transition hover:bg-white/5 hover:text-white"
                                 onClick={() => {
                                   setIsProfileOpen(false);
                                   setProfileOpenPath(null);
                                 }}
                               >
                                {content}
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>
                      </motion.div>
                    ) : null}
                </AnimatePresence>
              </div>
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
                      {NavItems.map(({ label, href, icon }) => {
                        const isActive = pathname === href;
                        return (
                          <Link
                            key={`mobile-${label}`}
                            href={href}
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              setMobileMenuOpenPath(null);
                            }}
                            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition ${
                              isActive
                                ? "bg-white/10 text-white"
                                : "text-white/75 hover:bg-white/5 hover:text-white"
                            }`}
                          >
                            <span className="text-white/80">{icon}</span>
                            <span>{label}</span>
                          </Link>
                        );
                      })}
                    </nav>

                    <div className="grid gap-2">
                      {NavRightItems.map(({ label, href, icon }) => (
                        <Link
                          key={`mobile-right-${label}`}
                          href={href}
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            setMobileMenuOpenPath(null);
                          }}
                          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/80 px-3 py-2.5 text-sm text-black transition hover:bg-white"
                        >
                          <span>{icon}</span>
                          <span>{label}</span>
                        </Link>
                      ))}
                    </div>

                    <div className="mt-1 border-t border-white/10 pt-2">
                      <p className="px-1 pb-2 text-[11px] uppercase tracking-[0.2em] text-white/45">
                        Idioma
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {LanguageItems.map((item) => (
                          <button
                            key={`mobile-lang-${item.title}`}
                            type="button"
                            onClick={() => setActiveItem(item)}
                            className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
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
