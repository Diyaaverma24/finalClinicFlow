-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN "completedAt" DATETIME;
ALTER TABLE "Appointment" ADD COLUMN "noShowAt" DATETIME;

-- CreateTable
CREATE TABLE "NotificationOutbox" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appointmentId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "scheduledFor" DATETIME NOT NULL,
    "processedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "NotificationOutbox_appointmentId_type_scheduledFor_key" ON "NotificationOutbox"("appointmentId", "type", "scheduledFor");
