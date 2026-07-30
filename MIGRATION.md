# Migration: cut hosting cost without changing how the app behaves

| Piece | From | To | Cost |
|---|---|---|---|
| Database | Render Postgres (paid) | **Neon** | Free, 0.5 GB, no expiry |
| Server | Render Web (paid) | **Render Web free tier** | Free |
| Product images | Render local disk | **Cloudinary** | Free, 25 credits/mo |

**The backend URL does not change.** It stays `raksha-farms.onrender.com`, so the
customer site and admin panel need no changes and no redeploy. There is nothing
to repoint in Vercel.

**Why Cloudinary is not optional.** `render.yaml` never declared a `disk:`, so
uploads went to ephemeral container storage and were wiped on every deploy. That
already destroyed the images for 32 products — every `/uploads/…` URL in the
database currently 404s. This is a fix for an existing bug, not just a move.

**Why not Koyeb.** Their free tier is now "Free 5h" — 5 hours of compute per
month with scale-to-zero. Unusable for a live store.

**What the free Render tier costs you.** The web service sleeps after 15 minutes
of inactivity; the next request waits ~50s while it wakes. Two things soften
this: the frontend already retries with 8s/16s backoff, and the admin order
dashboard holds an open SSE connection, which keeps the service awake the whole
time anyone has it open.

> No step here asks you to send a password or connection string through chat.
> Every command runs in your own terminal.

---

## Status

- [x] **1.** Neon + Cloudinary accounts created
- [x] **2.** Render database backed up → `~/render-backup.dump` (131 KB, 14 tables)
- [x] **3.** Restored into Neon — verified exact: 109 active / 127 total products,
      341 orders, 26 users, 18 addresses, `product_reviews` present
- [x] **4.** Cloudinary credential set
- [x] **5.** Render service repointed — verified live: serving 108 products from
      Neon, `🖼 Image uploads → Cloudinary` in the boot log, CORS and SSE intact
- [ ] **6.** Downgrade the web service to free
- [ ] **7.** Verify image upload survives a redeploy ← the one that matters
- [ ] **8.** Delete the Render database ← where the cost saving actually lands

---

## Step 4 — Cloudinary credential

Cloudinary → **Dashboard** → **API Environment variable**:

```
cloudinary://<api_key>:<api_secret>@q0su9wry
```

If only the key and secret are shown separately, assemble it in that shape.
`q0su9wry` is your cloud name.

---

## Step 5 — Repoint the Render service

Render → **raksha-farms-backend** → **Environment**. Make these four changes:

| Variable | Action |
|---|---|
| `DATABASE_URL` | Replace with the Neon **pooled** string (host contains `-pooler`) |
| `CLOUDINARY_URL` | **Add** — from step 4 |
| `ADMIN_SECRET` | Replace with a **new** password (the old one leaked) |
| `UPLOAD_DIR` | **Delete** if present — unused now that images go to Cloudinary |

Leave `JWT_SECRET` exactly as it is. Changing it signs out every logged-in
customer.

Use the **pooled** Neon string, not the direct one used for the restore. A web
server opens far more short-lived connections than a restore does, and the
direct endpoint will exhaust its limit.

Saving env vars triggers a redeploy. Watch the log for:

```
🖼  Image uploads → Cloudinary
🚀 Backend running on http://localhost:10000
```

That first line is the proof Cloudinary is active. If it instead says
`→ local ./uploads`, `CLOUDINARY_URL` did not get picked up.

---

## Step 6 — Downgrade to the free instance

Render → the service → **Settings** → **Instance Type** → **Free**.

Then delete the pre-deploy command if one is still set (Settings → Build &
Deploy). It previously ran `seed.js`, which wipes the product catalogue. There
is a guard in the code now, but the command should not be there at all.

---

## Step 7 — Verify

```bash
curl -s https://raksha-farms.onrender.com/health
curl -s "https://raksha-farms.onrender.com/api/products?limit=500" | python3 -c "import json,sys; print(len(json.load(sys.stdin)))"
```

Expect `{"status":"ok"}` and **108** (the API filters to active *and* in-stock).

Then on the live site:

- [ ] Storefront loads, 108 products
- [ ] Product page opens, reviews load
- [ ] Checkout — saved address prefills
- [ ] Test order → appears in admin Orders
- [ ] Admin login works with the **new** `ADMIN_SECRET`
- [ ] Admin Orders receives live updates (SSE)
- [ ] POS — pick a repeat customer, phone **and address** autofill
- [ ] POS — bill a weight item, print, receipt is dark and bold
- [ ] **Upload a product image → reload → still there** ← the Cloudinary fix
- [ ] Bulk import a small CSV

The image upload is the one that matters most. It is the failure the old setup
had, so it is the thing most worth proving.

---

## Step 8 — Delete the Render database

Only once step 7 passes.

This is where the saving actually lands — until the Postgres instance is
deleted, you are still paying for it. It also retires the database password that
was exposed during this migration.

1. Confirm `~/render-backup.dump` is somewhere safe. Copy it off the laptop.
2. Render → the Postgres instance → **Suspend** first, not delete.
3. Leave it suspended a few days. If nothing breaks, delete it.

**Rollback**, while the database still exists: set `DATABASE_URL` back to the
Render internal string and redeploy. That is the whole rollback — which is why
it stays suspended-not-deleted until you are confident.

---

## The 32 lost images

The database still holds `/uploads/…` paths for 32 products whose files are gone.
Nothing can recover them. Once Cloudinary is live, re-upload through the admin
product editor and the new URLs will be permanent.

To list which products need one:

```bash
psql "$NEON_DB" -c "SELECT name FROM products WHERE image_url LIKE '/uploads/%' ORDER BY name;"
```
