import type { CSSProperties } from "react";

function uniqueColors(colors: (string | null | undefined)[]) {
  return Array.from(new Set(colors.filter((color): color is string => !!color)));
}

function hexToRgb(hex: string): [number, number, number] | null {
  const match = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!match) return null;
  return [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)];
}

/** Perceived brightness (0-255) — colors above LIGHT_THRESHOLD (e.g. dental white) blend into light UI chrome. */
function brightness(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 128;
  const [r, g, b] = rgb;
  return (r * 299 + g * 587 + b * 114) / 1000;
}

const LIGHT_THRESHOLD = 210;
const LIGHT_GLYPH_FALLBACK = "#57534e";

function glyphColorFor(colors: string[]): string {
  const avgBrightness = colors.reduce((sum, color) => sum + brightness(color), 0) / colors.length;
  if (avgBrightness > LIGHT_THRESHOLD) return LIGHT_GLYPH_FALLBACK;
  return colors.length === 1 ? colors[0] : "#fff";
}

/** Style for a small icon avatar: translucent tint for one color, a solid gradient for several. */
export function filamentIconStyle(
  colors: (string | null | undefined)[]
): CSSProperties | undefined {
  const list = uniqueColors(colors);
  if (list.length === 0) return undefined;

  const color = glyphColorFor(list);
  const boxShadow = "inset 0 0 0 1px color-mix(in srgb, currentColor 25%, transparent)";

  if (list.length === 1) {
    return { backgroundColor: `${list[0]}26`, color, boxShadow };
  }

  const step = 100 / list.length;
  const stops = list
    .map((c, index) => `${c} ${index * step}%, ${c} ${(index + 1) * step}%`)
    .join(", ");
  return { background: `linear-gradient(135deg, ${stops})`, color, boxShadow };
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
