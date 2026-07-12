-- Seed: Business Categories (~50 parent, ~300 subcategories)
-- Parent categories
INSERT INTO categories (name, slug, description, sort_order) VALUES
  ('Automotive', 'automotive', 'Vehicle sales, repairs, and services', 1),
  ('Building & Construction', 'building-construction', 'Construction, renovation, and building services', 2),
  ('Business Services', 'business-services', 'Professional and corporate services', 3),
  ('Cleaning Services', 'cleaning-services', 'Residential and commercial cleaning', 4),
  ('Education & Training', 'education-training', 'Schools, tutors, and training providers', 5),
  ('Electrical Services', 'electrical-services', 'Electricians and electrical contractors', 6),
  ('Events & Entertainment', 'events-entertainment', 'Event planning, DJs, and entertainment', 7),
  ('Financial Services', 'financial-services', 'Accounting, insurance, and financial advice', 8),
  ('Food & Beverage', 'food-beverage', 'Restaurants, catering, and food services', 9),
  ('Health & Medical', 'health-medical', 'Doctors, clinics, and healthcare providers', 10),
  ('Home & Garden', 'home-garden', 'Landscaping, gardening, and home improvement', 11),
  ('Hospitality & Tourism', 'hospitality-tourism', 'Hotels, lodges, and tour operators', 12),
  ('IT & Technology', 'it-technology', 'Software, IT support, and tech services', 13),
  ('Legal Services', 'legal-services', 'Attorneys, lawyers, and legal advice', 14),
  ('Manufacturing', 'manufacturing', 'Manufacturers and industrial suppliers', 15),
  ('Marketing & Advertising', 'marketing-advertising', 'Digital marketing, branding, and advertising', 16),
  ('Plumbing Services', 'plumbing-services', 'Plumbers and plumbing contractors', 17),
  ('Real Estate', 'real-estate', 'Estate agents, property management, and rentals', 18),
  ('Retail & Shopping', 'retail-shopping', 'Shops, stores, and retail outlets', 19),
  ('Security Services', 'security-services', 'Security companies and alarm systems', 20),
  ('Transport & Logistics', 'transport-logistics', 'Couriers, movers, and transport services', 21),
  ('Beauty & Wellness', 'beauty-wellness', 'Salons, spas, and wellness services', 22),
  ('Pet Services', 'pet-services', 'Vets, pet grooming, and pet supplies', 23),
  ('Photography & Video', 'photography-video', 'Photographers and videographers', 24),
  ('Printing & Signage', 'printing-signage', 'Printers, sign makers, and branding', 25),
  ('Agriculture & Farming', 'agriculture-farming', 'Farms, agricultural suppliers, and services', 26),
  ('Arts & Crafts', 'arts-crafts', 'Artists, crafters, and creative services', 27),
  ('Automotive Parts', 'automotive-parts', 'Spare parts and accessories', 28),
  ('Childcare & Babysitting', 'childcare-babysitting', 'Crèches, daycare, and babysitting', 29),
  ('Consulting', 'consulting', 'Business and management consultants', 30),
  ('Dentists', 'dentists', 'Dental practices and orthodontists', 31),
  ('Engineering', 'engineering', 'Engineering firms and consultants', 32),
  ('Fitness & Gym', 'fitness-gym', 'Gyms, personal trainers, and fitness', 33),
  ('Funeral Services', 'funeral-services', 'Funeral parlours and memorial services', 34),
  ('Handyman Services', 'handyman-services', 'General repairs and maintenance', 35),
  ('Interior Design', 'interior-design', 'Interior designers and decorators', 36),
  ('Locksmiths', 'locksmiths', 'Locksmiths and security hardware', 37),
  ('Mechanics', 'mechanics', 'Auto mechanics and panel beaters', 38),
  ('Mining & Resources', 'mining-resources', 'Mining services and suppliers', 39),
  ('Music & Instruments', 'music-instruments', 'Music teachers and instrument shops', 40),
  ('NGO & Community', 'ngo-community', 'Non-profits and community organisations', 41),
  ('Optometrists', 'optometrists', 'Optometrists and eyewear', 42),
  ('Pest Control', 'pest-control', 'Pest control and fumigation', 43),
  ('Pool Services', 'pool-services', 'Pool builders, maintenance, and supplies', 44),
  ('Recruitment', 'recruitment', 'Recruitment agencies and HR services', 45),
  ('Roofing', 'roofing', 'Roofers and waterproofing', 46),
  ('Solar & Energy', 'solar-energy', 'Solar installers and energy solutions', 47),
  ('Tailors & Alterations', 'tailors-alterations', 'Tailors, dressmakers, and alterations', 48),
  ('Telecommunications', 'telecommunications', 'Telcos, internet, and connectivity', 49),
  ('Waste Management', 'waste-management', 'Waste removal and recycling', 50);

