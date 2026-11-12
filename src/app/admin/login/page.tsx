"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight } from "lucide-react";
import { useKimVang } from "@/context/KimVangContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { loginAdmin, isAdminAuthenticated } = useKimVang();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdminAuthenticated) {
      router.replace("/admin");
    }
  }, [isAdminAuthenticated, router]);

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
          <h1 className="font-display font-bold text-2xl text-charcoal">
            Đăng Nhập
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-charcoal mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-offwhite border border-hairline focus:outline-none focus:border-gold focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-charcoal mb-1.5">
              Mật khẩu
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
            <span>{loading ? "Đang đăng nhập..." : "Đăng nhập"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
