'use client';

import { motion } from 'framer-motion';
import { FileX2, Users, Calendar, Wallet, FileText, Inbox } from 'lucide-react';

const illustrations: Record<string, { icon: React.ElementType; title: string; subtitle: string }> = {
  employees: {
    icon: Users,
    title: 'Belum Ada Data Karyawan',
    subtitle: 'Mulai tambahkan karyawan ke dalam sistem untuk melihat daftar lengkap.',
  },
  attendance: {
    icon: Calendar,
    title: 'Belum Ada Rekap Kehadiran',
    subtitle: 'Input kehadiran karyawan akan ditampilkan di sini.',
  },
  payroll: {
    icon: Wallet,
    title: 'Belum Ada Data Payroll',
    subtitle: 'Generate payroll periode aktif untuk memulai kalkulasi gaji.',
  },
  leave: {
    icon: Calendar,
    title: 'Belum Ada Pengajuan',
    subtitle: 'Belum terdapat pengajuan izin atau cuti dari karyawan.',
  },
  documents: {
    icon: FileText,
    title: 'Belum Ada Dokumen',
    subtitle: 'Upload dokumen karyawan untuk memulai pengelolaan arsip digital.',
  },
  search: {
    icon: Inbox,
    title: 'Hasil Tidak Ditemukan',
    subtitle: 'Coba ubah kata kunci atau filter pencarian Anda.',
  },
  default: {
    icon: FileX2,
    title: 'Data Tidak Tersedia',
    subtitle: 'Silakan tambahkan data baru atau ubah filter pencarian.',
  },
};

export function EmptyState({ type = 'default' }: { type?: string }) {
  const config = illustrations[type] || illustrations.default;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="relative mb-6">
        {/* Decorative circles */}
        <div className="absolute -inset-6 bg-emerald-50 dark:bg-emerald-950/20 rounded-full blur-xl opacity-60" />
        <div className="relative p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
          <Icon className="w-12 h-12 text-slate-300 dark:text-slate-600" strokeWidth={1.5} />
        </div>
      </div>
      <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-1.5">{config.title}</h3>
      <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs text-center leading-relaxed">{config.subtitle}</p>
    </motion.div>
  );
}
