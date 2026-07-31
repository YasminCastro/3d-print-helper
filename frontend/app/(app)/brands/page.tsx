import { db } from "@/lib/db";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandFormDialog } from "@/components/brand-form-dialog";
import { BrandsPageContent } from "@/components/brands-page-content";
import { brandAveragePrice, computeCostBenefit, groupAveragePrice } from "@/lib/cost-benefit";
import { getBrands } from "@/lib/actions/brands";

export default async function BrandsPage() {
  const brands = [...(await getBrands())].sort((a, b) => a.name.localeCompare(b.name));

  const filamentRatings = db
    .prepare(
      `SELECT brand_id, AVG(rating) AS avg_rating, COUNT(rating) AS rating_count
       FROM filaments
       WHERE brand_id IS NOT NULL AND rating IS NOT NULL
       GROUP BY brand_id`
    )
    .all() as { brand_id: number; avg_rating: number; rating_count: number }[];
  const ratingsByBrand = new Map(filamentRatings.map((row) => [row.brand_id, row]));

  const filamentPriceRanges = db
    .prepare(
      `SELECT brand_id, MIN(price) AS computed_min, MAX(price) AS computed_max
       FROM (
         SELECT brand_id, min_price_paid AS price FROM filaments
         WHERE brand_id IS NOT NULL AND min_price_paid IS NOT NULL
         UNION ALL
         SELECT brand_id, max_price_paid AS price FROM filaments
         WHERE brand_id IS NOT NULL AND max_price_paid IS NOT NULL
       )
       GROUP BY brand_id`
    )
    .all() as { brand_id: number; computed_min: number; computed_max: number }[];
  const priceRangeByBrand = new Map(filamentPriceRanges.map((row) => [row.brand_id, row]));

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
