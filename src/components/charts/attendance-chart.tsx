'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { monthlyAttendanceStats } from '@/lib/data/attendance';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

export function AttendanceChart() {
  return (
    <Card className="border-gray-200 dark:border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">Statistik Kehadiran Bulanan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyAttendanceStats} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', fontSize: '12px', padding: '12px',
                }}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="hadir" name="Hadir" fill="#16A34A" radius={[4, 4, 0, 0]} />
              <Bar dataKey="terlambat" name="Terlambat" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="izin" name="Izin" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cuti" name="Cuti" fill="#06B6D4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="wfh" name="WFH" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
