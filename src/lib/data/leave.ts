// =============================================
// HRIS System — Leave & Permission Dummy Data
// =============================================

import { LeaveRequest } from '@/types';

export const leaveRequests: LeaveRequest[] = [
  {
    id: 'leave-001', employeeId: 'emp-007', employeeName: 'Rina Wulandari', division: 'Information Technology',
    type: 'cuti', startDate: '2026-07-10', endDate: '2026-07-12', reason: 'Liburan keluarga',
    status: 'pending', approvedBy: null, approvedDate: null, createdAt: '2026-06-28T08:30:00',
  },
  {
    id: 'leave-002', employeeId: 'emp-009', employeeName: 'Mega Putri', division: 'Finance & Accounting',
    type: 'izin', startDate: '2026-07-03', endDate: '2026-07-03', reason: 'Acara keluarga',
    status: 'approved', approvedBy: 'Siti Rahayu', approvedDate: '2026-06-29T10:15:00', createdAt: '2026-06-27T14:00:00',
  },
  {
    id: 'leave-003', employeeId: 'emp-015', employeeName: 'Randi Mahendra', division: 'Marketing & Sales',
    type: 'sakit', startDate: '2026-07-01', endDate: '2026-07-02', reason: 'Demam dan flu',
    status: 'approved', approvedBy: 'Dewi Lestari', approvedDate: '2026-07-01T09:00:00', createdAt: '2026-07-01T07:30:00',
  },
  {
    id: 'leave-004', employeeId: 'emp-012', employeeName: 'Dian Permata', division: 'Human Resources',
    type: 'cuti', startDate: '2026-07-15', endDate: '2026-07-18', reason: 'Pernikahan adik',
    status: 'pending', approvedBy: null, approvedDate: null, createdAt: '2026-06-30T11:00:00',
  },
  {
    id: 'leave-005', employeeId: 'emp-021', employeeName: 'Gilang Ramadhan', division: 'Information Technology',
    type: 'izin', startDate: '2026-07-05', endDate: '2026-07-05', reason: 'Mengurus perpanjangan SIM',
    status: 'approved', approvedBy: 'Budi Santoso', approvedDate: '2026-07-01T08:45:00', createdAt: '2026-06-29T16:00:00',
  },
  {
    id: 'leave-006', employeeId: 'emp-016', employeeName: 'Indah Permatasari', division: 'Marketing & Sales',
    type: 'cuti', startDate: '2026-07-20', endDate: '2026-07-25', reason: 'Cuti tahunan - wisata ke Bali',
    status: 'pending', approvedBy: null, approvedDate: null, createdAt: '2026-06-30T15:30:00',
  },
  {
    id: 'leave-007', employeeId: 'emp-010', employeeName: 'Andi Setiawan', division: 'Finance & Accounting',
    type: 'dinas', startDate: '2026-07-08', endDate: '2026-07-10', reason: 'Audit cabang Surabaya',
    status: 'approved', approvedBy: 'Siti Rahayu', approvedDate: '2026-06-28T14:00:00', createdAt: '2026-06-26T10:00:00',
  },
  {
    id: 'leave-008', employeeId: 'emp-018', employeeName: 'Putri Handayani', division: 'Operations',
    type: 'sakit', startDate: '2026-06-30', endDate: '2026-07-01', reason: 'Sakit gigi, perlu perawatan',
    status: 'approved', approvedBy: 'Rizky Pratama', approvedDate: '2026-06-30T08:15:00', createdAt: '2026-06-30T07:00:00',
  },
  {
    id: 'leave-009', employeeId: 'emp-006', employeeName: 'Fajar Nugroho', division: 'Information Technology',
    type: 'cuti', startDate: '2026-07-28', endDate: '2026-08-01', reason: 'Mudik Lebaran',
    status: 'rejected', approvedBy: 'Budi Santoso', approvedDate: '2026-06-30T09:30:00', createdAt: '2026-06-28T12:00:00',
  },
  {
    id: 'leave-010', employeeId: 'emp-024', employeeName: 'Anisa Fitriani', division: 'Marketing & Sales',
    type: 'izin', startDate: '2026-07-07', endDate: '2026-07-07', reason: 'Wisuda teman',
    status: 'pending', approvedBy: null, approvedDate: null, createdAt: '2026-07-01T10:00:00',
  },
  {
    id: 'leave-011', employeeId: 'emp-013', employeeName: 'Yusuf Hidayat', division: 'Human Resources',
    type: 'cuti', startDate: '2026-07-14', endDate: '2026-07-16', reason: 'Cuti tahunan',
    status: 'pending', approvedBy: null, approvedDate: null, createdAt: '2026-07-01T11:30:00',
  },
  {
    id: 'leave-012', employeeId: 'emp-019', employeeName: 'Bayu Aditya', division: 'Operations',
    type: 'izin', startDate: '2026-07-04', endDate: '2026-07-04', reason: 'Antar anak ke dokter',
    status: 'approved', approvedBy: 'Rizky Pratama', approvedDate: '2026-07-01T13:00:00', createdAt: '2026-06-30T17:00:00',
  },
];

export function getLeaveSummary() {
  return {
    total: leaveRequests.length,
    pending: leaveRequests.filter(l => l.status === 'pending').length,
    approved: leaveRequests.filter(l => l.status === 'approved').length,
    rejected: leaveRequests.filter(l => l.status === 'rejected').length,
    cuti: leaveRequests.filter(l => l.type === 'cuti').length,
    izin: leaveRequests.filter(l => l.type === 'izin').length,
    sakit: leaveRequests.filter(l => l.type === 'sakit').length,
    dinas: leaveRequests.filter(l => l.type === 'dinas').length,
  };
}
