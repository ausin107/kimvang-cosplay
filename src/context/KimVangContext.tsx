"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { ShowcaseProduct, BlockedDateRange } from "@/types/kimvang";
import { getSupabaseClient, getSupabaseConfig } from "@/lib/supabase";
import { compressImage, CompressionStats } from "@/lib/imageCompression";

interface KimVangContextType {
  products: ShowcaseProduct[];
  visibleProducts: ShowcaseProduct[];
  blockedDates: BlockedDateRange[];
  isLoadingData: boolean;
  isSupabaseConnected: boolean;
  needsSqlSchemaSetup: boolean;
  isAdminAuthenticated: boolean;
  adminEmail: string | null;
  refreshData: () => Promise<void>;
  loginAdmin: (
    email: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string }>;
  logoutAdmin: () => Promise<void>;
  uploadImageFile: (file: File) => Promise<{
    url: string;
    error?: string;
    stats?: CompressionStats;
  }>;
  toggleProductAvailability: (productId: string) => Promise<void>;
  toggleProductHidden: (productId: string) => Promise<void>;
  addProduct: (
    newProduct: Omit<ShowcaseProduct, "id" | "created_at">
  ) => Promise<{ product?: ShowcaseProduct; error?: string; warning?: string }>;
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
  const [products, setProducts] = useState<ShowcaseProduct[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDateRange[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [isSupabaseConnected, setIsSupabaseConnected] =
    useState<boolean>(false);
  const [needsSqlSchemaSetup, setNeedsSqlSchemaSetup] =
    useState<boolean>(false);
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
    } catch {}
  };

  const loadLocalFallback = () => {
    try {
      const savedProds = localStorage.getItem("kv_db_products_v3");
      const savedBlocked = localStorage.getItem("kv_db_blocked_v3");
      if (savedProds) setProducts(JSON.parse(savedProds));
      if (savedBlocked) setBlockedDates(JSON.parse(savedBlocked));
    } catch {}
  };

  const refreshData = useCallback(async () => {
    setIsLoadingData(true);
    const { isConfigured } = getSupabaseConfig();
    const supabase = getSupabaseClient();
    setIsSupabaseConnected(isConfigured && !!supabase);

    if (supabase) {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          setIsAdminAuthenticated(true);
          setAdminEmail(session.user.email || null);
        } else {
          setIsAdminAuthenticated(false);
          setAdminEmail(null);
        }

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

        if (prodRes.error) {
          // Table not created yet in Supabase SQL Editor (e.g. PGRST205)
          setNeedsSqlSchemaSetup(true);
          loadLocalFallback();
        } else if (prodRes.data) {
          setNeedsSqlSchemaSetup(false);
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
          if (!blockRes.error && blockRes.data) {
            setBlockedDates(blockRes.data);
          }
        }
      } catch {
        loadLocalFallback();
      } finally {
        setIsLoadingData(false);
      }
      return;
    }

    loadLocalFallback();
    setIsLoadingData(false);
  }, []);

  useEffect(() => {
    refreshData();

    const supabase = getSupabaseClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsAdminAuthenticated(true);
        setAdminEmail(session.user.email || null);
      } else {
        setIsAdminAuthenticated(false);
        setAdminEmail(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshData]);

  const loginAdmin = async (
    email: string,
    password: string
  ): Promise<{ ok: boolean; error?: string }> => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      return {
        ok: false,
        error: "Vui lòng nhập đầy đủ Email và Mật khẩu.",
      };
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error || !data.user) {
      return {
        ok: false,
        error: "Email hoặc mật khẩu không chính xác.",
      };
    }

    setIsAdminAuthenticated(true);
    setAdminEmail(data.user.email || cleanEmail);
    await refreshData();
    return { ok: true };
  };

  const logoutAdmin = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    setIsAdminAuthenticated(false);
    setAdminEmail(null);
  };

  const uploadImageFile = async (
    file: File
  ): Promise<{
    url: string;
    error?: string;
    stats?: CompressionStats;
  }> => {
    // 1. Tự động nén ảnh client-side (giảm từ 5-15MB xuống ~150-350KB chuẩn WebP)
    const {
      file: fileToUpload,
      originalSize,
      compressedSize,
      reductionPercentage,
    } = await compressImage(file);

    const stats: CompressionStats = {
      originalSize,
      compressedSize,
      reductionPercentage,
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      const ext = fileToUpload.name.split(".").pop() || "webp";
      const safeName = fileToUpload.name
        .replace(/\.[^/.]+$/, "")
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, "-");
      const filePath = `uploads/${Date.now()}-${safeName}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("costumes")
        .upload(filePath, fileToUpload, {
          contentType: fileToUpload.type || "image/webp",
          cacheControl: "31536000, public",
          upsert: true,
        });

      if (!uploadError) {
        const { data: pub } = supabase.storage
          .from("costumes")
          .getPublicUrl(filePath);
        return { url: pub.publicUrl, stats };
      }
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve({ url: reader.result, stats });
        } else {
          resolve({ url: "", error: "Không thể đọc file ảnh." });
        }
      };
      reader.onerror = () =>
        resolve({ url: "", error: "Không thể đọc file ảnh." });
      reader.readAsDataURL(fileToUpload);
    });
  };

  const addProduct = async (
    payload: Omit<ShowcaseProduct, "id" | "created_at">
  ): Promise<{
    product?: ShowcaseProduct;
    error?: string;
    warning?: string;
  }> => {
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

      if (!error && data) {
        setNeedsSqlSchemaSetup(false);
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
        const next = [created, ...products];
        setProducts(next);
        persistLocalFallback(next, blockedDates);
        return { product: created };
      }

      // Nếu bảng 'products' trên Supabase chưa chạy SQL khởi tạo, vẫn lưu lên Web và báo nhắc chạy SQL
      setNeedsSqlSchemaSetup(true);
    }

    const created: ShowcaseProduct = {
      ...payload,
      id: `prod-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const next = [created, ...products];
    setProducts(next);
    persistLocalFallback(next, blockedDates);
    return {
      product: created,
      warning:
        "Đã hiển thị lên Web! Lưu ý: Hãy chạy file database/supabase_schema.sql trong SQL Editor của Supabase để đồng bộ vĩnh viễn lên bảng products.",
    };
  };

  const toggleProductAvailability = async (productId: string) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;
    const nextVal = !target.is_available;

    const supabase = getSupabaseClient();
    if (supabase && !needsSqlSchemaSetup) {
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
    if (supabase && !needsSqlSchemaSetup) {
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
    if (supabase && !needsSqlSchemaSetup) {
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
    if (supabase && !needsSqlSchemaSetup) {
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
    if (supabase && !needsSqlSchemaSetup) {
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
        needsSqlSchemaSetup,
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
