'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { NotificationsPanel } from '@/components/dashboard/notifications';
import { AttendanceChart } from '@/components/charts/attendance-chart';
import { PayrollChart } from '@/components/charts/payroll-chart';
import { DivisionChart } from '@/components/charts/division-chart';
import { EmployeeStatusChart } from '@/components/charts/employee-chart';
import { TurnoverChart } from '@/components/charts/turnover-chart';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { dbGetEmployees, dbGetAttendance } from '@/lib/db';
import { Hexagon, Sparkles, CheckSquare, Calendar, ChevronRight } from 'lucide-react';

export default function DashboardPage() {
  const [greeting, setGreeting] = useState('Selamat Pagi');
  const [statsSummary, setStatsSummary] = useState({
    activeCount: 0,
    presentPercent: 100,
    pendingLeaves: 2,
  });

  useEffect(() => {
    // Set greeting based on local time
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('Selamat Pagi');
    else if (hour >= 12 && hour < 15) setGreeting('Selamat Siang');
    else if (hour >= 15 && hour < 18) setGreeting('Selamat Sore');
    else setGreeting('Selamat Malam');

    // Calculate stats
    const emps = dbGetEmployees();
    const att = dbGetAttendance();
    
    const active = emps.filter(e => e.status === 'active' || e.status === 'probation').length;
    const presentToday = att.filter(a => a.status === 'hadir' || a.status === 'terlambat').length;
    const presentPct = active > 0 ? Math.round((presentToday / active) * 100) : 100;

    setStatsSummary({
      activeCount: active,
      presentPercent: presentPct,
      pendingLeaves: 2, // Mock pending
    });
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Personalized Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="relative overflow-hidden border-0 bg-gradient-to-r from-emerald-600 via-emerald-700 to-green-800 shadow-xl shadow-emerald-500/10 rounded-2xl">
          {/* Decorative background grid and bubbles */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-50" />
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute -left-10 -top-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl" />
          
          <CardContent className="p-6 sm:p-8 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 text-white">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-white/10 backdrop-blur-md">
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                </div>
                <span className="text-xs font-semibold text-emerald-250 uppercase tracking-wider">PT. Benua Green Energy Portal</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {greeting}, Admin HRD! 👋
              </h2>
              <p className="text-sm text-emerald-100/90 max-w-xl leading-relaxed">
                Hari ini {statsSummary.presentPercent}% karyawan hadir tepat waktu. Anda memiliki {statsSummary.activeCount} karyawan aktif terdaftar, dan {statsSummary.pendingLeaves} pengajuan cuti menunggu tinjauan Anda.
              </p>
            </div>
            
            {/* Quick stats badges */}
            <div className="flex flex-wrap gap-2.5 sm:pt-0 pt-2">
              <div className="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 space-y-0.5 text-center min-w-[90px]">
                <p className="text-[10px] text-emerald-200 uppercase font-semibold">Kehadiran</p>
                <p className="text-base font-extrabold">{statsSummary.presentPercent}%</p>
              </div>
              <div className="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 space-y-0.5 text-center min-w-[90px]">
                <p className="text-[10px] text-emerald-200 uppercase font-semibold">Karyawan</p>
                <p className="text-base font-extrabold">{statsSummary.activeCount}</p>
              </div>
              <div className="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 space-y-0.5 text-center min-w-[90px]">
                <p className="text-[10px] text-emerald-200 uppercase font-semibold">Tugas HR</p>
                <p className="text-base font-extrabold">5 Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary KPI Cards */}
      <SummaryCards />

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceChart />
        <PayrollChart />
      </div>

      {/* Middle Row: Quick Actions + Activity + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <QuickActions />
        <RecentActivity />
        <NotificationsPanel />
      </div>

      {/* Bottom widgets section: Todo Widget & Upcoming Events + Division distribution charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Todo Widget */}
        <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-600" /> Daftar Tugas HRD
              </h3>
              <Badge variant="outline" className="text-[9px] font-semibold text-emerald-600 border-emerald-100 bg-emerald-50/50">5 Kerja</Badge>
            </div>
            <div className="space-y-3">
              {[
                { title: 'Tinjau berkas BPJS Karyawan Baru', checked: false },
                { title: 'Kalkulasi lembur proyek lapangan', checked: true },
                { title: 'Kirim slip gaji Periode Juni 2026', checked: false },
                { title: 'Ubah status karyawan Budi Santoso', checked: false },
                { title: 'Konfirmasi cuti Dewi Lestari', checked: false },
              ].map((todo, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100/50 dark:border-slate-900/50 transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-900/50">
                  <input
                    type="checkbox"
                    defaultChecked={todo.checked}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 mt-0.5 cursor-pointer"
                  />
                  <span className={`text-xs font-medium ${todo.checked ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-350'}`}>
                    {todo.title}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events Panel */}
        <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" /> Jadwal Mendatang
              </h3>
              <Badge variant="outline" className="text-[9px] font-semibold text-blue-600 border-blue-100 bg-blue-50/50">3 Agenda</Badge>
            </div>
            <div className="space-y-3">
              {[
                { date: '05 Jul', title: 'Ulang Tahun: Siti Rahayu', type: 'Ultah' },
                { date: '10 Jul', title: 'Evaluasi Kinerja Mid-Year', type: 'Review' },
                { date: '15 Jul', title: 'Batas Akhir (Cutoff) Payroll', type: 'Payroll' },
              ].map((evt, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 border-b last:border-0 border-slate-100 dark:border-slate-900">
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-semibold font-mono text-[10px] text-center min-w-[44px]">
                    {evt.date}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-850 dark:text-white truncate">{evt.title}</p>
                    <p className="text-[9px] text-slate-400 font-semibold uppercase mt-0.5">{evt.type}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Division Chart directly */}
        <DivisionChart />

      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmployeeStatusChart />
        <TurnoverChart />
      </div>
    </div>
  );
}
