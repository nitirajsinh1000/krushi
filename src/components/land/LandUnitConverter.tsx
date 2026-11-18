import { useEffect, useMemo, useRef, useState } from "react";
import { useLang } from "@/lib/i18n";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, X } from "lucide-react";

const UNITS = [
  { id:'sqft', en:'Square Foot', gu:'ચોરસ ફૂટ', short:'sq ft', icon:'📏', factor:1, color:'sky',
    alt:['sqft','sq ft','square feet','foot','feet','ફૂટ','ચોરસ ફૂટ','ચો.ફૂટ'] },
  { id:'sqm', en:'Square Meter', gu:'ચોરસ મીટર', short:'sq m', icon:'📐', factor:10.7639, color:'teal',
    alt:['sqm','sq m','square meter','metre','meter','મીટર','ચોરસ મીટર'] },
  { id:'gaj', en:'Gaj (Square Yard)', gu:'ગજ (ચોરસ વાર)', short:'gaj', icon:'🟩', factor:9, color:'violet',
    alt:['gaj','guj','yard','sq yard','વાર','ગજ','ચોરસ વાર'] },
  { id:'guntha', en:'Guntha', gu:'ગુંઠા', short:'guntha', icon:'🟫', factor:1089, color:'amber',
    alt:['guntha','gunta','gutha','ગુંઠા','ગુંઠો'] },
  { id:'vigha16', en:'Vigha (16 Guntha)', gu:'વીઘા (૧૬ ગુંઠા)', short:'vigha', icon:'🌾', factor:17424, color:'green',
    alt:['vigha','vigho','bigha','vig','વીઘા','વિઘા','વીઘો','16','સોળ'] },
  { id:'vigha235', en:'Vigha (23.5 Guntha)', gu:'વીઘા (૨૩.૫ ગુંઠા)', short:'vigha', icon:'🌱', factor:25591.5, color:'lime',
    alt:['vigha','vigho','bigha','vig','વીઘા','વિઘા','વીઘો','23.5','૨૩.૫'] },
  { id:'acre', en:'Acre', gu:'એકર', short:'acre', icon:'🚜', factor:43560, color:'rose',
    alt:['acre','એકર'] },
  { id:'hectare', en:'Hectare', gu:'હેક્ટર', short:'ha', icon:'🗺️', factor:107639.104, color:'indigo',
    alt:['hectare','hectar','ha','હેક્ટર'] }
] as const;

const PALETTE: Record<string, {bg:string;bd:string;fg:string}> = {
  sky:{bg:'#E3F2FD',bd:'#9CCDF5',fg:'#0B3F82'},
  teal:{bg:'#DFF4F1',bd:'#8FD3C9',fg:'#00544A'},
  violet:{bg:'#EDE7F6',bd:'#BFA9E8',fg:'#3F1F91'},
  amber:{bg:'#FFF6DF',bd:'#F5CE63',fg:'#7A5300'},
  green:{bg:'#E3F6E7',bd:'#9ADCA7',fg:'#12571F'},
  lime:{bg:'#EEF8DC',bd:'#BEDD86',fg:'#365A0B'},
  rose:{bg:'#FDE4EC',bd:'#F5A3BC',fg:'#8A0B45'},
  indigo:{bg:'#E7E9FA',bd:'#A8B0E8',fg:'#1B2380'}
};

type UnitId = typeof UNITS[number]['id'];

function convert(value: number, fromId: UnitId, toId: UnitId): string {
  const from = UNITS.find(u => u.id === fromId)!;
  const to = UNITS.find(u => u.id === toId)!;
  const sqft = value * from.factor;
  const result = sqft / to.factor;
  return result.toLocaleString('en-IN', { maximumFractionDigits: 4 });
}

