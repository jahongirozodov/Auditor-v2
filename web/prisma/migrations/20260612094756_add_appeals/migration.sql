-- CreateTable
CREATE TABLE "Appeal" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "reviewComment" TEXT,
    "submittedById" TEXT NOT NULL,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppealFile" (
    "id" TEXT NOT NULL,
    "appealId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppealFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Appeal_submittedById_idx" ON "Appeal"("submittedById");

-- CreateIndex
CREATE INDEX "Appeal_status_idx" ON "Appeal"("status");

-- CreateIndex
CREATE INDEX "Appeal_type_idx" ON "Appeal"("type");

-- CreateIndex
CREATE INDEX "AppealFile_appealId_idx" ON "AppealFile"("appealId");

-- CreateIndex
CREATE INDEX "AppealFile_fileId_idx" ON "AppealFile"("fileId");

-- AddForeignKey
ALTER TABLE "Appeal" ADD CONSTRAINT "Appeal_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appeal" ADD CONSTRAINT "Appeal_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppealFile" ADD CONSTRAINT "AppealFile_appealId_fkey" FOREIGN KEY ("appealId") REFERENCES "Appeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppealFile" ADD CONSTRAINT "AppealFile_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "FileStorage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppealFile" ADD CONSTRAINT "AppealFile_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
