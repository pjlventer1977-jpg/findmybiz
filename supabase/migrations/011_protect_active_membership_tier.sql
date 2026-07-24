-- Active membership is a paid entitlement. Owners may update their profile, but
-- may not promote membership_tier directly; service-role webhook/admin updates remain allowed.
CREATE OR REPLACE FUNCTION prevent_owner_membership_tier_change()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.role() = 'authenticated'
    AND NEW.membership_tier IS DISTINCT FROM OLD.membership_tier THEN
    RAISE EXCEPTION 'Active membership can only be changed after payment.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_owner_membership_tier_change ON businesses;

CREATE TRIGGER prevent_owner_membership_tier_change
  BEFORE UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION prevent_owner_membership_tier_change();
