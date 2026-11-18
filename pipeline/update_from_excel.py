"""Rebuild src/data/webapp-data.json (PestRow format) from a PPQS workbook's Raw_Data sheet.
Usage: python3 pipeline/update_from_excel.py <workbook.xlsx>  then  python3 pipeline/link_weeds.py"""
import json, sys, os, openpyxl
sys.path.insert(0, os.path.dirname(__file__))
from pump_dose import compute_pump_dose
from pump_extra import extra_pump
OUT = "src/data/webapp-data.json"
old = json.load(open(OUT))
cats = [list(c) for c in old["cats"]]
cat_idx = {c[0].lower(): i for i, c in enumerate(cats)}
crop_gu = {c[0]: c[1] for c in old["crops"]}
def cl(v):
    s = "" if v is None else str(v).strip()
    return "" if s.lower() in {"-", "--", "na", "n.a.", "nil", "none"} else s
wb = openpyxl.load_workbook(open(sys.argv[1], "rb"), read_only=True, data_only=True)
rows = wb["Raw_Data"].iter_rows(values_only=True); next(rows)
recs = []
for r in rows:
    crop, cat, tgt, tech = (cl(x) for x in r[:4])
    if not (crop and cat and tech and tgt): continue
    ce = cat.split("/")[0].strip()
    if ce.lower() not in cat_idx:
        cat_idx[ce.lower()] = len(cats); cats.append([ce, cat.split("/")[-1].strip()])
    cr = crop.split("/")[0].strip()
    if "/" in crop and not crop_gu.get(cr): crop_gu[cr] = crop.split("/")[-1].strip()
    crop_gu.setdefault(cr, "")
    ai = form = ""
    for ch in cl(r[4]).split("|"):
        c = ch.strip(); lo = c.lower()
        if lo.startswith("a.i."): ai = c.split(":", 1)[-1].strip()
        elif lo.startswith("formulation"): form = c.split(":", 1)[-1].strip()
        elif not ai and not form: form = c
    pump = cl(r[5]) or extra_pump(form, tech) or compute_pump_dose(form)
    recs.append((cat_idx[ce.lower()], cr, tech, [tgt, ai, form, pump, cl(r[6]), cl(r[7]), cl(r[8])]))
crops = sorted(crop_gu); cid = {c: i for i, c in enumerate(crops)}
g = {}
for ci, cr, tech, p in recs:
    lst = g.setdefault((ci, cid[cr], tech), [])
    if p not in lst: lst.append(p)
groups = [[k[0], k[1], k[2], v] for k, v in g.items()]
groups.sort(key=lambda x: (x[1], x[0], x[2].lower()))
json.dump({"cats": cats, "crops": [[c, crop_gu[c]] for c in crops], "groups": groups}, open(OUT, "w"), ensure_ascii=False, separators=(",", ":"))
print(f"crops={len(crops)} groups={len(groups)} technicals={len({x[2] for x in groups})}")
