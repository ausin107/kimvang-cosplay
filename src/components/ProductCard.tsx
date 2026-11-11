"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CalendarCheck2, Sparkles } from "lucide-react";
import { ShowcaseProduct } from "@/types/kimvang";
import { formatVND } from "@/data/mockData";

export function ProductCard({ product }: { product: ShowcaseProduct }) {
  const [isHovered, setIsHovered] = useState(false);

  const primaryImage = product.images[0];
  const secondaryImage = product.images[1] || product.images[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-white border border-hairline rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-gold/70 hover:shadow-md"
    >
      {/* 3:4 Aspect Ratio Art Frame */}
      <div>
        <div className="relative aspect-[3/4] w-full bg-offwhite overflow-hidden">
          <img
            src={isHovered ? secondaryImage : primaryImage}
            alt={product.name}
            className={`w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105 ${
              !product.is_available ? "opacity-85" : ""
            }`}
          />

          {/* Top Left & Right Badges: Series + Live Status (Sẵn có / Đang thuê) */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 pointer-events-none">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-jet/85 text-gold backdrop-blur-xs truncate">
              {product.series_name}
            </span>

            {product.is_available ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/95 text-emerald-700 border border-emerald-200 backdrop-blur-xs flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Sẵn có
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-900/90 text-amber-300 border border-amber-400/40 backdrop-blur-xs flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Đang thuê
              </span>
            )}
          </div>

          {/* Desktop Hover Quick CTA */}
          <div className="absolute inset-x-3 bottom-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 hidden sm:block">
            <div className="w-full py-2 px-3 rounded-xl bg-jet/90 text-white text-xs font-medium flex items-center justify-center gap-1.5 backdrop-blur-xs border border-gold/30">
              <CalendarCheck2 className="w-3.5 h-3.5 text-gold" />
              <span>Xem lịch trống & Nhắn Zalo</span>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-3 sm:p-4">
          <div className="flex items-center justify-between text-[11px] text-muted mb-1">
            <span className="font-medium text-charcoal/80 truncate">
              {product.character_name}
            </span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-offwhite border border-hairline font-semibold text-charcoal">
              Size {product.size_label}
            </span>
          </div>

          <h3 className="font-display font-semibold text-sm sm:text-base text-charcoal line-clamp-2 group-hover:text-gold-dark transition-colors">
            {product.name}
          </h3>
        </div>
      </div>

      {/* Reference Price Badges */}
      <div className="px-3 pb-3 sm:px-4 sm:pb-4 pt-1 space-y-1.5 tabular-nums">
        {product.reference_rent_price !== null && (
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-rent-bg border border-rent-border">
            <span className="text-[11px] font-semibold text-rent-text uppercase tracking-wide">
              Thuê
            </span>
            <span className="text-xs sm:text-sm font-bold text-rent-text">
              {formatVND(product.reference_rent_price)}
              <span className="text-[11px] font-normal">/ngày</span>
            </span>
          </div>
        )}

        {product.reference_buy_price !== null ? (
          <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-buy-bg border border-buy-border">
            <span className="text-[11px] font-medium text-buy-text">
              Giá bán tham khảo
            </span>
            <span className="text-xs font-semibold text-buy-text">
              {formatVND(product.reference_buy_price)}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-offwhite border border-hairline">
            <span className="text-[11px] text-muted flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-gold" /> Chỉ cho thuê
            </span>
            <span className="text-[11px] text-muted">Inbox Zalo giữ lịch</span>
          </div>
        )}
      </div>
    </Link>
  );
}
