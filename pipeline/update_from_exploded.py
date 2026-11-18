"""Rebuild src/data/webapp-data.json from the exploded single-sheet PPQS workbook
(PPQS_All_Pesticides_Single_Sheet_Exploded_1.xlsx).

Each row is already exploded per target, with per-pump doses, target Gujarati/
scientific names and a direct weed-photo reference column. Rows are mapped onto
the app's existing 6 categories and 97 crop/use names (so crop photos keep
working); genuinely new use sites are added.

Output:
  src/data/webapp-data.json
  src/data/weed-refs.json  (direct weed links, consumed by link_weeds_exploded.py)

Usage: python3 pipeline/update_from_exploded.py <exploded.xlsx>
"""
import json, os, re, sys
import pandas as pd

OUT = "src/data/webapp-data.json"
WEEDREFS = "src/data/weed-refs.json"
COLS = ["sr", "cat", "sub", "tech", "formu", "crop", "cond", "tgt", "tgt_gu",
        "tgt_sci", "weedfile", "ai", "dose_ha", "pump", "water", "phi", "orig", "page"]

old = json.load(open(OUT))
cats = [list(c) for c in old["cats"]]           # keep the 6 categories and their order
CAT_NUM = {1: 0, 2: 2, 3: 1, 4: 3, 5: 4, 6: 5}  # sheet number -> existing cat index
crop_gu = {c[0]: c[1] for c in old["crops"]}
OLD_CROPS_LC = {c[0].lower(): c[0] for c in old["crops"]}  # canonical old casing

GU_RE = re.compile(r"[\u0A80-\u0AFF]")

ALIAS = {
    "pearl millet / bajra": "Bajra", "betel vine": "Betel",
    "black gram / urad": "Black gram", "carnation": "Carnations",
    "chickpea / bengal gram": "Chickpea", "cluster bean / guar": "Cluster bean",
    "finger millet / ragi": "Ragi", "green gram / moong": "Green gram",
    "maize / corn": "Maize", "mandarin / orange": "Mandarin",
    "mentha / mint": "Mentha", "okra / bhindi": "Okra", "opium poppy": "Opium",
    "ornamental plants": "Ornamental", "pigeon pea / tur": "Pigeon pea",
    "rice / paddy": "Rice", "sorghum / jowar": "Sorghum", "sugarbeet": "Sugar beet",
    "tapioca / cassava": "Tapioca", "sweet cherry": "Cherry",
    "french bean / kidney bean": "French bean", "green pea": "Pea",
    "rapeseed / mustard": "Mustard", "grapefruit": "Citrus",
    "chilli - nursery": "Chilli", "tobacco - nursery": "Tobacco",
    "tomato - nursery": "Tomato", "rice / paddy - nursery": "Rice",
    "rice / paddy - transplanted": "Rice", "rice / paddy - direct seeded": "Rice",
    "building": "Building", "crop & non-crop area": "Non-crop area",
    "scheduled desert area": "Non-crop area", "all crops": "All Crops",
    "rice - stored grain": "Storage area", "wheat - stored grain": "Storage area",
    "stored grain": "Storage area", "godown fumigation": "Storage area",
    "empty godowns & sheds": "Storage area", "plywood": "Wood", "veneer": "Wood",
    "wood": "Wood", "poultry farm": "Poultry farm",
    "godowns, residential premises, public halls": "Residential premises",
    "dry fruits, nuts spices & oil seeds": "Storage area",
    "millets, pulses, dry fruits, nuts, spices & oilseeds": "Storage area",
    "stored whole cereals and seed grains millet, pulses dry fruits, nuts spices & oil seeds": "Storage area",
    "stored whole cereals and seed, millet, pulses": "Storage area",
    "stored whole cereals millets pulses": "Storage area",
    "stored whole cereals and seed grains.": "Storage area",
    "milled products: flour": "Storage area",
    "flour suji meals and crushed grain": "Storage area",
    "walls, ceilings floors of godowns": "Storage area",
    "other processed food and empty godowns & sheds": "Storage area",
    "household": "Residential premises", "house hold": "Residential premises",
    "indoor": "Residential premises", "indoor or outdoor": "Residential premises",
    "in and around premises": "Residential premises",
    "space spray in houses": "Residential premises",
    "spot spray in houses": "Residential premises",
    "public health / household": "Residential premises",
    "for rodent control in field and residential premises": "Field",
    "rodents burrows": "Field",
    "public health / water bodies": "Public health",
    "for public health use for controlling mosquitoes transmit malaria": "Public health",
    "cockroaches": "Public health", "american cockroaches": "Public health",
    "american cockroaches & german cockroaches": "Public health",
    "german cockroaches": "Public health", "houseflies": "Public health",
    "housefly, adult mosquitoes": "Public health", "mosquito spp.": "Public health",
    "insects": "Public health",
    "anopheles stephensi, culex quinquefasciatus, aedes aegypti": "Public health",
    "clean surface water": "Public health", "polluted surface water": "Public health",
    "mosquito breeding surface": "Public health",
}


