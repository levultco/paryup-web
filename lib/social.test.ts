import { describe, expect, test } from "bun:test";
import { buildSocialUrl, resolveBadge, socialLinksOf } from "./social";

describe("redes", () => {
  test("un usuario se convierte en la URL de su plataforma", () => {
    expect(buildSocialUrl("instagram", "@deiividd")).toBe(
      "https://instagram.com/deiividd",
    );
    expect(buildSocialUrl("tiktok", "deiividd")).toBe(
      "https://www.tiktok.com/@deiividd",
    );
    expect(buildSocialUrl("snapchat", "deiividd")).toBe(
      "https://www.snapchat.com/add/deiividd",
    );
    expect(buildSocialUrl("soundcloud", "dj")).toBe(
      "https://soundcloud.com/dj",
    );
    expect(buildSocialUrl("spotify", "123")).toBe(
      "https://open.spotify.com/user/123",
    );
    expect(buildSocialUrl("twitter", "@x")).toBe("https://twitter.com/x");
  });

  test("las URLs completas se respetan y las webs sin protocolo lo reciben", () => {
    expect(buildSocialUrl("instagram", "https://instagram.com/a")).toBe(
      "https://instagram.com/a",
    );
    expect(buildSocialUrl("website", "paryup.com")).toBe("https://paryup.com");
    expect(buildSocialUrl("spotify", "open.spotify.com/playlist/1")).toBe(
      "https://open.spotify.com/playlist/1",
    );
    expect(buildSocialUrl("website", "")).toBe("");
    expect(buildSocialUrl("website", null)).toBe("");
  });

  test("devuelve solo plataformas con valor, en el orden de la app", () => {
    const links = socialLinksOf({
      instagram: "yo",
      website: "paryup.com",
      youtube: "x",
    });
    expect(links.map((l) => l.id)).toEqual(["website", "instagram"]);
    expect(links[1].href).toBe("https://instagram.com/yo");
  });

  test("descarta protocolos que no sean http(s)", () => {
    expect(socialLinksOf({ website: "javascript:alert(1)" })).toEqual([]);
  });

  test("insignia: dorada gana a azul y pro caduca", () => {
    const now = new Date("2026-10-27T12:00:00Z");
    expect(resolveBadge({ isVerified: true, isPro: true }, now)).toBe(
      "verified",
    );
    expect(resolveBadge({ isPro: true }, now)).toBe("pro");
    expect(resolveBadge({ proExpiresAt: "2026-12-01T00:00:00Z" }, now)).toBe(
      "pro",
    );
    expect(
      resolveBadge({ proExpiresAt: "2026-01-01T00:00:00Z" }, now),
    ).toBeNull();
    expect(resolveBadge(null, now)).toBeNull();
  });
});
