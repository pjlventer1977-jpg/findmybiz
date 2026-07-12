/**
 * SMTP diagnostic script — run: node scripts/test-smtp.js
 */
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

// Load .env.local
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .forEach((line) => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
    });
}

const config = {
  host: process.env.SMTP_HOST || "mail.findmybiz.co.za",
  port: Number(process.env.SMTP_PORT || 465),
  user: process.env.SMTP_USER || "leads@findmybiz.co.za",
  pass: process.env.SMTP_PASSWORD,
};

async function main() {
  console.log("SMTP config:", {
    host: config.host,
    port: config.port,
    user: config.user,
    pass: config.pass ? "***set***" : "***MISSING***",
  });

  if (!config.pass) {
    console.error("SMTP_PASSWORD not set");
    process.exit(1);
  }

  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: { user: config.user, pass: config.pass },
    tls: { minVersion: "TLSv1.2" },
  });

  try {
    console.log("\nVerifying connection...");
    await transport.verify();
    console.log("✓ SMTP connection OK");

    const testTo = process.argv[2] || config.user;
    console.log(`\nSending test email to ${testTo}...`);
    const info = await transport.sendMail({
      from: `"Find My Biz Leads" <${config.user}>`,
      to: testTo,
      subject: "Find My Biz SMTP Test",
      text: "If you receive this, SMTP is working correctly.",
      html: "<p>If you receive this, <strong>SMTP is working correctly</strong>.</p>",
    });

    console.log("✓ Email sent:", info.messageId);
    console.log("  Response:", info.response);
  } catch (err) {
    console.error("\n✗ SMTP error:", err.message);
    if (err.code) console.error("  Code:", err.code);
    if (err.response) console.error("  Server response:", err.response);
    process.exit(1);
  }
}

main();
