"""
Builds a structured patient consultation that covers the components required
by California Code of Regulations, Title 16, Section 1707.2, for each
selected drug, plus a cross-drug interaction summary (including OTC
interactions) for the full set of drugs being dispensed together.
"""

from db import get_drugs_by_ids, get_interactions_among

CCR_COMPONENTS = [
    "Name and description",
    "Route, dosage form, dosage, and duration",
    "Directions for use and storage",
    "Precautions and warnings",
    "Self-monitoring techniques",
    "Refill information",
    "Missed dose instructions",
]


def _drug_consultation(d):
    return {
        "drug_id": d["id"],
        "generic_name": d["generic_name"],
        "brand_names": d["brand_names"],
        "otc_or_rx": d["otc_or_rx"],
        "sections": [
            {
                "number": 1,
                "title": "Name and description",
                "content": {
                    "name": f"{d['generic_name']}" + (
                        f" ({', '.join(d['brand_names'])})" if d["brand_names"] else ""
                    ),
                    "drug_class": d["drug_class"],
                    "description": d["description"],
                },
            },
            {
                "number": 2,
                "title": "Route, dosage form, dosage, and duration",
                "content": {
                    "route": d["route"],
                    "dosage_forms": d["dosage_forms"],
                    "dosage": d["typical_dosage"],
                    "duration": d["typical_duration"],
                },
            },
            {
                "number": 3,
                "title": "Directions for use and storage",
                "content": {
                    "directions": d["directions_for_use"],
                    "storage": d["storage_instructions"],
                },
            },
            {
                "number": 4,
                "title": "Precautions and warnings",
                "content": {
                    "contraindications": d["contraindications"],
                    "severe_side_effects_to_avoid": d["severe_side_effects_seek_care"],
                    "common_side_effects": d["common_side_effects"],
                    "otc_and_other_interactions": d["otc_and_other_interactions"],
                    "action_if_occur": d["action_if_adverse_effects"],
                },
            },
            {
                "number": 5,
                "title": "Self-monitoring techniques",
                "content": {"self_monitoring": d["self_monitoring"]},
            },
            {
                "number": 6,
                "title": "Refill information",
                "content": {"refill_information": d["refill_information"]},
            },
            {
                "number": 7,
                "title": "Missed dose instructions",
                "content": {"missed_dose": d["missed_dose_instructions"]},
            },
        ],
    }


def build_consultation(drug_ids):
    drugs = get_drugs_by_ids(drug_ids)
    found_ids = [d["id"] for d in drugs]
    missing_ids = [i for i in drug_ids if i not in found_ids]

    per_drug = [_drug_consultation(d) for d in drugs]
    interactions = get_interactions_among(found_ids)

    id_to_name = {d["id"]: d["generic_name"] for d in drugs}
    interaction_summary = []
    for i in interactions:
        interaction_summary.append({
            "drug_a": id_to_name.get(i["drug_a_id"], i["drug_a_id"]),
            "drug_b": id_to_name.get(i["drug_b_id"], i["drug_b_id"]),
            "severity": i["severity"],
            "mechanism": i["mechanism"],
            "clinical_effect": i["clinical_effect"],
            "management": i["management"],
            "otc_related": bool(i["otc_related"]),
        })

    return {
        "ccr_components": CCR_COMPONENTS,
        "drugs": per_drug,
        "interactions": interaction_summary,
        "missing_drug_ids": missing_ids,
        "drug_count": len(drugs),
    }
