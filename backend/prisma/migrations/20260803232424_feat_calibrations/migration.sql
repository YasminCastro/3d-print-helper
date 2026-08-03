-- CreateTable
CREATE TABLE "calibrations" (
    "id" SERIAL NOT NULL,
    "slicer" TEXT NOT NULL,
    "filament_id" INTEGER,
    "status" TEXT,
    "calibration_date" TEXT,
    "bed_temp_first_layer" DOUBLE PRECISION,
    "bed_temp_other_layers" DOUBLE PRECISION,
    "nozzle_temp_initial" DOUBLE PRECISION,
    "nozzle_temp_final" DOUBLE PRECISION,
    "max_volumetric_speed" DOUBLE PRECISION,
    "pressure_advance" DOUBLE PRECISION,
    "flow_ratio" DOUBLE PRECISION,
    "retraction_distance" DOUBLE PRECISION,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "calibrations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "calibrations" ADD CONSTRAINT "calibrations_filament_id_fkey" FOREIGN KEY ("filament_id") REFERENCES "filaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calibrations" ADD CONSTRAINT "calibrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
