"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Sparkles,
  ArrowRight,
  Database,
  CheckCircle2,
  AlertCircle,
  Settings,
} from "lucide-react";
import { useKimVang } from "@/context/KimVangContext";
import { getSupabaseConfig, saveRuntimeSupabaseConfig } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const { loginAdmin, isAdminAuthenticated, refreshData } = useKimVang();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Cho phép cấu hình nhanh Supabase URL & Anon Key ngay trên giao diện nếu chưa tạo file .env.local
  const [showSupabaseSetup, setShowSupabaseSetup] = useState(false);
  const [sbUrl, setSbUrl] = useState("");
  const [sbKey, setSbKey] = useState("");
  const [isSbConfigured, setIsSbConfigured] = useState(false);

  useEffect(() => {
    const cfg = getSupabaseConfig();
    setSbUrl(cfg.url);
    setSbKey(cfg.anonKey);
    setIsSbConfigured(cfg.isConfigured);
  }, []);

  useEffect(() => {
    if (isAdminAuthenticated) {
      router.replace("/admin");
    }
  }, [isAdminAuthenticated, router]);

  const handleSaveSupabaseConfig = async () => {
    saveRuntimeSupabaseConfig(sbUrl, sbKey);
    setIsSbConfigured(!!(sbUrl.trim() && sbKey.trim()));
    setShowSupabaseSetup(false);
    await refreshData();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginAdmin(email, password);
      if (!res.ok) {
        setError(res.error || "Đăng nhập thất bại.");
      } else {
        router.push("/admin");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white border border-hairline shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-jet text-gold flex items-center justify-center mx-auto border border-gold/40">
            <Lock className="w-5 h-5" />
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-widest text-gold-dark">
            <Sparkles className="w-3 h-3" /> SUPABASE AUTH • ADMIN PORTAL
          </span>
          <h1 className="font-display font-bold text-2xl text-charcoal">
            Đăng Nhập Quản Trị KimVang
          </h1>
          <p className="text-xs text-muted">
            Bạn buộc phải đăng nhập tài khoản Admin để vào trang{" "}
            <code>/admin</code>, tải ảnh lên Supabase Storage và đăng trang phục
            lên web.
          </p>
        </div>

        {/* Trạng thái kết nối Supabase */}
        <div className="p-3.5 rounded-2xl bg-offwhite border border-hairline space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold flex items-center gap-1.5 text-charcoal">
              <Database className="w-4 h-4 text-gold-dark" />
              Kết nối Supabase:
            </span>
            {isSbConfigured ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Đã cấu hình
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                <AlertCircle className="w-3.5 h-3.5" /> Chưa điền URL/Key
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowSupabaseSetup(!showSupabaseSetup)}
            className="text-[11px] font-semibold text-rent-text hover:underline flex items-center gap-1"
          >
            <Settings className="w-3 h-3" />
            {showSupabaseSetup
              ? "Ẩn khung cấu hình Supabase"
              : "Cấu hình nhanh SUPABASE_URL & ANON_KEY tại đây"}
          </button>

          {showSupabaseSetup && (
            <div className="pt-2 space-y-2 border-t border-hairline">
              <div>
                <label className="block text-[11px] font-semibold text-charcoal mb-1">
                  NEXT_PUBLIC_SUPABASE_URL
                </label>
                <input
                  type="url"
                  value={sbUrl}
                  onChange={(e) => setSbUrl(e.target.value)}
                  placeholder="https://xxxx.supabase.co"
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-hairline font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-charcoal mb-1">
                  NEXT_PUBLIC_SUPABASE_ANON_KEY
                </label>
                <input
                  type="text"
                  value={sbKey}
                  onChange={(e) => setSbKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  className="w-full px-3 py-1.5 rounded-lg bg-white border border-hairline font-mono text-[11px]"
                />
              </div>
              <button
                type="button"
                onClick={handleSaveSupabaseConfig}
                className="w-full py-2 rounded-lg bg-charcoal text-white font-semibold text-xs"
              >
                Lưu kết nối Supabase
              </button>
            </div>
          )}
        </div>

        {/* Form Đăng nhập */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-charcoal mb-1.5">
              Email Admin (Supabase Auth) *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email admin của bạn..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-offwhite border border-hairline focus:outline-none focus:border-gold focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-charcoal mb-1.5">
              Mật khẩu *
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-offwhite border border-hairline focus:outline-none focus:border-gold focus:bg-white"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-jet text-gold font-display font-bold text-sm flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            <span>
              {loading ? "Đang xác thực..." : "Đăng nhập vào Admin CMS"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
