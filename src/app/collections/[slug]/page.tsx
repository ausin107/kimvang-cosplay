"use client";

import React, { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import {
  SlidersHorizontal,
  CalendarSearch,
  X,
  RotateCcw,
} from "lucide-react";
import { useKimVang } from "@/context/KimVangContext";
import { ProductCard } from "@/components/ProductCard";
import { isDateBlockedForProduct } from "@/data/mockData";

const SERIES_OPTIONS = [
  "Tất cả",
  "Genshin Impact",
  "Honkai: Star Rail",
  "Jujutsu Kaisen",
];

const SIZE_OPTIONS = ["Tất cả", "S", "M", "L", "Freesize"];

export default function CatalogListingPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "all";
  const { visibleProducts, blockedDates } = useKimVang();

  const [statusFilter, setStatusFilter] = useState<"ALL" | "AVAILABLE_ONLY">(
    "ALL"
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(
    slug !== "all" ? slug : "ALL"
  );
  const [selectedSeries, setSelectedSeries] = useState<string>("Tất cả");
  const [selectedSize, setSelectedSize] = useState<string>("Tất cả");
  const [eventDate, setEventDate] = useState<string>("");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    return visibleProducts.filter((p) => {
      if (selectedCategory !== "ALL" && p.category !== selectedCategory) {
        return false;
      }
      if (selectedSeries !== "Tất cả" && p.series_name !== selectedSeries) {
        return false;
      }
      if (
        selectedSize !== "Tất cả" &&
        p.size_label.toLowerCase() !== selectedSize.toLowerCase()
      ) {
        return false;
      }
      if (statusFilter === "AVAILABLE_ONLY" && !p.is_available) {
        return false;
      }
      if (eventDate) {
        if (!p.is_available) return false;
        const blocked = isDateBlockedForProduct(p.id, eventDate, blockedDates);
        if (blocked) return false;
      }
      return true;
    });
  }, [
    visibleProducts,
    blockedDates,
    selectedCategory,
    selectedSeries,
    selectedSize,
    statusFilter,
    eventDate,
  ]);

  const resetFilters = () => {
    setStatusFilter("ALL");
    setSelectedCategory("ALL");
    setSelectedSeries("Tất cả");
    setSelectedSize("Tất cả");
    setEventDate("");
  };

  const FilterControls = () => (
    <div className="space-y-6">
      {/* Event Date Availability Filter */}
      <div className="p-3.5 rounded-xl bg-rent-bg/60 border border-rent-border space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-rent-text flex items-center gap-1.5">
          <CalendarSearch className="w-4 h-4" />
          Kiểm tra ngày dự kiến đi Fes
        </label>
        <p className="text-[11px] text-muted">
          Ẩn các bộ đồ đã có lịch bận vào ngày bạn chọn.
        </p>
        <input
          type="date"
          value={eventDate}
          min="2026-11-01"
          max="2026-12-31"
          onChange={(e) => setEventDate(e.target.value)}
          className="w-full px-3 py-2 text-xs font-mono bg-white border border-rent-border rounded-lg focus:outline-none focus:border-rent-text"
        />
        {eventDate && (
          <button
            onClick={() => setEventDate("")}
            className="text-[11px] text-rent-text underline font-medium"
          >
            Xóa lọc ngày ({eventDate})
          </button>
        )}
      </div>

      {/* Availability Status */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-charcoal">
          Trạng thái tại Shop
        </p>
        <div className="grid grid-cols-1 gap-1.5 text-xs">
          {[
            { id: "ALL", label: "Tất cả trang phục" },
            { id: "AVAILABLE_ONLY", label: "Chỉ hiện bộ Đang sẵn có" },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setStatusFilter(opt.id as typeof statusFilter)}
              className={`px-3 py-2 rounded-lg text-left border transition-colors ${
                statusFilter === opt.id
                  ? "bg-jet text-gold border-jet font-semibold"
                  : "bg-white text-charcoal border-hairline hover:bg-offwhite"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-charcoal">
          Phân loại
        </p>
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "ALL", label: "Tất cả" },
            { id: "COSTUME_FEMALE", label: "Đồ Nữ" },
            { id: "COSTUME_MALE", label: "Đồ Nam" },
            { id: "WIG", label: "Tóc giả (Wig)" },
            { id: "PROP_WEAPON", label: "Vũ khí / Props" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1.5 rounded-lg text-xs border transition-colors ${
                selectedCategory === cat.id
                  ? "bg-charcoal text-white border-charcoal font-medium"
                  : "bg-white text-muted border-hairline hover:text-charcoal"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Size Filter */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-charcoal">
          Kích cỡ (Size)
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {SIZE_OPTIONS.map((sz) => (
            <button
              key={sz}
              onClick={() => setSelectedSize(sz)}
              className={`py-1.5 px-2 rounded-lg text-xs font-mono border transition-colors ${
                selectedSize === sz
                  ? "bg-gold text-jet border-gold font-bold"
                  : "bg-white text-charcoal border-hairline hover:bg-offwhite"
              }`}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* Series */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-charcoal">
          Series / Anime / Game
        </p>
        <div className="space-y-1">
          {SERIES_OPTIONS.map((sr) => (
            <button
              key={sr}
              onClick={() => setSelectedSeries(sr)}
              className={`w-full px-3 py-1.5 rounded-lg text-left text-xs transition-colors ${
                selectedSeries === sr
                  ? "bg-gold/20 text-charcoal font-semibold border border-gold/50"
                  : "text-muted hover:bg-offwhite hover:text-charcoal"
              }`}
            >
              {sr}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={resetFilters}
        className="w-full py-2 px-3 rounded-xl border border-hairline text-xs font-medium text-muted hover:text-charcoal flex items-center justify-center gap-1.5"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Đặt lại bộ lọc
      </button>
    </div>
  );

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 py-6">
      <div className="pb-5 border-b border-hairline flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-gold-dark">
            KIMVANG SHOWCASE CATALOG
          </span>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal mt-0.5">
            Catalog Trang Phục & Tra Cứu Lịch Trống
          </h1>
        </div>
        <span className="text-xs text-muted">
          Hiển thị <strong>{filteredProducts.length}</strong> trang phục
        </span>
      </div>

      {/* Mobile Sticky Filter Bar */}
      <div className="lg:hidden sticky top-14 z-30 bg-offwhite/95 backdrop-blur-xs py-3 border-b border-hairline flex items-center gap-2 -mx-4 px-4">
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="h-10 px-4 rounded-xl bg-jet text-gold text-xs font-semibold flex items-center justify-center gap-2 shrink-0"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Bộ lọc ({filteredProducts.length})</span>
        </button>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`shrink-0 px-3 py-1.5 rounded-full border text-[11px] font-medium ${
              statusFilter === "ALL"
                ? "bg-charcoal text-white border-charcoal"
                : "bg-white text-muted border-hairline"
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setStatusFilter("AVAILABLE_ONLY")}
            className={`shrink-0 px-3 py-1.5 rounded-full border text-[11px] font-medium ${
              statusFilter === "AVAILABLE_ONLY"
                ? "bg-charcoal text-white border-charcoal"
                : "bg-white text-muted border-hairline"
            }`}
          >
            Đang sẵn có
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
        <aside className="hidden lg:block lg:col-span-3">
          <div className="sticky top-24 p-5 rounded-2xl bg-white border border-hairline">
            <FilterControls />
          </div>
        </aside>

        <div className="lg:col-span-9 space-y-4">
          {filteredProducts.length === 0 ? (
            <div className="p-12 rounded-2xl bg-white border border-hairline text-center space-y-3">
              <p className="font-display font-semibold text-base text-charcoal">
                Không tìm thấy trang phục phù hợp với bộ lọc
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl bg-jet text-gold text-xs font-semibold"
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end lg:hidden">
          <div className="w-full h-[85vh] bg-white rounded-t-3xl p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <h3 className="font-display font-bold text-base">
                Bộ Lọc Catalog
              </h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1.5 rounded-full hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <FilterControls />
            </div>
            <div className="pt-3 border-t border-hairline">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full h-12 rounded-xl bg-jet text-gold font-display font-bold text-sm"
              >
                Xem {filteredProducts.length} trang phục
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
