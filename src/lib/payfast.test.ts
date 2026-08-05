import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  amountsMatch,
  buildPayFastValidateParamString,
  generatePayFastSignature,
  merchantIdMatches,
  parsePayFastItnBody,
  verifyPayFastITN,
} from "./payfast";

describe("parsePayFastItnBody", () => {
  it("preserves field order and empty values", () => {
    const raw =
      "m_payment_id=abc&amount_gross=149.00&item_name=Test+Plan&custom_str1=&signature=deadbeef";
    const { data, fieldOrder } = parsePayFastItnBody(raw);

    expect(fieldOrder).toEqual([
      "m_payment_id",
      "amount_gross",
      "item_name",
      "custom_str1",
      "signature",
    ]);
    expect(data.item_name).toBe("Test Plan");
    expect(data.custom_str1).toBe("");
    expect(data.signature).toBe("deadbeef");
  });
});

describe("verifyPayFastITN", () => {
  const prevPassphrase = process.env.PAYFAST_PASSPHRASE;

  beforeEach(() => {
    process.env.PAYFAST_PASSPHRASE = "jt7NOE43FZPn";
  });

  afterEach(() => {
    if (prevPassphrase === undefined) {
      delete process.env.PAYFAST_PASSPHRASE;
    } else {
      process.env.PAYFAST_PASSPHRASE = prevPassphrase;
    }
  });

  it("validates signatures using posted order without trimming ITN values", () => {
    const data: Record<string, string> = {
      m_payment_id: "order-1",
      amount_gross: "149.00",
      item_name: " Starter ",
      custom_str1: "",
    };
    const fieldOrder = [
      "m_payment_id",
      "amount_gross",
      "item_name",
      "custom_str1",
    ];
    const signature = generatePayFastSignature(
      data,
      process.env.PAYFAST_PASSPHRASE,
      fieldOrder,
      { trimValues: false }
    );
    data.signature = signature;

    const result = verifyPayFastITN(data, [...fieldOrder, "signature"]);
    expect(result.valid).toBe(true);
    expect(result.passphraseConfigured).toBe(true);
  });

  it("rejects a tampered signature", () => {
    const data = {
      m_payment_id: "order-1",
      amount_gross: "149.00",
      signature: "00000000000000000000000000000000",
    };
    const result = verifyPayFastITN(data, [
      "m_payment_id",
      "amount_gross",
      "signature",
    ]);
    expect(result.valid).toBe(false);
  });
});

describe("amountsMatch / merchantIdMatches", () => {
  const prevMerchant = process.env.PAYFAST_MERCHANT_ID;

  beforeEach(() => {
    process.env.PAYFAST_MERCHANT_ID = "10000100";
  });

  afterEach(() => {
    if (prevMerchant === undefined) {
      delete process.env.PAYFAST_MERCHANT_ID;
    } else {
      process.env.PAYFAST_MERCHANT_ID = prevMerchant;
    }
  });

  it("matches amounts within one cent", () => {
    expect(amountsMatch(149, "149.00")).toBe(true);
    expect(amountsMatch(149, "149.005")).toBe(true);
    expect(amountsMatch(149, "150.00")).toBe(false);
  });

  it("matches merchant id from env", () => {
    expect(merchantIdMatches("10000100")).toBe(true);
    expect(merchantIdMatches("999")).toBe(false);
  });
});

describe("buildPayFastValidateParamString", () => {
  it("builds ordered param string without signature", () => {
    const data = {
      m_payment_id: "abc",
      amount_gross: "10.00",
      signature: "sig",
    };
    const param = buildPayFastValidateParamString(data, [
      "m_payment_id",
      "amount_gross",
      "signature",
    ]);
    expect(param).toBe("m_payment_id=abc&amount_gross=10.00");
    expect(param.includes("signature")).toBe(false);
  });
});
