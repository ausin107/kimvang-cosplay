"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ZoomIn,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Ruler,
  Package,
  X,
  ChevronRight,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { useKimVang } from "@/context/KimVangContext";
import {
  formatVND,
  formatDateVN,
  isDateBlockedForProduct,
  SHOP_CONFIG,
} from "@/data/mockData";

const NOV_2026_DAYS = Array.from({ length: 30 }, (_, i) => {
  const day = String(i + 1).padStart(2, "0");
  return `2026-11-${day}`;
});

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { products, blockedDates, isLoadingData } = useKimVang();

  const product = products.find((p) => p.slug === slug);

  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isLoupeActive, setIsLoupeActive] = useState(false);
  const [loupePos, setLoupePos] = useState({ x: 50, y: 50 });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(2.5);

  const [startDate, setStartDate] = useState("2026-11-18");
  const [endDate, setEndDate] = useState("2026-11-20");
  const [selectingBound, setSelectingBound] = useState<"START" | "END">(
    "START"
  );
  const [copiedState, setCopiedState] = useState<
    "NONE" | "ZALO" | "FB" | "COPY"
  >("NONE");

  if (isLoadingData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-sm text-muted">
        Đang tải thông tin trang phục...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="font-display font-bold text-xl text-charcoal">
          Không tìm thấy trang phục này trong Database
        </h1>
        <p className="text-xs text-muted">
          Trang phục chưa được tải lên hoặc đã bị xóa khỏi hệ thống.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="px-4 py-2.5 rounded-xl bg-white border border-hairline text-xs font-semibold"
          >
            Về Trang chủ
          </Link>
          <Link
            href="/admin"
            className="px-4 py-2.5 rounded-xl bg-jet text-gold text-xs font-bold"
          >
            Vào Admin Upload Đồ
          </Link>
        </div>
      </div>
    );
  }

  const activeImage = product.images[activeMediaIndex] || product.images[0];

  const productBlockedList = blockedDates.filter(
    (b) => b.product_id === product.id
  );

  const handleDayClick = (dateStr: string) => {
    const blocked = isDateBlockedForProduct(product.id, dateStr, blockedDates);
    if (blocked) return;

    if (selectingBound === "START" || dateStr < startDate) {
      setStartDate(dateStr);
      if (dateStr > endDate) setEndDate(dateStr);
      setSelectingBound("END");
    } else {
      setEndDate(dateStr);
      setSelectingBound("START");
    }
  };

  const formattedSelectedRange =
    startDate === endDate
      ? formatDateVN(startDate)
      : `${formatDateVN(startDate)} - ${formatDateVN(endDate)}`;

  const prefilledMessage = `Chào shop, mình muốn hỏi thuê bộ ${product.character_name} - Size ${product.size_label} vào ngày ${formattedSelectedRange}`;

  const handleContactChannel = async (channel: "ZALO" | "FB" | "COPY") => {
    try {
      await navigator.clipboard.writeText(prefilledMessage);
    } catch {}
    setCopiedState(channel);
    setTimeout(() => setCopiedState("NONE"), 4000);

    if (channel === "ZALO") {
      window.open(
        `https://zalo.me/${SHOP_CONFIG.zaloPhone}`,
        "_blank",
        "noopener,noreferrer"
      );
    } else if (channel === "FB") {
      window.open(
        `https://m.me/${SHOP_CONFIG.fanpageUsername}?text=${encodeURIComponent(
          prefilledMessage
        )}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  const includedArray = (product.included_items || "")
    .replace(/^Gồm[^:]*:\s*/i, "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 py-6 pb-28 lg:pb-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted mb-5 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-charcoal">
          Trang chủ
        </Link>
        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        <Link href="/catalog" className="hover:text-charcoal">
          {product.series_name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        <span className="text-charcoal font-medium truncate">
          {product.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT 7 COLUMNS */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-col-reverse sm:flex-row gap-3.5">
            <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:w-20 shrink-0">
              {product.images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveMediaIndex(idx)}
                  className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    activeMediaIndex === idx
                      ? "border-gold shadow-xs"
                      : "border-hairline opacity-75 hover:opacity-100"
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${product.name} góc ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            <div
              className="relative flex-1 aspect-[3/4] rounded-2xl overflow-hidden bg-white border border-hairline cursor-crosshair select-none"
              onMouseEnter={() => setIsLoupeActive(true)}
              onMouseLeave={() => setIsLoupeActive(false)}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                setLoupePos({ x, y });
              }}
              onClick={() => setIsLightboxOpen(true)}
            >
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />

              {isLoupeActive && (
                <div
                  className="hidden sm:block pointer-events-none absolute w-48 h-48 rounded-full border-2 border-gold shadow-2xl overflow-hidden z-20"
                  style={{
                    left: `calc(${loupePos.x}% - 96px)`,
                    top: `calc(${loupePos.y}% - 96px)`,
                    backgroundImage: `url(${activeImage})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "260%",
                    backgroundPosition: `${loupePos.x}% ${loupePos.y}%`,
                  }}
                >
                  <div className="absolute bottom-2 inset-x-0 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-jet/80 text-gold text-[9px] font-mono">
                      Loupe 2.5x • Soi chất vải
                    </span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLightboxOpen(true);
                }}
                className="absolute bottom-3.5 right-3.5 px-3.5 py-2 rounded-xl bg-jet/90 text-white text-xs font-semibold flex items-center gap-1.5 border border-gold/40 hover:bg-jet"
              >
                <ZoomIn className="w-4 h-4 text-gold" />
                <span>Kính lúp: Xem cận cảnh vải 4x</span>
              </button>
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-hairline space-y-5">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <div className="flex items-center gap-2">
                <Ruler className="w-5 h-5 text-gold-dark" />
                <h2 className="font-display font-bold text-base sm:text-lg text-charcoal">
                  Thông Số Kích Cỡ & Phụ Kiện Đi Kèm
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-gold/20 text-jet font-mono font-bold text-xs">
                Size {product.size_label}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-offwhite border border-hairline space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">
                Số đo chuẩn của bộ đồ (Size {product.size_label}):
              </p>
              <p className="text-sm font-semibold text-charcoal">
                {product.measurements}
              </p>
            </div>

            {includedArray.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-rent-text" />
                  <h3 className="font-display font-bold text-sm text-charcoal">
                    Danh sách phụ kiện đi kèm ({includedArray.length} món):
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {includedArray.map((item, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-offwhite border border-hairline flex items-center gap-2.5 text-xs font-medium text-charcoal"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 rounded-xl bg-buy-bg/60 border border-buy-border flex items-start gap-2.5 text-xs text-charcoal">
              <ShieldCheck className="w-4 h-4 text-buy-text shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-buy-text">
                  Quy định bảo quản (Miễn phí giặt hấp 100%):
                </p>
                <p className="mt-0.5">
                  {product.care_note ||
                    "Shop tự giặt hấp sau khi trả đồ — Khách hàng vui lòng không tự ý bỏ trang phục vào máy giặt."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT 5 COLUMNS */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 p-5 sm:p-6 rounded-3xl bg-white border border-hairline shadow-sm space-y-5 tabular-nums">
            <div className="space-y-2 border-b border-hairline pb-4">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-gold/20 text-charcoal">
                  {product.series_name} • {product.character_name}
                </span>
                {product.is_available ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-buy-bg text-buy-text border border-buy-border">
                    ● Đang sẵn có
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
                    ● Đang có người thuê
                  </span>
                )}
              </div>

              <h1 className="font-display font-bold text-xl sm:text-2xl text-charcoal">
                {product.name}
              </h1>
              <p className="text-xs text-muted">
                Kích cỡ:{" "}
                <strong className="text-charcoal font-mono">
                  Size {product.size_label}
                </strong>{" "}
                ({product.measurements})
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-offwhite border border-hairline">
              <div>
                <p className="text-[11px] font-medium text-muted">
                  Giá thuê tham khảo
                </p>
                <p className="text-lg sm:text-xl font-display font-bold text-rent-text">
                  {formatVND(product.reference_rent_price)}
                  <span className="text-xs font-normal"> / ngày</span>
                </p>
              </div>
              <div className="border-l border-hairline pl-3">
                <p className="text-[11px] font-medium text-muted">
                  Giá bán tham khảo
                </p>
                <p className="text-lg sm:text-xl font-display font-bold text-buy-text">
                  {product.reference_buy_price
                    ? formatVND(product.reference_buy_price)
                    : "Chỉ cho thuê"}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-offwhite border border-hairline space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-charcoal flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-rent-text" />
                  Lịch Xem Nhanh (Tháng 11 / 2026)
                </span>
                <span className="text-[11px] text-rent-text font-semibold">
                  Chạm để chọn ngày thuê
                </span>
              </div>

              <div className="grid grid-cols-6 gap-1.5">
                {NOV_2026_DAYS.map((dStr) => {
                  const dayNum = dStr.slice(-2);
                  const blockedRecord = isDateBlockedForProduct(
                    product.id,
                    dStr,
                    blockedDates
                  );
                  const isBlocked = !!blockedRecord;
                  const isSelected =
                    !isBlocked && dStr >= startDate && dStr <= endDate;

                  return (
                    <button
                      key={dStr}
                      type="button"
                      disabled={isBlocked}
                      onClick={() => handleDayClick(dStr)}
                      title={
                        isBlocked
                          ? `Đã có người thuê (${blockedRecord?.note})`
                          : "Đang trống — Bấm để chọn ngày"
                      }
                      className={`py-1.5 rounded-lg text-xs font-mono border transition-all flex flex-col items-center ${
                        isBlocked
                          ? "bg-zinc-200 text-zinc-400 border-transparent line-through cursor-not-allowed"
                          : isSelected
                          ? "bg-rent-text text-white border-rent-text font-bold shadow-2xs"
                          : "bg-white text-charcoal border-hairline hover:border-gold"
                      }`}
                    >
                      <span>{dayNum}/11</span>
                      <span className="text-[9px]">
                        {isBlocked ? "Đã bận" : isSelected ? "Chọn" : "Trống"}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted pt-1 border-t border-hairline">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-white border border-hairline inline-block" />
                  Ngày trống
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-rent-text inline-block" />
                  Ngày chọn ({formattedSelectedRange})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-zinc-300 inline-block" />
                  Đã có người thuê
                </span>
              </div>

              {productBlockedList.length > 0 && (
                <div className="text-[11px] text-muted bg-white p-2.5 rounded-xl border border-hairline">
                  <strong className="text-charcoal">Các ngày đã kín lịch:</strong>{" "}
                  {productBlockedList
                    .map(
                      (b) =>
                        `${formatDateVN(b.start_date)} → ${formatDateVN(
                          b.end_date
                        )}`
                    )
                    .join(" • ")}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-rent-bg/60 border border-rent-border space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rent-text flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Tin nhắn tự động soạn sẵn cho bạn:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleContactChannel("COPY")}
                    className="text-[11px] font-semibold text-rent-text hover:underline flex items-center gap-1"
                  >
                    {copiedState === "COPY" ? (
                      <>
                        <Check className="w-3 h-3" /> Đã chép
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Sao chép câu nhắn
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs font-medium text-charcoal italic bg-white p-2.5 rounded-xl border border-rent-border">
                  &ldquo;{prefilledMessage}&rdquo;
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleContactChannel("ZALO")}
                className="w-full py-3.5 px-5 rounded-2xl bg-[#0068FF] hover:bg-[#0057D9] text-white font-display font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Nhắn tin thuê đồ qua Zalo</span>
                <ExternalLink className="w-4 h-4 opacity-80" />
              </button>

              <button
                type="button"
                onClick={() => handleContactChannel("FB")}
                className="w-full py-3.5 px-5 rounded-2xl bg-jet hover:bg-zinc-800 text-gold font-display font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Liên hệ qua Facebook Fanpage</span>
                <ExternalLink className="w-4 h-4 opacity-80" />
              </button>

              {(copiedState === "ZALO" || copiedState === "FB") && (
                <p className="text-xs text-center text-emerald-700 bg-buy-bg border border-buy-border py-2 px-3 rounded-xl font-medium">
                  ✓ Đã tự động sao chép tin nhắn! Bạn chỉ cần bấm{" "}
                  <strong>Dán (Paste)</strong> vào khung chat vừa mở.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FULLSCREEN 4X LIGHTBOX MODAL */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6">
          <div className="flex items-center justify-between text-white">
            <div>
              <h3 className="font-display font-bold text-sm sm:text-base text-gold">
                Chế Độ Kính Lúp Soi Chất Liệu Vải & Phụ Kiện (Zoom 4x)
              </h3>
              <p className="text-xs text-zinc-300">{product.name}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-xs">
                {[1.5, 2.5, 4].map((z) => (
                  <button
                    key={z}
                    onClick={() => setLightboxZoom(z)}
                    className={`px-2 py-0.5 rounded-full font-mono ${
                      lightboxZoom === z
                        ? "bg-gold text-jet font-bold"
                        : "text-white"
                    }`}
                  >
                    {z}x
                  </button>
                ))}
              </div>
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 rounded-full bg-white/15 hover:bg-white/25 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 my-4 overflow-auto flex items-center justify-center rounded-2xl border border-white/15 bg-black/50">
            <img
              src={activeImage}
              alt={product.name}
              style={{ transform: `scale(${lightboxZoom})` }}
              className="max-h-[70vh] object-contain transition-transform duration-200"
            />
          </div>
        </div>
      )}
    </div>
  );
}
