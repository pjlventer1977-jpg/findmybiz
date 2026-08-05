import crypto from "crypto";
import { getCanonicalAppUrl } from "@/lib/app-url";

const PAYFAST_URL =
  process.env.PAYFAST_SANDBOX === "true"
    ? "https://sandbox.payfast.co.za/eng/process"
    : "https://www.payfast.co.za/eng/process";

const PAYFAST_VALIDATE_HOST =
  process.env.PAYFAST_SANDBOX === "true"
    ? "sandbox.payfast.co.za"
    : "www.payfast.co.za";

/** PayFast custom integration field order (NOT alphabetical). See developers.payfast.co.za docs Step 2. */
const PAYFAST_FIELD_ORDER = [
  "merchant_id",
  "merchant_key",
  "return_url",
  "cancel_url",
  "notify_url",
  "fica_idnumber",
  "name_first",
  "name_last",
  "email_address",
  "cell_number",
  "m_payment_id",
  "amount",
  "item_name",
  "item_description",
  "custom_int1",
  "custom_int2",
  "custom_int3",
  "custom_int4",
  "custom_int5",
  "custom_str1",
  "custom_str2",
  "custom_str3",
  "custom_str4",
  "custom_str5",
  "email_confirmation",
  "confirmation_address",
  "payment_method",
  "subscription_type",
  "billing_date",
  "recurring_amount",
  "frequency",
  "cycles",
  "subscription_notify_email",
  "subscription_notify_webhook",
  "subscription_notify_buyer",
] as const;

export interface PayFastPaymentData {
  merchant_id: string;
  merchant_key: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  name_first?: string;
  name_last?: string;
  email_address: string;
  m_payment_id: string;
  amount: string;
  item_name: string;
  item_description?: string;
  subscription_type?: "1" | "2";
  billing_date?: string;
  recurring_amount?: string;
  frequency?: "3" | "4" | "5" | "6";
  cycles?: string;
}

export interface PayFastItnVerifyResult {
  valid: boolean;
  calculated: string;
  received: string;
  passphraseConfigured: boolean;
}

/**
 * Match PHP urlencode() — PayFast requires + for spaces and uppercase hex.
 * Non-ASCII characters must be encoded as UTF-8 bytes (not Unicode code points).
 * Checkout signatures trim values; ITN verification must not trim.
 */
function encodeValue(value: string, { trim = true }: { trim?: boolean } = {}): string {
  const input = trim ? value.trim() : value;
  let encoded = "";

  for (const char of input) {
    if (/[a-zA-Z0-9-_.]/.test(char)) {
      encoded += char;
    } else if (char === " ") {
      encoded += "+";
    } else {
      for (const byte of new TextEncoder().encode(char)) {
        encoded += `%${byte.toString(16).toUpperCase().padStart(2, "0")}`;
      }
    }
  }

  return encoded;
}

function getPayFastPassphrase(): string | undefined {
  const passphrase = process.env.PAYFAST_PASSPHRASE?.trim();
  return passphrase || undefined;
}

export function getPayFastMerchantId(): string | undefined {
  return process.env.PAYFAST_MERCHANT_ID?.trim() || undefined;
}

/**
 * Parse a PayFast ITN application/x-www-form-urlencoded body while preserving
 * posted field order and empty values (required for signature verification).
 */
export function parsePayFastItnBody(rawBody: string): {
  data: Record<string, string>;
  fieldOrder: string[];
} {
  const data: Record<string, string> = {};
  const fieldOrder: string[] = [];

  if (!rawBody) {
    return { data, fieldOrder };
  }

  for (const part of rawBody.split("&")) {
    if (!part) continue;
    const eq = part.indexOf("=");
    const rawKey = eq === -1 ? part : part.slice(0, eq);
    const rawVal = eq === -1 ? "" : part.slice(eq + 1);
    const key = decodeURIComponent(rawKey.replace(/\+/g, " "));
    const value = decodeURIComponent(rawVal.replace(/\+/g, " "));
    if (!(key in data)) {
      fieldOrder.push(key);
    }
    data[key] = value;
  }

  return { data, fieldOrder };
}

