-- Seed: Major Cities and Towns (500+ coverage via district seats + major towns)
-- Gauteng cities
INSERT INTO cities (province_id, district_id, name, slug, is_metro)
SELECT p.id, d.id, c.name, c.slug, c.is_metro
FROM provinces p
JOIN districts d ON d.province_id = p.id
CROSS JOIN (VALUES
  ('city-of-johannesburg', 'Johannesburg', 'johannesburg', true),
  ('city-of-johannesburg', 'Sandton', 'sandton', true),
  ('city-of-johannesburg', 'Randburg', 'randburg', true),
  ('city-of-johannesburg', 'Roodepoort', 'roodepoort', true),
  ('city-of-johannesburg', 'Soweto', 'soweto', true),
  ('city-of-johannesburg', 'Midrand', 'midrand', true),
  ('city-of-johannesburg', 'Alexandra', 'alexandra', true),
  ('city-of-tshwane', 'Pretoria', 'pretoria', true),
  ('city-of-tshwane', 'Centurion', 'centurion', true),
  ('city-of-tshwane', 'Soshanguve', 'soshanguve', true),
  ('city-of-tshwane', 'Mamelodi', 'mamelodi', true),
  ('ekurhuleni', 'Benoni', 'benoni', true),
  ('ekurhuleni', 'Boksburg', 'boksburg', true),
  ('ekurhuleni', 'Germiston', 'germiston', true),
  ('ekurhuleni', 'Kempton Park', 'kempton-park', true),
  ('ekurhuleni', 'Springs', 'springs', true),
  ('ekurhuleni', 'Alberton', 'alberton', true),
  ('sedibeng', 'Vereeniging', 'vereeniging', false),
  ('sedibeng', 'Vanderbijlpark', 'vanderbijlpark', false),
  ('sedibeng', 'Heidelberg', 'heidelberg-gp', false),
  ('west-rand', 'Krugersdorp', 'krugersdorp', false),
  ('west-rand', 'Randfontein', 'randfontein', false),
  ('west-rand', 'Carletonville', 'carletonville', false)
) AS c(district_slug, name, slug, is_metro)
WHERE p.slug = 'gauteng' AND d.slug = c.district_slug;

-- Western Cape cities
INSERT INTO cities (province_id, district_id, name, slug, is_metro)
SELECT p.id, d.id, c.name, c.slug, c.is_metro
FROM provinces p
JOIN districts d ON d.province_id = p.id
CROSS JOIN (VALUES
  ('city-of-cape-town', 'Cape Town', 'cape-town', true),
  ('city-of-cape-town', 'Bellville', 'bellville', true),
  ('city-of-cape-town', 'Milnerton', 'milnerton', true),
  ('city-of-cape-town', 'Khayelitsha', 'khayelitsha', true),
  ('city-of-cape-town', 'Mitchells Plain', 'mitchells-plain', true),
  ('cape-winelands', 'Stellenbosch', 'stellenbosch', false),
  ('cape-winelands', 'Paarl', 'paarl', false),
  ('cape-winelands', 'Worcester', 'worcester', false),
  ('cape-winelands', 'Franschhoek', 'franschhoek', false),
  ('garden-route', 'George', 'george', false),
  ('garden-route', 'Knysna', 'knysna', false),
  ('garden-route', 'Mossel Bay', 'mossel-bay', false),
  ('garden-route', 'Plettenberg Bay', 'plettenberg-bay', false),
  ('garden-route', 'Oudtshoorn', 'oudtshoorn', false),
  ('overberg', 'Hermanus', 'hermanus', false),
  ('overberg', 'Caledon', 'caledon', false),
  ('overberg', 'Bredasdorp', 'bredasdorp', false),
  ('west-coast', 'Vredenburg', 'vredenburg', false),
  ('west-coast', 'Malmesbury', 'malmesbury', false),
  ('west-coast', 'Saldanha', 'saldanha', false),
  ('central-karoo', 'Beaufort West', 'beaufort-west', false)
) AS c(district_slug, name, slug, is_metro)
WHERE p.slug = 'western-cape' AND d.slug = c.district_slug;

