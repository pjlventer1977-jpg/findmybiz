import crypto from "crypto";

const PAYFAST_URL = process.env.PAYFAST_SANDBOX === "true"
  ? "https://sandbox.payfast.co.za/eng/process"
  : "https://www.payfast.co.za/eng/process";

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

/** Match PHP urlencode(trim($val)) — PayFast requires + for spaces and uppercase hex. */
function encodeValue(value: string): string {
  const trimmed = value.trim();
  let encoded = "";

  for (const char of trimmed) {
    if (/[a-zA-Z0-9-_.]/.test(char)) {
      encoded += char;
    } else if (char === " ") {
      encoded += "+";
    } else {
      encoded += `%${char.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0")}`;
    }
  }

  return encoded;
}

function getPayFastPassphrase(): string | undefined {
  const passphrase = process.env.PAYFAST_PASSPHRASE?.trim();
  return passphrase || undefined;
}

export function generatePayFastSignature(
  data: Record<string, string>,
  passphrase?: string,
  fieldOrder: readonly string[] = PAYFAST_FIELD_ORDER
): string {
  const parts: string[] = [];

  for (const key of fieldOrder) {
    if (key === "signature") continue;
    const value = data[key];
    if (value !== undefined && value !== "") {
      parts.push(`${key}=${encodeValue(value)}`);
    }
  }

  let paramString = parts.join("&");

  if (passphrase) {
    paramString += `&passphrase=${encodeValue(passphrase)}`;
  }

  return crypto.createHash("md5").update(paramString).digest("hex");
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
  postData: Record<string, string>
): boolean {
  const receivedSignature = postData.signature;
  if (!receivedSignature) return false;

  const fieldOrder = Object.keys(postData);
  const signatureIndex = fieldOrder.indexOf("signature");
  const signedFieldOrder =
    signatureIndex === -1 ? fieldOrder : fieldOrder.slice(0, signatureIndex);

  const calculated = generatePayFastSignature(
    postData,
    getPayFastPassphrase(),
    signedFieldOrder
  );

  return calculated === receivedSignature;
}

export function createSubscriptionPayment(params: {
  businessId: string;
  email: string;
  tierName: string;
  amount: number;
  paymentId: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const tierLabel = params.tierName.charAt(0).toUpperCase() + params.tierName.slice(1);
  return buildPayFastFormData({
    return_url: `${appUrl}/dashboard/billing?success=true`,
    cancel_url: `${appUrl}/dashboard/billing?cancelled=true`,
    notify_url: `${appUrl}/api/webhooks/payfast`,
    email_address: params.email,
    m_payment_id: params.paymentId,
    amount: params.amount,
    item_name: `Find My Biz ${tierLabel} Membership`,
    item_description: `Monthly subscription for ${tierLabel} tier`,
    subscription_type: "1",
    billing_date: new Date().toISOString().split("T")[0],
    recurring_amount: params.amount.toFixed(2),
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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
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
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  return buildPayFastFormData({
    return_url: `${appUrl}/dashboard/events?success=true`,
    cancel_url: `${appUrl}/dashboard/events?cancelled=true`,
    notify_url: `${appUrl}/api/webhooks/payfast`,
    email_address: params.email,
    m_payment_id: params.paymentId,
    amount: params.amount,
    item_name: `Event Listing: ${params.eventName}`,
    item_description: "Find My Biz event listing (1 week)",
  });
}
