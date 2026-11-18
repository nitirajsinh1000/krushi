import re

# Records whose "crop" is really a non-crop context (storage, rodent control,
# public health, construction, aquatic weed clearing, or a parsing artifact).
# These don't fit a crop-first cascading tool, so they're excluded.
# Records whose "crop" is really a non-crop context (storage, rodent control,
# public health, construction, aquatic weed clearing). Per user request these are
# KEPT but grouped into clear non-crop buckets, so they still show up in the
# tool under an obvious heading instead of being silently dropped.
NONCROP_BUCKETS = {
    'empty go downs & sheds': 'Non-Crop: Stored Grain / Godown (Fumigation)',
    'stored whole cereals and seed grains.': 'Non-Crop: Stored Grain / Godown (Fumigation)',
    'millets, pulses, dry fruits, nuts, spices & oilseeds (air tight cover or go downs)': 'Non-Crop: Stored Grain / Godown (Fumigation)',
    'flour suji meals and crushed grain (animal & poultry feed), split pulses dals)': 'Non-Crop: Stored Grain / Godown (Fumigation)',
    'other processed food and empty godowns & sheds (under air ti condition)': 'Non-Crop: Stored Grain / Godown (Fumigation)',
    'other processed food and empty godowns & sheds (under air tight condition)': 'Non-Crop: Stored Grain / Godown (Fumigation)',
    'stored grain': 'Non-Crop: Stored Grain / Godown (Fumigation)',
    'walls, ceilings floors of go downs': 'Non-Crop: Stored Grain / Godown (Fumigation)',
    'go down fumigation': 'Non-Crop: Stored Grain / Godown (Fumigation)',
    'wheat & rice (grain & seed in stacks)': 'Non-Crop: Stored Grain / Godown (Fumigation)',
    'rodents burrows': 'Non-Crop: Rodent Control',
    'go downs, residential premises, public halls': 'Non-Crop: Rodent Control',
    'residential premises': 'Non-Crop: Rodent Control',
    'for rodent control in field and residential premises(to be used under the supervision of trained personal)': 'Non-Crop: Rodent Control',
    'for rodent control in field and residential premises': 'Non-Crop: Rodent Control',
    'indoor': 'Non-Crop: Rodent Control',
    'indoor or outdoor': 'Non-Crop: Rodent Control',
    'poultry farm': 'Non-Crop: Rodent Control',
    'post- construction (building)': 'Non-Crop: Building / Termite Control',
    'pre- construction (building)': 'Non-Crop: Building / Termite Control',
    'public health': 'Non-Crop: Public Health / Vector Control',
    "mosquitoes (aedes aegypti, anopheles stephensi, culex quinquefasciatus ) housefly (musca domestica) cockroaches (periplanata americana, blatella germinica), bed bugs (cimex hemipterus)": 'Non-Crop: Public Health / Vector Control',
    'aquatic weeds': 'Non-Crop: Aquatic / Waterways Weed Control',
    'aquatic weed control water ways canals, ponds etc.': 'Non-Crop: Aquatic / Waterways Weed Control',
}

# Pure parsing artifacts / corrupted rows - not usable data at all, dropped outright.
DROP_CROPS = {
    'ethephon 39 % sl', 'ethephon 39% sl', 'before', 'and coconut)', 'maize [pre-plant',
    'citrus, rubber, paddy (rice),tea, vegetables',
    'cabbage/ cauliflower, tomato, brinjal, chillies, beans, ornamental',
    'milled products: de-oiled cakes, rice bran',
}

