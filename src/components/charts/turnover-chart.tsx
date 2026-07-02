'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const turnoverData = [
  { month: 'Jan', masuk: 2, keluar: 0 },
  { month: 'Feb', masuk: 1, keluar: 0 },
  { month: 'Mar', masuk: 1, keluar: 1 },
  { month: 'Apr', masuk: 0, keluar: 0 },
  { month: 'Mei', masuk: 2, keluar: 0 },
  { month: 'Jun', masuk: 1, keluar: 1 },
];

export function TurnoverChart() {
  return (
    <Card className="border-gray-200 dark:border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">Tren Keluar Masuk Karyawan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={turnoverData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:stroke-slate-800" />
              <XAxis dataKey="month" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', fontSize: '12px', padding: '10px',
                }}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="masuk" name="Masuk (Join)" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="keluar" name="Keluar (Resign)" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
