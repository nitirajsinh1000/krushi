import json, re
from collections import Counter, defaultdict

MANUAL_MERGE_PAIRS = [
    ('downy mildew', 'downey mildew'),
    ('whitefly', 'white fly'),
    ('whiteflies', 'white flies'),
    ('whitefly', 'whiteflies'),
    ('bollworm', 'boll worm'),
    ('stem fly', 'stemfly'),
    ('leaf folder', 'leaffolder'),
    ('stem borer', 'stemborer'),
    ('leaf hopper', 'leafhopper'),
    ('green leafhopper', 'green leaf hopper'),
    ('shoot borer', 'shootborer'),
    ('fruit fly', 'fruitfly'),
    ('root rot', 'rootrot'),
    ('collar rot', 'collarrot'),
]

# Regex substitutions applied to the WHOLE string before grouping, so compound
# terms like "American boll worm" and "American bollworm" collapse to the same
# base key (not just exact whole-string matches).
SPACING_SUBS = [
    (r'\bboll\s*worm', 'bollworm'), (r'\bwhite\s*fly', 'whitefly'),
    (r'\bwhite\s*flies', 'whiteflies'), (r'\bleaf\s*folder', 'leaf folder'),
    (r'\bleaf\s*hopper', 'leafhopper'), (r'\bstem\s*borer', 'stemborer'),
    (r'\bstem\s*fly', 'stem fly'), (r'\bshoot\s*borer', 'shootborer'),
    (r'\bfruit\s*fly', 'fruitfly'), (r'\broot\s*rot', 'rootrot'),
    (r'\bcollar\s*rot', 'collarrot'), (r'\bdowney\s*mildew', 'downy mildew'),
]

# Bare adjective/qualifier fragments that are not themselves a pest name -
# these only appear validly as a PREFIX of a fuller name (e.g. "American
# bollworm"). If found standalone with no fuller variant to merge into, drop.
ORPHAN_FRAGMENTS = {'american', 'spotted', 'pink', 'egyptian', 'yellow', 'green', 'red', 'black', 'common'}


def apply_spacing_subs(text):
    t = text
    for pat, repl in SPACING_SUBS:
        t = re.sub(pat, repl, t, flags=re.I)
    return t


def base_key(text):
    """Grouping key: spacing-normalized, parenthetical content stripped, lowercased."""
    t = apply_spacing_subs(text)
    t = re.sub(r'\([^()]*\)', '', t)
    t = re.sub(r'\s+', ' ', t).strip().lower()
    return t


