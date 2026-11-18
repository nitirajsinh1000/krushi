"""Build src/data/webapp-data.json from the PPQS/CIBRC workbook.

Output shape (v2):
{
  cats:    [[en, gu, hi], ...]
  crops:   [[en, gu, hi], ...]
  targets: [[display, weedId|null], ...]      # de-duplicated pest/disease/weed names
  groups:  [[catIdx, cropIdx, technical, blocks[]], ...]
      block = [aiDose, formDose, pumpDose, water, phi, timing, [targetIdx, ...]]
}
One group per crop+category+technical; inside it a block per distinct dose set,
so a technical that controls many targets at the same dose appears once.
"""

import json
import re
import unicodedata
from collections import Counter, defaultdict

import openpyxl

XLSX = "/tmp/ppqs.xlsx"
WEEDS = "src/data/weeds.json"
OUT = "src/data/webapp-data.json"

CAT_ORDER = [
    ("Insecticide", "જંતુનાશક", "कीटनाशक"),
    ("Fungicide", "ફૂગનાશક", "फफूंदनाशक"),
    ("Herbicide", "નીંદણનાશક", "खरपतवारनाशक"),
    ("Bio-Pesticide", "જૈવિક કીટનાશક", "जैव कीटनाशी"),
    ("Bio-Insecticide", "જૈવિક જંતુનાશક", "जैव कीटनाशक"),
    ("PGR", "વૃદ્ધિ નિયામક", "वृद्धि नियामक"),
]

CROP_HI = {
    "Rice": "धान", "Paddy": "धान", "Wheat": "गेहूं", "Cotton": "कपास",
    "Groundnut": "मूंगफली", "Maize": "मक्का", "Sorghum": "ज्वार",
    "Pearl millet": "बाजरा", "Bajra": "बाजरा", "Sugarcane": "गन्ना",
    "Soybean": "सोयाबीन", "Mustard": "सरसों", "Castor": "अरंडी",
    "Sesame": "तिल", "Sesamum": "तिल", "Chickpea": "चना", "Gram": "चना",
    "Pigeon pea": "अरहर", "Green gram": "मूंग", "Black gram": "उड़द",
    "Potato": "आलू", "Tomato": "टमाटर", "Onion": "प्याज", "Garlic": "लहसुन",
    "Chilli": "मिर्च", "Brinjal": "बैंगन", "Okra": "भिंडी", "Cabbage": "पत्तागोभी",
    "Cauliflower": "फूलगोभी", "Cucumber": "खीरा", "Banana": "केला",
    "Mango": "आम", "Grapes": "अंगूर", "Citrus": "नींबू वर्गीय", "Lemon": "नींबू",
    "Apple": "सेब", "Papaya": "पपीता", "Guava": "अमरूद", "Pomegranate": "अनार",
    "Tea": "चाय", "Coffee": "कॉफी", "Coconut": "नारियल", "Cardamom": "इलायची",
    "Turmeric": "हल्दी", "Ginger": "अदरक", "Coriander": "धनिया",
    "Cumin": "जीरा", "Fennel": "सौंफ", "Sunflower": "सूरजमुखी",
    "Safflower": "कुसुम", "Linseed": "अलसी", "Jute": "जूट", "Tobacco": "तंबाकू",
    "Peas": "मटर", "Pea": "मटर", "Cowpea": "लोबिया", "Beans": "सेम",
    "Watermelon": "तरबूज", "Muskmelon": "खरबूजा", "Bittergourd": "करेला",
    "Ridgegourd": "तोरई", "Bottlegourd": "लौकी", "Spinach": "पालक",
    "Carrot": "गाजर", "Radish": "मूली", "Beetroot": "चुकंदर",
    "Cluster bean": "ग्वार", "Fenugreek": "मेथी", "Isabgol": "इसबगोल",
    "Cashew": "काजू", "Arecanut": "सुपारी", "Rubber": "रबर", "Pepper": "काली मिर्च",
    "Sapota": "चीकू", "Ber": "बेर", "Custard apple": "सीताफल",
    "Rose": "गुलाब", "Chrysanthemum": "गुलदाउदी", "Marigold": "गेंदा",
    "Non-crop area": "गैर-फसल क्षेत्र", "Fallow land": "परती भूमि",
    "Mushroom": "मशरूम", "Betelvine": "पान", "Litchi": "लीची",
    "Sugar beet": "चुकंदर", "Cocoa": "कोको", "Walnut": "अखरोट",
    "Almond": "बादाम", "Ash gourd": "पेठा", "Pumpkin": "कद्दू",
}

SPLIT_RE = re.compile(r"\s*(?:,|;|/|&|\band\b|\+)\s*", re.I)
BLANK = {"", "-", "--", "na", "n.a", "n.a.", "nil", "none"}


def norm(text: str) -> str:
    t = unicodedata.normalize("NFKD", text or "").lower()
    t = re.sub(r"\([^)]*\)", " ", t)
    t = re.sub(r"\b(spp?|sp|var|complex|etc)\b\.?", " ", t)
    t = re.sub(r"[^a-z0-9\s]", " ", t)
    words = []
    for w in t.split():
        if len(w) > 3 and w.endswith("ies"):
            w = w[:-3] + "y"
        elif len(w) > 3 and w.endswith("ses"):
            w = w[:-2]
        elif len(w) > 3 and w.endswith("s") and not w.endswith("ss"):
            w = w[:-1]
        words.append(w)
    return " ".join(words)


