"""SQLite database helpers for the retail pharmacy drug database."""

import json
import os
import sqlite3

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "pharmacy.db")
SCHEMA_PATH = os.path.join(BASE_DIR, "schema.sql")

LIST_FIELDS = (
    "brand_names",
    "dosage_forms",
    "directions_for_use",
    "contraindications",
    "severe_side_effects_seek_care",
    "common_side_effects",
    "otc_and_other_interactions",
    "action_if_adverse_effects",
    "self_monitoring",
)


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def build_database(force=False):
    """(Re)build pharmacy.db from data/drugs.py and data/interactions.py."""
    if force and os.path.exists(DB_PATH):
        os.remove(DB_PATH)

    is_new = not os.path.exists(DB_PATH)
    conn = get_connection()
    try:
        if is_new:
            with open(SCHEMA_PATH) as f:
                conn.executescript(f.read())
            _seed(conn)
            conn.commit()
    finally:
        conn.close()


def _seed(conn):
    from data.drugs import DRUGS
    from data.interactions import INTERACTIONS

    for d in DRUGS:
        conn.execute(
            """
            INSERT INTO drugs (
                id, generic_name, brand_names, drug_class, otc_or_rx, description,
                route, dosage_forms, typical_dosage, typical_duration,
                directions_for_use, storage_instructions, contraindications,
                severe_side_effects_seek_care, common_side_effects,
                otc_and_other_interactions, action_if_adverse_effects,
                self_monitoring, missed_dose_instructions
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """,
            (
                d["id"],
                d["generic_name"],
                json.dumps(d["brand_names"]),
                d["drug_class"],
                d["otc_or_rx"],
                d["description"],
                d["route"],
                json.dumps(d["dosage_forms"]),
                d["typical_dosage"],
                d["typical_duration"],
                json.dumps(d["directions_for_use"]),
                d["storage_instructions"],
                json.dumps(d["contraindications"]),
                json.dumps(d["severe_side_effects_seek_care"]),
                json.dumps(d["common_side_effects"]),
                json.dumps(d["otc_and_other_interactions"]),
                json.dumps(d["action_if_adverse_effects"]),
                json.dumps(d["self_monitoring"]),
                d["missed_dose_instructions"],
            ),
        )

    for i in INTERACTIONS:
        a, b = sorted([i["drug_a"], i["drug_b"]])
        conn.execute(
            """
            INSERT INTO interactions (
                drug_a_id, drug_b_id, severity, mechanism, clinical_effect,
                management, otc_related
            ) VALUES (?,?,?,?,?,?,?)
            """,
            (a, b, i["severity"], i["mechanism"], i["clinical_effect"],
             i["management"], 1 if i.get("otc_related") else 0),
        )


def row_to_drug(row):
    d = dict(row)
    for field in LIST_FIELDS:
        d[field] = json.loads(d[field])
    return d


def search_drugs(query, limit=25):
    """Search by generic name, brand name, or drug class (case-insensitive substring)."""
    conn = get_connection()
    try:
        rows = conn.execute("SELECT * FROM drugs ORDER BY generic_name").fetchall()
    finally:
        conn.close()

    drugs = [row_to_drug(r) for r in rows]
    if not query or not query.strip():
        return drugs[:limit]

    q = query.strip().lower()
    scored = []
    for d in drugs:
        haystacks = [d["generic_name"].lower(), d["drug_class"].lower()] + [
            b.lower() for b in d["brand_names"]
        ]
        if any(q in h for h in haystacks):
            starts = any(h.startswith(q) for h in haystacks)
            scored.append((0 if starts else 1, d["generic_name"], d))
    scored.sort(key=lambda t: (t[0], t[1]))
    return [d for _, _, d in scored[:limit]]


def get_drugs_by_ids(ids):
    if not ids:
        return []
    conn = get_connection()
    try:
        placeholders = ",".join("?" for _ in ids)
        rows = conn.execute(
            f"SELECT * FROM drugs WHERE id IN ({placeholders})", list(ids)
        ).fetchall()
    finally:
        conn.close()
    by_id = {r["id"]: row_to_drug(r) for r in rows}
    return [by_id[i] for i in ids if i in by_id]


def get_interactions_among(ids):
    """Return all pairwise interactions where both drugs are in `ids`."""
    if len(ids) < 2:
        return []
    conn = get_connection()
    try:
        placeholders = ",".join("?" for _ in ids)
        rows = conn.execute(
            f"""
            SELECT * FROM interactions
            WHERE drug_a_id IN ({placeholders}) AND drug_b_id IN ({placeholders})
            """,
            list(ids) + list(ids),
        ).fetchall()
    finally:
        conn.close()

    severity_rank = {"Contraindicated": 0, "Major": 1, "Moderate": 2, "Minor": 3}
    results = [dict(r) for r in rows]
    results.sort(key=lambda r: severity_rank.get(r["severity"], 9))
    return results


def get_all_drug_classes():
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT DISTINCT drug_class FROM drugs ORDER BY drug_class"
        ).fetchall()
    finally:
        conn.close()
    return [r["drug_class"] for r in rows]
