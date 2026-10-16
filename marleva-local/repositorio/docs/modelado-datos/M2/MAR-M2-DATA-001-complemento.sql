-- FUENTE complementaria trazada: DBML/exportador 10.3.1 no expresa índices parciales.
-- OBJETIVO DOCUMENTAL; NO APLICAR. Sin funciones, triggers, roles o migraciones.
-- U01 / SEQ001:S090: un borrador por expediente.
CREATE UNIQUE INDEX m2_one_draft_per_application ON marleva."M2MembershipVersion" ("applicationId") WHERE lifecycle = 'draft';
-- U02 / SEQ003:S060: un envío pendiente por expediente.
CREATE UNIQUE INDEX m2_one_pending_submission ON marleva."M2MembershipSubmission" ("applicationId") WHERE status = 'pending';
-- U03 / M8-SEQ001:S050: una asignación vigente por envío.
CREATE UNIQUE INDEX m8_one_active_membership_assignment ON marleva."M8MembershipAssignment" ("submissionId") WHERE "endedAt" IS NULL;
-- U04 / M8-SEQ001:S030: una concesión activa por capacidad/persona.
CREATE UNIQUE INDEX m8_one_active_membership_grant ON marleva."M8MembershipReviewGrant" ("accountId", capability) WHERE "revokedAt" IS NULL;

-- U05-U10 / M2SEQ007/008 y M8SEQ003/004: exclusividad de borrador/envío/asignación/política.
CREATE UNIQUE INDEX m2_one_seller_draft ON marleva."M2SellerVersion" ("profileId") WHERE lifecycle = 'draft';
CREATE UNIQUE INDEX m2_one_pending_seller_submission ON marleva."M2SellerSubmission" ("profileId") WHERE status = 'pending';
CREATE UNIQUE INDEX m8_one_active_seller_assignment ON marleva."M8SellerAssignment" ("submissionId") WHERE "endedAt" IS NULL;
CREATE UNIQUE INDEX m2_one_open_restriction_appeal ON marleva."M2RestrictionAppeal" ("restrictionId") WHERE state IN ('draft','pending');
CREATE UNIQUE INDEX m8_one_active_restriction_assignment ON marleva."M8RestrictionAssignment" ("appealId") WHERE "endedAt" IS NULL;
CREATE UNIQUE INDEX m2_one_active_seller_terms ON marleva."M2SellerTermsPolicy" (purpose) WHERE state = 'active';
