// =============================================
// HRIS System — Notifications & Activities Data
// =============================================

import { Notification, Activity, DashboardSummary, JobHistory, SalaryHistory } from '@/types';
import { employees } from './employees';
import { getAttendanceSummary } from './attendance';
import { getPayrollSummary } from './payroll';

export const notifications: Notification[] = [
  {
    id: 'notif-1', type: 'contract_expiry', title: 'Kontrak Akan Habis',
    message: 'Kontrak Dimas Ardianto akan berakhir dalam 14 hari (15 Jul 2026)',
    timestamp: '2026-07-01T08:00:00', read: false, priority: 'high',
  },
  {
    id: 'notif-2', type: 'contract_expiry', title: 'Kontrak Akan Habis',
    message: 'Kontrak Nadia Safitri akan berakhir dalam 14 hari (15 Jul 2026)',
    timestamp: '2026-07-01T08:00:00', read: false, priority: 'high',
  },
  {
    id: 'notif-3', type: 'document_incomplete', title: 'Dokumen Belum Lengkap',
    message: 'Yoga Permana memiliki 4 dokumen yang belum diupload',
    timestamp: '2026-07-01T07:30:00', read: false, priority: 'medium',
  },
  {
    id: 'notif-4', type: 'document_incomplete', title: 'Dokumen Belum Lengkap',
    message: 'Zahra Amelia memiliki 3 dokumen yang belum diupload',
    timestamp: '2026-07-01T07:30:00', read: false, priority: 'medium',
  },
  {
    id: 'notif-5', type: 'late_employee', title: 'Karyawan Terlambat',
    message: '3 karyawan terlambat masuk hari ini',
    timestamp: '2026-07-01T09:30:00', read: false, priority: 'low',
  },
  {
    id: 'notif-6', type: 'pending_approval', title: 'Pengajuan Menunggu',
    message: '5 pengajuan izin/cuti menunggu persetujuan',
    timestamp: '2026-07-01T08:15:00', read: false, priority: 'high',
  },
  {
    id: 'notif-7', type: 'payroll_pending', title: 'Payroll Belum Selesai',
    message: 'Payroll bulan Juli 2026 belum di-generate untuk 8 karyawan',
    timestamp: '2026-07-01T07:00:00', read: true, priority: 'medium',
  },
  {
    id: 'notif-8', type: 'contract_expiry', title: 'Kontrak Akan Habis',
    message: 'Kontrak Yoga Permana akan berakhir pada 10 Jul 2026',
    timestamp: '2026-07-01T08:00:00', read: false, priority: 'high',
  },
];

export const recentActivities: Activity[] = [
  {
    id: 'act-1', type: 'check_in', title: 'Check In',
    description: 'Budi Santoso check in pukul 07:55', timestamp: '2026-07-01T07:55:00',
    user: 'Budi Santoso', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Budi',
  },
  {
    id: 'act-2', type: 'leave_request', title: 'Pengajuan Cuti',
    description: 'Rina Wulandari mengajukan cuti 10-12 Jul 2026', timestamp: '2026-07-01T08:30:00',
    user: 'Rina Wulandari', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Rina',
  },
  {
    id: 'act-3', type: 'approval', title: 'Approval HRD',
    description: 'Ahmad Wijaya menyetujui izin Bayu Aditya', timestamp: '2026-07-01T09:00:00',
    user: 'Ahmad Wijaya', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Ahmad',
  },
  {
    id: 'act-4', type: 'document_upload', title: 'Upload Dokumen',
    description: 'Yoga Permana upload dokumen KTP', timestamp: '2026-07-01T09:15:00',
    user: 'Yoga Permana', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Yoga',
  },
  {
    id: 'act-5', type: 'payroll_generated', title: 'Generate Payroll',
    description: 'Payroll Juni 2026 di-generate oleh Siti Rahayu', timestamp: '2026-06-28T14:00:00',
    user: 'Siti Rahayu', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Siti',
  },
  {
    id: 'act-6', type: 'check_in', title: 'Check In',
    description: 'Fajar Nugroho check in pukul 08:02', timestamp: '2026-07-01T08:02:00',
    user: 'Fajar Nugroho', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Fajar',
  },
  {
    id: 'act-7', type: 'leave_request', title: 'Pengajuan Izin',
    description: 'Anisa Fitriani mengajukan izin 7 Jul 2026', timestamp: '2026-07-01T10:00:00',
    user: 'Anisa Fitriani', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Anisa',
  },
  {
    id: 'act-8', type: 'approval', title: 'Approval HRD',
    description: 'Budi Santoso menolak cuti Fajar Nugroho', timestamp: '2026-06-30T09:30:00',
    user: 'Budi Santoso', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Budi',
  },
];

