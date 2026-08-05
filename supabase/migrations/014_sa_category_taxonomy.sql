-- 014: Replace category taxonomy with SA market structure + subcategories
-- Clears existing category links, then reseeds from the revised taxonomy.

BEGIN;

UPDATE search_analytics SET category_id = NULL WHERE category_id IS NOT NULL;
UPDATE banner_ads SET category_id = NULL WHERE category_id IS NOT NULL;

-- quote_requests.category_id is NOT NULL; remove early-stage quote data so categories can be replaced.
-- leads cascade via quote_request_id ON DELETE CASCADE.
DELETE FROM quote_requests;

DELETE FROM business_categories;
DELETE FROM categories;

-- Find My Biz South Africa category taxonomy
-- Generated from src/data/sa-category-taxonomy.ts
-- Parents: 22 | Subcategories: 196 | Total: 218

-- Parent categories
INSERT INTO categories (name, slug, description, sort_order) VALUES
  ('Automotive & Vehicles', 'automotive-vehicles', 'Vehicle sales, repairs, parts, and roadside services', 1),
  ('Building & Construction', 'building-construction', 'Builders, renovations, and construction trades', 2),
  ('Electrical, Plumbing & Energy', 'electrical-plumbing-energy', 'Electricians, plumbers, solar, geysers, and backup power', 3),
  ('Home Services & Maintenance', 'home-services-maintenance', 'Everyday home care, cleaning, and maintenance', 4),
  ('Security & Safety', 'security-safety', 'Armed response, alarms, CCTV, and guarding', 5),
  ('Health & Medical', 'health-medical', 'Clinics, specialists, and allied health in South Africa', 6),
  ('Beauty, Wellness & Fitness', 'beauty-wellness-fitness', 'Salons, spas, gyms, and personal care', 7),
  ('Food, Drink & Hospitality', 'food-drink-hospitality', 'Restaurants, catering, lodges, and tourism', 8),
  ('Retail & Shopping', 'retail-shopping', 'Shops and local retail for South African consumers', 9),
  ('Property & Real Estate', 'property-real-estate', 'Estate agents, rentals, and property services', 10),
  ('Finance, Insurance & Legal', 'finance-insurance-legal', 'Accountants, attorneys, insurers, and financial advisors', 11),
  ('Business & Professional Services', 'business-professional-services', 'Consulting, admin, HR, and B-BBEE support for SMEs', 12),
  ('IT, Telecoms & Digital', 'it-telecoms-digital', 'Fibre, software, IT support, and digital marketing', 13),
  ('Education & Training', 'education-training', 'Schools, tutors, colleges, and skills training', 14),
  ('Events, Media & Creative', 'events-media-creative', 'Weddings, entertainment, photo/video, and print', 15),
  ('Transport & Logistics', 'transport-logistics', 'Couriers, trucking, taxis, and freight', 16),
  ('Agriculture & Farming', 'agriculture-farming', 'Farms, agri supplies, and rural services', 17),
  ('Manufacturing, Mining & Industrial', 'manufacturing-mining-industrial', 'Factories, suppliers, and industrial services', 18),
  ('Pets & Animal Care', 'pets-animal-care', 'Pets, boarding, and animal services', 19),
  ('Childcare & Family Services', 'childcare-family', 'Crèches, aftercare, and family support', 20),
  ('Community, NGO & Public Services', 'community-ngo', 'Non-profits, churches, and community organisations', 21),
  ('Clothing, Tailoring & Textiles', 'clothing-tailoring-textiles', 'Tailors, uniforms, and textile services', 22);

