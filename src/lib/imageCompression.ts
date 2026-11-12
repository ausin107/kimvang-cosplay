/**
 * Tiện ích nén và tối ưu hóa ảnh Client-Side trước khi upload lên Supabase Storage:
 * - Tự động thu nhỏ ảnh vượt quá kích thước chuẩn (mặc định tối đa 1600px, sắc nét cho màn hình Retina/4K).
 * - Chuyển đổi định dạng sang WebP hiện đại (dung lượng nhỏ hơn 30-50% so với JPEG ở cùng chất lượng).
 * - Giữ nguyên kênh độ trong suốt (Alpha Channel) cho các ảnh dạng PNG.
 * - Giảm dung lượng từ 5MB - 15MB của điện thoại/máy ảnh xuống còn ~150KB - 350KB (tiết kiệm ~85-95% dung lượng).
 */

export interface CompressionStats {
  originalSize: number;
  compressedSize: number;
  reductionPercentage: number;
}

export interface CompressionResult extends CompressionStats {
  file: File;
}

export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function compressImage(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  } = {}
): Promise<CompressionResult> {
  const { maxWidth = 1600, maxHeight = 1600, quality = 0.82 } = options;

  // Nếu không phải file ảnh, hoặc là GIF động / SVG vector, không can thiệp nén
  if (
    !file.type.startsWith("image/") ||
    file.type === "image/gif" ||
    file.type === "image/svg+xml"
  ) {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      reductionPercentage: 0,
    };
  }

  // Kiểm tra môi trường browser
  if (typeof window === "undefined") {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      reductionPercentage: 0,
    };
  }

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const originalWidth = img.naturalWidth || img.width;
      const originalHeight = img.naturalHeight || img.height;

      let width = originalWidth;
      let height = originalHeight;

      // Tính toán tỷ lệ co nếu vượt quá kích thước cho phép
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve({
          file,
          originalSize: file.size,
          compressedSize: file.size,
          reductionPercentage: 0,
        });
        return;
      }

      // Kích hoạt bộ lọc nội suy chất lượng cao
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      const tryExport = (format: "image/webp" | "image/jpeg", ext: "webp" | "jpg") => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              if (format === "image/webp") {
                // Fallback sang JPEG nếu trình duyệt không hỗ trợ toBlob WebP
                tryExport("image/jpeg", "jpg");
                return;
              }
              resolve({
                file,
                originalSize: file.size,
                compressedSize: file.size,
                reductionPercentage: 0,
              });
              return;
            }

            // Nếu file nén lại lớn hơn file ban đầu (rất hiếm, thường ở ảnh cực nhỏ đã nén), giữ file gốc
            if (
              blob.size >= file.size &&
              width === originalWidth &&
              height === originalHeight
            ) {
              resolve({
                file,
                originalSize: file.size,
                compressedSize: file.size,
                reductionPercentage: 0,
              });
              return;
            }

            const rawBaseName = file.name.replace(/\.[^/.]+$/, "");
            const safeBaseName =
              rawBaseName
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9-_]/g, "-")
                .replace(/-+/g, "-") || "costume";

            const newFileName = `${safeBaseName}.${ext}`;

            const compressedFile = new File([blob], newFileName, {
              type: format,
              lastModified: Date.now(),
            });

            const reductionPercentage = Math.max(
              0,
              Math.round(((file.size - compressedFile.size) / file.size) * 100)
            );

            resolve({
              file: compressedFile,
              originalSize: file.size,
              compressedSize: compressedFile.size,
              reductionPercentage,
            });
          },
          format,
          quality
        );
      };

      tryExport("image/webp", "webp");
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        file,
        originalSize: file.size,
        compressedSize: file.size,
        reductionPercentage: 0,
      });
    };

    img.src = objectUrl;
  });
}
