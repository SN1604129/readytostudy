-- Matches lib/persistent-data.ts. Run only against the intended application DB.
BEGIN;
SELECT pg_advisory_xact_lock(hashtext('rts:schema-v1'));
CREATE TABLE IF NOT EXISTS rts_documents (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS rts_uploads (
  filename TEXT PRIMARY KEY,
  content_type TEXT NOT NULL,
  bytes BYTEA NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMIT;