-- Subcategories: Automotive & Vehicles
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Car Dealerships (New & Used)', 'car-dealerships', 1),
  ('Mechanics & Auto Repairs', 'mechanics-auto-repairs', 2),
  ('Panel Beaters & Spray Painters', 'panel-beaters', 3),
  ('Tyre Fitment Centres', 'tyre-fitment', 4),
  ('Auto Electricians', 'auto-electricians', 5),
  ('Tow Trucks & Roadside Assist', 'tow-trucks', 6),
  ('Vehicle Tracking & Recovery', 'vehicle-tracking', 7),
  ('Car Wash & Valet', 'car-wash-valet', 8),
  ('Car Rental & Leasing', 'car-rental', 9),
  ('Auto Parts & Accessories', 'auto-parts-accessories', 10),
  ('Motorbikes & Scooters', 'motorbikes-scooters', 11),
  ('Truck & Fleet Services', 'truck-fleet-services', 12)
) AS s(name, slug, ord) WHERE p.slug = 'automotive-vehicles';

-- Subcategories: Building & Construction
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('General Building Contractors', 'general-builders', 1),
  ('Architects', 'architects', 2),
  ('Quantity Surveyors', 'quantity-surveyors', 3),
  ('Bricklayers & Masons', 'bricklayers', 4),
  ('Carpenters & Joiners', 'carpenters', 5),
  ('Painters & Decorators', 'painters', 6),
  ('Tilers', 'tilers', 7),
  ('Plasterers & Screeders', 'plasterers', 8),
  ('Roofing & Waterproofing', 'roofing-waterproofing', 9),
  ('Ceiling & Partitioning', 'ceilings-partitioning', 10),
  ('Kitchen & Cupboard Fitters', 'kitchen-cupboards', 11),
  ('Aluminium & Glass', 'aluminium-glass', 12),
  ('Steelwork & Welding', 'steelwork-welding', 13),
  ('Demolition & Excavation', 'demolition-excavation', 14)
) AS s(name, slug, ord) WHERE p.slug = 'building-construction';

-- Subcategories: Electrical, Plumbing & Energy
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Electricians (COC & Installations)', 'electricians', 1),
  ('Plumbers & Drain Specialists', 'plumbers', 2),
  ('Solar PV Installers', 'solar-pv-installers', 3),
  ('Inverters, Batteries & Backup Power', 'inverters-batteries', 4),
  ('Generators & UPS', 'generators-ups', 5),
  ('Geyser Installation & Repair', 'geyser-services', 6),
  ('Boreholes & Water Pumps', 'boreholes-pumps', 7),
  ('Gas Installers (LPG)', 'gas-installers', 8),
  ('Air Conditioning & HVAC', 'air-conditioning-hvac', 9),
  ('Electrical Contractors (Commercial)', 'electrical-contractors', 10)
) AS s(name, slug, ord) WHERE p.slug = 'electrical-plumbing-energy';

-- Subcategories: Home Services & Maintenance
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Handymen', 'handymen', 1),
  ('Domestic Cleaning', 'domestic-cleaning', 2),
  ('Carpet & Upholstery Cleaning', 'carpet-upholstery-cleaning', 3),
  ('Garden Services & Landscaping', 'garden-landscaping', 4),
  ('Tree Felling & Stump Removal', 'tree-felling', 5),
  ('Pool Cleaning & Maintenance', 'pool-maintenance', 6),
  ('Pool Builders & Renovations', 'pool-builders', 7),
  ('Pest Control & Fumigation', 'pest-control', 8),
  ('Locksmiths', 'locksmiths', 9),
  ('Appliance Repairs', 'appliance-repairs', 10),
  ('Interior Design & Décor', 'interior-design', 11),
  ('Removals & Packers', 'removals-packers', 12)
) AS s(name, slug, ord) WHERE p.slug = 'home-services-maintenance';

-- Subcategories: Security & Safety
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Armed Response & Monitoring', 'armed-response', 1),
  ('Alarm Systems Installation', 'alarm-systems', 2),
  ('CCTV & Access Control', 'cctv-access-control', 3),
  ('Security Guarding', 'security-guarding', 4),
  ('Electric Fencing', 'electric-fencing', 5),
  ('Fire Safety & Equipment', 'fire-safety', 6),
  ('Private Investigation', 'private-investigation', 7),
  ('Security Training', 'security-training', 8)
) AS s(name, slug, ord) WHERE p.slug = 'security-safety';

