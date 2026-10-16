-- MAR-M2-DATA-001: OBJETIVO DOCUMENTAL NO APLICADO.
-- Derivado de DBML y complemento propios con @dbml/core 10.3.1.
-- No es migración; no ejecutar sobre ninguna base. Sin CREATE/ALTER de M1, bootstrap, roles o privilegios.
-- Referencias externas a Account/Session/Development requieren coordinación futura.

CREATE TABLE "marleva"."M2MembershipApplication" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "accountId" uuid UNIQUE NOT NULL,
  "state" text NOT NULL DEFAULT 'draft',
  "eligibilityRevision" integer NOT NULL DEFAULT 1,
  "revision" integer NOT NULL DEFAULT 1,
  "approvedVersionId" uuid,
  "lastActivityAt" timestamptz NOT NULL DEFAULT (now()),
  "archivePreviousState" text,
  "currentVersionId" uuid,
  "createdAt" timestamptz NOT NULL DEFAULT (now()),
  "updatedAt" timestamptz NOT NULL DEFAULT (now()),
  CONSTRAINT "m2_application_activity" CHECK ("lastActivityAt" >= "createdAt" AND ("archivePreviousState" IS NULL OR "archivePreviousState" IN ('draft','correction','rejected'))),
  CONSTRAINT "m2_eligibility_revision_positive" CHECK ("eligibilityRevision" > 0),
  CONSTRAINT "m2_application_revision" CHECK (revision > 0),
  CONSTRAINT "m2_application_state" CHECK (state IN ('draft','pending','correction','rejected','approved','archived_inactivity')),
  CONSTRAINT "m2_application_dates" CHECK ("updatedAt" >= "createdAt"),
  CONSTRAINT "m2_application_current_required" CHECK (state = 'draft' OR "currentVersionId" IS NOT NULL)
);

CREATE TABLE "marleva"."M2MembershipVersion" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "applicationId" uuid NOT NULL,
  "accountId" uuid NOT NULL,
  "number" integer NOT NULL,
  "origin" text NOT NULL DEFAULT 'initial',
  "previousVersionId" uuid,
  "resumeOrigin" text,
  "sourceDecisionId" uuid,
  "sourceSubmissionId" uuid,
  "lifecycle" text NOT NULL DEFAULT 'draft',
  "developmentId" integer,
  "evidenceRelationship" text NOT NULL DEFAULT 'unspecified',
  "createdAt" timestamptz NOT NULL DEFAULT (now()),
  "submittedAt" timestamptz,
  CONSTRAINT "m2_version_number" CHECK (number > 0),
  CONSTRAINT "m2_version_initial_number" CHECK ((number = 1) = (origin = 'initial')),
  CONSTRAINT "m2_version_origin" CHECK (origin IN ('initial','correction','reconsideration','residence_change','reopen')),
  CONSTRAINT "m2_version_source_fields" CHECK ((origin = 'initial' AND "previousVersionId" IS NULL AND "resumeOrigin" IS NULL AND "sourceDecisionId" IS NULL AND "sourceSubmissionId" IS NULL) OR (origin IN ('correction','reconsideration','residence_change') AND "previousVersionId" IS NOT NULL AND "resumeOrigin" IS NULL AND "sourceDecisionId" IS NOT NULL AND "sourceSubmissionId" IS NOT NULL) OR (origin = 'reopen' AND "previousVersionId" IS NOT NULL AND "resumeOrigin" IS NOT NULL AND "resumeOrigin" IN ('initial','correction','reconsideration','residence_change') AND (("resumeOrigin" = 'initial' AND "sourceDecisionId" IS NULL AND "sourceSubmissionId" IS NULL) OR ("resumeOrigin" <> 'initial' AND "sourceDecisionId" IS NOT NULL AND "sourceSubmissionId" IS NOT NULL)))),
  CONSTRAINT "m2_version_lifecycle" CHECK (lifecycle IN ('draft','submitted','archived')),
  CONSTRAINT "m2_version_relationship" CHECK ("evidenceRelationship" IN ('unspecified','own_name','cohabitation')),
  CONSTRAINT "m2_version_submission_fields" CHECK ((lifecycle IN ('draft','archived') AND "submittedAt" IS NULL) OR (lifecycle = 'submitted' AND "submittedAt" IS NOT NULL AND "submittedAt" >= "createdAt" AND "developmentId" IS NOT NULL AND "evidenceRelationship" <> 'unspecified'))
);

CREATE TABLE "marleva"."M2MembershipVersionPrivate" (
  "versionId" uuid PRIMARY KEY NOT NULL,
  "applicationId" uuid NOT NULL,
  "accountId" uuid NOT NULL,
  "reviewName" text,
  "privateAddress" text,
  "reconsiderationReason" text,
  "declaredResidenceCurrent" boolean NOT NULL DEFAULT false,
  "purgedAt" timestamptz,
  CONSTRAINT "m2_private_name_length" CHECK ("reviewName" IS NULL OR (char_length("reviewName") BETWEEN 1 AND 200 AND btrim("reviewName") <> '')),
  CONSTRAINT "m2_private_address_length" CHECK ("privateAddress" IS NULL OR (char_length("privateAddress") BETWEEN 1 AND 1000 AND btrim("privateAddress") <> '')),
  CONSTRAINT "m2_private_reconsideration_reason" CHECK ("reconsiderationReason" IS NULL OR (char_length("reconsiderationReason") BETWEEN 1 AND 2000 AND btrim("reconsiderationReason") <> '')),
  CONSTRAINT "m2_private_purge" CHECK ("purgedAt" IS NULL OR ("reviewName" IS NULL AND "privateAddress" IS NULL AND "reconsiderationReason" IS NULL AND "declaredResidenceCurrent" = false))
);

CREATE TABLE "marleva"."M2MembershipDocument" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "applicationId" uuid NOT NULL,
  "accountId" uuid NOT NULL,
  "purpose" text NOT NULL,
  "objectKey" text UNIQUE,
  "claimedMime" text NOT NULL,
  "expectedBytes" integer NOT NULL,
  "actualMime" text,
  "actualBytes" bigint,
  "sha256" text,
  "analysisState" text NOT NULL DEFAULT 'upload_pending',
  "analysisReference" text,
  "uploadExpiresAt" timestamptz NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT (now()),
  "validatedAt" timestamptz,
  "privacyState" text NOT NULL DEFAULT 'active',
  "retentionDecisionId" uuid,
  "retentionStartedAt" timestamptz,
  "deleteAfter" timestamptz,
  "deletedAt" timestamptz,
  "revision" integer NOT NULL DEFAULT 1,
  CONSTRAINT "m2_document_live_object" CHECK ("privacyState" = 'deleted' OR "objectKey" IS NOT NULL),
  CONSTRAINT "m2_document_purged_metadata" CHECK ("privacyState" <> 'deleted' OR ("objectKey" IS NULL AND sha256 IS NULL AND "actualMime" IS NULL AND "actualBytes" IS NULL AND "analysisReference" IS NULL)),
  CONSTRAINT "m2_document_purpose" CHECK (purpose IN ('residence_proof','cohabitation_statement')),
  CONSTRAINT "m2_document_claimed_limits" CHECK ("claimedMime" IN ('application/pdf','image/jpeg','image/png') AND "expectedBytes" BETWEEN 1 AND 5000000),
  CONSTRAINT "m2_document_actual_mime" CHECK ("actualMime" IS NULL OR char_length("actualMime") BETWEEN 1 AND 127),
  CONSTRAINT "m2_document_actual_bytes" CHECK ("actualBytes" IS NULL OR "actualBytes" >= 0),
  CONSTRAINT "m2_document_hash" CHECK (sha256 IS NULL OR sha256 ~ '^[a-f0-9]{64}$'),
  CONSTRAINT "m2_document_analysis_state" CHECK ("analysisState" IN ('upload_pending','analyzing','valid','rejected')),
  CONSTRAINT "m2_document_valid_fields" CHECK ("privacyState" = 'deleted' OR "analysisState" <> 'valid' OR ("actualMime" IS NOT NULL AND "actualBytes" IS NOT NULL AND sha256 IS NOT NULL AND "validatedAt" IS NOT NULL AND "validatedAt" >= "createdAt")),
  CONSTRAINT "m2_document_valid_claim_match" CHECK ("privacyState" = 'deleted' OR "analysisState" <> 'valid' OR ("actualMime" = "claimedMime" AND "actualBytes" = "expectedBytes")),
  CONSTRAINT "m2_document_privacy_state" CHECK ("privacyState" IN ('active','held','delete_pending','deleted')),
  CONSTRAINT "m2_document_deleted_fields" CHECK (("privacyState" = 'deleted') = ("deletedAt" IS NOT NULL) AND ("deletedAt" IS NULL OR "deletedAt" >= "createdAt")),
  CONSTRAINT "m2_document_retention_fields" CHECK (("retentionStartedAt" IS NULL AND "deleteAfter" IS NULL AND "retentionDecisionId" IS NULL) OR ("retentionStartedAt" IS NOT NULL AND "retentionDecisionId" IS NOT NULL AND "deleteAfter" IS NOT NULL AND "deleteAfter" = "retentionStartedAt" + interval '30 days')),
  CONSTRAINT "m2_document_dates_revision" CHECK ("uploadExpiresAt" > "createdAt" AND revision > 0)
);

CREATE TABLE "marleva"."M2MembershipVersionDocument" (
  "versionId" uuid NOT NULL,
  "applicationId" uuid NOT NULL,
  "accountId" uuid NOT NULL,
  "slot" smallint NOT NULL,
  "documentId" uuid NOT NULL,
  "purpose" text NOT NULL,
  "declaredDocumentDate" date,
  CONSTRAINT "m2_version_document_slots" CHECK (slot IN (1,2)),
  CONSTRAINT "m2_version_document_purpose" CHECK (purpose IN ('residence_proof','cohabitation_statement')),
  PRIMARY KEY ("versionId", "slot")
);

CREATE TABLE "marleva"."M2MembershipSubmission" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "applicationId" uuid NOT NULL,
  "accountId" uuid NOT NULL,
  "versionId" uuid UNIQUE NOT NULL,
  "submittedBy" uuid NOT NULL,
  "submittedAt" timestamptz NOT NULL DEFAULT (now()),
  "status" text NOT NULL DEFAULT 'pending',
  "decidedAt" timestamptz,
  "revision" integer NOT NULL DEFAULT 1,
  CONSTRAINT "m2_submission_self" CHECK ("submittedBy" = "accountId"),
  CONSTRAINT "m2_submission_status_revision" CHECK (status IN ('pending','decided') AND revision > 0),
  CONSTRAINT "m2_submission_decision_fields" CHECK ((status = 'pending' AND "decidedAt" IS NULL) OR (status = 'decided' AND "decidedAt" IS NOT NULL AND "decidedAt" >= "submittedAt"))
);

CREATE TABLE "marleva"."M8MembershipReviewGrant" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "accountId" uuid NOT NULL,
  "capability" text NOT NULL,
  "grantedBy" uuid NOT NULL,
  "grantedAt" timestamptz NOT NULL DEFAULT (now()),
  "revokedBy" uuid,
  "revokedAt" timestamptz,
  "reasonCode" text NOT NULL,
  "revision" integer NOT NULL DEFAULT 1,
  CONSTRAINT "m8_membership_grant_capability" CHECK (capability IN ('membership_review','membership_assign','membership_conserve','membership_restrict','seller_review','seller_assign','seller_restrict','seller_conserve')),
  CONSTRAINT "m8_membership_grant_no_self" CHECK ("grantedBy" <> "accountId" AND revision > 0 AND char_length("reasonCode") BETWEEN 1 AND 80),
  CONSTRAINT "m8_membership_grant_revocation" CHECK (("revokedBy" IS NULL AND "revokedAt" IS NULL) OR ("revokedBy" IS NOT NULL AND "revokedAt" IS NOT NULL AND "revokedAt" >= "grantedAt"))
);

CREATE TABLE "marleva"."M8MembershipAssignment" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "submissionId" uuid NOT NULL,
  "applicationId" uuid NOT NULL,
  "accountId" uuid NOT NULL,
  "reviewerId" uuid NOT NULL,
  "reviewerGrantId" uuid NOT NULL,
  "reviewerCapability" text NOT NULL DEFAULT 'membership_review',
  "assignedBy" uuid NOT NULL,
  "managerGrantId" uuid NOT NULL,
  "managerCapability" text NOT NULL DEFAULT 'membership_assign',
  "assignedAt" timestamptz NOT NULL DEFAULT (now()),
  "endedAt" timestamptz,
  "endReason" text,
  "revision" integer NOT NULL DEFAULT 1,
  CONSTRAINT "m8_assignment_no_owner" CHECK ("reviewerId" <> "accountId" AND "assignedBy" <> "accountId"),
  CONSTRAINT "m8_assignment_capabilities" CHECK ("reviewerCapability" = 'membership_review' AND "managerCapability" = 'membership_assign' AND revision > 0),
  CONSTRAINT "m8_assignment_end_fields" CHECK (("endedAt" IS NULL AND "endReason" IS NULL) OR ("endedAt" IS NOT NULL AND "endedAt" >= "assignedAt" AND "endReason" IS NOT NULL AND "endReason" IN ('reassigned','conflict','decided','revoked')))
);

