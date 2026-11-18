import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "./icons";

export interface ComboOption {
  key: string | number;
  label: string;
  search: string;
}

export function SearchableCombo({
  placeholder,
  options,
  valueLabel,
  onSelect,
}: {
  placeholder: string;
  options: ComboOption[];
  valueLabel: string;
  onSelect: (key: string | number) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.search.includes(q));
  }, [options, query]);

  return (
    <div className="relative" ref={ref}>
      <div
        className={`flex cursor-text items-center gap-2 rounded-xl border-2 bg-white px-3 py-2.5 ${
          open ? "border-forest" : "border-line"
        }`}
        onClick={() => setOpen(true)}
      >
        <span className="text-stone">
          <Search size={16} />
        </span>
        <input
          className="flex-1 bg-transparent text-[15px] text-ink outline-none"
          placeholder={valueLabel || placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
        {valueLabel && !open && (
          <span className="flex-shrink-0 rounded-full bg-mint px-2 py-0.5 text-xs text-forest">
            selected
          </span>
        )}
      </div>
      {open && (
        <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-line bg-white shadow-lg">
          {filtered.length === 0 && (
            <div className="px-3 py-3 text-sm text-stone">No matches</div>
          )}
          {filtered.slice(0, 200).map((o) => (
            <button
              type="button"
              key={o.key}
              className="block w-full border-b border-line-hair px-3 py-2.5 text-left text-[15px] text-ink last:border-b-0 hover:bg-highlight"
              onClick={() => {
                onSelect(o.key);
                setQuery("");
                setOpen(false);
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
