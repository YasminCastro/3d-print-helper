import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandFormDialog } from "@/components/brand-form-dialog";
import { BrandsPageContent } from "@/components/brands-page-content";
import { brandAveragePrice, computeCostBenefit, groupAveragePrice } from "@/lib/cost-benefit";
import { getBrands } from "@/lib/actions/brands";
import { getFilaments } from "@/lib/actions/filaments";

export default async function BrandsPage() {
  const [brandsRaw, filaments] = await Promise.all([getBrands(), getFilaments()]);
  const brands = [...brandsRaw].sort((a, b) => a.name.localeCompare(b.name));

  const ratingsByBrand = new Map<number, { avg_rating: number; rating_count: number }>();
  const ratingSumsByBrand = new Map<number, { sum: number; count: number }>();
  const priceRangeByBrand = new Map<number, { computed_min: number; computed_max: number }>();

  for (const filament of filaments) {
    if (filament.brand_id == null) continue;

    if (filament.rating != null) {
      const current = ratingSumsByBrand.get(filament.brand_id) ?? { sum: 0, count: 0 };
      current.sum += filament.rating;
      current.count += 1;
      ratingSumsByBrand.set(filament.brand_id, current);
    }

    const prices = [filament.min_price_paid, filament.max_price_paid].filter(
      (price): price is number => price != null
    );
    if (prices.length > 0) {
      const current = priceRangeByBrand.get(filament.brand_id) ?? {
        computed_min: Infinity,
        computed_max: -Infinity,
      };
      current.computed_min = Math.min(current.computed_min, ...prices);
      current.computed_max = Math.max(current.computed_max, ...prices);
      priceRangeByBrand.set(filament.brand_id, current);
    }
  }

  for (const [brandId, { sum, count }] of ratingSumsByBrand) {
    ratingsByBrand.set(brandId, { avg_rating: sum / count, rating_count: count });
  }

  const pricedBrands = brands.map((brand) => {
    const computed = priceRangeByBrand.get(brand.id);
    return {
      brand,
      priceMin: brand.avgPriceMin ?? computed?.computed_min ?? null,
      priceMax: brand.avgPriceMax ?? computed?.computed_max ?? null,
    };
  });

  const averagePrice = groupAveragePrice(
    pricedBrands.map(({ priceMin, priceMax }) => ({
      avgPriceMin: priceMin,
      avgPriceMax: priceMax,
    }))
  );

  const items = pricedBrands.map(({ brand, priceMin, priceMax }) => ({
    brand,
    priceMin,
    priceMax,
    costBenefit: computeCostBenefit(
      brandAveragePrice({ avgPriceMin: priceMin, avgPriceMax: priceMax }),
      averagePrice
    ),
    filamentRating: ratingsByBrand.get(brand.id)?.avg_rating ?? null,
    filamentRatingCount: ratingsByBrand.get(brand.id)?.rating_count ?? 0,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Marcas de Filamento</h1>
        <BrandFormDialog />
      </div>

      {brands.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-normal text-muted-foreground">
              Nenhuma marca cadastrada ainda.
            </CardTitle>
          </CardHeader>
        </Card>
      ) : (
        <BrandsPageContent items={items} />
      )}
    </div>
  );
}
