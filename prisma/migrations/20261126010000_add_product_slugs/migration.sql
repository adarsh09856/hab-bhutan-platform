BEGIN;

ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "slug" TEXT;

WITH normalized AS (
  SELECT
    "id",
    COALESCE(
      NULLIF(TRIM(BOTH '-' FROM LOWER(REGEXP_REPLACE("name", '[^a-zA-Z0-9]+', '-', 'g'))), ''),
      'product'
    ) AS base_slug
  FROM "Product"
), ranked AS (
  SELECT
    "id",
    base_slug,
    COUNT(*) OVER (PARTITION BY base_slug) AS slug_count
  FROM normalized
)
UPDATE "Product" AS product
SET "slug" = CASE
  WHEN ranked.slug_count = 1 THEN ranked.base_slug
  ELSE ranked.base_slug || '-' || SUBSTRING(MD5(product."code") FROM 1 FOR 10)
END
FROM ranked
WHERE ranked."id" = product."id" AND COALESCE(product."slug", '') = '';

ALTER TABLE "Product" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "Product" ALTER COLUMN "slug" SET DEFAULT '';
CREATE UNIQUE INDEX IF NOT EXISTS "Product_slug_key" ON "Product"("slug");

CREATE OR REPLACE FUNCTION hab_assign_product_slug() RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  candidate TEXT;
  code_suffix TEXT;
  suffix_number INTEGER := 2;
BEGIN
  base_slug := COALESCE(
    NULLIF(TRIM(BOTH '-' FROM LOWER(REGEXP_REPLACE(NEW."name", '[^a-zA-Z0-9]+', '-', 'g'))), ''),
    'product'
  );
  candidate := NULLIF(TRIM(NEW."slug"), '');
  IF candidate IS NULL THEN candidate := base_slug; END IF;

  -- Serialize allocations for this readable base slug. This also protects
  -- simultaneous inserts that race after both have checked the same name.
  PERFORM pg_advisory_xact_lock(hashtext(candidate));
  IF EXISTS (SELECT 1 FROM "Product" WHERE "slug" = candidate AND "id" <> COALESCE(NEW."id", '')) THEN
    code_suffix := COALESCE(
      NULLIF(TRIM(BOTH '-' FROM LOWER(REGEXP_REPLACE(NEW."code", '[^a-zA-Z0-9]+', '-', 'g'))), ''),
      SUBSTRING(MD5(NEW."code") FROM 1 FOR 10)
    );
    candidate := base_slug || '-' || code_suffix;
    WHILE EXISTS (SELECT 1 FROM "Product" WHERE "slug" = candidate AND "id" <> COALESCE(NEW."id", '')) LOOP
      candidate := base_slug || '-' || code_suffix || '-' || suffix_number::TEXT;
      suffix_number := suffix_number + 1;
    END LOOP;
  END IF;
  NEW."slug" := candidate;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "Product_assign_slug_before_write" ON "Product";
CREATE TRIGGER "Product_assign_slug_before_write"
BEFORE INSERT OR UPDATE OF "slug", "name", "code" ON "Product"
FOR EACH ROW EXECUTE FUNCTION hab_assign_product_slug();

COMMIT;
