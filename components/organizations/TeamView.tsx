"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { useOrg } from "@/components/organizations/OrgShell";
import {
  Card,
  Notice,
  PageHeader,
  pillButton,
  primaryButton,
} from "@/components/organizations/ui";
import { orgFetch, teamErrorKey } from "@/lib/org-api";
import { intlLocale } from "@/lib/i18n";
import {
  ORG_PERMISSIONS,
  canManageRole,
  rolesAssignableBy,
  type OrgInvite,
  type OrgMember,
  type OrgRole,
} from "@/lib/organizations";

type FoundUser = {
  id: string;
  name: string;
  nickname: string | null;
  image: string | null;
};

function Person({
  user,
  children,
}: {
  user: { name: string; nickname: string | null; image: string | null };
  children?: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 text-sm font-semibold text-white">
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt="" className="h-full w-full object-cover" />
        ) : (
          user.name.trim().charAt(0).toUpperCase() || "P"
        )}
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-sm font-medium text-white">
          {user.name}
        </span>
        {user.nickname ? (
          <span className="truncate text-xs text-white/45">
            @{user.nickname}
          </span>
        ) : null}
      </span>
      {children}
    </div>
  );
}

const selectClass =
  "h-10 rounded-full border border-white/15 bg-black px-3 text-sm text-white outline-none focus:border-white/60 disabled:opacity-40";