-- Subcategories: Automotive
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Car Dealerships', 'car-dealerships', 1),
  ('Car Wash', 'car-wash', 2),
  ('Panel Beaters', 'panel-beaters', 3),
  ('Tyre Shops', 'tyre-shops', 4),
  ('Auto Electricians', 'auto-electricians', 5),
  ('Tow Trucks', 'tow-trucks', 6),
  ('Vehicle Tracking', 'vehicle-tracking', 7),
  ('Car Rental', 'car-rental', 8)
) AS s(name, slug, ord) WHERE p.slug = 'automotive';

-- Building & Construction
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('General Contractors', 'general-contractors', 1),
  ('Architects', 'architects', 2),
  ('Quantity Surveyors', 'quantity-surveyors', 3),
  ('Bricklayers', 'bricklayers', 4),
  ('Carpenters', 'carpenters', 5),
  ('Painters', 'painters', 6),
  ('Tilers', 'tilers', 7),
  ('Plasterers', 'plasterers', 8),
  ('Demolition', 'demolition', 9),
  ('Scaffolding', 'scaffolding', 10)
) AS s(name, slug, ord) WHERE p.slug = 'building-construction';

-- Business Services
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Virtual Assistants', 'virtual-assistants', 1),
  ('Business Coaching', 'business-coaching', 2),
  ('Translation Services', 'translation-services', 3),
  ('Typing Services', 'typing-services', 4),
  ('Office Supplies', 'office-supplies', 5),
  ('Call Centres', 'call-centres', 6)
) AS s(name, slug, ord) WHERE p.slug = 'business-services';

-- Cleaning Services
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('House Cleaning', 'house-cleaning', 1),
  ('Office Cleaning', 'office-cleaning', 2),
  ('Carpet Cleaning', 'carpet-cleaning', 3),
  ('Window Cleaning', 'window-cleaning', 4),
  ('Industrial Cleaning', 'industrial-cleaning', 5),
  ('Dry Cleaning', 'dry-cleaning', 6)
) AS s(name, slug, ord) WHERE p.slug = 'cleaning-services';

-- Education & Training
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Private Schools', 'private-schools', 1),
  ('Tutors', 'tutors', 2),
  ('Driving Schools', 'driving-schools', 3),
  ('Training Providers', 'training-providers', 4),
  ('Day Care Centres', 'day-care-centres', 5),
  ('Music Schools', 'music-schools', 6)
) AS s(name, slug, ord) WHERE p.slug = 'education-training';

-- Electrical Services
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Electricians', 'electricians', 1),
  ('Electrical Contractors', 'electrical-contractors', 2),
  ('Generator Services', 'generator-services', 3),
  ('COC Certificates', 'coc-certificates', 4),
  ('Solar Electricians', 'solar-electricians', 5)
) AS s(name, slug, ord) WHERE p.slug = 'electrical-services';

-- Events & Entertainment
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Event Planners', 'event-planners', 1),
  ('DJs', 'djs', 2),
  ('Catering', 'catering', 3),
  ('Marquees & Tents', 'marquees-tents', 4),
  ('Party Supplies', 'party-supplies', 5),
  ('MCs & Hosts', 'mcs-hosts', 6)
) AS s(name, slug, ord) WHERE p.slug = 'events-entertainment';