export function generatePayFastSignature(
  data: Record<string, string>,
  passphrase?: string,
  fieldOrder: readonly string[] = PAYFAST_FIELD_ORDER,
  options: { trimValues?: boolean } = {}
): string {
  const trimValues = options.trimValues !== false;
  const parts: string[] = [];

  for (const key of fieldOrder) {
    if (key === "signature") continue;
    if (!(key in data)) continue;
    const value = data[key];
    // Checkout: skip empty. ITN: include empty fields in posted order.
    if (trimValues && (value === undefined || value === "")) continue;
    if (value === undefined) continue;
    parts.push(`${key}=${encodeValue(value, { trim: trimValues })}`);
  }

  let paramString = parts.join("&");

  if (passphrase) {
    paramString += `&passphrase=${encodeValue(passphrase, { trim: true })}`;
  }

  return crypto.createHash("md5").update(paramString).digest("hex");
}

/** Build the param string PayFast expects for eng/query/validate (excludes signature). */
export function buildPayFastValidateParamString(
  postData: Record<string, string>,
  fieldOrder: readonly string[]
): string {
  const parts: string[] = [];
  for (const key of fieldOrder) {
    if (key === "signature") continue;
    if (!(key in postData)) continue;
    parts.push(`${key}=${encodeValue(postData[key], { trim: false })}`);
  }
  return parts.join("&");
}

function orderFields(fields: Record<string, string>): Record<string, string> {
  const ordered: Record<string, string> = {};
  for (const key of PAYFAST_FIELD_ORDER) {
    if (fields[key] !== undefined && fields[key] !== "") {
      ordered[key] = fields[key];
    }
  }
  if (fields.signature) {
    ordered.signature = fields.signature;
  }
  return ordered;
}

export function buildPayFastFormData(
  payment: Omit<PayFastPaymentData, "merchant_id" | "merchant_key" | "amount"> & {
    amount: number;
  }
): { action: string; fields: Record<string, string> } {
  const merchantId = process.env.PAYFAST_MERCHANT_ID!.trim();
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY!.trim();
  const passphrase = getPayFastPassphrase();

  const rawFields: Record<string, string> = {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    return_url: payment.return_url,
    cancel_url: payment.cancel_url,
    notify_url: payment.notify_url,
    email_address: payment.email_address,
    m_payment_id: payment.m_payment_id,
    amount: payment.amount.toFixed(2),
    item_name: payment.item_name,
  };

  if (payment.name_first) rawFields.name_first = payment.name_first;
  if (payment.name_last) rawFields.name_last = payment.name_last;
  if (payment.item_description) rawFields.item_description = payment.item_description;
  if (payment.subscription_type) {
    rawFields.subscription_type = payment.subscription_type;
    if (payment.billing_date) rawFields.billing_date = payment.billing_date;
    if (payment.recurring_amount) rawFields.recurring_amount = payment.recurring_amount;
    if (payment.frequency) rawFields.frequency = payment.frequency;
    if (payment.cycles !== undefined) rawFields.cycles = payment.cycles;
  }

  rawFields.signature = generatePayFastSignature(rawFields, passphrase);

  return { action: PAYFAST_URL, fields: orderFields(rawFields) };
}

export function verifyPayFastITN(
  postData: Record<string, string>,
  fieldOrder?: readonly string[]
): PayFastItnVerifyResult {
  const received = postData.signature ?? "";
  const passphraseConfigured = Boolean(getPayFastPassphrase());

  if (!received) {
    return { valid: false, calculated: "", received, passphraseConfigured };
  }

  const order =
    fieldOrder && fieldOrder.length > 0
      ? fieldOrder.filter((k) => k !== "signature")
      : (() => {
          const keys = Object.keys(postData);
          const signatureIndex = keys.indexOf("signature");
          return signatureIndex === -1 ? keys : keys.slice(0, signatureIndex);
        })();

  const calculated = generatePayFastSignature(
    postData,
    getPayFastPassphrase(),
    order,
    { trimValues: false }
  );

  return {
    valid: calculated === received,
    calculated,
    received,
    passphraseConfigured,
  };
}

