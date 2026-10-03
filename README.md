# یدکی لند ایران

فروشگاه React/Vite با بک‌اند واقعی **Supabase + PostgreSQL + Auth**.

## معماری
- Frontend: React + Vite
- Database/API/Auth: Supabase
- دیتابیس: PostgreSQL
- امنیت: Row Level Security
- ثبت سفارش و کاهش موجودی: PostgreSQL RPC و تراکنش دیتابیس
- پنل مدیریت: Supabase Auth + نقش admin
- Hosting فعلی: GitHub Pages

Supabase برای React از `@supabase/supabase-js` و متغیرهای `VITE_SUPABASE_URL` و `VITE_SUPABASE_PUBLISHABLE_KEY` استفاده می‌کند.

## راه‌اندازی بک‌اند

1. در Supabase یک Project بساز.
2. در SQL Editor، فایل زیر را کامل اجرا کن:
   `supabase/migrations/001_initial_store.sql`
3. در Authentication > Users یک کاربر مدیر بساز.
4. بعد از ساخته‌شدن کاربر، در SQL Editor این دستور را اجرا کن و ایمیل مدیر را جایگزین کن:

```sql
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users where email = 'YOUR_ADMIN_EMAIL'
);
```

5. مقدارهای زیر را در GitHub Repository > Settings > Secrets and variables > Actions > Variables بساز:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`

6. یک Push جدید به `main` بزن یا Workflow را دستی اجرا کن.

## اجرای محلی

فایل `.env.example` را به `.env.local` تبدیل کن و مقدارهای Supabase را وارد کن:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

سپس:

```bash
npm install
npm run dev
```

## وضعیت فعلی

هسته فروشگاه دیگر برای محصولات، سفارش‌ها، موجودی، تخفیف‌ها و پنل مدیریت به localStorage متکی نیست. سبد خرید محلی می‌تواند در مرورگر باقی بماند، اما ثبت نهایی سفارش در دیتابیس انجام می‌شود.

**پرداخت آنلاین هنوز متصل نشده است.** مرحله بعد اتصال درگاه پرداخت و callback/webhook امن آن به وضعیت پرداخت سفارش است.
