# SMTP / Lead Email Setup

## Problem: emails not sending

Lead routing works (inbox shows leads) but emails fail when SMTP cannot connect.

### Root cause (common)

`mail.findmybiz.co.za` must point to your **cPanel mail server**, not Vercel.

Currently many setups have:
- `findmybiz.co.za` → Vercel (website) ✓
- `mail.findmybiz.co.za` → same Vercel IP ✗ (no mail server there)

SMTP to port 465/587 will **timeout** because Vercel does not run mail services.

## Fix DNS (recommended permanent fix)

In your **Zone Editor**, change:

| Record | Current (broken) | Fix |
|--------|------------------|-----|
| `mail.findmybiz.co.za` | CNAME → `findmybiz.co.za` (Vercel 75.2.60.5) | **A** → `102.208.231.6` |

Your cPanel mail lives at **102.208.231.6** (same as webmail, cpanel, ftp). The `mail` CNAME sends SMTP to Vercel by mistake.

After fixing, set `SMTP_HOST=mail.findmybiz.co.za` again.

## Immediate workaround (works now)

Connect directly to the cPanel IP with TLS servername:

```env
SMTP_HOST=102.208.231.6
SMTP_TLS_SERVERNAME=mail.findmybiz.co.za
SMTP_PORT=465
```

## Environment variables

```env
SMTP_HOST=mail.findmybiz.co.za
SMTP_PORT=465
SMTP_USER=leads@findmybiz.co.za
SMTP_PASSWORD=your-mailbox-password
SMTP_FROM_EMAIL=leads@findmybiz.co.za
SMTP_FROM_NAME=Find My Biz Leads
```

**Restart `npm run dev`** after changing `.env.local`.

## Test SMTP (admin only)

While logged in as admin:

- `GET /api/admin/email-test` — check connection + error details
- `POST /api/admin/email-test` — send test email to your admin account

Or run locally:

```bash
node scripts/test-smtp.js your@email.com
```

## Production (Vercel)

Vercel **blocks outbound SMTP** on many plans. Options:

1. Host the API on a VPS/cPanel Node server that allows SMTP
2. Use a transactional email API (Resend, SendGrid) with your domain verified
3. Use your host's SMTP relay via a serverless-friendly port if supported

For cPanel mail, deploying the Next.js app on the same cPanel host (or a VPS) is often the simplest path for SMTP.
