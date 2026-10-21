import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import "./globals.css";

export const metadata: Metadata = {
  title: `${BRAND.name} | דוחות AI על צ'אטים`,
  description: "העלו צ'אט מ-WhatsApp או iMessage וקבלו דוח AI על מה שבאמת קורה.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
