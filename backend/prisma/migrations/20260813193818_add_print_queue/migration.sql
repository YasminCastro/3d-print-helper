-- CreateTable
CREATE TABLE "print_queue_items" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "duration_minutes" INTEGER,
    "category_id" INTEGER,
    "printer_id" INTEGER,
    "print_link" TEXT,
    "notes" TEXT,
    "profit_percent" DOUBLE PRECISION,
    "filament_cost" DOUBLE PRECISION,
    "print_cost" DOUBLE PRECISION,
    "sale_value" DOUBLE PRECISION,
    "sale_value_worst_case" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "print_queue_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "print_queue_filaments" (
    "id" SERIAL NOT NULL,
    "queue_item_id" INTEGER NOT NULL,
    "filament_id" INTEGER,
    "grams" DOUBLE PRECISION,
    "position" INTEGER NOT NULL,

    CONSTRAINT "print_queue_filaments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "print_queue_extra_items" (
    "id" SERIAL NOT NULL,
    "queue_item_id" INTEGER NOT NULL,
    "extra_item_id" INTEGER,
    "quantity" DOUBLE PRECISION,
    "position" INTEGER NOT NULL,

    CONSTRAINT "print_queue_extra_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "print_queue_items" ADD CONSTRAINT "print_queue_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "print_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "print_queue_items" ADD CONSTRAINT "print_queue_items_printer_id_fkey" FOREIGN KEY ("printer_id") REFERENCES "printers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "print_queue_items" ADD CONSTRAINT "print_queue_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "print_queue_filaments" ADD CONSTRAINT "print_queue_filaments_queue_item_id_fkey" FOREIGN KEY ("queue_item_id") REFERENCES "print_queue_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "print_queue_filaments" ADD CONSTRAINT "print_queue_filaments_filament_id_fkey" FOREIGN KEY ("filament_id") REFERENCES "filaments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "print_queue_extra_items" ADD CONSTRAINT "print_queue_extra_items_queue_item_id_fkey" FOREIGN KEY ("queue_item_id") REFERENCES "print_queue_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "print_queue_extra_items" ADD CONSTRAINT "print_queue_extra_items_extra_item_id_fkey" FOREIGN KEY ("extra_item_id") REFERENCES "extra_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
