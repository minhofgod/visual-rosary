# Community + accounts — Supabase setup

One-time setup Minh does in the Supabase dashboard so the prayer-request wall +
sign-in can be built. After this, the app code (sign-in UI, wall, prayer card,
moderation) gets wired up and tested against your project.

Your Supabase project URL is in `.env` as `VITE_SUPABASE_URL`
(`https://<PROJECT-REF>.supabase.co`). You'll need `<PROJECT-REF>` below.

## 1. Create the tables

Dashboard → **SQL Editor** → **New query** → paste all of
[`supabase/community-schema.sql`](../supabase/community-schema.sql) → **Run**.
It's safe to re-run if you tweak and run again. You should see it succeed with no
errors (a few "already exists" notices are fine).

## 2. Auth URL configuration

Dashboard → **Authentication** → **URL Configuration**:
- **Site URL:** `https://dockinhmancoi.com`
- **Redirect URLs** (add both): `https://dockinhmancoi.com/**` and
  `http://localhost:5173/**` (the second lets us test sign-in in local dev).

## 3. Enable Email (magic link)

Dashboard → **Authentication → Providers → Email**:
- Enable the provider.
- Turn **on** "Confirm email" / passwordless **magic link** sign-in.
- (Optional) Later, customize the email template wording in Vietnamese under
  **Authentication → Email Templates**.

## 4. Enable Google sign-in

**a. Create the Google OAuth client** — [Google Cloud Console](https://console.cloud.google.com/):
1. Create (or pick) a project.
2. **APIs & Services → OAuth consent screen** → External → fill app name
   ("Đọc Kinh Mân Côi"), your support email, and save.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID** →
   type **Web application**.
4. Under **Authorized redirect URIs**, add exactly:
   `https://<PROJECT-REF>.supabase.co/auth/v1/callback`
5. Create → copy the **Client ID** and **Client secret**.

**b. Put them in Supabase** — Dashboard → **Authentication → Providers → Google**:
- Enable, paste the **Client ID** and **Client secret**, save.

## 5. Make yourself an admin

After the code is live and you've **signed in once**, find your user id in
Dashboard → **Authentication → Users**, then in SQL Editor run:
```sql
update public.profiles set is_admin = true where id = 'YOUR-USER-UUID';
```
Moderation from the dashboard (until we add an in-app admin view):
```sql
-- hide/remove a post
update public.prayer_requests set status = 'removed' where id = 'REQUEST-UUID';
-- ban a user (hides all their posts)
update public.profiles set is_banned = true where id = 'USER-UUID';
-- review reports
select * from public.reports order by created_at desc;
```

## 6. Apple sign-in — later

Skipped for now. It needs an **Apple Developer account ($99/yr)** to create a
Services ID + key. When you pursue the iOS App Store, we enable
**Authentication → Providers → Apple** with those credentials and add an "Apple"
button — the rest of the code already accommodates it.

## 7. Don't forget (when we ship)

- **Privacy policy** (`/privacy.html`) gets updated: the app will then collect
  accounts (email) and user-generated content (prayer requests).
- **Google Play → Data safety** form must be updated to declare accounts +
  user content, and the store listing needs the UGC moderation details.

---

When steps 1–4 are done, tell me — I'll build the sign-in flow, the wall, the
"🙏 Praying for you" prayer card, and the report/block moderation UI, and test it
against your project in the dev preview.
