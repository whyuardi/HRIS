// =============================================
// HRIS System — Documents Dummy Data
// =============================================

import { EmployeeDocument, DocumentCategory } from '@/types';
import { employees } from './employees';

const categories: DocumentCategory[] = ['KTP', 'KK', 'NPWP', 'Ijazah', 'Sertifikat', 'BPJS', 'Jamsostek', 'Kontrak Kerja'];

function generateDocuments(): EmployeeDocument[] {
  const docs: EmployeeDocument[] = [];
  let id = 1;

  employees.forEach((emp, empIdx) => {
    categories.forEach((cat, catIdx) => {
      const seed = (empIdx * 8 + catIdx) % 10;
      let status: EmployeeDocument['status'];
      
      if (emp.status === 'terminated') {
        status = seed < 7 ? 'verified' : 'uploaded';
      } else if (emp.status === 'probation') {
        status = seed < 3 ? 'uploaded' : seed < 5 ? 'pending_review' : 'not_uploaded';
      } else if (emp.contractStatus === 'permanent') {
        status = seed < 8 ? 'verified' : seed < 9 ? 'uploaded' : 'pending_review';
      } else {
        status = seed < 5 ? 'verified' : seed < 7 ? 'uploaded' : seed < 9 ? 'pending_review' : 'not_uploaded';
      }

      docs.push({
        id: `doc-${String(id++).padStart(3, '0')}`,
        employeeId: emp.id,
        employeeName: emp.name,
        category: cat,
        fileName: status !== 'not_uploaded' ? `${emp.nik}_${cat.replace(/\s/g, '_')}.pdf` : '',
        fileSize: status !== 'not_uploaded' ? `${(100 + seed * 50)}KB` : '',
        uploadDate: status !== 'not_uploaded' ? `2026-0${1 + (empIdx % 6)}-${String(10 + catIdx).padStart(2, '0')}` : null,
        status,
        verifiedBy: status === 'verified' ? 'Ahmad Wijaya' : null,
      });
    });
  });

  return docs;
}

export const employeeDocuments: EmployeeDocument[] = generateDocuments();

export function getDocumentStats() {
  return {
    total: employeeDocuments.length,
    verified: employeeDocuments.filter(d => d.status === 'verified').length,
    uploaded: employeeDocuments.filter(d => d.status === 'uploaded').length,
    pendingReview: employeeDocuments.filter(d => d.status === 'pending_review').length,
    notUploaded: employeeDocuments.filter(d => d.status === 'not_uploaded').length,
  };
}

export function getDocumentsByEmployee(employeeId: string) {
  return employeeDocuments.filter(d => d.employeeId === employeeId);
}

export function getDocumentCompleteness() {
  const activeEmployees = employees.filter(e => e.status === 'active' || e.status === 'probation');
  return activeEmployees.map(emp => {
    const docs = employeeDocuments.filter(d => d.employeeId === emp.id);
    const complete = docs.filter(d => d.status === 'verified' || d.status === 'uploaded').length;
    return {
      employeeId: emp.id,
      employeeName: emp.name,
      division: emp.division,
      total: categories.length,
      complete,
      percentage: Math.round((complete / categories.length) * 100),
    };
  });
}
