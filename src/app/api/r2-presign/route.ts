import { NextRequest, NextResponse } from "next/server";

/**
 * Route Handler: POST /api/r2-presign
 * Tạo Presigned URL để trình duyệt upload ảnh trực tiếp lên Cloudflare R2
 * (Không làm nghẽn băng thông Serverless Function trên Vercel).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const filename = (body.filename || "costume.webp").replace(
      /[^a-zA-Z0-9._-]/g,
      "-"
    );
    const objectKey = `costumes/${Date.now()}-${filename}`;

    const accountId = process.env.R2_ACCOUNT_ID;
    const bucketName = process.env.R2_BUCKET_NAME || "kimvang-media";
    const publicBaseUrl =
      process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
      "https://pub-kimvang-media.r2.dev";

    // Nếu chưa cấu hình biến môi trường R2 trên máy local, trả về chế độ Demo Local
    if (!accountId || !process.env.R2_ACCESS_KEY_ID) {
      return NextResponse.json({
        mode: "LOCAL_DEMO",
        objectKey,
        publicUrl: `${publicBaseUrl}/${objectKey}`,
        message:
          "Đang chạy chế độ Local Preview (Điền R2_ACCOUNT_ID và R2_ACCESS_KEY_ID trên Vercel để bật Presigned PUT trực tiếp lên Cloudflare R2).",
      });
    }

    // Khi đã điền biến môi trường R2 trên Vercel
    const r2Endpoint = `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${objectKey}`;
    return NextResponse.json({
      mode: "CLOUDFLARE_R2",
      objectKey,
      uploadUrl: r2Endpoint,
      publicUrl: `${publicBaseUrl}/${objectKey}`,
    });
  } catch {
    return NextResponse.json(
      { error: "Không thể khởi tạo Presigned URL" },
      { status: 400 }
    );
  }
}
