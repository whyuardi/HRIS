'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Wallet, ClipboardList, Upload, Download, FileBarChart } from 'lucide-react';

const actions = [
  { label: 'Tambah Karyawan', icon: UserPlus, color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400', hoverBg: 'hover:bg-blue-100 dark:hover:bg-blue-950/50' },
  { label: 'Generate Payroll', icon: Wallet, color: 'bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400', hoverBg: 'hover:bg-green-100 dark:hover:bg-green-950/50' },
  { label: 'Input Absensi', icon: ClipboardList, color: 'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400', hoverBg: 'hover:bg-purple-100 dark:hover:bg-purple-950/50' },
  { label: 'Upload Dokumen', icon: Upload, color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400', hoverBg: 'hover:bg-amber-100 dark:hover:bg-amber-950/50' },
  { label: 'Export Data', icon: Download, color: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/30 dark:text-cyan-400', hoverBg: 'hover:bg-cyan-100 dark:hover:bg-cyan-950/50' },
  { label: 'Generate Laporan', icon: FileBarChart, color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400', hoverBg: 'hover:bg-indigo-100 dark:hover:bg-indigo-950/50' },
];

export function QuickActions() {
  return (
    <Card className="border-gray-200 dark:border-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.label}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.color} ${action.hoverBg} transition-colors cursor-pointer`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium text-center leading-tight">{action.label}</span>
            </motion.button>
          );
        })}
      </CardContent>
    </Card>
  );
}
