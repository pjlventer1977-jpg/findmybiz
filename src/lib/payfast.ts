import crypto from "crypto";

const PAYFAST_URL = process.env.PAYFAST_SANDBOX === "true"
  ? "https://sandbox.payfast.co.za/eng/process"
  : "https://www.payfast.co.za/eng/process";

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

/** Match PHP urlencode: spaces as +, lowercase hex (required by PayFast signature). */
function encodeValue(value: string): string {
  return encodeURIComponent(value.trim())
    .replace(/%20/g, "+")
    .replace(/%[0-9A-F]{2}/g, (match) => match.toLowerCase());
}

function getPayFastPassphrase(): string | undefined {
  const passphrase = process.env.PAYFAST_PASSPHRASE?.trim();
  return passphrase || undefined;
}

export function generatePayFastSignature(
  data: Record<string, string>,
  passphrase?: string
): string {
  const sortedKeys = Object.keys(data)
    .filter((key) => key !== "signature" && data[key] !== "")
    .sort();

  const paramString = sortedKeys
    .map((key) => `${key}=${encodeValue(data[key])}`)
    .join("&");

  const stringToHash = passphrase
    ? `${paramString}&passphrase=${encodeValue(passphrase)}`
    : paramString;

  return crypto.createHash("md5").update(stringToHash).digest("hex");
}

export function buildPayFastFormData(
  payment: Omit<PayFastPaymentData, "merchant_id" | "merchant_key" | "amount"> & {
    amount: number;
  }
): { action: string; fields: Record<string, string> } {
  const merchantId = process.env.PAYFAST_MERCHANT_ID!.trim();
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY!.trim();
  const passphrase = getPayFastPassphrase();

  const fields: Record<string, string> = {
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

  if (payment.name_first) fields.name_first = payment.name_first;
  if (payment.name_last) fields.name_last = payment.name_last;
  if (payment.item_description) fields.item_description = payment.item_description;
  if (payment.subscription_type) {
    fields.subscription_type = payment.subscription_type;
    if (payment.billing_date) fields.billing_date = payment.billing_date;
    if (payment.recurring_amount) fields.recurring_amount = payment.recurring_amount;
    if (payment.frequency) fields.frequency = payment.frequency;
    if (payment.cycles) fields.cycles = payment.cycles;
  }

  fields.signature = generatePayFastSignature(fields, passphrase);

  return { action: PAYFAST_URL, fields };
}

export function verifyPayFastITN(
  postData: Record<string, string>
): boolean {
  const receivedSignature = postData.signature;
  if (!receivedSignature) return false;

  const data = { ...postData };
  delete data.signature;

  const calculated = generatePayFastSignature(data, getPayFastPassphrase());

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
  return buildPayFastFormData({
    return_url: `${appUrl}/dashboard/billing?success=true`,
    cancel_url: `${appUrl}/dashboard/billing?cancelled=true`,
    notify_url: `${appUrl}/api/webhooks/payfast`,
    email_address: params.email,
    m_payment_id: params.paymentId,
    amount: params.amount,
    item_name: `Find My Biz ${params.tierName} Membership`,
    item_description: `Monthly subscription for ${params.tierName} tier`,
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
