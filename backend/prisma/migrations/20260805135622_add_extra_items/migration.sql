-- CreateTable
CREATE TABLE "extra_items" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "extra_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "print_extra_items" (
    "id" SERIAL NOT NULL,
    "print_id" INTEGER NOT NULL,
    "extra_item_id" INTEGER,
    "quantity" DOUBLE PRECISION,
    "position" INTEGER NOT NULL,

    CONSTRAINT "print_extra_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "extra_items" ADD CONSTRAINT "extra_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "print_extra_items" ADD CONSTRAINT "print_extra_items_print_id_fkey" FOREIGN KEY ("print_id") REFERENCES "prints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "print_extra_items" ADD CONSTRAINT "print_extra_items_extra_item_id_fkey" FOREIGN KEY ("extra_item_id") REFERENCES "extra_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
