'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { getDashboardSummary } from '@/lib/data/dashboard';
import {
  Users, UserCheck, FileWarning, CalendarOff, Home, Clock,
  Wallet, AlertTriangle,
} from 'lucide-react';

const iconMap = [Users, UserCheck, FileWarning, CalendarOff, Home, Clock, Wallet, AlertTriangle];

const cardConfig = [
  { key: 'totalEmployees', label: 'Total Karyawan', icon: 0, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-600 dark:text-blue-400', format: 'number' },
  { key: 'presentToday', label: 'Hadir Hari Ini', icon: 1, color: 'from-green-500 to-emerald-600', bg: 'bg-green-50 dark:bg-green-950/30', text: 'text-green-600 dark:text-green-400', format: 'number' },
  { key: 'onPermission', label: 'Izin', icon: 2, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-600 dark:text-purple-400', format: 'number' },
  { key: 'onLeave', label: 'Cuti', icon: 3, color: 'from-cyan-500 to-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-950/30', text: 'text-cyan-600 dark:text-cyan-400', format: 'number' },
  { key: 'wfh', label: 'WFH', icon: 4, color: 'from-indigo-500 to-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/30', text: 'text-indigo-600 dark:text-indigo-400', format: 'number' },
  { key: 'late', label: 'Terlambat', icon: 5, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-600 dark:text-amber-400', format: 'number' },
  { key: 'monthlyPayroll', label: 'Payroll Bulan Ini', icon: 6, color: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400', format: 'currency' },
  { key: 'contractExpiring', label: 'Kontrak Akan Habis', icon: 7, color: 'from-red-500 to-red-600', bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-600 dark:text-red-400', format: 'number' },
];

function formatValue(value: number, format: string): string {
  if (format === 'currency') {
    if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)}M`;
    if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(0)}Jt`;
    return `Rp ${value.toLocaleString('id-ID')}`;
  }
  return value.toString();
}

import { useState, useEffect } from 'react';
import { dbGetEmployees, dbGetAttendance, dbGetPayroll } from '@/lib/db';

export function SummaryCards() {
  const [summary, setSummary] = useState<any>({
    totalEmployees: 0,
    presentToday: 0,
    onLeave: 0,
    onPermission: 0,
    wfh: 0,
    late: 0,
    monthlyPayroll: 0,
    contractExpiring: 0,
  });

  useEffect(() => {
    const emps = dbGetEmployees();
    const att = dbGetAttendance();
    const pay = dbGetPayroll();

    const activeEmployees = emps.filter(e => e.status === 'active' || e.status === 'probation');
    const contractExpiring = emps.filter(e => {
      const end = new Date(e.contractEnd);
      const now = new Date();
      const diff = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diff > 0 && diff <= 90 && (e.status === 'active' || e.status === 'probation');
    });

    setSummary({
      totalEmployees: activeEmployees.length,
      presentToday: att.filter(a => a.status === 'hadir' || a.status === 'terlambat').length,
      onLeave: att.filter(a => a.status === 'cuti').length,
      onPermission: att.filter(a => a.status === 'izin').length,
      wfh: att.filter(a => a.status === 'wfh').length,
      late: att.filter(a => a.status === 'terlambat').length,
      monthlyPayroll: pay.reduce((sum, p) => sum + p.netSalary, 0),
      contractExpiring: contractExpiring.length,
    });
  }, []);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cardConfig.map((config, index) => {
        const Icon = iconMap[config.icon];
        const value = summary[config.key] || 0;

        return (
          <motion.div
            key={config.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05, ease: [0.4, 0, 0.2, 1] }}
          >
            <Card className="group relative overflow-hidden border-gray-200 dark:border-gray-800 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 transition-all duration-300 hover:-translate-y-0.5">
              <CardContent className="p-4 lg:p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{config.label}</p>
                    <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                      {formatValue(value, config.format)}
                    </p>
                  </div>
                  <div className={`p-2.5 rounded-xl ${config.bg}`}>
                    <Icon className={`w-5 h-5 ${config.text}`} />
                  </div>
                </div>
                {/* Decorative gradient bar at bottom */}
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${config.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
