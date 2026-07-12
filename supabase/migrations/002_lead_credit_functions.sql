-- Lead credit deduction function
CREATE OR REPLACE FUNCTION deduct_lead_credit(p_business_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance INT;
BEGIN
  SELECT balance INTO current_balance
  FROM lead_credits
  WHERE business_id = p_business_id
  FOR UPDATE;

  IF current_balance IS NULL OR current_balance <= 0 THEN
    RETURN FALSE;
  END IF;

  UPDATE lead_credits
  SET balance = balance - 1, updated_at = NOW()
  WHERE business_id = p_business_id;

  INSERT INTO lead_credit_transactions (business_id, amount, balance_after, transaction_type, description)
  VALUES (p_business_id, -1, current_balance - 1, 'lead_delivery', 'Lead delivered');

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
