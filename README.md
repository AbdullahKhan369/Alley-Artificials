# Alley Artificals (React + Vite + Tailwind v4 + Supabase)

Public store (koi login nahi) + admin panel (`/admin`). Orders WhatsApp par jaate hain, payment integration nahi.

## Tumhe ye karna hai (6 steps)

### 1. Project install
```bash
npm install
```

### 2. Supabase project banao
supabase.com par free project banao. Password yaad rakhna.

### 3. Database + storage auto-setup
Dashboard > **SQL Editor** > New query > `supabase/schema.sql` ka poora content paste > **Run**.
Isse tables, security rules, photo bucket (`product-images`) aur 4 main categories + kuch starter sub-categories ban jaate hain.

### 4. Admin account banao
1. Dashboard > **Authentication > Users > Add user** (email + password, "Auto confirm user" ON).
2. `supabase/make_admin.sql` kholo, `YOUR-EMAIL@example.com` ki jagah wahi email likho, SQL Editor mein Run karo.
3. (Zaroori) **Authentication > Sign In / Providers** mein "Allow new users to sign up" OFF kar do.

### 5. Keys `.env` mein
`.env.example` ko copy karke `.env` banao:
```bash
cp .env.example .env
```
Dashboard > **Project Settings > API** se **Project URL** aur **anon public key** paste karo.

### 6. Chalao
```bash
npm run dev
```
Website: http://localhost:5173  |  Admin: http://localhost:5173/admin/login

## Admin se kya kya hota hai
- **Products**: add / edit / delete, 8 tak photos (browser mein khud chhoti + webp ho jaati hain), hide/show, sold out
- **Categories**: sub-categories banao, rename, delete (product form mein bhi "New sub-category" hai)
- **Sale**: product par sale price likho (purani price cut ho kar % badge ke saath), ya bohat saare products tick karke ek saath % discount
- **Orders**: har "Order now" ka record, status badlo, customer ko WhatsApp karo
- **Website settings**: announcement, hero text, about, WhatsApp number, phone, email, address, social links

## Deploy (Vercel / Netlify)
Repo push karo, build command `npm run build`, output `dist`. Environment variables mein dono `VITE_SUPABASE_*` daalo.
SPA rewrite files (`vercel.json`, `public/_redirects`) pehle se hain.

## Notes
- Photos ke liye Supabase ka paid image-transform use nahi hota. Plain public URL hi use hota hai.
- Product delete karne par uski photos storage se bhi delete hoti hain. Edit mein photo "remove" karne par storage se tabhi hatti hai jab Save dabao.
- WhatsApp number format: country code ke saath, bina `+` (jaise `923151284416`).
