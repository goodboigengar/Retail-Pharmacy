/*
 * Retail Pharmacy Consultation Tool — fully client-side PWA build.
 *
 * All search and consultation-generation logic that used to live in the
 * Flask backend (db.py / consultation.py) is reimplemented here so the app
 * can install to a phone home screen and run completely offline, with the
 * drug/interaction data bundled and cached by the service worker.
 */

(() => {
  const CCR_COMPONENTS = [
    "Name and description",
    "Route, dosage form, dosage, and duration",
    "Directions for use and storage",
    "Precautions and warnings",
    "Self-monitoring techniques",
    "Refill information",
    "Missed dose instructions",
  ];

  const SEVERITY_RANK = { Contraindicated: 0, Major: 1, Moderate: 2, Minor: 3 };

  let DRUGS = [];
  let INTERACTIONS = [];
  let DRUGS_BY_ID = new Map();

  // ---- Data layer (replaces db.py) ----

  async function loadData() {
    const [drugsRes, interactionsRes] = await Promise.all([
      fetch("data/drugs.json"),
      fetch("data/interactions.json"),
    ]);
    DRUGS = await drugsRes.json();
    INTERACTIONS = await interactionsRes.json();
    DRUGS_BY_ID = new Map(DRUGS.map((d) => [d.id, d]));
  }

  function searchDrugs(query, classFilter, limit = 50) {
    let pool = DRUGS;
    if (classFilter) {
      pool = pool.filter((d) => d.broad_class === classFilter);
      limit = Math.max(limit, pool.length);
    }
    const sorted = [...pool].sort((a, b) => a.generic_name.localeCompare(b.generic_name));
    const q = (query || "").trim().toLowerCase();
    if (!q) return sorted.slice(0, limit);

    const scored = [];
    for (const d of sorted) {
      const haystacks = [d.generic_name.toLowerCase(), d.drug_class.toLowerCase(), d.broad_class.toLowerCase(), ...d.brand_names.map((b) => b.toLowerCase())];
      if (haystacks.some((h) => h.includes(q))) {
        const starts = haystacks.some((h) => h.startsWith(q));
        scored.push([starts ? 0 : 1, d.generic_name, d]);
      }
    }
    scored.sort((a, b) => (a[0] - b[0]) || a[1].localeCompare(b[1]));
    return scored.slice(0, limit).map((t) => t[2]);
  }

  function getAllDrugClasses() {
    return [...new Set(DRUGS.map((d) => d.broad_class))].sort();
  }

  function getDrugsByIds(ids) {
    return ids.map((id) => DRUGS_BY_ID.get(id)).filter(Boolean);
  }

  function getInteractionsAmong(ids) {
    const idSet = new Set(ids);
    const matches = INTERACTIONS.filter((i) => idSet.has(i.drug_a) && idSet.has(i.drug_b));
    matches.sort((a, b) => (SEVERITY_RANK[a.severity] ?? 9) - (SEVERITY_RANK[b.severity] ?? 9));
    return matches;
  }

  // ---- Consultation builder (replaces consultation.py) ----

  function drugConsultation(d) {
    const brandStr = d.brand_names.length ? ` (${d.brand_names.join(", ")})` : "";
    return {
      drug_id: d.id,
      generic_name: d.generic_name,
      brand_names: d.brand_names,
      otc_or_rx: d.otc_or_rx,
      sections: [
        {
          number: 1,
          title: "Name and description",
          content: { name: `${d.generic_name}${brandStr}`, drug_class: d.drug_class, description: d.description },
        },
        {
          number: 2,
          title: "Route, dosage form, dosage, and duration",
          content: { route: d.route, dosage_forms: d.dosage_forms, dosage: d.typical_dosage, duration: d.typical_duration },
        },
        {
          number: 3,
          title: "Directions for use and storage",
          content: { directions: d.directions_for_use, storage: d.storage_instructions },
        },
        {
          number: 4,
          title: "Precautions and warnings",
          content: {
            contraindications: d.contraindications,
            severe_side_effects_to_avoid: d.severe_side_effects_seek_care,
            common_side_effects: d.common_side_effects,
            otc_and_other_interactions: d.otc_and_other_interactions,
            action_if_occur: d.action_if_adverse_effects,
          },
        },
        { number: 5, title: "Self-monitoring techniques", content: { self_monitoring: d.self_monitoring } },
        {
          number: 6,
          title: "Refill information",
          content: {
            refill_information:
              "Refill authorization, quantity, and remaining refills are specific to this patient's " +
              "prescription, not to the drug itself - verify the current refill count, last-fill date, and " +
              "prescriber authorization for this prescription before dispensing, and advise the patient accordingly.",
          },
        },
        { number: 7, title: "Missed dose instructions", content: { missed_dose: d.missed_dose_instructions } },
      ],
    };
  }

  function buildConsultation(drugIds) {
    const drugs = getDrugsByIds(drugIds);
    const foundIds = drugs.map((d) => d.id);
    const missingIds = drugIds.filter((id) => !foundIds.includes(id));

    const perDrug = drugs.map(drugConsultation);
    const interactions = getInteractionsAmong(foundIds);
    const idToName = new Map(drugs.map((d) => [d.id, d.generic_name]));

    const interactionSummary = interactions.map((i) => ({
      drug_a: idToName.get(i.drug_a) ?? i.drug_a,
      drug_b: idToName.get(i.drug_b) ?? i.drug_b,
      severity: i.severity,
      mechanism: i.mechanism,
      clinical_effect: i.clinical_effect,
      management: i.management,
      otc_related: Boolean(i.otc_related),
    }));

    return {
      ccr_components: CCR_COMPONENTS,
      drugs: perDrug,
      interactions: interactionSummary,
      missing_drug_ids: missingIds,
      drug_count: drugs.length,
    };
  }

  // ---- expose to the UI module ----
  window.PharmacyData = { loadData, searchDrugs, getAllDrugClasses, buildConsultation };
})();
