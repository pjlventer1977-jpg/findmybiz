import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  amountsMatch,
  buildPayFastFormData,
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

describe("buildPayFastFormData subscription signatures", () => {
  const prevEnv = {
    merchantId: process.env.PAYFAST_MERCHANT_ID,
    merchantKey: process.env.PAYFAST_MERCHANT_KEY,
    passphrase: process.env.PAYFAST_PASSPHRASE,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    sandbox: process.env.PAYFAST_SANDBOX,
  };

  beforeEach(() => {
    process.env.PAYFAST_MERCHANT_ID = "10000100";
    process.env.PAYFAST_MERCHANT_KEY = "46f0cd694581a";
    process.env.PAYFAST_PASSPHRASE = "jt7NOE43FZPn";
    process.env.NEXT_PUBLIC_APP_URL = "https://findmybiz.co.za";
    process.env.PAYFAST_SANDBOX = "true";
  });

  afterEach(() => {
    for (const [key, value] of Object.entries(prevEnv)) {
      const envKey =
        key === "merchantId"
          ? "PAYFAST_MERCHANT_ID"
          : key === "merchantKey"
            ? "PAYFAST_MERCHANT_KEY"
            : key === "passphrase"
              ? "PAYFAST_PASSPHRASE"
              : key === "appUrl"
                ? "NEXT_PUBLIC_APP_URL"
                : "PAYFAST_SANDBOX";
      if (value === undefined) delete process.env[envKey];
      else process.env[envKey] = value;
    }
  });

  it("UTF-8 encodes em dashes in promo item_description for PayFast", () => {
    const promoDescription =
      "Launch special — 50% off for 3 months. Then 149.50/mo.";
    const { fields } = buildPayFastFormData({
      return_url: "https://findmybiz.co.za/dashboard/billing?success=true",
      cancel_url: "https://findmybiz.co.za/dashboard/billing?cancelled=true",
      notify_url: "https://findmybiz.co.za/api/webhooks/payfast",
      email_address: "owner@example.com",
      m_payment_id: "payment-123",
      amount: 74.5,
      item_name: "Find My Biz Starter Membership",
      item_description: promoDescription,
      subscription_type: "1",
      billing_date: "2026-08-05",
      recurring_amount: "74.50",
      frequency: "3",
      cycles: "0",
    });

    expect(fields.item_description).toBe(promoDescription);
    expect(fields.signature).toMatch(/^[a-f0-9]{32}$/);

    // PHP urlencode uses UTF-8 bytes for em dash (%E2%80%94), not %2014.
    expect(
      generatePayFastSignature(
        { item_description: "Launch special — 50% off" },
        process.env.PAYFAST_PASSPHRASE,
        ["item_description"]
      )
    ).toBe("69b16d08fdd046bef37861aa518c5a5d");
  });
});