-- Financial Services
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Accountants', 'accountants', 1),
  ('Bookkeepers', 'bookkeepers', 2),
  ('Tax Consultants', 'tax-consultants', 3),
  ('Financial Advisors', 'financial-advisors', 4),
  ('Insurance Brokers', 'insurance-brokers', 5),
  ('Auditors', 'auditors', 6)
) AS s(name, slug, ord) WHERE p.slug = 'financial-services';

-- Food & Beverage
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Restaurants', 'restaurants', 1),
  ('Takeaways', 'takeaways', 2),
  ('Bakeries', 'bakeries', 3),
  ('Coffee Shops', 'coffee-shops', 4),
  ('Butcheries', 'butcheries', 5),
  ('Food Trucks', 'food-trucks', 6)
) AS s(name, slug, ord) WHERE p.slug = 'food-beverage';

-- Health & Medical
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('General Practitioners', 'general-practitioners', 1),
  ('Specialists', 'specialists', 2),
  ('Pharmacies', 'pharmacies', 3),
  ('Physiotherapists', 'physiotherapists', 4),
  ('Psychologists', 'psychologists', 5),
  ('Home Nursing', 'home-nursing', 6),
  ('Medical Labs', 'medical-labs', 7)
) AS s(name, slug, ord) WHERE p.slug = 'health-medical';

-- Home & Garden
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Landscaping', 'landscaping', 1),
  ('Garden Services', 'garden-services', 2),
  ('Tree Felling', 'tree-felling', 3),
  ('Irrigation', 'irrigation', 4),
  ('Nurseries', 'nurseries', 5),
  ('Hardware Stores', 'hardware-stores', 6)
) AS s(name, slug, ord) WHERE p.slug = 'home-garden';

-- Hospitality & Tourism
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Hotels', 'hotels', 1),
  ('Guest Houses', 'guest-houses', 2),
  ('B&Bs', 'bed-and-breakfast', 3),
  ('Tour Operators', 'tour-operators', 4),
  ('Safari Lodges', 'safari-lodges', 5),
  ('Travel Agents', 'travel-agents', 6)
) AS s(name, slug, ord) WHERE p.slug = 'hospitality-tourism';

-- IT & Technology
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('IT Support', 'it-support', 1),
  ('Web Design', 'web-design', 2),
  ('Software Development', 'software-development', 3),
  ('Computer Repairs', 'computer-repairs', 4),
  ('CCTV Installation', 'cctv-installation', 5),
  ('Network Installation', 'network-installation', 6),
  ('App Development', 'app-development', 7)
) AS s(name, slug, ord) WHERE p.slug = 'it-technology';

-- Legal Services
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Attorneys', 'attorneys', 1),
  ('Conveyancers', 'conveyancers', 2),
  ('Labour Lawyers', 'labour-lawyers', 3),
  ('Family Law', 'family-law', 4),
  ('Debt Counsellors', 'debt-counsellors', 5),
  ('Notaries', 'notaries', 6)
) AS s(name, slug, ord) WHERE p.slug = 'legal-services';

-- Plumbing Services
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Plumbers', 'plumbers', 1),
  ('Drain Cleaning', 'drain-cleaning', 2),
  ('Geyser Installation', 'geyser-installation', 3),
  ('Bathroom Renovations', 'bathroom-renovations', 4),
  ('Leak Detection', 'leak-detection', 5)
) AS s(name, slug, ord) WHERE p.slug = 'plumbing-services';

-- Real Estate
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Estate Agents', 'estate-agents', 1),
  ('Property Management', 'property-management', 2),
  ('Letting Agents', 'letting-agents', 3),
  ('Property Valuers', 'property-valuers', 4),
  ('Bond Originators', 'bond-originators', 5)
) AS s(name, slug, ord) WHERE p.slug = 'real-estate';

