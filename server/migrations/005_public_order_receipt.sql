-- Fresh-pilot feature: never reconstruct an old receipt from mutable staff data.
-- Existing rows have no creation receipt and public replay must fail closed.
ALTER TABLE orders ADD COLUMN public_creation_receipt JSONB;
