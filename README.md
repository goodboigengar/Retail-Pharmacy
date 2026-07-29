# Retail Pharmacy Consultation Tool

A searchable database of commonly dispensed pharmaceutical agents and a
consultation generator that lets a pharmacist select the drug(s) being
dispensed and produces a patient consultation covering the components
required for an oral drug consultation under **California Code of
Regulations, Title 16, §1707.2**, including interaction checking (drug-drug
and OTC/nonprescription) across the selected medications.

There are two versions of the app in this repo:

- **`app.py` (Flask + SQLite)** — a desktop/server web app, useful for local
  development and for editing/testing the drug database.
- **`docs/` (installable phone app / PWA)** — a fully static, offline-capable
  build of the same tool meant to be installed to a phone's home screen and
  shared with colleagues. See [Phone app (PWA)](#phone-app-pwa) below.

> **Disclaimer:** The drug and interaction data in this repo is a curated
> reference set built for this prototype. It is **not** a substitute for
> current, authoritative labeling (FDA package insert), a validated clinical
> interaction database (e.g., Lexicomp, Micromedex), or pharmacist clinical
> judgment. Verify all information before using it to counsel a real patient.

## What it does

1. **Database** (`data/drugs.json`, `data/interactions.json` → SQLite
   `pharmacy.db`, built from `schema.sql`): ~496 commonly dispensed
   retail-pharmacy medications (Rx, OTC, and specialty/injectable) spanning
   cardiovascular, diabetes/GLP-1, GI, respiratory, antibiotic/antiviral,
   pain/opioid, mental health, women's health, urology, dermatology/biologics,
   ophthalmology, and OTC vitamin/supplement classes, plus ~680 curated
   pairwise drug interactions (including many flagged as involving an
   OTC/nonprescription product, duplicate-ingredient combination products,
   and MAOI/opioid-antagonist contraindications).

2. **Search** (`/api/search?q=...`, `/api/classes`): search by generic name,
   brand name, or drug class; filter by class. The UI lets a pharmacist check
   off multiple drugs to build the list being dispensed to a patient.

3. **Consultation generation** (`/api/consultation`, `consultation.py`): given
   the selected drug IDs, returns, for each drug, all 7 CCR §1707.2
   components:
   1. Name and description
   2. Route, dosage form, exact dosage, and duration
   3. Directions for use and storage
   4. Precautions and warnings (contraindications, severe side effects,
      adverse effects/interactions incl. OTC, and required action)
   5. Self-monitoring techniques
   6. Refill information — shown as a generic reminder to verify the current
      refill count/authorization for the specific prescription, since that
      information is prescription-specific rather than drug-specific
   7. Missed dose instructions

   It also cross-checks every pair of selected drugs against the interactions
   table and returns a severity-ranked (Contraindicated > Major > Moderate >
   Minor) interaction summary, flagging which interactions involve an OTC
   product.

## Running it

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 app.py
```

Then open http://127.0.0.1:5000/. `pharmacy.db` is built automatically on
first run from the data in `data/`; delete it and restart to rebuild from
scratch (e.g., after editing the source data).

## Phone app (PWA)

`docs/` is a self-contained, offline-first build of the tool: same drug
database and consultation logic, reimplemented in plain client-side
JavaScript (`docs/app.js`, `docs/ui.js`) instead of Flask endpoints, so it
needs no server or internet connection once installed. It's a **Progressive
Web App** — there's no app store, developer account, or review process
involved.

### One-time setup (repo owner)

GitHub Pages needs to be turned on once so there's a URL to share:

1. Go to the repo on GitHub → **Settings → Pages**.
2. Under "Build and deployment" → **Source**, choose **Deploy from a branch**.
3. Pick the branch this app lives on (or `main`, once merged) and set the
   folder to **`/docs`**.
4. Save. GitHub will publish it at
   `https://<your-username>.github.io/<repo-name>/` within a minute or two.

Note: if the repository is private, this URL is still reachable by anyone
who has the exact link (GitHub Pages doesn't enforce repo privacy on a free
plan) — it isn't discoverable/indexed anywhere, but it isn't access-controlled
either. The bundled data is general pharmacology reference content, not
patient data, but let me know if you'd rather it be locked down further.

### Installing it (colleagues)

Share the Pages URL. Opening it once (with any internet connection) downloads
and caches the whole app, including all 496 drugs — after that it works with
no signal at all.

- **iPhone:** open the link in **Safari**, tap the **Share** icon, then
  **"Add to Home Screen."**
- **Android:** open the link in **Chrome**; a banner/button will offer to
  **install the app** directly (or use Chrome's ⋮ menu → "Install app").

The app also shows this same guidance in an in-app banner on first visit.

### Updating the data later

The PWA has its own copy of the data for offline use. After editing
`data/drugs.json` / `data/interactions.json`, run:

```bash
python3 scripts/sync_pwa_data.py
```

then commit and push — this copies the updated files into `docs/data/` and
bumps nothing else automatically. To force already-installed phones to pick
up the change, bump `CACHE_VERSION` in `docs/service-worker.js` (e.g.
`rxconsult-v2`) so the service worker knows to re-fetch everything; otherwise
installed copies keep serving their originally cached data until it's
evicted or reinstalled.

## Project layout

```
app.py                    Flask routes (UI + /api/search, /api/classes, /api/consultation)
db.py                      SQLite connection, schema loading/seeding, query helpers
consultation.py            Maps drug + interaction data onto the 7 CCR components
schema.sql                 SQLite schema for drugs and interactions tables
data/drugs.json            Source drug records (JSON array) - canonical data
data/interactions.json     Source pairwise interaction records (JSON array) - canonical data
templates/index.html       Flask UI template
static/                    Flask app's CSS/JS
scripts/sync_pwa_data.py   Copies data/*.json into docs/data/ for the PWA build

docs/                      Static, installable phone app (PWA) - see "Phone app" above
docs/index.html             App shell + PWA meta tags
docs/app.js                 Client-side reimplementation of db.py/consultation.py
docs/ui.js                  Search/select/consultation rendering (mirrors static/app.js)
docs/install.js              iOS/Android "add to home screen" prompt handling
docs/service-worker.js        Offline caching (precaches app + full drug database)
docs/manifest.json              PWA manifest (name, icons, display mode)
docs/.nojekyll                   Tells GitHub Pages to serve docs/ as-is, skipping Jekyll processing
docs/data/*.json                Copies of data/drugs.json and data/interactions.json
docs/icons/                      App icons for home screen (incl. maskable variants)
```

## Extending the data

Add a new drug by appending an object to the array in `data/drugs.json` (see
existing entries for the required fields — every drug needs exactly the same
set of keys, no more, no less; note there is intentionally no
`refill_information` field). Add any relevant pairwise interactions to the
array in `data/interactions.json`, referencing drugs by their `id`. Delete
`pharmacy.db` and restart the app to rebuild the database with the new data.

Given the size of this dataset (nearly 500 drugs), a validation pass is
recommended after editing by hand — check for: exact schema key match on
every drug record, unique ids, and that every interaction's `drug_a`/`drug_b`
resolve to a real drug id.

Run `python3 scripts/sync_pwa_data.py` afterward to propagate the change to
the phone app build in `docs/` (see [Phone app (PWA)](#phone-app-pwa)).