def build_pest_normalization_map(records):
    import difflib
    freq = Counter(r['Pest'] for r in records if r['Category'] != 'PGR')

    def bare_and_sci(text):
        t = apply_spacing_subs(text)
        m = re.search(r'\(([^()]*)\)', t)
        sci = m.group(1).strip() if m else ''
        bare = re.sub(r'\([^()]*\)', '', t).strip()
        bare = re.sub(r'\s+', ' ', bare)
        return bare.lower(), sci

    # bare_key -> { sci_lower_or_'' : [(orig_text, count), ...] }
    by_bare = defaultdict(lambda: defaultdict(list))
    for text, n in freq.items():
        bare, sci = bare_and_sci(text)
        by_bare[bare][sci.lower()].append((text, n))

    bare_keys = set(by_bare.keys())
    # singular/plural + manual merges operate on the BARE key only
    bare_parent = {k: k for k in bare_keys}

    def find(x, parent):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(a, b, parent, weight_fn):
        if a not in parent or b not in parent:
            return
        ra, rb = find(a, parent), find(b, parent)
        if ra == rb:
            return
        if weight_fn(rb) > weight_fn(ra):
            ra, rb = rb, ra
        parent[rb] = ra

    bare_weight = lambda k: sum(n for grp in by_bare[k].values() for _, n in grp)
    for k in list(bare_keys):
        if k.endswith('s') and len(k) > 4 and k[:-1] in bare_keys:
            union(k[:-1], k, bare_parent, bare_weight)
    for a, b in MANUAL_MERGE_PAIRS:
        if a in bare_keys and b in bare_keys:
            union(a, b, bare_parent, bare_weight)
    for k in list(bare_keys):
        if k in ORPHAN_FRAGMENTS:
            fuller = [k2 for k2 in bare_keys if k2 != k and k2.startswith(k + ' ')]
            if fuller:
                fuller.sort(key=lambda k2: (-bare_weight(k2), k2))
                union(fuller[0], k, bare_parent, bare_weight)

    merged_bare = defaultdict(lambda: defaultdict(list))
    for k in bare_keys:
        root = find(k, bare_parent)
        for sci, variants in by_bare[k].items():
            merged_bare[root][sci].extend(variants)

    final_map = {}
    dropped = set()
    for root, sci_groups in merged_bare.items():
        if root in ORPHAN_FRAGMENTS and not any(s for s in sci_groups if s):
            for variants in sci_groups.values():
                dropped.update(t for t, _ in variants)
            continue

        # cluster scientific names within this bare group by similarity (typo-tolerant),
        # so real spelling noise merges but genuinely different species do NOT.
        sci_names = [s for s in sci_groups if s]
        sci_clusters = []  # list of lists of sci-name keys
        for s in sorted(sci_names, key=lambda s: (-sum(n for _, n in sci_groups[s]), s)):
            placed = False
            for cluster in sci_clusters:
                if difflib.SequenceMatcher(None, s, cluster[0]).ratio() > 0.82:
                    cluster.append(s)
                    placed = True
                    break
            if not placed:
                sci_clusters.append([s])

        bare_variants = sci_groups.get('', [])

        if not sci_clusters:
            # no scientific name anywhere in this group - single canonical bare form
            pool = sorted(bare_variants, key=lambda x: (-x[1], x[0]))
            canon = pool[0][0]
            for t, _ in bare_variants:
                final_map[t] = canon
        elif len(sci_clusters) == 1:
            # one species (allowing for spelling noise) - merge everything, prefer
            # the scientific-named form as canonical (most informative + accurate)
            cluster = sci_clusters[0]
            all_variants = list(bare_variants)
            for s in cluster:
                all_variants.extend(sci_groups[s])
            pool = (sorted([v for v in all_variants if '(' in v[0]], key=lambda x: (-x[1], x[0]))
                    or sorted(all_variants, key=lambda x: (-x[1], x[0])))
            canon = pool[0][0]
            for t, _ in all_variants:
                final_map[t] = canon
        else:
            # multiple DISTINCT species share this common name - keep them separate
            # rather than risk attributing the wrong scientific name.
            for cluster in sci_clusters:
                all_variants = []
                for s in cluster:
                    all_variants.extend(sci_groups[s])
                pool = sorted(all_variants, key=lambda x: (-x[1], x[0]))
                canon = pool[0][0]
                for t, _ in all_variants:
                    final_map[t] = canon
            # bare (no-species) mentions: leave as their own canonical rather than
            # guessing which species they meant
            if bare_variants:
                pool = sorted(bare_variants, key=lambda x: (-x[1], x[0]))
                canon = pool[0][0]
                for t, _ in bare_variants:
                    final_map[t] = canon

    return final_map, dropped


if __name__ == '__main__':
    with open('/home/claude/build/data_sorted.json') as f:
        recs = json.load(f)
    pest_map, dropped = build_pest_normalization_map(recs)

    changed = sum(1 for k, v in pest_map.items() if k != v)
    print(f"{changed} of {len(pest_map)} distinct raw pest strings remapped; {len(dropped)} pure orphan fragments dropped")

    for k, v in list(pest_map.items()):
        if k != v and ('american' in k.lower() or 'aphid' in k.lower() or 'jassid' in k.lower()):
            print(f'  {k!r} -> {v!r}')
    print('\nDropped:', dropped)

    # sanity: confirm mustard aphid and cotton aphid did NOT collapse together
    mustard = {v for k, v in pest_map.items() if 'lipaphis' in k.lower() or 'mustard aphid' in k.lower()}
    cotton = {v for k, v in pest_map.items() if 'gossyp' in k.lower() or 'gosypii' in k.lower()}
    print('\nMustard-aphid canonical forms:', mustard)
    print('Cotton-aphid canonical forms:', cotton)
    print('Correctly kept separate:', mustard.isdisjoint(cotton))

    with open('/home/claude/build/pest_map2.json', 'w') as f:
        json.dump(pest_map, f, indent=1, ensure_ascii=False)

