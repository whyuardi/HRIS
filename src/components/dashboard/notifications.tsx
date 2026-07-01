'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { notifications } from '@/lib/data/dashboard';
import { AlertTriangle, FileWarning, Clock, CalendarCheck, Wallet } from 'lucide-react';

const typeIcons: Record<string, React.ElementType> = {
  contract_expiry: AlertTriangle,
  document_incomplete: FileWarning,
  late_employee: Clock,
  pending_approval: CalendarCheck,
  payroll_pending: Wallet,
};

const priorityColors: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-blue-500',
};

export function NotificationsPanel() {
  const unreadNotifs = notifications.filter(n => !n.read);

  return (
    <Card className="border-gray-200 dark:border-gray-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">Notifikasi</CardTitle>
          <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px] border-0">
            {unreadNotifs.length} baru
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-0">
        {notifications.slice(0, 6).map((notif) => {
          const Icon = typeIcons[notif.type] || AlertTriangle;

          return (
            <div
              key={notif.id}
              className={`flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0 ${
                !notif.read ? 'bg-green-50/50 dark:bg-green-950/10 -mx-6 px-6' : ''
              }`}
            >
              <div className="relative mt-0.5">
                <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                {!notif.read && (
                  <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${priorityColors[notif.priority]}`} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium ${!notif.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                  {notif.title}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{notif.message}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
