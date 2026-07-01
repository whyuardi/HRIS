'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { employees } from '@/lib/data/employees';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
} from 'recharts';

const statusData = [
  { name: 'Aktif', value: employees.filter(e => e.status === 'active').length, color: '#16A34A' },
  { name: 'Probation', value: employees.filter(e => e.status === 'probation').length, color: '#F59E0B' },
  { name: 'Tidak Aktif', value: employees.filter(e => e.status === 'inactive').length, color: '#6B7280' },
  { name: 'Keluar', value: employees.filter(e => e.status === 'terminated').length, color: '#EF4444' },
].filter(d => d.value > 0);

export function EmployeeStatusChart() {
  return (
    <Card className="border-gray-200 dark:border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">Status Karyawan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', fontSize: '12px', padding: '12px',
                }}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