CREATE TABLE "marleva"."M2MembershipDecision" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "submissionId" uuid UNIQUE NOT NULL,
  "applicationId" uuid NOT NULL,
  "accountId" uuid NOT NULL,
  "assignmentId" uuid NOT NULL,
  "reviewerId" uuid NOT NULL,
  "outcome" text NOT NULL,
  "reasonCode" text NOT NULL,
  "decidedAt" timestamptz NOT NULL DEFAULT (now()),
  "finalityState" text NOT NULL DEFAULT 'provisional',
  "finalizedAt" timestamptz,
  CONSTRAINT "m2_decision_no_self" CHECK ("reviewerId" <> "accountId"),
  CONSTRAINT "m2_decision_outcome" CHECK (outcome IN ('approved','correction','rejected')),
  CONSTRAINT "m2_decision_reason" CHECK (char_length("reasonCode") BETWEEN 1 AND 80),
  CONSTRAINT "m2_decision_finality" CHECK ("finalityState" IN ('pending_definition','provisional','final','challenged')),
  CONSTRAINT "m2_decision_finalized_fields" CHECK (("finalityState" = 'final' AND "finalizedAt" IS NOT NULL AND "finalizedAt" >= "decidedAt") OR ("finalityState" IN ('pending_definition','provisional') AND "finalizedAt" IS NULL) OR ("finalityState" = 'challenged' AND ("finalizedAt" IS NULL OR "finalizedAt" >= "decidedAt")))
);

CREATE TABLE "marleva"."M2MembershipDecisionPrivate" (
  "decisionId" uuid PRIMARY KEY NOT NULL,
  "applicationId" uuid NOT NULL,
  "accountId" uuid NOT NULL,
  "visibleReason" text,
  "correctionFields" jsonb NOT NULL DEFAULT ('[]'::jsonb),
  "internalNote" text,
  "purgedAt" timestamptz,
  CONSTRAINT "m2_decision_visible_reason_length" CHECK ("visibleReason" IS NULL OR char_length("visibleReason") BETWEEN 1 AND 1000),
  CONSTRAINT "m2_decision_internal_note_length" CHECK ("internalNote" IS NULL OR char_length("internalNote") BETWEEN 1 AND 2000),
  CONSTRAINT "m2_decision_fields_array" CHECK (jsonb_typeof("correctionFields") = 'array'),
  CONSTRAINT "m2_decision_private_purge" CHECK ("purgedAt" IS NULL OR ("visibleReason" IS NULL AND "internalNote" IS NULL AND "correctionFields" = '[]'::jsonb))
);

CREATE TABLE "marleva"."M2MembershipDocumentAccess" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "documentId" uuid NOT NULL,
  "versionId" uuid NOT NULL,
  "applicationId" uuid NOT NULL,
  "accountId" uuid NOT NULL,
  "accessorId" uuid NOT NULL,
  "sessionId" uuid NOT NULL,
  "submissionId" uuid,
  "assignmentId" uuid,
  "restrictionAssignmentId" uuid,
  "restrictionAppealId" uuid,
  "tokenHash" text UNIQUE NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT (now()),
  "expiresAt" timestamptz NOT NULL,
  "revokedAt" timestamptz,
  CONSTRAINT "m2_access_actor_path" CHECK (("accessorId" = "accountId" AND "assignmentId" IS NULL AND "submissionId" IS NULL AND "restrictionAssignmentId" IS NULL AND "restrictionAppealId" IS NULL) OR ("accessorId" <> "accountId" AND "assignmentId" IS NOT NULL AND "submissionId" IS NOT NULL AND "restrictionAssignmentId" IS NULL AND "restrictionAppealId" IS NULL) OR ("accessorId" <> "accountId" AND "assignmentId" IS NULL AND "submissionId" IS NULL AND "restrictionAssignmentId" IS NOT NULL AND "restrictionAppealId" IS NOT NULL)),
  CONSTRAINT "m2_access_ttl" CHECK ("expiresAt" > "createdAt" AND "expiresAt" <= "createdAt" + interval '5 minutes'),
  CONSTRAINT "m2_access_revoked_date" CHECK ("revokedAt" IS NULL OR "revokedAt" >= "createdAt"),
  CONSTRAINT "m2_access_hash" CHECK ("tokenHash" ~ '^[a-f0-9]{64}$')
);

CREATE TABLE "marleva"."M2MembershipEvent" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "applicationId" uuid NOT NULL,
  "accountId" uuid NOT NULL,
  "submissionId" uuid NOT NULL,
  "decisionId" uuid,
  "eventType" text NOT NULL,
  "recipientId" uuid NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT (now()),
  "deliveredAt" timestamptz,
  CONSTRAINT "m2_event_type_reference" CHECK (( "eventType" = 'membership_submitted' AND "decisionId" IS NULL) OR ("eventType" = 'membership_decided' AND "decisionId" IS NOT NULL)),
  CONSTRAINT "m2_event_delivery_date" CHECK ("deliveredAt" IS NULL OR "deliveredAt" >= "createdAt")
);

CREATE TABLE "marleva"."M2MembershipCommandReceipt" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "actorId" uuid NOT NULL,
  "applicationId" uuid NOT NULL,
  "accountId" uuid NOT NULL,
  "operation" text NOT NULL,
  "keyHash" text NOT NULL,
  "hashKeyId" text NOT NULL,
  "requestHash" text NOT NULL,
  "versionId" uuid,
  "submissionId" uuid,
  "documentId" uuid,
  "documentPurpose" text,
  "assignmentId" uuid,
  "decisionId" uuid,
  "resultRevision" integer NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT (now()),
  "expiresAt" timestamptz NOT NULL,
  CONSTRAINT "m2_receipt_key_id" CHECK (char_length("hashKeyId") BETWEEN 1 AND 80 AND btrim("hashKeyId") <> ''),
  CONSTRAINT "m2_receipt_owner_operations" CHECK (operation IN ('assign_review','decide_membership') OR "actorId" = "accountId"),
  CONSTRAINT "m2_receipt_operation" CHECK (operation IN ('create_application','create_version','save_version','declare_change','reopen_application','request_upload','finalize_upload','link_document','submit_version','assign_review','decide_membership')),
  CONSTRAINT "m2_receipt_hash_revision" CHECK ("keyHash" ~ '^[a-f0-9]{64}$' AND "requestHash" ~ '^[a-f0-9]{64}$' AND "resultRevision" > 0),
  CONSTRAINT "m2_receipt_document_pair" CHECK (("documentId" IS NULL) = ("documentPurpose" IS NULL)),
  CONSTRAINT "m2_receipt_result_shape" CHECK ("versionId" IS NOT NULL AND ((operation IN ('create_application','create_version','save_version','declare_change','reopen_application') AND "documentId" IS NULL AND "submissionId" IS NULL AND "assignmentId" IS NULL AND "decisionId" IS NULL) OR (operation IN ('request_upload','finalize_upload','link_document') AND "documentId" IS NOT NULL AND "submissionId" IS NULL AND "assignmentId" IS NULL AND "decisionId" IS NULL) OR (operation = 'submit_version' AND "submissionId" IS NOT NULL AND "documentId" IS NULL AND "assignmentId" IS NULL AND "decisionId" IS NULL) OR (operation = 'assign_review' AND "submissionId" IS NOT NULL AND "assignmentId" IS NOT NULL AND "documentId" IS NULL AND "decisionId" IS NULL) OR (operation = 'decide_membership' AND "submissionId" IS NOT NULL AND "assignmentId" IS NOT NULL AND "decisionId" IS NOT NULL AND "documentId" IS NULL))),
  CONSTRAINT "m2_receipt_expiry" CHECK ("expiresAt" >= "createdAt" + interval '72 hours')
);

CREATE TABLE "marleva"."M2MembershipRetentionCase" (
  "id" uuid PRIMARY KEY NOT NULL,
  "applicationId" uuid NOT NULL,
  "accountId" uuid NOT NULL,
  "resourceType" text NOT NULL,
  "anchorSellerDecisionId" uuid,
  "anchorRestrictionDecisionId" uuid,
  "anchorDecisionId" uuid,
  "documentId" uuid,
  "documentPurpose" text,
  "versionId" uuid,
  "decisionId" uuid,
  "sellerVersionId" uuid,
  "sellerDecisionId" uuid,
  "restrictionId" uuid,
  "restrictionAppealId" uuid,
  "restrictionDecisionId" uuid,
  "policyVersion" text NOT NULL DEFAULT 'D08-0.2',
  "state" text NOT NULL DEFAULT 'uncalculated',
  "basisCode" text NOT NULL,
  "startedAt" timestamptz,
  "dueAt" timestamptz,
  "completedAt" timestamptz,
  "revision" integer NOT NULL DEFAULT 1,
  CONSTRAINT "m2_retention_single_anchor" CHECK (num_nonnulls("anchorDecisionId","anchorSellerDecisionId","anchorRestrictionDecisionId") <= 1),
  CONSTRAINT "m2_retention_anchor_kind" CHECK (("anchorDecisionId" IS NULL OR "resourceType" IN ('document','version_private','decision_private')) AND ("anchorSellerDecisionId" IS NULL OR "resourceType" IN ('seller_version_private','seller_decision_private')) AND ("anchorRestrictionDecisionId" IS NULL OR "resourceType" IN ('restriction_private','restriction_appeal_private','restriction_decision_private'))),
  CONSTRAINT "m2_retention_typed_target" CHECK (("resourceType" = 'document' AND "documentId" IS NOT NULL AND "versionId" IS NULL AND "decisionId" IS NULL AND "sellerVersionId" IS NULL AND "sellerDecisionId" IS NULL AND "restrictionId" IS NULL AND "restrictionAppealId" IS NULL AND "restrictionDecisionId" IS NULL AND "documentPurpose" IS NOT NULL) OR ("resourceType" = 'version_private' AND "documentId" IS NULL AND "versionId" IS NOT NULL AND "decisionId" IS NULL AND "sellerVersionId" IS NULL AND "sellerDecisionId" IS NULL AND "restrictionId" IS NULL AND "restrictionAppealId" IS NULL AND "restrictionDecisionId" IS NULL AND "documentPurpose" IS NULL) OR ("resourceType" = 'decision_private' AND "documentId" IS NULL AND "versionId" IS NULL AND "decisionId" IS NOT NULL AND "sellerVersionId" IS NULL AND "sellerDecisionId" IS NULL AND "restrictionId" IS NULL AND "restrictionAppealId" IS NULL AND "restrictionDecisionId" IS NULL AND "documentPurpose" IS NULL) OR ("resourceType" = 'seller_version_private' AND "documentId" IS NULL AND "versionId" IS NULL AND "decisionId" IS NULL AND "sellerVersionId" IS NOT NULL AND "sellerDecisionId" IS NULL AND "restrictionId" IS NULL AND "restrictionAppealId" IS NULL AND "restrictionDecisionId" IS NULL AND "documentPurpose" IS NULL) OR ("resourceType" = 'seller_decision_private' AND "documentId" IS NULL AND "versionId" IS NULL AND "decisionId" IS NULL AND "sellerVersionId" IS NULL AND "sellerDecisionId" IS NOT NULL AND "restrictionId" IS NULL AND "restrictionAppealId" IS NULL AND "restrictionDecisionId" IS NULL AND "documentPurpose" IS NULL) OR ("resourceType" = 'restriction_private' AND "documentId" IS NULL AND "versionId" IS NULL AND "decisionId" IS NULL AND "sellerVersionId" IS NULL AND "sellerDecisionId" IS NULL AND "restrictionId" IS NOT NULL AND "restrictionAppealId" IS NULL AND "restrictionDecisionId" IS NULL AND "documentPurpose" IS NULL) OR ("resourceType" = 'restriction_appeal_private' AND "documentId" IS NULL AND "versionId" IS NULL AND "decisionId" IS NULL AND "sellerVersionId" IS NULL AND "sellerDecisionId" IS NULL AND "restrictionId" IS NULL AND "restrictionAppealId" IS NOT NULL AND "restrictionDecisionId" IS NULL AND "documentPurpose" IS NULL) OR ("resourceType" = 'restriction_decision_private' AND "documentId" IS NULL AND "versionId" IS NULL AND "decisionId" IS NULL AND "sellerVersionId" IS NULL AND "sellerDecisionId" IS NULL AND "restrictionId" IS NULL AND "restrictionAppealId" IS NULL AND "restrictionDecisionId" IS NOT NULL AND "documentPurpose" IS NULL)),
  CONSTRAINT "m2_retention_schedule_required" CHECK (state NOT IN ('scheduled','delete_pending','deleted','error') OR ("startedAt" IS NOT NULL AND "dueAt" IS NOT NULL)),
  CONSTRAINT "m2_retention_completion_date" CHECK ("completedAt" IS NULL OR ("dueAt" IS NOT NULL AND "completedAt" >= "dueAt")),
  CONSTRAINT "m2_retention_state" CHECK (state IN ('uncalculated','scheduled','held','delete_pending','deleted','error') AND revision > 0),
  CONSTRAINT "m2_retention_schedule" CHECK (("startedAt" IS NULL AND "dueAt" IS NULL) OR ("startedAt" IS NOT NULL AND "dueAt" IS NOT NULL AND "dueAt" >= "startedAt")),
  CONSTRAINT "m2_retention_completion" CHECK ((state = 'deleted') = ("completedAt" IS NOT NULL)),
  CONSTRAINT "m2_retention_basis" CHECK (char_length("basisCode") BETWEEN 1 AND 80)
);

