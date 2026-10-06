-- 002_pilot_entities.sql
-- BettaTraka Multi-Tenant PostgreSQL Pilot Entities Schema

-- 1. Products & Packages
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'General',
    unit_cost_kobo BIGINT NOT NULL DEFAULT 0, -- Stored in minor currency units (e.g. Kobo for NGN)
    selling_price_kobo BIGINT NOT NULL DEFAULT 0,
    stock_warehouse INT NOT NULL DEFAULT 0 CHECK (stock_warehouse >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_product_org_sku UNIQUE (organization_id, sku)
);

CREATE INDEX IF NOT EXISTS idx_products_org ON products(organization_id);

CREATE TABLE IF NOT EXISTS product_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity INT NOT NULL CHECK (quantity > 0),
    price_kobo BIGINT NOT NULL CHECK (price_kobo >= 0),
    is_default BOOLEAN NOT NULL DEFAULT false,
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_packages_product ON product_packages(product_id);

-- 2. Published Order Forms (Public Intake)
CREATE TABLE IF NOT EXISTS order_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    public_slug VARCHAR(150) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    headline VARCHAR(255),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    allowed_package_ids JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    require_alt_phone BOOLEAN NOT NULL DEFAULT false,
    require_state BOOLEAN NOT NULL DEFAULT true,
    custom_fields JSONB DEFAULT '[]'::jsonb,
    theme_color VARCHAR(50) DEFAULT 'emerald',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_order_forms_slug ON order_forms(public_slug);

-- 3. Customers
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    alt_phone VARCHAR(50),
    email VARCHAR(255),
    state VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    total_orders INT NOT NULL DEFAULT 0,
    successful_orders INT NOT NULL DEFAULT 0,
    total_spend_kobo BIGINT NOT NULL DEFAULT 0,
    reliability_score INT NOT NULL DEFAULT 100,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_customer_org_phone UNIQUE (organization_id, phone)
);

CREATE INDEX IF NOT EXISTS idx_customers_org_phone ON customers(organization_id, phone);

-- 4. Orders & Order Items
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    order_number VARCHAR(50) NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    sales_rep_id UUID REFERENCES users(id) ON DELETE SET NULL,
    distributor_id UUID,
    delivery_agent_id UUID,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 
        'CONFIRMED', 
        'DISPATCHED', 
        'SCHEDULED', 
        'DELIVERED', 
        'CANCELLED', 
        'RETURNED'
    )),
    total_amount_kobo BIGINT NOT NULL CHECK (total_amount_kobo >= 0),
    delivery_fee_kobo BIGINT NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'NGN',
    delivery_address TEXT NOT NULL,
    delivery_city VARCHAR(100),
    delivery_state VARCHAR(100),
    scheduled_date DATE,
    delivered_at TIMESTAMPTZ,
    idempotency_key VARCHAR(100) UNIQUE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_org_order_number UNIQUE (organization_id, order_number)
);

CREATE INDEX IF NOT EXISTS idx_orders_org_status ON orders(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_org_created ON orders(organization_id, created_at);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    package_id UUID REFERENCES product_packages(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price_kobo BIGINT NOT NULL CHECK (unit_price_kobo >= 0),
    line_total_kobo BIGINT NOT NULL CHECK (line_total_kobo >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- 5. Inventory Locations & Balances
CREATE TABLE IF NOT EXISTS inventory_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('WAREHOUSE', 'AGENT', 'DISTRIBUTOR')),
    reference_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    state VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES inventory_locations(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_balance_loc_prod UNIQUE (location_id, product_id)
);

CREATE TABLE IF NOT EXISTS inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    source_location_id UUID REFERENCES inventory_locations(id) ON DELETE RESTRICT,
    destination_location_id UUID REFERENCES inventory_locations(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    movement_type VARCHAR(50) NOT NULL CHECK (movement_type IN (
        'WAREHOUSE_RESTOCK', 
        'TRANSFER_TO_AGENT', 
        'TRANSFER_TO_DISTRIBUTOR', 
        'DELIVERY_DEDUCTION', 
        'RETURN_TO_WAREHOUSE', 
        'ADJUSTMENT'
    )),
    reference_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    notes TEXT,
    created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Remittances
CREATE TABLE IF NOT EXISTS remittances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
    amount_due_kobo BIGINT NOT NULL CHECK (amount_due_kobo >= 0),
    amount_collected_kobo BIGINT NOT NULL DEFAULT 0 CHECK (amount_collected_kobo >= 0),
    delivery_fee_kobo BIGINT NOT NULL DEFAULT 0 CHECK (delivery_fee_kobo >= 0),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFIED', 'SETTLED', 'DISPUTED')),
    verified_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_remittance_order UNIQUE (order_id)
);

CREATE INDEX IF NOT EXISTS idx_remittances_org_status ON remittances(organization_id, status);
