import {
  ShowcaseProduct,
  BlockedDateRange,
  FaqItem,
} from "@/types/kimvang";

export const SHOP_CONFIG = {
  zaloPhone: process.env.NEXT_PUBLIC_SHOP_ZALO_PHONE || "0908123456",
  fanpageUsername:
    process.env.NEXT_PUBLIC_SHOP_FANPAGE_USERNAME || "kimvangcosplay",
  shopAddress: "285 Cách Mạng Tháng 8, Quận 10, TP. Hồ Chí Minh",
};

// Mặc định ban đầu chưa có bất kỳ sản phẩm nào (Empty 100%)
// Toàn bộ trang phục sẽ do Admin đăng nhập và upload lên Database.
export const INITIAL_PRODUCTS: ShowcaseProduct[] = [];

export const INITIAL_BLOCKED_DATES: BlockedDateRange[] = [];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "faq-1",
    category: "RENTAL_PROCESS",
    question: "Cách xem lịch trống trên web và nhắn tin đặt thuê qua Zalo / Fanpage?",
    answer_markdown:
      "Bạn chỉ cần vào trang chi tiết bộ đồ yêu thích, kiểm tra **Bảng lịch tháng** (các ngày màu trắng là ngày đang trống, ngày tô xám là đã có khách đặt). Sau đó chọn ngày bạn muốn thuê và bấm nút **Nhắn tin thuê đồ qua Zalo** hoặc **Liên hệ qua Facebook Fanpage** — hệ thống sẽ tự động soạn sẵn tin nhắn kèm tên bộ đồ, size và ngày thuê để nhân viên KimVang hỗ trợ giữ lịch ngay cho bạn.",
    sort_order: 1,
  },
  {
    id: "faq-2",
    category: "SHIPPING_TIMING",
    question: "Thuê đồ đi Fes cuối tuần thì nhận đồ như thế nào?",
    answer_markdown:
      "Bạn có thể qua trực tiếp cửa hàng KimVang để thử form và nhận đồ trước ngày sự kiện 1 ngày, hoặc nhắn Zalo để shop book ship nội thành / toàn quốc tới tận nhà trước ngày Fes.",
    sort_order: 2,
  },
  {
    id: "faq-3",
    category: "DAMAGE_POLICY",
    question: "Sau khi mặc đi sự kiện về tôi có cần tự giặt trang phục không?",
    answer_markdown:
      "**TUYỆT ĐỐI KHÔNG TỰ GIẶT MÁY HOẶC VÒ TAY.** Trang phục Cosplay có nhiều chi tiết gấm kim tuyến, da PU, giáp đúc và ren nhiều lớp. Shop đã bao gồm phí giặt hấp chuyên dụng trong giá thuê, bạn chỉ cần tháo rời phụ kiện kim loại và gửi trả.",
    comparison_tip: {
      free_laundry: "Bụi đường, mồ hôi, vết phấn trang điểm nhẹ → Miễn phí giặt hấp 100%.",
      deducted: "Tự ý bỏ máy giặt làm bong kim tuyến hoặc làm mất phụ kiện → Đền bù theo thỏa thuận.",
    },
    sort_order: 3,
  },
  {
    id: "faq-4",
    category: "WIG_PROP_CARE",
    question: "Cách bảo quản Tóc giả (Wig đã style) và Đạo cụ khi thuê?",
    answer_markdown:
      "Với **Wig đã style form**, luôn đặt lại lên đầu canh xốp ngay sau khi tháo ra và tránh đè vật nặng lên hộp đựng. Với **Đạo cụ Vũ khí/Giáp PVC**, không để cốp xe ngoài trời nắng nóng quá 45°C.",
    sort_order: 4,
  },
];

export function isDateBlockedForProduct(
  productId: string,
  dateStr: string,
  blockedDates: BlockedDateRange[]
): BlockedDateRange | null {
  for (const b of blockedDates) {
    if (b.product_id !== productId) continue;
    if (dateStr >= b.start_date && dateStr <= b.end_date) {
      return b;
    }
  }
  return null;
}

export function formatVND(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "Liên hệ";
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}

export function formatShortVND(amount: number | null | undefined): string {
  if (!amount) return "—";
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(amount % 1000000 === 0 ? 0 : 1)}M`;
  }
  return `${Math.round(amount / 1000)}k`;
}

export function formatDateVN(dateStr: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}