-- Subcategories: Health & Medical
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('General Practitioners (GPs)', 'general-practitioners', 1),
  ('Dentists & Orthodontists', 'dentists', 2),
  ('Optometrists & Eye Care', 'optometrists', 3),
  ('Physiotherapists', 'physiotherapists', 4),
  ('Psychologists & Counselling', 'psychologists-counselling', 5),
  ('Pharmacies', 'pharmacies', 6),
  ('Medical Specialists', 'medical-specialists', 7),
  ('Pathology & Radiology', 'pathology-radiology', 8),
  ('Home Nursing & Care', 'home-nursing', 9),
  ('Alternative & Holistic Health', 'alternative-health', 10),
  ('Veterinary Clinics', 'veterinary-clinics', 11)
) AS s(name, slug, ord) WHERE p.slug = 'health-medical';

-- Subcategories: Beauty, Wellness & Fitness
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Hair Salons & Barbers', 'hair-salons-barbers', 1),
  ('Nail Salons', 'nail-salons', 2),
  ('Beauty Spas & Aesthetic Clinics', 'beauty-spas', 3),
  ('Makeup Artists', 'makeup-artists', 4),
  ('Gyms & Fitness Centres', 'gyms-fitness', 5),
  ('Personal Trainers', 'personal-trainers', 6),
  ('Yoga & Pilates Studios', 'yoga-pilates', 7),
  ('Massage Therapy', 'massage-therapy', 8),
  ('Tattoo & Piercing', 'tattoo-piercing', 9)
) AS s(name, slug, ord) WHERE p.slug = 'beauty-wellness-fitness';

-- Subcategories: Food, Drink & Hospitality
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Restaurants & Cafés', 'restaurants-cafes', 1),
  ('Fast Food & Takeaways', 'fast-food-takeaways', 2),
  ('Catering & Event Food', 'catering', 3),
  ('Bakeries & Patisseries', 'bakeries', 4),
  ('Butcheries', 'butcheries', 5),
  ('Bottle Stores & Liquor', 'bottle-stores', 6),
  ('Hotels & Guest Houses', 'hotels-guest-houses', 7),
  ('B&Bs & Self-Catering', 'bnb-self-catering', 8),
  ('Game Lodges & Resorts', 'game-lodges', 9),
  ('Tour Operators & Safari', 'tour-operators', 10),
  ('Mobile Kitchens & Food Trucks', 'food-trucks', 11)
) AS s(name, slug, ord) WHERE p.slug = 'food-drink-hospitality';

-- Subcategories: Retail & Shopping
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Clothing & Fashion', 'clothing-fashion', 1),
  ('Electronics & Appliances', 'electronics-appliances', 2),
  ('Furniture & Homeware', 'furniture-homeware', 3),
  ('Hardware & Building Supplies', 'hardware-building-supplies', 4),
  ('Spaza Shops & Convenience', 'spaza-convenience', 5),
  ('Supermarkets & Groceries', 'supermarkets-groceries', 6),
  ('Cellular & Airtime Shops', 'cellular-airtime', 7),
  ('Bookstores & Stationery', 'bookstores-stationery', 8),
  ('Florists', 'florists', 9),
  ('Online / E-commerce Stores', 'ecommerce-stores', 10),
  ('Wholesalers & Cash & Carry', 'wholesalers', 11)
) AS s(name, slug, ord) WHERE p.slug = 'retail-shopping';

-- Subcategories: Property & Real Estate
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Estate Agents (Sales)', 'estate-agents-sales', 1),
  ('Rental & Letting Agents', 'rental-letting-agents', 2),
  ('Property Management', 'property-management', 3),
  ('Body Corporate & Sectional Title', 'body-corporate', 4),
  ('Property Valuers', 'property-valuers', 5),
  ('Conveyancing Support', 'conveyancing-support', 6),
  ('Developers & Project Marketing', 'property-developers', 7)
) AS s(name, slug, ord) WHERE p.slug = 'property-real-estate';

