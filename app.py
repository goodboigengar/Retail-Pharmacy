"""
Retail Pharmacy consultation tool.

Flask app exposing:
  - a UI for searching the drug database and selecting drugs for dispensing
  - a consultation generator that produces the components required for an
    oral patient consultation under California Code of Regulations,
    Title 16, Section 1707.2, including interaction checking across the
    selected drugs (and OTC/nonprescription interaction flags).
"""

from flask import Flask, jsonify, render_template, request

import db
from consultation import build_consultation

app = Flask(__name__)
db.build_database()


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/search")
def api_search():
    query = request.args.get("q", "")
    results = db.search_drugs(query, limit=50)
    slim = [
        {
            "id": d["id"],
            "generic_name": d["generic_name"],
            "brand_names": d["brand_names"],
            "drug_class": d["drug_class"],
            "otc_or_rx": d["otc_or_rx"],
            "description": d["description"],
        }
        for d in results
    ]
    return jsonify({"results": slim, "count": len(slim)})


@app.route("/api/classes")
def api_classes():
    return jsonify({"classes": db.get_all_drug_classes()})


@app.route("/api/consultation", methods=["POST"])
def api_consultation():
    payload = request.get_json(silent=True) or {}
    drug_ids = payload.get("drug_ids", [])
    if not isinstance(drug_ids, list) or not drug_ids:
        return jsonify({"error": "Provide a non-empty 'drug_ids' list."}), 400

    # de-duplicate while preserving selection order
    seen = set()
    ordered_ids = []
    for i in drug_ids:
        if isinstance(i, str) and i not in seen:
            seen.add(i)
            ordered_ids.append(i)

    result = build_consultation(ordered_ids)
    return jsonify(result)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
