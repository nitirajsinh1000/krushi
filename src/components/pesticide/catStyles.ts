/** The six category colour sets, in the same order as data.cats. */
export interface CatStyle {
  bg: string;
  text: string;
  dot: string;
}

export const CAT_STYLE: CatStyle[] = [
  { bg: "#FDEBEA", text: "#B3261E", dot: "#D5453C" },
  { bg: "#F1E9FB", text: "#5B3A93", dot: "#7C4FCC" },
  { bg: "#E7F3E4", text: "#2F6B2A", dot: "#4C9642" },
  { bg: "#E4EEF9", text: "#2957A4", dot: "#3D77D6" },
  { bg: "#DFF3EF", text: "#1F7A6C", dot: "#2E9C89" },
  { bg: "#FCEEDD", text: "#B0611A", dot: "#D98328" },
];

export function catStyle(index: number): CatStyle {
  return CAT_STYLE[index % CAT_STYLE.length] ?? CAT_STYLE[0]!;
}

