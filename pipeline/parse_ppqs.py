import pdfplumber
import re
import json

PDF_PATH = '/mnt/user-data/uploads/ppqs_all.pdf'

# (Category, Subcategory, start_page, end_page) - 1-indexed, inclusive
CATEGORY_MAP = [
    ("Insecticide", "Agriculture Use - Single", 2, 55),
    ("Insecticide", "Agriculture Use - Combination", 56, 88),
    ("Fungicide", "Single Product", 111, 151),
    ("Fungicide", "Combination", 152, 192),
    ("Bio-Pesticide", "Bio-Fungicide", 194, 212),
    ("Herbicide", "Single Product", 214, 255),
    ("Herbicide", "Combination", 256, 288),
    ("PGR", "Plant Growth Regulator", 290, 301),
    ("Bio-Insecticide", "Major Uses", 303, 315),
]

HEADER_SUBSTRINGS = [
    "a.i", "a. i", "formulation", "dilution in water", "dilution", "waiting period",
    "common name of", "weed species", "name of insect", "name of crop", "dosage/ha",
    "dosage /ha", "dosage per ha", "time of application", "approved crops", "target pest",
    "name of pgr", "herbicide name", "name of the pest", "dose/ha", "crop", "waiting",
    "period (days)", "phi between", "harvest (days)", "requirement mg", "spray solution",
    "name of\ninsect", "dosage", "water (l/ha)",
]


def is_header_like_cell(v):
    vl = v.lower().strip()
    if vl in ("crop", "pest", "insect", "disease", "period", "dosage"):
        return True
    return any(sub in vl for sub in HEADER_SUBSTRINGS)

JUNK_ROW_PATTERNS = [
    re.compile(r'^\d+\.\s'),  # "1. Fungicides single..."
    re.compile(r'^combination product$', re.I),
    re.compile(r'^herbicide combinations?$', re.I),
    re.compile(r'^plant growth regulators?\s*\(pgr\)$', re.I),
    re.compile(r'^bio-?pesticides?$', re.I),
    re.compile(r'^bio-?fungicides?$', re.I),
    re.compile(r'^bio-?insecticides?$', re.I),
    re.compile(r'^agricultural use$', re.I),
    re.compile(r'^approved uses of registered', re.I),
    re.compile(r'^major uses? of', re.I),
    re.compile(r'^herbicides?$', re.I),
    re.compile(r'^public health use$', re.I),
    re.compile(r'^household insecticides?$', re.I),
]

SENTENCE_WORD_RE = re.compile(
    r'\b(when|before|after|then|ripened|stage|should|will|ready|harvest|once|twice|'
    r'per plant|per tree|ml in|lit of|litre of|solution|treatment for|are (fully|ripe)|'
    r'days after|weeks after|is applied|to control|for uniform|for better)\b', re.I)
FORM_CODE_RE = re.compile(
    r'(EC|SC|WP|WG|WDG|SL|SG|DS|DF|CS|GR|DP|SP|L\.?F\.?|AS|ZC|OD|CR|RB|CB|'
    r'FS|OF|EW|SE|TB|WS|Powder|Gel|Bait|Paste|Dust|Granules?)\.?\s*\)?\s*$', re.I)


def looks_like_real_pesticide_name(text):
    # Every genuine entry starts with a compound name before its first '%'
    # (e.g. "Trichoderma viride 1.5% AS"). Fragments like "10% ear emergence"
    # or "15% berries are ripened." start with a bare number - reject those.
    m = re.search(r'%', text)
    if m and not re.search(r'[A-Za-z]', text[:m.start()]):
        return False
    if SENTENCE_WORD_RE.search(text) and not FORM_CODE_RE.search(text):
        return False
    return True


def truncate_at_formcode(text):
    """If a pesticide-header cell picked up trailing instructional text (a source
    formatting artifact), cut it back to the actual product name, which always
    ends shortly after a %...formulation-code pattern."""
    if len(text) <= 55:
        return text
    m = re.search(r'%.{0,25}?\b(WP|SC|EC|WG|WDG|SL|SG|DS|DF|CS|GR|DP|SP|L\.?F\.?|AS|ZC|OD)\b\.?', text)
    if m:
        return text[:m.end()].strip()
    return text


NA_TOKENS = {'-', '--', 'na', 'n.a.', 'nil', 'n.a', '0', 'zero', 'zero days', '_'}


def clean(s):
    if s is None:
        return ''
    return re.sub(r'\s+', ' ', s.replace('\xa0', ' ')).strip()


