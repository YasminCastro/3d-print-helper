const CATEGORY_COLOR_PALETTE = [
  "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400",
  "bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-400",
  "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400",
  "bg-lime-100 text-lime-800 dark:bg-lime-950/40 dark:text-lime-400",
  "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400",
  "bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-400",
  "bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-400",
  "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400",
  "bg-violet-100 text-violet-800 dark:bg-violet-950/40 dark:text-violet-400",
  "bg-pink-100 text-pink-800 dark:bg-pink-950/40 dark:text-pink-400",
];

const CATEGORY_DOT_PALETTE = [
  "bg-red-600 dark:bg-red-400",
  "bg-orange-600 dark:bg-orange-400",
  "bg-amber-600 dark:bg-amber-400",
  "bg-lime-600 dark:bg-lime-400",
  "bg-emerald-600 dark:bg-emerald-400",
  "bg-teal-600 dark:bg-teal-400",
  "bg-sky-600 dark:bg-sky-400",
  "bg-indigo-600 dark:bg-indigo-400",
  "bg-violet-600 dark:bg-violet-400",
  "bg-pink-600 dark:bg-pink-400",
];

function categoryColorIndex(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % CATEGORY_COLOR_PALETTE.length;
}

export function categoryColorClass(name: string) {
  return CATEGORY_COLOR_PALETTE[categoryColorIndex(name)];
}

export function categoryDotColorClass(name: string) {
  return CATEGORY_DOT_PALETTE[categoryColorIndex(name)];
}
