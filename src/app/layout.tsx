import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { KimVangProvider } from "@/context/KimVangContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "KimVang Cosplay | Nền tảng Thuê & Mua Trang phục Cosplay Cao Cấp",
  description:
    "Nền tảng Thương mại Điện tử Trang phục Cosplay KimVang — Bán đứt kết hợp Cho thuê có đặt cọc hoàn 100%, chuẩn Minimalist Editorial.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="font-sans bg-offwhite text-charcoal antialiased min-h-screen flex flex-col">
        <KimVangProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </KimVangProvider>
      </body>
    </html>
  );
}
