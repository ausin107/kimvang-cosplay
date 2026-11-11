"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Sparkles,
  MessageCircle,
  PackageCheck,
  ArrowRight,
  UploadCloud,
  Lock,
} from "lucide-react";
import { useKimVang } from "@/context/KimVangContext";
import { ProductCard } from "@/components/ProductCard";

const QUICK_CATEGORIES = [
  {
    slug: "all",
    title: "Anime / Game",
    subtitle: "Genshin, HSR, JJK",
    thumb:
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=300&q=80",
  },
  {
    slug: "COSTUME_FEMALE",
    title: "Đồ Nữ (Female)",
    subtitle: "Gấm, Dạ hội, Kimono",
    thumb:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=300&q=80",
  },
  {
    slug: "COSTUME_MALE",
    title: "Đồ Nam (Male)",
    subtitle: "Suit, Cổ trang, Giáp",
    thumb:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  },
  {
    slug: "WIG",
    title: "Tóc Giả - Wig",
    subtitle: "Đã style sẵn kèm canh",
    thumb:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80",
  },
  {
    slug: "PROP_WEAPON",
    title: "Vũ Khí / Phụ Kiện",
    subtitle: "Đạo cụ LED & Giáp PVC",
    thumb:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80",
  },
];

export default function HomePage() {
  const { visibleProducts, isLoadingData, isAdminAuthenticated } = useKimVang();
  const [quickFilter, setQuickFilter] = useState<"ALL" | "AVAILABLE_ONLY">(
    "ALL"
  );

  const displayedProducts = visibleProducts.filter((p) => {
    if (quickFilter === "ALL") return true;
    return p.is_available;
  });

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-10 sm:space-y-14">
      {/* 1. KỆ TRANG PHỤC TRƯNG BÀY (Đặt lên đầu tiên: nếu chưa có gì sẽ mời đăng nhập Admin) */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-gold-dark">
              KIMVANG COSPLAY SHOWCASE • LIVE SUPABASE CATALOG
            </span>
            <h1 className="font-display font-bold text-xl sm:text-3xl text-charcoal mt-0.5">
              Kệ Trang Phục Cosplay Trên Web
            </h1>
            <p className="text-xs sm:text-sm text-muted">
              Toàn bộ trang phục được tải trực tiếp từ cơ sở dữ liệu Supabase
              bởi Quản trị viên
            </p>
          </div>

          {visibleProducts.length > 0 && (
            <div className="inline-flex p-1 rounded-xl bg-white border border-hairline self-start">
              <button
                onClick={() => setQuickFilter("ALL")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  quickFilter === "ALL"
                    ? "bg-jet text-gold"
                    : "text-muted hover:text-charcoal"
                }`}
              >
                Tất cả ({visibleProducts.length})
              </button>
              <button
                onClick={() => setQuickFilter("AVAILABLE_ONLY")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  quickFilter === "AVAILABLE_ONLY"
                    ? "bg-jet text-gold"
                    : "text-muted hover:text-charcoal"
                }`}
              >
                Đang sẵn có (
                {visibleProducts.filter((p) => p.is_available).length})
              </button>
            </div>
          )}
        </div>

        {isLoadingData ? (
          <div className="p-12 rounded-3xl bg-white border border-hairline text-center text-sm text-muted">
            Đang tải dữ liệu trang phục từ Database...
          </div>
        ) : visibleProducts.length === 0 ? (
          /* TRẠNG THÁI MẶC ĐỊNH KHI MỚI VÀO: CHƯA CÓ SẢN PHẨM NÀO HẾT -> BUỘC ĐĂNG NHẬP ADMIN ĐỂ UPLOAD */
          <div className="p-8 sm:p-14 rounded-3xl bg-white border-2 border-dashed border-gold/60 text-center space-y-4 max-w-2xl mx-auto my-6 shadow-2xs">
            <div className="w-14 h-14 rounded-2xl bg-jet text-gold flex items-center justify-center mx-auto border border-gold/40">
              <UploadCloud className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold bg-gold/15 text-gold-dark">
                <Sparkles className="w-3 h-3" /> KỆ HÀNG ĐANG TRỐNG (0 SẢN PHẨM)
              </span>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-charcoal">
                Chưa có trang phục nào được tải lên hệ thống
              </h2>
              <p className="text-xs sm:text-sm text-muted max-w-md mx-auto leading-relaxed">
                Hệ thống khởi tạo trắng hoàn toàn (không có dữ liệu mẫu). Vui
                lòng đăng nhập vào trang <strong>Quản trị viên (/admin)</strong>{" "}
                để upload ảnh lên Supabase Storage và lưu thông tin bộ đồ đầu
                tiên vào Database.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={isAdminAuthenticated ? "/admin" : "/admin/login"}
                className="h-12 px-6 rounded-xl bg-jet text-gold font-display font-bold text-sm flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {isAdminAuthenticated
                    ? "Vào Trang Admin Để Upload Đồ Ngay"
                    : "Đăng Nhập Admin Để Upload Đồ Lên Web"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 2. DANH MỤC NHANH */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-lg sm:text-xl text-charcoal">
              Danh Mục Trang Phục
            </h2>
            <p className="text-xs text-muted">
              Lọc nhanh theo phân loại trang phục, tóc giả hoặc vũ khí đạo cụ
            </p>
          </div>
          <Link
            href="/catalog"
            className="text-xs font-semibold text-charcoal hover:text-gold-dark flex items-center gap-1"
          >
            Xem toàn bộ Catalog <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex lg:grid lg:grid-cols-5 gap-3 sm:gap-4 overflow-x-auto pb-2 lg:pb-0">
          {QUICK_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/collections/${cat.slug}`}
              className="shrink-0 w-60 lg:w-auto p-3 rounded-2xl bg-white border border-hairline flex items-center gap-3.5 transition-all duration-200 hover:scale-[1.03] hover:border-gold"
            >
              <img
                src={cat.thumb}
                alt={cat.title}
                className="w-16 h-16 rounded-full object-cover border border-hairline shrink-0"
              />
              <div className="min-w-0">
                <p className="font-display font-semibold text-sm text-charcoal truncate">
                  {cat.title}
                </p>
                <p className="text-xs text-muted truncate mt-0.5">
                  {cat.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. QUY TRÌNH 3 BƯỚC THUÊ ĐỒ QUA ZALO / FANPAGE */}
      <section className="p-5 sm:p-6 rounded-2xl bg-white border border-hairline">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-offwhite border border-hairline">
            <div className="w-10 h-10 rounded-xl bg-rent-bg text-rent-text flex items-center justify-center shrink-0">
              <CalendarCheck className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <p className="font-display font-semibold text-sm text-charcoal">
                1. Xem số đo & Chọn ngày trống
              </p>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Mở trang chi tiết bộ đồ để xem bảng số đo và những ngày đang
                trống (không bị tô xám) trên lịch.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-offwhite border border-hairline">
            <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold-dark flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <p className="font-display font-semibold text-sm text-charcoal">
                2. Bấm nút Nhắn Zalo / Fanpage
              </p>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Hệ thống tự động soạn sẵn câu nhắn:{" "}
                <em>
                  &quot;Chào shop, mình muốn hỏi thuê bộ [Tên] - Size M vào ngày
                  [...]&quot;
                </em>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-offwhite border border-hairline">
            <div className="w-10 h-10 rounded-xl bg-buy-bg text-buy-text flex items-center justify-center shrink-0">
              <PackageCheck className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <p className="font-display font-semibold text-sm text-charcoal">
                3. Chốt lịch nhanh & Nhận đồ
              </p>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Admin xác nhận giữ đồ và khóa lịch trên web ngay lập tức. Nhận đồ
                trước Fes 1 ngày, trả đồ không cần giặt.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
