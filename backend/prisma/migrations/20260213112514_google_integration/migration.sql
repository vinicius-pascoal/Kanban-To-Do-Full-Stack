/*
  Warnings:

  - A unique constraint covering the columns `[googleSub]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "GoogleCalendarStatus" AS ENUM ('CONNECTED', 'DISCONNECTED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "googleSub" TEXT,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateTable
CREATE TABLE "GoogleCalendarIntegration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "googleSub" TEXT,
    "refreshTokenEncrypted" TEXT NOT NULL,
    "scope" TEXT,
    "calendarId" TEXT NOT NULL DEFAULT 'primary',
    "status" "GoogleCalendarStatus" NOT NULL DEFAULT 'CONNECTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleCalendarIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarEventLink" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "boardId" TEXT,
    "calendarId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "etag" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "googleCalendarIntegrationId" TEXT,

    CONSTRAINT "CalendarEventLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarSyncState" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "syncToken" TEXT,
    "channelId" TEXT,
    "resourceId" TEXT,
    "channelExpiration" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarSyncState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GoogleCalendarIntegration_userId_calendarId_key" ON "GoogleCalendarIntegration"("userId", "calendarId");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarEventLink_userId_cardId_key" ON "CalendarEventLink"("userId", "cardId");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarEventLink_calendarId_eventId_key" ON "CalendarEventLink"("calendarId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarSyncState_integrationId_key" ON "CalendarSyncState"("integrationId");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleSub_key" ON "User"("googleSub");

-- AddForeignKey
ALTER TABLE "GoogleCalendarIntegration" ADD CONSTRAINT "GoogleCalendarIntegration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEventLink" ADD CONSTRAINT "CalendarEventLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEventLink" ADD CONSTRAINT "CalendarEventLink_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEventLink" ADD CONSTRAINT "CalendarEventLink_googleCalendarIntegrationId_fkey" FOREIGN KEY ("googleCalendarIntegrationId") REFERENCES "GoogleCalendarIntegration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarSyncState" ADD CONSTRAINT "CalendarSyncState_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "GoogleCalendarIntegration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
