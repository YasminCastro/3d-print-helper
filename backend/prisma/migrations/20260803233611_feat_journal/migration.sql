-- CreateTable
CREATE TABLE "journal_entries" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "entry_date" TEXT,
    "filament_id" INTEGER,
    "status" TEXT,
    "symptom" TEXT,
    "possible_causes" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_attempts" (
    "id" SERIAL NOT NULL,
    "entry_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "attempt" TEXT,
    "worked" INTEGER,

    CONSTRAINT "journal_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_photos" (
    "id" SERIAL NOT NULL,
    "entry_id" INTEGER NOT NULL,
    "filename" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journal_photos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_filament_id_fkey" FOREIGN KEY ("filament_id") REFERENCES "filaments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_attempts" ADD CONSTRAINT "journal_attempts_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "journal_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_photos" ADD CONSTRAINT "journal_photos_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "journal_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