-- Retail & Shopping
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Clothing Stores', 'clothing-stores', 1),
  ('Electronics Shops', 'electronics-shops', 2),
  ('Furniture Stores', 'furniture-stores', 3),
  ('Supermarkets', 'supermarkets', 4),
  ('Cellphone Shops', 'cellphone-shops', 5),
  ('Jewellery Stores', 'jewellery-stores', 6)
) AS s(name, slug, ord) WHERE p.slug = 'retail-shopping';

-- Security Services
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Security Companies', 'security-companies', 1),
  ('Alarm Systems', 'alarm-systems', 2),
  ('Armed Response', 'armed-response', 3),
  ('Access Control', 'access-control', 4),
  ('Private Investigators', 'private-investigators', 5)
) AS s(name, slug, ord) WHERE p.slug = 'security-services';

-- Transport & Logistics
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Couriers', 'couriers', 1),
  ('Removal Companies', 'removal-companies', 2),
  ('Taxi Services', 'taxi-services', 3),
  ('Trucking', 'trucking', 4),
  ('Freight Forwarders', 'freight-forwarders', 5),
  ('Airport Transfers', 'airport-transfers', 6)
) AS s(name, slug, ord) WHERE p.slug = 'transport-logistics';

-- Beauty & Wellness
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Hair Salons', 'hair-salons', 1),
  ('Nail Salons', 'nail-salons', 2),
  ('Spas', 'spas', 3),
  ('Massage Therapists', 'massage-therapists', 4),
  ('Makeup Artists', 'makeup-artists', 5),
  ('Barbers', 'barbers', 6)
) AS s(name, slug, ord) WHERE p.slug = 'beauty-wellness';

-- Pet Services
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Veterinarians', 'veterinarians', 1),
  ('Pet Grooming', 'pet-grooming', 2),
  ('Pet Shops', 'pet-shops', 3),
  ('Dog Training', 'dog-training', 4),
  ('Pet Boarding', 'pet-boarding', 5)
) AS s(name, slug, ord) WHERE p.slug = 'pet-services';

-- Photography & Video
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Wedding Photographers', 'wedding-photographers', 1),
  ('Portrait Photographers', 'portrait-photographers', 2),
  ('Videographers', 'videographers', 3),
  ('Drone Photography', 'drone-photography', 4),
  ('Product Photography', 'product-photography', 5)
) AS s(name, slug, ord) WHERE p.slug = 'photography-video';

-- Printing & Signage
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Printers', 'printers', 1),
  ('Sign Makers', 'sign-makers', 2),
  ('Banner Printing', 'banner-printing', 3),
  ('Embroidery', 'embroidery', 4),
  ('Vehicle Wrapping', 'vehicle-wrapping', 5)
) AS s(name, slug, ord) WHERE p.slug = 'printing-signage';

-- Solar & Energy
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Solar Installers', 'solar-installers', 1),
  ('Solar Maintenance', 'solar-maintenance', 2),
  ('Inverters & Batteries', 'inverters-batteries', 3),
  ('Energy Audits', 'energy-audits', 4)
) AS s(name, slug, ord) WHERE p.slug = 'solar-energy';

-- Roofing
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Roofers', 'roofers', 1),
  ('Waterproofing', 'waterproofing', 2),
  ('Roof Repairs', 'roof-repairs', 3),
  ('Thatch Roofing', 'thatch-roofing', 4)
) AS s(name, slug, ord) WHERE p.slug = 'roofing';

-- Mechanics
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Auto Mechanics', 'auto-mechanics', 1),
  ('Diesel Mechanics', 'diesel-mechanics', 2),
  ('Motorcycle Mechanics', 'motorcycle-mechanics', 3),
  ('Truck Repairs', 'truck-repairs', 4)
) AS s(name, slug, ord) WHERE p.slug = 'mechanics';

