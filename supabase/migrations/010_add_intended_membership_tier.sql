-- A paid plan selected at registration is an intent only. The active
-- membership_tier changes after admin approval and successful PayFast payment.
ALTER TABLE businesses
  ADD COLUMN intended_membership_tier membership_tier NOT NULL DEFAULT 'free';

UPDATE businesses
SET intended_membership_tier = membership_tier
WHERE intended_membership_tier = 'free'
  AND membership_tier <> 'free';
