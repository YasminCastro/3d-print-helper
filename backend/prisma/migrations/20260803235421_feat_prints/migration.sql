-- CreateTable
CREATE TABLE "print_categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "print_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prints" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "photo_filename" TEXT,
    "photo_mime_type" TEXT,
    "photo_data" BYTEA,
    "print_date" TEXT,
    "duration_minutes" INTEGER,
    "status" TEXT,
    "result" TEXT,
    "category_id" INTEGER,
    "printer_id" INTEGER,
    "print_link" TEXT,
    "profit_percent" DOUBLE PRECISION,
    "filament_cost" DOUBLE PRECISION,
    "print_cost" DOUBLE PRECISION,
    "sale_value" DOUBLE PRECISION,
    "sale_value_worst_case" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "prints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "print_filaments" (
    "id" SERIAL NOT NULL,
    "print_id" INTEGER NOT NULL,
    "filament_id" INTEGER,
    "grams" DOUBLE PRECISION,
    "position" INTEGER NOT NULL,

    CONSTRAINT "print_filaments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "print_categories_name_user_id_key" ON "print_categories"("name", "user_id");

-- AddForeignKey
ALTER TABLE "print_categories" ADD CONSTRAINT "print_categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prints" ADD CONSTRAINT "prints_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "print_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prints" ADD CONSTRAINT "prints_printer_id_fkey" FOREIGN KEY ("printer_id") REFERENCES "printers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prints" ADD CONSTRAINT "prints_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "print_filaments" ADD CONSTRAINT "print_filaments_print_id_fkey" FOREIGN KEY ("print_id") REFERENCES "prints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "print_filaments" ADD CONSTRAINT "print_filaments_filament_id_fkey" FOREIGN KEY ("filament_id") REFERENCES "filaments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
