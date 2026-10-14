export const recoveryConstraints = `
CREATE UNIQUE INDEX role_assignment_active ON marleva."RoleAssignment" ("accountId", role) WHERE "revokedAt" IS NULL;

CREATE UNIQUE INDEX recovery_active ON marleva."MfaRecovery" ("accountId") WHERE state IN ('requested','approved','executing','provider_pending','reenrollment');

CREATE UNIQUE INDEX recovery_capability_hash ON marleva."MfaRecovery" ("capabilityHash") WHERE "capabilityHash" IS NOT NULL;

ALTER TABLE marleva."RoleAssignment" ADD CONSTRAINT role_version CHECK (version>0), ADD CONSTRAINT role_revocation CHECK (("revokedAt" IS NULL AND "revokedBy" IS NULL) OR ("revokedAt" IS NOT NULL AND "revokedAt">="grantedAt" AND "revokedBy" IS NOT NULL)), ADD CONSTRAINT role_no_self_grant CHECK ("grantedBy" IS NULL OR "grantedBy"<>"accountId");

ALTER TABLE marleva."MfaRecovery" ADD CONSTRAINT recovery_version CHECK (version>0), ADD CONSTRAINT recovery_owner CHECK ("requestedBy"="accountId"), ADD CONSTRAINT recovery_reviewer CHECK ("approvedBy" IS NULL OR "approvedBy"<>"accountId"), ADD CONSTRAINT recovery_expiry CHECK ("expiresAt">"createdAt"), ADD CONSTRAINT recovery_approval CHECK (state NOT IN ('approved','executing','provider_pending','reenrollment','completed') OR "approvedBy" IS NOT NULL), ADD CONSTRAINT recovery_completed CHECK ((state='completed')=("completedAt" IS NOT NULL)), ADD CONSTRAINT capability_attempts CHECK ("capabilityAttempts" BETWEEN 0 AND 5), ADD CONSTRAINT capability_binding CHECK (("capabilityHash" IS NULL AND "capabilitySessionId" IS NULL AND "capabilityExpiresAt" IS NULL) OR ("capabilityHash" IS NOT NULL AND "capabilitySessionId" IS NOT NULL AND "capabilityExpiresAt" IS NOT NULL AND "capabilityExpiresAt">"createdAt" AND "capabilityExpiresAt"<="expiresAt")), ADD CONSTRAINT capability_consumed CHECK ("capabilityConsumedAt" IS NULL OR ("capabilityHash" IS NOT NULL AND "capabilityConsumedAt"<="capabilityExpiresAt"));

ALTER TABLE marleva."MfaRecovery" ADD CONSTRAINT recovery_json CHECK (jsonb_typeof(operations)='object' AND jsonb_typeof("providerState")='object'), ADD CONSTRAINT recovery_request_hash CHECK ("requestHash" ~ '^[0-9a-f]{64}$'), ADD CONSTRAINT recovery_request_key CHECK (length("requestKey") BETWEEN 1 AND 128), ADD CONSTRAINT recovery_lease CHECK (("leaseToken" IS NULL)=("leaseUntil" IS NULL));

CREATE FUNCTION marleva.project_operator_role() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 UPDATE marleva."Account" SET operator=EXISTS(SELECT 1 FROM marleva."RoleAssignment" WHERE "accountId"=COALESCE(NEW."accountId",OLD."accountId") AND "revokedAt" IS NULL)
 WHERE id=COALESCE(NEW."accountId",OLD."accountId");
 RETURN COALESCE(NEW,OLD);
END; $$;
CREATE TRIGGER role_operator_projection AFTER INSERT OR UPDATE OR DELETE ON marleva."RoleAssignment" FOR EACH ROW EXECUTE FUNCTION marleva.project_operator_role();
CREATE FUNCTION marleva.guard_operator_projection() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 NEW.operator=EXISTS(SELECT 1 FROM marleva."RoleAssignment" WHERE "accountId"=NEW.id AND "revokedAt" IS NULL);
 RETURN NEW;
END; $$;
CREATE TRIGGER account_operator_projection BEFORE INSERT OR UPDATE OF operator ON marleva."Account" FOR EACH ROW EXECUTE FUNCTION marleva.guard_operator_projection();

`;