# Suffix/qualifier fragments that describe *how or when* a product is applied,
# not a different crop. Stripping them folds e.g. "Groundnut (Seed Treatment)"
# back into plain "Groundnut".
QUALIFIER_KEYWORDS = [
    'post-emergence', 'post emergence', 'pre-emergence', 'pre emergence', 'poe', 'pe –', 'pe-',
    'leaf stage', 'days after sowing', ' das', 'dat)', ' dat ', 'dap)', 'soil drench', 'drench',
    'foliar application', 'foliar', 'seed treatment', 'nursery', 'seedlings', 'seedling',
    'tillage', 'sowing', 'transplanting', 'under supervision', 'trained personal',
    'under ambient', 'cold condition', 'minimum tillage', 'inter row application',
    'directed inter row', 'on ground', 'pre- plant', 'pre-plant', 'plant incorporation',
    ' dap', 'dap)', 'emergence application', 'das)', 'dat)', 'dap.', 'das.',
]

# Hand-reviewed synonym merges for the high-frequency crop clusters (spelling /
# spacing / Hindi-English synonym variants that clearly refer to one crop).
# Keys are matched AFTER lowercasing + whitespace normalization + qualifier-stripping.
MERGE_MAP = {
    'apple': 'Apple', 'apples': 'Apple', 'apple*': 'Apple', 'apple fruit': 'Apple',
    'bajra': 'Pearl Millet', 'pearl millet': 'Pearl Millet', 'pearlmillet': 'Pearl Millet',
    'barely': 'Barley', 'barley': 'Barley',
    'bean': 'Beans', 'beans': 'Beans',
    'bengal gram': 'Bengal Gram (Chickpea)', 'bengal gram (gram or chickpea)': 'Bengal Gram (Chickpea)',
    'ber': 'Ber',
    'bhindi': 'Okra (Bhindi)', 'bhindi (okra)': 'Okra (Bhindi)', 'okra': 'Okra (Bhindi)',
    'okra (bhindi)': 'Okra (Bhindi)', 'okra(bhindi)': 'Okra (Bhindi)',
    'black gram': 'Black Gram', 'blackgram': 'Black Gram',
    'brinjal': 'Brinjal', 'brinjal, bhindi': 'Brinjal',
    'cabbage': 'Cabbage', 'cabbage & cauliflower': 'Cabbage & Cauliflower',
    'cabbage, cauliflower': 'Cabbage & Cauliflower',
    'cauliflower': 'Cauliflower', 'cauliflower r': 'Cauliflower',
    'cherry': 'Cherry', 'cherries': 'Cherry', 'sweet cherry': 'Cherry',
    'chick pea': 'Chickpea', 'chickpea': 'Chickpea',
    'chili': 'Chilli', 'chili seedlings': 'Chilli', 'chilies': 'Chilli', 'chillies': 'Chilli',
    'chilli': 'Chilli', 'chilli`': 'Chilli', 'chilli seedlings': 'Chilli',
    'chillies & okra': 'Chilli & Okra',
    'citrus': 'Citrus', 'citrus (sweet orange)': 'Citrus',
    'cluster beans': 'Cluster Bean', 'cluster bean': 'Cluster Bean', 'clusterbean': 'Cluster Bean',
    'coconut': 'Coconut', 'coconut/ bamboo': 'Coconut / Bamboo',
    'coffee': 'Coffee', 'coffee (arabica)': 'Coffee (Arabica)', 'coffee (robusta)': 'Coffee (Robusta)',
    'corn': 'Maize', 'maize': 'Maize',
    'cotton': 'Cotton', 'cotton (gossypium)': 'Cotton',
    'cow pea': 'Cowpea', 'cowpea': 'Cowpea',
    'cucumber': 'Cucumber', 'cucurbits': 'Cucurbits',
    'direct seeded rice': 'Rice (Direct Seeded)', 'direct seeded paddy': 'Rice (Direct Seeded)',
    'rice (direct seeded rice)': 'Rice (Direct Seeded)', 'rice (direct seeded)': 'Rice (Direct Seeded)',
    'rice - direct seeded': 'Rice (Direct Seeded)',
    'direct seeded imazethapyr- herbicide tolerant rice': 'Rice (Direct Seeded)',
    '(direct seeded rice under puddled condition)': 'Rice (Direct Seeded)',
    'french bean': 'French Bean',
    'gherkin': 'Gherkin', 'gherkins': 'Gherkin',
    'grape': 'Grapes', 'grapes': 'Grapes', 'grape (seedless)': 'Grapes',
    'green gram': 'Green Gram', 'greengram': 'Green Gram',
    'green pea': 'Green Pea',
    'ground nut': 'Groundnut', 'groundnut': 'Groundnut',
    'groundnut, sugarcane': 'Groundnut',
    'guava': 'Guava',
    'jowar': 'Sorghum', 'sorghum': 'Sorghum',
    'jute': 'Jute',
    'mandarin': 'Mandarin', 'mandarins': 'Mandarin',
    'mango': 'Mango',
    'mustard': 'Mustard',
    'okra (seed treatment)': 'Okra (Bhindi)',
    'paddy': 'Rice (Paddy)', 'paddy (rice)': 'Rice (Paddy)', 'paddy(rice)': 'Rice (Paddy)',
    'paddy ( rice)': 'Rice (Paddy)', 'rice': 'Rice (Paddy)', 'rice (paddy)': 'Rice (Paddy)',
    'rice(paddy)': 'Rice (Paddy)', 'rice (paddy) &cotton': 'Rice (Paddy)',
    'paddy sheath': 'Rice (Paddy)',
    'pea': 'Pea', 'peas': 'Pea',
    'peach': 'Peach', 'peaches': 'Peach',
    'pigeon pea': 'Pigeon Pea (Red Gram / Tur / Arhar)', 'pigeonpea': 'Pigeon Pea (Red Gram / Tur / Arhar)',
    'red gram': 'Pigeon Pea (Red Gram / Tur / Arhar)', 'red gram (arhar/tur)': 'Pigeon Pea (Red Gram / Tur / Arhar)',
    'red gram (tur or arhar)': 'Pigeon Pea (Red Gram / Tur / Arhar)',
    'pigeon pea or red gram (arhar/tur)': 'Pigeon Pea (Red Gram / Tur / Arhar)',
    'pigeonpea (red gram/arhar /tur)': 'Pigeon Pea (Red Gram / Tur / Arhar)',
    'pigeon pea (tur)': 'Pigeon Pea (Red Gram / Tur / Arhar)',
    'pigeon pea (tur/arhar)': 'Pigeon Pea (Red Gram / Tur / Arhar)',
    'pineapple': 'Pineapple',
    'pomegranate': 'Pomegranate',
    'potato': 'Potato', 'potato tuber': 'Potato',
    'pulses (black gram /greengram)': 'Pulses (Black Gram / Green Gram)',
    'pulses (cowpea, mung bean, urdbean)': 'Pulses (Cowpea / Mung Bean / Urd Bean)',
    'ragi': 'Ragi',
    'rapeseed/ mustard': 'Rapeseed / Mustard',
    'ridge gourd': 'Ridge Gourd',
    'rose': 'Rose', 'rose(ornamental)': 'Rose', 'roses': 'Rose',
    'rubber': 'Rubber',
    'safflower': 'Safflower',
    'sesamum': 'Sesamum',
    'soya bean': 'Soybean', 'soyabean': 'Soybean', 'soybean': 'Soybean',
    'sugar beet': 'Sugar Beet',
    'sugarcane': 'Sugarcane',
    'sunflower': 'Sunflower',
    'tapioca': 'Tapioca',
    'tea': 'Tea',
    'teak': 'Teak',
    'tobacco': 'Tobacco', 'tobacco nursery': 'Tobacco',
    'tomato': 'Tomato', 'tomato foliar application': 'Tomato', 'tomato soil drench': 'Tomato',
    'tomato/chilli es': 'Tomato & Chilli',
    'tomato / potato / cabbage / cauliflower': 'Tomato / Potato / Cabbage / Cauliflower',
    'transplanted': 'Rice (Transplanted)', 'transplanted paddy': 'Rice (Transplanted)',
    'transplanted rice': 'Rice (Transplanted)', 'transplanted rice (paddy)': 'Rice (Transplanted)',
    'transplated rice': 'Rice (Transplanted)',
    'rice (transplanted rice)': 'Rice (Transplanted)', 'rice (transplanted)': 'Rice (Transplanted)',
    'paddy (transplanted rice)': 'Rice (Transplanted)', 'paddy (transplanted)': 'Rice (Transplanted)',
    'rice (transplanted & direct seeded)': 'Rice (Transplanted)',
    'rice (transplanted & direct sown puddled)': 'Rice (Transplanted)',
    'rice (transplanted & direct sown upland)': 'Rice (Transplanted)',
    'turmeric': 'Turmeric',
    'walnut': 'Walnut',
    'watermelon': 'Watermelon',
    'wheat': 'Wheat', 'wheat, gram': 'Wheat & Gram',
    'transplanted rice (pre- emergence application-3 dat': 'Rice (Transplanted)',
    'transplanted rice pre-emergence (3 dat)': 'Rice (Transplanted)',
    'transplated rice (post-em 20 dat)': 'Rice (Transplanted)',
    'rice (transplanted) (10-14 dap)': 'Rice (Transplanted)',
    'rice (transplanted) (5-10 dat)': 'Rice (Transplanted)',
    'soybean (3-15das)': 'Soybean',
    'soybean (pre- emergence)': 'Soybean',
    'groundnut (pre- emergence)': 'Groundnut',
    'nursery paddy': 'Rice (Paddy)',
    'paddy (direct seeded rice)': 'Rice (Direct Seeded)',
    'caster': 'Castor',
    'grapes –': 'Grapes', 'grapes -': 'Grapes',
}


