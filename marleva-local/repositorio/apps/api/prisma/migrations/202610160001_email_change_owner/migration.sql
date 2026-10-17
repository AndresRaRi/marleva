BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
ALTER TABLE marleva."EmailChange"
  ADD CONSTRAINT "EmailChange_accountId_fkey"
  FOREIGN KEY ("accountId") REFERENCES marleva."Account"("id")
  ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;
