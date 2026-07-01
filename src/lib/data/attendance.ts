// =============================================
// HRIS System — Attendance Dummy Data
// =============================================

import { Attendance, MonthlyAttendance } from '@/types';
import { employees } from './employees';

function generateTodayAttendance(): Attendance[] {
  const today = new Date().toISOString().split('T')[0];
  const statuses: Array<{ status: Attendance['status']; weight: number }> = [
    { status: 'hadir', weight: 60 },
    { status: 'terlambat', weight: 10 },
    { status: 'wfh', weight: 10 },
    { status: 'izin', weight: 5 },
    { status: 'cuti', weight: 10 },
    { status: 'tidak_hadir', weight: 5 },
  ];

  return employees
    .filter(e => e.status === 'active' || e.status === 'probation')
    .map((emp, idx) => {
      // Deterministic assignment based on index
      let cumWeight = 0;
      const threshold = ((idx * 37 + 13) % 100);
      let chosenStatus: Attendance['status'] = 'hadir';
      for (const s of statuses) {
        cumWeight += s.weight;
        if (threshold < cumWeight) {
          chosenStatus = s.status;
          break;
        }
      }

      const checkInHour = chosenStatus === 'terlambat' ? 9 : 8;
      const checkInMinute = chosenStatus === 'terlambat' 
        ? 15 + (idx % 30) 
        : (idx % 50);
      const checkOutHour = 17 + (idx % 2);
      const hasCheckIn = chosenStatus !== 'tidak_hadir' && chosenStatus !== 'cuti' && chosenStatus !== 'izin';
      const hasCheckOut = hasCheckIn && chosenStatus !== 'wfh';

      const checkIn = hasCheckIn ? `${String(checkInHour).padStart(2, '0')}:${String(checkInMinute).padStart(2, '0')}` : null;
      const checkOut = hasCheckOut ? `${String(checkOutHour).padStart(2, '0')}:${String(idx % 50).padStart(2, '0')}` : null;
      const workHours = hasCheckIn && hasCheckOut
        ? checkOutHour - checkInHour + (((idx % 50) - checkInMinute) / 60)
        : chosenStatus === 'wfh' ? 8 : 0;

      return {
        id: `att-${String(idx + 1).padStart(3, '0')}`,
        employeeId: emp.id,
        employeeName: emp.name,
        division: emp.division,
        date: today,
        checkIn,
        checkOut: chosenStatus === 'wfh' ? '17:00' : checkOut,
        workHours: Math.round(workHours * 10) / 10,
        status: chosenStatus,
        note: chosenStatus === 'wfh' ? 'Work from home' :
              chosenStatus === 'izin' ? 'Keperluan keluarga' :
              chosenStatus === 'cuti' ? 'Cuti tahunan' :
              chosenStatus === 'terlambat' ? 'Macet' :
              chosenStatus === 'tidak_hadir' ? 'Tanpa keterangan' : '',
      };
    });
}

export const todayAttendance: Attendance[] = generateTodayAttendance();

export const monthlyAttendanceStats: MonthlyAttendance[] = [
  { month: 'Jan', hadir: 85, terlambat: 5, izin: 3, cuti: 4, wfh: 3 },
  { month: 'Feb', hadir: 82, terlambat: 7, izin: 4, cuti: 5, wfh: 2 },
  { month: 'Mar', hadir: 88, terlambat: 4, izin: 2, cuti: 3, wfh: 3 },
  { month: 'Apr', hadir: 80, terlambat: 6, izin: 5, cuti: 6, wfh: 3 },
  { month: 'Mei', hadir: 86, terlambat: 5, izin: 3, cuti: 3, wfh: 3 },
  { month: 'Jun', hadir: 84, terlambat: 6, izin: 4, cuti: 4, wfh: 2 },
  { month: 'Jul', hadir: 83, terlambat: 5, izin: 3, cuti: 5, wfh: 4 },
  { month: 'Agu', hadir: 87, terlambat: 4, izin: 2, cuti: 4, wfh: 3 },
  { month: 'Sep', hadir: 85, terlambat: 6, izin: 3, cuti: 3, wfh: 3 },
  { month: 'Okt', hadir: 86, terlambat: 5, izin: 4, cuti: 3, wfh: 2 },
  { month: 'Nov', hadir: 84, terlambat: 5, izin: 3, cuti: 5, wfh: 3 },
  { month: 'Des', hadir: 78, terlambat: 4, izin: 5, cuti: 8, wfh: 5 },
];

export function getAttendanceSummary() {
  const data = todayAttendance;
  return {
    total: data.length,
    hadir: data.filter(a => a.status === 'hadir').length,
    terlambat: data.filter(a => a.status === 'terlambat').length,
    wfh: data.filter(a => a.status === 'wfh').length,
    izin: data.filter(a => a.status === 'izin').length,
    cuti: data.filter(a => a.status === 'cuti').length,
    tidak_hadir: data.filter(a => a.status === 'tidak_hadir').length,
  };
}
