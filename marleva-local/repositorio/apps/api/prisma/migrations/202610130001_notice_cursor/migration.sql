-- UC008/SEQ008:S080. Independent of the pending authentication strategy.
-- New migration; never rewrite 001/002. Full DATA002 remains a separate objective.
CREATE INDEX "Notice_accountId_createdAt_id_idx"
ON marleva."Notice" ("accountId", "createdAt", id);
