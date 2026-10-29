import { describe, expect, test } from "bun:test";
import {
  emptyTable,
  stripEmails,
  tablePayload,
  validateTable,
} from "./reserved";

describe("validateTable", () => {
  test("mesa vacía pide nombre", () => {
    expect(validateTable(emptyTable()).name).toBe("name");
  });

  test("los pagos exigen gasto mínimo y valores coherentes", () => {
    const base = { ...emptyTable(), name: "Mesa" };
    expect(
      validateTable({
        ...base,
        paymentMode: "FULL_PAYMENT",
        minSpendAmount: "0",
      }).minSpendAmount,
    ).toBe("minSpendRequired");
    expect(
      validateTable({
        ...base,
        paymentMode: "FIXED_DEPOSIT",
        minSpendAmount: "100",
        fixedDepositAmount: "150",
      }).fixedDepositAmount,
    ).toBe("fixedMax");
    expect(
      validateTable({
        ...base,
        paymentMode: "PERCENT_DEPOSIT",
        minSpendAmount: "100",
        depositPercent: "101",
      }).depositPercent,
    ).toBe("percent");
    expect(
      validateTable({
        ...base,
        paymentMode: "PERCENT_DEPOSIT",
        minSpendAmount: "100",
        depositPercent: "30",
      }),
    ).toEqual({});
  });

  test("hora de llegada con formato HH:mm", () => {
    expect(
      validateTable({
        ...emptyTable(),
        name: "M",
        arrivalDeadlineTime: "25:00",
      }).arrivalDeadlineTime,
    ).toBe("time");
  });
});

describe("tablePayload", () => {
  test("solo envía el importe que corresponde al modo de pago", () => {
    const p = tablePayload(
      {
        ...emptyTable(),
        name: " Mesa ",
        paymentMode: "PERCENT_DEPOSIT",
        minSpendAmount: "200",
        depositPercent: "25",
        fixedDepositAmount: "10",
      },
      "t1",
    );
    expect(p).toMatchObject({
      id: "t1",
      name: "Mesa",
      depositPercent: 25,
      fixedDepositAmount: null,
      minSpendAmount: 200,
    });
  });
});

describe("stripEmails", () => {
  test("elimina emails anidados", () => {
    expect(
      stripEmails({
        entries: [
          {
            user: { name: "A", email: "a@x.com" },
            contactEmail: "b@x.com",
            partySize: 2,
          },
        ],
      }),
    ).toEqual({
      entries: [{ user: { name: "A" }, partySize: 2 }],
    });
  });
});
