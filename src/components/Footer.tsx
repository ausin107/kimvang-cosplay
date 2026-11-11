import React from "react";
import Link from "next/link";
import { Sparkles, Server, Database, Cloud, MessageCircle } from "lucide-react";
import { SHOP_CONFIG } from "@/data/mockData";

export function Footer() {
  return (
    <footer className="bg-white border-t border-hairline mt-16">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-jet text-gold flex items-center justify-center font-display font-bold text-base border border-gold/40">
                KV
              </div>
              <span className="font-display font-bold text-lg text-charcoal">
                KIM<span className="text-gold">VANG</span> SHOWCASE
              </span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Phòng trưng bày trang phục Cosplay trực tuyến — Xem số đo chi tiết,
              kiểm tra lịch trống theo thời gian thực và nhắn tin đặt thuê nhanh
              qua Zalo / Facebook Fanpage.
            </p>
            <div className="pt-1 flex flex-wrap gap-1.5 text-[11px] font-mono text-muted">
              <span className="px-2 py-0.5 rounded bg-offwhite border border-hairline">
                Vercel 0đ/tháng
              </span>
              <span className="px-2 py-0.5 rounded bg-jet text-gold">
                Supabase + R2
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm text-charcoal mb-3">
              Khách Xem Đồ (Storefront)
            </h4>
            <ul className="space-y-2 text-xs text-muted">
              <li>
                <Link href="/" className="hover:text-charcoal">
                  • Trang chủ & Lookbook Mùa Fes
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-charcoal">
                  • Catalog Trang phục & Lọc ngày trống
                </Link>
              </li>
              <li>
                <Link
                  href="/products/trang-phuc-raiden-shogun-fullset"
                  className="hover:text-charcoal"
                >
                  • Chi tiết Đồ (Xem lịch & Nhắn Zalo tự soạn tin)
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-charcoal">
                  • Hỏi đáp & Cẩm nang Bảo quản Wig/Props
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm text-charcoal mb-3">
              Quản Trị Viên (Admin CMS)
            </h4>
            <ul className="space-y-2 text-xs text-muted">
              <li>
                <Link href="/admin" className="hover:text-charcoal">
                  • Bảng Công tắc ON/OFF Trạng thái Đồ
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-charcoal">
                  • Bộ chọn Lịch bận Thủ công (Manual Blocked Dates)
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-charcoal">
                  • Upload ảnh trực tiếp lên Cloudflare R2 (Presigned URL)
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-charcoal">
                  • Đăng nhập Admin (Supabase Auth)
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-display font-semibold text-sm text-charcoal mb-3">
              Kiến Trúc All-in-One (0 VNĐ/tháng)
            </h4>
            <div className="p-3.5 rounded-xl bg-offwhite border border-hairline text-xs space-y-2">
              <div className="flex items-start gap-2">
                <Server className="w-4 h-4 text-charcoal shrink-0 mt-0.5" />
                <span>
                  <strong>Next.js trên Vercel:</strong> Chung 1 project cho cả
                  Storefront & `/admin`.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Database className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Supabase (Singapore):</strong> Chỉ 2 bảng{" "}
                  <code>products</code> & <code>blocked_dates</code> + Auth.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Cloud className="w-4 h-4 text-gold-dark shrink-0 mt-0.5" />
                <span>
                  <strong>Cloudflare R2:</strong> Lưu ảnh gốc miễn phí băng thông
                  Egress.
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-hairline flex flex-col sm:flex-row items-center justify-between text-xs text-muted gap-2">
          <p>
            © 2026 KimVang Cosplay Showcase • Liên hệ Zalo:{" "}
            <strong>{SHOP_CONFIG.zaloPhone}</strong>
          </p>
          <p className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            Minimalist Editorial Showcase + Manual Admin CMS
          </p>
        </div>
      </div>
    </footer>
  );
}
