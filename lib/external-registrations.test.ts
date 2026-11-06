import { describe, expect, test } from "bun:test";
import {
  bookingStateLabel,
  listStateLabel,
  visibleBookingQr,
  visibleListQr,
  type ExternalBooking,
  type ExternalListEntry,
} from "./external-registrations";

const list = (over: Partial<ExternalListEntry> = {}): ExternalListEntry => ({
  id: "1", state: "CONFIRMED", partySize: 2, qrCode: "QR", entered: false, createdAt: "", event: null, ...over,
});
const booking = (over: Partial<ExternalBooking> = {}): ExternalBooking => ({
  id: "1", outcome: "PENDING", quantity: 4, qrCode: "QR", createdAt: "", event: null, ...over,
});

describe("historial de Fourvenues (web)", () => {
  test("el estado de la reserva lo decide el local y una respuesta dudosa no se presenta como confirmada", () => {
    expect(bookingStateLabel("ACCEPTED", "es")).toBe("Aceptada por el local");
    expect(bookingStateLabel("REJECTED", "en")).toBe("Declined by the venue");
    expect(bookingStateLabel("UNCONFIRMED", "es")).toContain("Pendiente de confirmar");
    expect(listStateLabel(list({ state: "UNKNOWN" }), "es")).toContain("Pendiente de confirmar");
    expect(listStateLabel(list({ entered: true }), "en")).toBe("You've checked in");
  });

  test("el QR solo se enseña si lo devuelve Fourvenues y la inscripción/reserva lo permite", () => {
    expect(visibleListQr(list())).toBe("QR");
    expect(visibleListQr(list({ state: "UNKNOWN" }))).toBeNull();
    expect(visibleListQr(list({ qrCode: null }))).toBeNull();
    expect(visibleBookingQr(booking())).toBeNull();
    expect(visibleBookingQr(booking({ outcome: "ACCEPTED" }))).toBe("QR");
    expect(visibleBookingQr(booking({ outcome: "REJECTED" }))).toBeNull();
  });
});
