'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { monthlyPayrollStats } from '@/lib/data/payroll';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const formattedData = monthlyPayrollStats.map(d => ({
  ...d,
  total: d.total / 1_000_000,
  basic: d.basic / 1_000_000,
  allowance: d.allowance / 1_000_000,
  deduction: d.deduction / 1_000_000,
}));

export function PayrollChart() {
  return (
    <Card className="border-gray-200 dark:border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">Tren Payroll Bulanan (Juta)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16A34A" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorBasic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', fontSize: '12px', padding: '12px',
                }}
              formatter={(value) => [`Rp ${Number(value).toFixed(0)} Jt`, '']}
              />
              <Area type="monotone" dataKey="total" name="Total" stroke="#16A34A" fill="url(#colorTotal)" strokeWidth={2} />
              <Area type="monotone" dataKey="basic" name="Gaji Pokok" stroke="#3B82F6" fill="url(#colorBasic)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
