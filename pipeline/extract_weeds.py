"""Extract the weed identification plates (book pages 19-26) into
public/weeds/*.webp plus src/data/weeds.json.

Each plate is a 3x4 grid of photos; captions carry
  line 1  Gujarati name   (legacy GopikaTwoBold font -> decoded below)
  line 2+ English common name (ArialMT)
  line 3+ scientific name     (Arial-ItalicMT)
"""

import json
import os
import re
import subprocess
import sys

import pdfplumber
from PIL import Image

FIX_EN = {"Monochoria viginalis": "Arrow leaf pond weed"}

PDF = "/mnt/user-uploads/Weed_control_book.pdf"
PAGES = range(19, 27)  # 1-based
DPI = 400
OUT_IMG = "public/weeds"
OUT_JSON = "src/data/weeds.json"

# legacy glyph -> Gujarati
CONS = {
    "f": "ક", "¾": "ખ", "„": "ગ", "ø": "ગ", "½": "ઘ",
    "[": "ચ", "A": "છ", "s": "જ", "Í": "ઝ",
    "x": "ટ", "X": "ઠ", "z": "ડ", "Z": "ઢ", "ý": "ણ",
    "Œ": "ત", "Ú": "થ", "Ë": "દ", "Ä": "ધ", "™": "ન", "L": "ન",
    "…": "પ", "Ã": "પ", "V": "ફ", "ƒ": "બ", "¼": "ભ", "{": "મ",
    "Þ": "ય", "h": "ર", "÷": "લ", "¤": "ળ", "ð": "વ",
    "þ": "શ", "»": "ષ", "‚": "સ", "n": "હ",
    "y": "અ",
    "ò": "જા", "¥": "ત્ત", "Õ": "લ્લ", "í": "ત્",
    "M": "સ્", "ÿ": "દ્ર", "ç": "બ", "ª": "ીં",
    "S": "જી", "Á": "રૂ", "L": "ં", "Õ": "લ્",
}
MATRA = {"k": "ા", "e": "ી", "w": "ુ", "q": "ૂ", "u": "ે", "t": "ં", "o": "ર્"}
# two-glyph base consonants (must be collapsed before decoding)
DIGRAPH = {"Lk": "™", "Mk": "‚", "Ãk": "…", "øk": "„", "çk": "ƒ", "»k": "»", "Úk": "Ú", "¥k": "¥"}


def decode(word: str) -> str:
    for k, v in DIGRAPH.items():
        word = word.replace(k, v)
    out: list[str] = []
    pending_i = False
    for ch in word:
        if ch == "r":
            pending_i = True
            continue
        if ch in CONS:
            out.append(CONS[ch])
            if pending_i:
                out.append("િ")
                pending_i = False
            continue
        if ch in MATRA:
            m = MATRA[ch]
            if m == "ર્":  # reph belongs before the preceding consonant cluster
                j = len(out) - 1
                while j > 0 and out[j] in ("ા", "ી", "ુ", "ૂ", "ે", "ો", "ં"):
                    j -= 1
                out.insert(max(0, j), m)
                continue
            # ો / ૌ are drawn as ા + ે
            if m == "ે" and out and out[-1].endswith("ા"):
                out[-1] = out[-1][:-1] + "ો"
                continue
            out.append(m)
            continue
        if ch == "i":
            if out and out[-1] == "ા":
                out[-1] = "ૌ"
            else:
                out.append("ૈ")
            continue
        if ch == " ":
            out.append(" ")
            continue
        if ch in "-/":
            out.append(" / " if ch == "/" else "-")
            continue
        out.append("\u25a1")  # unknown glyph marker
    txt = "".join(out)
    for a, b in (("અા", "આ"), ("અો", "ઓ"), ("અૌ", "ઔ"), ("અે", "એ"),
                 ("અૈ", "ઐ"), ("અુ", "ઉ"), ("અૂ", "ઊ"), ("અી", "ઈ")):
        txt = txt.replace(a, b)
    return re.sub(r"\s+", " ", txt).strip()


def slug(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def main() -> None:
    os.makedirs(OUT_IMG, exist_ok=True)
    weeds = []
    pdf = pdfplumber.open(PDF)
    for pno in PAGES:
        page = pdf.pages[pno - 1]
        cells = [im for im in page.images if im["x0"] > 0 and (im["x1"] - im["x0"]) < 200]
        cells.sort(key=lambda im: (round(im["top"] / 20), im["x0"]))
        png = f"/tmp/weedpage-{pno}.png"
        subprocess.run(
            ["pdftoppm", "-f", str(pno), "-l", str(pno), "-r", str(DPI), "-png",
             "-singlefile", PDF, png[:-4]],
            check=True,
        )
        sheet = Image.open(png)
        sx = sheet.width / float(page.width)
        sy = sheet.height / float(page.height)
        words = page.extract_words(extra_attrs=["fontname"])
        for im in cells:
            band = [w for w in words if im["bottom"] + 1 < w["top"] < im["bottom"] + 40
                    and im["x0"] - 40 < (w["x0"] + w["x1"]) / 2 < im["x1"] + 40]
            guj, common, sci = [], [], []
            for w in sorted(band, key=lambda w: (round(w["top"]), w["x0"])):
                if "Gopika" in w["fontname"]:
                    guj.append(w["text"])
                elif "Italic" in w["fontname"]:
                    sci.append(w["text"])
                else:
                    common.append(w["text"])
            common_name = " ".join(common).strip()
            if common_name == "Gisekia":
                common_name, sci = "Gisekia", ["Gisekia", "pharnaceoides"]
            common_name = FIX_EN.get(sci_name := " ".join(sci).strip(), common_name)
            if not common_name or not sci_name:
                print("!! missing caption on page", pno, im["name"], common_name, sci_name)
                continue
            gname = decode(" ".join(guj))
            key = slug(sci_name)
            box = (
                int(im["x0"] * sx), int(im["top"] * sy),
                int(im["x1"] * sx), int(im["bottom"] * sy),
            )
            sheet.crop(box).convert("RGB").save(
                f"{OUT_IMG}/{key}.webp", "WEBP", quality=86, method=5
            )
            weeds.append({
                "id": key,
                "en": common_name,
                "sci": sci_name,
                "gu": gname,
                "img": f"/weeds/{key}.webp",
                "page": pno,
            })
    with open(OUT_JSON, "w", encoding="utf-8") as fh:
        json.dump(weeds, fh, ensure_ascii=False, indent=1)
    print(len(weeds), "weeds")
    bad = [w for w in weeds if "\u25a1" in w["gu"] or not w["gu"]]
    for w in bad:
        print("check:", w["en"], "|", w["sci"], "|", w["gu"])
    sys.stdout.flush()


if __name__ == "__main__":
    main()
