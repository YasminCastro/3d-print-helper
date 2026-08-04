import { notFound } from "next/navigation";

import { FilamentDetailView } from "@/components/filament-detail-view";
import { getBrands } from "@/lib/actions/brands";
import { getFilament } from "@/lib/actions/filaments";
import type { FilamentWithBrand } from "@/lib/types/filament";

export default async function FilamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const filamentId = Number(id);

  if (Number.isNaN(filamentId)) notFound();

  const [filament, brands] = await Promise.all([getFilament(filamentId), getBrands()]);

  if (!filament) notFound();

  const brandsById = new Map(brands.map((brand) => [brand.id, brand.name]));

  const filamentWithBrand: FilamentWithBrand = {
    ...filament,
    brand_name: filament.brand_id != null ? (brandsById.get(filament.brand_id) ?? null) : null,
  };

  const brandOptions = [...brands]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((brand) => ({ id: brand.id, name: brand.name }));

  return <FilamentDetailView filament={filamentWithBrand} brandOptions={brandOptions} />;
}
