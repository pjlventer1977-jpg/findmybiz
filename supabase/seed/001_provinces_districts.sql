-- Seed: 9 South African Provinces
INSERT INTO provinces (name, slug, code) VALUES
  ('Gauteng', 'gauteng', 'GP'),
  ('Western Cape', 'western-cape', 'WC'),
  ('KwaZulu-Natal', 'kwazulu-natal', 'KZN'),
  ('Eastern Cape', 'eastern-cape', 'EC'),
  ('Northern Cape', 'northern-cape', 'NC'),
  ('Free State', 'free-state', 'FS'),
  ('Limpopo', 'limpopo', 'LP'),
  ('Mpumalanga', 'mpumalanga', 'MP'),
  ('North West', 'north-west', 'NW');

-- District Municipalities (52 total)
-- Gauteng (3 metros + 2 districts)
INSERT INTO districts (province_id, name, slug, code)
SELECT p.id, d.name, d.slug, d.code FROM provinces p,
(VALUES
  ('City of Johannesburg Metropolitan Municipality', 'city-of-johannesburg', 'JHB'),
  ('City of Tshwane Metropolitan Municipality', 'city-of-tshwane', 'TSH'),
  ('Ekurhuleni Metropolitan Municipality', 'ekurhuleni', 'EKU'),
  ('Sedibeng District Municipality', 'sedibeng', 'DC42'),
  ('West Rand District Municipality', 'west-rand', 'DC48')
) AS d(name, slug, code) WHERE p.slug = 'gauteng';

-- Western Cape (1 metro + 5 districts)
INSERT INTO districts (province_id, name, slug, code)
SELECT p.id, d.name, d.slug, d.code FROM provinces p,
(VALUES
  ('City of Cape Town Metropolitan Municipality', 'city-of-cape-town', 'CPT'),
  ('Cape Winelands District Municipality', 'cape-winelands', 'DC2'),
  ('Central Karoo District Municipality', 'central-karoo', 'DC5'),
  ('Garden Route District Municipality', 'garden-route', 'DC4'),
  ('Overberg District Municipality', 'overberg', 'DC3'),
  ('West Coast District Municipality', 'west-coast', 'DC1')
) AS d(name, slug, code) WHERE p.slug = 'western-cape';

-- KwaZulu-Natal (1 metro + 10 districts)
INSERT INTO districts (province_id, name, slug, code)
SELECT p.id, d.name, d.slug, d.code FROM provinces p,
(VALUES
  ('eThekwini Metropolitan Municipality', 'ethekwini', 'ETH'),
  ('Amajuba District Municipality', 'amajuba', 'DC25'),
  ('Harry Gwala District Municipality', 'harry-gwala', 'DC43'),
  ('iLembe District Municipality', 'ilembe', 'DC29'),
  ('King Cetshwayo District Municipality', 'king-cetshwayo', 'DC28'),
  ('Ugu District Municipality', 'ugu', 'DC21'),
  ('uMgungundlovu District Municipality', 'umgungundlovu', 'DC22'),
  ('uMkhanyakude District Municipality', 'umkhanyakude', 'DC27'),
  ('uMzinyathi District Municipality', 'umzinyathi', 'DC24'),
  ('uThukela District Municipality', 'uthukela', 'DC23'),
  ('Zululand District Municipality', 'zululand', 'DC26')
) AS d(name, slug, code) WHERE p.slug = 'kwazulu-natal';

-- Eastern Cape (2 metros + 6 districts)
INSERT INTO districts (province_id, name, slug, code)
SELECT p.id, d.name, d.slug, d.code FROM provinces p,
(VALUES
  ('Buffalo City Metropolitan Municipality', 'buffalo-city', 'BUF'),
  ('Nelson Mandela Bay Metropolitan Municipality', 'nelson-mandela-bay', 'NMA'),
  ('Alfred Nzo District Municipality', 'alfred-nzo', 'DC44'),
  ('Amathole District Municipality', 'amathole', 'DC12'),
  ('Chris Hani District Municipality', 'chris-hani', 'DC13'),
  ('Joe Gqabi District Municipality', 'joe-gqabi', 'DC14'),
  ('OR Tambo District Municipality', 'or-tambo', 'DC15'),
  ('Sarah Baartman District Municipality', 'sarah-baartman', 'DC10')
) AS d(name, slug, code) WHERE p.slug = 'eastern-cape';

-- Northern Cape (5 districts)
INSERT INTO districts (province_id, name, slug, code)
SELECT p.id, d.name, d.slug, d.code FROM provinces p,
(VALUES
  ('Frances Baard District Municipality', 'frances-baard', 'DC9'),
  ('John Taolo Gaetsewe District Municipality', 'john-taolo-gaetsewe', 'DC45'),
  ('Namakwa District Municipality', 'namakwa', 'DC6'),
  ('Pixley ka Seme District Municipality', 'pixley-ka-seme', 'DC7'),
  ('ZF Mgcawu District Municipality', 'zf-mgcawu', 'DC8')
) AS d(name, slug, code) WHERE p.slug = 'northern-cape';

-- Free State (1 metro + 4 districts)
INSERT INTO districts (province_id, name, slug, code)
SELECT p.id, d.name, d.slug, d.code FROM provinces p,
(VALUES
  ('Mangaung Metropolitan Municipality', 'mangaung', 'MAN'),
  ('Fezile Dabi District Municipality', 'fezile-dabi', 'DC20'),
  ('Lejweleputswa District Municipality', 'lejweleputswa', 'DC18'),
  ('Thabo Mofutsanyana District Municipality', 'thabo-mofutsanyana', 'DC19'),
  ('Xhariep District Municipality', 'xhariep', 'DC16')
) AS d(name, slug, code) WHERE p.slug = 'free-state';

-- Limpopo (5 districts)
INSERT INTO districts (province_id, name, slug, code)
SELECT p.id, d.name, d.slug, d.code FROM provinces p,
(VALUES
  ('Capricorn District Municipality', 'capricorn', 'DC35'),
  ('Mopani District Municipality', 'mopani', 'DC33'),
  ('Sekhukhune District Municipality', 'sekhukhune', 'DC47'),
  ('Vhembe District Municipality', 'vhembe', 'DC34'),
  ('Waterberg District Municipality', 'waterberg', 'DC36')
) AS d(name, slug, code) WHERE p.slug = 'limpopo';

-- Mpumalanga (3 districts)
INSERT INTO districts (province_id, name, slug, code)
SELECT p.id, d.name, d.slug, d.code FROM provinces p,
(VALUES
  ('Ehlanzeni District Municipality', 'ehlanzeni', 'DC32'),
  ('Gert Sibande District Municipality', 'gert-sibande', 'DC30'),
  ('Nkangala District Municipality', 'nkangala', 'DC31')
) AS d(name, slug, code) WHERE p.slug = 'mpumalanga';

-- North West (4 districts)
INSERT INTO districts (province_id, name, slug, code)
SELECT p.id, d.name, d.slug, d.code FROM provinces p,
(VALUES
  ('Bojanala Platinum District Municipality', 'bojanala-platinum', 'DC37'),
  ('Dr Kenneth Kaunda District Municipality', 'dr-kenneth-kaunda', 'DC40'),
  ('Dr Ruth Segomotsi Mompati District Municipality', 'dr-ruth-segomotsi-mompati', 'DC39'),
  ('Ngaka Modiri Molema District Municipality', 'ngaka-modiri-molema', 'DC38')
) AS d(name, slug, code) WHERE p.slug = 'north-west';
