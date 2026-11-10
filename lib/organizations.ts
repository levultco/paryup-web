export type OrgRole = "OWNER" | "MANAGER" | "STAFF" | "PROMOTER" | "SECURITY";

export type OrgSummary = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  isVerified: boolean;
};

export type MyOrganization = {
  organizationId: string;
  role: OrgRole;
  commercialMode?: CommercialMode;
  /** Plan Backstage: NONE (sin plan), TRIAL, ACTIVE o LIMITED (sin pagar). */
  backstagePlanStatus?: "NONE" | "TRIAL" | "ACTIVE" | "LIMITED";
  backstageTrialEndsAt?: string | null;
  organization: OrgSummary;
};

/** Modalidad comercial: NATIVE (ticketing propio) o FOURVENUES (canal de distribución). */
export type CommercialMode = "NATIVE" | "FOURVENUES";

/** Capacidades calculadas por el backend (`/authz/bootstrap`). */
export type OrgCapabilities = Record<
  | "nativeEventCreate"
  | "nativeEventManage"
  | "nativeTicketing"
  | "stripeConnect"
  | "nativePromoters"
  | "nativePromoterSettlement"
  | "nativeScanner"
  | "nativeInbox"
  | "nativeInsights"
  | "nativeLegacy"
  | "externalCatalog"
  | "channelHome",
  boolean
>;

export const NATIVE_ORG_CAPABILITIES: OrgCapabilities = {
  nativeEventCreate: true,
  nativeEventManage: true,
  nativeTicketing: true,
  stripeConnect: true,
  nativePromoters: true,
  nativePromoterSettlement: true,
  nativeScanner: true,
  nativeInbox: true,
  nativeInsights: true,
  nativeLegacy: false,
  externalCatalog: false,
  channelHome: false,
};

export type OrganizationsAccess = {
  canCreateOrganization: boolean;
  maxOrganizations: number;
  ownedOrganizations: number;
  organizations: MyOrganization[];
  pendingInvites: PendingInvite[];
};

/** Permisos efectivos del usuario en una organización (los calcula el backend). */
export const ORG_PERMISSIONS = {
  profileEdit: "org:profile:edit",
  staffInvite: "staff:invite",
  staffManage: "staff:manage",
  rolesManage: "roles:manage",
  eventsView: "events:view",
  eventsCreate: "events:create",
  eventsEdit: "events:edit",
  eventsPublish: "events:publish",
  eventsCancel: "events:cancel",
  eventsDelete: "events:delete",
  ticketTemplatesManage: "ticket-templates:manage",
  paymentsManage: "payments:manage",
  accessRequestsManage: "access-requests:manage",
  statsView: "stats:view",
  promotersManage: "promoters:manage",
  promotersSettle: "promoters:settle",
  accessControlView: "access:control:view",
  fourvenuesLinkManage: "fourvenues:link:manage",
} as const;

/**
 * Capacidad que exige cada permiso nativo (espejo de `@RequireCapabilities` en el backend).
 * Así toda la web combina rol y modalidad en un único punto: `can()` del panel.
 */
const PERMISSION_CAPABILITY: Partial<Record<string, keyof OrgCapabilities>> = {
  [ORG_PERMISSIONS.eventsCreate]: "nativeEventCreate",
  [ORG_PERMISSIONS.eventsPublish]: "nativeEventCreate",
  [ORG_PERMISSIONS.eventsEdit]: "nativeEventManage",
  [ORG_PERMISSIONS.eventsCancel]: "nativeEventManage",
  [ORG_PERMISSIONS.eventsDelete]: "nativeEventManage",
  [ORG_PERMISSIONS.ticketTemplatesManage]: "nativeTicketing",
  [ORG_PERMISSIONS.paymentsManage]: "stripeConnect",
  [ORG_PERMISSIONS.accessRequestsManage]: "nativeInbox",
  [ORG_PERMISSIONS.statsView]: "nativeInsights",
  [ORG_PERMISSIONS.promotersManage]: "nativePromoters",
  [ORG_PERMISSIONS.promotersSettle]: "nativePromoterSettlement",
  [ORG_PERMISSIONS.accessControlView]: "nativeScanner",
};

/** Permiso del rol ∩ capacidad de la organización. ADMIN_SUPER no salta las capacidades. */
export function hasOrgAccess(
  permissions: readonly string[],
  capabilities: OrgCapabilities,
  permission: string,
): boolean {
  const allowed =
    permissions.includes(permission) || permissions.includes("admin:super");
  const capability = PERMISSION_CAPABILITY[permission];
  return allowed && (!capability || capabilities[capability]);
}

export type OrganizationProfile = OrgSummary & {
  bio: string | null;
  city: string | null;
  banner: string | null;
  socialLinks: Record<string, string> | null;
  createdAt: string;
};

export type OrganizationContext = {
  organization: OrganizationProfile;
  role: OrgRole;
  permissions: string[];
  commercialMode: CommercialMode;
  fourvenuesLinkStatus: string | null;
  capabilities: OrgCapabilities;
};

export type OrganizationOverview = {
  followersCount: number;
  membersCount: number;
  upcomingEvents: number;
  pastEvents: number;
  recentEvents: {
    id: string;
    name: string;
    date: string;
    location: string | null;
    coverImage: string | null;
    upcoming: boolean;
  }[];
};

export type OrgMember = {
  id: string;
  name: string;
  nickname: string | null;
  image: string | null;
  role: OrgRole;
};

export type OrgInvite = {
  id: string;
  roleKey: OrgRole;
  expiresAt: string;
  targetUser: {
    id: string;
    name: string;
    nickname: string | null;
    image: string | null;
  } | null;
  email: string | null;
};

export type PendingInvite = {
  id: string;
  roleKey: OrgRole;
  organization: { id: string; name: string; logo: string | null };
  inviter: { name: string } | null;
};

/** Mayor a menor: quién puede gestionar a quién (espejo de la regla del backend). */
const ROLE_RANK: Record<OrgRole, number> = {
  OWNER: 3,
  MANAGER: 2,
  STAFF: 1,
  PROMOTER: 1,
  SECURITY: 1,
};
// STAFF no se asigna (rol sin experiencia web ni móvil); el tipo lo conserva por datos antiguos.
export const ASSIGNABLE_ROLES: OrgRole[] = [
  "MANAGER",
  "PROMOTER",
  "SECURITY",
];
export const rolesAssignableBy = (actor: OrgRole): OrgRole[] =>
  ASSIGNABLE_ROLES.filter((r) => ROLE_RANK[r] < ROLE_RANK[actor]);
export const canManageRole = (actor: OrgRole, target: OrgRole) =>
  target !== "OWNER" && ROLE_RANK[target] < ROLE_RANK[actor];

// Misma regla que el backend (`CreateOrganizationDto`).
export const ORG_SLUG_REGEX = /^[a-z0-9](?:[a-z0-9._-]{1,28})[a-z0-9]$/;

export function normalizeOrgSlug(value: string): string {
  return value.trim().replace(/^@+/, "").toLowerCase();
}

/** Propone un identificador a partir del nombre comercial. */
export function slugFromName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30)
    .replace(/[-]+$/g, "");
}
