import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Search, XIcon } from "./icons";
import type { ComboOption } from "./SearchableCombo";
import cropPhotos from "@/data/crop-photos.json";

const PHOTOS = cropPhotos as Record<string, string>;

function CropThumb({ name, code }: { name: string; code: string }) {
  const en = name.split(/ • | \| /)[0]?.trim() ?? name;
  const key = Object.keys(PHOTOS).find((k) => k.toLowerCase() === en.toLowerCase());
  const [failed, setFailed] = useState(false);
  if (!key || failed) return <CropGraphic name={name} code={code} />;
  return (
    <img src={PHOTOS[key]} alt="" loading="lazy" onError={() => setFailed(true)} className="size-14 rounded-full border border-line object-cover" />
  );
}

type CropFamily = "fruit" | "grain" | "vegetable" | "pulse" | "flower" | "tree" | "leaf" | "place";

function cropFamily(name: string): CropFamily {
  const n = name.split(" • ")[0]?.toLowerCase() ?? "";
  if (/building|field|non-crop|public health|residential|storage|aquatic/.test(n)) return "place";
  if (/rose|carnation|gerbera|tuberose|floriculture|ornamental|sunflower|safflower|mustard|opium/.test(n)) return "flower";
  if (/rice|wheat|barley|bajra|ragi|sorghum|maize|sesame/.test(n)) return "grain";
  if (/bean|gram|pea|soybean|groundnut|guar|chickpea/.test(n)) return "pulse";
  if (/apple|banana|ber|cashew|cherry|citrus|coconut|grape|guava|lime|mandarin|mango|papaya|peach|pear|pineapple|plum|pomegranate|walnut|watermelon/.test(n)) return "fruit";
  if (/bamboo|jute|mulberry|rubber|sugarcane|teak/.test(n)) return "tree";
  if (/betel|cardamom|castor|coffee|coriander|cumin|mentha|pepper|tea|tobacco/.test(n)) return "leaf";
  return "vegetable";
}

function CropGraphic({ name, code }: { name: string; code: string }) {
  const family = cropFamily(name);
  const paths: Record<CropFamily, ReactNode> = {
    fruit: <><path d="M20 15c-6 0-10 4-10 10 0 8 5 14 10 14s10-6 10-14c0-6-4-10-10-10Z"/><path d="M20 15c0-5 3-8 8-9M21 11c-4 0-7-2-8-5"/></>,
    grain: <><path d="M20 40V8M20 14c-7 0-10 4-10 9 6 0 10-3 10-9Zm0 8c7 0 10 4 10 9-6 0-10-3-10-9Zm0 7c-7 0-10 4-10 9 6 0 10-3 10-9Z"/></>,
    vegetable: <><path d="M12 18h16l-2 18H14l-2-18Z"/><path d="M20 18c-5-2-7-5-7-9 5 0 8 3 7 9Zm0 0c5-2 7-5 7-9-5 0-8 3-7 9Z"/></>,
    pulse: <><path d="M10 11c17 0 24 10 20 25-13 3-23-5-20-25Z"/><path d="M13 15c6 7 10 12 14 17"/><circle cx="16" cy="21" r="2"/><circle cx="22" cy="28" r="2"/></>,
    flower: <><circle cx="20" cy="20" r="4"/><circle cx="20" cy="11" r="5"/><circle cx="29" cy="20" r="5"/><circle cx="20" cy="29" r="5"/><circle cx="11" cy="20" r="5"/><path d="M20 33v7"/></>,
    tree: <><path d="M20 39V22"/><path d="M20 27c-8 0-13-4-13-10 0-5 4-9 9-9 2-4 9-4 11 1 5 1 8 5 7 10-1 6-7 9-14 8Z"/></>,
    leaf: <><path d="M8 34C7 18 15 8 32 7c2 17-8 26-24 27Z"/><path d="M10 32 29 11"/></>,
    place: <><path d="M7 36h26M10 36V19l10-9 10 9v17M16 36V25h8v11"/></>,
  };

  return (
    <span className="relative flex size-12 items-center justify-center rounded-full bg-highlight text-forest" aria-hidden="true">
      <svg viewBox="0 0 40 44" className="size-9 fill-none stroke-current stroke-[2.3]" strokeLinecap="round" strokeLinejoin="round">{paths[family]}</svg>
      <span className="absolute -bottom-1 -right-1 flex min-w-6 items-center justify-center rounded-full border border-line bg-white px-1 text-[8px] font-bold leading-4 text-forest-deep">{code}</span>
    </span>
  );
}

function uniqueCropCodes(options: ComboOption[]) {
  const names = options.map((option) => option.label.split(" • ")[0]?.trim().toUpperCase() ?? option.label.toUpperCase());
  return names.map((name, index) => {
    const compact = name.replace(/[^A-Z0-9]/g, "");
    for (let length = 2; length <= compact.length; length += 1) {
      const candidate = compact.slice(0, length);
      if (names.every((other, otherIndex) => otherIndex === index || !other.replace(/[^A-Z0-9]/g, "").startsWith(candidate))) return candidate;
    }
    return `${compact.slice(0, 3)}${index + 1}`;
  });
}

export function CropPicker({
  options,
  placeholder,
  onSelect,
}: {
  options: ComboOption[];
  placeholder: string;
  onSelect: (key: string | number) => void;
}) {
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searching) inputRef.current?.focus();
  }, [searching]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => o.search.includes(q)) : options;
  }, [options, query]);
  const codes = useMemo(() => uniqueCropCodes(filtered), [filtered]);

  return (
    <div>
      {searching ? (
        <div className="mb-3 flex items-center gap-2 rounded-xl border-2 border-forest bg-white px-3 py-2">
          <Search size={16} />
          <input
            ref={inputRef}
            className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="button"
            aria-label="Close search"
            onClick={() => {
              setQuery("");
              setSearching(false);
            }}
            className="text-stone"
          >
            <XIcon size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setSearching(true)}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-forest bg-white py-2.5 text-sm font-semibold text-forest"
        >
          <Search size={16} /> {placeholder}
        </button>
      )}
      <div className="grid max-h-[60vh] grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
        {filtered.map((o, index) => (
          <button
            type="button"
            key={o.key}
            onClick={() => onSelect(o.key)}
            className="flex flex-col items-center gap-1 rounded-xl border border-line bg-white p-2 text-center hover:border-forest hover:bg-highlight"
          >
            <CropThumb name={o.label} code={codes[index] ?? ""} />
            <span className="text-xs font-medium leading-tight text-ink">{o.label}</span>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 py-3 text-center text-sm text-stone">No matches</div>
        )}
      </div>
    </div>
  );
}
