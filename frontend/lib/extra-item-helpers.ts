import type { ExtraItem } from "@/lib/types/extra-item";

export function extraItemDenormalizedFields(extraItem: ExtraItem | null | undefined) {
  return {
    extra_item_name: extraItem?.name ?? null,
    extra_item_cost: extraItem?.cost ?? null,
  };
}