-- Marketing & Advertising
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Digital Marketing', 'digital-marketing', 1),
  ('Social Media Marketing', 'social-media-marketing', 2),
  ('SEO Services', 'seo-services', 3),
  ('Graphic Design', 'graphic-design', 4),
  ('Branding Agencies', 'branding-agencies', 5),
  ('PR Agencies', 'pr-agencies', 6)
) AS s(name, slug, ord) WHERE p.slug = 'marketing-advertising';

-- Handyman Services
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('General Handyman', 'general-handyman', 1),
  ('Appliance Repairs', 'appliance-repairs', 2),
  ('Furniture Assembly', 'furniture-assembly', 3),
  ('Gate Motors', 'gate-motors', 4),
  ('Garage Doors', 'garage-doors', 5)
) AS s(name, slug, ord) WHERE p.slug = 'handyman-services';

-- Pest Control
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Pest Control', 'pest-control-services', 1),
  ('Fumigation', 'fumigation', 2),
  ('Termite Treatment', 'termite-treatment', 3),
  ('Rodent Control', 'rodent-control', 4)
) AS s(name, slug, ord) WHERE p.slug = 'pest-control';

-- Pool Services
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Pool Builders', 'pool-builders', 1),
  ('Pool Maintenance', 'pool-maintenance', 2),
  ('Pool Repairs', 'pool-repairs', 3),
  ('Pool Supplies', 'pool-supplies', 4)
) AS s(name, slug, ord) WHERE p.slug = 'pool-services';

-- Agriculture & Farming
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Farm Supplies', 'farm-supplies', 1),
  ('Agricultural Equipment', 'agricultural-equipment', 2),
  ('Livestock Services', 'livestock-services', 3),
  ('Irrigation Systems', 'irrigation-systems', 4),
  ('Veterinary Services', 'veterinary-services', 5)
) AS s(name, slug, ord) WHERE p.slug = 'agriculture-farming';

-- Fitness & Gym
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Gyms', 'gyms', 1),
  ('Personal Trainers', 'personal-trainers', 2),
  ('Yoga Studios', 'yoga-studios', 3),
  ('CrossFit', 'crossfit', 4),
  ('Martial Arts', 'martial-arts', 5)
) AS s(name, slug, ord) WHERE p.slug = 'fitness-gym';

-- Interior Design
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Interior Designers', 'interior-designers', 1),
  ('Kitchen Designers', 'kitchen-designers', 2),
  ('Curtain & Blinds', 'curtain-blinds', 3),
  ('Flooring', 'flooring', 4),
  ('Upholstery', 'upholstery', 5)
) AS s(name, slug, ord) WHERE p.slug = 'interior-design';

-- Waste Management
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Skip Hire', 'skip-hire', 1),
  ('Rubbish Removal', 'rubbish-removal', 2),
  ('Recycling', 'recycling', 3),
  ('Hazardous Waste', 'hazardous-waste', 4)
) AS s(name, slug, ord) WHERE p.slug = 'waste-management';

-- Telecommunications
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Internet Providers', 'internet-providers', 1),
  ('Fibre Installation', 'fibre-installation', 2),
  ('VoIP Services', 'voip-services', 3),
  ('PBX Systems', 'pbx-systems', 4)
) AS s(name, slug, ord) WHERE p.slug = 'telecommunications';

-- Recruitment
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Recruitment Agencies', 'recruitment-agencies', 1),
  ('Temp Staffing', 'temp-staffing', 2),
  ('Executive Search', 'executive-search', 3),
  ('CV Writing', 'cv-writing', 4)
) AS s(name, slug, ord) WHERE p.slug = 'recruitment';

-- Consulting
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Management Consulting', 'management-consulting', 1),
  ('HR Consulting', 'hr-consulting', 2),
  ('Strategy Consulting', 'strategy-consulting', 3),
  ('ISO Consulting', 'iso-consulting', 4)
) AS s(name, slug, ord) WHERE p.slug = 'consulting';

-- Engineering
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Civil Engineers', 'civil-engineers', 1),
  ('Mechanical Engineers', 'mechanical-engineers', 2),
  ('Electrical Engineers', 'electrical-engineers', 3),
  ('Structural Engineers', 'structural-engineers', 4)
) AS s(name, slug, ord) WHERE p.slug = 'engineering';

