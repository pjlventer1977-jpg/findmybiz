-- Test event: Afrikaans in die Wolke (Hoërskool Noordheuwel, 12 Sep 2026)
-- Deploy public/events/afrikaans-in-die-wolke.png first, then run in Supabase SQL Editor.

INSERT INTO events (
  name,
  slug,
  description,
  banner_url,
  event_date,
  end_date,
  venue,
  province_id,
  contact_phone,
  contact_email,
  category,
  ticket_link,
  status,
  is_paid,
  paid_until
)
SELECT
  'Afrikaans in die Wolke',
  'afrikaans-in-die-wolke-2026',
  'Afrikaans music festival at Hoërskool Noordheuwel. Featuring Bernice West, Bok van Blerk, Steve Hofmeyr, Snotkop, G-String, Early B, and Zaan Sonnekus. MC: Hamilton Wessels. R250 per person.',
  'https://www.findmybiz.co.za/events/afrikaans-in-die-wolke.png',
  '2026-09-12T10:00:00+02:00'::timestamptz,
  '2026-09-12T22:00:00+02:00'::timestamptz,
  'Hoërskool Noordheuwel',
  p.id,
  '011 954 1032',
  'bemarkings@noories.co.za',
  'Festival',
  'mailto:bemarkings@noories.co.za',
  'approved',
  true,
  NOW() + INTERVAL '4 weeks'
FROM provinces p
WHERE p.slug = 'gauteng'
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  banner_url = EXCLUDED.banner_url,
  event_date = EXCLUDED.event_date,
  end_date = EXCLUDED.end_date,
  venue = EXCLUDED.venue,
  province_id = EXCLUDED.province_id,
  contact_phone = EXCLUDED.contact_phone,
  contact_email = EXCLUDED.contact_email,
  category = EXCLUDED.category,
  ticket_link = EXCLUDED.ticket_link,
  status = EXCLUDED.status,
  is_paid = EXCLUDED.is_paid,
  paid_until = EXCLUDED.paid_until;
