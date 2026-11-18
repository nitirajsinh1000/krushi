import { useEffect, useMemo, useState } from "react";
import rawWeeds from "@/data/weeds.json";
import type { Weed } from "@/data/weedTypes";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
import { Camera, Search, XIcon } from "./icons";

const WEEDS = rawWeeds as Weed[];

function GalleryZoom({ weed, onClose }: { weed: Weed; onClose: () => void }) {
  const { t } = useLang();

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={weed.en}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gallery-overlay p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-card shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <img
          src={weed.img}
          alt={`${weed.en} (${weed.sci})`}
          width={707}
          height={577}
          className="max-h-[68vh] w-full bg-gallery-paper object-contain"
        />
        <div className="flex items-start justify-between gap-4 p-5">
          <div className="min-w-0 font-body">
            <p className="text-lg font-semibold text-gallery-leaf">{weed.gu || weed.en}</p>
            <h2 className="font-display text-2xl font-bold text-gallery-ink">{weed.en}</h2>
            <p className="mt-1 text-sm italic text-muted-foreground">{weed.sci}</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            <XIcon size={14} /> {t("close")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function WeedGallery() {
  const { t } = useLang();
  const [query, setQuery] = useState("");
  const [zoomedWeed, setZoomedWeed] = useState<Weed | null>(null);

  const filteredWeeds = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return WEEDS;
    return WEEDS.filter((weed) =>
      `${weed.en} ${weed.sci} ${weed.gu}`.toLocaleLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  return (
    <section className="overflow-hidden rounded-2xl border border-gallery-line bg-card shadow-sm">
      <div className="bg-gallery-forest px-4 py-5 text-gallery-on-dark sm:px-6 sm:py-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-body text-[11px] font-bold uppercase tracking-[0.12em] text-gallery-sage">
              {t("fieldGuide")}
            </p>
            <h2 className="mt-1 font-display text-2xl font-extrabold tracking-normal">
              {t("weedLibrary")}
            </h2>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gallery-sage/40 bg-gallery-leaf/40 text-gallery-on-dark">
            <Camera size={21} />
          </div>
        </div>

        <label className="flex min-h-12 items-center gap-3 rounded-xl border border-gallery-sage/35 bg-gallery-search px-4 focus-within:ring-2 focus-within:ring-gallery-sage">
          <span className="text-gallery-sage"><Search size={19} /></span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("searchWeed")}
            className="min-w-0 flex-1 bg-transparent font-body text-sm text-gallery-on-dark outline-none placeholder:text-gallery-sage/80"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setQuery("")}
              aria-label={t("clear")}
              className="h-8 w-8 text-gallery-on-dark hover:bg-gallery-leaf hover:text-gallery-on-dark"
            >
              <XIcon size={16} />
            </Button>
          )}
        </label>
      </div>

      <div className="bg-gallery-paper p-3 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3 px-1 font-body">
          <p className="text-sm font-semibold text-gallery-ink">{t("weedGallery")}</p>
          <p className="text-xs font-medium text-muted-foreground">
            {filteredWeeds.length} {t("species")}
          </p>
        </div>

        {filteredWeeds.length === 0 ? (
          <div className="rounded-xl border border-gallery-line bg-card px-4 py-10 text-center font-body text-sm text-muted-foreground">
            {t("noMatches")}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filteredWeeds.map((weed) => (
              <article
                key={weed.id}
                className="overflow-hidden rounded-xl border border-gallery-line bg-card shadow-sm transition-colors hover:border-gallery-sage"
              >
                <Button
                  type="button"
                  onClick={() => setZoomedWeed(weed)}
                  variant="ghost"
                  className="group relative block h-auto w-full overflow-hidden rounded-none bg-gallery-paper p-0 text-left hover:bg-gallery-paper"
                  aria-label={`${t("showPhoto")}: ${weed.en}`}
                >
                  <img
                    src={weed.img}
                    alt={`${weed.en} (${weed.sci})`}
                    width={707}
                    height={577}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[6/5] w-full object-cover transition-transform duration-300 group-hover:scale-[1.025] motion-reduce:transition-none"
                  />
                  <span className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-gallery-overlay text-gallery-on-dark shadow-sm">
                    <Camera size={15} />
                  </span>
                </Button>
                <div className="p-4 font-body">
                  <h3 className="font-display text-lg font-bold leading-tight text-gallery-ink">
                    {weed.en}
                  </h3>
                  <p className="mt-1 text-xs italic text-muted-foreground">{weed.sci}</p>
                  <div className="mt-3 border-t border-gallery-line pt-3">
                    <p className="font-semibold text-gallery-leaf">{weed.gu || weed.en}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{t("gujaratiName")}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {zoomedWeed && <GalleryZoom weed={zoomedWeed} onClose={() => setZoomedWeed(null)} />}
    </section>
  );
}