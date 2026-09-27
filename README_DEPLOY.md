# Mr Tom Gadgets — Deploy Guide (ডিপ্লয় গাইড)

Full-stack Next.js + PostgreSQL e-commerce website. Apnar frontend (`sur10`) + complete backend, database, SEO, analytics — sob ready.

---

## 1) Sobcheye sohoj: Vercel + Neon (FREE, 10 minute)

### Step 1 — Database banan (Neon, free)
1. https://neon.tech → Sign up → **New Project** → name `mrtom` → Create
2. Dashboard theke **Connection string** copy korun, dekhte emon:
   `postgresql://user:pass@ep-xxx.neon.tech:5432/mrtom?sslmode=require`

### Step 2 — Code push korun GitHub-e
```bash
git add -A
git commit -m "Mr Tom Gadgets fullstack"
git push
```

### Step 3 — Vercel-e deploy
1. https://vercel.com → **Add New → Project** → apnar repo select → **Import**
2. **Environment Variables**-e jog korun:
   - `DATABASE_URL` = (Neon connection string)
   - `NEXT_PUBLIC_SITE_URL` = `https://apnar-domain.vercel.app` (pore custom domain dile update korben)
3. **Deploy** click korun ☁️

### Step 4 — Database table + demo data (1 bar)
Deploy sesh hole browser-e jan:
1. `https://apnar-domain.vercel.app/api/health` → `{"ok":true}` dekhabe
2. Tarpor terminal / PowerShell theke (repo folder-e):
   ```bash
   npm install
   # .env file-e Neon DATABASE_URL bosan, tarpor:
   npx drizzle-kit push
   curl -X POST https://apnar-domain.vercel.app/api/seed
   ```
   ✅ 1200+ product, category, coupon, admin user load hoye jabe!

### Step 5 — Login korun
- Site: `https://apnar-domain.vercel.app`
- Admin: `/account` → **Admin Demo** (ba email `admin@mrtomgadgets.com` / pass `admin123`)
- Analytics: `/admin/analytics`

> ⚠️ Live site-e jaoar age admin password bodle nin (database-e `users` table-e, ba notun admin banan).

---

## 2) VPS-e deploy (Hostinger / Contabo / DigitalOcean — Docker)

VPS-e Ubuntu + Docker thakle:

```bash
git clone <apnar-repo-url> mrtom && cd mrtom
cp .env.example .env
# .env file-e DB_PASSWORD (strong) + NEXT_PUBLIC_SITE_URL bosan
docker compose up -d --build
# database table toiri:
docker compose exec app npx drizzle-kit push
# demo data load:
curl -X POST http://localhost:3000/api/seed
```

Site cholbe: `http://SERVER-IP:3000` ✅
Domain + HTTPS-এর jonno Nginx Proxy Manager / Caddy use korun (port 3000-এ proxy).

---

## 3) cPanel shared hosting?

Next.js cPanel shared hosting-e chole **na**. VPS ( CVPS / Hostinger VPS) ba Vercel use korun.

---

## 4) Environment variables (sob)

| Variable | Kothay | Kaj |
|---|---|---|
| `DATABASE_URL` | server | PostgreSQL connection (secret!) |
| `NEXT_PUBLIC_SITE_URL` | public | SEO canonical/sitemap/OG URL |
| `NEXT_PUBLIC_CHAT_*` | public | Live-chat AI key (optional — na dile offline assistant cholbe) |

---

## 5) Dorkari command

```bash
npm run dev          # local development
npm run build        # production build check
npx drizzle-kit push # schema → database (table banay/update kore)
```

## 6) Ki ki ache (feature list)

- 🛍️ Full store: home, category, brand, product, search, cart, checkout, wishlist, compare, EMI, exchange, pre-order, offers, blog, career, contact, track-order
- 🔐 Real login/register (mobile ba email), session, admin role
- 📦 Real orders: stock kombe, coupon validate, order tracking
- 📊 Analytics: ke kon product dekhlo/kinlo, ke login korlo, kon button chaplo, funnel, image health → `/admin/analytics`
- 🖼️ Img tracking: impression/load/error — browser + server duitate
- 🌱 Eco-friendly: lazy-load image, async decode, preconnect CDN, zero heavy lib, reduced-motion support
- 🔍 SEO: metadata, Open Graph, Twitter card, JSON-LD (Organization/WebSite/Product), sitemap.xml, robots.txt, canonical
- 💬 Live chat: offline smart assistant + optional Groq/Gemini/OpenAI key

## 7) Custom domain (Vercel)

Vercel Project → **Settings → Domains** → apnar domain (`mrtomgadgets.com`) add → DNS-e dekhano record bosan → `NEXT_PUBLIC_SITE_URL` update kore **Redeploy**.

---
Made with ❤️ in Bangladesh 🇧🇩
