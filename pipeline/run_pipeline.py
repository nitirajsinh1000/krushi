#!/usr/bin/env python3
"""
PPQS PIPELINE — updates the Pesticide Finder from a new PPQS PDF.

WHAT THIS DOES, START TO FINISH:
  1. Reads the PDF (table-of-contents-driven page ranges for the 6
     categories: Insecticide, Fungicide, Herbicide, PGR, Bio-Pesticide,
     Bio-Insecticide) and extracts every crop/pest/pesticide/dose row.
  2. Splits any bunched pest entries ("Jassids, Bollworms") into individual
     rows, including the dash-separated style ("Whitefly- Bemisia tabaci
     Aphids- Aphis gossypii").
  3. Normalizes crop names (merges "Rice"/"Paddy"/"Rice (Paddy)" etc. into
     one canonical entry; groups non-crop entries like godown/rodent
     control instead of dropping them).
  4. Normalizes pest names (merges spelling/plural/spacing variants,
     WITHOUT merging genuinely different species that share a common
     name — verified safe with a similarity check, not a blind merge).
  5. Computes the per-pump dose (÷20, assuming 15L knapsack pumps).
  6. Adds Gujarati translations for crop and category names.
  7. Writes webapp_data.json — the exact file the website reads.

HOW TO RUN THIS:
    python3 run_pipeline.py /path/to/new_ppqs_all.pdf

REQUIRES: pdfplumber (pip install pdfplumber --break-system-packages)

IMPORTANT — if the new PDF's page layout changed:
  This was built against a specific PPQS document layout (see
  CATEGORY_MAP in parse_ppqs.py for the exact page ranges used). If the
  government reformats the PDF, restructures sections, or changes page
  counts, parse_ppqs.py's CATEGORY_MAP page numbers will need updating
  first — that part cannot be fully automated because it depends on
  reading the new PDF's table of contents. Everything downstream
  (steps 2-7 above) should keep working unchanged once step 1's page
  ranges are correct. This is the one step where getting help from
  Claude (or a developer) to re-map the sections is the realistic path,
  rather than expecting this script to handle it unattended.

AFTER THIS SCRIPT FINISHES, to update the live website:
  Run build_webapp.py next — it takes webapp_data.json and produces the
  final index.html (same 5-file package as before). Then re-deploy to
  Netlify exactly like the first time (drag the folder onto the same
  site to replace it — see HOW_TO_PUBLISH.txt).
"""
import json
import sys
import pdfplumber

sys.path.insert(0, '.')
import parse_ppqs
import split_pest
import normalize_crops
import normalize_pests
from pump_dose import compute_pump_dose
from gujarati_translations import gu_crop, gu_category


