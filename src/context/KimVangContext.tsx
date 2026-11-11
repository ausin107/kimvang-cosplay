"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ShowcaseProduct, BlockedDateRange } from "@/types/kimvang";
import { getSupabaseClient, getSupabaseConfig } from "@/lib/supabase";

interface KimVangContextType {
  products: ShowcaseProduct[];
  visibleProducts: ShowcaseProduct[];
  blockedDates: BlockedDateRange[];
  isLoadingData: boolean;
  isSupabaseConnected: boolean;
  isAdminAuthenticated: boolean;
  adminEmail: string | null;
  refreshData: () => Promise<void>;
  loginAdmin: (
    email: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string }>;
  logoutAdmin: () => Promise<void>;
  uploadImageFile: (file: File) => Promise<{ url: string; error?: string }>;
  toggleProductAvailability: (productId: string) => Promise<void>;
  toggleProductHidden: (productId: string) => Promise<void>;
  addProduct: (
    newProduct: Omit<ShowcaseProduct, "id" | "created_at">
  ) => Promise<{ product?: ShowcaseProduct; error?: string }>;
  deleteProduct: (productId: string) => Promise<void>;
  addBlockedDate: (
    productId: string,
    startDate: string,
    endDate: string,
    note: string
  ) => Promise<void>;
  removeBlockedDate: (blockedId: string) => Promise<void>;
}

const KimVangContext = createContext<KimVangContextType | undefined>(undefined);

