'use client';

import { Card, CardContent } from '@/components/ui/card';

export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <Card className="border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <div className="skeleton skeleton-text w-16 h-3" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, ri) => (
              <tr key={ri} className="border-b border-slate-50 dark:border-slate-900">
                {Array.from({ length: cols }).map((_, ci) => (
                  <td key={ci} className="px-4 py-3">
                    {ci === 0 ? (
                      <div className="flex items-center gap-3">
                        <div className="skeleton skeleton-avatar w-8 h-8" />
                        <div className="space-y-1.5">
                          <div className="skeleton skeleton-text w-24 h-3" />
                          <div className="skeleton skeleton-text w-16 h-2" />
                        </div>
                      </div>
                    ) : (
                      <div className="skeleton skeleton-text w-20 h-3" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
          <div className="h-1 skeleton" />
          <CardContent className="p-4 pt-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="skeleton skeleton-text w-20 h-2.5" />
                <div className="skeleton skeleton-text w-28 h-5" />
              </div>
              <div className="skeleton w-10 h-10 rounded-xl" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <Card className="border-slate-200/60 dark:border-slate-800/60">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="skeleton skeleton-text w-32 h-4" />
          <div className="skeleton skeleton-text w-16 h-3" />
        </div>
        <div className="skeleton w-full h-48 rounded-xl" />
      </CardContent>
    </Card>
  );
}
