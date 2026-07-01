// =============================================
// HRIS System — Payroll Dummy Data
// =============================================

import { PayrollItem, MonthlyPayroll } from '@/types';
import { employees } from './employees';

export const payrollData: PayrollItem[] = employees
  .filter(e => e.status === 'active' || e.status === 'probation')
  .map((emp, idx) => {
    const basic = emp.salary;
    const allowance = Math.round(basic * 0.15);
    const bonus = idx % 5 === 0 ? Math.round(basic * 0.1) : 0;
    const overtime = idx % 3 === 0 ? Math.round(basic * 0.05) : 0;
    const deduction = idx % 7 === 0 ? 200000 : 0;
    const attendanceDeduction = idx % 4 === 0 ? 150000 : 0;
    const bpjs = Math.round(basic * 0.04);
    const pph = Math.round((basic + allowance + bonus + overtime - deduction - attendanceDeduction - bpjs) * 0.05);
    const net = basic + allowance + bonus + overtime - deduction - attendanceDeduction - bpjs - pph;

    const statuses: PayrollItem['status'][] = ['paid', 'paid', 'paid', 'pending', 'draft'];
    const status = statuses[idx % statuses.length];

    return {
      id: `pay-${String(idx + 1).padStart(3, '0')}`,
      employeeId: emp.id,
      employeeName: emp.name,
      division: emp.division,
      period: 'Juni 2026',
      basicSalary: basic,
      allowance,
      bonus,
      overtime,
      deduction,
      attendanceDeduction,
      bpjs,
      pph,
      netSalary: net,
      status,
      transferDate: status === 'paid' ? '2026-06-28' : null,
    };
  });

export const monthlyPayrollStats: MonthlyPayroll[] = [
  { month: 'Jan', total: 380000000, basic: 300000000, allowance: 45000000, deduction: 35000000 },
  { month: 'Feb', total: 385000000, basic: 302000000, allowance: 46000000, deduction: 37000000 },
  { month: 'Mar', total: 390000000, basic: 305000000, allowance: 47000000, deduction: 38000000 },
  { month: 'Apr', total: 392000000, basic: 308000000, allowance: 47500000, deduction: 38500000 },
  { month: 'Mei', total: 395000000, basic: 310000000, allowance: 48000000, deduction: 39000000 },
  { month: 'Jun', total: 398000000, basic: 312000000, allowance: 48500000, deduction: 39500000 },
  { month: 'Jul', total: 400000000, basic: 315000000, allowance: 49000000, deduction: 40000000 },
  { month: 'Agu', total: 402000000, basic: 316000000, allowance: 49500000, deduction: 40500000 },
  { month: 'Sep', total: 405000000, basic: 318000000, allowance: 50000000, deduction: 41000000 },
  { month: 'Okt', total: 408000000, basic: 320000000, allowance: 50500000, deduction: 41500000 },
  { month: 'Nov', total: 410000000, basic: 322000000, allowance: 51000000, deduction: 42000000 },
  { month: 'Des', total: 415000000, basic: 325000000, allowance: 52000000, deduction: 43000000 },
];

export function getPayrollSummary() {
  const current = payrollData;
  return {
    totalGross: current.reduce((sum, p) => sum + p.basicSalary + p.allowance + p.bonus + p.overtime, 0),
    totalNet: current.reduce((sum, p) => sum + p.netSalary, 0),
    totalDeduction: current.reduce((sum, p) => sum + p.deduction + p.attendanceDeduction + p.bpjs + p.pph, 0),
    totalAllowance: current.reduce((sum, p) => sum + p.allowance, 0),
    paid: current.filter(p => p.status === 'paid').length,
    pending: current.filter(p => p.status === 'pending').length,
    draft: current.filter(p => p.status === 'draft').length,
  };
}