CREATE TABLE "marleva"."M2MembershipRetentionHold" (
  "id" uuid PRIMARY KEY NOT NULL,
  "caseId" uuid NOT NULL,
  "createdBy" uuid NOT NULL,
  "basisCode" text NOT NULL,
  "caseReference" text NOT NULL,
  "createdAt" timestamptz NOT NULL,
  "reviewAt" timestamptz NOT NULL,
  "releasedAt" timestamptz,
  "releasedBy" uuid,
  "revision" integer NOT NULL DEFAULT 1,
  CONSTRAINT "m2_hold_review" CHECK ("reviewAt" > "createdAt" AND revision > 0),
  CONSTRAINT "m2_hold_release" CHECK (("releasedAt" IS NULL AND "releasedBy" IS NULL) OR ("releasedAt" IS NOT NULL AND "releasedAt" >= "createdAt" AND "releasedBy" IS NOT NULL)),
  CONSTRAINT "m2_hold_basis" CHECK (char_length("basisCode") BETWEEN 1 AND 80 AND char_length("caseReference") BETWEEN 1 AND 120)
);

CREATE TABLE "marleva"."M2MembershipDeletionTask" (
  "id" uuid PRIMARY KEY NOT NULL,
  "caseId" uuid UNIQUE NOT NULL,
  "state" text NOT NULL DEFAULT 'pending',
  "leaseId" uuid,
  "leaseUntil" timestamptz,
  "fence" bigint NOT NULL DEFAULT 0,
  "attempts" integer NOT NULL DEFAULT 0,
  "nextAttemptAt" timestamptz NOT NULL,
  "externalLedgerReference" text,
  "completedAt" timestamptz,
  CONSTRAINT "m2_deletion_running_lease" CHECK ((state = 'running' AND "leaseId" IS NOT NULL AND "leaseUntil" IS NOT NULL) OR (state <> 'running' AND "leaseId" IS NULL AND "leaseUntil" IS NULL)),
  CONSTRAINT "m2_deletion_complete_ledger" CHECK (state <> 'complete' OR "externalLedgerReference" IS NOT NULL),
  CONSTRAINT "m2_deletion_state" CHECK (state IN ('pending','running','retry','complete') AND attempts >= 0 AND fence >= 0),
  CONSTRAINT "m2_deletion_lease" CHECK (("leaseId" IS NULL) = ("leaseUntil" IS NULL)),
  CONSTRAINT "m2_deletion_complete" CHECK ((state = 'complete') = ("completedAt" IS NOT NULL))
);

CREATE TABLE "marleva"."M2MembershipRetentionEvent" (
  "id" uuid PRIMARY KEY NOT NULL,
  "caseId" uuid NOT NULL,
  "actorId" uuid,
  "eventType" text NOT NULL,
  "commandId" uuid UNIQUE,
  "commandKeyId" text,
  "commandHash" text,
  "occurredAt" timestamptz NOT NULL,
  "previousDueAt" timestamptz,
  "resultingDueAt" timestamptz,
  "reference" text NOT NULL,
  CONSTRAINT "m2_retention_command_pair" CHECK (("commandId" IS NULL AND "commandHash" IS NULL AND "commandKeyId" IS NULL) OR ("commandId" IS NOT NULL AND "commandHash" IS NOT NULL AND "commandKeyId" IS NOT NULL AND char_length("commandKeyId") BETWEEN 1 AND 80 AND btrim("commandKeyId") <> '' AND "commandHash" ~ '^[a-f0-9]{64}$' AND "actorId" IS NOT NULL)),
  CONSTRAINT "m2_retention_event_type" CHECK ("eventType" IN ('finalized','challenged','scheduled','held','released','delete_intended','deleted','failed','restored_guard')),
  CONSTRAINT "m2_retention_event_reference" CHECK (char_length(reference) BETWEEN 1 AND 120)
);

CREATE TABLE "marleva"."M2MembershipReplica" (
  "id" uuid PRIMARY KEY NOT NULL,
  "caseId" uuid NOT NULL,
  "replicaReference" text UNIQUE NOT NULL,
  "kind" text NOT NULL,
  "registeredAt" timestamptz NOT NULL,
  "purgeBy" timestamptz NOT NULL,
  "absenceConfirmedAt" timestamptz,
  CONSTRAINT "m2_replica_kind" CHECK (kind IN ('primary','backup','temporary','analysis')),
  CONSTRAINT "m2_replica_dates" CHECK ("purgeBy" >= "registeredAt" AND ("absenceConfirmedAt" IS NULL OR "absenceConfirmedAt" >= "registeredAt"))
);

CREATE TABLE "marleva"."M8MembershipReviewerProfile" (
  "accountId" uuid PRIMARY KEY NOT NULL,
  "operationalLabel" text UNIQUE NOT NULL,
  "enabled" boolean NOT NULL DEFAULT false,
  "revision" integer NOT NULL DEFAULT 1,
  "updatedAt" timestamptz NOT NULL,
  CONSTRAINT "m8_reviewer_label" CHECK ("operationalLabel" ~ '^REV-[A-Z0-9]{6,12}$' AND revision > 0)
);

CREATE TABLE "marleva"."M2SellerProfile" (
  "id" uuid PRIMARY KEY NOT NULL,
  "applicationId" uuid NOT NULL,
  "accountId" uuid NOT NULL,
  "state" text NOT NULL DEFAULT 'draft',
  "revision" integer NOT NULL DEFAULT 1,
  "currentVersionId" uuid,
  "approvedVersionId" uuid,
  "isPaused" boolean NOT NULL DEFAULT false,
  "createdAt" timestamptz NOT NULL,
  "updatedAt" timestamptz NOT NULL,
  CONSTRAINT "m2_seller_state" CHECK (state IN ('draft','pending','correction','enabled','rejected') AND revision > 0),
  CONSTRAINT "m2_seller_dates" CHECK ("updatedAt" >= "createdAt")
);

CREATE TABLE "marleva"."M2SellerVersion" (
  "id" uuid PRIMARY KEY NOT NULL,
  "applicationId" uuid NOT NULL,
  "accountId" uuid NOT NULL,
  "profileId" uuid NOT NULL,
  "number" integer NOT NULL,
  "origin" text NOT NULL,
  "sourceDecisionId" uuid,
  "previousVersionId" uuid,
  "lifecycle" text NOT NULL DEFAULT 'draft',
  "displayName" text,
  "description" text,
  "attentionMode" text,
  "responseMinutes" integer,
  "serviceWindow" text,
  "createdAt" timestamptz NOT NULL,
  "submittedAt" timestamptz,
  CONSTRAINT "m2_seller_version_cycle" CHECK (number > 0 AND origin IN ('initial','correction','reconsideration','material_change') AND lifecycle IN ('draft','submitted')),
  CONSTRAINT "m2_seller_initial" CHECK ((number = 1) = (origin = 'initial') AND ((origin = 'initial' AND "previousVersionId" IS NULL AND "sourceDecisionId" IS NULL) OR (origin <> 'initial' AND "previousVersionId" IS NOT NULL AND "sourceDecisionId" IS NOT NULL))),
  CONSTRAINT "m2_seller_display" CHECK ("displayName" IS NULL OR (char_length("displayName") BETWEEN 1 AND 100 AND btrim("displayName") <> '')),
  CONSTRAINT "m2_seller_description" CHECK (description IS NULL OR char_length(description) BETWEEN 1 AND 1000),
  CONSTRAINT "m2_seller_attention" CHECK ("attentionMode" IS NULL OR "attentionMode" IN ('private_location','customer_location','remote')),
  CONSTRAINT "m2_seller_response" CHECK ("responseMinutes" IS NULL OR "responseMinutes" BETWEEN 1 AND 1440),
  CONSTRAINT "m2_seller_window" CHECK ("serviceWindow" IS NULL OR char_length("serviceWindow") BETWEEN 1 AND 500),
  CONSTRAINT "m2_seller_submitted" CHECK ((lifecycle = 'draft' AND "submittedAt" IS NULL) OR (lifecycle = 'submitted' AND "submittedAt" >= "createdAt" AND "submittedAt" IS NOT NULL AND "displayName" IS NOT NULL AND description IS NOT NULL AND "attentionMode" IS NOT NULL AND "responseMinutes" IS NOT NULL AND "serviceWindow" IS NOT NULL))
);

CREATE TABLE "marleva"."M2SellerVersionPrivate" (
  "versionId" uuid PRIMARY KEY NOT NULL,
  "profileId" uuid NOT NULL,
  "applicationId" uuid NOT NULL,
  "accountId" uuid NOT NULL,
  "legalName" text,
  "contractAddress" text,
  "phone" text,
  "supportHours" text,
  "attentionAddress" text,
  "reconsiderationReason" text,
  "purgedAt" timestamptz,
  CONSTRAINT "m2_seller_private_lengths" CHECK (("legalName" IS NULL OR char_length("legalName") BETWEEN 1 AND 200) AND ("contractAddress" IS NULL OR char_length("contractAddress") BETWEEN 1 AND 1000) AND ("supportHours" IS NULL OR char_length("supportHours") BETWEEN 1 AND 500) AND ("attentionAddress" IS NULL OR char_length("attentionAddress") BETWEEN 1 AND 1000) AND ("reconsiderationReason" IS NULL OR (char_length("reconsiderationReason") BETWEEN 1 AND 2000 AND btrim("reconsiderationReason") <> ''))),
  CONSTRAINT "m2_seller_phone" CHECK (phone IS NULL OR phone ~ '^\+[1-9][0-9]{7,14}$'),
  CONSTRAINT "m2_seller_private_purge" CHECK ("purgedAt" IS NULL OR ("legalName" IS NULL AND "contractAddress" IS NULL AND phone IS NULL AND "supportHours" IS NULL AND "attentionAddress" IS NULL AND "reconsiderationReason" IS NULL))
);

CREATE TABLE "marleva"."M2SellerCoverage" (
  "versionId" uuid NOT NULL,
  "profileId" uuid NOT NULL,
  "applicationId" uuid NOT NULL,
  "accountId" uuid NOT NULL,
  "developmentId" integer NOT NULL,
  CONSTRAINT "m2sellercoverage_value" CHECK ("developmentId" BETWEEN 1 AND 7)
);

CREATE TABLE "marleva"."M2SellerModality" (
  "versionId" uuid NOT NULL,
  "profileId" uuid NOT NULL,
  "applicationId" uuid NOT NULL,
  "accountId" uuid NOT NULL,
  "modality" text NOT NULL,
  CONSTRAINT "m2sellermodality_value" CHECK (modality IN ('delivery','pickup','on_site','remote'))
);

CREATE TABLE "marleva"."M2SellerTermsPolicy" (
  "id" text PRIMARY KEY NOT NULL,
  "purpose" text NOT NULL DEFAULT 'seller_onboarding',
  "state" text NOT NULL DEFAULT 'draft',
  "content" text NOT NULL,
  "contentSha256" text NOT NULL,
  "effectiveAt" timestamptz,
  "retiredAt" timestamptz,
  CONSTRAINT "m2_terms_content" CHECK (char_length(content) BETWEEN 1 AND 12000 AND btrim(content) <> ''),
  CONSTRAINT "m2_seller_terms_state" CHECK (purpose = 'seller_onboarding' AND state IN ('draft','active','retired') AND "contentSha256" ~ '^[a-f0-9]{64}$'),
  CONSTRAINT "m2_seller_terms_active" CHECK (state <> 'active' OR "effectiveAt" IS NOT NULL),
  CONSTRAINT "m2_seller_terms_retired" CHECK ("retiredAt" IS NULL OR ("effectiveAt" IS NOT NULL AND "retiredAt" >= "effectiveAt"))
);

CREATE TABLE "marleva"."M2SellerTermsAcceptance" (
  "versionId" uuid PRIMARY KEY NOT NULL,
  "profileId" uuid NOT NULL,
  "applicationId" uuid NOT NULL,
  "accountId" uuid NOT NULL,
  "policyId" text NOT NULL,
  "policyContentSha256" text NOT NULL,
  "acceptedAt" timestamptz NOT NULL
);

CREATE TABLE "marleva"."M2SellerSubmission" (
  "id" uuid PRIMARY KEY NOT NULL,
  "applicationId" uuid NOT NULL,
  "accountId" uuid NOT NULL,
  "profileId" uuid NOT NULL,
  "versionId" uuid UNIQUE NOT NULL,
  "status" text NOT NULL DEFAULT 'pending',
  "submittedAt" timestamptz NOT NULL,
  "decidedAt" timestamptz,
  "revision" integer NOT NULL DEFAULT 1,
  CONSTRAINT "m2_seller_submission_state" CHECK (status IN ('pending','decided') AND revision > 0 AND ((status = 'pending' AND "decidedAt" IS NULL) OR (status = 'decided' AND "decidedAt" IS NOT NULL AND "decidedAt" >= "submittedAt")))
);

