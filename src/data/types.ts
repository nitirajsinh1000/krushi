/**
 * Shape of webapp-data.json, generated from the CIBRC / PPQS workbook.
 *
 * cats:   [English, Gujarati][]                 index = category id
 * crops:  [English, Gujarati][]                 index = crop id
 * groups: [catIdx, cropIdx, technicalName, pests[]][]
 * pest:   [target, aiDosePerHa, formulationPerHa, perPumpDose,
 *          waterPerHa, waitingPeriodDays, applicationTiming]
 */
export type LocalizedName = [string, string];

export type PestRow = [string, string, string, string, string, string, string];

export type Group = [number, number, string, PestRow[]];

export interface WebappData {
  cats: LocalizedName[];
  crops: LocalizedName[];
  groups: Group[];
  /** true while the app is running on a placeholder sample dataset */
  sample?: boolean;
}
