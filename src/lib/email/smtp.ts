import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

let transporter: Transporter | null = null;

function getSmtpConfig() {
  const host = process.env.SMTP_HOST ?? "mail.findmybiz.co.za";
  const port = Number(process.env.SMTP_PORT ?? 465);
  const user = process.env.SMTP_USER ?? "leads@findmybiz.co.za";
  const pass = process.env.SMTP_PASSWORD?.trim();

  if (!pass) {
    return null;
  }

  return { host, port, user, pass };
}

export function isSmtpConfigured(): boolean {
  return getSmtpConfig() !== null;
}

export function getMailTransporter(): Transporter | null {
  const config = getSmtpConfig();
  if (!config) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
      tls: {
        minVersion: "TLSv1.2",
        servername: process.env.SMTP_TLS_SERVERNAME ?? config.host,
      },
    });
  }

  return transporter;
}

export function resetMailTransporter(): void {
  transporter = null;
}

export function getFromAddress(): string {
  const name = process.env.SMTP_FROM_NAME ?? "Find My Biz Leads";
  const email = process.env.SMTP_FROM_EMAIL ?? process.env.SMTP_USER ?? "leads@findmybiz.co.za";
  return `"${name}" <${email}>`;
}

export async function verifySmtpConnection(): Promise<{
  ok: boolean;
  error?: string;
  host?: string;
  port?: number;
}> {
  const config = getSmtpConfig();
  if (!config) {
    return { ok: false, error: "SMTP_PASSWORD not set in environment" };
  }

  const transport = getMailTransporter();
  if (!transport) {
    return { ok: false, error: "Could not create mail transporter" };
  }

  try {
    await transport.verify();
    return { ok: true, host: config.host, port: config.port };
  } catch (error) {
    resetMailTransporter();
    const message = error instanceof Error ? error.message : "Unknown SMTP error";
    const hint =
      message.includes("ETIMEDOUT") || message.includes("ECONNREFUSED")
        ? ` Cannot reach ${config.host}:${config.port}. Ensure mail.${process.env.NEXT_PUBLIC_APP_NAME ? "yourdomain.co.za" : "findmybiz.co.za"} DNS A record points to your cPanel mail server IP, not Vercel.`
        : "";
    return {
      ok: false,
      error: message + hint,
      host: config.host,
      port: config.port,
    };
  }
}

