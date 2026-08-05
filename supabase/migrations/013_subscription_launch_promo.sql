-- Launch promo tracking on subscriptions (50% for N months, then full price via cron)

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS promo_active BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS promo_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS promo_full_amount DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS promo_converted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_subscriptions_promo_expire
  ON subscriptions (promo_ends_at)
  WHERE promo_active = TRUE AND status = 'active';

COMMENT ON COLUMN subscriptions.promo_active IS 'True while launch intro pricing is still billed via PayFast';
COMMENT ON COLUMN subscriptions.promo_ends_at IS 'When cron should switch PayFast recurring amount to promo_full_amount';
COMMENT ON COLUMN subscriptions.promo_full_amount IS 'Full monthly plan price (ZAR) to apply after promo';
COMMENT ON COLUMN subscriptions.promo_converted_at IS 'When promo was converted to full price';
