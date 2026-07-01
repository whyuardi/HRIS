'use client';

import { SummaryCards } from '@/components/dashboard/summary-cards';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { NotificationsPanel } from '@/components/dashboard/notifications';
import { AttendanceChart } from '@/components/charts/attendance-chart';
import { PayrollChart } from '@/components/charts/payroll-chart';
import { DivisionChart } from '@/components/charts/division-chart';
import { EmployeeStatusChart } from '@/components/charts/employee-chart';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <SummaryCards />

      {/* Charts Row */}
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

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DivisionChart />
        <EmployeeStatusChart />
      </div>
    </div>
  );
}
