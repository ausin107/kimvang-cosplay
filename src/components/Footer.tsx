import React from "react";
import Link from "next/link";
import { Sparkles, MessageCircle, Phone, MapPin, Clock, ShieldCheck, HeartHandshake } from "lucide-react";
import { SHOP_CONFIG } from "@/data/mockData";

export function Footer() {
  return (
    <footer className="bg-white border-t border-hairline mt-16">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Cột 1: Thông tin thương hiệu & Địa chỉ */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-jet text-gold flex items-center justify-center font-display font-bold text-base border border-gold/40">
                KV
              </div>
              <span className="font-display font-bold text-lg text-charcoal">
                KIM<span className="text-gold">VANG</span> SHOWCASE
              </span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Phòng trưng bày trang phục Cosplay cao cấp — Tra cứu số đo chi tiết,
              kiểm tra lịch trống theo thời gian thực và giữ đồ nhanh chóng qua
              Zalo & Facebook Fanpage cho mùa Fes.
            </p>
            <div className="space-y-1.5 text-xs text-muted pt-1">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gold-dark shrink-0 mt-0.5" />
                <span>{SHOP_CONFIG.shopAddress}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold-dark shrink-0" />
                <span>Mở cửa: 09:00 - 21:00 (Cả tuần & ngày lễ)</span>
              </div>
            </div>
          </div>

          {/* Cột 2: Khám phá danh mục */}
          <div>
            <h4 className="font-display font-semibold text-sm text-charcoal mb-3">
              Danh Mục Trang Phục
            </h4>
            <ul className="space-y-2 text-xs text-muted">
              <li>
                <Link href="/" className="hover:text-charcoal transition-colors">
                  • Trang chủ & Lookbook Nổi bật
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-charcoal transition-colors">
                  • Toàn bộ Catalog & Lọc ngày trống
                </Link>
              </li>
              <li>
                <Link href="/collections/COSTUME_FEMALE" className="hover:text-charcoal transition-colors">
                  • Trang phục Nữ (Genshin, HSR, Anime)
                </Link>
              </li>
              <li>
                <Link href="/collections/COSTUME_MALE" className="hover:text-charcoal transition-colors">
                  • Trang phục Nam (Cổ trang, Giáp, Suit)
                </Link>
              </li>
              <li>
                <Link href="/collections/WIG" className="hover:text-charcoal transition-colors">
                  • Tóc giả (Wig) Style sẵn
                </Link>
              </li>
              <li>
                <Link href="/collections/PROP_WEAPON" className="hover:text-charcoal transition-colors">
                  • Vũ khí & Phụ kiện Đạo cụ
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Hướng dẫn & Chính sách */}
          <div>
            <h4 className="font-display font-semibold text-sm text-charcoal mb-3">
              Hỗ Trợ & Chính Sách
            </h4>
            <ul className="space-y-2 text-xs text-muted">
              <li>
                <Link href="/faq" className="hover:text-charcoal transition-colors">
                  • Hướng dẫn xem lịch & Đặt cọc giữ đồ
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-charcoal transition-colors">
                  • Miễn phí giặt hấp 100% tại Shop
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-charcoal transition-colors">
                  • Hỗ trợ nhận đồ trước ngày Fes 1 ngày
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-charcoal transition-colors">
                  • Bảng số đo & Hướng dẫn thử size
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-charcoal transition-colors">
                  • Quy định bảo quản Wig & Phụ kiện
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 4: Đặt lịch & Liên hệ nhanh */}
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-sm text-charcoal mb-3">
              Liên Hệ Đặt Lịch
            </h4>
            <div className="p-4 rounded-2xl bg-offwhite border border-hairline space-y-3 text-xs">
              <p className="text-muted leading-relaxed">
                Nhắn tin trực tiếp qua Zalo để được nhân viên giữ đồ, gửi clip check đồ và tư vấn size nhanh nhất.
              </p>
              <a
                href={`https://zalo.me/${SHOP_CONFIG.zaloPhone}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-jet text-gold font-semibold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-gold" />
                <span>Nhắn Zalo: {SHOP_CONFIG.zaloPhone}</span>
              </a>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Cam kết giữ đúng đồ & hỗ trợ tận tình</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-hairline flex flex-col sm:flex-row items-center justify-between text-xs text-muted gap-2">
          <p>
            © 2026 KimVang Cosplay Showcase. Toàn bộ hình ảnh thuộc bản quyền của shop.
          </p>
          <p className="flex items-center gap-1.5 text-charcoal">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>Phục vụ cộng đồng Cosplay & Anime toàn quốc</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
