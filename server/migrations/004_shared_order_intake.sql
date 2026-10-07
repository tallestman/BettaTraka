-- 003 may already be applied by an interrupted development run.
ALTER TABLE order_forms ADD COLUMN product_ids UUID[] NOT NULL DEFAULT '{}';
UPDATE order_forms SET product_ids=ARRAY[product_id];
ALTER TABLE orders ADD COLUMN intake JSONB NOT NULL DEFAULT '{}';
ALTER TABLE orders ADD COLUMN request_fingerprint TEXT;
ALTER TABLE order_items ADD COLUMN package_name VARCHAR(255);
ALTER TABLE order_items ADD COLUMN package_quantity INT NOT NULL DEFAULT 1 CHECK(package_quantity>0);
