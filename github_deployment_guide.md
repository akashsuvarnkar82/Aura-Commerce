# GitHub Deployment Guide — ecommerce-api

## ⚠️ CRITICAL: Rotate Your Stripe Keys First

Your real Stripe keys (`sk_test_...`, `whsec_...`, `pk_test_...`) were in `.env.example`. Even though we've cleaned them, **if you ever committed these before, they exist in git history**.

**Go to [Stripe Dashboard → API Keys](https://dashboard.stripe.com/test/apikeys) and roll (regenerate) all your keys immediately.** Then update your local `.env` with the new keys.

---

## What I've Already Done

| File | Change |
|------|--------|
| [.gitignore](file:///c:/Users/Akash/Downloads/ecommerce-api/.gitignore) | **Created** — blocks `.env`, `venv/`, `instance/`, `__pycache__/`, and database files from being committed |
| [.env.example](file:///c:/Users/Akash/Downloads/ecommerce-api/.env.example) | **Sanitized** — replaced all real keys with placeholder values |

---

## Step-by-Step: Push to GitHub

### 1. Create the GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Name it `ecommerce-api` (or whatever you like)
3. Set it to **Public**
4. **Do NOT** initialize with README, .gitignore, or license (we already have these)
5. Click **Create repository**

### 2. Initialize Git and Push

Open your terminal in the project folder and run:

```bash
cd c:\Users\Akash\Downloads\ecommerce-api

# Initialize git
git init

# Add all files (the .gitignore will exclude secrets)
git add .

# Verify .env is NOT staged (this is the safety check)
git status

# Commit
git commit -m "Initial commit: ecommerce API with Stripe integration"

# Add your GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/ecommerce-api.git

# Push
git branch -M main
git push -u origin main
```

### 3. Safety Check Before Pushing

Run `git status` and **make sure these are NOT listed**:
- ❌ `.env` (contains real secrets)
- ❌ `venv/` (large, unnecessary)
- ❌ `instance/` (database files)
- ❌ `ecommerce.db`

You **should** see these being committed:
- ✅ `.env.example` (placeholder values only)
- ✅ `.gitignore`
- ✅ `app/`, `frontend/`, `requirements.txt`, `run.py`, etc.

---

## How to Handle Stripe Keys in a Public Repo

### The Rule: **Never commit real keys. Period.**

Here's how the setup works:

```
.env              ← Your REAL keys (git-ignored, never committed)
.env.example      ← PLACEHOLDER keys (committed, shows others what vars are needed)
```

### For You (Local Development)
- Your `.env` file stays on your machine. Git ignores it.
- When you clone on a new machine, copy `.env.example` → `.env` and fill in real values.

### For Other Developers Cloning Your Repo
They'll see `.env.example` and know to:
1. Copy it: `cp .env.example .env`
2. Fill in their own Stripe test keys from their Stripe dashboard

### For Production Deployment (Render, Railway, Heroku, etc.)
- **Never** put keys in code or files
- Use the hosting platform's **Environment Variables** UI:

| Platform | Where to set env vars |
|----------|----------------------|
| **Render** | Dashboard → Service → Environment |
| **Railway** | Dashboard → Variables tab |
| **Heroku** | Settings → Config Vars |
| **Vercel** | Settings → Environment Variables |
| **GitHub Actions** | Settings → Secrets and variables → Actions |

---

## If You Accidentally Push Secrets

If `.env` somehow gets committed:

```bash
# Remove it from git tracking (keeps local file)
git rm --cached .env

# Commit the removal
git commit -m "Remove .env from tracking"

# Push
git push
```

> [!CAUTION]
> This removes the file from the **latest** commit, but it's still in git history. If real keys were ever committed, you **must rotate them** on Stripe. You can also use [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/) to purge history.

---

## Quick Summary

| Concern | Solution |
|---------|----------|
| Stripe Secret Key (`sk_test_...`) | `.env` only — git-ignored |
| Stripe Webhook Secret (`whsec_...`) | `.env` only — git-ignored |
| Stripe Public Key (`pk_test_...`) | Safe to expose (it's public by design), but keep in `.env` for consistency |
| Other developers need keys? | They read `.env.example` and add their own |
| Production deployment? | Use platform's environment variable settings |
| Accidentally committed? | `git rm --cached .env` + rotate keys on Stripe |