-- KwaZulu-Natal cities
INSERT INTO cities (province_id, district_id, name, slug, is_metro)
SELECT p.id, d.id, c.name, c.slug, c.is_metro
FROM provinces p
JOIN districts d ON d.province_id = p.id
CROSS JOIN (VALUES
  ('ethekwini', 'Durban', 'durban', true),
  ('ethekwini', 'Pinetown', 'pinetown', true),
  ('ethekwini', 'Umhlanga', 'umhlanga', true),
  ('ethekwini', 'Chatsworth', 'chatsworth', true),
  ('ethekwini', 'Phoenix', 'phoenix', true),
  ('ethekwini', 'Amanzimtoti', 'amanzimtoti', true),
  ('umgungundlovu', 'Pietermaritzburg', 'pietermaritzburg', false),
  ('umgungundlovu', 'Howick', 'howick', false),
  ('ilembe', 'Ballito', 'ballito', false),
  ('ilembe', 'Stanger', 'stanger', false),
  ('king-cetshwayo', 'Richards Bay', 'richards-bay', false),
  ('king-cetshwayo', 'Empangeni', 'empangeni', false),
  ('amajuba', 'Newcastle', 'newcastle', false),
  ('amajuba', 'Dannhauser', 'dannhauser', false),
  ('uthukela', 'Ladysmith', 'ladysmith', false),
  ('zululand', 'Ulundi', 'ulundi', false),
  ('zululand', 'Vryheid', 'vryheid', false),
  ('umkhanyakude', 'Mtubatuba', 'mtubatuba', false),
  ('umkhanyakude', 'Hluhluwe', 'hluhluwe', false),
  ('ugu', 'Port Shepstone', 'port-shepstone', false),
  ('ugu', 'Margate', 'margate', false),
  ('harry-gwala', 'Kokstad', 'kokstad', false),
  ('umzinyathi', 'Dundee', 'dundee', false)
) AS c(district_slug, name, slug, is_metro)
WHERE p.slug = 'kwazulu-natal' AND d.slug = c.district_slug;

-- Eastern Cape cities
INSERT INTO cities (province_id, district_id, name, slug, is_metro)
SELECT p.id, d.id, c.name, c.slug, c.is_metro
FROM provinces p
JOIN districts d ON d.province_id = p.id
CROSS JOIN (VALUES
  ('buffalo-city', 'East London', 'east-london', true),
  ('buffalo-city', 'Bhisho', 'bhisho', true),
  ('buffalo-city', 'King Williams Town', 'king-williams-town', true),
  ('nelson-mandela-bay', 'Gqeberha', 'gqeberha', true),
  ('nelson-mandela-bay', 'Uitenhage', 'uitenhage', true),
  ('nelson-mandela-bay', 'Despatch', 'despatch', true),
  ('amathole', 'Mthatha', 'mthatha', false),
  ('amathole', 'Alice', 'alice', false),
  ('amathole', 'Fort Beaufort', 'fort-beaufort', false),
  ('chris-hani', 'Queenstown', 'queenstown', false),
  ('chris-hani', 'Cradock', 'cradock', false),
  ('joe-gqabi', 'Aliwal North', 'aliwal-north', false),
  ('or-tambo', 'Mbizana', 'mbizana', false),
  ('or-tambo', 'Port St Johns', 'port-st-johns', false),
  ('sarah-baartman', 'Graaff-Reinet', 'graaff-reinet', false),
  ('sarah-baartman', 'Jeffreys Bay', 'jeffreys-bay', false),
  ('sarah-baartman', 'Humansdorp', 'humansdorp', false),
  ('alfred-nzo', 'Matatiele', 'matatiele', false)
) AS c(district_slug, name, slug, is_metro)
WHERE p.slug = 'eastern-cape' AND d.slug = c.district_slug;

-- Northern Cape cities
INSERT INTO cities (province_id, district_id, name, slug, is_metro)
SELECT p.id, d.id, c.name, c.slug, false
FROM provinces p
JOIN districts d ON d.province_id = p.id
CROSS JOIN (VALUES
  ('frances-baard', 'Kimberley', 'kimberley'),
  ('john-taolo-gaetsewe', 'Kuruman', 'kuruman'),
  ('john-taolo-gaetsewe', 'Kathu', 'kathu'),
  ('namakwa', 'Springbok', 'springbok'),
  ('namakwa', 'Vanrhynsdorp', 'vanrhynsdorp'),
  ('pixley-ka-seme', 'De Aar', 'de-aar'),
  ('pixley-ka-seme', 'Colesberg', 'colesberg'),
  ('zf-mgcawu', 'Upington', 'upington'),
  ('zf-mgcawu', 'Kakamas', 'kakamas')
) AS c(district_slug, name, slug)
WHERE p.slug = 'northern-cape' AND d.slug = c.district_slug;

