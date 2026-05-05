ALTER TABLE owners ADD COLUMN recovery_hash TEXT;
ALTER TABLE owners ADD COLUMN recovery_email TEXT;
ALTER TABLE owners ADD COLUMN tos_hash TEXT;
ALTER TABLE owners ADD COLUMN tos_signed_at INTEGER;
ALTER TABLE owners ADD COLUMN display_name TEXT;