-- Manufacturing
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Steel Fabrication', 'steel-fabrication', 1),
  ('Plastic Manufacturing', 'plastic-manufacturing', 2),
  ('Food Manufacturing', 'food-manufacturing', 3),
  ('Packaging', 'packaging', 4)
) AS s(name, slug, ord) WHERE p.slug = 'manufacturing';

-- Locksmiths
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Emergency Locksmiths', 'emergency-locksmiths', 1),
  ('Auto Locksmiths', 'auto-locksmiths', 2),
  ('Safe Installation', 'safe-installation', 3)
) AS s(name, slug, ord) WHERE p.slug = 'locksmiths';

-- Childcare & Babysitting
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Crèches', 'creches', 1),
  ('Aftercare', 'aftercare', 2),
  ('Babysitters', 'babysitters', 3),
  ('Au Pairs', 'au-pairs', 4)
) AS s(name, slug, ord) WHERE p.slug = 'childcare-babysitting';

-- Funeral Services
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Funeral Parlours', 'funeral-parlours', 1),
  ('Crematoriums', 'crematoriums', 2),
  ('Tombstone Makers', 'tombstone-makers', 3)
) AS s(name, slug, ord) WHERE p.slug = 'funeral-services';

-- Dentists
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('General Dentists', 'general-dentists', 1),
  ('Orthodontists', 'orthodontists', 2),
  ('Oral Surgeons', 'oral-surgeons', 3),
  ('Dental Labs', 'dental-labs', 4)
) AS s(name, slug, ord) WHERE p.slug = 'dentists';

-- Optometrists
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Optometrists', 'optometrists-services', 1),
  ('Opticians', 'opticians', 2),
  ('Contact Lenses', 'contact-lenses', 3)
) AS s(name, slug, ord) WHERE p.slug = 'optometrists';

-- Tailors & Alterations
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Tailors', 'tailors', 1),
  ('Dressmakers', 'dressmakers', 2),
  ('Uniform Suppliers', 'uniform-suppliers', 3),
  ('Embroidery Services', 'embroidery-services', 4)
) AS s(name, slug, ord) WHERE p.slug = 'tailors-alterations';

-- Music & Instruments
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Music Teachers', 'music-teachers', 1),
  ('Instrument Shops', 'instrument-shops', 2),
  ('Instrument Repairs', 'instrument-repairs', 3),
  ('Recording Studios', 'recording-studios', 4)
) AS s(name, slug, ord) WHERE p.slug = 'music-instruments';

-- Arts & Crafts
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Artists', 'artists', 1),
  ('Craft Shops', 'craft-shops', 2),
  ('Pottery', 'pottery', 3),
  ('Art Classes', 'art-classes', 4)
) AS s(name, slug, ord) WHERE p.slug = 'arts-crafts';

-- NGO & Community
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Charities', 'charities', 1),
  ('Community Centres', 'community-centres', 2),
  ('Youth Organisations', 'youth-organisations', 3),
  ('Religious Organisations', 'religious-organisations', 4)
) AS s(name, slug, ord) WHERE p.slug = 'ngo-community';

-- Mining & Resources
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Mining Contractors', 'mining-contractors', 1),
  ('Mining Equipment', 'mining-equipment', 2),
  ('Mine Safety', 'mine-safety', 3)
) AS s(name, slug, ord) WHERE p.slug = 'mining-resources';

-- Automotive Parts
INSERT INTO categories (parent_id, name, slug, sort_order)
SELECT p.id, s.name, s.slug, s.ord FROM categories p,
(VALUES
  ('Spare Parts', 'spare-parts', 1),
  ('Accessories', 'auto-accessories', 2),
  ('Batteries', 'batteries', 3),
  ('Car Audio', 'car-audio', 4)
) AS s(name, slug, ord) WHERE p.slug = 'automotive-parts';
