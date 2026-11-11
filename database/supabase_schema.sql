-- ============================================================================
-- KIMVANG SHOWCASE & ADMIN CMS - SUPABASE SQL SCHEMA (DATABASE + STORAGE + AUTH)
-- ============================================================================

-- 1. Bảng lưu trữ thông tin trang phục (Mặc định ban đầu rỗng 100%)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(200) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    character_name VARCHAR(120) NOT NULL,
    series_name VARCHAR(150) NOT NULL,
    category VARCHAR(50) DEFAULT 'COSTUME_FEMALE',
    size_label VARCHAR(20) DEFAULT 'M', -- S, M, L, Freesize
    measurements TEXT,                  -- "Cao 160-165cm, Ngực 86, Eo 68, Mông 90"
    reference_rent_price NUMERIC(12,0), -- Giá thuê tham khảo / ngày
    reference_buy_price NUMERIC(12,0),  -- Giá bán tham khảo (nếu có)
    images TEXT[] NOT NULL DEFAULT '{}',-- Mảng chứa các link ảnh từ Supabase Storage
    included_items TEXT,                -- "Gồm: Áo, Váy, Giáp vai, Wig"
    fabric_note TEXT,
    care_note TEXT,
    is_available BOOLEAN DEFAULT TRUE,  -- Bật/Tắt nhanh: True = Sẵn có, False = Đang thuê
    is_hidden BOOLEAN DEFAULT FALSE,    -- Ẩn khỏi trang web khi không muốn hiển thị
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bảng đánh dấu các ngày bộ đồ đã bận (Do Admin chọn tay)
CREATE TABLE IF NOT EXISTS public.blocked_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    note VARCHAR(255),                  -- Ghi chú nội bộ: "Bạn Nam thuê đi Fes"
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blocked_dates_product ON public.blocked_dates(product_id);

-- 3. Phân quyền Row Level Security (RLS) cho 2 bảng
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view visible products" ON public.products;
CREATE POLICY "Public can view visible products"
ON public.products FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Public can view blocked dates" ON public.blocked_dates;
CREATE POLICY "Public can view blocked dates"
ON public.blocked_dates FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admin full access products" ON public.products;
CREATE POLICY "Admin full access products"
ON public.products FOR ALL
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access blocked_dates" ON public.blocked_dates;
CREATE POLICY "Admin full access blocked_dates"
ON public.blocked_dates FOR ALL
USING (true)
WITH CHECK (true);

-- 4. Khởi tạo Bucket lưu trữ ảnh "costumes" trên Supabase Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('costumes', 'costumes', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Chính sách Storage cho Bucket 'costumes'
DROP POLICY IF EXISTS "Public Read Costumes Bucket" ON storage.objects;
CREATE POLICY "Public Read Costumes Bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'costumes');

DROP POLICY IF EXISTS "Admin Upload Costumes Bucket" ON storage.objects;
CREATE POLICY "Admin Upload Costumes Bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'costumes');

DROP POLICY IF EXISTS "Admin Update Costumes Bucket" ON storage.objects;
CREATE POLICY "Admin Update Costumes Bucket"
ON storage.objects FOR UPDATE
USING (bucket_id = 'costumes');

DROP POLICY IF EXISTS "Admin Delete Costumes Bucket" ON storage.objects;
CREATE POLICY "Admin Delete Costumes Bucket"
ON storage.objects FOR DELETE
USING (bucket_id = 'costumes');
