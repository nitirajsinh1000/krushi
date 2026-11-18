import { useMemo } from "react";
import type { PestRow } from "@/data/types";
import { useLang } from "@/lib/i18n";
import { catStyle } from "./catStyles";
import { DoseGrid } from "./DoseGrid";
import { PestPhoto } from "./PestPhoto";

/** Normalises a target name so "Aphid", "aphids" and "APHIDS" collapse to one. */
export function normTarget(name: string) {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\u0A80-\u0AFF ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/s$/, "");
}

interface Bucket {
  row: PestRow;
  targets: string[];
  matched: boolean;
}

/**
 * One card per technical. Every target the technical controls is listed once;
 * targets that share the same dose figures are merged into a single block, so a
 * separate dose block only appears when the dose actually differs.
 */
export function TechnicalCard({
  technical,
  catIdx,
  subtitle,
  pests,
  isMatch,
  cropName,
}: {
  technical: string;
  catIdx: number;
  subtitle?: string;
  pests: PestRow[];
  isMatch: (target: string) => boolean;
  cropName: string;
}) {
  const { t } = useLang();
  const style = catStyle(catIdx);

  const buckets = useMemo<Bucket[]>(() => {
    const map = new Map<string, Bucket>();
    for (const p of pests) {
      const key = p.slice(1).join("|");
      let b = map.get(key);
      if (!b) {
        b = { row: p, targets: [], matched: false };
        map.set(key, b);
      }
      const seen = new Set(b.targets.map(normTarget));
      const n = normTarget(p[0]);
      if (!seen.has(n)) b.targets.push(p[0]);
      else {
        // keep the most descriptive spelling
        const i = b.targets.findIndex((x) => normTarget(x) === n);
        if (i >= 0 && p[0].length > (b.targets[i] as string).length) b.targets[i] = p[0];
      }
      if (isMatch(p[0])) b.matched = true;
    }
    const list = [...map.values()];
    list.sort((a, b) => Number(b.matched) - Number(a.matched));
    return list;
  }, [pests, isMatch]);

  const matchedTargets = buckets.reduce(
    (n, b) => n + b.targets.filter((x) => isMatch(x)).length,
    0,
  );

  return (
    <div
      className="overflow-hidden rounded-2xl border border-line-soft bg-white shadow-sm"
      style={{ borderLeft: `5px solid ${style.dot}` }}
    >
      <div className="border-b border-line-hair bg-paper px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[17px] font-bold leading-tight text-forest-deep">
              {technical}
            </div>
            {subtitle && (
              <div className="mt-0.5 text-[13px] text-clay">{subtitle}</div>
            )}
          </div>
          {matchedTargets > 0 && (
            <span
              className="flex-shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold"
              style={{ backgroundColor: style.bg, color: style.text }}
            >
              {matchedTargets} {t("matched")}
            </span>
          )}
        </div>
      </div>

      <div>
        {buckets.map((b, bi) => (
          <div
            key={bi}
            className={`border-b border-line-hair px-4 py-3 last:border-b-0 ${
              b.matched ? "bg-highlight" : "bg-white"
            }`}
          >
            <div className="mb-1.5 flex flex-wrap gap-1.5">
              {b.targets.map((x) => {
                const hit = isMatch(x);
                return (
                  <span
                    key={x}
                    className={`rounded-full px-2 py-0.5 text-[12px] font-medium ${
                      hit
                        ? "bg-forest text-white"
                        : "border border-line-soft bg-paper text-clay"
                    }`}
                  >
                    {hit ? "✓ " : ""}
                    {x}
                  </span>
                );
              })}
            </div>
            <DoseGrid pest={b.row} />
            <PestPhoto cropName={cropName} pestName={b.targets[0] ?? technical} />
          </div>
        ))}
      </div>
    </div>
  );
}
