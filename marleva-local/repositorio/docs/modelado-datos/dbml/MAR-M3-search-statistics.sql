-- MAR-M3-UC-001 / SEQ001:S040. Plan inicial estimó1 fila para10000 coincidencias.
-- Solo M3: estadísticas de la expresión exacta de búsqueda, sin cambiar semántica.
CREATE STATISTICS m3."OfferVersion_search_stats" ON (title || ' ' || description) FROM m3."OfferVersion";
ANALYZE m3."OfferVersion";
ANALYZE m3."Offer";
ANALYZE m3."SellerEligibility";
