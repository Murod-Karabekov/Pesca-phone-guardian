-- CreateTable
CREATE TABLE "Advertisement" (
    "id" TEXT NOT NULL,
    "placement" TEXT NOT NULL,
    "title" TEXT,
    "image_url" TEXT,
    "link_url" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Advertisement_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Advertisement_placement_is_active_idx" ON "Advertisement"("placement", "is_active");
