-- CreateTable
CREATE TABLE "filament_brands" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "where_to_buy" TEXT,
    "avg_price_min" DOUBLE PRECISION,
    "avg_price_max" DOUBLE PRECISION,
    "filament_types" TEXT,
    "best_colors" TEXT,
    "purchased" INTEGER DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "filament_brands_pkey" PRIMARY KEY ("id")
);
