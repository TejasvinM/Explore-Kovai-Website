# Deploying Namma Kovai

| Part | Host | Plan | Address |
|---|---|---|---|
| Website (Next.js) | Netlify | Free | https://namma-kovai.netlify.app (unchanged) |
| API (Django) | Render | Free | https://namma-kovai-api.onrender.com |
| Database (PostgreSQL) | Neon | Free (permanent) | private connection string |

**Good to know about the free plans**

- Render's free API **sleeps after 15 minutes without traffic** and takes about a minute to wake.
  Pages are pre-built by Netlify, so visitors still see them instantly; only log-in, search,
  favourites, trip saving and weather wait for the wake-up.
- Neon's free database is permanent (1 GB). It also pauses when idle and wakes in under a second.
- Render's own free database expires after 30 days, which is why the database is on Neon.

The live site keeps running the old static version until step 6.

---

## 1. Create the database (Neon)

1. Sign up at https://neon.com (you can use "Continue with GitHub").
2. **Create project**: name `namma-kovai`, region **AWS Asia Pacific (Singapore)**.
3. On the project dashboard, click **Connect**, turn on **Connection pooling**, and copy the
   connection string. It starts with `postgresql://` and ends with `?sslmode=require`.
   Keep it private: it contains the database password.

## 2. Make two secrets

On your PC, run this twice and keep both values:

```
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

- The first is the **SITE_SERVER_KEY**, shared by the website and the API.
- The second is your **admin password**, or choose your own strong one.

## 3. Push the code to GitHub

This needs your go-ahead. Two things are pushed:

- this API to a new repository, `TejasvinM/namma-kovai-api`;
- the website to a new branch, `nextjs`, of `TejasvinM/Explore-Kovai-Website`. `main`, and so
  the live site, doesn't change.

## 4. Start the API (Render)

1. Sign up at https://render.com with GitHub and allow access to `namma-kovai-api`.
2. **New → Blueprint**, pick `namma-kovai-api`. Render reads `render.yaml`.
3. Fill in the values it asks for:

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | the Neon connection string from step 1 |
   | `SITE_SERVER_KEY` | secret 1 from step 2 |
   | `DJANGO_SUPERUSER_EMAIL` | your email |
   | `DJANGO_SUPERUSER_PASSWORD` | secret 2 from step 2 |

4. **Apply**. The first deploy takes a few minutes. On its first start it creates the tables,
   loads all 21 places, 8 dishes and 8 adventures, and creates your admin account.
5. Check:
   - https://namma-kovai-api.onrender.com/api/health/ shows `{"status": "ok"}`
   - https://namma-kovai-api.onrender.com/admin/ lets you log in
   - https://namma-kovai-api.onrender.com/api/docs/ shows the API docs
6. After logging in once, delete `DJANGO_SUPERUSER_PASSWORD` from the service's
   **Environment** page. The account stays; the password just isn't stored on Render any more.

If Render gives the service a different address, use that address in the next step.

## 5. Preview the new website (Netlify)

1. Netlify → your site → **Site configuration → Environment variables**, add:

   | Key | Value |
   |---|---|
   | `API_URL` | `https://namma-kovai-api.onrender.com` |
   | `SITE_SERVER_KEY` | secret 1 (same as on Render) |
   | `NEXT_PUBLIC_SITE_URL` | `https://namma-kovai.netlify.app` |

2. **Site configuration → Build & deploy → Branches and deploy contexts**: set
   **Branch deploys** to "Let me add individual branches" and add `nextjs`.
3. Netlify builds the branch. Open the preview at
   `https://nextjs--namma-kovai.netlify.app` and try everything: the map, food, adventures,
   search, sign up, favourites, trip planner, and weather.

## 6. Go live

When the preview is right, merge `nextjs` into `main` on GitHub (a pull request). Netlify then
publishes the new site at the usual address. Old links like `/places.html#valparai` redirect to
the new pages automatically.

**To undo:** Netlify → **Deploys**, open the last deploy of the old site and click
**Publish deploy**. The old site is back within seconds.

## 7. After going live

- Google Search Console → **Sitemaps**: submit `sitemap.xml` again. It now lists 41 pages
  instead of 4. The verification file is still in place.
- Content edits: https://namma-kovai-api.onrender.com/admin/. Pages refresh within about 5 minutes.

## Every push after that

- **API:** Render redeploys automatically. New database changes (migrations) run on start.
- **Website:** Netlify rebuilds from `main` automatically.
- **Tests:** GitHub Actions runs them on every push (API tests on PostgreSQL; website type
  checks). A red cross on GitHub means something broke.
