import { notFound } from "next/navigation";

import { BrandDetailView } from "@/components/brand-detail-view";
import { getBrandListItems } from "@/lib/brand-helpers";

export default async function BrandDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const brandId = Number(id);

  if (Number.isNaN(brandId)) notFound();

  const items = await getBrandListItems();
  const item = items.find(({ brand }) => brand.id === brandId);

  if (!item) notFound();

  return (
    <BrandDetailView
      brand={item.brand}
      costBenefit={item.costBenefit}
      priceMin={item.priceMin}
      priceMax={item.priceMax}
      filamentRating={item.filamentRating}
      filamentRatingCount={item.filamentRatingCount}
    />
  );
}
