"use client";

import React, { useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { FAQ_ITEMS } from "@/data/mockData";
import { FaqCategory } from "@/types/kimvang";

const TOPIC_TABS: { id: "ALL" | FaqCategory; label: string }[] = [
  { id: "ALL", label: "Tất cả chủ đề" },
  { id: "RENTAL_PROCESS", label: "Xem lịch & Đặt thuê qua Zalo" },
  { id: "SHIPPING_TIMING", label: "Nhận đồ trước Fes" },
  { id: "DAMAGE_POLICY", label: "Quy định Giặt hấp & Bảo quản" },
  { id: "WIG_PROP_CARE", label: "Chăm sóc Wig / Props" },
];

export default function FaqAndCareGuidesPage() {
  const [selectedTab, setSelectedTab] = useState<"ALL" | FaqCategory>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [openIds, setOpenIds] = useState<string[]>(["faq-1", "faq-3"]);

  const toggleOpen = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    if (selectedTab !== "ALL" && item.category !== selectedTab) return false;
    if (
      searchQuery.trim() &&
      !item.question.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.answer_markdown.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 text-gold-dark text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          FAQ & COSPLAY CARE GUIDES
        </span>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-charcoal">
          Hướng Dẫn Thuê Đồ Qua Zalo & Cẩm Nang Bảo Quản
        </h1>
        <p className="text-xs sm:text-sm text-muted">
          Giải đáp nhanh cách xem lịch trống trên web, nhắn Zalo/Fanpage giữ đồ
          và lưu ý bảo quản trang phục, tóc giả (Wig).
        </p>

        <div className="relative max-w-md mx-auto pt-2">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 mt-1" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm câu hỏi (VD: lịch trống, giặt ủi, wig...)"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-hairline rounded-full focus:outline-none focus:border-gold"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 justify-start sm:justify-center">
        {TOPIC_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold border transition-colors ${
              selectedTab === tab.id
                ? "bg-jet text-gold border-jet"
                : "bg-white text-muted border-hairline hover:text-charcoal"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-3xl bg-white border border-hairline">
        <div className="p-4 rounded-2xl bg-buy-bg/60 border border-buy-border space-y-2">
          <div className="flex items-center gap-2 text-buy-text font-display font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>MIỄN PHÍ GIẶT HẤP 100% TẠI SHOP</span>
          </div>
          <ul className="text-xs text-charcoal space-y-1.5 list-disc pl-4">
            <li>Vết bụi bẩn thông thường ở gấu váy/áo khi di chuyển tại Fes.</li>
            <li>Vết phấn trang điểm hoặc mồ hôi nhẹ ở cổ áo.</li>
            <li>Tóc giả (Wig) rối nhẹ phần đuôi tóc do gió (chưa bị cắt tỉa).</li>
          </ul>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-display font-bold text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-700" />
            <span>LƯU Ý TRÁNH HƯ HỎNG TRANG PHỤC</span>
          </div>
          <ul className="text-xs text-charcoal space-y-1.5 list-disc pl-4">
            <li>
              Tuyệt đối không tự ý bỏ đồ vào máy giặt làm bong kim tuyến, phai
              màu gấm.
            </li>
            <li>Kiểm tra đủ phụ kiện (Vision, trâm cài, găng tay, kính) trước khi trả.</li>
            <li>Không tự ý dùng kéo cắt mái Wig hoặc để đạo cụ PVC nơi nắng nóng.</li>
          </ul>
        </div>
      </div>

      <div className="space-y-3">
        {filteredFaqs.map((faq) => {
          const isOpen = openIds.includes(faq.id);
          return (
            <div
              key={faq.id}
              className="rounded-2xl bg-white border border-hairline overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleOpen(faq.id)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-offwhite transition-colors"
              >
                <span className="font-display font-semibold text-sm sm:text-base text-charcoal">
                  {faq.question}
                </span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-muted shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-4 pb-5 sm:px-5 text-xs sm:text-sm text-muted leading-relaxed space-y-3 border-t border-hairline pt-4">
                  <p className="text-charcoal">{faq.answer_markdown}</p>
                  {faq.comparison_tip && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                      <div className="p-3 rounded-xl bg-buy-bg/50 border border-buy-border text-buy-text">
                        <strong>✓ Miễn phí:</strong>{" "}
                        {faq.comparison_tip.free_laundry}
                      </div>
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                        <strong>! Lưu ý:</strong>{" "}
                        {faq.comparison_tip.deducted}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
