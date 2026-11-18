import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { LocalizedName } from "@/data/types";

export type Lang = "en" | "gu" | "hi";

type Dict = Record<string, [string, string, string]>;

/** [English, Gujarati, Hindi] */
const STRINGS: Dict = {
  tagline: [
    "Official CIBRC / PPQS approved pesticide uses",
    "સી.આઈ.બી.આર.સી. / પી.પી.ક્યુ.એસ. માન્ય પેસ્ટીસાઇડ ઉપયોગ",
    "सी.आई.बी.आर.सी. / पी.पी.क्यू.एस. स्वीकृत कीटनाशक उपयोग",
  ],
  crops: ["crops", "પાક", "फसलें"],
  technicals: ["technicals", "ટેકનિકલ", "तकनीकी"],
  records: ["recommendations", "ભલામણો", "सिफ़ारिशें"],
  byCrop: ["By Crop", "પાક પ્રમાણે", "फसल अनुसार"],
  byTechnical: ["By Technical", "ટેકનિકલ પ્રમાણે", "तकनीकी अनुसार"],
  byWeed: ["Weeds by Photo", "નીંદણ ફોટા", "खरपतवार फ़ोटो"],
  byLand: ["Land Converter", "જમીન કન્વર્ટર", "भूमि कनवर्टर"],
  byFertilizer: ["Fertilizer Calculator", "ખાતર ગણતરી", "उर्वरक कैलकुलेटर"],
  byPlant: ["Plant Calculator", "છોડ ગણતરી", "पौधा कैलकुलेटर"],
  bySpecial: ["Special Recommendations 🔒", "વિશેષ ભલામણો 🔒", "विशेष सिफ़ारिशें 🔒"],
  specialTag: ["Locked · Pin", "લોક · પિન", "लॉक · पिन"],
  enterPin: ["Enter 4-digit PIN", "4 અંકનો પિન લખો", "4 अंक का पिन लिखें"],
  pinWrong: ["Wrong PIN, try again", "ખોટો પિન, ફરી પ્રયાસ કરો", "गलत पिन, फिर से कोशिश करें"],
  unlock: ["Unlock", "ખોલો", "अनलॉक करें"],
  moaTab: ["MoA Tool", "MoA ટૂલ", "MoA टूल"],
  guideTab: ["Dawa Guide", "દવા ગાઇડ", "दवा गाइड"],
  chooseTool: ["Choose a tool", "સાધન પસંદ કરો", "उपकरण चुनें"],
  backToTools: ["Back to all tools", "બધા સાધનો પર પાછા જાઓ", "सभी उपकरणों पर वापस जाएँ"],
  cropProtection: ["Crop protection", "પાક સંરક્ષણ", "फसल सुरक्षा"],
  chemicalSearch: ["Chemical search", "દવા શોધ", "दवा खोज"],
  weedControl: ["Weed control", "નીંદણ નિયંત્રણ", "खरपतवार नियंत्रण"],
  fieldMeasure: ["Field measure", "જમીન માપ", "भूमि माप"],
  nutrientPlan: ["Nutrient plan", "પોષક યોજના", "पोषक योजना"],
  plantCount: ["Plant count", "છોડની સંખ્યા", "पौधों की संख्या"],
  weedGallery: ["Weed Gallery", "નીંદણ ગેલેરી", "खरपतवार गैलरी"],
  weedLibrary: ["Weed Library", "નીંદણ સંગ્રહ", "खरपतवार संग्रह"],
  fieldGuide: ["Botanical Field Guide", "વનસ્પતિ ક્ષેત્ર માર્ગદર્શિકા", "वनस्पति क्षेत्र मार्गदर्शिका"],
  species: ["species", "પ્રજાતિઓ", "प्रजातियाँ"],
  gujaratiName: ["Gujarati name", "ગુજરાતી નામ", "गुजराती नाम"],
  step: ["Step", "પગલું", "चरण"],
  crop: ["Crop", "પાક", "फसल"],
  category: ["Category", "શ્રેણી", "श्रेणी"],
  target: ["Target pest / disease / weed", "લક્ષ્ય કીટ / રોગ / નીંદણ", "लक्ष्य कीट / रोग / खरपतवार"],
  weeds: ["Weeds", "નીંદણ", "खरपतवार"],
  result: ["Recommended technicals", "ભલામણ કરેલ ટેકનિકલ", "अनुशंसित तकनीकी"],
  change: ["Change", "બદલો", "बदलें"],
  searchCrop: ["Type to search a crop…", "પાક શોધો…", "फसल खोजें…"],
  searchTechnical: [
    "Type a technical name, e.g. Imidacloprid…",
    "ટેકનિકલ નામ લખો, જેમ કે Imidacloprid…",
    "तकनीकी नाम लिखें, जैसे Imidacloprid…",
  ],
  searchWeed: ["Search weed name…", "નીંદણ નામ શોધો…", "खरपतवार नाम खोजें…"],
  searchTarget: ["Search targets…", "લક્ષ્ય શોધો…", "लक्ष्य खोजें…"],
  selectAll: ["Select all", "બધા પસંદ કરો", "सभी चुनें"],
  allSelected: ["All selected", "બધા પસંદ", "सभी चयनित"],
  clear: ["Clear", "સાફ કરો", "साफ़ करें"],
  startOver: ["Start over", "ફરી શરૂ કરો", "फिर से शुरू करें"],
  showMore: ["Show more", "વધુ બતાવો", "और दिखाएँ"],
  perPump: ["Per 15 L pump", "15 લિટર પંપ દીઠ", "15 लीटर पंप हेतु"],
  formulation: ["Formulation / ha", "ફોર્મ્યુલેશન / હે.", "फ़ॉर्मुलेशन / हे."],
  ai: ["a.i. / ha", "સક્રિય તત્વ / હે.", "सक्रिय तत्व / हे."],
  water: ["Water / ha (L)", "પાણી / હે. (લિ)", "पानी / हे. (ली)"],
  waiting: ["Waiting period", "પ્રતીક્ષા સમય", "प्रतीक्षा अवधि"],
  days: ["days", "દિવસ", "दिन"],
  timing: ["Timing", "સમય", "समय"],
  alsoControls: ["also controls", "આ પણ કાબૂમાં", "यह भी नियंत्रित"],
  noMatches: ["No matches", "કોઈ પરિણામ નથી", "कोई परिणाम नहीं"],
  nothingYet: [
    "Pick targets above to see matching technicals.",
    "ઉપર લક્ષ્ય પસંદ કરો, પછી ટેકનિકલ દેખાશે.",
    "ऊपर लक्ष्य चुनें, फिर तकनीकी दिखेंगे.",
  ],
  noWeedsForCrop: [
    "No weed photos are linked to this crop yet — use the By Crop tab and pick the Herbicide category.",
    "આ પાક માટે નીંદણ ફોટા ઉપલબ્ધ નથી — 'પાક પ્રમાણે' માં નીંદણનાશક શ્રેણી પસંદ કરો.",
    "इस फसल के लिए खरपतवार फ़ोटो नहीं हैं — 'फसल अनुसार' में खरपतवारनाशी श्रेणी चुनें.",
  ],
  controls: ["Controls", "કાબૂમાં લે", "नियंत्रित करता है"],
  tapZoom: ["Tap photo to zoom", "ઝૂમ માટે ફોટા પર ટેપ કરો", "ज़ूम के लिए फ़ोटो पर टैप करें"],
  close: ["Close", "બંધ કરો", "बंद करें"],
  showPhoto: ["Show photo", "ફોટો બતાવો", "फ़ोटो दिखाएँ"],
  hidePhoto: ["Hide photo", "ફોટો છુપાવો", "फ़ोटो छिपाएँ"],
  loading: ["Loading…", "લોડ થાય છે…", "लोड हो रहा है…"],
  matched: ["matched", "મેળ", "मिलान"],
  found: ["technicals found", "ટેકનિકલ મળ્યા", "तकनीकी मिले"],
  selectedCount: ["selected", "પસંદ", "चयनित"],
};