export function LandUnitConverter() {
  const { t, lang } = useLang();
  const [value, setValue] = useState<string>("1");
  const [unit, setUnit] = useState<UnitId>('guntha');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedUnit = UNITS.find(u => u.id === unit)!;
  const numericValue = parseFloat(value.replace(/,/g, ''));
  const safeValue = isNaN(numericValue) ? 0 : numericValue;

  const filteredUnits = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [...UNITS];
    return UNITS.filter(u => {
      const hay = [u.en, u.gu, u.short, ...u.alt].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [search]);

  useEffect(() => {
    if (sheetOpen) {
      setSearch("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [sheetOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSheetOpen(false);
    }
    if (sheetOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheetOpen]);

  return (
    <div className="mx-auto w-full max-w-[540px] px-4 pb-10 pt-2">
      {/* Header */}
      <div className="mb-4 rounded-[24px] border border-line-soft bg-gradient-to-br from-forest-deep via-forest to-forest-deep p-4 text-white shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-3xl" style={{ fontFamily: '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif' }}>🌾</span>
          <div>
            <h2 className="text-[18px] font-extrabold leading-tight">Land Unit Converter</h2>
            <p className="text-[13px] font-medium text-white/85">જમીન માપ કન્વર્ટર</p>
          </div>
        </div>
      </div>

      {/* Input area */}
      <div className="mb-4 rounded-[22px] border border-line-soft bg-white p-4 shadow-sm">
        <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-stone">
          {lang === 'gu' ? 'રકમ' : lang === 'hi' ? 'राशि' : 'Amount'}
        </label>
        <div className="flex items-stretch gap-2">
          <input
            type="number"
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="min-w-0 flex-1 rounded-[16px] border-2 border-line bg-paper p-3 text-right text-[26px] font-bold text-ink outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/30"
            placeholder="1"
          />
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="flex flex-col items-center justify-center rounded-[16px] border-2 border-line bg-white px-3 py-2 text-center outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/30 active:scale-95"
            style={{ minHeight: 44 }}
            aria-label="Select unit"
          >
            <span className="text-xl" style={{ fontFamily: '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif' }}>{selectedUnit.icon}</span>
            <span className="text-[11px] font-bold text-ink">{selectedUnit.en}</span>
            <span className="text-[10px] text-stone">{selectedUnit.gu}</span>
          </button>
        </div>
      </div>

      {/* Results grid */}
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-stone">
        {lang === 'gu' ? 'પરિણામો' : lang === 'hi' ? 'परिणाम' : 'Results'}
      </div>
      <div className="grid grid-cols-2 gap-3 [@media(max-width:360px)]:grid-cols-1">
        {UNITS.map((u) => {
          const pal = PALETTE[u.color] ?? { bg: '#ffffff', bd: '#d9d0c1', fg: '#2a2520' };
          const isSelected = u.id === unit;
          const result = convert(safeValue, unit, u.id);
          return (
            <div
              key={u.id}
              className={`relative flex flex-col rounded-[20px] border-2 p-3 shadow-sm transition ${isSelected ? 'ring-[3px] ring-forest ring-offset-2' : ''}`}
              style={{
                backgroundColor: pal.bg,
                borderColor: pal.bd,
                minHeight: 100,
              }}
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="text-2xl" style={{ fontFamily: '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif' }}>{u.icon}</span>
                {isSelected && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-forest text-white">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                )}
              </div>
              <div className="text-[12px] font-bold leading-tight" style={{ color: pal.fg }}>
                {u.en}
              </div>
              <div className="text-[11px] font-medium leading-tight" style={{ color: pal.fg, opacity: 0.85 }}>
                {u.gu}
              </div>
              <div className="mt-auto pt-2 text-right">
                <span className="text-[20px] font-extrabold leading-none" style={{ color: pal.fg }}>
                  {result}
                </span>
                <span className="ml-1 text-[11px] font-semibold" style={{ color: pal.fg, opacity: 0.9 }}>
                  {u.short}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Unit selector bottom sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          className="h-auto max-h-[90dvh] rounded-t-[28px] border-t-0 p-0"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <SheetHeader className="sticky top-0 z-10 border-b border-line-hair bg-white px-4 pb-3 pt-4 text-left">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-[16px] font-bold text-forest-deep">
                {lang === 'gu' ? 'એકમ પસંદ કરો' : lang === 'hi' ? 'इकाई चुनें' : 'Select unit'}
              </SheetTitle>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-paper text-stone"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2 rounded-xl border-2 border-line bg-white px-3 py-2">
              <Search size={16} className="text-stone" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={lang === 'gu' ? 'શોધો… (દા.ત. વીઘા)' : lang === 'hi' ? 'खोजें…' : 'Search… (e.g. Vigha)'}
                className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")} aria-label="Clear search">
                  <X size={16} className="text-stone" />
                </button>
              )}
            </div>
          </SheetHeader>

          <div
            className="overflow-y-auto px-3 pb-6 pt-2"
            style={{ overscrollBehavior: 'contain', maxHeight: 'calc(90dvh - 110px)' }}
          >
            {filteredUnits.length === 0 && (
              <div className="py-6 text-center text-sm text-stone">
                {t("noMatches")}
              </div>
            )}
            <div className="space-y-2">
              {filteredUnits.map((u) => {
                const isSelected = u.id === unit;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setUnit(u.id);
                      setSheetOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-[18px] border-2 bg-white p-3 text-left transition active:scale-[0.99] ${isSelected ? 'border-forest bg-mint' : 'border-line'}`}
                    style={{ minHeight: 56 }}
                  >
                    <span className="text-2xl" style={{ fontFamily: '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif' }}>{u.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14px] font-bold text-ink">{u.en}</div>
                      <div className="truncate text-[13px] text-clay">{u.gu}</div>
                    </div>
                    {isSelected && (
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-forest text-white">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
