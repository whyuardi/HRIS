'use client';

import { motion } from 'framer-motion';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AttendanceChart } from '@/components/charts/attendance-chart';
import { PayrollChart } from '@/components/charts/payroll-chart';
import { DivisionChart } from '@/components/charts/division-chart';
import { EmployeeStatusChart } from '@/components/charts/employee-chart';
import { monthlyAttendanceStats } from '@/lib/data/attendance';
import { employees } from '@/lib/data/employees';
import { Download, FileBarChart } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts';

// Turnover data
const turnoverData = [
  { month: 'Jan', masuk: 2, keluar: 0 },
  { month: 'Feb', masuk: 1, keluar: 0 },
  { month: 'Mar', masuk: 1, keluar: 1 },
  { month: 'Apr', masuk: 0, keluar: 0 },
  { month: 'Mei', masuk: 2, keluar: 0 },
  { month: 'Jun', masuk: 1, keluar: 1 },
  { month: 'Jul', masuk: 0, keluar: 0 },
  { month: 'Agu', masuk: 1, keluar: 0 },
  { month: 'Sep', masuk: 0, keluar: 1 },
  { month: 'Okt', masuk: 2, keluar: 0 },
  { month: 'Nov', masuk: 1, keluar: 0 },
  { month: 'Des', masuk: 0, keluar: 1 },
];

// Lateness trend
const latenessTrend = monthlyAttendanceStats.map(d => ({
  month: d.month,
  terlambat: d.terlambat,
  target: 3,
}));

import { toast } from 'sonner';

export default function ReportsPage() {
  const handleExportPDF = () => {
    toast.success('Mempersiapkan dokumen PDF...', {
      description: 'Gunakan dialog cetak browser dan pilih "Simpan sebagai PDF" (Save as PDF).',
    });
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="HR Reporting"
        description="Laporan dan analitik sumber daya manusia"
      >
        <Button variant="outline" size="sm" className="gap-2 text-xs print-visible" onClick={handleExportPDF}>
          <Download className="w-4 h-4" /> Export PDF
        </Button>
        <Button size="sm" className="gap-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => toast.success('Analisis laporan diperbarui!')}>
          <FileBarChart className="w-4 h-4" /> Generate Laporan
        </Button>
      </PageHeader>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Karyawan Aktif', value: employees.filter(e => e.status === 'active').length, trend: '+2', trendUp: true },
          { label: 'Rata-rata Kehadiran', value: '85%', trend: '+1.2%', trendUp: true },
          { label: 'Turnover Rate', value: '3.3%', trend: '-0.5%', trendUp: false },
          { label: 'Rata-rata Keterlambatan', value: '5.2%', trend: '-0.8%', trendUp: false },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
          >
            <Card className="border-gray-200 dark:border-gray-800">
              <CardContent className="p-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">{stat.label}</p>
                <div className="flex items-end gap-2 mt-1">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <span className={`text-xs font-medium mb-1 ${stat.trendUp ? 'text-green-600' : 'text-red-500'}`}>
                    {stat.trend}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceChart />
        <PayrollChart />
      </div>

      {/* Row 2: Lateness Trend + Turnover */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">Tren Keterlambatan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={latenessTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', fontSize: '12px', padding: '12px',
                    }}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                  <Line type="monotone" dataKey="terlambat" name="Terlambat" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="target" name="Target Max" stroke="#EF4444" strokeWidth={1} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">Turn Over Karyawan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={turnoverData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', fontSize: '12px', padding: '12px',
                    }}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="masuk" name="Masuk" fill="#16A34A" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="keluar" name="Keluar" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DivisionChart />
        <EmployeeStatusChart />
      </div>
    </div>
  );
}
