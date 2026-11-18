import { useEffect, useMemo, useState } from "react";
import type { Weed } from "@/data/weedTypes";
import { useLang } from "@/lib/i18n";
import { CheckIcon, Search, XIcon } from "./icons";

export function WeedCard({
  weed,
  checked,
  onToggle,
  onZoom,
}: {
  weed: Weed;
  checked: boolean;
  onToggle: () => void;
  onZoom: () => void;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border-2 bg-white transition-colors ${
        checked ? "border-forest" : "border-line-soft"
      }`}
    >
      <button
        type="button"
        onClick={onZoom}
        className="relative block w-full"
        aria-label={`Zoom ${weed.en}`}
      >
        <img
          src={weed.img}
          alt={`${weed.en} (${weed.sci})`}
          width={707}
          height={577}
          loading="lazy"
          decoding="async"
          className="aspect-[6/5] w-full bg-paper object-cover"
        />
        <span className="absolute bottom-1 right-1 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-white">
          ⤢
        </span>
      </button>
      <button
        type="button"
        onClick={onToggle}
        className={`flex w-full items-start gap-2 px-2.5 py-2 text-left ${
          checked ? "bg-mint" : "bg-white"
        }`}
      >
        <span
          className={`mt-0.5 flex h-4.5 w-4.5 flex-shrink-0 items-center justify-center rounded border-2 ${
            checked ? "border-forest bg-forest text-white" : "border-line bg-white"
          }`}
          style={{ height: 18, width: 18 }}
        >
          {checked && <CheckIcon size={12} />}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-semibold text-forest-deep">
            {weed.gu || weed.en}
          </span>
          <span className="block truncate text-[12px] text-clay">{weed.en}</span>
          <span className="block truncate text-[11px] italic text-stone">
            {weed.sci}
          </span>
        </span>
      </button>
    </div>
  );
}

export function WeedZoom({ weed, onClose }: { weed: Weed; onClose: () => void }) {
  const { t } = useLang();
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={weed.img}
          alt={`${weed.en} (${weed.sci})`}
          width={707}
          height={577}
          className="w-full bg-paper object-contain"
        />
        <div className="flex items-start justify-between gap-3 px-4 py-3">
          <div>
            <div className="text-lg font-bold text-forest-deep">
              {weed.gu || weed.en}
            </div>
            <div className="text-sm text-clay">{weed.en}</div>
            <div className="text-sm italic text-stone">{weed.sci}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-clay"
          >
            <XIcon size={13} /> {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
}

export function WeedGrid({
  weeds,
  selected,
  onToggle,
  onSelectAll,
  onClear,
}: {
  weeds: Weed[];
  selected: string[];
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onClear: () => void;
}) {
  const { t } = useLang();
  const [query, setQuery] = useState("");
  const [zoom, setZoom] = useState<Weed | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return weeds;
    return weeds.filter(
      (w) =>
        w.en.toLowerCase().includes(q) ||
        w.sci.toLowerCase().includes(q) ||
        w.gu.includes(query.trim()),
    );
  }, [weeds, query]);

  return (
    <div>
      <div className="mb-2 flex items-center gap-2 rounded-xl border-2 border-line bg-white px-3 py-2">
        <span className="text-stone">
          <Search size={15} />
        </span>
        <input
          className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none"
          placeholder={t("searchWeed")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="text-stone"
            aria-label="Clear"
          >
            <XIcon size={15} />
          </button>
        )}
      </div>

      <div className="mb-2 flex items-center justify-between text-xs text-stone">
        <span>
          {selected.length} / {weeds.length} {t("selectedCount")} · {t("tapZoom")}
        </span>
        <span className="flex gap-2">
          <button
            type="button"
            onClick={onSelectAll}
            className="rounded-full border border-forest px-2.5 py-1 font-semibold text-forest"
          >
            {t("selectAll")}
          </button>
          {selected.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="rounded-full border border-line px-2.5 py-1 font-semibold text-clay"
            >
              {t("clear")}
            </button>
          )}
        </span>
      </div>

      {filtered.length === 0 && (
        <div className="py-6 text-center text-sm text-stone">{t("noMatches")}</div>
      )}

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {filtered.map((w) => (
          <WeedCard
            key={w.id}
            weed={w}
            checked={selected.includes(w.id)}
            onToggle={() => onToggle(w.id)}
            onZoom={() => setZoom(w)}
          />
        ))}
      </div>

      {zoom && <WeedZoom weed={zoom} onClose={() => setZoom(null)} />}
    </div>
  );
}
