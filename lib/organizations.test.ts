import { describe, expect, test } from "bun:test";
import {
  ORG_SLUG_REGEX,
  normalizeOrgSlug,
  slugFromName,
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
