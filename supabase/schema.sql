-- ====================================================================
-- MAAJI RAJ MEDICAL AND COSMETICS - SUPABASE DATABASE SCHEMA
-- Sector-14, Govardhan Vilas, Udaipur
-- Safe Idempotent Execution Script
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    sku TEXT,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    mrp NUMERIC(10, 2),
    stock INTEGER NOT NULL DEFAULT 0,
    is_available BOOLEAN NOT NULL DEFAULT true,
    is_prescription_required BOOLEAN NOT NULL DEFAULT false,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    discount_percent INTEGER DEFAULT 0,
    image TEXT,
    batch_number TEXT,
    dosage_form TEXT,
    pack_size TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    icon_name TEXT,
    description TEXT,
    subcategories JSONB DEFAULT '[]'::jsonb,
    banner_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    landmark TEXT,
    user_lat NUMERIC(10, 6),
    user_lng NUMERIC(10, 6),
    distance_km NUMERIC(6, 2),
    is_within_radius BOOLEAN DEFAULT true,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'New',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. SHOP SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.shop_settings (
    id TEXT PRIMARY KEY DEFAULT 'primary',
    shop_name TEXT NOT NULL DEFAULT 'Maaji Raj Medical and Cosmetics',
    owner_name TEXT NOT NULL DEFAULT 'Tushar Sharma',
    phone TEXT NOT NULL DEFAULT '7737116439',
    whatsapp_number TEXT NOT NULL DEFAULT '917737116439',
    address TEXT NOT NULL DEFAULT 'ADD. 81, S-2, 100 FEET ROAD NEAR KALAJI BHAVJI, SECTOR-14, GOVARDHAN VILAS, UDAIPUR',
    origin_lat NUMERIC(10, 6) NOT NULL DEFAULT 24.5428,
    origin_lng NUMERIC(10, 6) NOT NULL DEFAULT 73.6912,
    delivery_radius_km NUMERIC(5, 2) NOT NULL DEFAULT 15.0,
    opening_hours TEXT NOT NULL DEFAULT 'Mon – Sat: 8:00 AM – 10:30 PM | Sun: 9:00 AM – 9:00 PM',
    emergency_notice TEXT,
    admin_pin TEXT NOT NULL DEFAULT '1234',
    google_maps_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_settings ENABLE ROW LEVEL SECURITY;

-- Products Policies (Drop existing then recreate)
DROP POLICY IF EXISTS "Public Read Products" ON public.products;
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow Insert/Update Products" ON public.products;
CREATE POLICY "Allow Insert/Update Products" ON public.products FOR ALL USING (true) WITH CHECK (true);

-- Categories Policies
DROP POLICY IF EXISTS "Public Read Categories" ON public.categories;
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow Modify Categories" ON public.categories;
CREATE POLICY "Allow Modify Categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

-- Orders Policies
DROP POLICY IF EXISTS "Public Insert Orders" ON public.orders;
CREATE POLICY "Public Insert Orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Orders" ON public.orders;
CREATE POLICY "Public Read Orders" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Update Orders" ON public.orders;
CREATE POLICY "Public Update Orders" ON public.orders FOR UPDATE USING (true) WITH CHECK (true);

-- Shop Settings Policies
DROP POLICY IF EXISTS "Public Read Settings" ON public.shop_settings;
CREATE POLICY "Public Read Settings" ON public.shop_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Update Settings" ON public.shop_settings;
CREATE POLICY "Public Update Settings" ON public.shop_settings FOR ALL USING (true) WITH CHECK (true);

-- 7. INITIAL SHOP SETTINGS INSERT
INSERT INTO public.shop_settings (id, shop_name, owner_name, phone, whatsapp_number, address, origin_lat, origin_lng, delivery_radius_km, opening_hours, admin_pin, google_maps_url)
VALUES (
    'primary',
    'Maaji Raj Medical and Cosmetics',
    'Tushar Sharma',
    '7737116439',
    '917737116439',
    'ADD. 81, S-2, 100 FEET ROAD NEAR KALAJI BHAVJI, SECTOR-14, GOVARDHAN VILAS, UDAIPUR',
    24.5428,
    73.6912,
    15.0,
    'Mon – Sat: 8:00 AM – 10:30 PM | Sun: 9:00 AM – 9:00 PM',
    '1234',
    'https://maps.google.com/?q=81+S-2+100+Feet+Road+Sector+14+Govardhan+Vilas+Udaipur'
)
ON CONFLICT (id) DO NOTHING;

-- 8. INITIAL SEED CATEGORIES
INSERT INTO public.categories (id, name, slug, type, icon_name, description, subcategories, banner_image)
VALUES
('medicines', 'Medicines', 'medicines', 'medical', 'Pill', 'Essential prescription and OTC pharmaceuticals, tablets, syrups & remedies.', '["Fever & Pain Relief", "Cold & Cough", "Digestive Care", "Allergy", "Vitamins & Supplements", "General Medicines", "Children''s Medicines", "Other Medicines"]', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1200&auto=format&fit=crop&q=80'),
('medical-supplies', 'Medical Supplies', 'medical-supplies', 'medical', 'ShieldAlert', 'First aid kits, thermometers, BP monitors, surgical gauze & home care essentials.', '["Bandages", "Wound Care", "First Aid", "Surgical Supplies", "Personal Medical Equipment", "Other Medical Supplies"]', 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=1200&auto=format&fit=crop&q=80'),
('skin-care', 'Skin Care / Face', 'skin-care', 'cosmetic', 'Sparkles', 'Dermatologist-tested face washes, sunscreens, moisturizers, serums & acne care.', '["Face Wash", "Moisturizers", "Acne Care", "Sunscreen", "Face Treatments", "Cleansers", "Creams & Lotions"]', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1200&auto=format&fit=crop&q=80'),
('body-care', 'Body Care', 'body-care', 'cosmetic', 'HeartPulse', 'Nourishing body lotions, therapeutic body washes, deodorants & luxury soaps.', '["Body Wash", "Body Lotion", "Soaps", "Deodorants", "Body Treatments"]', 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=1200&auto=format&fit=crop&q=80'),
('hair-care', 'Hair Care', 'hair-care', 'cosmetic', 'Scissors', 'Anti-dandruff solutions, Ayurvedic hair oils, nourishing shampoos & conditioners.', '["Shampoo", "Conditioner", "Hair Oil", "Hair Treatment", "Hair Styling"]', 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=1200&auto=format&fit=crop&q=80'),
('cosmetics', 'Cosmetics & Beauty', 'cosmetics', 'cosmetic', 'Palette', 'Lipsticks, kajal, compacts, nail colors and premium Indian beauty products.', '["Makeup", "Lip Care", "Lip Products", "Eye Care", "Beauty Products", "Other Cosmetics"]', 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1200&auto=format&fit=crop&q=80'),
('baby-care', 'Baby Care', 'baby-care', 'general', 'Baby', 'Gentle baby soaps, baby lotions, diapers, wipes and pediatrician-recommended items.', '["Baby Skin Care", "Baby Hygiene", "Baby Essentials"]', 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1200&auto=format&fit=crop&q=80'),
('personal-care', 'Personal Care & Hygiene', 'personal-care', 'general', 'Smile', 'Oral health, feminine hygiene, men''s grooming and daily sanitization needs.', '["Oral Care", "Feminine Hygiene", "Men''s Grooming", "Hygiene Products"]', 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=1200&auto=format&fit=crop&q=80')
ON CONFLICT (id) DO NOTHING;

-- 9. INITIAL SEED PRODUCTS (Ceflox, Dolo, Augmentin, Cetaphil, Lakme, etc.)
INSERT INTO public.products (id, sku, name, brand, category, subcategory, description, price, mrp, stock, is_available, is_prescription_required, is_featured, discount_percent, image, batch_number, dosage_form, pack_size)
VALUES
('prod-001', 'MED-CEF-500', 'Ceflox 500mg Tablet', 'Cipla', 'Medicines', 'General Medicines', 'Ciprofloxacin 500mg broad-spectrum antibiotic for treating bacterial infections. Take strictly as advised by your physician.', 48.00, 55.00, 45, true, true, true, 12, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80', 'BCH-CFX-2024A', 'Tablets', 'Strip of 10 Tablets'),
('prod-002', 'MED-DOLO-650', 'Dolo 650mg Tablet', 'Micro Labs', 'Medicines', 'Fever & Pain Relief', 'Paracetamol 650mg for prompt relief from fever, headache, body ache and mild pain.', 33.50, 35.00, 120, true, false, true, 5, 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80', 'BCH-DL65-983', 'Tablets', 'Strip of 15 Tablets'),
('prod-003', 'MED-AUG-625', 'Augmentin 625 Duo Tablet', 'GSK', 'Medicines', 'General Medicines', 'Amoxycillin and Potassium Clavulanate Tablets IP (500mg + 125mg). Effective anti-bacterial formulation.', 215.00, 235.00, 30, true, true, true, 8, 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80', 'BCH-AUG-772', 'Tablets', 'Strip of 10 Tablets'),
('prod-004', 'MED-PAN-D', 'Pan-D Capsule', 'Alkem Laboratories', 'Medicines', 'Digestive Care', 'Pantoprazole (40mg) and Domperidone (30mg) for acidity, GERD, heartburn and nausea.', 188.00, 210.00, 65, true, true, true, 10, 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=600&auto=format&fit=crop&q=80', 'BCH-PAND-311', 'Capsules', 'Strip of 15 Capsules'),
('prod-005', 'MED-AZI-500', 'Azithral 500mg Tablet', 'Alembic Pharmaceuticals', 'Medicines', 'General Medicines', 'Azithromycin 500mg used for throat infections, respiratory tract infections and sinusitis.', 128.00, 142.00, 40, true, true, false, 10, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80', 'BCH-AZI-901', 'Tablets', 'Strip of 5 Tablets'),
('prod-024', 'SKN-CETAPHIL-125', 'Cetaphil Gentle Skin Cleanser 125ml', 'Cetaphil', 'Skin Care / Face', 'Cleansers', 'Soap-free, fragrance-free dermatologist-formulated cleanser ideal for sensitive, dry and combination skin.', 365.00, 399.00, 35, true, false, true, 8, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80', 'BCH-CET-125', 'Lotion / Liquid', '125ml Bottle'),
('prod-025', 'SKN-NEUTRO-SPF50', 'Neutrogena Ultra Sheer Dry-Touch Sunscreen SPF 50+', 'Neutrogena', 'Skin Care / Face', 'Sunscreen', 'Broad spectrum UVA/UVB protection with Helioplex technology. Lightweight, matte and non-greasy.', 285.00, 330.00, 45, true, false, true, 14, 'https://images.unsplash.com/photo-1567928815104-b7980ee5032e?w=600&auto=format&fit=crop&q=80', 'BCH-NTG-50M', 'Cream', '30g Tube'),
('prod-041', 'COS-LAKME-MATTE', 'Lakme 9 to 5 Primer + Matte Lipstick (Red Letter)', 'Lakme', 'Cosmetics', 'Lip Products', 'Built-in primer with intense color payoff that lasts up to 12 hours without drying lips.', 450.00, 525.00, 25, true, false, true, 14, 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=80', 'BCH-LAK-RL1', 'Stick', '3.6g'),
('prod-042', 'COS-MAYB-KAJAL', 'Maybelline New York Colossal Kajal (Deep Black)', 'Maybelline', 'Cosmetics', 'Eye Care', '24-hour smudge-proof, waterproof kajal enriched with aloe vera for bold, expressive eyes.', 165.00, 199.00, 65, true, false, true, 17, 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&auto=format&fit=crop&q=80', 'BCH-MAY-KJ2', 'Pencil', '0.35g')
ON CONFLICT (id) DO NOTHING;
