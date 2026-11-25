BEGIN;

-- Complete only fields that are still empty and whose authoritative source
-- values are present in the existing HAB event copy and legacy product data.
UPDATE "Product"
SET "weight" = '1.4 kg'
WHERE "code" = 'SAD03'
  AND "name" = 'Yathra Cover Saddle Bag'
  AND "weight" IS NULL;

UPDATE "EventRecord"
SET "endDate" = "startDate" + INTERVAL '2 days',
    "schedule" = jsonb_set(
      COALESCE("schedule", '{}'::jsonb),
      '{time}',
      to_jsonb('09:00 – 18:00'::text),
      true
    )
WHERE "key" = 'craft-bazaar-2026'
  AND "title" = 'Zorig Chusum craft bazaar'
  AND "startDate" = TIMESTAMP '2026-09-12 00:00:00'
  AND "endDate" IS NULL
  AND "schedule"->>'time' = '09:00 – 18:00, three days';

UPDATE "EventRecord"
SET "endDate" = "startDate" + INTERVAL '9 days',
    "schedule" = COALESCE("schedule", '{}'::jsonb) - 'time'
WHERE "key" = 'dye-training-nov'
  AND "title" = 'Natural dye training, Lhuentse'
  AND "startDate" = TIMESTAMP '2026-11-04 00:00:00'
  AND "endDate" IS NULL
  AND "description" LIKE 'A ten-day residential course at Khoma%'
  AND "schedule"->>'time' = 'Ten days, residential';

COMMIT;
