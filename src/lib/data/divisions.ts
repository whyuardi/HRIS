// =============================================
// HRIS System — Divisions & Positions Data
// =============================================

import { Division, Position } from '@/types';

export const divisions: Division[] = [
  { id: 'div-1', name: 'Information Technology', head: 'Budi Santoso', employeeCount: 8, color: '#3B82F6' },
  { id: 'div-2', name: 'Finance & Accounting', head: 'Siti Rahayu', employeeCount: 6, color: '#8B5CF6' },
  { id: 'div-3', name: 'Human Resources', head: 'Ahmad Wijaya', employeeCount: 5, color: '#16A34A' },
  { id: 'div-4', name: 'Marketing & Sales', head: 'Dewi Lestari', employeeCount: 6, color: '#F59E0B' },
  { id: 'div-5', name: 'Operations', head: 'Rizky Pratama', employeeCount: 5, color: '#EF4444' },
];

export const positions: Position[] = [
  { id: 'pos-1', name: 'Software Engineer', level: 3, divisionId: 'div-1' },
  { id: 'pos-2', name: 'Senior Software Engineer', level: 4, divisionId: 'div-1' },
  { id: 'pos-3', name: 'IT Manager', level: 5, divisionId: 'div-1' },
  { id: 'pos-4', name: 'Financial Analyst', level: 3, divisionId: 'div-2' },
  { id: 'pos-5', name: 'Finance Manager', level: 5, divisionId: 'div-2' },
  { id: 'pos-6', name: 'HR Specialist', level: 3, divisionId: 'div-3' },
  { id: 'pos-7', name: 'HR Manager', level: 5, divisionId: 'div-3' },
  { id: 'pos-8', name: 'Marketing Executive', level: 3, divisionId: 'div-4' },
  { id: 'pos-9', name: 'Sales Manager', level: 5, divisionId: 'div-4' },
  { id: 'pos-10', name: 'Operations Coordinator', level: 3, divisionId: 'div-5' },
];
