-- CreateTable
CREATE TABLE "filaments" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "availability" TEXT,
    "last_purchase_date" TEXT,
    "material" TEXT,
    "brand_id" INTEGER,
    "purchase_link" TEXT,
    "sale_name" TEXT,
    "min_price_paid" DOUBLE PRECISION,
    "max_price_paid" DOUBLE PRECISION,
    "nozzle_temp_min" INTEGER,
    "nozzle_temp_max" INTEGER,
    "bed_temp_min" INTEGER,
    "bed_temp_max" INTEGER,
    "purchase_batch" TEXT,
    "rating" INTEGER,
    "color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "filaments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "filaments" ADD CONSTRAINT "filaments_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "filament_brands"("id") ON DELETE SET NULL ON UPDATE CASCADE;
