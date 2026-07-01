'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { divisions } from '@/lib/data/divisions';
import { employees } from '@/lib/data/employees';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
} from 'recharts';

const COLORS = ['#3B82F6', '#8B5CF6', '#16A34A', '#F59E0B', '#EF4444'];

export function DivisionChart() {
  const data = divisions.map((div, idx) => ({
    name: div.name.split(' ')[0],
    fullName: div.name,
    value: employees.filter(e => e.divisionId === div.id && (e.status === 'active' || e.status === 'probation')).length,
    color: COLORS[idx % COLORS.length],
  }));

  return (
    <Card className="border-gray-200 dark:border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">Distribusi Divisi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', fontSize: '12px', padding: '12px',
                }}
                formatter={(value, name) => [`${value} karyawan`, name]}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
