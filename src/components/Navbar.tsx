"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Menu,
  X,
  Sparkles,
  MessageCircle,
  LayoutDashboard,
} from "lucide-react";
import { useKimVang } from "@/context/KimVangContext";
import { formatVND, SHOP_CONFIG } from "@/data/mockData";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { visibleProducts } = useKimVang();

  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const isAdmin = pathname?.startsWith("/admin");

  const searchResults =
    searchQuery.trim().length > 0
      ? visibleProducts.filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.character_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.series_name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-hairline">
        {/* Top Announcement Bar */}
        <div className="bg-jet text-white text-xs py-1.5 px-4">
          <div className="max-w-8xl mx-auto flex items-center justify-between">
            <p className="flex items-center gap-1.5 truncate">
              <Sparkles className="w-3.5 h-3.5 text-gold shrink-0" />
              <span>
                <strong className="text-gold">KIMVANG SHOWCASE:</strong> Xem lịch
                trống trực tuyến • Nhắn Zalo/Fanpage giữ đồ 1 chạm • Miễn phí
                giặt hấp 100%
              </span>
            </p>
            <div className="hidden md:flex items-center gap-4 text-zinc-300">
              <a
                href={`https://zalo.me/${SHOP_CONFIG.zaloPhone}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-gold transition-colors"
              >
                Zalo: {SHOP_CONFIG.zaloPhone}
              </a>
              <span>•</span>
              <Link
                href={isAdmin ? "/" : "/admin"}
                className="text-gold font-medium hover:underline flex items-center gap-1"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                {isAdmin ? "Về Trang Khách Xem Đồ" : "Quản trị viên (/admin)"}
              </Link>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="max-w-8xl mx-auto px-4 sm:px-6 h-14 md:h-[72px] flex items-center justify-between gap-4">
          {/* Left: Hamburger + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileMenu(true)}
              className="md:hidden p-2 -ml-2 text-charcoal hover:bg-zinc-100 rounded-lg"
              aria-label="Mở menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-jet text-gold flex items-center justify-center font-display font-bold text-lg border border-gold/40">
                KV
              </div>
              <div>
                <span className="font-display font-bold text-lg md:text-xl tracking-tight text-charcoal">
                  KIM<span className="text-gold">VANG</span>
                </span>
                <span className="hidden sm:block text-[10px] uppercase tracking-[0.2em] text-muted -mt-1">
                  Cosplay Showcase
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-charcoal">
            <Link
              href="/"
              className={`py-1 border-b-2 transition-colors ${
                pathname === "/"
                  ? "border-gold text-jet font-semibold"
                  : "border-transparent text-muted hover:text-charcoal"
              }`}
            >
              Trang chủ
            </Link>
            <Link
              href="/catalog"
              className={`py-1 border-b-2 transition-colors ${
                pathname?.startsWith("/catalog") ||
                pathname?.startsWith("/collections")
                  ? "border-gold text-jet font-semibold"
                  : "border-transparent text-muted hover:text-charcoal"
              }`}
            >
              Catalog Trang phục
            </Link>
            <Link
              href="/faq"
              className={`py-1 border-b-2 transition-colors ${
                pathname?.startsWith("/faq")
                  ? "border-gold text-jet font-semibold"
                  : "border-transparent text-muted hover:text-charcoal"
              }`}
            >
              Hỏi đáp & Bảo quản
            </Link>
            <Link
              href="/admin"
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                isAdmin
                  ? "bg-jet text-gold border-gold"
                  : "bg-gold/10 text-charcoal border-gold/30 hover:bg-gold/20"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-gold-dark" />
              Admin CMS (/admin)
            </Link>
          </nav>

          {/* Right: Instant Search + Direct Zalo Contact Button */}
          <div className="flex items-center gap-2.5">
            <div className="relative hidden md:block w-72 lg:w-80">
              <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm nhân vật (Raiden, Gojo, Furina...)"
                className="w-full pl-9 pr-8 py-2 text-sm bg-offwhite border border-hairline rounded-full focus:outline-none focus:border-gold focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Autocomplete Popover */}
              {searchQuery.trim().length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-hairline rounded-xl shadow-xl overflow-hidden z-50">
                  <div className="px-3 py-2 bg-offwhite border-b border-hairline text-[11px] font-medium text-muted uppercase tracking-wider">
                    Gợi ý trang phục ({searchResults.length})
                  </div>
                  {searchResults.length === 0 ? (
                    <div className="p-4 text-sm text-muted text-center">
                      Không tìm thấy trang phục phù hợp.
                    </div>
                  ) : (
                    <div className="max-h-72 overflow-y-auto divide-y divide-hairline">
                      {searchResults.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setSearchQuery("");
                            router.push(`/products/${item.slug}`);
                          }}
                          className="w-full px-3.5 py-2.5 text-left hover:bg-offwhite flex items-center gap-3 transition-colors"
                        >
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            className="w-10 h-12 object-cover rounded border border-hairline shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-charcoal truncate">
                              {item.character_name} — Size {item.size_label}
                            </p>
                            <p className="text-xs text-muted truncate">
                              {item.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1 tabular-nums">
                              <span className="text-[11px] px-1.5 py-0.5 rounded bg-rent-bg text-rent-text font-medium">
                                Thuê: {formatVND(item.reference_rent_price)}/ngày
                              </span>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                                  item.is_available
                                    ? "bg-buy-bg text-buy-text"
                                    : "bg-zinc-100 text-muted"
                                }`}
                              >
                                {item.is_available ? "Sẵn có" : "Đang thuê"}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Search Trigger */}
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="md:hidden p-2 text-charcoal hover:bg-zinc-100 rounded-full"
              aria-label="Tìm kiếm"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Direct Zalo Button */}
            <a
              href={`https://zalo.me/${SHOP_CONFIG.zaloPhone}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-jet text-gold hover:bg-zinc-800 transition-colors text-xs sm:text-sm font-semibold"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Nhắn Zalo Shop</span>
              <span className="sm:hidden">Zalo</span>
            </a>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showMobileSearch && (
          <div className="md:hidden px-4 pb-3 bg-white border-b border-hairline">
            <div className="relative">
              <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập tên nhân vật (Raiden, Gojo, Furina...)"
                className="w-full pl-9 pr-9 py-2.5 text-sm bg-offwhite border border-hairline rounded-xl focus:outline-none focus:border-gold"
              />
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowMobileSearch(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {searchResults.length > 0 && (
              <div className="mt-2 bg-offwhite rounded-xl border border-hairline divide-y divide-hairline max-h-60 overflow-y-auto">
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSearchQuery("");
                      setShowMobileSearch(false);
                      router.push(`/products/${item.slug}`);
                    }}
                    className="w-full p-2.5 text-left flex items-center gap-3"
                  >
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-9 h-11 object-cover rounded"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-charcoal truncate">
                        {item.name} (Size {item.size_label})
                      </p>
                      <p className="text-[11px] text-rent-text font-medium tabular-nums">
                        Thuê: {formatVND(item.reference_rent_price)}/ngày
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </header>

      {/* Mobile Navigation Drawer */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs md:hidden">
          <div className="w-72 h-full bg-white p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-hairline">
                <span className="font-display font-bold text-lg">
                  KIM<span className="text-gold">VANG</span> SHOWCASE
                </span>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-1.5 rounded-lg hover:bg-zinc-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="mt-4 flex flex-col gap-1 text-sm font-medium">
                <Link
                  href="/"
                  onClick={() => setShowMobileMenu(false)}
                  className="px-3 py-2.5 rounded-lg hover:bg-offwhite"
                >
                  1. Trang chủ (Lookbook & Kệ hàng)
                </Link>
                <Link
                  href="/catalog"
                  onClick={() => setShowMobileMenu(false)}
                  className="px-3 py-2.5 rounded-lg hover:bg-offwhite"
                >
                  2. Catalog Trang phục & Lịch trống
                </Link>
                <Link
                  href="/faq"
                  onClick={() => setShowMobileMenu(false)}
                  className="px-3 py-2.5 rounded-lg hover:bg-offwhite"
                >
                  3. Hỏi đáp & Cẩm nang Bảo quản
                </Link>
                <div className="my-2 border-t border-hairline" />
                <Link
                  href="/admin"
                  onClick={() => setShowMobileMenu(false)}
                  className="px-3 py-2.5 rounded-lg bg-jet text-gold font-semibold flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Quản trị viên (/admin)
                </Link>
              </nav>
            </div>
            <div className="text-xs text-muted border-t border-hairline pt-3">
              KimVang Cosplay Showcase • All-in-One trên Vercel (0đ/tháng)
            </div>
          </div>
        </div>
      )}
    </>
  );
}
