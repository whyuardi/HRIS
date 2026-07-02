'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { NAVIGATION_ITEMS } from '@/lib/constants';

const pathLabels: Record<string, string> = {
  '': 'Dashboard',
  employees: 'Data Karyawan',
  'org-chart': 'Struktur Organisasi',
  attendance: 'Absensi',
  payroll: 'Payroll',
  leave: 'Izin & Cuti',
  reports: 'HR Reporting',
  documents: 'Dokumen',
  settings: 'Pengaturan',
  login: 'Login',
  'activity-log': 'Activity Log',
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null; // no breadcrumbs on dashboard

  return (
    <nav className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 mb-4 print:hidden">
      <Link href="/" className="flex items-center gap-1 hover:text-emerald-600 transition-colors font-medium">
        <Home className="w-3 h-3" />
        <span>Dashboard</span>
      </Link>
      {segments.map((segment, index) => {
        const href = '/' + segments.slice(0, index + 1).join('/');
        const isLast = index === segments.length - 1;
        const label = pathLabels[segment] || decodeURIComponent(segment);

        return (
          <span key={href} className="flex items-center gap-1">
            <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-700" />
            {isLast ? (
              <span className="font-semibold text-slate-700 dark:text-slate-300">{label}</span>
            ) : (
              <Link href={href} className="hover:text-emerald-600 transition-colors font-medium">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