export function KimVangProvider({ children }: { children: React.ReactNode }) {
  // Mới đầu vào chưa có sản phẩm nào hết (mảng rỗng) và chưa đăng nhập Admin (false)
  const [products, setProducts] = useState<ShowcaseProduct[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDateRange[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] =
    useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  const persistLocalFallback = (
    nextProducts: ShowcaseProduct[],
    nextBlocked: BlockedDateRange[]
  ) => {
    try {
      localStorage.setItem("kv_db_products_v3", JSON.stringify(nextProducts));
      localStorage.setItem("kv_db_blocked_v3", JSON.stringify(nextBlocked));
    } catch {
      // Ignore storage errors
    }
  };

  const refreshData = useCallback(async () => {
    setIsLoadingData(true);
    const { isConfigured } = getSupabaseConfig();
    const supabase = getSupabaseClient();
    setIsSupabaseConnected(isConfigured && !!supabase);

    if (supabase) {
      try {
        // 1. Check Supabase Auth session
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          setIsAdminAuthenticated(true);
          setAdminEmail(session.user.email || "admin");
        } else {
          setIsAdminAuthenticated(false);
          setAdminEmail(null);
        }

        // 2. Fetch products & blocked_dates from Supabase PostgreSQL
        const [prodRes, blockRes] = await Promise.all([
          supabase
            .from("products")
            .select("*")
            .order("created_at", { ascending: false }),
          supabase
            .from("blocked_dates")
            .select("*")
            .order("start_date", { ascending: true }),
        ]);

        if (!prodRes.error && prodRes.data) {
          setProducts(
            prodRes.data.map((r) => ({
              ...r,
              reference_rent_price:
                r.reference_rent_price !== null
                  ? Number(r.reference_rent_price)
                  : null,
              reference_buy_price:
                r.reference_buy_price !== null
                  ? Number(r.reference_buy_price)
                  : null,
              images: Array.isArray(r.images) ? r.images : [],
            }))
          );
        }
        if (!blockRes.error && blockRes.data) {
          setBlockedDates(blockRes.data);
        }
      } catch {
        // Ignore network errors
      } finally {
        setIsLoadingData(false);
      }
      return;
    }

    // Fallback khi chưa điền Supabase URL/Key: ban đầu trống 100%, chỉ đọc những gì Admin đã tự upload
    try {
      const savedProds = localStorage.getItem("kv_db_products_v3");
      const savedBlocked = localStorage.getItem("kv_db_blocked_v3");
      const savedAuth = sessionStorage.getItem("kv_admin_session_v3");
      if (savedProds) setProducts(JSON.parse(savedProds));
      if (savedBlocked) setBlockedDates(JSON.parse(savedBlocked));
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        setIsAdminAuthenticated(!!parsed.isAuthenticated);
        setAdminEmail(parsed.email || null);
      } else {
        setIsAdminAuthenticated(false);
        setAdminEmail(null);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const loginAdmin = async (
    email: string,
    password: string
  ): Promise<{ ok: boolean; error?: string }> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error || !data.user) {
        return {
          ok: false,
          error:
            error?.message ||
            "Đăng nhập Supabase thất bại. Kiểm tra lại Email/Password hoặc tạo user trong mục Authentication của Supabase.",
        };
      }
      setIsAdminAuthenticated(true);
      setAdminEmail(data.user.email || email);
      await refreshData();
      return { ok: true };
    }

    // Chế độ Local khi chưa điền biến môi trường Supabase
    if (!email.trim() || password.length < 4) {
      return {
        ok: false,
        error: "Vui lòng nhập Email và Mật khẩu hợp lệ (tối thiểu 4 ký tự).",
      };
    }
    setIsAdminAuthenticated(true);
    setAdminEmail(email.trim());
    try {
      sessionStorage.setItem(
        "kv_admin_session_v3",
        JSON.stringify({ isAuthenticated: true, email: email.trim() })
      );
    } catch {}
    return { ok: true };
  };

  const logoutAdmin = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setIsAdminAuthenticated(false);
    setAdminEmail(null);
    try {
      sessionStorage.removeItem("kv_admin_session_v3");
    } catch {}
  };

  const uploadImageFile = async (
    file: File
  ): Promise<{ url: string; error?: string }> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      const ext = file.name.split(".").pop() || "jpg";
      const safeName = file.name
        .replace(/\.[^/.]+$/, "")
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, "-");
      const filePath = `uploads/${Date.now()}-${safeName}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("costumes")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        return {
          url: "",
          error: `Lỗi upload lên Supabase Storage (Bucket 'costumes'): ${uploadError.message}. Hãy chắc chắn bạn đã chạy file database/supabase_schema.sql trên Supabase.`,
        };
      }

      const { data: pub } = supabase.storage
        .from("costumes")
        .getPublicUrl(filePath);
      return { url: pub.publicUrl };
    }

    // Fallback Base64 Data URL khi chưa kết nối Supabase
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve({ url: reader.result });
        } else {
          resolve({ url: "", error: "Không thể đọc file ảnh." });
        }
      };
      reader.onerror = () =>
        resolve({ url: "", error: "Không thể đọc file ảnh." });
      reader.readAsDataURL(file);
    });
  };

  const addProduct = async (
    payload: Omit<ShowcaseProduct, "id" | "created_at">
  ): Promise<{ product?: ShowcaseProduct; error?: string }> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("products")
        .insert([
          {
            slug: payload.slug,
            name: payload.name,
            character_name: payload.character_name,
            series_name: payload.series_name,
            category: payload.category,
            size_label: payload.size_label,
            measurements: payload.measurements,
            reference_rent_price: payload.reference_rent_price,
            reference_buy_price: payload.reference_buy_price,
            images: payload.images,
            included_items: payload.included_items,
            fabric_note: payload.fabric_note || null,
            care_note: payload.care_note || null,
            is_available: payload.is_available,
            is_hidden: payload.is_hidden,
          },
        ])
        .select()
        .single();

      if (error || !data) {
        return {
          error:
            error?.message ||
            "Không thể lưu sản phẩm vào bảng 'products' trên Supabase.",
        };
      }

      const created: ShowcaseProduct = {
        ...data,
        reference_rent_price:
          data.reference_rent_price !== null
            ? Number(data.reference_rent_price)
            : null,
        reference_buy_price:
          data.reference_buy_price !== null
            ? Number(data.reference_buy_price)
            : null,
      };
      setProducts((prev) => [created, ...prev]);
      return { product: created };
    }

    // Local fallback
    const created: ShowcaseProduct = {
      ...payload,
      id: `prod-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const next = [created, ...products];
    setProducts(next);
    persistLocalFallback(next, blockedDates);
    return { product: created };
  };

  const toggleProductAvailability = async (productId: string) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;
    const nextVal = !target.is_available;

    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase
        .from("products")
        .update({ is_available: nextVal })
        .eq("id", productId);
    }

    const next = products.map((p) =>
      p.id === productId ? { ...p, is_available: nextVal } : p
    );
    setProducts(next);
    persistLocalFallback(next, blockedDates);
  };

  const toggleProductHidden = async (productId: string) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;
    const nextVal = !target.is_hidden;

    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase
        .from("products")
        .update({ is_hidden: nextVal })
        .eq("id", productId);
    }

    const next = products.map((p) =>
      p.id === productId ? { ...p, is_hidden: nextVal } : p
    );
    setProducts(next);
    persistLocalFallback(next, blockedDates);
  };

  const deleteProduct = async (productId: string) => {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from("products").delete().eq("id", productId);
    }

    const nextProds = products.filter((p) => p.id !== productId);
    const nextBlocked = blockedDates.filter((b) => b.product_id !== productId);
    setProducts(nextProds);
    setBlockedDates(nextBlocked);
    persistLocalFallback(nextProds, nextBlocked);
  };

  const addBlockedDate = async (
    productId: string,
    startDate: string,
    endDate: string,
    note: string
  ) => {
    const sDate = startDate <= endDate ? startDate : endDate;
    const eDate = endDate >= startDate ? endDate : startDate;
    const cleanNote = note.trim() || "Khách đặt thuê (Admin khóa lịch tay)";

    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("blocked_dates")
        .insert([
          {
            product_id: productId,
            start_date: sDate,
            end_date: eDate,
            note: cleanNote,
          },
        ])
        .select()
        .single();

      if (!error && data) {
        setBlockedDates((prev) => [...prev, data]);
        return;
      }
    }

    const newRange: BlockedDateRange = {
      id: `blk-${Date.now()}`,
      product_id: productId,
      start_date: sDate,
      end_date: eDate,
      note: cleanNote,
      created_at: new Date().toISOString(),
    };
    const nextBlocked = [...blockedDates, newRange];
    setBlockedDates(nextBlocked);
    persistLocalFallback(products, nextBlocked);
  };

  const removeBlockedDate = async (blockedId: string) => {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from("blocked_dates").delete().eq("id", blockedId);
    }
    const nextBlocked = blockedDates.filter((b) => b.id !== blockedId);
    setBlockedDates(nextBlocked);
    persistLocalFallback(products, nextBlocked);
  };

  const visibleProducts = products.filter((p) => !p.is_hidden);

  return (
    <KimVangContext.Provider
      value={{
        products,
        visibleProducts,
        blockedDates,
        isLoadingData,
        isSupabaseConnected,
        isAdminAuthenticated,
        adminEmail,
        refreshData,
        loginAdmin,
        logoutAdmin,
        uploadImageFile,
        toggleProductAvailability,
        toggleProductHidden,
        addProduct,
        deleteProduct,
        addBlockedDate,
        removeBlockedDate,
      }}
    >
      {children}
    </KimVangContext.Provider>
  );
}

export function useKimVang() {
  const ctx = useContext(KimVangContext);
  if (!ctx) throw new Error("useKimVang must be used within KimVangProvider");
  return ctx;
}
