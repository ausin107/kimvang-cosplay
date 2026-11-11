-- ============================================================================
-- KIMVANG COSPLAY HYBRID E-COMMERCE - POSTGRESQL 16 SCHEMA
-- Mô hình: Bán đứt (Outright Purchase) + Cho thuê có đặt cọc (Rental with Deposit)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ENUMS
CREATE TYPE user_role AS ENUM ('CUSTOMER', 'STAFF', 'ADMIN');
CREATE TYPE product_category AS ENUM ('COSTUME_MALE', 'COSTUME_FEMALE', 'WIG', 'PROP_WEAPON', 'ACCESSORY');
CREATE TYPE transaction_mode AS ENUM ('BUY_ONLY', 'RENT_ONLY', 'BOTH');
CREATE TYPE unit_condition_status AS ENUM ('AVAILABLE', 'RENTED', 'LAUNDRY_MAINTENANCE', 'RETIRED');
CREATE TYPE media_type AS ENUM ('GALLERY', 'FABRIC_CLOSEUP', 'ACCESSORY_CHECKLIST');
CREATE TYPE payment_status AS ENUM ('UNPAID', 'PAID', 'PARTIALLY_REFUNDED', 'REFUNDED');
CREATE TYPE order_status AS ENUM ('PENDING_PAYMENT', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED');
CREATE TYPE order_item_type AS ENUM ('BUY', 'RENT');
CREATE TYPE deposit_status AS ENUM ('PENDING', 'HELD', 'INSPECTING', 'REFUNDED', 'PARTIALLY_REFUNDED', 'FORFEITED');
CREATE TYPE rental_status AS ENUM ('RESERVED_TEMP', 'BOOKED', 'DELIVERED', 'RETURNED', 'OVERDUE', 'CANCELLED');
CREATE TYPE faq_category AS ENUM ('DEPOSIT_REFUND', 'SHIPPING_TIMING', 'DAMAGE_POLICY', 'WIG_PROP_CARE');

-- 1. Bảng Users (Người dùng & Quản trị viên)
CREATE TABLE Users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE,
    password_hash VARCHAR(255),
    role user_role NOT NULL DEFAULT 'CUSTOMER',
    refund_bank_name VARCHAR(100),
    refund_bank_account VARCHAR(50),
    refund_account_holder VARCHAR(120),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bảng Products (Thông tin gốc của Trang phục/Đạo cụ)
CREATE TABLE Products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(200) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    character_name VARCHAR(120),
    series_name VARCHAR(150),
    category product_category NOT NULL,
    transaction_mode transaction_mode NOT NULL DEFAULT 'BOTH',
    care_instructions TEXT,
    damage_policy_json JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_slug ON Products(slug);
CREATE INDEX idx_products_character ON Products(character_name);
CREATE INDEX idx_products_series ON Products(series_name);

-- 3. Bảng ProductVariants (Biến thể Kích cỡ, Giá & Danh sách phụ kiện)
CREATE TABLE ProductVariants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES Products(id) ON DELETE CASCADE,
    sku VARCHAR(80) UNIQUE NOT NULL,
    size_label VARCHAR(30) NOT NULL,
    measurements_json JSONB NOT NULL,
    included_items_json JSONB NOT NULL,
    buy_price NUMERIC(12,0),
    rent_price_per_day NUMERIC(12,0),
    deposit_amount NUMERIC(12,0),
    stock_for_sale INTEGER DEFAULT 0,
    total_rental_units INTEGER DEFAULT 0
);

-- 4. Bảng InventoryUnits (Đơn vị Trang phục Cho thuê Vật lý)
CREATE TABLE InventoryUnits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id UUID NOT NULL REFERENCES ProductVariants(id) ON DELETE CASCADE,
    unit_code VARCHAR(50) UNIQUE NOT NULL,
    condition_status unit_condition_status NOT NULL DEFAULT 'AVAILABLE',
    condition_notes TEXT
);

