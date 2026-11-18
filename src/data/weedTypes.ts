export interface Weed {
  id: string;
  /** English common name */
  en: string;
  /** scientific name */
  sci: string;
  /** Gujarati name */
  gu: string;
  /** public path of the extracted plate photo */
  img: string;
  /** source page in the weed control book */
  page: number;
}

/** weed id -> [groupIndex, pestIndex] references into webapp-data groups */
export type WeedLinks = Record<string, [number, number][]>;