-- Subcategories: Finance, Insurance & Legal
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Accountants & Bookkeepers', 'accountants-bookkeepers', 1),
  ('Tax Practitioners (SARS)', 'tax-practitioners', 2),
  ('Attorneys & Law Firms', 'attorneys', 3),
  ('Labour Law & CCMA Consultants', 'labour-law-consultants', 4),
  ('Short-Term Insurance Brokers', 'short-term-insurance', 5),
  ('Life & Funeral Cover', 'life-funeral-cover', 6),
  ('Medical Aid Brokers', 'medical-aid-brokers', 7),
  ('Financial Advisors', 'financial-advisors', 8),
  ('Debt Counsellors', 'debt-counsellors', 9),
  ('Notaries & Commissioners of Oaths', 'notaries', 10)
) AS s(name, slug, ord) WHERE p.slug = 'finance-insurance-legal';

-- Subcategories: Business & Professional Services
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Business Consultants', 'business-consultants', 1),
  ('B-BBEE Consultants', 'bbee-consultants', 2),
  ('CIPC & Company Secretarial', 'cipc-company-secretarial', 3),
  ('Recruitment Agencies', 'recruitment-agencies', 4),
  ('HR & Payroll Services', 'hr-payroll', 5),
  ('Virtual Assistants', 'virtual-assistants', 6),
  ('Call Centres & Contact Centres', 'call-centres', 7),
  ('Translation & Interpreting', 'translation-interpreting', 8),
  ('Training Providers (SETA)', 'seta-training-providers', 9),
  ('Office Supplies & Stationery', 'office-supplies', 10)
) AS s(name, slug, ord) WHERE p.slug = 'business-professional-services';

-- Subcategories: IT, Telecoms & Digital
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('IT Support & Managed Services', 'it-support', 1),
  ('Web Design & Development', 'web-design-development', 2),
  ('Software Development', 'software-development', 3),
  ('Fibre & Internet Service Providers', 'fibre-isps', 4),
  ('Cellular & Network Solutions', 'cellular-network-solutions', 5),
  ('Cybersecurity', 'cybersecurity', 6),
  ('Digital Marketing Agencies', 'digital-marketing', 7),
  ('SEO & Content Marketing', 'seo-content-marketing', 8),
  ('Social Media Management', 'social-media-management', 9),
  ('Computer Repairs', 'computer-repairs', 10)
) AS s(name, slug, ord) WHERE p.slug = 'it-telecoms-digital';

-- Subcategories: Education & Training
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Private Schools', 'private-schools', 1),
  ('Tutoring & Extra Lessons', 'tutoring', 2),
  ('Driving Schools', 'driving-schools', 3),
  ('Language Schools', 'language-schools', 4),
  ('Music & Arts Lessons', 'music-arts-lessons', 5),
  ('Corporate Training', 'corporate-training', 6),
  ('Early Childhood Development (ECD)', 'ecd-centres', 7),
  ('Tertiary & Private Colleges', 'private-colleges', 8)
) AS s(name, slug, ord) WHERE p.slug = 'education-training';

-- Subcategories: Events, Media & Creative
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Event Planners & Coordinators', 'event-planners', 1),
  ('Wedding Services', 'wedding-services', 2),
  ('DJs & Live Entertainment', 'djs-entertainment', 3),
  ('Photographers', 'photographers', 4),
  ('Videographers', 'videographers', 5),
  ('Marquees, Décor & Hire', 'marquees-decor-hire', 6),
  ('Printing & Signage', 'printing-signage', 7),
  ('Graphic Design', 'graphic-design', 8),
  ('Promotional Products', 'promotional-products', 9)
) AS s(name, slug, ord) WHERE p.slug = 'events-media-creative';

