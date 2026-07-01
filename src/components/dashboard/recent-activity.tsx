'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { recentActivities } from '@/lib/data/dashboard';
import { LogIn, Upload, Wallet, CalendarDays, CheckCircle2 } from 'lucide-react';

const typeIcons: Record<string, React.ElementType> = {
  check_in: LogIn,
  document_upload: Upload,
  payroll_generated: Wallet,
  leave_request: CalendarDays,
  approval: CheckCircle2,
};

const typeColors: Record<string, string> = {
  check_in: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  document_upload: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  payroll_generated: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  leave_request: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  approval: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
};

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return 'Baru saja';
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export function RecentActivity() {
  return (
    <Card className="border-gray-200 dark:border-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">Aktivitas Terbaru</CardTitle>
      </CardHeader>
      <CardContent className="space-y-0">
        {recentActivities.map((activity, index) => {
          const Icon = typeIcons[activity.type] || LogIn;
          const colorClass = typeColors[activity.type] || typeColors.check_in;

          return (
            <div key={activity.id} className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0">
              {/* Timeline indicator */}
              <div className="relative flex flex-col items-center">
                <div className={`p-1.5 rounded-lg ${colorClass}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                {index < recentActivities.length - 1 && (
                  <div className="w-px h-full bg-gray-200 dark:bg-gray-700 absolute top-8" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{activity.description}</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{formatTime(activity.timestamp)}</p>
              </div>

              {/* Avatar */}
              <Avatar className="w-6 h-6">
                <AvatarImage src={activity.avatar} />
                <AvatarFallback className="text-[8px] bg-gray-100 dark:bg-gray-800">{activity.user.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
              </Avatar>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
