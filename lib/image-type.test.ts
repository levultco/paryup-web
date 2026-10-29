import { describe, expect, test } from "bun:test";
import { sniffImageType } from "./image-type";

const webp = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50,
]);

describe("sniffImageType", () => {
  test("reconoce JPEG, PNG y WebP por su contenido", () => {
    expect(sniffImageType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe(
      "image/jpeg",
    );
    expect(sniffImageType(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d]))).toBe(
      "image/png",
    );
    expect(sniffImageType(webp)).toBe("image/webp");
  });

  test("rechaza lo demás (AVIF, HEIC, GIF, vacío)", () => {
    expect(sniffImageType(new Uint8Array([0x47, 0x49, 0x46, 0x38]))).toBeNull();
    expect(
      sniffImageType(
        new Uint8Array([
          0, 0, 0, 0x20, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66,
        ]),
      ),
    ).toBeNull();
    expect(sniffImageType(new Uint8Array())).toBeNull();
  });
});
