import re

PROTECT_TOKEN = '\x00{}\x00'


def split_pest_field(text):
    """Split a possibly-bunched pest/disease/weed field ('Jassids, Bollworms',
    'Powdery mildew and Anthracnose') into individual items, WITHOUT splitting
    inside parenthetical scientific names."""
    if not text:
        return [text]
    protected = []

    def protect(m):
        protected.append(m.group(0))
        return PROTECT_TOKEN.format(len(protected) - 1)

    t = re.sub(r'\([^()]*\)', protect, text)
    parts = re.split(r'\s*,\s*|\s+and\s+|\s*&\s*', t, flags=re.I)

    out = []
    for p in parts:
        def unprotect(m):
            return protected[int(m.group(1))]
        p2 = re.sub(r'\x00(\d+)\x00', unprotect, p)
        p2 = p2.strip(' .')
        p2 = re.sub(r'\s+', ' ', p2)
        if p2 and p2.lower() not in ('etc', 'etc.', 'complex'):
            out.append(p2)
    result = out if out else [text]

    # second pass: some source rows bunch pests as "Name - Genus species Name2 -
    # Genus2 species2" (dash before each scientific name, no comma at all)
    final = []
    for item in result:
        final.extend(split_dash_bunched(item))
    return final


DASH_SCI_RE = re.compile(
    r'([A-Za-z][\w\'\.]*(?:\s+[A-Za-z][\w\'\.]*)*?)\s*[\u2013\u2010-]\s*'
    r'([A-Z][a-z]+\s+[a-z]+(?:\s+[a-z]+)?)\.?'
)


def split_dash_bunched(text):
    matches = DASH_SCI_RE.findall(text)
    if len(matches) < 2:
        return [text]
    out = []
    for name, sci in matches:
        name, sci = name.strip(' .'), sci.strip(' .')
        if name and sci:
            out.append(f"{name} ({sci})")
    return out if out else [text]


if __name__ == '__main__':
    tests = [
        "Jassids, Bollworms",
        "Red spider mites(Tetranychus urticae) and Leaf Miner",
        "Yellow stem borer, Leaf folder, Plant Hoppers, Green leaf hopper",
        "Echinochloa colona, Cynodon dactylon, Cyperus rotundus, Amaranthus viridis, Trianthema spp., Digitaria sanguinalis",
        "Powdery mildew and Anthracnose",
        "Alternaria blotch and Premature leaf fall",
        "Root-knot nematode (Meloidogyne spp.)",
        "Botrytis cinerea, Penicillium sp Alternaria alternata Mucor piriformis",
        "Nilaparvata lugens, Sogatella furcifera",
        "Bollworm complex",
    ]
    for t in tests:
        print(repr(t), '->', split_pest_field(t))
