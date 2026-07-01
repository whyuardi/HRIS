import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";

const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HR Pro — Enterprise HRIS System",
  description: "Sistem HRIS modern untuk pengelolaan SDM perusahaan — Karyawan, Absensi, Payroll, Cuti, Dokumen, dan Reporting.",
  keywords: ["HRIS", "HRD", "Human Resources", "Payroll", "Attendance", "Enterprise"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${geist.variable} antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
