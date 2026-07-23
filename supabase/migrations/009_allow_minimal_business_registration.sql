-- Initial business signup collects only owner contact details.
-- Location and category information are completed from the owner dashboard.
ALTER TABLE businesses
  ALTER COLUMN province_id DROP NOT NULL,
  ALTER COLUMN city_id DROP NOT NULL;
