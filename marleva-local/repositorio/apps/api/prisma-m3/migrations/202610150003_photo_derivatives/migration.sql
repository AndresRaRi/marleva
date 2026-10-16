ALTER TABLE m3."Photo" ADD COLUMN source_sha256 text, ADD COLUMN derivatives jsonb;
-- MAR-M3-UC009: archivos listos requieren ambos derivados e integridad.
ALTER TABLE m3."Photo" ADD CONSTRAINT "Photo_ready_derivatives_check" CHECK (
 state<>'ready' OR COALESCE((
 source_sha256 ~ '^[a-f0-9]{64}$' AND object_key=id::text AND
 jsonb_typeof(derivatives)='object' AND derivatives ?& ARRAY['card','detail'] AND
 (derivatives->'card'->>'sha256') ~ '^[a-f0-9]{64}$' AND
 (derivatives->'detail'->>'sha256')=sha256 AND
 (derivatives->'detail'->>'bytes')::int=bytes AND
 (derivatives->'card'->>'bytes')::int BETWEEN 1 AND 5000000 AND
 (derivatives->'card'->>'width')::int BETWEEN 1 AND 480 AND
 (derivatives->'card'->>'height')::int BETWEEN 1 AND 480 AND
 (derivatives->'detail'->>'width')::int BETWEEN 1 AND 1600 AND
 (derivatives->'detail'->>'height')::int BETWEEN 1 AND 1600
 ),false)
);