export function amountsMatch(
  expected: number,
  amountGross: string | undefined,
  tolerance = 0.01
): boolean {
  if (amountGross === undefined || amountGross === "") return false;
  const received = Number(amountGross);
  if (Number.isNaN(received)) return false;
  return Math.abs(received - expected) <= tolerance;
}

export function merchantIdMatches(postedMerchantId: string | undefined): boolean {
  const expected = getPayFastMerchantId();
  if (!expected || !postedMerchantId) return false;
  return postedMerchantId.trim() === expected;
}

/**
 * Confirm ITN with PayFast's validate endpoint. Returns true only when body is VALID.
 */
export async function confirmPayFastServer(
  postData: Record<string, string>,
  fieldOrder: readonly string[],
  fetchImpl: typeof fetch = fetch
): Promise<boolean> {
  const paramString = buildPayFastValidateParamString(postData, fieldOrder);
  const url = `https://${PAYFAST_VALIDATE_HOST}/eng/query/validate`;

  try {
    const response = await fetchImpl(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: paramString,
    });
    const text = (await response.text()).trim();
    return text === "VALID";
  } catch (error) {
    console.error("PayFast server confirmation failed:", error);
    return false;
  }
}

function buildApiSignature(params: Record<string, string>): string {
  const passphrase = getPayFastPassphrase() ?? "";
  const withPassphrase: Record<string, string> = { ...params, passphrase };
  const parts: string[] = [];
  for (const key of Object.keys(withPassphrase).sort()) {
    if (key === "signature") continue;
    const value = withPassphrase[key];
    if (value === undefined || value === "") continue;
    parts.push(`${key}=${encodeValue(value, { trim: true })}`);
  }
  return crypto.createHash("md5").update(parts.join("&")).digest("hex");
}

/**
 * PayFast API auth headers. Include any non-empty body/query fields in
 * `extraParams` so they are part of the alphabetical signature (required for
 * PATCH update amount, etc.). Do not include `testing`.
 */
export function createPayFastApiHeaders(
  extraParams: Record<string, string> = {}
): Record<string, string> {
  const merchantId = getPayFastMerchantId()!;
  // PayFast expects ISO-8601 without milliseconds
  const timestamp = new Date().toISOString().split(".")[0];
  const version = "v1";
  const signature = buildApiSignature({
    "merchant-id": merchantId,
    timestamp,
    version,
    ...extraParams,
  });

  return {
    "merchant-id": merchantId,
    version,
    timestamp,
    signature,
    "Content-Type": "application/json",
  };
}

export async function cancelPayFastSubscription(
  token: string,
  fetchImpl: typeof fetch = fetch
): Promise<{ success: boolean; error?: string }> {
  if (!token) {
    return { success: false, error: "Missing subscription token" };
  }
  if (!getPayFastMerchantId() || !process.env.PAYFAST_MERCHANT_KEY) {
    return { success: false, error: "Payment gateway is not configured" };
  }

  const testing = process.env.PAYFAST_SANDBOX === "true" ? "?testing=true" : "";
  const url = `https://api.payfast.co.za/subscriptions/${encodeURIComponent(token)}/cancel${testing}`;

  try {
    const response = await fetchImpl(url, {
      method: "PUT",
      headers: createPayFastApiHeaders(),
    });
    if (!response.ok) {
      const body = await response.text();
      console.error("PayFast cancel failed:", response.status, body);
      return {
        success: false,
        error: `PayFast cancel failed (${response.status})`,
      };
    }
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("PayFast cancel request error:", message);
    return { success: false, error: message };
  }
}

/**
 * Update recurring subscription amount (ZAR → cents for PayFast API).
 * Used to convert launch promo pricing to full price after promo_ends_at.
 */