def strip_qualifiers(crop):
    c = crop
    # bracket/paren content that is an application-timing/method note, not a crop
    def _paren_ok_to_strip(m):
        inner = m.group(1).lower()
        if any(k in inner for k in QUALIFIER_KEYWORDS):
            return ''
        return m.group(0)

    c = re.sub(r'\(([^()]*)\)', _paren_ok_to_strip, c)
    c = re.sub(r'\[([^\[\]]*)\]', lambda m: '' if any(k in m.group(1).lower() for k in QUALIFIER_KEYWORDS) else m.group(0), c)

    low = c.lower()
    if any(k in low for k in QUALIFIER_KEYWORDS) and '(' not in c and '[' not in c:
        for k in QUALIFIER_KEYWORDS:
            idx = low.find(k)
            if idx > 0:
                c = c[:idx]
                break
    return c


def normalize_crop(raw):
    """Returns the canonical crop label, or None if the row should be dropped
    entirely (pure parsing artifact)."""
    if not raw:
        return None
    c = raw.strip()
    c = re.sub(r'[`\'"]+$', '', c).strip()
    c = re.sub(r'\s*[\u2013\u2014-]\s*$', '', c).strip()
    c = re.sub(r'(\S)\(', r'\1 (', c)
    c = re.sub(r'\s+', ' ', c).strip()

    low_check = c.lower().strip()
    if low_check in DROP_CROPS:
        return None
    if low_check in NONCROP_BUCKETS:
        return NONCROP_BUCKETS[low_check]

    c = strip_qualifiers(c)
    c = re.sub(r'\s+', ' ', c).strip(' ,-')
    if not c:
        return None

    low_check2 = c.lower().strip()
    if low_check2 in DROP_CROPS:
        return None
    if low_check2 in NONCROP_BUCKETS:
        return NONCROP_BUCKETS[low_check2]

    key = c.lower().strip()
    if key in MERGE_MAP:
        return MERGE_MAP[key]

    # Title-case only if the string looks like it lost its capitalisation
    # (i.e. is fully lowercase) - otherwise trust the source's existing casing.
    if c == c.lower():
        c = c[:1].upper() + c[1:]

    return c
