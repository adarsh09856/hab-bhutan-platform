BEGIN;

-- Repair only the specific legacy placeholder descriptions observed in the
-- production catalogue. The copy below uses each record's existing name,
-- motif, and materials; it does not infer maker or care details.
UPDATE "Product"
SET "description" = 'A crossbody phone case in cotton and silk.'
WHERE "code" = 'CPS02'
  AND "name" = 'Crossbody Phone Case'
  AND "materials" = 'Cotton/Silk'
  AND "description" = 'Authentic artisan handicraft curated by HAB.';

UPDATE "Product"
SET "description" = 'A deep-purple clutch with green diamond motifs, made with cotton and silk.'
WHERE "code" = 'CLC01'
  AND "name" = 'Clutch – Deep Purple with Green Diamond Motifs'
  AND "materials" = 'Cotton/Silk'
  AND "description" = 'Authentic artisan handicraft curated by HAB.';

UPDATE "Product"
SET "description" = 'A sling bag with a midnight Pelbeh diamond motif. Recorded materials include bamboo, polyester, silk, a zip and runner.'
WHERE "code" = 'SLB13'
  AND "name" = 'Sling Bag – Midnight Pelbeh Diamond Motif'
  AND "description" = 'Authentic artisan handicraft curated by HAB.';

UPDATE "Product"
SET "description" = 'A sling bag with lime trim and purple Kishuthara weave. Recorded materials include Yathra, a ring and a magnetic button.'
WHERE "code" = 'SLB11'
  AND "name" = 'Sling Bag – Lime Trim & Purple Kishuthara Weave'
  AND "description" = 'Authentic artisan handicraft curated by HAB.';

UPDATE "Product"
SET "description" = 'A Yathra sling bag finished with polyester, zip, runner and ring hardware.'
WHERE "code" = 'SLB09'
  AND "name" = 'Sling Bag'
  AND "description" = 'Authentic artisan handicraft curated by HAB.';

-- Use the same spelling as the Thagzo craft category and navigation.
UPDATE "Product"
SET "name" = 'Thagzo Card Purse',
    "description" = replace("description", 'Thag Zo', 'Thagzo')
WHERE "code" = 'HAB-TSH-26-3628'
  AND "name" = 'Thag Zo Card Purse'
  AND "description" LIKE '%Thag Zo%';

COMMIT;
