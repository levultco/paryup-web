import { describe, expect, test } from "bun:test";
import {
  NATIVE_ORG_CAPABILITIES,
  ORG_PERMISSIONS,
  ORG_SLUG_REGEX,
  hasOrgAccess,
  normalizeOrgSlug,
  slugFromName,
  type OrgCapabilities,
} from "./organizations";

describe("organizations", () => {
  test("slugFromName genera identificadores válidos", () => {
    expect(slugFromName("Club Ñandú & Co.")).toBe("club-nandu-co");
    expect(ORG_SLUG_REGEX.test(slugFromName("Sala Apolo"))).toBe(true);
    expect(slugFromName("A".repeat(60)).length).toBeLessThanOrEqual(30);
  });

  test("normalizeOrgSlug quita @ y mayúsculas", () => {
    expect(normalizeOrgSlug("  @Club.Uno ")).toBe("club.uno");
  });

  test("ORG_SLUG_REGEX rechaza identificadores inválidos", () => {
    for (const bad of ["ab", "-club", "club-", "club uno", "a".repeat(31)]) {
      expect(ORG_SLUG_REGEX.test(bad)).toBe(false);
    }
  });
});

describe("permiso ∩ capacidad (modalidad comercial)", () => {
  const fourvenues = Object.fromEntries(
    Object.keys(NATIVE_ORG_CAPABILITIES).map((k) => [k, false]),
  ) as OrgCapabilities;
  const owner = [
    ORG_PERMISSIONS.eventsCreate,
    ORG_PERMISSIONS.profileEdit,
    ORG_PERMISSIONS.promotersManage,
    ORG_PERMISSIONS.fourvenuesLinkManage,
  ];

  test("NATIVE: el permiso basta", () => {
    expect(hasOrgAccess(owner, NATIVE_ORG_CAPABILITIES, ORG_PERMISSIONS.eventsCreate)).toBe(true);
  });

  test("FOURVENUES: sin creación nativa ni promotores; perfil y vinculación sí", () => {
    expect(hasOrgAccess(owner, fourvenues, ORG_PERMISSIONS.eventsCreate)).toBe(false);
    expect(hasOrgAccess(owner, fourvenues, ORG_PERMISSIONS.promotersManage)).toBe(false);
    expect(hasOrgAccess(owner, fourvenues, ORG_PERMISSIONS.profileEdit)).toBe(true);
    expect(hasOrgAccess(owner, fourvenues, ORG_PERMISSIONS.fourvenuesLinkManage)).toBe(true);
  });

  test("ADMIN_SUPER no salta las capacidades", () => {
    expect(hasOrgAccess(["admin:super"], fourvenues, ORG_PERMISSIONS.eventsCreate)).toBe(false);
    expect(hasOrgAccess(["admin:super"], NATIVE_ORG_CAPABILITIES, ORG_PERMISSIONS.eventsCreate)).toBe(true);
  });
});
