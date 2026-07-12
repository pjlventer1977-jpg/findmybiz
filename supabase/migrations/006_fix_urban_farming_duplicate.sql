-- Production cleanup: duplicate "Urban Farming SA" registered under admin account.
-- Keeps: info@urbanfarmingsa.co.za (f9a7ec3b-2a58-4a1d-aad9-b6dfbdd8e804)
-- Removes: pjlventer@icloud.com duplicate (e4e2d3eb-9857-47a1-a8f0-745e9298d66f)

-- 1. Confirm both Urban Farming rows before delete
SELECT b.id, b.name, b.owner_id, p.email, b.created_at
FROM businesses b
JOIN profiles p ON p.id = b.owner_id
WHERE b.name ILIKE 'Urban Farming SA'
ORDER BY b.created_at;

-- 2. Delete only the duplicate owned by pjlventer@icloud.com (not the correct owner)
DELETE FROM businesses
WHERE owner_id = 'e4e2d3eb-9857-47a1-a8f0-745e9298d66f'
  AND name ILIKE 'Urban Farming SA'
  AND EXISTS (
    SELECT 1
    FROM businesses b2
    WHERE b2.owner_id = 'f9a7ec3b-2a58-4a1d-aad9-b6dfbdd8e804'
      AND b2.name ILIKE 'Urban Farming SA'
  );

-- 3. Restore correct profile roles
UPDATE profiles SET role = 'admin' WHERE email = 'pjlventer@icloud.com';
UPDATE profiles SET role = 'business_owner' WHERE email = 'info@urbanfarmingsa.co.za';

-- 4. Verification: businesses and owner emails for affected accounts
SELECT b.id, b.name, b.owner_id, p.email, p.role, b.created_at
FROM businesses b
JOIN profiles p ON p.id = b.owner_id
WHERE p.email IN ('pjlventer@icloud.com', 'info@urbanfarmingsa.co.za')
   OR b.name ILIKE 'Urban Farming SA'
ORDER BY p.email, b.created_at;