CREATE TABLE "marleva"."M8SellerAssignment" (
  "id" uuid PRIMARY KEY NOT NULL,
  "applicationId" uuid NOT NULL,
  "accountId" uuid NOT NULL,
  "profileId" uuid NOT NULL,
  "submissionId" uuid NOT NULL,
  "reviewerId" uuid NOT NULL,
  "reviewerGrantId" uuid NOT NULL,
  "reviewerCapability" text NOT NULL DEFAULT 'seller_review',
  "assignedBy" uuid NOT NULL,
  "managerGrantId" uuid NOT NULL,
  "managerCapability" text NOT NULL DEFAULT 'seller_assign',
  "assignedAt" timestamptz NOT NULL,
  "endedAt" timestamptz,
  "endReason" text,
  "revision" integer NOT NULL DEFAULT 1,
  CONSTRAINT "m8_seller_assignment_actor" CHECK ("reviewerId" <> "accountId" AND "assignedBy" <> "accountId" AND revision > 0),
  CONSTRAINT "m8_seller_assignment_caps" CHECK ("reviewerCapability" = 'seller_review' AND "managerCapability" = 'seller_assign'),
  CONSTRAINT "m8_seller_assignment_end" CHECK (("endedAt" IS NULL AND "endReason" IS NULL) OR ("endedAt" IS NOT NULL AND "endedAt" >= "assignedAt" AND "endReason" IN ('reassigned','conflict','decided','revoked')))
);

CREATE TABLE "marleva"."M2SellerDecision" (
  "id" uuid PRIMARY KEY NOT NULL,
  "applicationId" uuid NOT NULL,
  "accountId" uuid NOT NULL,
  "profileId" uuid NOT NULL,
  "submissionId" uuid UNIQUE NOT NULL,
  "assignmentId" uuid NOT NULL,
  "reviewerId" uuid NOT NULL,
  "outcome" text NOT NULL,
  "reasonCode" text NOT NULL,
  "decidedAt" timestamptz NOT NULL,
  "finalityState" text NOT NULL DEFAULT 'provisional',
  "finalizedAt" timestamptz,
  CONSTRAINT "m2_seller_decision_criterion" CHECK ((outcome = 'enabled' AND "reasonCode" = 'approved_seller') OR (outcome <> 'enabled' AND "reasonCode" IN ('incomplete_contract','invalid_coverage','invalid_modality','membership_not_eligible','terms_not_active','inconsistent_data','other_noncompliant'))),
  CONSTRAINT "m2_seller_decision_outcome" CHECK (outcome IN ('enabled','correction','rejected') AND "reviewerId" <> "accountId" AND char_length("reasonCode") BETWEEN 1 AND 80),
  CONSTRAINT "m2_seller_decision_finality" CHECK ("finalityState" IN ('provisional','final','challenged') AND (("finalityState" = 'provisional' AND "finalizedAt" IS NULL) OR ("finalityState" = 'final' AND "finalizedAt" IS NOT NULL AND "finalizedAt" >= "decidedAt") OR ("finalityState" = 'challenged' AND ("finalizedAt" IS NULL OR "finalizedAt" >= "decidedAt"))))
);

CREATE TABLE "marleva"."M2SellerDecisionPrivate" (
  "decisionId" uuid PRIMARY KEY NOT NULL,
  "profileId" uuid NOT NULL,
  "applicationId" uuid NOT NULL,
  "accountId" uuid NOT NULL,
  "visibleReason" text,
  "correctionFields" jsonb NOT NULL DEFAULT ('[]'::jsonb),
  "internalNote" text,
  "purgedAt" timestamptz,
  CONSTRAINT "m2sellerdecisionprivate_required" CHECK ("purgedAt" IS NOT NULL OR ("visibleReason" IS NOT NULL AND btrim("visibleReason") <> '')),
  CONSTRAINT "m2_seller_decision_text" CHECK (("visibleReason" IS NULL OR char_length("visibleReason") BETWEEN 1 AND 1000) AND ("internalNote" IS NULL OR char_length("internalNote") BETWEEN 1 AND 2000) AND jsonb_typeof("correctionFields") = 'array'),
  CONSTRAINT "m2_seller_decision_purge" CHECK ("purgedAt" IS NULL OR ("visibleReason" IS NULL AND "internalNote" IS NULL AND "correctionFields" = '[]'::jsonb))
);

CREATE TABLE "marleva"."M2Restriction" (
  "id" uuid PRIMARY KEY NOT NULL,
  "applicationId" uuid NOT NULL,
  "accountId" uuid NOT NULL,
  "profileId" uuid,
  "targetKind" text NOT NULL,
  "scope" text NOT NULL,
  "state" text NOT NULL DEFAULT 'active',
  "reasonCode" text NOT NULL,
  "createdBy" uuid NOT NULL,
  "createdAt" timestamptz NOT NULL,
  "liftedAt" timestamptz,
  "revision" integer NOT NULL DEFAULT 1,
  CONSTRAINT "m2_restriction_target" CHECK (("targetKind" = 'membership' AND "profileId" IS NULL AND scope IN ('buy','offer','both')) OR ("targetKind" = 'seller' AND "profileId" IS NOT NULL AND scope = 'offer')),
  CONSTRAINT "m2_restriction_state" CHECK ("createdBy" <> "accountId" AND revision > 0 AND ((state = 'active' AND "liftedAt" IS NULL) OR (state = 'lifted' AND "liftedAt" IS NOT NULL AND "liftedAt" >= "createdAt")))
);

CREATE TABLE "marleva"."M2RestrictionPrivate" (
  "restrictionId" uuid PRIMARY KEY NOT NULL,
  "applicationId" uuid NOT NULL,
  "accountId" uuid NOT NULL,
  "visibleReason" text,
  "internalNote" text,
  "purgedAt" timestamptz,
  CONSTRAINT "m2restrictionprivate_required" CHECK ("purgedAt" IS NOT NULL OR ("visibleReason" IS NOT NULL AND btrim("visibleReason") <> '')),
  CONSTRAINT "m2_restriction_private_bounds" CHECK (("visibleReason" IS NULL OR char_length("visibleReason") BETWEEN 1 AND 1000) AND ("internalNote" IS NULL OR char_length("internalNote") BETWEEN 1 AND 2000)),
  CONSTRAINT "m2_restriction_private_purge" CHECK ("purgedAt" IS NULL OR ("visibleReason" IS NULL AND "internalNote" IS NULL))
);

CREATE TABLE "marleva"."M2RestrictionAppeal" (
  "id" uuid PRIMARY KEY NOT NULL,
  "applicationId" uuid NOT NULL,
  "accountId" uuid NOT NULL,
  "restrictionId" uuid NOT NULL,
  "evidenceVersionId" uuid,
  "state" text NOT NULL DEFAULT 'draft',
  "revision" integer NOT NULL DEFAULT 1,
  "createdAt" timestamptz NOT NULL,
  "submittedAt" timestamptz,
  "decidedAt" timestamptz,
  CONSTRAINT "m2_restriction_appeal_state" CHECK (state IN ('draft','pending','decided') AND revision > 0 AND ((state = 'draft' AND "submittedAt" IS NULL AND "decidedAt" IS NULL) OR (state = 'pending' AND "submittedAt" IS NOT NULL AND "decidedAt" IS NULL) OR (state = 'decided' AND "submittedAt" IS NOT NULL AND "decidedAt" >= "submittedAt" AND "decidedAt" IS NOT NULL)))
);

CREATE TABLE "marleva"."M2RestrictionAppealPrivate" (
  "appealId" uuid PRIMARY KEY NOT NULL,
  "applicationId" uuid NOT NULL,
  "accountId" uuid NOT NULL,
  "reason" text,
  "purgedAt" timestamptz,
  CONSTRAINT "m2_restriction_appeal_required" CHECK ("purgedAt" IS NOT NULL OR reason IS NOT NULL),
  CONSTRAINT "m2_restriction_appeal_reason" CHECK (reason IS NULL OR (char_length(reason) BETWEEN 1 AND 2000 AND btrim(reason) <> '')),
  CONSTRAINT "m2_restriction_appeal_purge" CHECK ("purgedAt" IS NULL OR reason IS NULL)
);

CREATE TABLE "marleva"."M8RestrictionAssignment" (
  "id" uuid PRIMARY KEY NOT NULL,
  "applicationId" uuid NOT NULL,
  "accountId" uuid NOT NULL,
  "restrictionId" uuid NOT NULL,
  "appealId" uuid NOT NULL,
  "reviewerId" uuid NOT NULL,
  "reviewerGrantId" uuid NOT NULL,
  "reviewerCapability" text NOT NULL,
  "assignedBy" uuid NOT NULL,
  "managerGrantId" uuid NOT NULL,
  "managerCapability" text NOT NULL,
  "assignedAt" timestamptz NOT NULL,
  "endedAt" timestamptz,
  "endReason" text,
  "revision" integer NOT NULL DEFAULT 1,
  CONSTRAINT "m8_restriction_assignment_no_self" CHECK ("reviewerId" <> "accountId" AND "assignedBy" <> "accountId" AND revision > 0),
  CONSTRAINT "m8_restriction_assignment_scope" CHECK (("reviewerCapability" = 'membership_restrict' AND "managerCapability" = 'membership_assign') OR ("reviewerCapability" = 'seller_restrict' AND "managerCapability" = 'seller_assign')),
  CONSTRAINT "m8_restriction_assignment_end" CHECK (("endedAt" IS NULL AND "endReason" IS NULL) OR ("endedAt" IS NOT NULL AND "endedAt" >= "assignedAt" AND "endReason" IN ('reassigned','conflict','decided','revoked')))
);

CREATE TABLE "marleva"."M2RestrictionDecision" (
  "id" uuid PRIMARY KEY NOT NULL,
  "applicationId" uuid NOT NULL,
  "accountId" uuid NOT NULL,
  "restrictionId" uuid NOT NULL,
  "appealId" uuid UNIQUE NOT NULL,
  "assignmentId" uuid NOT NULL,
  "reviewerId" uuid NOT NULL,
  "outcome" text NOT NULL,
  "reasonCode" text NOT NULL,
  "decidedAt" timestamptz NOT NULL,
  "finalityState" text NOT NULL DEFAULT 'provisional',
  "finalizedAt" timestamptz,
  CONSTRAINT "m2_restriction_decision_finality" CHECK ("finalityState" IN ('provisional','final','challenged') AND (("finalityState" = 'provisional' AND "finalizedAt" IS NULL) OR ("finalityState" = 'final' AND "finalizedAt" IS NOT NULL AND "finalizedAt" >= "decidedAt") OR ("finalityState" = 'challenged' AND ("finalizedAt" IS NULL OR "finalizedAt" >= "decidedAt")))),
  CONSTRAINT "m2_restriction_decision" CHECK (outcome IN ('lift','maintain') AND "reviewerId" <> "accountId" AND char_length("reasonCode") BETWEEN 1 AND 80)
);

CREATE TABLE "marleva"."M2RestrictionDecisionPrivate" (
  "decisionId" uuid PRIMARY KEY NOT NULL,
  "applicationId" uuid NOT NULL,
  "accountId" uuid NOT NULL,
  "visibleReason" text,
  "internalNote" text,
  "purgedAt" timestamptz,
  CONSTRAINT "m2restrictiondecisionprivate_required" CHECK ("purgedAt" IS NOT NULL OR ("visibleReason" IS NOT NULL AND btrim("visibleReason") <> '')),
  CONSTRAINT "m2_restriction_decision_private_bounds" CHECK (("visibleReason" IS NULL OR char_length("visibleReason") BETWEEN 1 AND 1000) AND ("internalNote" IS NULL OR char_length("internalNote") BETWEEN 1 AND 2000)),
  CONSTRAINT "m2_restriction_decision_private_purge" CHECK ("purgedAt" IS NULL OR ("visibleReason" IS NULL AND "internalNote" IS NULL))
);

CREATE TABLE "marleva"."M2RestrictionEvidenceLink" (
  "appealId" uuid NOT NULL,
  "versionId" uuid NOT NULL,
  "documentId" uuid NOT NULL,
  "applicationId" uuid NOT NULL,
  "accountId" uuid NOT NULL
);

CREATE TABLE "marleva"."M2MembershipArchiveNotice" (
  "id" uuid PRIMARY KEY NOT NULL,
  "applicationId" uuid NOT NULL,
  "accountId" uuid NOT NULL,
  "versionId" uuid NOT NULL,
  "observedRevision" integer NOT NULL,
  "observedActivityAt" timestamptz NOT NULL,
  "createdAt" timestamptz NOT NULL,
  "noticedAt" timestamptz,
  "archiveAt" timestamptz,
  "processedAt" timestamptz,
  "state" text NOT NULL DEFAULT 'pending_notice',
  CONSTRAINT "m2_archive_notice_dates" CHECK (("noticedAt" IS NULL OR "noticedAt" >= "createdAt") AND (state NOT IN ('grace','archived') OR "noticedAt" IS NOT NULL) AND ((state IN ('archived','cancelled') AND "processedAt" IS NOT NULL AND "processedAt" >= "createdAt") OR (state IN ('pending_notice','grace') AND "processedAt" IS NULL))),
  CONSTRAINT "m2_archive_notice_state" CHECK (state IN ('pending_notice','grace','archived','cancelled') AND "observedRevision" > 0),
  CONSTRAINT "m2_archive_notice_grace" CHECK (("noticedAt" IS NULL AND "archiveAt" IS NULL) OR ("noticedAt" IS NOT NULL AND "archiveAt" = "noticedAt" + interval '7 days'))
);

