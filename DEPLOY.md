# StandupLoop — Deploy to Vercel + Neon (Step-by-Step)

Estimated time: **15 minutes**

---

## Step 1 — Set up Neon (free Postgres)

1. Go to **https://console.neon.tech** → sign up free
2. Click **"New Project"** → name it `standup-loop` → click Create
3. On the dashboard, click **"Connection Details"**
4. You need **two** connection strings:
   - **Pooled** (for the app): turn ON "Connection pooling" → copy the URL
   - **Direct** (for migrations): turn OFF "Connection pooling" → copy the URL
5. Save both — you'll use them in Step 3

---

## Step 2 — Push code to GitHub

```bash
# In your terminal, inside the standup-loop/ folder:
git init
git add .
git commit -m "Initial StandupLoop MVP"

# Create a repo at https://github.com/new (name: standup-loop, private OK)
git remote add origin https://github.com/YOUR_USERNAME/standup-loop.git
git branch -M main
git push -u origin main
```

---

## Step 3 — Deploy to Vercel

1. Go to **https://vercel.com** → sign up / log in with GitHub
2. Click **"Add New Project"** → Import your `standup-loop` repo
3. Framework preset: **Next.js** (auto-detected)
4. **Before clicking Deploy**, open "Environment Variables" and add:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your **pooled** Neon URL (with `?pgbouncer=true`) |
| `DIRECT_URL` | Your **direct** Neon URL (no pgbouncer) |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` and paste output |
| `NEXTAUTH_URL` | Leave blank for now — fill after deploy |

5. Click **Deploy** → wait ~2 minutes

6. After deploy succeeds, copy your URL (e.g. `https://standup-loop-xyz.vercel.app`)
7. Go to Vercel → Settings → Environment Variables → add:
   - `NEXTAUTH_URL` = `https://standup-loop-xyz.vercel.app`
8. Go to Vercel → Deployments → click "Redeploy" (to pick up NEXTAUTH_URL)

---

## Step 4 — Run database migrations + seed

```bash
# In your terminal, inside standup-loop/ folder:

# Install deps locally first
npm install

# Set your env vars locally (copy from Vercel, or use a .env.local):
# DATABASE_URL=<your pooled neon url>
# DIRECT_URL=<your direct neon url>
# NEXTAUTH_SECRET=<your secret>
# NEXTAUTH_URL=http://localhost:3000

# Run the migration (creates tables in Neon)
npx prisma migrate dev --name init

# Seed demo data
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

Expected output:
```
✅ Seed complete!
   Admin → admin@loop.dev / admin123
   Members → sam@loop.dev, jordan@loop.dev, mia@loop.dev / pass123
```

---

## Step 5 — Test it

Open your Vercel URL and log in:

- **Admin**: admin@loop.dev / admin123 → Team Today view
- **Member**: sam@loop.dev / pass123 → My Today view (only sees own tasks)

---

## Local Development

```bash
npm install
cp .env.example .env.local
# Fill in .env.local with your Neon URLs + a secret

npx prisma migrate dev --name init
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
npm run dev
# → http://localhost:3000
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `NEXTAUTH_SECRET` error | Generate with `openssl rand -base64 32` |
| DB connection fails | Make sure you're using the **pooled** URL for `DATABASE_URL` |
| Login redirects to /login | Check `NEXTAUTH_URL` matches your exact Vercel domain (no trailing slash) |
| Prisma generate fails on Vercel | The `postinstall` script handles this automatically |
| Migrations not applied | Run `npx prisma migrate deploy` (not dev) for production |

---

## Changing passwords in production

After seeding, change passwords via Prisma Studio:
```bash
npx prisma studio
# → Opens browser UI at http://localhost:5555
# → Go to User table → edit password field
# (Note: you must hash with bcrypt — use a script or add a /api/reset-password endpoint)
```

Or add a change-password API route as your next improvement.
