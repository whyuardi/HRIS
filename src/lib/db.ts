// =============================================
// HRIS System — Local Storage Mock Database
// =============================================

import { Employee, Attendance, LeaveRequest, PayrollItem, EmployeeDocument } from '@/types';
import { employees as initialEmployees } from './data/employees';
import { todayAttendance as initialAttendance } from './data/attendance';
import { leaveRequests as initialLeave } from './data/leave';
import { payrollData as initialPayroll } from './data/payroll';
import { employeeDocuments as initialDocuments } from './data/documents';

// Helper to check if window is defined (SSR safety)
const isClient = typeof window !== 'undefined';

function getStorageItem<T>(key: string, defaultValue: T): T {
  if (!isClient) return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  if (!isClient) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
}

// Initializers
export function initDb() {
  if (!isClient) return;
  if (!localStorage.getItem('hr_employees')) {
    localStorage.setItem('hr_employees', JSON.stringify(initialEmployees));
  }
  if (!localStorage.getItem('hr_attendance')) {
    localStorage.setItem('hr_attendance', JSON.stringify(initialAttendance));
  }
  if (!localStorage.getItem('hr_leave')) {
    localStorage.setItem('hr_leave', JSON.stringify(initialLeave));
  }
  if (!localStorage.getItem('hr_payroll')) {
    localStorage.setItem('hr_payroll', JSON.stringify(initialPayroll));
  }
  if (!localStorage.getItem('hr_documents')) {
    localStorage.setItem('hr_documents', JSON.stringify(initialDocuments));
  }
}

// --- Employees API ---
export function dbGetEmployees(): Employee[] {
  initDb();
  return getStorageItem<Employee[]>('hr_employees', initialEmployees);
}

export function dbSaveEmployee(employee: Employee): void {
  const list = dbGetEmployees();
  const index = list.findIndex(e => e.id === employee.id);
  if (index >= 0) {
    list[index] = employee;
  } else {
    list.unshift(employee);
  }
  setStorageItem('hr_employees', list);
}

export function dbDeleteEmployee(id: string): void {
  const list = dbGetEmployees();
  const filtered = list.filter(e => e.id !== id);
  setStorageItem('hr_employees', filtered);
}

// --- Attendance API ---
export function dbGetAttendance(): Attendance[] {
  initDb();
  return getStorageItem<Attendance[]>('hr_attendance', initialAttendance);
}

export function dbSaveAttendance(record: Attendance): void {
  const list = dbGetAttendance();
  const index = list.findIndex(r => r.id === record.id || (r.employeeId === record.employeeId && r.date === record.date));
  if (index >= 0) {
    list[index] = record;
  } else {
    list.unshift(record);
  }
  setStorageItem('hr_attendance', list);
}

// --- Leave Requests API ---
export function dbGetLeaveRequests(): LeaveRequest[] {
  initDb();
  return getStorageItem<LeaveRequest[]>('hr_leave', initialLeave);
}

export function dbSaveLeaveRequest(request: LeaveRequest): void {
  const list = dbGetLeaveRequests();
  const index = list.findIndex(r => r.id === request.id);
  if (index >= 0) {
    list[index] = request;
  } else {
    list.unshift(request);
  }
  setStorageItem('hr_leave', list);
}

// --- Payroll API ---
export function dbGetPayroll(): PayrollItem[] {
  initDb();
  return getStorageItem<PayrollItem[]>('hr_payroll', initialPayroll);
}

export function dbSavePayroll(item: PayrollItem): void {
  const list = dbGetPayroll();
  const index = list.findIndex(r => r.id === item.id);
  if (index >= 0) {
    list[index] = item;
  } else {
    list.unshift(item);
  }
  setStorageItem('hr_payroll', list);
}

export function dbGeneratePayroll(period: string): void {
  const activeEmployees = dbGetEmployees().filter(e => e.status === 'active' || e.status === 'probation');
  const existingPayroll = dbGetPayroll();
  
  const newPayrollItems: PayrollItem[] = activeEmployees.map((emp, idx) => {
    // Check if payroll already exists for this employee in this period
    const existing = existingPayroll.find(p => p.employeeId === emp.id && p.period === period);
    if (existing) return existing;

    const basic = emp.salary;
    const allowance = Math.round(basic * 0.15);
    const bonus = idx % 5 === 0 ? Math.round(basic * 0.1) : 0;
    const overtime = idx % 3 === 0 ? Math.round(basic * 0.05) : 0;
    const deduction = idx % 7 === 0 ? 200000 : 0;
    const attendanceDeduction = idx % 4 === 0 ? 150000 : 0;
    const bpjs = Math.round(basic * 0.04);
    const pph = Math.round((basic + allowance + bonus + overtime - deduction - attendanceDeduction - bpjs) * 0.05);
    const net = basic + allowance + bonus + overtime - deduction - attendanceDeduction - bpjs - pph;

    return {
      id: `pay-${Date.now()}-${idx}`,
      employeeId: emp.id,
      employeeName: emp.name,
      division: emp.division,
      period,
      basicSalary: basic,
      allowance,
      bonus,
      overtime,
      deduction,
      attendanceDeduction,
      bpjs,
      pph,
      netSalary: net,
      status: 'pending',
      transferDate: null,
    };
  });

  // Combine and preserve any already paid items
  const combined = [...newPayrollItems];
  existingPayroll.forEach(p => {
    if (p.period === period && p.status === 'paid') {
      const idx = combined.findIndex(c => c.employeeId === p.employeeId && c.period === period);
      if (idx >= 0) combined[idx] = p;
    } else if (p.period !== period) {
      combined.push(p);
    }
  });

  setStorageItem('hr_payroll', combined);
}

// --- Documents API ---
export function dbGetDocuments(): EmployeeDocument[] {
  initDb();
  return getStorageItem<EmployeeDocument[]>('hr_documents', initialDocuments);
}

export function dbSaveDocument(doc: EmployeeDocument): void {
  const list = dbGetDocuments();
  const index = list.findIndex(r => r.id === doc.id);
  if (index >= 0) {
    list[index] = doc;
  } else {
    list.unshift(doc);
  }
  setStorageItem('hr_documents', list);
}