CREATE TABLE "marleva"."M2CommunityEvent" (
  "id" uuid PRIMARY KEY NOT NULL,
  "applicationId" uuid NOT NULL,
  "accountId" uuid NOT NULL,
  "profileId" uuid,
  "restrictionId" uuid,
  "eventType" text NOT NULL,
  "recipientId" uuid NOT NULL,
  "createdAt" timestamptz NOT NULL,
  "acceptedAt" timestamptz,
  "consumerReference" text,
  CONSTRAINT "m2_community_event_typed" CHECK (("eventType" NOT IN ('seller_submitted','seller_decided','seller_paused','seller_resumed') OR "profileId" IS NOT NULL) AND ("eventType" NOT IN ('restriction_created','restriction_appealed','restriction_decided') OR "restrictionId" IS NOT NULL)),
  CONSTRAINT "m2_community_event_recipient_owner" CHECK ("recipientId" = "accountId"),
  CONSTRAINT "m2_community_event_type" CHECK ("eventType" IN ('residence_changed','archive_warning','membership_archived','membership_reopened','seller_submitted','seller_decided','seller_paused','seller_resumed','restriction_created','restriction_appealed','restriction_decided')),
  CONSTRAINT "m2_community_event_ack" CHECK (("acceptedAt" IS NULL AND "consumerReference" IS NULL) OR ("acceptedAt" IS NOT NULL AND "acceptedAt" >= "createdAt" AND "consumerReference" IS NOT NULL))
);

CREATE TABLE "marleva"."M2CommunityCommandReceipt" (
  "id" uuid PRIMARY KEY NOT NULL,
  "applicationId" uuid NOT NULL,
  "accountId" uuid NOT NULL,
  "actorId" uuid NOT NULL,
  "profileId" uuid,
  "restrictionId" uuid,
  "appealId" uuid,
  "versionId" uuid,
  "submissionId" uuid,
  "assignmentId" uuid,
  "decisionId" uuid,
  "restrictionAssignmentId" uuid,
  "restrictionDecisionId" uuid,
  "operation" text NOT NULL,
  "keyHash" text NOT NULL,
  "requestHash" text NOT NULL,
  "hashKeyId" text NOT NULL,
  "resultRevision" integer NOT NULL,
  "createdAt" timestamptz NOT NULL,
  "expiresAt" timestamptz NOT NULL,
  CONSTRAINT "m2_community_receipt_result_shape" CHECK (("operation" NOT IN ('create_seller','save_seller','prepare_seller','submit_seller','pause_seller','resume_seller') OR "versionId" IS NOT NULL) AND ("operation" NOT IN ('submit_seller','assign_seller','decide_seller') OR "submissionId" IS NOT NULL) AND ("operation" NOT IN ('assign_seller','decide_seller') OR "assignmentId" IS NOT NULL) AND ("operation" <> 'decide_seller' OR "decisionId" IS NOT NULL) AND ("operation" NOT IN ('create_appeal','save_appeal','submit_appeal','assign_restriction','decide_restriction') OR "appealId" IS NOT NULL) AND ("operation" NOT IN ('assign_restriction','decide_restriction') OR "restrictionAssignmentId" IS NOT NULL) AND ("operation" <> 'decide_restriction' OR "restrictionDecisionId" IS NOT NULL)),
  CONSTRAINT "m2_community_receipt_target" CHECK ((operation IN ('create_seller','save_seller','prepare_seller','submit_seller','pause_seller','resume_seller','assign_seller','decide_seller') AND "profileId" IS NOT NULL AND "restrictionId" IS NULL AND "appealId" IS NULL AND "restrictionAssignmentId" IS NULL AND "restrictionDecisionId" IS NULL) OR (operation IN ('create_restriction','create_appeal','save_appeal','submit_appeal','assign_restriction','decide_restriction') AND "restrictionId" IS NOT NULL AND "versionId" IS NULL AND "submissionId" IS NULL AND "assignmentId" IS NULL AND "decisionId" IS NULL)),
  CONSTRAINT "m2_community_receipt_operation" CHECK (operation IN ('create_seller','save_seller','prepare_seller','submit_seller','pause_seller','resume_seller','assign_seller','decide_seller','create_restriction','create_appeal','save_appeal','submit_appeal','assign_restriction','decide_restriction')),
  CONSTRAINT "m2_community_receipt_hash" CHECK ("keyHash" ~ '^[a-f0-9]{64}$' AND "requestHash" ~ '^[a-f0-9]{64}$' AND char_length("hashKeyId") BETWEEN 1 AND 80 AND "resultRevision" > 0 AND "expiresAt" >= "createdAt" + interval '72 hours')
);

CREATE UNIQUE INDEX "m2_application_owner_key" ON "marleva"."M2MembershipApplication" ("id", "accountId");

CREATE INDEX "m2_application_queue_idx" ON "marleva"."M2MembershipApplication" ("state", "updatedAt", "id");

CREATE UNIQUE INDEX "m2_version_owner_key" ON "marleva"."M2MembershipVersion" ("id", "applicationId", "accountId");

CREATE UNIQUE INDEX "m2_version_number_key" ON "marleva"."M2MembershipVersion" ("applicationId", "number");

CREATE UNIQUE INDEX "m2_document_owner_purpose_key" ON "marleva"."M2MembershipDocument" ("id", "applicationId", "accountId", "purpose");

CREATE INDEX "m2_document_retention_idx" ON "marleva"."M2MembershipDocument" ("privacyState", "deleteAfter", "id");

CREATE UNIQUE INDEX "m2_version_document_purpose_key" ON "marleva"."M2MembershipVersionDocument" ("versionId", "purpose");

CREATE UNIQUE INDEX "m2_version_document_access_key" ON "marleva"."M2MembershipVersionDocument" ("versionId", "documentId", "applicationId", "accountId");

CREATE UNIQUE INDEX "m2_submission_owner_key" ON "marleva"."M2MembershipSubmission" ("id", "applicationId", "accountId");

CREATE UNIQUE INDEX "m2_submission_version_key" ON "marleva"."M2MembershipSubmission" ("id", "versionId", "applicationId", "accountId");

CREATE INDEX "m2_submission_queue_idx" ON "marleva"."M2MembershipSubmission" ("status", "submittedAt", "id");

CREATE UNIQUE INDEX "m8_membership_grant_identity_key" ON "marleva"."M8MembershipReviewGrant" ("id", "accountId", "capability");

CREATE UNIQUE INDEX "m8_assignment_decision_key" ON "marleva"."M8MembershipAssignment" ("id", "submissionId", "applicationId", "accountId", "reviewerId");

CREATE UNIQUE INDEX "m8_assignment_receipt_key" ON "marleva"."M8MembershipAssignment" ("id", "submissionId", "applicationId", "accountId");

CREATE INDEX "m8_assignment_queue_idx" ON "marleva"."M8MembershipAssignment" ("reviewerId", "endedAt", "assignedAt", "id");

CREATE UNIQUE INDEX "m2_decision_owner_key" ON "marleva"."M2MembershipDecision" ("id", "applicationId", "accountId");

CREATE UNIQUE INDEX "m2_decision_submission_key" ON "marleva"."M2MembershipDecision" ("id", "submissionId", "applicationId", "accountId");

CREATE UNIQUE INDEX "m2_decision_receipt_actor_key" ON "marleva"."M2MembershipDecision" ("id", "assignmentId", "submissionId", "applicationId", "accountId", "reviewerId");

CREATE INDEX "m2_document_access_expiry_idx" ON "marleva"."M2MembershipDocumentAccess" ("documentId", "expiresAt");

CREATE UNIQUE INDEX "m2_event_once_key" ON "marleva"."M2MembershipEvent" ("eventType", "submissionId", "recipientId");

CREATE INDEX "m2_event_pending_idx" ON "marleva"."M2MembershipEvent" ("deliveredAt", "createdAt", "id");

CREATE UNIQUE INDEX "m2_receipt_key" ON "marleva"."M2MembershipCommandReceipt" ("actorId", "operation", "keyHash");

CREATE UNIQUE INDEX "m2_retention_owner_key" ON "marleva"."M2MembershipRetentionCase" ("id", "applicationId", "accountId");

CREATE UNIQUE INDEX "m2_retention_document_key" ON "marleva"."M2MembershipRetentionCase" ("documentId");

CREATE UNIQUE INDEX "m2_retention_version_key" ON "marleva"."M2MembershipRetentionCase" ("versionId");

CREATE UNIQUE INDEX "m2_retention_decision_key" ON "marleva"."M2MembershipRetentionCase" ("decisionId");

CREATE UNIQUE INDEX "m2_case_sellerversionid_key" ON "marleva"."M2MembershipRetentionCase" ("sellerVersionId");

CREATE UNIQUE INDEX "m2_case_sellerdecisionid_key" ON "marleva"."M2MembershipRetentionCase" ("sellerDecisionId");

CREATE UNIQUE INDEX "m2_case_restrictionid_key" ON "marleva"."M2MembershipRetentionCase" ("restrictionId");

CREATE UNIQUE INDEX "m2_case_restrictionappealid_key" ON "marleva"."M2MembershipRetentionCase" ("restrictionAppealId");

CREATE UNIQUE INDEX "m2_case_restrictiondecisionid_key" ON "marleva"."M2MembershipRetentionCase" ("restrictionDecisionId");

CREATE INDEX "m2_retention_due_idx" ON "marleva"."M2MembershipRetentionCase" ("state", "dueAt", "id");

CREATE INDEX "m2_hold_active_idx" ON "marleva"."M2MembershipRetentionHold" ("caseId", "releasedAt", "reviewAt");

CREATE INDEX "m2_deletion_due_idx" ON "marleva"."M2MembershipDeletionTask" ("state", "nextAttemptAt", "id");

CREATE INDEX "m2_retention_event_order_idx" ON "marleva"."M2MembershipRetentionEvent" ("caseId", "occurredAt", "id");

CREATE INDEX "m2_replica_case_idx" ON "marleva"."M2MembershipReplica" ("caseId", "absenceConfirmedAt");

CREATE UNIQUE INDEX "m2sellerprofile_owner" ON "marleva"."M2SellerProfile" ("id", "applicationId", "accountId");

CREATE UNIQUE INDEX "m2_one_seller_per_account" ON "marleva"."M2SellerProfile" ("accountId");

CREATE UNIQUE INDEX "m2sellerversion_owner" ON "marleva"."M2SellerVersion" ("id", "applicationId", "accountId");

CREATE UNIQUE INDEX "m2_seller_version_profile_key" ON "marleva"."M2SellerVersion" ("id", "profileId", "applicationId", "accountId");

CREATE UNIQUE INDEX "m2_seller_number" ON "marleva"."M2SellerVersion" ("profileId", "number");

CREATE UNIQUE INDEX "m2sellercoverage_key" ON "marleva"."M2SellerCoverage" ("versionId", "developmentId");

CREATE UNIQUE INDEX "m2sellermodality_key" ON "marleva"."M2SellerModality" ("versionId", "modality");

CREATE UNIQUE INDEX "m2_terms_version_hash" ON "marleva"."M2SellerTermsPolicy" ("id", "contentSha256");

CREATE UNIQUE INDEX "m2sellersubmission_owner" ON "marleva"."M2SellerSubmission" ("id", "applicationId", "accountId");

CREATE UNIQUE INDEX "m2_seller_submission_profile" ON "marleva"."M2SellerSubmission" ("id", "profileId", "applicationId", "accountId");

CREATE UNIQUE INDEX "m8_seller_assignment_receipt" ON "marleva"."M8SellerAssignment" ("id", "submissionId", "profileId", "applicationId", "accountId");

CREATE UNIQUE INDEX "m8sellerassignment_owner" ON "marleva"."M8SellerAssignment" ("id", "applicationId", "accountId");

CREATE UNIQUE INDEX "m8_seller_assignment_decision" ON "marleva"."M8SellerAssignment" ("id", "submissionId", "profileId", "applicationId", "accountId", "reviewerId");

CREATE UNIQUE INDEX "m2_seller_decision_receipt" ON "marleva"."M2SellerDecision" ("id", "submissionId", "assignmentId", "profileId", "applicationId", "accountId");

CREATE UNIQUE INDEX "m2sellerdecision_owner" ON "marleva"."M2SellerDecision" ("id", "applicationId", "accountId");

CREATE UNIQUE INDEX "m2_seller_decision_profile" ON "marleva"."M2SellerDecision" ("id", "profileId", "applicationId", "accountId");

CREATE UNIQUE INDEX "m2restriction_owner" ON "marleva"."M2Restriction" ("id", "applicationId", "accountId");

CREATE UNIQUE INDEX "m2restrictionappeal_owner" ON "marleva"."M2RestrictionAppeal" ("id", "applicationId", "accountId");