def clean_keep_lines(s):
    """Collapse horizontal whitespace per line but keep line breaks; drop blank lines."""
    if s is None:
        return ''
    s = s.replace('\xa0', ' ')
    lines = [re.sub(r'[ \t]+', ' ', ln).strip() for ln in s.split('\n')]
    lines = [ln for ln in lines if ln]
    return '\n'.join(lines)


def is_junk_or_header_row(vals_clean):
    """vals_clean: list of cleaned non-empty strings from the row"""
    header_hits = sum(1 for v in vals_clean if is_header_like_cell(v))
    if header_hits >= 1:
        return True
    # if the single joined text matches a junk section-title pattern
    joined = ' '.join(vals_clean)
    for pat in JUNK_ROW_PATTERNS:
        if pat.match(joined.strip()):
            return True
    return False


def is_dose_like(val):
    v = val.strip()
    vl = v.lower()
    if vl in NA_TOKENS:
        return True
    if len(v) > 30:
        return False
    return bool(re.search(r'\d', v))


def parse_section(pdf, category, subcategory, start_page, end_page):
    records = []
    current_pesticide = None
    current_crop = None
    current_pest = None

    for pno in range(start_page, end_page + 1):
        page = pdf.pages[pno - 1]
        tables = page.extract_tables()
        if not tables:
            continue
        for table in tables:
            for row in table:
                orig_first_empty = row[0] in (None, '') or clean(row[0]) == ''
                # Two parallel views: clean (space-collapsed, for classification)
                # and raw (line-preserved, for final value + multi-line expansion)
                idx_pairs = [(clean(v), clean_keep_lines(v)) for v in row if v not in (None, '') and clean(v) != '']
                vals = [p[0] for p in idx_pairs]
                vals_raw = [p[1] for p in idx_pairs]
                if not vals:
                    continue

                if len(vals) == 1:
                    if '%' in vals[0] and looks_like_real_pesticide_name(vals[0]):
                        current_pesticide = truncate_at_formcode(vals[0])
                        current_crop = None
                        current_pest = None
                    # else: junk/divider row, or a sentence fragment that only
                    # coincidentally contains '%' - skip without disturbing
                    # current_pesticide so later rows keep the last real name.
                    continue

                if is_junk_or_header_row(vals):
                    continue

                # Determine crop
                idx = 0
                if not orig_first_empty:
                    crop = vals_raw[0]
                    current_crop = crop
                    idx = 1
                else:
                    crop = current_crop  # carry forward

                # Leading text-like run -> pest (classify on clean text, keep raw lines)
                pest_parts = []
                while idx < len(vals) and not is_dose_like(vals[idx]):
                    pest_parts.append(vals_raw[idx])
                    idx += 1
                if pest_parts:
                    pest = '\n'.join(pest_parts) if len(pest_parts) > 1 else pest_parts[0]
                    current_pest = pest
                else:
                    pest = current_pest  # carry forward

                D = vals[idx:]
                D_raw = vals_raw[idx:]

                ai = formulation = dilution = waiting = notes = ''
                if len(D) == 0:
                    pass
                else:
                    last_ok = len(D[-1]) <= 20
                    if last_ok:
                        waiting = D_raw[-1]
                        rest = D[:-1]
                        rest_raw = D_raw[:-1]
                        if rest:
                            if len(rest[-1]) <= 50:
                                dilution = rest_raw[-1]
                                rest2 = rest[:-1]
                                rest2_raw = rest_raw[:-1]
                            else:
                                rest2 = rest
                                rest2_raw = rest_raw
                            if len(rest2) == 1:
                                formulation = rest2_raw[0]
                            elif len(rest2) == 2:
                                ai, formulation = rest2_raw
                            elif len(rest2) > 2:
                                ai = rest2_raw[0]
                                formulation = ' '.join(rest2_raw[1:])
                    else:
                        notes = ' | '.join(D_raw)

                # Only split into multiple records when EVERY dose-ish field independently
                # shows the identical multi-line count (a strong, specific signal used by
                # PGR's "multiple application timings in one cell" pattern). A bare
                # multi-line Pest/weed-list on its own (the common case) is just one record.
                dose_fields = ['AI_Dose', 'Formulation_Dose', 'Dilution', 'Waiting_Period']
                dose_line_lists = {f: (locals()[{'AI_Dose': 'ai', 'Formulation_Dose': 'formulation',
                                                  'Dilution': 'dilution', 'Waiting_Period': 'waiting'}[f]]
                                        or '').split('\n') for f in dose_fields}
                dose_counts = {len(v) for v in dose_line_lists.values() if len(v) > 1}
                pest_lines = (pest or '').split('\n')

                base = {
                    'Category': category,
                    'Subcategory': subcategory,
                    'Pesticide': current_pesticide or '',
                    'Crop': (crop or '').replace('\n', ' '),
                }

                if len(dose_counts) == 1 and dose_counts == {len(pest_lines)} and len(pest_lines) > 1:
                    n = len(pest_lines)
                    for i in range(n):
                        r2 = dict(base)
                        r2['Pest'] = pest_lines[i]
                        for f in dose_fields:
                            parts = dose_line_lists[f]
                            r2[f] = parts[i] if len(parts) == n else (parts[0] if parts and parts[0] else '')
                        r2['Notes'] = notes.replace('\n', ' ')
                        r2['Page'] = pno
                        fix_waiting_period(r2)
                        records.append(r2)
                else:
                    r2 = dict(base)
                    r2['Pest'] = (pest or '').replace('\n', ' ')
                    r2['AI_Dose'] = ai.replace('\n', ' ')
                    r2['Formulation_Dose'] = formulation.replace('\n', ' ')
                    r2['Dilution'] = dilution.replace('\n', ' ')
                    r2['Waiting_Period'] = waiting.replace('\n', ' ')
                    r2['Notes'] = notes.replace('\n', ' ')
                    r2['Page'] = pno
                    fix_waiting_period(r2)
                    records.append(r2)
    return records


