import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import khetiLogo from "@/assets/kheti-farm-logo.png";
import rawData from "@/data/webapp-data.json";
import rawWeeds from "@/data/weeds.json";
import rawLinks from "@/data/weed-links.json";
import type { LocalizedName, WebappData } from "@/data/types";
import type { Weed, WeedLinks } from "@/data/weedTypes";
import { LandUnitConverter } from "@/components/land/LandUnitConverter";
import FertilizerCalculator from "@/components/FertilizerCalculator.jsx";
import { LANGS, LangProvider, useLang } from "@/lib/i18n";
import { catStyle } from "./catStyles";
import {
  CheckIcon,
  CropRows,
  FertilizerBag,
  Flask,
  MoaCodes,
  PlantSpacing,
  RotateCcw,
  Ruler,
  Search,
  WeedLeaf,
  XIcon,
  YouTube,
} from "./icons";
import { CropPicker } from "./CropPicker";
import { SearchableCombo, type ComboOption } from "./SearchableCombo";
import { TechnicalCard, normTarget } from "./TechnicalCard";
import { WeedGrid } from "./WeedPicker";

const DATA = rawData as WebappData;
const WEEDS = rawWeeds as Weed[];
const LINKS = rawLinks as unknown as WeedLinks;
const HERBICIDE_CAT = DATA.cats.findIndex((c) => c[0] === "Herbicide");

const PAGE = 12;
const EMPTY: LocalizedName = ["", ""];
const cropAt = (i: number): LocalizedName => DATA.crops[i] ?? EMPTY;
const catAt = (i: number): LocalizedName => DATA.cats[i] ?? EMPTY;

type Mode = "crop" | "technical" | "weed" | "land" | "fert" | "plant" | "special";

export function PesticideSelector() {
  return (
    <LangProvider>
      <Finder />
    </LangProvider>
  );
}

function StepBar({ label, value, onChange }: { label: string; value: string; onChange: () => void }) {
  const { t } = useLang();
  return (
    <button
      type="button"
      onClick={onChange}
      className="mb-2 flex w-full items-center justify-between gap-2 rounded-xl border border-line-soft bg-white px-3 py-2 text-left shadow-sm"
    >
      <span className="min-w-0">
        <span className="block text-[10px] font-semibold uppercase tracking-wide text-stone">
          {label}
        </span>
        <span className="block truncate text-[14px] font-semibold text-forest-deep">
          {value}
        </span>
      </span>
      <span className="flex-shrink-0 rounded-full bg-mint px-2.5 py-1 text-[11px] font-semibold text-forest">
        {t("change")}
      </span>
    </button>
  );
}