def run(pdf_path, out_path='webapp_data.json'):
    print(f"Reading {pdf_path} ...")
    all_records = []
    with pdfplumber.open(pdf_path) as pdf:
        n_pages = len(pdf.pages)
        print(f"  {n_pages} pages found (built against a 320-page reference "
              f"document — if this differs a lot, double-check CATEGORY_MAP "
              f"page ranges in parse_ppqs.py before trusting the output)")
        for category, subcategory, start, end in parse_ppqs.CATEGORY_MAP:
            if end > n_pages:
                print(f"  WARNING: {category}/{subcategory} expects pages "
                      f"{start}-{end} but PDF only has {n_pages}. Page "
                      f"ranges likely need updating for this PDF.")
                continue
            recs = parse_ppqs.parse_section(pdf, category, subcategory, start, end)
            print(f"  {category} / {subcategory}: {len(recs)} raw records")
            all_records.extend(recs)

    print(f"Raw extracted: {len(all_records)}")
    dropped = [r for r in all_records if not r['Crop'] or not r['Pesticide']]
    all_records = [r for r in all_records if r['Crop'] and r['Pesticide']]
    for r in all_records:
        r['Pesticide'] = parse_ppqs.clean_pesticide_name(r['Pesticide'])
        r['Crop'] = __import__('re').sub(r'\s+', ' ', r['Crop']).strip()
        r['Pest'] = __import__('re').sub(r'\s+', ' ', r['Pest']).strip()
        for f in ('AI_Dose', 'Formulation_Dose', 'Dilution', 'Waiting_Period'):
            r[f] = parse_ppqs.clean_dose_field(r[f])
    print(f"After empty-field drop: {len(all_records)} (dropped {len(dropped)})")

    exploded = []
    for r in all_records:
        if r['Category'] == 'PGR':
            exploded.append(r)
            continue
        terms = split_pest.split_pest_field(r['Pest'])
        if len(terms) == 1:
            exploded.append(r)
        else:
            for term in terms:
                r2 = dict(r)
                r2['Pest'] = term
                exploded.append(r2)
    print(f"After pest-splitting: {len(exploded)}")

    seen, deduped = set(), []
    for r in exploded:
        key = (r['Category'], r['Crop'], r['Pest'].lower(), r['Pesticide'],
               r['AI_Dose'], r['Formulation_Dose'], r['Dilution'], r['Waiting_Period'])
        if key not in seen:
            seen.add(key)
            deduped.append(r)

    for r in deduped:
        r['Crop'] = normalize_crops.normalize_crop(r['Crop'])
    deduped = [r for r in deduped if r['Crop']]
    print(f"After crop normalization: {len(deduped)}")

    pest_map, dropped_pests = normalize_pests.build_pest_normalization_map(deduped)
    for r in deduped:
        if r['Category'] != 'PGR':
            r['Pest'] = pest_map.get(r['Pest'], r['Pest'])

    seen, final = set(), []
    GENERIC_NONWORDS = {'disease', 'pest', 'insect', 'pests', 'insects', 'diseases',
                         'weed', 'weeds', 'infestation', 'infection'}
    for r in deduped:
        if r['Pest'] in dropped_pests or r['Pest'].strip().lower() in GENERIC_NONWORDS:
            continue
        key = (r['Category'], r['Crop'], r['Pest'], r['Pesticide'], r['AI_Dose'],
               r['Formulation_Dose'], r['Dilution'], r['Waiting_Period'])
        if key not in seen:
            seen.add(key)
            final.append(r)
    print(f"Final record count: {len(final)}")

    for r in final:
        r['Pump_Dose'] = compute_pump_dose(r['Formulation_Dose'])
        r['Crop_GU'] = gu_crop(r['Crop'])
        r['Category_GU'] = gu_category(r['Category'])
        missing = [r['Crop']] if not r['Crop_GU'] else []
        if missing:
            print(f"  NOTE: no Gujarati translation for new crop {r['Crop']!r} "
                  f"— add it to gujarati_translations.py's CROP_GU dict")

    from collections import defaultdict
    groups = defaultdict(list)
    for r in final:
        key = (r['Category'], r['Crop'], r['Pesticide'])
        groups[key].append([r['Pest'], r['AI_Dose'], r['Formulation_Dose'],
                             r['Pump_Dose'], r['Dilution'], r['Waiting_Period']])

    crops_sorted = sorted(set(r['Crop'] for r in final),
                           key=lambda c: (c.startswith('Non-Crop'), c))
    crop_idx = {c: i for i, c in enumerate(crops_sorted)}
    cats = ['Insecticide', 'Fungicide', 'Herbicide', 'PGR', 'Bio-Pesticide', 'Bio-Insecticide']
    cat_idx = {c: i for i, c in enumerate(cats)}

    out = {
        'crops': [[c, gu_crop(c)] for c in crops_sorted],
        'cats': [[c, gu_category(c)] for c in cats],
        'groups': [[cat_idx[k[0]], crop_idx[k[1]], k[2], v] for k, v in groups.items()],
    }
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
    print(f"\nDone. Wrote {out_path} "
          f"({len(crops_sorted)} crops, {len(groups)} pesticide groups, "
          f"{sum(len(v) for v in groups.values())} pest listings).")
    print("Next: run build_webapp.py to produce the updated index.html")


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 run_pipeline.py /path/to/ppqs_all.pdf [output.json]")
        sys.exit(1)
    run(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else 'webapp_data.json')
