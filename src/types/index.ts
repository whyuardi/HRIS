// =============================================
// HRIS System — Type Definitions
// =============================================

export type EmployeeStatus = 'active' | 'inactive' | 'terminated' | 'probation';
export type ContractStatus = 'permanent' | 'contract' | 'intern' | 'freelance';
export type AttendanceStatus = 'hadir' | 'terlambat' | 'wfh' | 'izin' | 'cuti' | 'tidak_hadir';
export type LeaveType = 'izin' | 'cuti' | 'sakit' | 'dinas';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type PayrollStatus = 'paid' | 'pending' | 'draft';
export type DocumentCategory = 'KTP' | 'KK' | 'NPWP' | 'Ijazah' | 'Sertifikat' | 'BPJS' | 'Jamsostek' | 'Kontrak Kerja';
export type DocumentStatus = 'uploaded' | 'pending_review' | 'not_uploaded' | 'verified';
export type Gender = 'male' | 'female';

export interface Division {
  id: string;
  name: string;
  head: string;
  employeeCount: number;
  color: string;
}

export interface Position {
  id: string;
  name: string;
  level: number;
  divisionId: string;
}

export interface Employee {
  id: string;
  nik: string;
  name: string;
  avatar: string;
  gender: Gender;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
  joinDate: string;
  position: string;
  division: string;
  divisionId: string;
  status: EmployeeStatus;
  contractStatus: ContractStatus;
  contractEnd: string;
  bpjs: boolean;
  salary: number;
  bankName?: string;
  bankAccount?: string;
  bankAccountName?: string;
}

export interface JobHistory {
  id: string;
  employeeId: string;
  position: string;
  division: string;
  startDate: string;
  endDate: string | null;
  type: 'promotion' | 'transfer' | 'demotion' | 'initial';
}

export interface SalaryHistory {
  id: string;
  employeeId: string;
  amount: number;
  effectiveDate: string;
  reason: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  employeeName: string;
  division: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  workHours: number;
  status: AttendanceStatus;
  note: string;
}

export interface PayrollItem {
  id: string;
  employeeId: string;
  employeeName: string;
  division: string;
  period: string;
  basicSalary: number;
  allowance: number;
  bonus: number;
  overtime: number;
  deduction: number;
  attendanceDeduction: number;
  bpjs: number;
  pph: number;
  netSalary: number;
  status: PayrollStatus;
  transferDate: string | null;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  division: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: ApprovalStatus;
  approvedBy: string | null;
  approvedDate: string | null;
  createdAt: string;
}

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  employeeName: string;
  category: DocumentCategory;
  fileName: string;
  fileSize: string;
  uploadDate: string | null;
  status: DocumentStatus;
  verifiedBy: string | null;
}

export interface Notification {
  id: string;
  type: 'contract_expiry' | 'document_incomplete' | 'late_employee' | 'pending_approval' | 'payroll_pending';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface Activity {
  id: string;
  type: 'check_in' | 'document_upload' | 'payroll_generated' | 'leave_request' | 'approval';
  title: string;
  description: string;
  timestamp: string;
  user: string;
  avatar: string;
}

export interface DashboardSummary {
  totalEmployees: number;
  presentToday: number;
  onLeave: number;
  onPermission: number;
  wfh: number;
  late: number;
  monthlyPayroll: number;
  contractExpiring: number;
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface MonthlyAttendance {
  month: string;
  hadir: number;
  terlambat: number;
  izin: number;
  cuti: number;
  wfh: number;
}

export interface MonthlyPayroll {
  month: string;
  total: number;
  basic: number;
  allowance: number;
  deduction: number;
}
