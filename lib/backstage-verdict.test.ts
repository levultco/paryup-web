import { describe, expect, it } from "bun:test";
import { decideBackstageAccess } from "./backstage-verdict";

const ready = { emailVerified: true, basicProfileComplete: true };
const none = { organizations: [], canCreateOrganization: false };

describe("decideBackstageAccess", () => {
  it("sin sesión: login", () => {
    expect(decideBackstageAccess({ user: null, mineOk: true, mine: none, invites: null, boot: null })).toBe("login");
  });
  it("registro incompleto: continuar el registro antes de nada", () => {
    expect(decideBackstageAccess({ user: { ...ready, emailVerified: false }, mineOk: true, mine: { organizations: [{}] }, invites: null, boot: null })).toBe("continue");
    expect(decideBackstageAccess({ user: { ...ready, basicProfileComplete: false }, mineOk: true, mine: { organizations: [{}] }, invites: null, boot: null })).toBe("continue");
  });
  it("usuario normal sin organización ni permiso: denegado", () => {
    expect(decideBackstageAccess({ user: ready, mineOk: true, mine: none, invites: { invites: [] }, boot: { user: { globalRole: "USER" } } })).toBe("denied");
  });
  it("con organización, permiso de creación, invitación o admin: acceso", () => {
    expect(decideBackstageAccess({ user: ready, mineOk: true, mine: { organizations: [{ id: "o" }] }, invites: null, boot: null })).toBe("ok");
    expect(decideBackstageAccess({ user: ready, mineOk: true, mine: { canCreateOrganization: true, organizations: [] }, invites: null, boot: null })).toBe("ok");
    expect(decideBackstageAccess({ user: ready, mineOk: true, mine: none, invites: { invites: [{}] }, boot: null })).toBe("ok");
    expect(decideBackstageAccess({ user: ready, mineOk: true, mine: none, invites: null, boot: { user: { globalRole: "ADMIN" } } })).toBe("ok");
  });
  it("si el backend falla, deniega (falla cerrado)", () => {
    expect(decideBackstageAccess({ user: ready, mineOk: false, mine: null, invites: null, boot: null })).toBe("denied");
  });
});
