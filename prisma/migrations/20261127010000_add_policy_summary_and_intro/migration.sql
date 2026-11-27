-- Nullable policy copy fields keep existing records and public fallback copy intact.
BEGIN;

ALTER TABLE "PolicyPage"
  ADD COLUMN IF NOT EXISTS "summary" TEXT,
  ADD COLUMN IF NOT EXISTS "intro" TEXT;

COMMIT;
