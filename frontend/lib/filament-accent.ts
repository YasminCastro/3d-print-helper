import type { CSSProperties } from "react";

function uniqueColors(colors: (string | null | undefined)[]) {
  return Array.from(new Set(colors.filter((color): color is string => !!color)));
}

/** Style for a small icon avatar: translucent tint for one color, a solid gradient for several. */
export function filamentIconStyle(
  colors: (string | null | undefined)[]
): CSSProperties | undefined {
  const list = uniqueColors(colors);
  if (list.length === 0) return undefined;
  if (list.length === 1) {
    return { backgroundColor: `${list[0]}26`, color: list[0] };
  }

  const step = 100 / list.length;
  const stops = list
    .map((color, index) => `${color} ${index * step}%, ${color} ${(index + 1) * step}%`)
    .join(", ");
  return { background: `linear-gradient(135deg, ${stops})`, color: "#fff" };
}

/** Soft translucent background for a header banner, echoing the filament color(s) used. */
export function filamentBannerStyle(
  colors: (string | null | undefined)[]
): CSSProperties | undefined {
  const list = uniqueColors(colors);
  if (list.length === 0) return undefined;
  if (list.length === 1) {
    const color = list[0];
    return {
      background: `linear-gradient(to bottom right, ${color}26, ${color}0d, transparent)`,
    };
  }

  const step = 100 / list.length;
  const stops = list
    .map(
      (color, index) =>
        `${color}33 ${index * step}%, ${color}33 ${(index + 1) * step}%`
    )
    .join(", ");
  return { background: `linear-gradient(135deg, ${stops}, transparent)` };
}
