'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import {
  Users, UserCheck, FileWarning, CalendarOff, Home, Clock,
  Wallet, AlertTriangle, TrendingUp, TrendingDown, Minus,
} from 'lucide-react';

import { useState, useEffect } from 'react';
import { dbGetEmployees, dbGetAttendance, dbGetPayroll } from '@/lib/db';

const cardConfig = [
  { key: 'totalEmployees', label: 'Total Karyawan', icon: Users, gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-600 dark:text-blue-400', bar: 'gradient-bar-blue', trend: '+3', trendDir: 'up' as const, trendLabel: 'bulan ini', format: 'number' },
  { key: 'presentToday', label: 'Hadir Hari Ini', icon: UserCheck, gradient: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400', bar: 'gradient-bar-emerald', trend: '98%', trendDir: 'up' as const, trendLabel: 'tingkat kehadiran', format: 'number' },
  { key: 'onPermission', label: 'Izin', icon: FileWarning, gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50 dark:bg-violet-950/30', text: 'text-violet-600 dark:text-violet-400', bar: 'gradient-bar-purple', trend: '-1', trendDir: 'down' as const, trendLabel: 'dari kemarin', format: 'number' },
  { key: 'onLeave', label: 'Cuti', icon: CalendarOff, gradient: 'from-cyan-500 to-teal-600', bg: 'bg-cyan-50 dark:bg-cyan-950/30', text: 'text-cyan-600 dark:text-cyan-400', bar: 'gradient-bar-cyan', trend: '2', trendDir: 'neutral' as const, trendLabel: 'minggu ini', format: 'number' },
  { key: 'wfh', label: 'WFH', icon: Home, gradient: 'from-indigo-500 to-blue-600', bg: 'bg-indigo-50 dark:bg-indigo-950/30', text: 'text-indigo-600 dark:text-indigo-400', bar: 'gradient-bar-indigo', trend: '+2', trendDir: 'up' as const, trendLabel: 'dari minggu lalu', format: 'number' },
  { key: 'late', label: 'Terlambat', icon: Clock, gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-600 dark:text-amber-400', bar: 'gradient-bar-amber', trend: '-2', trendDir: 'down' as const, trendLabel: 'dari minggu lalu', format: 'number' },
  { key: 'monthlyPayroll', label: 'Payroll Bulan Ini', icon: Wallet, gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400', bar: 'gradient-bar-emerald', trend: '+2.1%', trendDir: 'up' as const, trendLabel: 'dari bulan lalu', format: 'currency' },
  { key: 'contractExpiring', label: 'Kontrak Akan Habis', icon: AlertTriangle, gradient: 'from-rose-500 to-red-600', bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-600 dark:text-rose-400', bar: 'gradient-bar-red', trend: '90 hari', trendDir: 'neutral' as const, trendLabel: 'ke depan', format: 'number' },
];

function formatValue(value: number, format: string): string {
  if (format === 'currency') {
    if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)}M`;
    if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(0)}Jt`;
    return `Rp ${value.toLocaleString('id-ID')}`;
  }
  return value.toString();
}

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
        const Icon = config.icon;
        const value = summary[config.key] || 0;
        const TrendIcon = config.trendDir === 'up' ? TrendingUp : config.trendDir === 'down' ? TrendingDown : Minus;
        const trendColor = config.trendDir === 'up' 
          ? (config.key === 'late' ? 'text-red-500' : 'text-emerald-500')
          : config.trendDir === 'down' 
            ? (config.key === 'late' ? 'text-emerald-500' : 'text-rose-500')
            : 'text-slate-400';

        return (
          <motion.div
            key={config.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05, ease: [0.4, 0, 0.2, 1] }}
          >
            <Card className="group relative overflow-hidden border-slate-200/60 dark:border-slate-800/60 card-hover-lift">
              {/* Top gradient accent bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient}`} />
              
              <CardContent className="p-4 lg:p-5 pt-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{config.label}</p>
                    <p className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {formatValue(value, config.format)}
                    </p>
                    {/* Trend indicator */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <TrendIcon className={`w-3 h-3 ${trendColor}`} />
                      <span className={`text-[10px] font-semibold ${trendColor}`}>{config.trend}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">{config.trendLabel}</span>
                    </div>
                  </div>
                  <div className={`p-2.5 rounded-xl ${config.bg} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-5 h-5 ${config.text}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