def split_targets(raw: str) -> list[str]:
    raw = (raw or "").strip()
    if not raw:
        return []
    parts = [p.strip(" .-") for p in SPLIT_RE.split(raw)]
    parts = [p for p in parts if len(norm(p)) > 1]
    return parts or [raw]


def clean(v) -> str:
    s = "" if v is None else str(v).strip()
    return "" if s.lower() in BLANK else s


def main() -> None:
    weeds = json.load(open(WEEDS, encoding="utf-8"))
    weed_key: dict[str, str] = {}
    for w in weeds:
        for name in (w["en"], w["sci"], w["sci"].split()[0]):
            k = norm(name)
            if k and k not in weed_key:
                weed_key[k] = w["id"]

    wb = openpyxl.load_workbook(XLSX, read_only=True, data_only=True)
    ws = wb["Raw_Data"]
    rows = ws.iter_rows(values_only=True)
    header = [str(h or "").strip() for h in next(rows)]
    col = {h: i for i, h in enumerate(header)}

    cats = [list(c) for c in CAT_ORDER]
    cat_idx = {c[0].lower(): i for i, c in enumerate(cats)}

    crop_names: dict[str, tuple[str, str]] = {}
    target_variants: dict[str, Counter] = defaultdict(Counter)
    records = []

    for r in rows:
        cat_raw = clean(r[col["Display Category"]])
        crop_raw = clean(r[col["Display Crop"]])
        tech = clean(r[col["Technical / Active Ingredient"]])
        target_raw = clean(r[col["Target"]])
        if not (cat_raw and crop_raw and tech):
            continue
        cat_en = cat_raw.split("/")[0].strip()
        ci = cat_idx.get(cat_en.lower())
        if ci is None:
            ci = len(cats)
            cats.append([cat_en, cat_raw.split("/")[-1].strip(), cat_en])
            cat_idx[cat_en.lower()] = ci
        crop_en = crop_raw.split("/")[0].strip()
        crop_gu = crop_raw.split("/")[-1].strip() if "/" in crop_raw else ""
        crop_names.setdefault(crop_en, (crop_gu, CROP_HI.get(crop_en, "")))
        dose = clean(r[col["Dose per hectare (CIBRC source)"]])
        ai = form = ""
        for chunk in dose.split("|"):
            c = chunk.strip()
            low = c.lower()
            if low.startswith("a.i."):
                ai = c.split(":", 1)[-1].strip()
            elif low.startswith("formulation"):
                form = c.split(":", 1)[-1].strip()
            elif low.startswith("source"):
                form = form or c.split(":", 1)[-1].strip()
            elif not ai and not form:
                form = c
        pump = clean(r[col["Per 15 L pump (20 pumps/ha)"]]).split("|")[0].strip()
        water = clean(r[col["Water per hectare"]])
        phi = clean(r[col["PHI / Waiting Period"]])
        timing = clean(r[col["Application Timing / Stage"]])
        for t in split_targets(target_raw):
            k = norm(t)
            if not k:
                continue
            target_variants[k][t.strip()] += 1
            records.append((ci, crop_en, tech, k, (ai, form, pump, water, phi, timing)))

    def display_of(counter: Counter) -> str:
        best = max(
            counter.items(),
            key=lambda kv: (kv[1], sum(c.isupper() for c in kv[0]) > 0, len(kv[0])),
        )[0]
        return best[0].upper() + best[1:] if best else best

    target_ids: dict[str, int] = {}
    targets: list[list] = []
    for k in sorted(target_variants):
        target_ids[k] = len(targets)
        targets.append([display_of(target_variants[k]), weed_key.get(k)])

    crops = sorted(crop_names)
    crop_ids = {c: i for i, c in enumerate(crops)}

    # crop+cat+technical -> dose signature -> ordered target ids
    grouped: dict[tuple, dict[tuple, list[int]]] = defaultdict(lambda: defaultdict(list))
    for ci, crop_en, tech, k, dose in records:
        blocks = grouped[(ci, crop_ids[crop_en], tech)]
        ti = target_ids[k]
        if ti not in blocks[dose]:
            blocks[dose].append(ti)

    groups = []
    for (ci, cr, tech), blocks in grouped.items():
        out_blocks = []
        for dose, tids in blocks.items():
            tids.sort(key=lambda i: targets[i][0].lower())
            out_blocks.append([*dose, tids])
        groups.append([ci, cr, tech, out_blocks])
    groups.sort(key=lambda g: (g[1], g[0], g[2].lower()))

    data = {
        "cats": cats,
        "crops": [[c, crop_names[c][0], crop_names[c][1]] for c in crops],
        "targets": targets,
        "groups": groups,
    }
    with open(OUT, "w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, separators=(",", ":"))

    herb = cat_idx["herbicide"]
    herb_targets = {
        ti for g in groups if g[0] == herb for b in g[3] for ti in b[6]
    }
    linked = sum(1 for ti in herb_targets if targets[ti][1])
    print(f"crops={len(crops)} cats={len(cats)} targets={len(targets)} groups={len(groups)}")
    print(f"herbicide targets={len(herb_targets)} with weed photo={linked}")
    print("unmatched sample:")
    for ti in sorted(herb_targets)[:400]:
        if not targets[ti][1]:
            print("  ", targets[ti][0])


if __name__ == "__main__":
    main()