CREATE UNIQUE INDEX "m2_restriction_appeal_target" ON "marleva"."M2RestrictionAppeal" ("id", "restrictionId", "applicationId", "accountId");

CREATE UNIQUE INDEX "m8_restriction_assignment_receipt" ON "marleva"."M8RestrictionAssignment" ("id", "appealId", "applicationId", "accountId");

CREATE UNIQUE INDEX "m8restrictionassignment_owner" ON "marleva"."M8RestrictionAssignment" ("id", "applicationId", "accountId");

CREATE UNIQUE INDEX "m8_restriction_assignment_decision" ON "marleva"."M8RestrictionAssignment" ("id", "appealId", "restrictionId", "applicationId", "accountId", "reviewerId");

CREATE UNIQUE INDEX "m8_restriction_assignment_access" ON "marleva"."M8RestrictionAssignment" ("id", "appealId", "applicationId", "accountId", "reviewerId");

CREATE UNIQUE INDEX "m2_restr_decision_receipt" ON "marleva"."M2RestrictionDecision" ("id", "appealId", "restrictionId", "applicationId", "accountId");

CREATE UNIQUE INDEX "m2restrictiondecision_owner" ON "marleva"."M2RestrictionDecision" ("id", "applicationId", "accountId");

CREATE UNIQUE INDEX "m2_restriction_evidence_key" ON "marleva"."M2RestrictionEvidenceLink" ("appealId", "versionId", "documentId", "applicationId", "accountId");

CREATE UNIQUE INDEX "m2membershiparchivenotice_owner" ON "marleva"."M2MembershipArchiveNotice" ("id", "applicationId", "accountId");

CREATE UNIQUE INDEX "m2_archive_notice_once" ON "marleva"."M2MembershipArchiveNotice" ("applicationId", "observedRevision");

CREATE UNIQUE INDEX "m2communityevent_owner" ON "marleva"."M2CommunityEvent" ("id", "applicationId", "accountId");

CREATE UNIQUE INDEX "m2communitycommandreceipt_owner" ON "marleva"."M2CommunityCommandReceipt" ("id", "applicationId", "accountId");

CREATE UNIQUE INDEX "m2_community_receipt_once" ON "marleva"."M2CommunityCommandReceipt" ("actorId", "operation", "keyHash");

COMMENT ON TABLE "marleva"."M2MembershipApplication" IS 'M2 UC001/003. Un expediente por cuenta; revision es CAS, no número de evidencia. eligibilityRevision serializa cambios de permisos propios. Restricciones independientes del estado base.';

COMMENT ON COLUMN "marleva"."M2MembershipApplication"."currentVersionId" IS 'Nulo solo durante creación atómica, antes de guardar primera versión.';

COMMENT ON TABLE "marleva"."M2MembershipVersion" IS 'Envío congela esta versión y sus enlaces. Solo borrador editable. Nuevo envío exige nueva versión. Un índice parcial complementario limita a un borrador por expediente. origin y sourceDecisionId/sourceSubmissionId conservan el antecedente exacto del mismo titular. No editar la version/decision enviada anterior. Estado/origen, decision mas reciente y numero siguiente requieren transaccion T12.';

COMMENT ON TABLE "marleva"."M2MembershipVersionPrivate" IS 'Datos privados fuera del registro mínimo. Nullable admite borrador incompleto y futura supresión con motivo autorizado. No guardar copia privada en JSON de evento/recibo/decisión. Motivo privado de reconsideracion separado del historial minimo; obligatorio solo para origin reconsideration por transaccion. Calendario propuesto D08 v0.2 por finalidad, no activado; ver CONSERVACION_REVISORES_D08_D09.md.';

COMMENT ON TABLE "marleva"."M2MembershipDocument" IS 'Objeto nuevo por carga; no sobrescribir bytes de evidencia enviada. El tipo/tamaño observado puede registrar un rechazo; solo valid exige coincidencia con lo permitido y declarado. Válido técnico no significa residencia aprobada. Estados derivados del caso de conservación y sus bloqueos/tareas. Columnas retention* son proyección C14 de decisión final; el caso es fuente del vencimiento efectivo, también para huérfanos. Una referencia técnica histórica no retiene bytes. Política propuesta, no activada.';

COMMENT ON COLUMN "marleva"."M2MembershipDocument"."objectKey" IS 'Referencia opaca sin nombre, correo o dirección en ruta; bucket privado, nunca URL pública.';

COMMENT ON COLUMN "marleva"."M2MembershipDocument"."analysisReference" IS 'Referencia idempotente a análisis, no contenido ni secreto.';

COMMENT ON TABLE "marleva"."M2MembershipVersionDocument" IS 'Como máximo dos vínculos por versión y uno por finalidad. Fecha declarada, revisada sobre el contenido; tres meses se evalúan con hora del servidor/fecha de envío en America/Merida, no con CHECK current_date mutable. Inmutabilidad después de envío y presencia de comprobante son reglas de transacción pendientes.';

COMMENT ON TABLE "marleva"."M2MembershipSubmission" IS 'Un recibo por versión enviada; índice parcial de pendiente por expediente. Reenvío tras corrección conserva expediente y crea versión/envío nuevos. Reconsideraciones y restricciones completas aún pendientes.';

COMMENT ON TABLE "marleva"."M8MembershipReviewGrant" IS 'Capacidad específica M8, sin alterar RoleKey/Account.operator M1. Una activa por persona/capacidad vía índice parcial. Modelo de datos de autorización, no endpoint de gestión o bootstrap implementado. Cadena de otorgamiento y permiso vigente del otorgante requieren diseño posterior.';

COMMENT ON TABLE "marleva"."M8MembershipAssignment" IS 'Una asignación activa por envío, índice parcial. Registra concesiones concretas; deben seguir vigentes al leer/decidir. Gestor no asigna su propio expediente. Conflictos adicionales declarados se registran con endReason conflict; no exponer detalles privados.';

COMMENT ON COLUMN "marleva"."M8MembershipAssignment"."accountId" IS 'Titular del expediente, no revisor.';

COMMENT ON TABLE "marleva"."M2MembershipDecision" IS 'Resultado mínimo ligado a envío/asignación/revisor exactos, uno por envío. Finalidad no se deriva automáticamente de approved/rejected. Registro mínimo y finality todavía no son calendario jurídico completo; impugnación después de final requiere historial/bloqueo posterior.';

COMMENT ON TABLE "marleva"."M2MembershipDecisionPrivate" IS 'Texto sensible fuera del mínimo de decisión, con supresión controlada posterior. Proyección del titular excluye internalNote. Calendario propuesto D08 v0.2, no activado; textos privados separados del mínimo.';

COMMENT ON COLUMN "marleva"."M2MembershipDecisionPrivate"."correctionFields" IS 'Array de nombres de campo permitidos; sin valores de domicilio o documentos. Esquema cerrado del API pendiente.';

COMMENT ON TABLE "marleva"."M2MembershipDocumentAccess" IS 'Permiso temporal de lectura mediada, no URL pública. Compuesto vincula sesión del actor y documento de versión exacta. Revalidar sesión, rol/asignación, estado de privacidad y finalidad al leer y antes de responder. No garantiza revocación de bytes ya entregados; no reemplaza controles M1.';

COMMENT ON TABLE "marleva"."M2MembershipEvent" IS 'Evento durable sin domicilio/correo/documento/textos privados. Se guarda en misma transacción. deliveredAt significa acuse de consumidor idempotente, no correo recibido. Puente a avisos/worker pendiente; no escribir Notice/Outbox de M1 directamente.';

COMMENT ON TABLE "marleva"."M2MembershipCommandReceipt" IS 'Recibo mínimo con referencias tipadas, sin copia de datos privados. Replay reautoriza actor/recurso y devuelve recibo original; recurso actual se consulta por separado. Misma clave/cuerpo no repite transición; distinto cuerpo es 409. Unicidad de expediente/envío/decisión sobrevive a purgar recibos. Escenarios de expiración/doble guardado deben cerrarse en contrato.';

COMMENT ON COLUMN "marleva"."M2MembershipCommandReceipt"."hashKeyId" IS 'ID no secreto de llave HMAC; anillo servidor fuera de Git.';

COMMENT ON COLUMN "marleva"."M2MembershipCommandReceipt"."requestHash" IS 'Huella protegida/HMAC del cuerpo canónico; no almacenar PII ni usar hash como anonimización. Gestión de clave pendiente en contrato/seguridad.';

COMMENT ON TABLE "marleva"."M2MembershipRetentionCase" IS 'Una fila por recurso privado, solo dentro del mismo expediente/cuenta. dueAt se calcula por política y referencias legítimas; no es un temporizador arbitrario del cliente. anchorDecisionId puede cerrar cadena anterior o corrección archivada, sin editar outcome. startedAt toma evento de finalización pertinente, no primera finalizedAt de decisión. Conservación del mínimo estructural requiere la puerta jurídica/depuración de FK D08-R, no se finge implementada.';

COMMENT ON TABLE "marleva"."M2MembershipRetentionHold" IS 'Causa legal/controversia documentada; referencia opaca sin relato ni adjuntos. ReviewAt es revisión obligatoria, nunca expiración silenciosa. No permite uso ordinario ni recuperar bytes borrados.';

COMMENT ON TABLE "marleva"."M2MembershipDeletionTask" IS 'Intención durable; ledger externo confirmado antes de borrar. Un trabajador antiguo no confirma con fence/lease ajenos. Reintentar ausencia de todas las réplicas; fallos no reviven acceso.';

COMMENT ON TABLE "marleva"."M2MembershipRetentionEvent" IS 'Append-only por permisos/transacción futura. Guarda primera finalización y cambios de cómputo, sin motivo privado/cuerpo/hash del documento. actor nulo solo tarea técnica identificada por referencia.';

COMMENT ON COLUMN "marleva"."M2MembershipRetentionEvent"."commandHash" IS 'HMAC del cuerpo canónico, sin copiar contenido privado.';

COMMENT ON TABLE "marleva"."M2MembershipReplica" IS 'Inventario cerrado de todas las copias privadas, también copias de textos. Sin ubicación pública. Solo ausencia confirmada de todas permite completar borrado. No usar backup general no depurable para estas finalidades.';

COMMENT ON TABLE "marleva"."M8MembershipReviewerProfile" IS 'Etiqueta operativa M8 sin correo/nombre/domicilio. Perfil habilitado no concede capacidad: consultar grant vigente por envío y revalidar al asignar. Aprovisionamiento controlado con doble intervención antes del piloto; sin endpoint público de bootstrap ni cambio M1.';

COMMENT ON TABLE "marleva"."M2SellerProfile" IS 'Objetivo documental, no aplicado. Invariantes entre filas/autorización por transacción futura.';

COMMENT ON TABLE "marleva"."M2SellerVersion" IS 'Objetivo documental, no aplicado. Invariantes entre filas/autorización por transacción futura.';

COMMENT ON TABLE "marleva"."M2SellerVersionPrivate" IS 'Objetivo documental, no aplicado. Invariantes entre filas/autorización por transacción futura.';

COMMENT ON TABLE "marleva"."M2SellerCoverage" IS 'Objetivo documental, no aplicado. Invariantes entre filas/autorización por transacción futura.';

COMMENT ON TABLE "marleva"."M2SellerModality" IS 'Objetivo documental, no aplicado. Invariantes entre filas/autorización por transacción futura.';

COMMENT ON TABLE "marleva"."M2SellerTermsPolicy" IS 'Objetivo documental, no aplicado. Invariantes entre filas/autorización por transacción futura.';

COMMENT ON TABLE "marleva"."M2SellerTermsAcceptance" IS 'Objetivo documental, no aplicado. Invariantes entre filas/autorización por transacción futura.';

COMMENT ON TABLE "marleva"."M2SellerSubmission" IS 'Objetivo documental, no aplicado. Invariantes entre filas/autorización por transacción futura.';

COMMENT ON TABLE "marleva"."M8SellerAssignment" IS 'Objetivo documental, no aplicado. Invariantes entre filas/autorización por transacción futura.';

COMMENT ON TABLE "marleva"."M2SellerDecision" IS 'Objetivo documental, no aplicado. Invariantes entre filas/autorización por transacción futura.';

COMMENT ON TABLE "marleva"."M2SellerDecisionPrivate" IS 'Objetivo documental, no aplicado. Invariantes entre filas/autorización por transacción futura.';

COMMENT ON TABLE "marleva"."M2Restriction" IS 'Objetivo documental, no aplicado. Invariantes entre filas/autorización por transacción futura.';

COMMENT ON TABLE "marleva"."M2RestrictionPrivate" IS 'Objetivo documental, no aplicado. Invariantes entre filas/autorización por transacción futura.';

COMMENT ON TABLE "marleva"."M2RestrictionAppeal" IS 'Objetivo documental, no aplicado. Invariantes entre filas/autorización por transacción futura.';

COMMENT ON TABLE "marleva"."M2RestrictionAppealPrivate" IS 'Objetivo documental, no aplicado. Invariantes entre filas/autorización por transacción futura.';

COMMENT ON TABLE "marleva"."M8RestrictionAssignment" IS 'Objetivo documental, no aplicado. Invariantes entre filas/autorización por transacción futura.';