WAITING_DOSE_LEAK_RE = re.compile(r'\d.{0,15}\b(ml|kg|gm|lit|litre)\b', re.I)


def fix_waiting_period(r2):
    """A handful of seed-treatment rows have a dose rate (e.g. '10-12 ml/kg
    seed') sitting in the Waiting Period slot instead of a real day-count -
    that's genuinely useful info, just mislabelled, so move it to Notes and
    leave Waiting Period honestly blank rather than showing a fake day count."""
    wp = r2.get('Waiting_Period', '')
    if wp and (len(wp) > 12 or WAITING_DOSE_LEAK_RE.search(wp)):
        extra = f"Seed-treatment rate (from Waiting-Period column): {wp}"
        r2['Notes'] = (r2.get('Notes', '') + ' | ' + extra).strip(' |')
        r2['Waiting_Period'] = ''



def clean_pesticide_name(name):
    if not name:
        return name
    n = name
    n = re.sub(r'([a-z])(\d)', r'\1 \2', n)
    n = re.sub(r'(\d)([A-Z])', r'\1 \2', n)
    n = re.sub(r'(%)([A-Za-z])', r'\1 \2', n)
    n = re.sub(r'(\S)\+(\S)', r'\1 + \2', n)
    n = re.sub(r'\s+', ' ', n).strip()
    return n


def clean_dose_field(v):
    if not v:
        return v
    v = v.replace('\u2013', '-').replace('\u2014', '-')
    v = re.sub(r'\s*-\s*', '-', v)
    v = re.sub(r'\s+', ' ', v).strip()
    return v


if __name__ == '__main__':
    all_records = []
    with pdfplumber.open(PDF_PATH) as pdf:
        for category, subcategory, start, end in CATEGORY_MAP:
            recs = parse_section(pdf, category, subcategory, start, end)
            print(f"{category} / {subcategory}: pages {start}-{end} -> {len(recs)} records")
            all_records.extend(recs)

    print("TOTAL before crop filter:", len(all_records))

    # Drop records with no crop (unusable for a crop-first dropdown) or no pesticide name
    dropped = [r for r in all_records if not r['Crop'] or not r['Pesticide']]
    all_records = [r for r in all_records if r['Crop'] and r['Pesticide']]
    print("Dropped (empty crop/pesticide):", len(dropped))
    print("TOTAL final:", len(all_records))

    for r in all_records:
        r['Pesticide'] = clean_pesticide_name(r['Pesticide'])
        r['Crop'] = re.sub(r'\s+', ' ', r['Crop']).strip()
        r['Pest'] = re.sub(r'\s+', ' ', r['Pest']).strip()
        for f in ('AI_Dose', 'Formulation_Dose', 'Dilution', 'Waiting_Period'):
            r[f] = clean_dose_field(r[f])

    with open('/home/claude/records.json', 'w') as f:
        json.dump(all_records, f, indent=1)
    with open('/home/claude/dropped.json', 'w') as f:
        json.dump(dropped, f, indent=1)
