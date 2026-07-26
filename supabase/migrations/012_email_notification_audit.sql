CREATE TABLE email_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed')),
  error_message TEXT,
  attempted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_email_notifications_business_created
  ON email_notifications(business_id, created_at DESC);

ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage email notification audit"
  ON email_notifications
  FOR ALL
  USING (is_admin());
