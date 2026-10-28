"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useI18n } from "@/components/i18n/LocaleProvider";
import {
  ProfileScreen,
  type AttendedEvent,
  type ProfileUser,
} from "@/components/profile/ProfileScreen";

function ProfileSkeleton() {
  return (
    <div aria-hidden>
      <div className="h-[300px] w-full animate-pulse bg-white/[0.07] sm:h-[360px]" />
      <div className="relative z-10 mx-auto w-full max-w-3xl px-[clamp(1.25rem,3vw,2rem)]">
        <div className="-mt-14 flex items-center gap-5">
          <div className="h-24 w-24 shrink-0 animate-pulse rounded-full border-4 border-black bg-[#1a1a1a]" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-6 w-40 animate-pulse rounded-full bg-white/10" />
            <div className="h-4 w-24 animate-pulse rounded-full bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfileView() {
  const router = useRouter();
  const { status } = useAuth();
  const { t } = useI18n();
  const [data, setData] = useState<{
    user: ProfileUser;
    events: AttendedEvent[];
    accent: string | null;
  } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?next=/profile");
      return;
    }
    if (status !== "authenticated") return;

    let active = true;
    fetch("/api/profile")
      .then(async (res) => {
        if (res.status === 401) {
          router.replace("/login?next=/profile");
          return;
        }
        if (!res.ok) throw new Error("profile");
        const json = await res.json();
        if (active && json.user) setData(json);
        else if (active) setFailed(true);
      })
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, [status, router]);

  if (failed) {
    return (
      <p className="px-6 py-40 text-center text-muted">{t("profile.error")}</p>
    );
  }
  if (!data) return <ProfileSkeleton />;
  return (
    <ProfileScreen user={data.user} events={data.events} accent={data.accent} />
  );
}
