"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/** Acceso a la administración global de ParyUp. Solo se pinta para ADMIN. */
export function AdminLink({ className = "" }: { className?: string }) {
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => active && setAdmin(data?.admin === true))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  if (!admin) return null;
  return (
    <Link
      href="/admin/fourvenues"
      className={`inline-flex h-11 items-center rounded-full border border-white/15 px-5 text-sm text-white/80 transition-colors hover:border-white/50 hover:text-white ${className}`}
    >
      Administración
    </Link>
  );
}
