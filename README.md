# 🏥 Maaji Raj Medical and Cosmetics – Udaipur

A modern, mobile-first e-commerce and catalog web platform for **Maaji Raj Medical and Cosmetics** located in Sector-14, Govardhan Vilas, Udaipur.

---

## 🌟 Key Features

* **Mobile-First UX**: Responsive bottom navigation, slide-over cart drawer, and quick one-tap WhatsApp / Call actions.
* **100+ Authentic Products**: Pre-seeded with medicines, dermatological skincare, cosmetics, body care, and healthcare supplies.
* **15 km Geolocation Guard**: Live GPS/location calculation using the Haversine formula based on the store's origin in Sector-14 (`24.5428° N, 73.6912° E`).
* **Prescription Safeguard**: Statutory compliance alerts on prescription items with pharmacist confirmation flow.
* **Order Request System**: Generates unique Order IDs (`#MRMC-XXXX`) with one-tap WhatsApp order summaries and direct phone confirmation (`7737116439`).
* **Secret Admin Portal (`/admin`)**:
  * Product Catalog Management (Add/Edit/Delete, Rx and Featured flags).
  * Quick Inline Inventory Updater (instant stock modification without code changes).
  * Bulk Excel (XLSX) & CSV Importer with automatic column mapping (`ITEM`, `QUANTITY`, `RATE`, `BATCH`).
  * Real-Time Orders Management with live status progression.
* **Supabase Integration**: Ready-to-use PostgreSQL schema with Row Level Security (RLS) policies.

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Build for production
npm run build
```

---

## 🗄️ Backend Setup (Supabase)

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in your Supabase dashboard.
3. Open [`supabase/schema.sql`](./supabase/schema.sql) from this repository, paste the contents into the SQL Editor, and click **Run**.
4. In Supabase, go to **Project Settings** → **API**.
5. Copy your **Project URL** and **anon public key**.
6. Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
7. Restart your development server (`npm run dev`). The store will now sync with your Supabase database!

---

## 🌐 Deploying Frontend to GitHub & Vercel / Netlify

### Push to GitHub:
```bash
git init
git add .
git commit -m "feat: complete Maaji Raj Medical store with Supabase backend support"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/maaji-raj-medical.git
git push -u origin main
```

### Deploy on Vercel:
1. Go to [vercel.com](https://vercel.com) and import your GitHub repository.
2. Under **Environment Variables**, add:
   * `VITE_SUPABASE_URL`
   * `VITE_SUPABASE_ANON_KEY`
3. Click **Deploy**.

---

## 📍 Business Details

* **Shop Name**: Maaji Raj Medical and Cosmetics
* **Proprietor**: Tushar Sharma
* **Phone / WhatsApp**: `7737116439`
* **Address**: ADD. 81, S-2, 100 Feet Road Near Kalaji Bhavji, Sector-14, Govardhan Vilas, Udaipur, Rajasthan
