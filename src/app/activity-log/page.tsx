'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  History, Search, UserPlus, UserMinus, Edit, FileCheck, Download,
  CheckCircle2, XCircle, Clock, Wallet, CalendarDays, Shield, Filter,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';

interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  target: string;
  category: 'employee' | 'attendance' | 'payroll' | 'leave' | 'document' | 'system';
  details?: string;
}

const ACTIVITY_LOG_KEY = 'hris_activity_log';

// Helper function for logging activities from anywhere
export function logActivity(action: string, target: string, category: ActivityLog['category'], details?: string) {
  const logs = JSON.parse(localStorage.getItem(ACTIVITY_LOG_KEY) || '[]');
  const newLog: ActivityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    user: 'Admin HRD',
    action,
    target,
    category,
    details,
  };
  logs.unshift(newLog);
  // Keep last 200 logs
  localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(logs.slice(0, 200)));
}

const categoryConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  employee: { icon: UserPlus, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  attendance: { icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  payroll: { icon: Wallet, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  leave: { icon: CalendarDays, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/30' },
  document: { icon: FileCheck, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/30' },
  system: { icon: Shield, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800/50' },
};

function generateSampleLogs(): ActivityLog[] {
  const now = Date.now();
  return [
    { id: 'log-s1', timestamp: new Date(now - 5 * 60000).toISOString(), user: 'Admin HRD', action: 'Menambah Karyawan', target: 'Budi Santoso', category: 'employee', details: 'Departemen: IT' },
    { id: 'log-s2', timestamp: new Date(now - 15 * 60000).toISOString(), user: 'Admin HRD', action: 'Checkout Absensi', target: 'Sari Dewi', category: 'attendance', details: 'Checkout: 17:05' },
    { id: 'log-s3', timestamp: new Date(now - 30 * 60000).toISOString(), user: 'Admin HRD', action: 'Approve Cuti', target: 'Ahmad Fadli', category: 'leave', details: 'Cuti Tahunan: 5-7 Jul' },
    { id: 'log-s4', timestamp: new Date(now - 60 * 60000).toISOString(), user: 'Admin HRD', action: 'Generate Payroll', target: 'Periode Juli 2026', category: 'payroll', details: '15 karyawan diproses' },
    { id: 'log-s5', timestamp: new Date(now - 2 * 3600000).toISOString(), user: 'Admin HRD', action: 'Upload Dokumen', target: 'KTP - Rina M.', category: 'document', details: 'Verified' },
    { id: 'log-s6', timestamp: new Date(now - 3 * 3600000).toISOString(), user: 'Admin HRD', action: 'Edit Data Karyawan', target: 'Dian Purnama', category: 'employee', details: 'Update rekening bank' },
    { id: 'log-s7', timestamp: new Date(now - 5 * 3600000).toISOString(), user: 'Admin HRD', action: 'Reject Izin', target: 'Hendra W.', category: 'leave', details: 'Alasan: kuota habis' },
    { id: 'log-s8', timestamp: new Date(now - 8 * 3600000).toISOString(), user: 'Admin HRD', action: 'Checkin Absensi', target: 'Semua Karyawan', category: 'attendance', details: 'Batch auto-checkin' },
    { id: 'log-s9', timestamp: new Date(now - 24 * 3600000).toISOString(), user: 'System', action: 'Backup Data', target: 'Database', category: 'system', details: 'Auto backup harian' },
    { id: 'log-s10', timestamp: new Date(now - 48 * 3600000).toISOString(), user: 'Admin HRD', action: 'Download Laporan', target: 'Laporan Absensi Juni', category: 'system', details: 'Format: CSV' },
  ];
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const stored = localStorage.getItem(ACTIVITY_LOG_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.length > 0) {
        setLogs(parsed);
        return;
      }
    }
    // Generate sample logs if none exist
    const samples = generateSampleLogs();
    localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(samples));
    setLogs(samples);
  }, []);

  const filtered = logs.filter(log => {
    const matchSearch = search === '' ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.target.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || log.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Log"
        description="Riwayat semua aktivitas yang terjadi di sistem HRIS"
      >
        <Button
          size="sm"
          variant="outline"
          className="gap-2 text-xs rounded-xl"
          onClick={() => {
            const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `activity-log-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
          }}
        >
          <Download className="w-3.5 h-3.5" />
          Export Log
        </Button>
      </PageHeader>

      {/* Filters */}
      <Card className="border-slate-200/60 dark:border-slate-800/60">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Cari aktivitas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-9 text-sm bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl"
              />
            </div>
            <Select value={categoryFilter} onValueChange={(v) => v && setCategoryFilter(v)}>
              <SelectTrigger className="w-full sm:w-40 h-9 text-xs rounded-xl">
                <Filter className="w-3 h-3 mr-1.5" />
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="employee">Karyawan</SelectItem>
                <SelectItem value="attendance">Absensi</SelectItem>
                <SelectItem value="payroll">Payroll</SelectItem>
                <SelectItem value="leave">Cuti/Izin</SelectItem>
                <SelectItem value="document">Dokumen</SelectItem>
                <SelectItem value="system">Sistem</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="border-slate-200/60 dark:border-slate-800/60">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <EmptyState type="default" />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              <AnimatePresence>
                {filtered.map((log, index) => {
                  const config = categoryConfig[log.category] || categoryConfig.system;
                  const Icon = config.icon;
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
                    >
                      <div className={`p-2 rounded-xl ${config.bg} flex-shrink-0 mt-0.5`}>
                        <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">{log.action}</span>
                          <span className="text-xs text-slate-400">—</span>
                          <span className="text-sm text-slate-600 dark:text-slate-400">{log.target}</span>
                        </div>
                        {log.details && (
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{log.details}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end flex-shrink-0">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{timeAgo(log.timestamp)}</span>
                        <span className="text-[9px] text-slate-300 dark:text-slate-600 mt-0.5">{log.user}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
