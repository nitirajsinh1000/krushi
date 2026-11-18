"""Link weeds.json entries to herbicide target strings in webapp-data.json.

Output: src/data/weed-links.json
  { weedId: [[groupIdx, pestIdx], ...] }
Matching is fuzzy: genus prefix + species prefix, or English common name,
to survive the source workbook's misspellings (Digiteria, agypytium ...).
"""
import json, re, unicodedata

DATA = json.load(open("src/data/webapp-data.json"))
WEEDS = json.load(open("src/data/weeds.json"))


def norm(s: str) -> str:
    s = unicodedata.normalize("NFKD", s).lower()
    return re.sub(r"[^a-z ]+", " ", s)


def toks(s: str):
    return [t for t in norm(s).split() if len(t) > 2]


links: dict[str, list[list[int]]] = {w["id"]: [] for w in WEEDS}

prepared = []
for w in WEEDS:
    parts = toks(w["sci"])
    genus = parts[0] if parts else ""
    species = parts[1] if len(parts) > 1 else ""
    prepared.append((w["id"], genus[:5], species[:4], norm(w["en"]).strip()))

for gi, g in enumerate(DATA["groups"]):
    if g[0] != 2:  # herbicides only
        continue
    for pi, p in enumerate(g[3]):
        t = norm(p[0])
        words = t.split()
        for wid, genus, species, en in prepared:
            hit = False
            if genus:
                for k, word in enumerate(words):
                    if word.startswith(genus):
                        nxt = words[k + 1] if k + 1 < len(words) else ""
                        if not species or nxt.startswith(species) or nxt in ("spp", "sp"):
                            hit = True
                            break
            if not hit and en and len(en) > 6 and en in t:
                hit = True
            if hit:
                links[wid].append([gi, pi])

json.dump(links, open("src/data/weed-links.json", "w"), separators=(",", ":"))
n = sum(1 for v in links.values() if v)
print(f"{n}/{len(links)} weeds linked, {sum(len(v) for v in links.values())} refs")