export async function updatePayFastSubscriptionAmount(
  token: string,
  amountZar: number,
  fetchImpl: typeof fetch = fetch
): Promise<{ success: boolean; error?: string }> {
  if (!token) {
    return { success: false, error: "Missing subscription token" };
  }
  if (!getPayFastMerchantId() || !process.env.PAYFAST_MERCHANT_KEY) {
    return { success: false, error: "Payment gateway is not configured" };
  }
  if (!Number.isFinite(amountZar) || amountZar <= 0) {
    return { success: false, error: "Invalid subscription amount" };
  }

  const amountCents = Math.round(amountZar * 100);
  const testing = process.env.PAYFAST_SANDBOX === "true" ? "?testing=true" : "";
  const url = `https://api.payfast.co.za/subscriptions/${encodeURIComponent(token)}/update${testing}`;
  const amountParam = String(amountCents);

  try {
    const response = await fetchImpl(url, {
      method: "PATCH",
      headers: createPayFastApiHeaders({ amount: amountParam }),
      body: JSON.stringify({ amount: amountCents }),
    });
    if (!response.ok) {
      const body = await response.text();
      console.error("PayFast subscription update failed:", response.status, body);
      const detail = body.trim().slice(0, 300);
      return {
        success: false,
        error: detail
          ? `PayFast update failed (${response.status}): ${detail}`
          : `PayFast update failed (${response.status})`,
      };
    }
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("PayFast subscription update error:", message);
    return { success: false, error: message };
  }
}

export function createSubscriptionPayment(params: {
  businessId: string;
  email: string;
  tierName: string;
  amount: number;
  paymentId: string;
  /** Recurring amount; defaults to amount when omitted. */
  recurringAmount?: number;
  itemDescription?: string;
}) {
  // Must use www (non-redirecting) host — PayFast ITN does not follow 308 redirects.
  const appUrl = getCanonicalAppUrl();
  const tierLabel = params.tierName.charAt(0).toUpperCase() + params.tierName.slice(1);
  const recurring = params.recurringAmount ?? params.amount;
  return buildPayFastFormData({
    return_url: `${appUrl}/dashboard/billing?success=true`,
    cancel_url: `${appUrl}/dashboard/billing?cancelled=true`,
    notify_url: `${appUrl}/api/webhooks/payfast`,
    email_address: params.email,
    m_payment_id: params.paymentId,
    amount: params.amount,
    item_name: `Find My Biz ${tierLabel} Membership`,
    item_description:
      params.itemDescription ?? `Monthly subscription for ${tierLabel} tier`,
    subscription_type: "1",
    billing_date: new Date().toISOString().split("T")[0],
    recurring_amount: recurring.toFixed(2),
    frequency: "3",
    cycles: "0",
  });
}

export function createCreditPackPayment(params: {
  email: string;
  credits: number;
  amount: number;
  paymentId: string;
}) {
  const appUrl = getCanonicalAppUrl();
  return buildPayFastFormData({
    return_url: `${appUrl}/dashboard/billing?success=credits`,
    cancel_url: `${appUrl}/dashboard/billing?cancelled=true`,
    notify_url: `${appUrl}/api/webhooks/payfast`,
    email_address: params.email,
    m_payment_id: params.paymentId,
    amount: params.amount,
    item_name: `${params.credits} Lead Credits`,
    item_description: "Find My Biz lead credit pack",
  });
}

export function createEventPayment(params: {
  email: string;
  eventName: string;
  amount: number;
  paymentId: string;
  durationWeeks: number;
}) {
  const appUrl = getCanonicalAppUrl();
  return buildPayFastFormData({
    return_url: `${appUrl}/events/list/success`,
    cancel_url: `${appUrl}/events/list?cancelled=true`,
    notify_url: `${appUrl}/api/webhooks/payfast`,
    email_address: params.email,
    m_payment_id: params.paymentId,
    amount: params.amount,
    item_name: `Event Listing: ${params.eventName}`,
    item_description: `Find My Biz event advert (${params.durationWeeks} week${params.durationWeeks === 1 ? "" : "s"})`,
  });
}