def clean(v) -> str:
    s = "" if v is None else str(v).strip()
    return "" if s.lower() in {"-", "--", "na", "n.a.", "n.a", "nil", "none", "nan"} else s


def crop_en(raw: str) -> str:
    m = re.match(r"^(.*?)\s*\(", raw)
    return (m.group(1) if m else raw).strip()


def crop_guj(raw: str, en: str) -> str:
    inner = raw[len(en):].strip(" ()") if raw.startswith(en) else ""
    return inner.strip() if GU_RE.search(inner) else ""


def map_crop(raw: str):
    raw = raw.strip()
    en = crop_en(raw)
    gu = crop_guj(raw, en)
    key = re.sub(r"\s+", " ", en).strip().rstrip(".").lower()
    if key in ALIAS:
        name = ALIAS[key]
    elif "aquatic" in key:
        name = "Aquatic"
    elif "stored" in key or "godown" in key or "milled" in key or "flour" in key or "warehouse" in key:
        name = "Storage area"
    elif ("household" in key or "house hold" in key or "indoor" in key
          or "premises" in key or "houses" in key or "ready to use" in key
          or "residential" in key):
        name = "Residential premises"
    elif ("mosquito" in key or "public health" in key or "cockroach" in key
          or "housefl" in key or "water" in key or "drain" in key or "malaria" in key):
        name = "Public health"
    elif "non-crop" in key:
        name = "Non-crop area"
    elif "construction" in key:
        name = "Building"
    else:
        name = en
    name = OLD_CROPS_LC.get(name.lower(), name)  # keep old casing so photos match
    if not name or name == "-":
        return ""
    if gu and not crop_gu.get(name):
        crop_gu[name] = gu
    crop_gu.setdefault(name, "")
    return name


def split_sci(target: str, sci: str) -> str:
    if sci and sci.lower() not in target.lower():
        return f"{target} ({sci})"
    return target


def norm_phi(v: str) -> str:
    s = clean(v)
    return re.sub(r"\s*days?\s*$", "", s, flags=re.I).strip()


df = pd.read_excel(sys.argv[1], skiprows=2)
df.columns = COLS
main = df[~df["sub"].astype(str).str.contains("96 Weeds")].fillna("")

recs = []  # (catIdx, cropName, tech, entry, weedSlugs)
for _, r in main.iterrows():
    cat_num = int(str(r["cat"]).strip()[0])
    ci = CAT_NUM[cat_num]
    tech = clean(r["tech"])
    crop = map_crop(str(r["crop"]))
    if not (tech and crop):
        continue
    tgt = clean(r["tgt"]) or clean(r["orig"])
    if not tgt:
        continue
    target = split_sci(tgt, clean(r["tgt_sci"]))
    entry = [target, clean(r["ai"]), clean(r["dose_ha"]), clean(r["pump"]),
             clean(r["water"]), norm_phi(r["phi"]), clean(r["cond"])]
    wf = clean(r["weedfile"])
    slugs = []
    if wf.startswith("weeds/"):
        slug = wf[len("weeds/"):].rsplit(".", 1)[0]
        slugs = [slug]
    recs.append((ci, crop, tech, entry, slugs))

# group by (cat, crop, tech), preserving first-seen entry order
g = {}
refs = []  # (key, pestIdx, slugs)
for ci, crop, tech, entry, slugs in recs:
    key = (ci, crop, tech)
    lst = g.setdefault(key, [])
    if entry in lst:
        continue
    if slugs:
        refs.append((key, len(lst), slugs))
    lst.append(entry)

crops = sorted(crop_gu)
cid = {c: i for i, c in enumerate(crops)}
groups = [[k[0], cid[k[1]], k[2], v] for k, v in g.items()]
groups.sort(key=lambda x: (x[1], x[0], x[2].lower()))
key_final = {k: i for i, k in enumerate(g.keys())}

weed_refs = {}
for key, pi, slugs in refs:
    gi = key_final[key]
    weed_refs.setdefault(f"{gi}:{pi}", []).extend(s for s in slugs if s not in weed_refs.get(f"{gi}:{pi}", []))

json.dump({"cats": cats, "crops": [[c, crop_gu[c]] for c in crops], "groups": groups},
          open(OUT, "w"), ensure_ascii=False, separators=(",", ":"))
json.dump(weed_refs, open(WEEDREFS, "w"), ensure_ascii=False, separators=(",", ":"))
n_linked = sum(1 for v in weed_refs.values() if v)
print(f"crops={len(crops)} groups={len(groups)} technicals={len({x[2] for x in groups})} entries={sum(len(x[3]) for x in groups)}")
print(f"weed-refs: {len(weed_refs)} entries, {len({s for v in weed_refs.values() for s in v})} weeds covered")