-- 5. Bảng ProductMedia (Hình ảnh Đa góc độ & Ảnh Zoom chất liệu)
CREATE TABLE ProductMedia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES Products(id) ON DELETE CASCADE,
    url_original TEXT NOT NULL,
    url_webp_thumb TEXT NOT NULL,
    blurhash VARCHAR(100),
    media_type media_type NOT NULL DEFAULT 'GALLERY',
    sort_order SMALLINT DEFAULT 0
);

-- 6. Bảng Orders & OrderItems (Đơn hàng & Chi tiết dòng đơn hàng)
CREATE TABLE Orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_code VARCHAR(30) UNIQUE NOT NULL,
    user_id UUID REFERENCES Users(id),
    customer_name VARCHAR(120) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    shipping_address TEXT NOT NULL,
    refund_bank_name VARCHAR(100),
    refund_bank_account VARCHAR(50),
    refund_account_holder VARCHAR(120),
    total_buy_amount NUMERIC(12,0) DEFAULT 0,
    total_rent_amount NUMERIC(12,0) DEFAULT 0,
    total_deposit_amount NUMERIC(12,0) DEFAULT 0,
    shipping_fee NUMERIC(12,0) DEFAULT 35000,
    grand_total NUMERIC(12,0) NOT NULL,
    payment_status payment_status NOT NULL DEFAULT 'UNPAID',
    order_status order_status NOT NULL DEFAULT 'PENDING_PAYMENT',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE OrderItems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES Orders(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES ProductVariants(id),
    item_type order_item_type NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(12,0) NOT NULL,
    subtotal NUMERIC(12,0) NOT NULL
);

-- 7. Bảng Rentals (Quản lý Lịch thuê, Trạng thái Cọc & Hoàn cọc)
CREATE TABLE Rentals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES Orders(id) ON DELETE CASCADE,
    order_item_id UUID NOT NULL REFERENCES OrderItems(id) ON DELETE CASCADE,
    inventory_unit_id UUID NOT NULL REFERENCES InventoryUnits(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    buffer_until_date DATE NOT NULL,
    occupied_period DATERANGE GENERATED ALWAYS AS (daterange(start_date - 1, buffer_until_date, '[]')) STORED,
    rental_days SMALLINT NOT NULL,
    rental_fee_total NUMERIC(12,0) NOT NULL,
    deposit_amount NUMERIC(12,0) NOT NULL,
    deposit_status deposit_status NOT NULL DEFAULT 'PENDING',
    rental_status rental_status NOT NULL DEFAULT 'RESERVED_TEMP',
    inspection_checklist JSONB,
    deduction_amount NUMERIC(12,0) DEFAULT 0,
    deduction_reason TEXT,
    refunded_amount NUMERIC(12,0) DEFAULT 0,
    refund_transaction_id VARCHAR(100),
    refunded_at TIMESTAMPTZ,
    -- Khóa Cứng ở Tầng Cơ sở Dữ liệu (PostgreSQL GiST Exclusion Constraint)
    CONSTRAINT prevent_double_booking
    EXCLUDE USING gist (
        inventory_unit_id WITH =,
        occupied_period WITH &&
    )
    WHERE (rental_status IN ('RESERVED_TEMP', 'BOOKED', 'DELIVERED', 'OVERDUE'))
);

CREATE INDEX idx_rentals_start_date ON Rentals(start_date);
CREATE INDEX idx_rentals_end_date ON Rentals(end_date);
CREATE INDEX idx_rentals_buffer_until ON Rentals(buffer_until_date);

-- 8. Bảng FAQs (Hỏi đáp & Chính sách)
CREATE TABLE FAQs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category faq_category NOT NULL,
    question VARCHAR(300) NOT NULL,
    answer_markdown TEXT NOT NULL,
    sort_order SMALLINT DEFAULT 0,
    is_published BOOLEAN DEFAULT TRUE
);
