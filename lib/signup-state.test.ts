import { describe, expect, it } from "bun:test";
import { isBasicProfileComplete, nextSignupStep } from "./signup-state";

describe("signup-state", () => {
  const at = "2026-01-01T00:00:00.000Z";
  it("perfil básico exige marca, nombre y usuario válidos", () => {
    expect(isBasicProfileComplete({ name: "Ana", nickname: "ana_1", basicProfileCompletedAt: at })).toBe(true);
    expect(isBasicProfileComplete({ name: "Ana", nickname: "ana_1", basicProfileCompletedAt: null })).toBe(false);
    expect(isBasicProfileComplete({ name: " ", nickname: "ana_1", basicProfileCompletedAt: at })).toBe(false);
    expect(isBasicProfileComplete({ name: "Ana", nickname: "a b", basicProfileCompletedAt: at })).toBe(false);
  });
  it("primero verifica el correo, después el perfil", () => {
    expect(nextSignupStep({ emailVerified: false, basicProfileComplete: false })).toBe("verify");
    expect(nextSignupStep({ emailVerified: true, basicProfileComplete: false })).toBe("profile");
    expect(nextSignupStep({ emailVerified: true, basicProfileComplete: true })).toBeNull();
  });
});
