-- CreateTable
CREATE TABLE "printers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "model" TEXT,
    "brand" TEXT,
    "power_consumption_w" DOUBLE PRECISION,
    "maintenance_cost_per_hour" DOUBLE PRECISION,
    "purchase_price" DOUBLE PRECISION,
    "lifespan_hours" INTEGER,
    "energy_cost_per_kwh" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "printers_pkey" PRIMARY KEY ("id")
);
