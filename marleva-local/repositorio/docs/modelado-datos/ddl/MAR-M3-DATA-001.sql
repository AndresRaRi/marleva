-- Generado desde MAR-M3-DATA-001.dbml + restricciones complementarias. Solo M3 aislado.
CREATE SCHEMA IF NOT EXISTS "m3";

CREATE TABLE "m3"."SellerEligibility" (
  "id" uuid PRIMARY KEY,
  "owner_id" uuid NOT NULL,
  "public_name" text NOT NULL,
  "membership_current" boolean NOT NULL,
  "enabled" boolean NOT NULL,
  "version" integer NOT NULL DEFAULT 1,
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "m3"."Offer" (
  "id" uuid PRIMARY KEY,
  "seller_id" uuid NOT NULL,
  "paused" boolean NOT NULL DEFAULT true,
  "revision" integer NOT NULL DEFAULT 1,
  "public_version_id" uuid,
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "m3"."OfferVersion" (
  "id" uuid PRIMARY KEY,
  "offer_id" uuid NOT NULL,
  "number" integer NOT NULL,
  "state" text NOT NULL DEFAULT 'draft',
  "title" text NOT NULL,
  "description" text NOT NULL,
  "kind" text NOT NULL,
  "category" text NOT NULL,
  "price_cents" integer,
  "unit" text,
  "stock" integer,
  "made_to_order" boolean NOT NULL DEFAULT false,
  "developments" integer[] NOT NULL,
  "modalities" text[] NOT NULL,
  "response_minutes" integer NOT NULL,
  "preparation_minutes" integer NOT NULL,
  "food" jsonb,
  "reason" text,
  "reviewed_by" uuid,
  "created_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE TABLE "m3"."Photo" (
  "id" uuid PRIMARY KEY,
  "version_id" uuid NOT NULL,
  "position" integer NOT NULL,
  "state" text NOT NULL,
  "object_key" text UNIQUE NOT NULL,
  "mime_type" text NOT NULL,
  "bytes" integer NOT NULL,
  "sha256" text NOT NULL,
  "metadata_removed" boolean NOT NULL DEFAULT false
);

CREATE TABLE "m3"."CommandReceipt" (
  "actor_id" uuid NOT NULL,
  "key" uuid NOT NULL,
  "operation" text NOT NULL,
  "request_hash" text NOT NULL,
  "result" jsonb NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  PRIMARY KEY ("actor_id", "key", "operation")
);

CREATE TABLE "m3"."CatalogEvent" (
  "id" uuid PRIMARY KEY,
  "offer_id" uuid NOT NULL,
  "actor_id" uuid NOT NULL,
  "action" text NOT NULL,
  "revision" integer NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE UNIQUE INDEX ON "m3"."OfferVersion" ("offer_id", "number");

CREATE UNIQUE INDEX ON "m3"."OfferVersion" ("id", "offer_id");

CREATE UNIQUE INDEX ON "m3"."Photo" ("version_id", "position");

COMMENT ON TABLE "m3"."SellerEligibility" IS 'Proyección ficticia de puerto M2; no evidencia de residencia ni alta real. No almacenar expediente.';

COMMENT ON TABLE "m3"."OfferVersion" IS 'Estadísticas de expresión de búsqueda en MAR-M3-search-statistics.sql; DBML no representa CREATE STATISTICS. Migración M3 separada002, no reescribir001.';

COMMENT ON COLUMN "m3"."OfferVersion"."food" IS 'Ingredientes/alérgenos/conservación estructurados. No datos clínicos.';

COMMENT ON TABLE "m3"."Photo" IS 'Solo derivados seguros listos, sin URLs externas. Pipeline de ingreso pendiente; tabla no acredita procesamiento.';

COMMENT ON COLUMN "m3"."CommandReceipt"."result" IS 'Resultado estructurado idempotente, sin secretos.';

COMMENT ON TABLE "m3"."CatalogEvent" IS 'Evento local transaccional. No correo ni M9 integrado; no política de retención real aprobada.';

ALTER TABLE "m3"."Offer" ADD FOREIGN KEY ("seller_id") REFERENCES "m3"."SellerEligibility" ("id") NOT DEFERRABLE;

ALTER TABLE "m3"."OfferVersion" ADD FOREIGN KEY ("offer_id") REFERENCES "m3"."Offer" ("id") NOT DEFERRABLE;

ALTER TABLE "m3"."Offer" ADD CONSTRAINT "public_version_offer" FOREIGN KEY ("public_version_id", "id") REFERENCES "m3"."OfferVersion" ("id", "offer_id") NOT DEFERRABLE;

ALTER TABLE "m3"."Photo" ADD FOREIGN KEY ("version_id") REFERENCES "m3"."OfferVersion" ("id") NOT DEFERRABLE;

ALTER TABLE "m3"."CatalogEvent" ADD FOREIGN KEY ("offer_id") REFERENCES "m3"."Offer" ("id") NOT DEFERRABLE;

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
-- MAR-M3-UC-001 / SEQ001:S040. Plan inicial estimó1 fila para10000 coincidencias.
-- Solo M3: estadísticas de la expresión exacta de búsqueda, sin cambiar semántica.
CREATE STATISTICS m3."OfferVersion_search_stats" ON (title || ' ' || description) FROM m3."OfferVersion";
ANALYZE m3."OfferVersion";
ANALYZE m3."Offer";
ANALYZE m3."SellerEligibility";
