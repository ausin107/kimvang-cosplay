"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Calendar,
  Eye,
  EyeOff,
  Trash2,
  UploadCloud,
  X,
  CheckCircle2,
  LogOut,
  ExternalLink,
  Sparkles,
  Database,
  AlertCircle,
} from "lucide-react";
import { useKimVang } from "@/context/KimVangContext";
import {
  formatShortVND,
  formatDateVN,
  isDateBlockedForProduct,
} from "@/data/mockData";
import { ProductCategory, ShowcaseProduct } from "@/types/kimvang";

const NOV_2026_DAYS = Array.from({ length: 30 }, (_, i) => {
  const day = String(i + 1).padStart(2, "0");
  return `2026-11-${day}`;
});

export default function AdminDashboardPage() {
  const router = useRouter();
  const {
    products,
    blockedDates,
    isLoadingData,
    isSupabaseConnected,
    isAdminAuthenticated,
    adminEmail,
    logoutAdmin,
    uploadImageFile,
    toggleProductAvailability,
    toggleProductHidden,
    addProduct,
    deleteProduct,
    addBlockedDate,
    removeBlockedDate,
  } = useKimVang();

  // Filter: Tất cả | Đang thuê
  const [filterMode, setFilterMode] = useState<"ALL" | "RENTED_ONLY">("ALL");

  // Modal 1: Bộ chọn lịch bận thủ công (Manual Blocked Dates)
  const [calendarModalProduct, setCalendarModalProduct] =
    useState<ShowcaseProduct | null>(null);
  const [blockStart, setBlockStart] = useState("2026-11-15");
  const [blockEnd, setBlockEnd] = useState("2026-11-17");
  const [selectingBound, setSelectingBound] = useState<"START" | "END">(
    "START"
  );
  const [blockNote, setBlockNote] = useState(
    "Khách quen qua cửa hàng lấy đồ đi Fes"
  );

  // Modal 2: Form tải đồ & Upload ảnh trực tiếp lên Supabase Storage + Database
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [characterName, setCharacterName] = useState("");
  const [seriesName, setSeriesName] = useState("");
  const [category, setCategory] = useState<ProductCategory>("COSTUME_FEMALE");
  const [sizeLabel, setSizeLabel] = useState("M");
  const [measurements, setMeasurements] = useState(
    "Cao 158-165cm • Ngực 86cm • Eo 66cm • Mông 90cm"
  );
  const [refRentPrice, setRefRentPrice] = useState<number>(150000);
  const [refBuyPrice, setRefBuyPrice] = useState<number>(1450000);
  const [includedItems, setIncludedItems] = useState(
    "Gồm: Áo chính, Váy/Quần, Phụ kiện đi kèm"
  );
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadStatusMsg, setUploadStatusMsg] = useState("");
  const [savingProduct, setSavingProduct] = useState(false);
  const [toast, setToast] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Bắt buộc phải login mới được vào /admin
  useEffect(() => {
    if (!isLoadingData && !isAdminAuthenticated) {
      router.replace("/admin/login");
    }
  }, [isLoadingData, isAdminAuthenticated, router]);

  if (isLoadingData || !isAdminAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-sm text-muted">
        Đang kiểm tra phiên đăng nhập Admin...
      </div>
    );
  }

  const displayedProducts = products.filter((p) => {
    if (filterMode === "RENTED_ONLY") return !p.is_available;
    return true;
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4500);
  };

  // Upload 1 hoặc nhiều file ảnh lên Supabase Storage (Bucket 'costumes')
  const handleFilesSelected = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setErrorMsg("");
    setUploadStatusMsg(
      `Đang tải ${files.length} ảnh lên ${
        isSupabaseConnected ? "Supabase Storage (costumes)" : "bộ nhớ"
      }...`
    );

    const newUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const res = await uploadImageFile(files[i]);
      if (res.error) {
        setErrorMsg(res.error);
      } else if (res.url) {
        newUrls.push(res.url);
      }
    }

    if (newUrls.length > 0) {
      setUploadedImages((prev) => [...prev, ...newUrls]);
      setUploadStatusMsg(`✓ Đã tải lên thành công ${newUrls.length} ảnh!`);
    } else {
      setUploadStatusMsg("");
    }
    setUploadingImage(false);
    e.target.value = "";
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (uploadedImages.length === 0) {
      setErrorMsg("Vui lòng chọn tải lên ít nhất 1 ảnh trang phục.");
      return;
    }

    setSavingProduct(true);
    const slug = `${name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")}-${Math.floor(100 + Math.random() * 900)}`;

    const res = await addProduct({
      slug,
      name: name.trim(),
      character_name: characterName.trim(),
      series_name: seriesName.trim(),
      category,
      size_label: sizeLabel.trim() || "M",
      measurements: measurements.trim(),
      reference_rent_price: refRentPrice > 0 ? refRentPrice : null,
      reference_buy_price: refBuyPrice > 0 ? refBuyPrice : null,
      images: uploadedImages,
      included_items: includedItems.trim(),
      is_available: true,
      is_hidden: false,
    });

    setSavingProduct(false);

    if (res.error) {
      setErrorMsg(res.error);
      return;
    }

    // Reset form
    setName("");
    setCharacterName("");
    setSeriesName("");
    setUploadedImages([]);
    setUploadStatusMsg("");
    setIsAddModalOpen(false);
    showToast(
      `Đã lưu bộ "${res.product?.name}" vào Database và hiển thị lên Web!`
    );
  };

  const handleCalendarDayClick = (dateStr: string) => {
    if (selectingBound === "START" || dateStr < blockStart) {
      setBlockStart(dateStr);
      if (dateStr > blockEnd) setBlockEnd(dateStr);
      setSelectingBound("END");
    } else {
      setBlockEnd(dateStr);
      setSelectingBound("START");
    }
  };

  const handleSaveBlockedRange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calendarModalProduct) return;
    await addBlockedDate(
      calendarModalProduct.id,
      blockStart,
      blockEnd,
      blockNote
    );
    showToast(
      `Đã khóa lịch bộ ${calendarModalProduct.character_name} từ ${formatDateVN(
        blockStart
      )} đến ${formatDateVN(blockEnd)}!`
    );
  };

  return (
    <div className="min-h-screen bg-offwhite">
      {/* Top Admin Header Bar */}
      <div className="bg-jet text-white border-b border-zinc-800">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-widest text-gold">
                KIMVANG ADMIN CMS
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                  isSupabaseConnected
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-700"
                    : "bg-amber-950 text-amber-300 border border-amber-700"
                }`}
              >
                <Database className="w-3 h-3" />
                {isSupabaseConnected
                  ? "Đã kết nối Supabase DB + Storage"
                  : "Chế độ Local (Chưa điền biến Supabase)"}
              </span>
              <span className="text-[11px] text-zinc-400">({adminEmail})</span>
            </div>
            <h1 className="font-display font-bold text-lg sm:text-xl text-white mt-0.5">
              Quản Lý Kho Đồ, Upload Ảnh & Chỉnh Lịch Bận
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {products.length > 0 && (
              <div className="inline-flex p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
                <button
                  onClick={() => setFilterMode("ALL")}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    filterMode === "ALL"
                      ? "bg-white text-jet"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Tất cả ({products.length})
                </button>
                <button
                  onClick={() => setFilterMode("RENTED_ONLY")}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    filterMode === "RENTED_ONLY"
                      ? "bg-amber-400 text-jet"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Đang thuê ({products.filter((p) => !p.is_available).length})
                </button>
              </div>
            )}

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gold text-jet font-display font-bold text-xs sm:text-sm flex items-center gap-1.5 hover:bg-gold/90"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm đồ lên Web</span>
            </button>

            <button
              onClick={async () => {
                await logoutAdmin();
                router.replace("/admin/login");
              }}
              className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
              title="Đăng xuất Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 py-6 space-y-5 tabular-nums">
        {toast && (
          <div className="p-3.5 rounded-2xl bg-buy-bg border border-buy-border text-buy-text text-xs sm:text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toast}</span>
          </div>
        )}

        {products.length === 0 ? (
          /* TRẠNG THÁI KHI KHO ĐỒ ĐANG TRỐNG (0 SẢN PHẨM) */
          <div className="p-10 sm:p-14 rounded-3xl bg-white border-2 border-dashed border-gold/60 text-center space-y-4 max-w-2xl mx-auto my-6">
            <div className="w-14 h-14 rounded-2xl bg-jet text-gold flex items-center justify-center mx-auto border border-gold/40">
              <UploadCloud className="w-7 h-7" />
            </div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-charcoal">
              Database hiện chưa có trang phục nào
            </h2>
            <p className="text-xs sm:text-sm text-muted max-w-md mx-auto leading-relaxed">
              Bấm nút bên dưới để tải ảnh từ máy tính lên{" "}
              <strong>Supabase Storage</strong>, nhập tên nhân vật, số đo, giá
              thuê và lưu vào bảng <code>products</code> để hiển thị ngay ngoài
              trang chủ.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="h-12 px-6 rounded-xl bg-jet text-gold font-display font-bold text-sm inline-flex items-center gap-2 hover:bg-zinc-800"
            >
              <Plus className="w-4 h-4" />
              <span>+ Upload Bộ Trang Phục Đầu Tiên</span>
            </button>
          </div>
        ) : (
          <div className="rounded-2xl bg-white border border-hairline overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-offwhite border-b border-hairline text-muted text-xs uppercase">
                    <th className="py-3.5 px-4 font-bold">TÊN TRANG PHỤC</th>
                    <th className="py-3.5 px-3 font-bold">SIZE</th>
                    <th className="py-3.5 px-4 font-bold">GIÁ THAM KHẢO</th>
                    <th className="py-3.5 px-4 font-bold">
                      TRẠNG THÁI (CÔNG TẮC ON/OFF)
                    </th>
                    <th className="py-3.5 px-4 font-bold">LỊCH BẬN THỦ CÔNG</th>
                    <th className="py-3.5 px-4 font-bold text-right">
                      THAO TÁC
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-hairline">
                  {displayedProducts.map((p) => {
                    const pBlocks = blockedDates.filter(
                      (b) => b.product_id === p.id
                    );

                    return (
                      <tr
                        key={p.id}
                        className={`hover:bg-offwhite/60 transition-colors ${
                          p.is_hidden ? "opacity-50 bg-zinc-50" : ""
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="w-11 h-14 object-cover rounded-lg border border-hairline shrink-0"
                            />
                            <div>
                              <Link
                                href={`/products/${p.slug}`}
                                className="font-display font-bold text-charcoal hover:text-gold-dark flex items-center gap-1"
                              >
                                <span>
                                  {p.character_name} ({p.series_name})
                                </span>
                                <ExternalLink className="w-3 h-3 text-muted" />
                              </Link>
                              <p className="text-xs text-muted line-clamp-1">
                                {p.name}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 font-mono font-bold text-charcoal">
                          {p.size_label}
                        </td>

                        <td className="py-3.5 px-4 font-mono">
                          <span className="font-bold text-rent-text">
                            {formatShortVND(p.reference_rent_price)}/ngày
                          </span>
                          <span className="text-muted mx-1.5">-</span>
                          <span className="font-semibold text-buy-text">
                            {formatShortVND(p.reference_buy_price)}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={async () => {
                              await toggleProductAvailability(p.id);
                              showToast(
                                `Đã chuyển "${
                                  p.character_name
                                }" sang trạng thái: ${
                                  !p.is_available
                                    ? "ON | Sẵn có"
                                    : "OFF | Đang thuê"
                                }`
                              );
                            }}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-xs font-bold border transition-all ${
                              p.is_available
                                ? "bg-buy-bg text-buy-text border-buy-border"
                                : "bg-zinc-900 text-amber-300 border-zinc-800"
                            }`}
                          >
                            <span
                              className={`w-7 h-4 rounded-full p-0.5 flex items-center transition-colors ${
                                p.is_available
                                  ? "bg-emerald-600 justify-end"
                                  : "bg-zinc-600 justify-start"
                              }`}
                            >
                              <span className="w-3 h-3 rounded-full bg-white" />
                            </span>
                            <span>
                              {p.is_available
                                ? "[ ON  | Sẵn có ]"
                                : "[ OFF | Đang thuê ]"}
                            </span>
                          </button>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => setCalendarModalProduct(p)}
                              className="px-3 py-1.5 rounded-xl bg-rent-bg text-rent-text border border-rent-border font-semibold text-xs hover:bg-indigo-100 flex items-center gap-1.5"
                            >
                              <Calendar className="w-3.5 h-3.5" />
                              <span>[Sửa lịch]</span>
                            </button>
                            {pBlocks.length > 0 && (
                              <span className="text-[11px] text-muted">
                                ({pBlocks.length} khoảng bận)
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => toggleProductHidden(p.id)}
                              title={
                                p.is_hidden
                                  ? "Đang ẩn — Bấm để hiện lại trên web"
                                  : "Tạm ẩn khỏi trang web"
                              }
                              className="p-2 rounded-lg border border-hairline hover:bg-offwhite text-muted hover:text-charcoal"
                            >
                              {p.is_hidden ? (
                                <EyeOff className="w-4 h-4 text-amber-600" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                await deleteProduct(p.id);
                                showToast(`Đã xóa "${p.name}" khỏi Database`);
                              }}
                              title="Xóa trang phục"
                              className="p-2 rounded-lg border border-hairline hover:bg-red-50 text-muted hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: BỘ CHỌN LỊCH BẬN THỦ CÔNG (MANUAL BLOCKED DATES) */}
      {calendarModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-hairline overflow-hidden shadow-2xl space-y-4 p-5 sm:p-6 tabular-nums">
            <div className="flex items-start justify-between border-b border-hairline pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-rent-text font-bold">
                  MANUAL BLOCKED DATES (BẢNG BLOCKED_DATES)
                </span>
                <h3 className="font-display font-bold text-lg text-charcoal">
                  Sửa Lịch Bận: {calendarModalProduct.character_name} (Size{" "}
                  {calendarModalProduct.size_label})
                </h3>
              </div>
              <button
                onClick={() => setCalendarModalProduct(null)}
                className="p-1.5 rounded-full hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBlockedRange} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-offwhite border border-hairline space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-charcoal">
                    Nhấp chọn các ngày khách thuê trên lịch (Tháng 11/2026):
                  </span>
                  <span className="font-mono text-rent-text font-bold">
                    {formatDateVN(blockStart)} → {formatDateVN(blockEnd)}
                  </span>
                </div>

                <div className="grid grid-cols-6 gap-1.5">
                  {NOV_2026_DAYS.map((dStr) => {
                    const dayNum = dStr.slice(-2);
                    const existingBlock = isDateBlockedForProduct(
                      calendarModalProduct.id,
                      dStr,
                      blockedDates
                    );
                    const isSelectedNew =
                      dStr >= blockStart && dStr <= blockEnd;

                    return (
                      <button
                        key={dStr}
                        type="button"
                        onClick={() => handleCalendarDayClick(dStr)}
                        className={`py-1.5 rounded-lg text-xs font-mono border transition-all flex flex-col items-center ${
                          existingBlock
                            ? "bg-amber-100 text-amber-900 border-amber-300 font-bold"
                            : isSelectedNew
                            ? "bg-jet text-gold border-jet font-bold"
                            : "bg-white text-charcoal border-hairline hover:border-gold"
                        }`}
                      >
                        <span>{dayNum}/11</span>
                        <span className="text-[9px]">
                          {existingBlock
                            ? "Đã khóa"
                            : isSelectedNew
                            ? "Chọn"
                            : "Trống"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="text-xs space-y-1.5">
                <label className="font-bold text-charcoal block">
                  Ghi chú nội bộ (Chỉ Admin thấy):
                </label>
                <input
                  type="text"
                  value={blockNote}
                  onChange={(e) => setBlockNote(e.target.value)}
                  placeholder="VD: Bạn Nam thuê đi Fes (Đã cọc 500k)"
                  className="w-full px-3.5 py-2 rounded-xl bg-offwhite border border-hairline"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-jet text-gold font-display font-bold text-xs sm:text-sm hover:bg-zinc-800"
              >
                Lưu Khóa Lịch ({formatDateVN(blockStart)} →{" "}
                {formatDateVN(blockEnd)})
              </button>
            </form>

            <div className="pt-3 border-t border-hairline space-y-2">
              <p className="text-xs font-bold text-charcoal">
                Các khoảng ngày đang khóa của bộ này:
              </p>
              {blockedDates.filter(
                (b) => b.product_id === calendarModalProduct.id
              ).length === 0 ? (
                <p className="text-xs text-muted">
                  Chưa có ngày bận nào — Bộ đồ đang trống toàn bộ lịch.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {blockedDates
                    .filter((b) => b.product_id === calendarModalProduct.id)
                    .map((b) => (
                      <div
                        key={b.id}
                        className="p-2.5 rounded-xl bg-offwhite border border-hairline flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-mono font-bold text-rent-text">
                            {formatDateVN(b.start_date)} →{" "}
                            {formatDateVN(b.end_date)}
                          </span>
                          <p className="text-[11px] text-muted">{b.note}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeBlockedDate(b.id)}
                          className="text-xs text-red-600 hover:underline font-semibold"
                        >
                          Mở khóa
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: FORM UPLOAD ẢNH LÊN SUPABASE STORAGE & LƯU DATABASE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-hairline overflow-hidden shadow-2xl p-5 sm:p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-gold-dark flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> SUPABASE STORAGE & POSTGRESQL
                </span>
                <h3 className="font-display font-bold text-lg text-charcoal">
                  Upload Ảnh & Lưu Trang Phục Lên Web
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              {/* Upload ảnh lên Supabase Storage */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-gold/60 bg-gold-light/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="font-bold text-charcoal flex items-center gap-2 cursor-pointer">
                    <UploadCloud className="w-5 h-5 text-gold-dark shrink-0" />
                    <span>
                      Chọn ảnh từ máy tính (Hỗ trợ chọn nhiều ảnh cùng lúc):
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={uploadingImage}
                      onChange={handleFilesSelected}
                      className="hidden"
                    />
                    <span className="px-3 py-1.5 rounded-lg bg-jet text-gold font-semibold shrink-0">
                      {uploadingImage ? "Đang tải..." : "Chọn file ảnh..."}
                    </span>
                  </label>
                </div>

                {uploadStatusMsg && (
                  <p className="text-[11px] text-emerald-700 font-semibold">
                    {uploadStatusMsg}
                  </p>
                )}

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="Hoặc dán trực tiếp URL ảnh vào đây..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-hairline"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!imageUrlInput.trim()) return;
                      setUploadedImages((prev) => [
                        ...prev,
                        imageUrlInput.trim(),
                      ]);
                      setImageUrlInput("");
                    }}
                    className="px-3 py-1.5 rounded-lg bg-charcoal text-white font-semibold"
                  >
                    + Thêm link
                  </button>
                </div>

                {uploadedImages.length > 0 && (
                  <div className="flex gap-2.5 overflow-x-auto pt-1">
                    {uploadedImages.map((img, i) => (
                      <div key={i} className="relative shrink-0 group">
                        <img
                          src={img}
                          alt={`Ảnh ${i + 1}`}
                          className="w-16 h-20 object-cover rounded-lg border border-hairline"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setUploadedImages((prev) =>
                              prev.filter((_, idx) => idx !== i)
                            )
                          }
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px]"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-charcoal block mb-1">
                    Tên trang phục hiển thị *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: Trang phục Raiden Shogun (Fullset Uwowo)"
                    className="w-full px-3 py-2 rounded-xl bg-offwhite border border-hairline"
                  />
                </div>
                <div>
                  <label className="font-bold text-charcoal block mb-1">
                    Size (S/M/L/Freesize) *
                  </label>
                  <input
                    type="text"
                    required
                    value={sizeLabel}
                    onChange={(e) => setSizeLabel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-offwhite border border-hairline font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-charcoal block mb-1">
                    Tên Nhân vật *
                  </label>
                  <input
                    type="text"
                    required
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    placeholder="VD: Raiden Shogun"
                    className="w-full px-3 py-2 rounded-xl bg-offwhite border border-hairline"
                  />
                </div>
                <div>
                  <label className="font-bold text-charcoal block mb-1">
                    Series (Anime/Game) *
                  </label>
                  <input
                    type="text"
                    required
                    value={seriesName}
                    onChange={(e) => setSeriesName(e.target.value)}
                    placeholder="VD: Genshin Impact"
                    className="w-full px-3 py-2 rounded-xl bg-offwhite border border-hairline"
                  />
                </div>
                <div>
                  <label className="font-bold text-charcoal block mb-1">
                    Phân loại
                  </label>
                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as ProductCategory)
                    }
                    className="w-full px-3 py-2 rounded-xl bg-offwhite border border-hairline"
                  >
                    <option value="COSTUME_FEMALE">Đồ Nữ</option>
                    <option value="COSTUME_MALE">Đồ Nam</option>
                    <option value="WIG">Tóc giả (Wig)</option>
                    <option value="PROP_WEAPON">Vũ khí / Props</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-rent-text block mb-1">
                    Giá thuê tham khảo / ngày (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={refRentPrice}
                    onChange={(e) => setRefRentPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-rent-bg/50 border border-rent-border font-mono font-bold text-rent-text"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-bold text-buy-text block mb-1">
                    Giá bán tham khảo (VNĐ — Để 0 nếu chỉ cho thuê)
                  </label>
                  <input
                    type="number"
                    value={refBuyPrice}
                    onChange={(e) => setRefBuyPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-buy-bg/50 border border-buy-border font-mono font-bold text-buy-text"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="font-bold text-charcoal block mb-1">
                    Số đo chi tiết (measurements)
                  </label>
                  <input
                    type="text"
                    value={measurements}
                    onChange={(e) => setMeasurements(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-offwhite border border-hairline"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="font-bold text-charcoal block mb-1">
                    Danh sách phụ kiện đi kèm (included_items)
                  </label>
                  <input
                    type="text"
                    value={includedItems}
                    onChange={(e) => setIncludedItems(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-offwhite border border-hairline"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProduct || uploadingImage}
                className="w-full py-3.5 rounded-xl bg-jet text-gold font-display font-bold text-sm hover:bg-zinc-800 disabled:opacity-50"
              >
                {savingProduct
                  ? "Đang lưu vào Database..."
                  : "Lưu Vào Database & Hiển Thị Lên Web"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
