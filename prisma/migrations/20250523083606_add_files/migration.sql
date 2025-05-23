-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "size" DOUBLE PRECISION NOT NULL,
    "parentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "folders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
