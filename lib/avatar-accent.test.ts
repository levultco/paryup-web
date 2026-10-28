import { describe, expect, test } from "bun:test";
import { accentFromRgba } from "./avatar-accent";

const solid = (r: number, g: number, b: number, a = 255, size = 24) =>
  Uint8Array.from({ length: size * size * 4 }, (_, i) => [r, g, b, a][i % 4]);

describe("color de acento del avatar", () => {
  test("una imagen roja da un rojo oscuro (luminosidad 0,36)", () => {
    const color = accentFromRgba(solid(220, 40, 40));
    expect(color).toMatch(/^#[0-9a-f]{6}$/);
    const [r, g, b] = [1, 3, 5].map((i) =>
      parseInt(color!.slice(i, i + 2), 16),
    );
    expect(r).toBeGreaterThan(g);
    expect(r).toBeGreaterThan(b);
    expect(r).toBeLessThan(180);
  });

  test("gana el tono dominante", () => {
    const mixed = solid(30, 90, 220); // azul
    for (let i = 0; i < 40; i++) {
      mixed[i * 4] = 220;
      mixed[i * 4 + 1] = 40;
      mixed[i * 4 + 2] = 40; // unos pocos píxeles rojos
    }
    const color = accentFromRgba(mixed)!;
    const [r, , b] = [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));
    expect(b).toBeGreaterThan(r);
  });

  test("grises, negro, blanco y transparente no dan color", () => {
    expect(accentFromRgba(solid(128, 128, 128))).toBeNull();
    expect(accentFromRgba(solid(5, 5, 5))).toBeNull();
    expect(accentFromRgba(solid(250, 250, 250))).toBeNull();
    expect(accentFromRgba(solid(220, 40, 40, 0))).toBeNull();
  });
});
