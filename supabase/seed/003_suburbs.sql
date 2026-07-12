-- Seed: Metro Suburbs (8 major metros)
-- Johannesburg suburbs
INSERT INTO suburbs (city_id, name, slug)
SELECT c.id, s.name, s.slug FROM cities c
CROSS JOIN (VALUES
  ('sandton', 'Sandton CBD', 'sandton-cbd'),
  ('sandton', 'Bryanston', 'bryanston'),
  ('sandton', 'Fourways', 'fourways'),
  ('sandton', 'Rivonia', 'rivonia'),
  ('sandton', 'Morningside', 'morningside'),
  ('johannesburg', 'Rosebank', 'rosebank'),
  ('johannesburg', 'Melville', 'melville'),
  ('johannesburg', 'Parktown', 'parktown'),
  ('johannesburg', 'Hillbrow', 'hillbrow'),
  ('johannesburg', 'Newtown', 'newtown'),
  ('johannesburg', 'Braamfontein', 'braamfontein'),
  ('johannesburg', 'Fordsburg', 'fordsburg'),
  ('randburg', 'Ferndale', 'ferndale'),
  ('randburg', 'Northgate', 'northgate'),
  ('roodepoort', 'Florida', 'florida'),
  ('roodepoort', 'Constantia Kloof', 'constantia-kloof'),
  ('soweto', 'Orlando', 'orlando'),
  ('soweto', 'Diepkloof', 'diepkloof'),
  ('midrand', 'Halfway House', 'halfway-house'),
  ('midrand', 'Kyalami', 'kyalami')
) AS s(city_slug, name, slug)
WHERE c.slug = s.city_slug;

-- Pretoria suburbs
INSERT INTO suburbs (city_id, name, slug)
SELECT c.id, s.name, s.slug FROM cities c
CROSS JOIN (VALUES
  ('pretoria', 'Hatfield', 'hatfield'),
  ('pretoria', 'Brooklyn', 'brooklyn'),
  ('pretoria', 'Menlyn', 'menlyn'),
  ('pretoria', 'Arcadia', 'arcadia'),
  ('pretoria', 'Sunnyside', 'sunnyside'),
  ('pretoria', 'Silverton', 'silverton'),
  ('centurion', 'Centurion CBD', 'centurion-cbd'),
  ('centurion', 'Irene', 'irene'),
  ('centurion', 'Lyttelton', 'lyttelton')
) AS s(city_slug, name, slug)
WHERE c.slug = s.city_slug;

-- Cape Town suburbs
INSERT INTO suburbs (city_id, name, slug)
SELECT c.id, s.name, s.slug FROM cities c
CROSS JOIN (VALUES
  ('cape-town', 'City Bowl', 'city-bowl'),
  ('cape-town', 'Sea Point', 'sea-point'),
  ('cape-town', 'Camps Bay', 'camps-bay'),
  ('cape-town', 'Claremont', 'claremont'),
  ('cape-town', 'Observatory', 'observatory'),
  ('cape-town', 'Woodstock', 'woodstock'),
  ('cape-town', 'Green Point', 'green-point'),
  ('cape-town', 'Constantia', 'constantia'),
  ('cape-town', 'Tokai', 'tokai'),
  ('cape-town', 'Parow', 'parow'),
  ('cape-town', 'Goodwood', 'goodwood'),
  ('cape-town', 'Durbanville', 'durbanville'),
  ('cape-town', 'Table View', 'table-view'),
  ('cape-town', 'Blouberg', 'blouberg')
) AS s(city_slug, name, slug)
WHERE c.slug = s.city_slug;

-- Durban suburbs
INSERT INTO suburbs (city_id, name, slug)
SELECT c.id, s.name, s.slug FROM cities c
CROSS JOIN (VALUES
  ('durban', 'Durban CBD', 'durban-cbd'),
  ('durban', 'Berea', 'berea'),
  ('durban', 'Morningside', 'morningside-dbn'),
  ('durban', 'Glenwood', 'glenwood'),
  ('durban', 'Westville', 'westville'),
  ('durban', 'Pinetown', 'pinetown-suburb'),
  ('umhlanga', 'Umhlanga Rocks', 'umhlanga-rocks'),
  ('umhlanga', 'La Lucia', 'la-lucia'),
  ('umhlanga', 'Mount Edgecombe', 'mount-edgecombe')
) AS s(city_slug, name, slug)
WHERE c.slug = s.city_slug;

-- Port Elizabeth / Gqeberha suburbs
INSERT INTO suburbs (city_id, name, slug)
SELECT c.id, s.name, s.slug FROM cities c
CROSS JOIN (VALUES
  ('gqeberha', 'Central', 'pe-central'),
  ('gqeberha', 'Summerstrand', 'summerstrand'),
  ('gqeberha', 'Walmer', 'walmer'),
  ('gqeberha', 'Newton Park', 'newton-park'),
  ('gqeberha', 'Greenacres', 'greenacres')
) AS s(city_slug, name, slug)
WHERE c.slug = s.city_slug;

-- East London suburbs
INSERT INTO suburbs (city_id, name, slug)
SELECT c.id, s.name, s.slug FROM cities c
CROSS JOIN (VALUES
  ('east-london', 'East London CBD', 'el-cbd'),
  ('east-london', 'Vincent', 'vincent'),
  ('east-london', 'Beacon Bay', 'beacon-bay'),
  ('east-london', 'Gonubie', 'gonubie')
) AS s(city_slug, name, slug)
WHERE c.slug = s.city_slug;

-- Bloemfontein suburbs
INSERT INTO suburbs (city_id, name, slug)
SELECT c.id, s.name, s.slug FROM cities c
CROSS JOIN (VALUES
  ('bloemfontein', 'Bloemfontein CBD', 'bloem-cbd'),
  ('bloemfontein', 'Westdene', 'westdene'),
  ('bloemfontein', 'Universitas', 'universitas'),
  ('bloemfontein', 'Langenhoven Park', 'langenhoven-park')
) AS s(city_slug, name, slug)
WHERE c.slug = s.city_slug;

-- Mbombela / Polokwane suburbs
INSERT INTO suburbs (city_id, name, slug)
SELECT c.id, s.name, s.slug FROM cities c
CROSS JOIN (VALUES
  ('mbombela', 'Nelspruit CBD', 'nelspruit-cbd'),
  ('mbombela', 'Sonheuwel', 'sonheuwel'),
  ('mbombela', 'Steiltes', 'steiltes'),
  ('polokwane', 'Polokwane CBD', 'polokwane-cbd'),
  ('polokwane', 'Bendor', 'bendor'),
  ('polokwane', 'Fauna Park', 'fauna-park')
) AS s(city_slug, name, slug)
WHERE c.slug = s.city_slug;

-- Ekurhuleni suburbs
INSERT INTO suburbs (city_id, name, slug)
SELECT c.id, s.name, s.slug FROM cities c
CROSS JOIN (VALUES
  ('benoni', 'Benoni CBD', 'benoni-cbd'),
  ('benoni', 'Northmead', 'northmead'),
  ('boksburg', 'Boksburg CBD', 'boksburg-cbd'),
  ('boksburg', 'East Rand', 'east-rand'),
  ('kempton-park', 'Kempton Park CBD', 'kempton-cbd'),
  ('kempton-park', 'Edenvale', 'edenvale'),
  ('germiston', 'Germiston CBD', 'germiston-cbd')
) AS s(city_slug, name, slug)
WHERE c.slug = s.city_slug;
