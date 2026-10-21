-- AlterEnum
ALTER TYPE "PlanType" ADD VALUE 'UNLIMITED';

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN "trialEndsAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ADD COLUMN "isPlatformAdmin" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: existing FREE subscriptions start their 30-day trial now
UPDATE "subscriptions" SET "trialEndsAt" = NOW() + INTERVAL '30 days'
WHERE "plan" = 'FREE' AND "trialEndsAt" IS NULL;
