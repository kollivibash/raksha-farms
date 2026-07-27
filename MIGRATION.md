# Migration: Render → Neon + Koyeb + Cloudinary

Moving off paid Render to a free stack, with no change to how the app behaves.

| Piece | From | To | Free tier |
|---|---|---|---|
| Database | Render Postgres | **Neon** | 0.5 GB, never expires |
| Server | Render Web Service | **Koyeb** | 1 service, always-on |
| Product images | Render local disk | **Cloudinary** | 25 credits/month |

**Why Koyeb and not Render's free tier:** free Render web services sleep after
15 minutes idle. The admin order dashboard holds an open SSE connection
(`/orders/events`), which dies on every sleep, and the first customer after a
sleep waits ~50s. Koyeb's free instance does not sleep.

**Why Cloudinary is not optional:** `render.yaml` never declared a `disk:`, so
uploads have been going to ephemeral container storage and getting wiped on
every deploy. That already destroyed the images for 32 products — every
`/uploads/…` URL in the database currently 404s. Free tiers everywhere have
ephemeral filesystems, so images have to live in object storage regardless of
host. This is a fix, not just a move.

> Nothing in this file asks you to send a password, connection string, or API
> key through chat. Every command runs on your machine, against your own
> terminal. Keep it that way.

---

## Before you start

Install the Postgres client tools (needed for `pg_dump`/`psql`):

```bash
brew install postgresql@16
```

Confirm the version is 16 or newer — Neon runs PG 16/17 and an older dump tool
will refuse the restore:

```bash
pg_dump --version
```

---

## Step 1 — Create the three accounts

You have to do this part; I can't create accounts.

1. **Neon** — <https://neon.tech> → sign up → new project, name it `raksha-farms`,
   region closest to Hyderabad (`ap-southeast-1` Singapore).
2. **Koyeb** — <https://koyeb.com> → sign up → connect your GitHub account.
3. **Cloudinary** — <https://cloudinary.com> → sign up → free plan.

---

## Step 2 — Back up the Render database

Get the **External Database URL** from the Render dashboard
(Postgres instance → Connect → External Connection).

Put it in a shell variable so it never lands in your shell history file:

```bash
read -rs "RENDER_DB?Paste Render external DATABASE_URL: " && export RENDER_DB
```

Take the dump:

```bash
pg_dump "$RENDER_DB" --no-owner --no-privileges --format=custom --file=render-backup.dump
```

Confirm it is real and non-empty — expect a few hundred KB and a table list:

```bash
ls -lh render-backup.dump && pg_restore --list render-backup.dump | grep "TABLE DATA" | head -20
```

**Do not continue until this file exists and lists your tables.** This dump is
your rollback.

---

## Step 3 — Restore into Neon

From the Neon dashboard, copy the **pooled** connection string (the host
contains `-pooler`). Use the *direct* (non-pooled) string for the restore —
bulk restores are unhappy through a pooler.

```bash
read -rs "NEON_DIRECT?Paste Neon DIRECT connection string: " && export NEON_DIRECT
pg_restore --no-owner --no-privileges --dbname="$NEON_DIRECT" render-backup.dump
```

A few `already exists` notices are normal. Real errors mention `FATAL` or
`could not connect`.

Verify the row counts match what Render had:

```bash
psql "$NEON_DIRECT" -c "
SELECT 'products' t, count(*) FROM products
UNION ALL SELECT 'orders', count(*) FROM orders
UNION ALL SELECT 'users', count(*) FROM users
UNION ALL SELECT 'product_reviews', count(*) FROM product_reviews
UNION ALL SELECT 'coupons', count(*) FROM coupons;"
```

Expected at time of writing: **108 products**. If products come back 0, stop —
the restore failed and the old database is still live and untouched.

---

## Step 4 — Cloudinary credentials

Cloudinary dashboard → **API Environment variable**. It looks like:

```
cloudinary://123456789012345:abcdefGHIJklmnop@your-cloud-name
```

