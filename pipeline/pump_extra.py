"""Per-pump dose (15 L pump, 20 pumps/ha = 300 L/ha) for concentration-type doses."""
import re
PUMP_L, PUMPS = 15, 20
SOLID = re.compile(r"\b(WP|WG|WDG|SP|SG|DF|DP|GR|G|WS|DS|SS|D)\b")
N = r"(\d*\.?\d+)"
RNG = N + r"(?:(?:-|to|–)" + N + r")?"
def _f(n): return f"{round(n, 2):g}"
def _out(vals, unit, tech_unit):
    u = unit or tech_unit
    p = "-".join(_f(v) for v in vals)
    h = "-".join(_f(v * PUMPS) for v in vals)
    return f"{p} {u}/pump ({h} {u}/ha)"
def extra_pump(form: str, tech: str = "") -> str:
    tu = "g" if SOLID.search(tech or "") else "ml"
    s = (form or "").lower().replace(" ", "")
    vals = lambda m: [float(x) for x in m.groups()[:2] if x]
    # X ml or g per 100 L water
    m = re.search(RNG + r"(ml|g|gm|gms)?/100(?:l|lit|litre|liter|ltr)", s)
    if m:
        u = "g" if (m.group(3) or "").startswith("g") else ("ml" if m.group(3) else "")
        return _out([v * PUMP_L / 100 for v in vals(m)], u, tu)
    # X ml or g per litre
    m = re.match(RNG + r"(ml|g|gm|gms)?/(?:litre|liter|lit|ltr|l)", s)
    if m:
        u = "g" if (m.group(3) or "").startswith("g") else ("ml" if m.group(3) else "")
        return _out([v * PUMP_L for v in vals(m)], u, tu)
    # ppm = mg per litre
    m = re.search(RNG + r"ppm", s)
    if m:
        mg = [v * PUMP_L for v in vals(m)]
        if max(mg) >= 1000:
            return _out([x / 1000 for x in mg], "g", tu)
        return _out(mg, "mg", tu)
    # percentage spray concentration: x% of 15 L
    m = re.match(RNG + r"%", s)
    if m:
        return _out([v * PUMP_L * 10 for v in vals(m)], "", tu)
    return ""
