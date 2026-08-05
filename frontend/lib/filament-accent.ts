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

/** A filament's color(s): a single color, or a [color, color2] pair for duo-color filaments. */
export type ColorSwatch = string | [string, string];

/** Builds a swatch for one filament, collapsing to a single color when color2 is unset or identical. */
export function colorSwatch(
  color: string | null | undefined,
  color2?: string | null | undefined
): ColorSwatch | null {
  if (!color) return null;
  if (color2 && color2 !== color) return [color, color2];
  return color;
}

/**
 * Style for a small icon avatar.
 * - One color: translucent tint.
 * - One duo-color filament: a smooth blend between its two colors.
 * - Several filaments/colors: a hard-stop segmented gradient, so it reads as distinct colors rather than a blend.
 */
export function filamentIconStyle(
  swatches: (ColorSwatch | null | undefined)[]
): CSSProperties | undefined {
  const list = swatches.filter((swatch): swatch is ColorSwatch => !!swatch);
  if (list.length === 0) return undefined;

  const boxShadow = "inset 0 0 0 1px color-mix(in srgb, currentColor 25%, transparent)";

  if (list.length === 1) {
    const swatch = list[0];
    if (Array.isArray(swatch)) {
      const color = glyphColorFor(swatch);
      return { background: `linear-gradient(135deg, ${swatch[0]}, ${swatch[1]})`, color, boxShadow };
    }
    const color = glyphColorFor([swatch]);
    return { backgroundColor: `${swatch}26`, color, boxShadow };
  }

  const flatColors = uniqueColors(list.flatMap((swatch) => (Array.isArray(swatch) ? swatch : [swatch])));
  const color = glyphColorFor(flatColors);
  const step = 100 / flatColors.length;
  const stops = flatColors
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