function Panel({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 rounded-2xl border border-line-soft bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest text-[12px] font-bold text-white">
          {step}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide text-stone">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

function Finder() {
  const { t, lang, setLang, name, both } = useLang();
  const [mode, setMode] = useState<Mode | null>(null);

  // ---- section 1: crop -> category -> targets -> technicals
  const [cropIdx, setCropIdx] = useState<number | null>(null);
  const [catIdx, setCatIdx] = useState<number | null>(null);
  const [selectedPests, setSelectedPests] = useState<string[]>([]);
  const [allMode, setAllMode] = useState(false);
  const [pestsDone, setPestsDone] = useState(false);
  const [pestQuery, setPestQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE);

  // ---- section 2: technical name
  const [selectedTechnical, setSelectedTechnical] = useState<string | null>(null);
  const [techVisible, setTechVisible] = useState(PAGE);

  // ---- section 3: weeds by photo
  const [weedCrop, setWeedCrop] = useState<number | null>(null);
  const [selectedWeeds, setSelectedWeeds] = useState<string[]>([]);
  const [weedsDone, setWeedsDone] = useState(false);

  const cropOptions = useMemo<ComboOption[]>(
    () =>
      DATA.crops.map((c, i) => ({
        key: i,
        label: both(c),
        search: (c[0] + " " + (c[1] || "")).toLowerCase(),
      })),
    [both],
  );

  const technicalOptions = useMemo<ComboOption[]>(() => {
    const set = new Set<string>();
    for (const g of DATA.groups) set.add(g[2]);
    return [...set]
      .sort((a, b) => a.localeCompare(b))
      .map((n) => ({ key: n, label: n, search: n.toLowerCase() }));
  }, []);

  const recordCount = useMemo(
    () => DATA.groups.reduce((n, g) => n + g[3].length, 0),
    [],
  );

  const catCounts = useMemo(() => {
    const m = new Map<number, number>();
    if (cropIdx === null) return m;
    for (const g of DATA.groups) {
      if (g[1] === cropIdx) m.set(g[0], (m.get(g[0]) ?? 0) + 1);
    }
    return m;
  }, [cropIdx]);

  /** unique targets for the chosen crop + category, deduped by case/plural */
  const availablePests = useMemo(() => {
    if (cropIdx === null || catIdx === null) return [];
    const best = new Map<string, string>();
    for (const g of DATA.groups) {
      if (g[0] !== catIdx || g[1] !== cropIdx) continue;
      for (const p of g[3]) {
        const k = normTarget(p[0]);
        if (!k) continue;
        const cur = best.get(k);
        if (!cur || p[0].length > cur.length) best.set(k, p[0]);
      }
    }
    return [...best.values()].sort((a, b) => a.localeCompare(b));
  }, [cropIdx, catIdx]);

  const filteredPests = useMemo(() => {
    const q = pestQuery.trim().toLowerCase();
    if (!q) return availablePests;
    return availablePests.filter((p) => p.toLowerCase().includes(q));
  }, [availablePests, pestQuery]);

  const selectedKeys = useMemo(
    () => new Set(selectedPests.map(normTarget)),
    [selectedPests],
  );

  const cropResults = useMemo(() => {
    if (cropIdx === null || catIdx === null) return [];
    if (!allMode && selectedPests.length === 0) return [];
    return DATA.groups.filter((g) => {
      if (g[0] !== catIdx || g[1] !== cropIdx) return false;
      if (allMode) return true;
      return g[3].some((p) => selectedKeys.has(normTarget(p[0])));
    });
  }, [cropIdx, catIdx, allMode, selectedPests.length, selectedKeys]);

  const technicalResults = useMemo(() => {
    if (!selectedTechnical) return [];
    return DATA.groups
      .filter((g) => g[2] === selectedTechnical)
      .sort((a, b) => cropAt(a[1])[0].localeCompare(cropAt(b[1])[0]));
  }, [selectedTechnical]);

  /** weeds that appear on herbicide labels for the chosen crop */
  const weedsForCrop = useMemo(() => {
    if (weedCrop === null) return [];
    return WEEDS.filter((w) =>
      (LINKS[w.id] ?? []).some(([gi]) => DATA.groups[gi]?.[1] === weedCrop),
    );
  }, [weedCrop]);

  const weedTargetKeys = useMemo(() => {
    const set = new Set<string>();
    for (const id of selectedWeeds) {
      for (const [gi, pi] of LINKS[id] ?? []) {
        const g = DATA.groups[gi];
        if (!g || g[1] !== weedCrop) continue;
        const p = g[3][pi];
        if (p) set.add(normTarget(p[0]));
      }
    }
    return set;
  }, [selectedWeeds, weedCrop]);

  const weedResults = useMemo(() => {
    if (weedCrop === null || weedTargetKeys.size === 0) return [];
    return DATA.groups.filter(
      (g) =>
        g[0] === HERBICIDE_CAT &&
        g[1] === weedCrop &&
        g[3].some((p) => weedTargetKeys.has(normTarget(p[0]))),
    );
  }, [weedCrop, weedTargetKeys]);

  function togglePest(p: string) {
    setAllMode(false);
    setSelectedPests((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  }

  function resetCropFlow() {
    setCropIdx(null);
    setCatIdx(null);
    setSelectedPests([]);
    setAllMode(false);
    setPestsDone(false);
    setPestQuery("");
    setVisibleCount(PAGE);
  }

  const cropChosen = cropIdx !== null;
  const catChosen = cropChosen && catIdx !== null;
  const targetsChosen = catChosen && pestsDone && (allMode || selectedPests.length > 0);

  return (
    <div className="min-h-screen bg-paper">
      {/* header */}
      <header className="rounded-b-[2rem] bg-gradient-to-br from-forest-deep via-forest to-forest-deep px-4 pb-10 pt-6 text-white shadow-lg">
        <div className="mx-auto grid max-w-2xl grid-cols-[minmax(0,1fr)_auto] items-start gap-2 sm:flex sm:justify-between sm:gap-3">
          <div className="min-w-0">
            <h1 className="kheti-logo w-36 max-w-full sm:w-48">
              <img src={khetiLogo} alt="Kheti" width={1152} height={576} className="block h-auto w-full" />
            </h1>
            <p className="mt-1 text-[12px] leading-snug text-white/85">
              {t("tagline")}
            </p>
            <p className="mt-1 text-[11px] text-white/70">
              {DATA.crops.length} {t("crops")} · {technicalOptions.length}{" "}
              {t("technicals")} · {recordCount} {t("records")} · {WEEDS.length}{" "}
              {t("weeds")}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <div className="flex gap-0.5 rounded-full bg-white/15 p-1 sm:gap-1">
              {LANGS.map((l) => (
                <button
                  key={l.key}
                  type="button"
                  onClick={() => setLang(l.key)}
                  className={`rounded-full px-2 py-1 text-[11px] font-bold sm:px-2.5 sm:text-[12px] ${
                    lang === l.key ? "bg-white text-forest-deep" : "text-white/85"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <a
              href="https://youtube.com/@krishibrothers?si=4kM8cCM0MhhPEe3l"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube channel"
              className="flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[11px] font-bold text-forest-deep shadow-sm transition-transform hover:scale-105"
            >
              <YouTube size={14} />
              <span>YouTube</span>
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 pb-24">
        {/* farmer-friendly tool grid */}
        {mode === null && <nav aria-label={t("chooseTool")} className="relative -mt-6 mb-4 rounded-3xl bg-white/90 p-3 shadow-xl ring-1 ring-line-soft backdrop-blur">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-1.5 w-6 rounded-full bg-highlight-strong" />
            <h2 className="font-display text-sm font-bold text-forest-deep">{t("chooseTool")}</h2>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {(
              [
                ["crop", CropRows, t("cropProtection"), t("byCrop")],
                ["technical", Flask, t("chemicalSearch"), t("byTechnical")],
                ["weed", WeedLeaf, t("weedControl"), t("byWeed")],
                ["land", Ruler, t("fieldMeasure"), t("byLand")],
                ["fert", FertilizerBag, t("nutrientPlan"), t("byFertilizer")],
                ["plant", PlantSpacing, t("plantCount"), t("byPlant")],
                ["special", MoaCodes, t("specialTag"), t("bySpecial")],
              ] as [Mode, typeof CropRows, string, string][]
             ).map(([key, Icon, eyebrow, label]) => (
                 <Button
                   variant="tool"
                   size="tool"
                  key={key}
                  type="button"
                  onClick={() => setMode(key)}
                   className="group flex flex-col items-start justify-between rounded-2xl text-left"
                >
                   <span className="kheti-tool-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-mint text-forest sm:h-14 sm:w-14">
                    <Icon size={27} />
                  </span>
                  <span className="mt-3 min-w-0">
                    <span className="block text-[10px] font-bold uppercase text-stone">
                      {eyebrow}
                    </span>
                    <span className="mt-0.5 block font-display text-[15px] font-bold leading-tight">
                      {label}
                    </span>
                  </span>
                 </Button>
              ))}
          </div>
          <Button variant="outline" asChild className="mt-4 w-full">
            <Link to="/farmer-registration">🌾 Farmer Registration · Submit again</Link>
          </Button>
        </nav>}

        {mode !== null && (
          <div className="py-3">
            <button
              type="button"
              onClick={() => setMode(null)}
              className="flex min-h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 py-2 text-sm font-bold text-forest-deep shadow-sm transition active:scale-[0.98]"
            >
              <span aria-hidden="true" className="text-xl leading-none">←</span>
              {t("backToTools")}
            </button>
          </div>
        )}

        {/* ---------------- section 1 ---------------- */}
        {mode === "crop" && (
          <>
            {cropChosen ? (
              <StepBar
                label={t("crop")}
                value={both(cropAt(cropIdx))}
                onChange={resetCropFlow}
              />
            ) : (
              <Panel step={1} title={t("crop")}>
                <CropPicker
                  placeholder={t("searchCrop")}
                  options={cropOptions}
                  onSelect={(k) => {
                    setCropIdx(Number(k));
                    setCatIdx(null);
                    setSelectedPests([]);
                    setAllMode(false);
                    setPestsDone(false);
                  }}
                />
              </Panel>
            )}

            {cropChosen && catChosen && (
              <StepBar
                label={t("category")}
                value={both(catAt(catIdx))}
                onChange={() => {
                  setCatIdx(null);
                  setSelectedPests([]);
                  setAllMode(false);
                  setPestsDone(false);
                }}
              />
            )}

            {cropChosen && !catChosen && (
              <Panel step={2} title={t("category")}>
                <div className="flex flex-wrap gap-2">
                  {DATA.cats.map((c, i) => {
                    const style = catStyle(i);
                    const count = catCounts.get(i) ?? 0;
                    return (
                      <button
                        type="button"
                        key={i}
                        disabled={count === 0}
                        onClick={() => {
                          setCatIdx(i);
                          setSelectedPests([]);
                          setAllMode(false);
                          setPestsDone(false);
                          setPestQuery("");
                          setVisibleCount(PAGE);
                        }}
                        className={`flex items-center gap-1.5 rounded-full border-2 px-3 py-2 text-sm font-medium ${
                          count === 0 ? "opacity-35" : ""
                        }`}
                        style={{
                          backgroundColor: style.bg,
                          color: style.text,
                          borderColor: style.dot,
                        }}
                      >
                        {name(c)}
                        <span className="text-xs opacity-70">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </Panel>
            )}

            {targetsChosen && (
              <StepBar
                label={t("target")}
                value={
                  allMode
                    ? `${t("allSelected")} (${availablePests.length})`
                    : selectedPests.join(", ")
                }
                onChange={() => setPestsDone(false)}
              />
            )}

            {catChosen && !pestsDone && (
              <Panel step={3} title={t("target")}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-xs text-stone">
                    {allMode ? availablePests.length : selectedPests.length} /{" "}
                    {availablePests.length} {t("selectedCount")}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAllMode(!allMode);
                      setSelectedPests([]);
                    }}
                    className={`rounded-full border-2 border-forest px-2.5 py-1 text-xs font-semibold ${
                      allMode ? "bg-forest text-white" : "bg-white text-forest"
                    }`}
                  >
                    {allMode ? `✓ ${t("allSelected")}` : t("selectAll")}
                  </button>
                </div>

                {!allMode && (
                  <>
                    {selectedPests.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-1.5">
                        {selectedPests.map((p) => (
                          <span
                            key={p}
                            className="flex items-center gap-1 rounded-full bg-mint py-1 pl-2.5 pr-1.5 text-xs font-medium text-forest"
                          >
                            {p}
                            <button
                              type="button"
                              onClick={() => togglePest(p)}
                              className="rounded-full p-0.5"
                              aria-label={`Remove ${p}`}
                            >
                              <XIcon size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mb-2 flex items-center gap-2 rounded-xl border-2 border-line bg-white px-3 py-2">
                      <span className="text-stone">
                        <Search size={15} />
                      </span>
                      <input
                        className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none"
                        placeholder={t("searchTarget")}
                        value={pestQuery}
                        onChange={(e) => setPestQuery(e.target.value)}
                      />
                      {pestQuery && (
                        <button
                          type="button"
                          onClick={() => setPestQuery("")}
                          className="text-stone"
                          aria-label="Clear"
                        >
                          <XIcon size={15} />
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto rounded-xl border border-line-soft">
                      {filteredPests.length === 0 && (
                        <div className="px-3 py-3 text-center text-sm text-stone">
                          {t("noMatches")}
                        </div>
                      )}
                      {filteredPests.map((p) => {
                        const checked = selectedPests.includes(p);
                        return (
                          <button
                            type="button"
                            key={p}
                            onClick={() => togglePest(p)}
                            className={`flex w-full items-center gap-2.5 border-b border-line-hair px-3 py-2.5 text-left text-[15px] last:border-b-0 ${
                              checked ? "bg-highlight" : "bg-transparent"
                            }`}
                          >
                            <span
                              className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 ${
                                checked
                                  ? "border-forest bg-forest text-white"
                                  : "border-line bg-white"
                              }`}
                            >
                              {checked && <CheckIcon size={14} />}
                            </span>
                            <span className="text-ink">{p}</span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                <button
                  type="button"
                  disabled={!allMode && selectedPests.length === 0}
                  onClick={() => {
                    setPestsDone(true);
                    setVisibleCount(PAGE);
                  }}
                  className="mt-3 w-full rounded-xl bg-forest py-3 text-sm font-bold text-white disabled:opacity-40"
                >
                  {t("result")} →
                </button>
              </Panel>
            )}

            {targetsChosen && (
              <>
                <div className="mb-3 rounded-xl bg-note px-4 py-3 text-sm font-medium text-note-ink">
                  {cropResults.length} {t("found")}
                </div>
                <div className="space-y-3">
                  {cropResults.slice(0, visibleCount).map((g, gi) => (
                    <TechnicalCard
                      key={gi}
                      technical={g[2]}
                      catIdx={g[0]}
                      subtitle={`${both(catAt(g[0]))} · ${both(cropAt(g[1]))}`}
                      pests={g[3]}
                      cropName={cropAt(g[1])[0]}
                      isMatch={(x) => (allMode ? false : selectedKeys.has(normTarget(x)))}
                    />
                  ))}
                </div>
                {visibleCount < cropResults.length && (
                  <button
                    type="button"
                    onClick={() => setVisibleCount((v) => v + PAGE)}
                    className="mt-3 w-full rounded-xl border-2 border-forest py-3 text-sm font-semibold text-forest"
                  >
                    {t("showMore")} ({cropResults.length - visibleCount})
                  </button>
                )}
                <button
                  type="button"
                  onClick={resetCropFlow}
                  className="mx-auto mt-4 flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium text-stone"
                >
                  <RotateCcw size={12} /> {t("startOver")}
                </button>
              </>
            )}
          </>
        )}

        {/* ---------------- section 2 ---------------- */}
        {mode === "technical" && (
          <>
            <Panel step={1} title={t("byTechnical")}>
              <SearchableCombo
                placeholder={t("searchTechnical")}
                options={technicalOptions}
                valueLabel={selectedTechnical || ""}
                onSelect={(k) => {
                  setSelectedTechnical(String(k));
                  setTechVisible(PAGE);
                }}
              />
            </Panel>

            {selectedTechnical && (
              <>
                <div className="mb-3 rounded-xl bg-note px-4 py-3 text-sm font-medium text-note-ink">
                  <span className="font-semibold">{selectedTechnical}</span> ·{" "}
                  {technicalResults.length} {t("crops")}
                </div>
                <div className="space-y-3">
                  {technicalResults.slice(0, techVisible).map((g, gi) => (
                    <TechnicalCard
                      key={gi}
                      technical={both(cropAt(g[1]))}
                      catIdx={g[0]}
                      subtitle={`${g[2]} · ${both(catAt(g[0]))}`}
                      pests={g[3]}
                      cropName={cropAt(g[1])[0]}
                      isMatch={() => false}
                    />
                  ))}
                </div>
                {techVisible < technicalResults.length && (
                  <button
                    type="button"
                    onClick={() => setTechVisible((v) => v + PAGE)}
                    className="mt-3 w-full rounded-xl border-2 border-forest py-3 text-sm font-semibold text-forest"
                  >
                    {t("showMore")} ({technicalResults.length - techVisible})
                  </button>
                )}
              </>
            )}
          </>
        )}

        {/* ---------------- section 3 ---------------- */}
        {mode === "weed" && (
          <>
            {weedCrop !== null ? (
              <StepBar
                label={t("crop")}
                value={both(cropAt(weedCrop))}
                onChange={() => {
                  setWeedCrop(null);
                  setSelectedWeeds([]);
                  setWeedsDone(false);
                }}
              />
            ) : (
              <Panel step={1} title={t("crop")}>
                <CropPicker
                  placeholder={t("searchCrop")}
                  options={cropOptions}
                  onSelect={(k) => {
                    setWeedCrop(Number(k));
                    setSelectedWeeds([]);
                    setWeedsDone(false);
                  }}
                />
              </Panel>
            )}

            {weedCrop !== null && !weedsDone && (
              <Panel step={2} title={t("weeds")}>
                {weedsForCrop.length === 0 ? (
                  <p className="text-sm text-stone">{t("noWeedsForCrop")}</p>
                ) : (
                  <>
                    <WeedGrid
                      weeds={weedsForCrop}
                      selected={selectedWeeds}
                      onToggle={(id) =>
                        setSelectedWeeds((prev) =>
                          prev.includes(id)
                            ? prev.filter((x) => x !== id)
                            : [...prev, id],
                        )
                      }
                      onSelectAll={() => setSelectedWeeds(weedsForCrop.map((w) => w.id))}
                      onClear={() => setSelectedWeeds([])}
                    />
                    <button
                      type="button"
                      disabled={selectedWeeds.length === 0}
                      onClick={() => setWeedsDone(true)}
                      className="mt-3 w-full rounded-xl bg-forest py-3 text-sm font-bold text-white disabled:opacity-40"
                    >
                      {t("result")} →
                    </button>
                  </>
                )}
              </Panel>
            )}

            {weedCrop !== null && weedsDone && (
              <>
                <div className="mb-3 rounded-xl border border-line-soft bg-white p-3 shadow-sm">
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-stone">
                    {t("weeds")} ({selectedWeeds.length})
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {selectedWeeds.map((id) => {
                      const w = WEEDS.find((x) => x.id === id);
                      if (!w) return null;
                      return (
                        <div key={id} className="w-24 flex-shrink-0">
                          <img
                            src={w.img}
                            alt={w.en}
                            width={707}
                            height={577}
                            loading="lazy"
                            decoding="async"
                            className="aspect-[6/5] w-full rounded-lg border border-line-soft object-cover"
                          />
                          <div className="mt-0.5 truncate text-[11px] font-semibold text-forest-deep">
                            {w.gu || w.en}
                          </div>
                          <div className="truncate text-[10px] italic text-stone">
                            {w.sci}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => setWeedsDone(false)}
                    className="mt-2 rounded-full bg-mint px-3 py-1 text-[11px] font-semibold text-forest"
                  >
                    {t("change")}
                  </button>
                </div>

                <div className="mb-3 rounded-xl bg-note px-4 py-3 text-sm font-medium text-note-ink">
                  {weedResults.length} {t("found")}
                </div>
                <div className="space-y-3">
                  {weedResults.map((g, gi) => (
                    <TechnicalCard
                      key={gi}
                      technical={g[2]}
                      catIdx={g[0]}
                      subtitle={`${both(catAt(g[0]))} · ${both(cropAt(g[1]))}`}
                      pests={g[3]}
                      cropName={cropAt(g[1])[0]}
                      isMatch={(x) => weedTargetKeys.has(normTarget(x))}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* ---------------- section 4: land converter ---------------- */}
        {mode === "land" && <LandUnitConverter />}
        {mode === "fert" && <FertilizerCalculator />}
        {mode === "plant" && (
          <iframe
            title="Plant Calculator"
            src="/plant-calculator.html"
            className="h-[calc(100vh-9rem)] min-h-[620px] w-full border-0"
          />
        )}
        {mode === "special" && <SpecialTool />}
      </div>
    </div>
  );
}

const SPECIAL_PIN = "1000";
const SPECIAL_UNLOCK_KEY = "kheti-special-unlocked";

function SpecialTool() {
  const { t } = useLang();
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<"moa" | "guide">("moa");

  useEffect(() => {
    try {
      if (window.localStorage.getItem(SPECIAL_UNLOCK_KEY) === "1") setUnlocked(true);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const tryUnlock = () => {
    if (pin === SPECIAL_PIN) {
      setUnlocked(true);
      try {
        window.localStorage.setItem(SPECIAL_UNLOCK_KEY, "1");
      } catch {
        /* ignore */
      }
    } else {
      setError(true);
      setPin("");
    }
  };

  if (!unlocked) {
    return (
      <div className="mx-auto mt-6 max-w-xs rounded-2xl border border-line-soft bg-white p-6 text-center shadow-sm">
        <div className="text-4xl" aria-hidden="true">🔒</div>
        <h2 className="mt-2 font-display text-lg font-bold text-forest-deep">{t("bySpecial")}</h2>
        <label
          htmlFor="special-pin"
          className="mt-4 block text-xs font-semibold uppercase tracking-wide text-stone"
        >
          {t("enterPin")}
        </label>
        <input
          id="special-pin"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          maxLength={4}
          value={pin}
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, "").slice(0, 4));
            setError(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && pin.length === 4) tryUnlock();
          }}
          className="mt-1 w-full rounded-xl border border-line bg-note px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] text-forest-deep outline-none focus:border-forest"
        />
        {error && <p className="mt-2 text-sm font-semibold text-red-600">{t("pinWrong")}</p>}
        <Button type="button" onClick={tryUnlock} className="mt-4 w-full rounded-xl">
          {t("unlock")}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant={tab === "moa" ? "default" : "outline"}
          onClick={() => setTab("moa")}
          className="rounded-xl"
        >
          {t("moaTab")}
        </Button>
        <Button
          type="button"
          variant={tab === "guide" ? "default" : "outline"}
          onClick={() => setTab("guide")}
          className="rounded-xl"
        >
          {t("guideTab")}
        </Button>
      </div>
      <iframe
        key={tab}
        title={tab === "moa" ? "Pesticide MoA Tool" : "Kheti Dawa Guide"}
        src={tab === "moa" ? "/moa-tool/index.html" : "/moa-tool/farmer/index.html"}
        className="h-[calc(100vh-12rem)] min-h-[620px] w-full border-0"
      />
    </div>
  );
}