You'll paste this into Koyeb in the next step. The code already reads it:
if `CLOUDINARY_URL` is set, uploads stream to Cloudinary; if not, they fall
back to the local folder for development.

---

## Step 5 — Deploy the backend to Koyeb

Koyeb → **Create Service** → GitHub → repo `raksha-farms`.

| Setting | Value |
|---|---|
| Branch | `master` |
| Work directory | `backend` |
| Build command | `npm ci --omit=dev` |
| Run command | `npm start` |
| Port | `8000` |
| Health check path | `/health` |
| Instance | Free |
| Region | Washington DC (only free region) |

Add these environment variables (mark the secret ones as **Secret**, not plain):

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `8000` |
| `DATABASE_URL` | Neon **pooled** string (the `-pooler` host) |
| `JWT_SECRET` | copy from Render, or generate a new one |
| `ADMIN_SECRET` | **set a new password — the old one leaked** |
| `CLOUDINARY_URL` | from step 4 |
| `CLIENT_URL` | `https://www.rakshafarms.com` |
| `ADMIN_URL` | `https://raksha-farms-vxa5.vercel.app` |
| `RAZORPAY_KEY_ID` | copy from Render |
| `RAZORPAY_KEY_SECRET` | copy from Render |
| `GOOGLE_CLIENT_ID` | copy from Render |

> Use the **pooled** Neon string here, not the direct one. A web server opens
> and closes many short connections; the pooler is built for that and the
> direct endpoint will exhaust its connection limit.

Deploy, then check it is alive:

```bash
curl -s https://<your-koyeb-app>.koyeb.app/health
curl -s "https://<your-koyeb-app>.koyeb.app/api/products?limit=1" | head -c 200
```

---

## Step 6 — Point the frontends at Koyeb

Two places, both in Vercel → Project → Settings → Environment Variables:

- **Customer site**: `VITE_API_URL` = `https://<your-koyeb-app>.koyeb.app`
- **Admin panel**: `NEXT_PUBLIC_API_URL` = `https://<your-koyeb-app>.koyeb.app/api`

Note the `/api` suffix on the admin one and its absence on the customer one —
that asymmetry is existing behaviour, not a mistake.

Redeploy both from the Vercel dashboard (env changes need a rebuild).

Also update `frontend/.env.production` in the repo so local production builds
match, then commit.

---

## Step 7 — Verify before switching off Render

Work through this on the live site with Render still running:

- [ ] Storefront loads and shows **108 products**
- [ ] Product detail page opens; reviews load
- [ ] Add to cart → checkout → **saved address prefills**
- [ ] Place a test order → appears in admin Orders
- [ ] Admin login works with the **new** `ADMIN_SECRET`
- [ ] Admin Orders page receives live updates (confirms SSE survived)
- [ ] POS: pick a repeat customer → phone **and address** autofill
- [ ] POS: bill a weight item, print — receipt is dark and bold
- [ ] **Upload a product image → reload → still there** (the Cloudinary fix)
- [ ] Bulk import a small CSV

The image upload check is the important one. It is the failure the old setup
had, so it is the thing most worth proving.

---

## Step 8 — Decommission Render

Only after everything above passes:

1. Keep `render-backup.dump` somewhere safe — that is your point-in-time rollback.
2. Render dashboard → suspend the web service and the database first.
3. Leave them suspended a week. If nothing breaks, delete them.

**Rolling back**, if needed: set the Vercel env vars back to
`https://raksha-farms.onrender.com` and redeploy. That is the whole rollback —
which is why Render must stay suspended-not-deleted until you are confident.

---

## The 32 lost images

The database still holds `/uploads/…` paths for 32 products whose files no
longer exist. Nothing can recover them; the bytes are gone. Once Cloudinary is
live, re-upload those images through the admin product editor and the new URLs
will be permanent.

To list exactly which products need a new image:

```bash
psql "$NEON_DIRECT" -c "SELECT name FROM products WHERE image_url LIKE '/uploads/%' ORDER BY name;"
```