export function TeamView() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const { slug, org, role, can } = useOrg();
  const canInvite = can(ORG_PERMISSIONS.staffInvite);
  const canRemove = can(ORG_PERMISSIONS.staffManage);
  const canChangeRole = can(ORG_PERMISSIONS.rolesManage);
  const assignable = rolesAssignableBy(role);

  const [members, setMembers] = useState<OrgMember[] | null>(null);
  const [invites, setInvites] = useState<OrgInvite[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [message, setMessage] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoundUser[] | null>(null);
  const [picked, setPicked] = useState<FoundUser | null>(null);
  const [inviteRole, setInviteRole] = useState<OrgRole>(
    assignable[assignable.length - 1] ?? "STAFF",
  );
  const searchSeq = useRef(0);

  const load = useCallback(async () => {
    const [m, i] = await Promise.all([
      orgFetch<{ members: OrgMember[] }>(slug, "members"),
      canInvite
        ? orgFetch<{ invites: OrgInvite[] }>(slug, "invites")
        : Promise.resolve(null),
    ]);
    if (!m.ok || !m.data) return setLoadError(true);
    setMembers(m.data.members);
    if (i?.ok && i.data) setInvites(i.data.invites);
  }, [slug, canInvite]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  // Búsqueda con debounce; `searchSeq` descarta respuestas antiguas.
  useEffect(() => {
    if (!canInvite || picked || query.trim().length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults(null);
      return;
    }
    const seq = ++searchSeq.current;
    const timer = setTimeout(async () => {
      const res = await fetch(
        `/api/users/search?query=${encodeURIComponent(query.trim())}`,
      )
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);
      if (seq === searchSeq.current) setResults(res?.users ?? []);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, picked, canInvite]);

  const memberIds = new Set((members ?? []).map((m) => m.id));
  const pendingIds = new Set(
    invites.map((i) => i.targetUser?.id).filter(Boolean),
  );
  const shown = (results ?? []).filter(
    (u) => !memberIds.has(u.id) && u.id !== user?.id,
  );

  const fail = (status: number, data: unknown) =>
    setMessage({ tone: "error", text: t(teamErrorKey(status, data)) });

  const sendInvite = async () => {
    if (!picked || busy) return;
    setBusy("invite");
    setMessage(null);
    const res = await orgFetch(slug, "invites", {
      method: "POST",
      body: { targetUserId: picked.id, roleKey: inviteRole },
    });
    setBusy(null);
    if (!res.ok) return fail(res.status, res.data);
    setMessage({
      tone: "success",
      text: t("orgs.tm.sent", { name: picked.name }),
    });
    setPicked(null);
    setQuery("");
    await load();
  };

  const revoke = async (id: string) => {
    if (busy) return;
    setBusy(id);
    const res = await orgFetch(slug, `invites/${id}/revoke`, {
      method: "POST",
      body: {},
    });
    setBusy(null);
    if (!res.ok) return fail(res.status, res.data);
    setMessage(null);
    await load();
  };

  const changeRole = async (m: OrgMember, next: OrgRole) => {
    if (busy || next === m.role) return;
    setBusy(m.id);
    const res = await orgFetch(slug, `members/${encodeURIComponent(m.id)}`, {
      method: "PATCH",
      body: { roleKey: next },
    });
    setBusy(null);
    if (!res.ok) return fail(res.status, res.data);
    setMessage({ tone: "success", text: t("orgs.tm.roleChanged") });
    await load();
  };

  const remove = async (m: OrgMember) => {
    if (busy) return;
    setBusy(m.id);
    const res = await orgFetch(slug, `members/${encodeURIComponent(m.id)}`, {
      method: "DELETE",
    });
    setBusy(null);
    setConfirmRemove(null);
    if (!res.ok) return fail(res.status, res.data);
    setMessage({
      tone: "success",
      text: t("orgs.tm.removed", { name: m.name }),
    });
    await load();
  };

  const day = new Intl.DateTimeFormat(intlLocale(locale), {
    day: "numeric",
    month: "short",
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("orgs.tm.title")}
        subtitle={t("orgs.tm.subtitle", { name: org.name })}
      />
      {!canInvite && !canRemove && !canChangeRole ? (
        <p className="text-sm text-white/45">{t("orgs.tm.readOnly")}</p>
      ) : null}
      {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}

      <Card title={t("orgs.tm.members")}>
        {loadError ? (
          <div className="flex flex-col items-start gap-3">
            <p className="text-white/55">{t("orgs.tm.errLoad")}</p>
            <button
              type="button"
              className={pillButton}
              onClick={() => {
                setLoadError(false);
                void load();
              }}
            >
              {t("orgs.common.retry")}
            </button>
          </div>
        ) : !members ? (
          <div aria-hidden className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-2xl bg-white/[0.06]"
              />
            ))}
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-white/10">
            {members.map((m) => {
              const manageable =
                m.id !== user?.id && canManageRole(role, m.role);
              const options = rolesAssignableBy(role);
              return (
                <li
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <Person user={m}>
                    {m.id === user?.id ? (
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60">
                        {t("orgs.common.you")}
                      </span>
                    ) : null}
                  </Person>
                  <div className="flex flex-wrap items-center gap-2">
                    {manageable && canChangeRole ? (
                      <select
                        className={selectClass}
                        value={m.role}
                        disabled={busy === m.id}
                        aria-label={t("orgs.tm.role")}
                        onChange={(e) =>
                          changeRole(m, e.target.value as OrgRole)
                        }
                      >
                        {options.map((r) => (
                          <option key={r} value={r}>
                            {t(`orgs.role.${r}`)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70">
                        {t(`orgs.role.${m.role}`)}
                      </span>
                    )}
                    {manageable && canRemove ? (
                      confirmRemove === m.id ? (
                        <>
                          <span className="text-xs text-white/55">
                            {t("orgs.tm.removeConfirm", { name: m.name })}
                          </span>
                          <button
                            type="button"
                            className={primaryButton}
                            disabled={busy === m.id}
                            onClick={() => remove(m)}
                          >
                            {t("orgs.common.confirm")}
                          </button>
                          <button
                            type="button"
                            className={pillButton}
                            onClick={() => setConfirmRemove(null)}
                          >
                            {t("orgs.common.cancel")}
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className={pillButton}
                          onClick={() => setConfirmRemove(m.id)}
                        >
                          {t("orgs.tm.remove")}
                        </button>
                      )
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {canInvite ? (
        <Card title={t("orgs.tm.invite")}>
          <p className="mb-4 text-sm text-white/45">
            {t("orgs.tm.inviteHint")}
          </p>
          {picked ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Person user={picked} />
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className={selectClass}
                  value={inviteRole}
                  aria-label={t("orgs.tm.role")}
                  onChange={(e) => setInviteRole(e.target.value as OrgRole)}
                >
                  {assignable.map((r) => (
                    <option key={r} value={r}>
                      {t(`orgs.role.${r}`)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className={primaryButton}
                  disabled={busy === "invite" || pendingIds.has(picked.id)}
                  onClick={sendInvite}
                >
                  {busy === "invite" ? t("orgs.tm.sending") : t("orgs.tm.send")}
                </button>
                <button
                  type="button"
                  className={pillButton}
                  onClick={() => setPicked(null)}
                >
                  {t("orgs.common.cancel")}
                </button>
              </div>
            </div>
          ) : (
            <>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("orgs.tm.search")}
                aria-label={t("orgs.tm.search")}
                className="w-full rounded-full border border-white/15 bg-transparent px-5 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/60"
              />
              {results ? (
                shown.length > 0 ? (
                  <ul className="mt-3 flex flex-col gap-1">
                    {shown.map((u) => (
                      <li key={u.id}>
                        <button
                          type="button"
                          onClick={() => setPicked(u)}
                          className="flex w-full items-center rounded-2xl p-2 text-left transition-colors hover:bg-white/[0.06]"
                        >
                          <Person user={u} />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-white/45">
                    {t("orgs.tm.noResults")}
                  </p>
                )
              ) : null}
            </>
          )}

          <h3 className="font-display mt-8 text-base font-semibold text-white">
            {t("orgs.tm.pending")}
          </h3>
          {invites.length === 0 ? (
            <p className="mt-2 text-sm text-white/45">
              {t("orgs.tm.noPending")}
            </p>
          ) : (
            <ul className="mt-3 flex flex-col divide-y divide-white/10">
              {invites.map((i) => (
                <li
                  key={i.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <Person
                    user={
                      i.targetUser ?? {
                        name: i.email ?? "—",
                        nickname: null,
                        image: null,
                      }
                    }
                  />
                  <div className="flex flex-wrap items-center gap-3 text-xs text-white/45">
                    <span>{t(`orgs.role.${i.roleKey}`)}</span>
                    <span>
                      {t("orgs.tm.expires", {
                        date: day.format(new Date(i.expiresAt)),
                      })}
                    </span>
                    <button
                      type="button"
                      className={pillButton}
                      disabled={busy === i.id}
                      onClick={() => revoke(i.id)}
                    >
                      {t("orgs.tm.revoke")}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      ) : null}
    </div>
  );
}