export function getDashboardSummary(): DashboardSummary {
  const attendance = getAttendanceSummary();
  const payroll = getPayrollSummary();
  const activeEmployees = employees.filter(e => e.status === 'active' || e.status === 'probation');
  const contractExpiring = employees.filter(e => {
    const end = new Date(e.contractEnd);
    const now = new Date();
    const diff = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= 90 && (e.status === 'active' || e.status === 'probation');
  });

  return {
    totalEmployees: activeEmployees.length,
    presentToday: attendance.hadir + attendance.terlambat,
    onLeave: attendance.cuti,
    onPermission: attendance.izin,
    wfh: attendance.wfh,
    late: attendance.terlambat,
    monthlyPayroll: payroll.totalNet,
    contractExpiring: contractExpiring.length,
  };
}

// Job history for employee detail pages
export const jobHistories: JobHistory[] = [
  { id: 'jh-1', employeeId: 'emp-001', position: 'Software Engineer', division: 'Information Technology', startDate: '2020-01-15', endDate: '2021-06-01', type: 'initial' },
  { id: 'jh-2', employeeId: 'emp-001', position: 'Senior Software Engineer', division: 'Information Technology', startDate: '2021-06-01', endDate: '2023-01-01', type: 'promotion' },
  { id: 'jh-3', employeeId: 'emp-001', position: 'IT Manager', division: 'Information Technology', startDate: '2023-01-01', endDate: null, type: 'promotion' },
  { id: 'jh-4', employeeId: 'emp-002', position: 'Financial Analyst', division: 'Finance & Accounting', startDate: '2020-02-01', endDate: '2022-07-01', type: 'initial' },
  { id: 'jh-5', employeeId: 'emp-002', position: 'Finance Manager', division: 'Finance & Accounting', startDate: '2022-07-01', endDate: null, type: 'promotion' },
  { id: 'jh-6', employeeId: 'emp-006', position: 'Software Engineer', division: 'Information Technology', startDate: '2021-01-10', endDate: '2023-06-01', type: 'initial' },
  { id: 'jh-7', employeeId: 'emp-006', position: 'Senior Software Engineer', division: 'Information Technology', startDate: '2023-06-01', endDate: null, type: 'promotion' },
];

export const salaryHistories: SalaryHistory[] = [
  { id: 'sh-1', employeeId: 'emp-001', amount: 15000000, effectiveDate: '2020-01-15', reason: 'Gaji awal' },
  { id: 'sh-2', employeeId: 'emp-001', amount: 18000000, effectiveDate: '2021-06-01', reason: 'Promosi Senior Software Engineer' },
  { id: 'sh-3', employeeId: 'emp-001', amount: 22000000, effectiveDate: '2023-01-01', reason: 'Promosi IT Manager' },
  { id: 'sh-4', employeeId: 'emp-001', amount: 25000000, effectiveDate: '2025-01-01', reason: 'Kenaikan tahunan' },
  { id: 'sh-5', employeeId: 'emp-002', amount: 13000000, effectiveDate: '2020-02-01', reason: 'Gaji awal' },
  { id: 'sh-6', employeeId: 'emp-002', amount: 18000000, effectiveDate: '2022-07-01', reason: 'Promosi Finance Manager' },
  { id: 'sh-7', employeeId: 'emp-002', amount: 23000000, effectiveDate: '2025-01-01', reason: 'Kenaikan tahunan' },
  { id: 'sh-8', employeeId: 'emp-006', amount: 12000000, effectiveDate: '2021-01-10', reason: 'Gaji awal' },
  { id: 'sh-9', employeeId: 'emp-006', amount: 15000000, effectiveDate: '2023-06-01', reason: 'Promosi Senior Software Engineer' },
  { id: 'sh-10', employeeId: 'emp-006', amount: 18000000, effectiveDate: '2025-01-01', reason: 'Kenaikan tahunan' },
];