COMMENT ON TABLE "marleva"."M2RestrictionDecision" IS 'Objetivo documental, no aplicado. Invariantes entre filas/autorización por transacción futura.';

COMMENT ON TABLE "marleva"."M2RestrictionDecisionPrivate" IS 'Objetivo documental, no aplicado. Invariantes entre filas/autorización por transacción futura.';

COMMENT ON TABLE "marleva"."M2RestrictionEvidenceLink" IS 'Objetivo documental, no aplicado. Invariantes entre filas/autorización por transacción futura.';

COMMENT ON TABLE "marleva"."M2MembershipArchiveNotice" IS 'Objetivo documental, no aplicado. Invariantes entre filas/autorización por transacción futura.';

COMMENT ON TABLE "marleva"."M2CommunityEvent" IS 'Objetivo documental, no aplicado. Invariantes entre filas/autorización por transacción futura.';

COMMENT ON TABLE "marleva"."M2CommunityCommandReceipt" IS 'Objetivo documental, no aplicado. Invariantes entre filas/autorización por transacción futura.';

ALTER TABLE "marleva"."M2MembershipApplication" ADD CONSTRAINT "m2_application_account" FOREIGN KEY ("accountId") REFERENCES "marleva"."Account" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipVersion" ADD CONSTRAINT "m2_version_development" FOREIGN KEY ("developmentId") REFERENCES "marleva"."Development" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M8MembershipReviewGrant" ADD CONSTRAINT "m8_grant_account" FOREIGN KEY ("accountId") REFERENCES "marleva"."Account" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M8MembershipReviewGrant" ADD CONSTRAINT "m8_grant_granter" FOREIGN KEY ("grantedBy") REFERENCES "marleva"."Account" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M8MembershipReviewGrant" ADD CONSTRAINT "m8_grant_revoker" FOREIGN KEY ("revokedBy") REFERENCES "marleva"."Account" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipDocumentAccess" ADD CONSTRAINT "m2_access_session_actor" FOREIGN KEY ("sessionId", "accessorId") REFERENCES "marleva"."Session" ("id", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipEvent" ADD CONSTRAINT "m2_event_recipient" FOREIGN KEY ("recipientId") REFERENCES "marleva"."Account" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipCommandReceipt" ADD CONSTRAINT "m2_receipt_actor" FOREIGN KEY ("actorId") REFERENCES "marleva"."Account" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipVersion" ADD CONSTRAINT "m2_version_application" FOREIGN KEY ("applicationId", "accountId") REFERENCES "marleva"."M2MembershipApplication" ("id", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipVersion" ADD CONSTRAINT "m2_version_source_decision" FOREIGN KEY ("sourceDecisionId", "sourceSubmissionId", "applicationId", "accountId") REFERENCES "marleva"."M2MembershipDecision" ("id", "submissionId", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipVersion" ADD CONSTRAINT "m2_version_source_submission" FOREIGN KEY ("sourceSubmissionId", "applicationId", "accountId") REFERENCES "marleva"."M2MembershipSubmission" ("id", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipApplication" ADD CONSTRAINT "m2_application_current_version" FOREIGN KEY ("currentVersionId", "id", "accountId") REFERENCES "marleva"."M2MembershipVersion" ("id", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipVersionPrivate" ADD CONSTRAINT "m2_version_private" FOREIGN KEY ("versionId", "applicationId", "accountId") REFERENCES "marleva"."M2MembershipVersion" ("id", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipDocument" ADD CONSTRAINT "m2_document_application" FOREIGN KEY ("applicationId", "accountId") REFERENCES "marleva"."M2MembershipApplication" ("id", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipVersionDocument" ADD CONSTRAINT "m2_link_version" FOREIGN KEY ("versionId", "applicationId", "accountId") REFERENCES "marleva"."M2MembershipVersion" ("id", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipVersionDocument" ADD CONSTRAINT "m2_link_document" FOREIGN KEY ("documentId", "applicationId", "accountId", "purpose") REFERENCES "marleva"."M2MembershipDocument" ("id", "applicationId", "accountId", "purpose") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipSubmission" ADD CONSTRAINT "m2_submission_version" FOREIGN KEY ("versionId", "applicationId", "accountId") REFERENCES "marleva"."M2MembershipVersion" ("id", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M8MembershipAssignment" ADD CONSTRAINT "m8_assignment_submission" FOREIGN KEY ("submissionId", "applicationId", "accountId") REFERENCES "marleva"."M2MembershipSubmission" ("id", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M8MembershipAssignment" ADD CONSTRAINT "m8_assignment_reviewer_grant" FOREIGN KEY ("reviewerGrantId", "reviewerId", "reviewerCapability") REFERENCES "marleva"."M8MembershipReviewGrant" ("id", "accountId", "capability") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M8MembershipAssignment" ADD CONSTRAINT "m8_assignment_manager_grant" FOREIGN KEY ("managerGrantId", "assignedBy", "managerCapability") REFERENCES "marleva"."M8MembershipReviewGrant" ("id", "accountId", "capability") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipDecision" ADD CONSTRAINT "m2_decision_assignment" FOREIGN KEY ("assignmentId", "submissionId", "applicationId", "accountId", "reviewerId") REFERENCES "marleva"."M8MembershipAssignment" ("id", "submissionId", "applicationId", "accountId", "reviewerId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipDecisionPrivate" ADD CONSTRAINT "m2_decision_private" FOREIGN KEY ("decisionId", "applicationId", "accountId") REFERENCES "marleva"."M2MembershipDecision" ("id", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipDocument" ADD CONSTRAINT "m2_document_retention_decision" FOREIGN KEY ("retentionDecisionId", "applicationId", "accountId") REFERENCES "marleva"."M2MembershipDecision" ("id", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipDocumentAccess" ADD CONSTRAINT "m2_access_version_document" FOREIGN KEY ("versionId", "documentId", "applicationId", "accountId") REFERENCES "marleva"."M2MembershipVersionDocument" ("versionId", "documentId", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipDocumentAccess" ADD CONSTRAINT "m2_access_submission_version" FOREIGN KEY ("submissionId", "versionId", "applicationId", "accountId") REFERENCES "marleva"."M2MembershipSubmission" ("id", "versionId", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipDocumentAccess" ADD CONSTRAINT "m2_access_assignment_reviewer" FOREIGN KEY ("assignmentId", "submissionId", "applicationId", "accountId", "accessorId") REFERENCES "marleva"."M8MembershipAssignment" ("id", "submissionId", "applicationId", "accountId", "reviewerId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipEvent" ADD CONSTRAINT "m2_event_submission" FOREIGN KEY ("submissionId", "applicationId", "accountId") REFERENCES "marleva"."M2MembershipSubmission" ("id", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipEvent" ADD CONSTRAINT "m2_event_decision" FOREIGN KEY ("decisionId", "submissionId", "applicationId", "accountId") REFERENCES "marleva"."M2MembershipDecision" ("id", "submissionId", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipCommandReceipt" ADD CONSTRAINT "m2_receipt_application" FOREIGN KEY ("applicationId", "accountId") REFERENCES "marleva"."M2MembershipApplication" ("id", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipCommandReceipt" ADD CONSTRAINT "m2_receipt_version" FOREIGN KEY ("versionId", "applicationId", "accountId") REFERENCES "marleva"."M2MembershipVersion" ("id", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipCommandReceipt" ADD CONSTRAINT "m2_receipt_submission" FOREIGN KEY ("submissionId", "versionId", "applicationId", "accountId") REFERENCES "marleva"."M2MembershipSubmission" ("id", "versionId", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipCommandReceipt" ADD CONSTRAINT "m2_receipt_document" FOREIGN KEY ("documentId", "applicationId", "accountId", "documentPurpose") REFERENCES "marleva"."M2MembershipDocument" ("id", "applicationId", "accountId", "purpose") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipCommandReceipt" ADD CONSTRAINT "m2_receipt_assignment" FOREIGN KEY ("assignmentId", "submissionId", "applicationId", "accountId") REFERENCES "marleva"."M8MembershipAssignment" ("id", "submissionId", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipCommandReceipt" ADD CONSTRAINT "m2_receipt_decision" FOREIGN KEY ("decisionId", "assignmentId", "submissionId", "applicationId", "accountId", "actorId") REFERENCES "marleva"."M2MembershipDecision" ("id", "assignmentId", "submissionId", "applicationId", "accountId", "reviewerId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipRetentionCase" ADD CONSTRAINT "m2_retention_application" FOREIGN KEY ("applicationId", "accountId") REFERENCES "marleva"."M2MembershipApplication" ("id", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipRetentionCase" ADD CONSTRAINT "m2_retention_anchor" FOREIGN KEY ("anchorDecisionId", "applicationId", "accountId") REFERENCES "marleva"."M2MembershipDecision" ("id", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipRetentionCase" ADD CONSTRAINT "m2_retention_document" FOREIGN KEY ("documentId", "applicationId", "accountId", "documentPurpose") REFERENCES "marleva"."M2MembershipDocument" ("id", "applicationId", "accountId", "purpose") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipRetentionCase" ADD CONSTRAINT "m2_retention_version" FOREIGN KEY ("versionId", "applicationId", "accountId") REFERENCES "marleva"."M2MembershipVersion" ("id", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipRetentionCase" ADD CONSTRAINT "m2_retention_decision" FOREIGN KEY ("decisionId", "applicationId", "accountId") REFERENCES "marleva"."M2MembershipDecision" ("id", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipRetentionHold" ADD CONSTRAINT "m2_hold_case" FOREIGN KEY ("caseId") REFERENCES "marleva"."M2MembershipRetentionCase" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipRetentionHold" ADD CONSTRAINT "m2_hold_actor" FOREIGN KEY ("createdBy") REFERENCES "marleva"."Account" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipRetentionHold" ADD CONSTRAINT "m2_hold_releaser" FOREIGN KEY ("releasedBy") REFERENCES "marleva"."Account" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipDeletionTask" ADD CONSTRAINT "m2_deletion_case" FOREIGN KEY ("caseId") REFERENCES "marleva"."M2MembershipRetentionCase" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipRetentionEvent" ADD CONSTRAINT "m2_retention_event_case" FOREIGN KEY ("caseId") REFERENCES "marleva"."M2MembershipRetentionCase" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipRetentionEvent" ADD CONSTRAINT "m2_retention_event_actor" FOREIGN KEY ("actorId") REFERENCES "marleva"."Account" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipReplica" ADD CONSTRAINT "m2_replica_case" FOREIGN KEY ("caseId") REFERENCES "marleva"."M2MembershipRetentionCase" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M8MembershipReviewerProfile" ADD CONSTRAINT "m8_reviewer_profile_account" FOREIGN KEY ("accountId") REFERENCES "marleva"."Account" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipApplication" ADD CONSTRAINT "m2_approved_version" FOREIGN KEY ("approvedVersionId", "id", "accountId") REFERENCES "marleva"."M2MembershipVersion" ("id", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipVersion" ADD CONSTRAINT "m2_previous_version" FOREIGN KEY ("previousVersionId", "applicationId", "accountId") REFERENCES "marleva"."M2MembershipVersion" ("id", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2SellerProfile" ADD CONSTRAINT "m2sellerprofile_app" FOREIGN KEY ("applicationId", "accountId") REFERENCES "marleva"."M2MembershipApplication" ("id", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2SellerVersion" ADD CONSTRAINT "m2sellerversion_app" FOREIGN KEY ("applicationId", "accountId") REFERENCES "marleva"."M2MembershipApplication" ("id", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2SellerVersion" ADD CONSTRAINT "m2_seller_version_profile" FOREIGN KEY ("profileId", "applicationId", "accountId") REFERENCES "marleva"."M2SellerProfile" ("id", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2SellerVersion" ADD CONSTRAINT "m2_seller_previous" FOREIGN KEY ("previousVersionId", "profileId", "applicationId", "accountId") REFERENCES "marleva"."M2SellerVersion" ("id", "profileId", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2SellerProfile" ADD CONSTRAINT "m2_seller_currentVersionId" FOREIGN KEY ("currentVersionId", "id", "applicationId", "accountId") REFERENCES "marleva"."M2SellerVersion" ("id", "profileId", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2SellerProfile" ADD CONSTRAINT "m2_seller_approvedVersionId" FOREIGN KEY ("approvedVersionId", "id", "applicationId", "accountId") REFERENCES "marleva"."M2SellerVersion" ("id", "profileId", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2SellerVersionPrivate" ADD CONSTRAINT "m2_seller_private_version" FOREIGN KEY ("versionId", "profileId", "applicationId", "accountId") REFERENCES "marleva"."M2SellerVersion" ("id", "profileId", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2SellerCoverage" ADD CONSTRAINT "m2sellercoverage_version" FOREIGN KEY ("versionId", "profileId", "applicationId", "accountId") REFERENCES "marleva"."M2SellerVersion" ("id", "profileId", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2SellerCoverage" ADD CONSTRAINT "m2_seller_coverage_catalog" FOREIGN KEY ("developmentId") REFERENCES "marleva"."Development" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2SellerModality" ADD CONSTRAINT "m2sellermodality_version" FOREIGN KEY ("versionId", "profileId", "applicationId", "accountId") REFERENCES "marleva"."M2SellerVersion" ("id", "profileId", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2SellerTermsAcceptance" ADD CONSTRAINT "m2_seller_terms_version" FOREIGN KEY ("versionId", "profileId", "applicationId", "accountId") REFERENCES "marleva"."M2SellerVersion" ("id", "profileId", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2SellerTermsAcceptance" ADD CONSTRAINT "m2_seller_terms_policy" FOREIGN KEY ("policyId", "policyContentSha256") REFERENCES "marleva"."M2SellerTermsPolicy" ("id", "contentSha256") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2SellerSubmission" ADD CONSTRAINT "m2sellersubmission_app" FOREIGN KEY ("applicationId", "accountId") REFERENCES "marleva"."M2MembershipApplication" ("id", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2SellerSubmission" ADD CONSTRAINT "m2_seller_submission_version" FOREIGN KEY ("versionId", "profileId", "applicationId", "accountId") REFERENCES "marleva"."M2SellerVersion" ("id", "profileId", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M8SellerAssignment" ADD CONSTRAINT "m8sellerassignment_app" FOREIGN KEY ("applicationId", "accountId") REFERENCES "marleva"."M2MembershipApplication" ("id", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M8SellerAssignment" ADD CONSTRAINT "m8_seller_assignment_submission" FOREIGN KEY ("submissionId", "profileId", "applicationId", "accountId") REFERENCES "marleva"."M2SellerSubmission" ("id", "profileId", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M8SellerAssignment" ADD CONSTRAINT "m8_seller_reviewer_grant" FOREIGN KEY ("reviewerGrantId", "reviewerId", "reviewerCapability") REFERENCES "marleva"."M8MembershipReviewGrant" ("id", "accountId", "capability") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M8SellerAssignment" ADD CONSTRAINT "m8_seller_manager_grant" FOREIGN KEY ("managerGrantId", "assignedBy", "managerCapability") REFERENCES "marleva"."M8MembershipReviewGrant" ("id", "accountId", "capability") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2SellerDecision" ADD CONSTRAINT "m2sellerdecision_app" FOREIGN KEY ("applicationId", "accountId") REFERENCES "marleva"."M2MembershipApplication" ("id", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2SellerDecision" ADD CONSTRAINT "m2_seller_decision_assignment" FOREIGN KEY ("assignmentId", "submissionId", "profileId", "applicationId", "accountId", "reviewerId") REFERENCES "marleva"."M8SellerAssignment" ("id", "submissionId", "profileId", "applicationId", "accountId", "reviewerId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2SellerVersion" ADD CONSTRAINT "m2_seller_version_source_decision" FOREIGN KEY ("sourceDecisionId", "profileId", "applicationId", "accountId") REFERENCES "marleva"."M2SellerDecision" ("id", "profileId", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2SellerDecisionPrivate" ADD CONSTRAINT "m2_seller_decision_private" FOREIGN KEY ("decisionId", "profileId", "applicationId", "accountId") REFERENCES "marleva"."M2SellerDecision" ("id", "profileId", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2Restriction" ADD CONSTRAINT "m2restriction_app" FOREIGN KEY ("applicationId", "accountId") REFERENCES "marleva"."M2MembershipApplication" ("id", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2Restriction" ADD CONSTRAINT "m2_restriction_profile" FOREIGN KEY ("profileId", "applicationId", "accountId") REFERENCES "marleva"."M2SellerProfile" ("id", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2Restriction" ADD CONSTRAINT "m2_restriction_actor" FOREIGN KEY ("createdBy") REFERENCES "marleva"."Account" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2RestrictionPrivate" ADD CONSTRAINT "m2_restriction_private" FOREIGN KEY ("restrictionId", "applicationId", "accountId") REFERENCES "marleva"."M2Restriction" ("id", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2RestrictionAppeal" ADD CONSTRAINT "m2restrictionappeal_app" FOREIGN KEY ("applicationId", "accountId") REFERENCES "marleva"."M2MembershipApplication" ("id", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2RestrictionAppeal" ADD CONSTRAINT "m2_restriction_appeal_restriction" FOREIGN KEY ("restrictionId", "applicationId", "accountId") REFERENCES "marleva"."M2Restriction" ("id", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2RestrictionAppeal" ADD CONSTRAINT "m2_restriction_appeal_evidence" FOREIGN KEY ("evidenceVersionId", "applicationId", "accountId") REFERENCES "marleva"."M2MembershipVersion" ("id", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2RestrictionAppealPrivate" ADD CONSTRAINT "m2_restriction_appeal_private" FOREIGN KEY ("appealId", "applicationId", "accountId") REFERENCES "marleva"."M2RestrictionAppeal" ("id", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M8RestrictionAssignment" ADD CONSTRAINT "m8restrictionassignment_app" FOREIGN KEY ("applicationId", "accountId") REFERENCES "marleva"."M2MembershipApplication" ("id", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M8RestrictionAssignment" ADD CONSTRAINT "m8_restriction_assignment_appeal" FOREIGN KEY ("appealId", "restrictionId", "applicationId", "accountId") REFERENCES "marleva"."M2RestrictionAppeal" ("id", "restrictionId", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M8RestrictionAssignment" ADD CONSTRAINT "m8_restriction_reviewer_grant" FOREIGN KEY ("reviewerGrantId", "reviewerId", "reviewerCapability") REFERENCES "marleva"."M8MembershipReviewGrant" ("id", "accountId", "capability") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M8RestrictionAssignment" ADD CONSTRAINT "m8_restriction_manager_grant" FOREIGN KEY ("managerGrantId", "assignedBy", "managerCapability") REFERENCES "marleva"."M8MembershipReviewGrant" ("id", "accountId", "capability") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2RestrictionDecision" ADD CONSTRAINT "m2restrictiondecision_app" FOREIGN KEY ("applicationId", "accountId") REFERENCES "marleva"."M2MembershipApplication" ("id", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2RestrictionDecision" ADD CONSTRAINT "m2_restriction_decision_assignment" FOREIGN KEY ("assignmentId", "appealId", "restrictionId", "applicationId", "accountId", "reviewerId") REFERENCES "marleva"."M8RestrictionAssignment" ("id", "appealId", "restrictionId", "applicationId", "accountId", "reviewerId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2RestrictionDecisionPrivate" ADD CONSTRAINT "m2_restriction_decision_private" FOREIGN KEY ("decisionId", "applicationId", "accountId") REFERENCES "marleva"."M2RestrictionDecision" ("id", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2RestrictionEvidenceLink" ADD CONSTRAINT "m2_restriction_evidence_appeal" FOREIGN KEY ("appealId", "applicationId", "accountId") REFERENCES "marleva"."M2RestrictionAppeal" ("id", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2RestrictionEvidenceLink" ADD CONSTRAINT "m2_restriction_evidence_document" FOREIGN KEY ("versionId", "documentId", "applicationId", "accountId") REFERENCES "marleva"."M2MembershipVersionDocument" ("versionId", "documentId", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipDocumentAccess" ADD CONSTRAINT "m2_access_restriction_assignment" FOREIGN KEY ("restrictionAssignmentId", "restrictionAppealId", "applicationId", "accountId", "accessorId") REFERENCES "marleva"."M8RestrictionAssignment" ("id", "appealId", "applicationId", "accountId", "reviewerId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipDocumentAccess" ADD CONSTRAINT "m2_access_restriction_evidence" FOREIGN KEY ("restrictionAppealId", "versionId", "documentId", "applicationId", "accountId") REFERENCES "marleva"."M2RestrictionEvidenceLink" ("appealId", "versionId", "documentId", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipArchiveNotice" ADD CONSTRAINT "m2membershiparchivenotice_app" FOREIGN KEY ("applicationId", "accountId") REFERENCES "marleva"."M2MembershipApplication" ("id", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2CommunityEvent" ADD CONSTRAINT "m2communityevent_app" FOREIGN KEY ("applicationId", "accountId") REFERENCES "marleva"."M2MembershipApplication" ("id", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2CommunityEvent" ADD CONSTRAINT "m2_community_event_profile" FOREIGN KEY ("profileId", "applicationId", "accountId") REFERENCES "marleva"."M2SellerProfile" ("id", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2CommunityEvent" ADD CONSTRAINT "m2_community_event_restriction" FOREIGN KEY ("restrictionId", "applicationId", "accountId") REFERENCES "marleva"."M2Restriction" ("id", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2CommunityEvent" ADD CONSTRAINT "m2_community_event_recipient" FOREIGN KEY ("recipientId") REFERENCES "marleva"."Account" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2CommunityCommandReceipt" ADD CONSTRAINT "m2communitycommandreceipt_app" FOREIGN KEY ("applicationId", "accountId") REFERENCES "marleva"."M2MembershipApplication" ("id", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2CommunityCommandReceipt" ADD CONSTRAINT "m2_community_receipt_actor" FOREIGN KEY ("actorId") REFERENCES "marleva"."Account" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2CommunityCommandReceipt" ADD CONSTRAINT "m2_community_receipt_profile" FOREIGN KEY ("profileId", "applicationId", "accountId") REFERENCES "marleva"."M2SellerProfile" ("id", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2CommunityCommandReceipt" ADD CONSTRAINT "m2_community_receipt_restriction" FOREIGN KEY ("restrictionId", "applicationId", "accountId") REFERENCES "marleva"."M2Restriction" ("id", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2CommunityCommandReceipt" ADD CONSTRAINT "m2_community_receipt_appeal" FOREIGN KEY ("appealId", "restrictionId", "applicationId", "accountId") REFERENCES "marleva"."M2RestrictionAppeal" ("id", "restrictionId", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2CommunityCommandReceipt" ADD CONSTRAINT "m2_community_receipt_version" FOREIGN KEY ("versionId", "profileId", "applicationId", "accountId") REFERENCES "marleva"."M2SellerVersion" ("id", "profileId", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2CommunityCommandReceipt" ADD CONSTRAINT "m2_community_receipt_submission" FOREIGN KEY ("submissionId", "profileId", "applicationId", "accountId") REFERENCES "marleva"."M2SellerSubmission" ("id", "profileId", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2CommunityCommandReceipt" ADD CONSTRAINT "m2_community_receipt_decision" FOREIGN KEY ("decisionId", "submissionId", "assignmentId", "profileId", "applicationId", "accountId") REFERENCES "marleva"."M2SellerDecision" ("id", "submissionId", "assignmentId", "profileId", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipRetentionCase" ADD CONSTRAINT "m2_retention_seller_version_private" FOREIGN KEY ("sellerVersionId", "applicationId", "accountId") REFERENCES "marleva"."M2SellerVersion" ("id", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipRetentionCase" ADD CONSTRAINT "m2_retention_seller_decision_private" FOREIGN KEY ("sellerDecisionId", "applicationId", "accountId") REFERENCES "marleva"."M2SellerDecision" ("id", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipRetentionCase" ADD CONSTRAINT "m2_retention_restriction_private" FOREIGN KEY ("restrictionId", "applicationId", "accountId") REFERENCES "marleva"."M2Restriction" ("id", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipRetentionCase" ADD CONSTRAINT "m2_retention_restriction_appeal_private" FOREIGN KEY ("restrictionAppealId", "applicationId", "accountId") REFERENCES "marleva"."M2RestrictionAppeal" ("id", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipRetentionCase" ADD CONSTRAINT "m2_retention_restriction_decision_private" FOREIGN KEY ("restrictionDecisionId", "applicationId", "accountId") REFERENCES "marleva"."M2RestrictionDecision" ("id", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipRetentionCase" ADD CONSTRAINT "m2_retention_seller_anchor" FOREIGN KEY ("anchorSellerDecisionId", "applicationId", "accountId") REFERENCES "marleva"."M2SellerDecision" ("id", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipRetentionCase" ADD CONSTRAINT "m2_retention_restriction_anchor" FOREIGN KEY ("anchorRestrictionDecisionId", "applicationId", "accountId") REFERENCES "marleva"."M2RestrictionDecision" ("id", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2CommunityCommandReceipt" ADD CONSTRAINT "m2_community_receipt_assignment" FOREIGN KEY ("assignmentId", "submissionId", "profileId", "applicationId", "accountId") REFERENCES "marleva"."M8SellerAssignment" ("id", "submissionId", "profileId", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2CommunityCommandReceipt" ADD CONSTRAINT "m2_community_receipt_restr_assignment" FOREIGN KEY ("restrictionAssignmentId", "appealId", "applicationId", "accountId") REFERENCES "marleva"."M8RestrictionAssignment" ("id", "appealId", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2CommunityCommandReceipt" ADD CONSTRAINT "m2_community_receipt_restr_decision" FOREIGN KEY ("restrictionDecisionId", "appealId", "restrictionId", "applicationId", "accountId") REFERENCES "marleva"."M2RestrictionDecision" ("id", "appealId", "restrictionId", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

ALTER TABLE "marleva"."M2MembershipArchiveNotice" ADD CONSTRAINT "m2_archive_notice_version" FOREIGN KEY ("versionId", "applicationId", "accountId") REFERENCES "marleva"."M2MembershipVersion" ("id", "applicationId", "accountId") ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE;

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
