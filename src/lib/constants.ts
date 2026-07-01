// =============================================
// HRIS System — Constants
// =============================================

export const APP_NAME = 'HR Pro';
export const COMPANY_NAME = 'PT. Benua Green Energy';

export const NAVIGATION_ITEMS = [
  { label: 'Dashboard', href: '/', icon: 'LayoutDashboard' },
  { label: 'Data Karyawan', href: '/employees', icon: 'Users' },
  { label: 'Absensi', href: '/attendance', icon: 'Clock' },
  { label: 'Payroll', href: '/payroll', icon: 'Wallet' },
  { label: 'Izin & Cuti', href: '/leave', icon: 'CalendarDays' },
  { label: 'HR Reporting', href: '/reports', icon: 'BarChart3' },
  { label: 'Dokumen', href: '/documents', icon: 'FileText' },
  { label: 'Pengaturan', href: '/settings', icon: 'Settings' },
] as const;

export const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  terminated: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  probation: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  permanent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  contract: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  intern: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  freelance: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  hadir: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  terlambat: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  wfh: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  izin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  cuti: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  sakit: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  dinas: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  tidak_hadir: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  uploaded: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  verified: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  pending_review: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  not_uploaded: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export const STATUS_LABELS: Record<string, string> = {
  active: 'Aktif',
  inactive: 'Tidak Aktif',
  terminated: 'Keluar',
  probation: 'Probation',
  permanent: 'Tetap',
  contract: 'Kontrak',
  intern: 'Magang',
  freelance: 'Freelance',
  hadir: 'Hadir',
  terlambat: 'Terlambat',
  wfh: 'WFH',
  izin: 'Izin',
  cuti: 'Cuti',
  sakit: 'Sakit',
  dinas: 'Dinas Luar',
  tidak_hadir: 'Tidak Hadir',
  paid: 'Lunas',
  pending: 'Menunggu',
  draft: 'Draft',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  uploaded: 'Uploaded',
  verified: 'Terverifikasi',
  pending_review: 'Review',
  not_uploaded: 'Belum Upload',
};
