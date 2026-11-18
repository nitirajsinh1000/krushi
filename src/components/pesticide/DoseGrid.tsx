import type { PestRow } from "@/data/types";
import { useLang } from "@/lib/i18n";

const BLANK = new Set(["", "-", "--", "nil", "na", "n.a.", "n.a"]);

function has(value: string | undefined) {
  return !!value && !BLANK.has(value.trim().toLowerCase());
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-paper px-2.5 py-1.5">
      <div className="text-[10px] uppercase tracking-wide text-stone">{label}</div>
      <div className="text-[13px] font-medium leading-snug text-ink">{value}</div>
    </div>
  );
}

export function DoseGrid({ pest }: { pest: PestRow }) {
  const { t } = useLang();
  const [, ai, form, pump, water, waiting, timing] = pest;
  return (
    <div className="space-y-1.5">
      {has(pump) && (
        <div className="rounded-lg border border-forest/25 bg-mint px-2.5 py-2">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-forest">
            {t("perPump")}
          </div>
          <div className="text-[16px] font-bold leading-snug text-forest-deep">
            {pump}
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-1.5">
        {has(form) && <Cell label={t("formulation")} value={form!} />}
        {has(ai) && <Cell label={t("ai")} value={ai!} />}
        {has(water) && <Cell label={t("water")} value={water!} />}
        {has(waiting) && (
          <Cell label={t("waiting")} value={`${waiting} ${t("days")}`} />
        )}
      </div>
      {has(timing) && (
        <div className="rounded-lg bg-note px-2.5 py-1.5 text-[12px] leading-snug text-note-ink">
          <span className="font-semibold">{t("timing")}: </span>
          {timing}
        </div>
      )}
    </div>
  );
}
