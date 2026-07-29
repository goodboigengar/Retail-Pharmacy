-- Retail pharmacy drug database schema (SQLite)

DROP TABLE IF EXISTS interactions;
DROP TABLE IF EXISTS drugs;

CREATE TABLE drugs (
    id                          TEXT PRIMARY KEY,
    generic_name                TEXT NOT NULL,
    brand_names                 TEXT NOT NULL,  -- JSON array
    drug_class                  TEXT NOT NULL,
    otc_or_rx                   TEXT NOT NULL,
    description                 TEXT NOT NULL,
    route                       TEXT NOT NULL,
    dosage_forms                TEXT NOT NULL,  -- JSON array
    typical_dosage              TEXT NOT NULL,
    typical_duration            TEXT NOT NULL,
    directions_for_use          TEXT NOT NULL,  -- JSON array
    storage_instructions        TEXT NOT NULL,
    contraindications           TEXT NOT NULL,  -- JSON array
    severe_side_effects_seek_care TEXT NOT NULL,  -- JSON array
    common_side_effects         TEXT NOT NULL,  -- JSON array
    otc_and_other_interactions  TEXT NOT NULL,  -- JSON array
    action_if_adverse_effects   TEXT NOT NULL,  -- JSON array
    self_monitoring             TEXT NOT NULL,  -- JSON array
    refill_information          TEXT NOT NULL,
    missed_dose_instructions    TEXT NOT NULL
);

CREATE INDEX idx_drugs_generic_name ON drugs(generic_name);
CREATE INDEX idx_drugs_class ON drugs(drug_class);

CREATE TABLE interactions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    drug_a_id       TEXT NOT NULL REFERENCES drugs(id),
    drug_b_id       TEXT NOT NULL REFERENCES drugs(id),
    severity        TEXT NOT NULL CHECK (severity IN ('Contraindicated', 'Major', 'Moderate', 'Minor')),
    mechanism       TEXT NOT NULL,
    clinical_effect TEXT NOT NULL,
    management      TEXT NOT NULL,
    otc_related     INTEGER NOT NULL DEFAULT 0,
    UNIQUE(drug_a_id, drug_b_id)
);

CREATE INDEX idx_interactions_a ON interactions(drug_a_id);
CREATE INDEX idx_interactions_b ON interactions(drug_b_id);