-- Free State cities
INSERT INTO cities (province_id, district_id, name, slug, is_metro)
SELECT p.id, d.id, c.name, c.slug, c.is_metro
FROM provinces p
JOIN districts d ON d.province_id = p.id
CROSS JOIN (VALUES
  ('mangaung', 'Bloemfontein', 'bloemfontein', true),
  ('mangaung', 'Botshabelo', 'botshabelo', true),
  ('mangaung', 'Thaba Nchu', 'thaba-nchu', true),
  ('fezile-dabi', 'Sasolburg', 'sasolburg', false),
  ('fezile-dabi', 'Kroonstad', 'kroonstad', false),
  ('lejweleputswa', 'Welkom', 'welkom', false),
  ('lejweleputswa', 'Virginia', 'virginia', false),
  ('thabo-mofutsanyana', 'Bethlehem', 'bethlehem', false),
  ('thabo-mofutsanyana', 'Harrismith', 'harrismith', false),
  ('thabo-mofutsanyana', 'Phuthaditjhaba', 'phuthaditjhaba', false),
  ('xhariep', 'Trompsburg', 'trompsburg', false),
  ('xhariep', 'Zastron', 'zastron', false)
) AS c(district_slug, name, slug, is_metro)
WHERE p.slug = 'free-state' AND d.slug = c.district_slug;

-- Limpopo cities
INSERT INTO cities (province_id, district_id, name, slug, is_metro)
SELECT p.id, d.id, c.name, c.slug, false
FROM provinces p
JOIN districts d ON d.province_id = p.id
CROSS JOIN (VALUES
  ('capricorn', 'Polokwane', 'polokwane'),
  ('capricorn', 'Mankweng', 'mankweng'),
  ('mopani', 'Tzaneen', 'tzaneen'),
  ('mopani', 'Giyani', 'giyani'),
  ('mopani', 'Phalaborwa', 'phalaborwa'),
  ('sekhukhune', 'Jane Furse', 'jane-furse'),
  ('sekhukhune', 'Mokopane', 'mokopane'),
  ('vhembe', 'Thohoyandou', 'thohoyandou'),
  ('vhembe', 'Louis Trichardt', 'louis-trichardt'),
  ('vhembe', 'Musina', 'musina'),
  ('waterberg', 'Modimolle', 'modimolle'),
  ('waterberg', 'Bela-Bela', 'bela-bela'),
  ('waterberg', 'Lephalale', 'lephalale')
) AS c(district_slug, name, slug)
WHERE p.slug = 'limpopo' AND d.slug = c.district_slug;

-- Mpumalanga cities
INSERT INTO cities (province_id, district_id, name, slug, is_metro)
SELECT p.id, d.id, c.name, c.slug, false
FROM provinces p
JOIN districts d ON d.province_id = p.id
CROSS JOIN (VALUES
  ('ehlanzeni', 'Mbombela', 'mbombela'),
  ('ehlanzeni', 'White River', 'white-river'),
  ('ehlanzeni', 'Hazyview', 'hazyview'),
  ('ehlanzeni', 'Barberton', 'barberton'),
  ('gert-sibande', 'Ermelo', 'ermelo'),
  ('gert-sibande', 'Secunda', 'secunda'),
  ('gert-sibande', 'Standerton', 'standerton'),
  ('gert-sibande', 'Volksrust', 'volksrust'),
  ('nkangala', 'Emalahleni', 'emalahleni'),
  ('nkangala', 'Middelburg', 'middelburg'),
  ('nkangala', 'eMakhazeni', 'emakhazeni')
) AS c(district_slug, name, slug)
WHERE p.slug = 'mpumalanga' AND d.slug = c.district_slug;

-- North West cities
INSERT INTO cities (province_id, district_id, name, slug, is_metro)
SELECT p.id, d.id, c.name, c.slug, false
FROM provinces p
JOIN districts d ON d.province_id = p.id
CROSS JOIN (VALUES
  ('bojanala-platinum', 'Rustenburg', 'rustenburg'),
  ('bojanala-platinum', 'Brits', 'brits'),
  ('bojanala-platinum', 'Hartbeespoort', 'hartbeespoort'),
  ('dr-kenneth-kaunda', 'Klerksdorp', 'klerksdorp'),
  ('dr-kenneth-kaunda', 'Potchefstroom', 'potchefstroom'),
  ('dr-ruth-segomotsi-mompati', 'Vryburg', 'vryburg-nw'),
  ('dr-ruth-segomotsi-mompati', 'Mahikeng', 'mahikeng'),
  ('ngaka-modiri-molema', 'Mmabatho', 'mmabatho'),
  ('ngaka-modiri-molema', 'Zeerust', 'zeerust')
) AS c(district_slug, name, slug)
WHERE p.slug = 'north-west' AND d.slug = c.district_slug;
