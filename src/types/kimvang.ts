export type ProductCategory =
  | "COSTUME_FEMALE"
  | "COSTUME_MALE"
  | "WIG"
  | "PROP_WEAPON"
  | "ACCESSORY";

export type FaqCategory =
  | "RENTAL_PROCESS"
  | "SHIPPING_TIMING"
  | "DAMAGE_POLICY"
  | "WIG_PROP_CARE";

/**
 * Bảng 1: products (Thông tin trang phục trên Supabase)
 */
export interface ShowcaseProduct {
  id: string;
  slug: string;
  name: string;
  character_name: string;
  series_name: string;
  category: ProductCategory;
  size_label: string; // "S", "M", "L", "Freesize"
  measurements: string; // "Cao 160-165cm, Ngực 86, Eo 68, Mông 90"
  reference_rent_price: number | null; // Giá thuê tham khảo / ngày
  reference_buy_price: number | null; // Giá bán tham khảo (nếu có)
  images: string[]; // Mảng chứa các link ảnh từ Cloudflare R2
  included_items: string; // "Gồm: Áo, Váy, Giáp vai, Wig"
  fabric_note?: string;
  care_note?: string;
  is_available: boolean; // True = Sẵn có (ON), False = Đang có người thuê (OFF)
  is_hidden: boolean; // True = Tạm ẩn khỏi trang web
  created_at: string;
}

/**
 * Bảng 2: blocked_dates (Các ngày bộ đồ đã bận do Admin chọn tay)
 */
export interface BlockedDateRange {
  id: string;
  product_id: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  note: string; // Ghi chú nội bộ: "Bạn Nam thuê đi Fes"
  created_at?: string;
}

export interface FaqItem {
  id: string;
  category: FaqCategory;
  question: string;
  answer_markdown: string;
  comparison_tip?: {
    free_laundry: string;
    deducted: string;
  };
  sort_order: number;
}
