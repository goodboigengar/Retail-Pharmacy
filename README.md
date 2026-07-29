# Retail Pharmacy Consultation Tool

A small Flask + SQLite web app for a retail pharmacy: a searchable database of
commonly dispensed pharmaceutical agents, and a consultation generator that
lets a pharmacist select the drug(s) being dispensed and produces a patient
consultation covering the components required for an oral drug consultation
under **California Code of Regulations, Title 16, §1707.2**, including
interaction checking (drug-drug and OTC/nonprescription) across the selected
medications.

> **Disclaimer:** The drug and interaction data in this repo is a curated
> reference set built for this prototype. It is **not** a substitute for
> current, authoritative labeling (FDA package insert), a validated clinical
> interaction database (e.g., Lexicomp, Micromedex), or pharmacist clinical
> judgment. Verify all information before using it to counsel a real patient.

## What it does

1. **Database** (`data/drugs.py`, `data/interactions.py` → SQLite `pharmacy.db`,
   built from `schema.sql`): ~45 commonly dispensed retail-pharmacy
   medications (Rx and OTC) spanning cardiovascular, diabetes, GI, respiratory,
   antibiotic, pain/opioid, mental health, and other classes, plus ~70 curated
   pairwise drug interactions (including several flagged as involving an
   OTC/nonprescription product).

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
   6. Refill information
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

## Project layout

```
app.py              Flask routes (UI + /api/search, /api/classes, /api/consultation)
db.py                SQLite connection, schema loading/seeding, query helpers
consultation.py      Maps drug + interaction data onto the 7 CCR components
schema.sql           SQLite schema for drugs and interactions tables
data/drugs.py        Source drug records
data/interactions.py Source pairwise interaction records
templates/index.html Search/select UI + consultation display
static/style.css      Styling (incl. print stylesheet for the consultation)
static/app.js         Client-side search, selection, and consultation rendering
```

## Extending the data

Add a new drug by appending a record to `DRUGS` in `data/drugs.py` (see
existing entries for the required fields), and add any relevant pairwise
interactions to `INTERACTIONS` in `data/interactions.py` using the new drug's
`id`. Delete `pharmacy.db` and restart the app to rebuild the database with
the new data.
