
-- Restricciones complementarias a DATA001; derivación explícita y trazada a matriz M3 R1–R8.
ALTER TABLE m3."SellerEligibility" ADD CHECK (version>0 AND length(public_name) BETWEEN 1 AND 120);
ALTER TABLE m3."Offer" ADD CHECK (revision>0);
ALTER TABLE m3."OfferVersion" ADD CHECK (number>0),
 ADD CHECK (state IN ('draft','pending','approved','correction','rejected')),
 ADD CHECK (char_length(title) BETWEEN 3 AND 120 AND char_length(description) BETWEEN 20 AND 2000),
 ADD CHECK (category IN ('food','everyday','classes','repairs','personal_care')),
 ADD CHECK (kind IN ('product','service')),
 ADD CHECK ((kind='product' AND price_cents IS NOT NULL AND price_cents>0 AND unit IS NOT NULL AND
  ((made_to_order AND stock IS NULL) OR (NOT made_to_order AND stock IS NOT NULL AND stock>=0))) OR
  (kind='service' AND price_cents IS NULL AND unit IS NULL AND stock IS NULL AND NOT made_to_order)),
 ADD CHECK (cardinality(developments) BETWEEN 1 AND 7 AND developments <@ ARRAY[1,2,3,4,5,6,7]),
 ADD CHECK (cardinality(modalities) BETWEEN 1 AND 4 AND modalities <@ ARRAY['delivery','pickup','home','establishment']::text[]),
 ADD CHECK (response_minutes BETWEEN 1 AND 1440 AND preparation_minutes BETWEEN 0 AND 525600),
 ADD CHECK (category<>'food' OR food IS NOT NULL);
ALTER TABLE m3."Photo" ADD CHECK (position BETWEEN 1 AND 6 AND bytes BETWEEN 1 AND 5000000),
 ADD CHECK (state IN ('quarantine','ready','rejected') AND mime_type IN ('image/jpeg','image/png')),
 ADD CHECK (sha256 ~ '^[a-f0-9]{64}$'), ADD CHECK (state<>'ready' OR metadata_removed);
CREATE INDEX "Offer_public_order_idx" ON m3."Offer"(updated_at DESC,id DESC) WHERE NOT paused;
CREATE INDEX "OfferVersion_developments_idx" ON m3."OfferVersion" USING gin(developments);
CREATE INDEX "OfferVersion_modalities_idx" ON m3."OfferVersion" USING gin(modalities);
CREATE UNIQUE INDEX "OfferVersion_one_pending_idx" ON m3."OfferVersion"(offer_id) WHERE state='pending';
