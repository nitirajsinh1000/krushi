import re

PUMPS_PER_HECTARE = 20  # user-specified: 20 knapsack pumps (15 L each) cover 1 hectare

NA_LIKE = {'-', '--', 'nil', 'na', 'n.a.', 'n.a', '', '0', 'zero'}

UNIT_PATTERNS = [
    (re.compile(r'\bkgs?\b', re.I), 'kg'),
    (re.compile(r'\bgm?s?\b', re.I), 'g'),
    (re.compile(r'\bmls?\b', re.I), 'ml'),
    (re.compile(r'\bl(?:it(?:re|er)?)?s?\b', re.I), 'l'),
    (re.compile(r'\bltrs?\.?\b', re.I), 'l'),
]


def _fmt_num(n):
    r = round(n, 2)
    if abs(r - round(r)) < 1e-9:
        return str(int(round(r)))
    s = f"{r:.2f}".rstrip('0').rstrip('.')
    return s


def _parse_one_number_and_unit(text):
    """Returns (number, unit or None) if text is cleanly ONE number optionally
    followed by a unit word, else None (ambiguous / not safely parseable)."""
    t = text.strip().strip('.').strip()
    unit = None
    for pat, u in UNIT_PATTERNS:
        if pat.search(t):
            unit = u
            t = pat.sub('', t)
            break
    t = t.strip().strip('.').strip()
    if not re.fullmatch(r'\d+\.?\d*', t):
        return None
    return float(t), unit


def compute_pump_dose(formulation_dose):
    """Conservative: only returns a value when the dose is unambiguously a
    single number or a simple 'X-Y' range, with at most one recognizable
    unit. Anything else (combination '+' doses, free text, multiple units)
    is left blank rather than risk a wrong number."""
    if not formulation_dose:
        return ''
    raw = formulation_dose.strip()
    low = raw.lower().strip().strip('.')
    if low in NA_LIKE:
        return ''
    if '+' in raw:
        return ''  # combination dose (two active ingredients) - too ambiguous to auto-split

    # unit (checked on the whole string first, in case it trails the range: "500-1000 gm")
    whole_unit = None
    for pat, u in UNIT_PATTERNS:
        if pat.search(raw):
            whole_unit = u
            break

    parts = re.split(r'\s*-\s*', raw.strip().strip('.'))
    parts = [p for p in parts if p.strip()]

    if len(parts) not in (1, 2):
        return ''

    numbers = []
    units_found = []
    for p in parts:
        res = _parse_one_number_and_unit(p)
        if res is None:
            return ''
        num, u = res
        numbers.append(num)
        units_found.append(u)

    unit = whole_unit or next((u for u in units_found if u), None)

    if unit is None:
        # No unit anywhere. Per user: small bare decimals (e.g. 1.2, 2.5) are
        # understood to be kg; leave larger bare numbers as-is (already in the
        # gm/ml scale the source table implies).
        if all(n < 10 for n in numbers):
            unit = 'kg'
        else:
            unit = None

    if unit == 'kg':
        mult, out_unit = 1000, 'g'
    elif unit == 'l':
        mult, out_unit = 1000, 'ml'
    elif unit == 'g':
        mult, out_unit = 1, 'g'
    elif unit == 'ml':
        mult, out_unit = 1, 'ml'
    else:
        mult, out_unit = 1, ''

    pump_vals = [n * mult / PUMPS_PER_HECTARE for n in numbers]
    formatted = [_fmt_num(v) for v in pump_vals]
    label = f" {out_unit}" if out_unit else ''
    if len(formatted) == 1:
        return f"{formatted[0]}{label}/pump"
    return f"{formatted[0]}-{formatted[1]}{label}/pump"


if __name__ == '__main__':
    tests = ['1000 ml', '500', '500-1000', '2.0 kg', '2.5 kg', '1.2', '2.5', '44', '222-444 ml',
              '1.5 kg.', '30 ltrs.', '-', 'Nil', '400 +80.', '0.75-1.0', '937.5-1125',
              '', '787.5 + 131.25 + 87.5 to 900 + 150+ 100', '20000-24000', '10 ml/kg seed']
    for t in tests:
        print(repr(t), '->', compute_pump_dose(t))