const IDX: Record<Lang, 0 | 1 | 2> = { en: 0, gu: 1, hi: 2 };

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof STRINGS | string) => string;
  /** picks the right half of a [English, Gujarati] data pair */
  name: (pair: LocalizedName) => string;
  /** "English | ગુજરાતી" for search results and headings */
  both: (pair: LocalizedName) => string;
}

const LangContext = createContext<Ctx | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem("ppqs-lang");
    if (saved === "en" || saved === "gu" || saved === "hi") setLangState(saved);
  }, []);

  const value = useMemo<Ctx>(() => {
    const i = IDX[lang];
    return {
      lang,
      setLang: (l) => {
        setLangState(l);
        try {
          window.localStorage.setItem("ppqs-lang", l);
        } catch {
          /* private mode */
        }
      },
      t: (key) => {
        const row = STRINGS[key as string];
        return row ? row[i] : String(key);
      },
      name: (pair) => (lang === "en" ? pair[0] : pair[1] || pair[0]),
      both: (pair) => (pair[1] ? `${pair[0]}  |  ${pair[1]}` : pair[0]),
    };
  }, [lang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): Ctx {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LangProvider");
  return ctx;
}

export const LANGS: { key: Lang; label: string }[] = [
  { key: "en", label: "EN" },
  { key: "gu", label: "ગુજ" },
  { key: "hi", label: "हिं" },
];
