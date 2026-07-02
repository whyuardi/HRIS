import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { Toaster } from "sonner";

const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HR Pro — Enterprise HRIS System | PT. Benua Green Energy",
  description: "Sistem HRIS modern untuk pengelolaan SDM perusahaan PT. Benua Green Energy — Karyawan, Absensi, Payroll, Cuti, Dokumen, dan Reporting.",
  keywords: ["HRIS", "HRD", "Human Resources", "Payroll", "Attendance", "Enterprise", "Benua Green Energy"],
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
        <Toaster 
          position="top-right" 
          richColors 
          closeButton 
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '12px',
              fontSize: '13px',
            },
          }}
        />
      </body>
    </html>
  );
}
