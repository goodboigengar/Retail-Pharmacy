#!/usr/bin/env python3
"""Copy data/drugs.json and data/interactions.json into docs/data/ for the PWA build.

Run this after editing the source data so the offline app (docs/) stays in
sync with the canonical dataset used by the Flask app.
"""
import shutil
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent

for name in ("drugs.json", "interactions.json"):
    src = REPO / "data" / name
    dst = REPO / "docs" / "data" / name
    shutil.copyfile(src, dst)
    print(f"Copied {src} -> {dst}")