-- Subcategories: Transport & Logistics
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Couriers & Parcel Delivery', 'couriers', 1),
  ('Furniture Removals', 'furniture-removals', 2),
  ('Freight & Trucking', 'freight-trucking', 3),
  ('Taxi & Shuttle Services', 'taxi-shuttle', 4),
  ('E-hailing & Private Drivers', 'e-hailing-drivers', 5),
  ('Bus & Coach Hire', 'bus-coach-hire', 6),
  ('Warehousing & Storage', 'warehousing-storage', 7),
  ('Import & Export Clearing', 'import-export-clearing', 8)
) AS s(name, slug, ord) WHERE p.slug = 'transport-logistics';

-- Subcategories: Agriculture & Farming
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Crop Farming', 'crop-farming', 1),
  ('Livestock & Poultry', 'livestock-poultry', 2),
  ('Agricultural Supplies & Feed', 'agri-supplies', 3),
  ('Farm Equipment & Mechanisation', 'farm-equipment', 4),
  ('Irrigation & Water Systems', 'irrigation-systems', 5),
  ('Veterinary (Farm Animals)', 'farm-veterinary', 6),
  ('Agri Consulting & Extension', 'agri-consulting', 7)
) AS s(name, slug, ord) WHERE p.slug = 'agriculture-farming';

-- Subcategories: Manufacturing, Mining & Industrial
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Manufacturers', 'manufacturers', 1),
  ('Engineering Firms', 'engineering-firms', 2),
  ('Mining Services & Contractors', 'mining-services', 3),
  ('Industrial Supplies', 'industrial-supplies', 4),
  ('Fabrication & CNC', 'fabrication-cnc', 5),
  ('Packaging Suppliers', 'packaging-suppliers', 6),
  ('Waste Management & Recycling', 'waste-recycling', 7),
  ('Environmental Consultants', 'environmental-consultants', 8)
) AS s(name, slug, ord) WHERE p.slug = 'manufacturing-mining-industrial';

-- Subcategories: Pets & Animal Care
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Pet Grooming', 'pet-grooming', 1),
  ('Pet Boarding & Daycare', 'pet-boarding', 2),
  ('Pet Shops & Supplies', 'pet-shops', 3),
  ('Dog Training', 'dog-training', 4),
  ('Pet Sitting', 'pet-sitting', 5)
) AS s(name, slug, ord) WHERE p.slug = 'pets-animal-care';

-- Subcategories: Childcare & Family Services
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Crèches & Daycare', 'creches-daycare', 1),
  ('Aftercare Programmes', 'aftercare', 2),
  ('Au Pairs & Nannies', 'au-pairs-nannies', 3),
  ('Babysitting Services', 'babysitting', 4),
  ('Maternity & Parenting Support', 'maternity-parenting', 5)
) AS s(name, slug, ord) WHERE p.slug = 'childcare-family';

-- Subcategories: Community, NGO & Public Services
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('NGOs & NPCs', 'ngos-npcs', 1),
  ('Churches & Faith Organisations', 'churches-faith', 2),
  ('Community Centres', 'community-centres', 3),
  ('Funeral Parlours', 'funeral-parlours', 4),
  ('Burial Societies', 'burial-societies', 5),
  ('Charity & Fundraising', 'charity-fundraising', 6)
) AS s(name, slug, ord) WHERE p.slug = 'community-ngo';

-- Subcategories: Clothing, Tailoring & Textiles
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Tailors & Dressmakers', 'tailors-dressmakers', 1),
  ('Alterations & Repairs', 'alterations-repairs', 2),
  ('Uniforms & Corporate Wear', 'uniforms-corporate-wear', 3),
  ('Traditional & Cultural Attire', 'traditional-attire', 4),
  ('Embroidery & Screen Printing', 'embroidery-screen-printing', 5)
) AS s(name, slug, ord) WHERE p.slug = 'clothing-tailoring-textiles';


COMMIT;
