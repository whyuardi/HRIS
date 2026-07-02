'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { dbGetEmployees, dbSaveEmployee, dbDeleteEmployee } from '@/lib/db';
import { divisions } from '@/lib/data/divisions';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { 
  Search, UserPlus, Eye, Pencil, Trash2, Filter, Download, Upload, 
  ChevronLeft, ChevronRight, Check, X, User, Briefcase, CreditCard, 
  AlertTriangle, CheckSquare, Square, RefreshCcw 
} from 'lucide-react';
import { Employee, EmployeeStatus, ContractStatus } from '@/types';

const ITEMS_PER_PAGE = 10;

import { TableSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  address: '',
  birthDate: '',
  joinDate: '',
  position: 'Software Engineer',
  divisionId: 'div-1',
  status: 'active' as EmployeeStatus,
  contractStatus: 'contract' as ContractStatus,
  salary: '10000000',
  bankName: 'BCA',
  bankAccount: '',
  bankAccountName: '',
};

export default function EmployeesPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [employeeList, setEmployeeList] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [contractFilter, setContractFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Selection states
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);

  // Form states
  const [formData, setFormData] = useState({ ...emptyForm });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Import mock state
  const [importText, setImportText] = useState(
    "Rian Hidayat,rian.hidayat@benuagreenenergy.co.id,081287654321,Software Engineer,div-1,12000000,BCA,8720129999\n" +
    "Siti Aminah,siti.aminah@benuagreenenergy.co.id,081198765432,Financial Analyst,div-2,9500000,Mandiri,1234567890"
  );

  // Load employees
  useEffect(() => {
    const timer = setTimeout(() => {
      setEmployeeList(dbGetEmployees());
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    const handleBeforePrint = () => setIsPrinting(true);
    const handleAfterPrint = () => setIsPrinting(false);
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  const filteredEmployees = useMemo(() => {
    return employeeList.filter(emp => {
      const matchSearch = search === '' ||
        emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.nik.toLowerCase().includes(search.toLowerCase()) ||
        emp.email.toLowerCase().includes(search.toLowerCase());
      const matchDivision = divisionFilter === 'all' || emp.divisionId === divisionFilter;
      const matchStatus = statusFilter === 'all' || emp.status === statusFilter;
      const matchContract = contractFilter === 'all' || emp.contractStatus === contractFilter;
      return matchSearch && matchDivision && matchStatus && matchContract;
    });
  }, [search, divisionFilter, statusFilter, contractFilter, employeeList]);

  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const paginatedEmployees = isPrinting
    ? filteredEmployees
    : filteredEmployees.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIdsOnPage = paginatedEmployees.map(emp => emp.id);
      setSelectedIds(new Set([...selectedIds, ...allIdsOnPage]));
    } else {
      const newIds = new Set(selectedIds);
      paginatedEmployees.forEach(emp => newIds.delete(emp.id));
      setSelectedIds(newIds);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newIds = new Set(selectedIds);
    if (checked) {
      newIds.add(id);
    } else {
      newIds.delete(id);
    }
    setSelectedIds(newIds);
  };

  const isAllSelected = paginatedEmployees.length > 0 && paginatedEmployees.every(emp => selectedIds.has(emp.id));

  // Bulk actions
  const handleBulkDelete = () => {
    const selectedCount = selectedIds.size;
    if (confirm(`Apakah Anda yakin ingin menghapus ${selectedCount} karyawan yang terpilih?`)) {
      selectedIds.forEach(id => {
        dbDeleteEmployee(id);
      });
      setEmployeeList(dbGetEmployees());
      setSelectedIds(new Set());
      toast.error(`${selectedCount} Karyawan telah dihapus`, {
        description: 'Data berhasil dihapus dari database lokal.',
      });
    }
  };

  const handleBulkStatusChange = (status: EmployeeStatus) => {
    const list = dbGetEmployees();
    let updatedCount = 0;
    list.forEach(emp => {
      if (selectedIds.has(emp.id)) {
        emp.status = status;
        dbSaveEmployee(emp);
        updatedCount++;
      }
    });
    setEmployeeList(dbGetEmployees());
    setSelectedIds(new Set());
    toast.success(`Status ${updatedCount} Karyawan diperbarui`, {
      description: `Status telah diubah menjadi ${status === 'active' ? 'Aktif' : 'Tidak Aktif'}.`,
    });
  };

  // Form validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Nama wajib diisi';
    if (!formData.email.trim()) errors.email = 'Email wajib diisi';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Format email tidak valid';
    if (!formData.phone.trim()) errors.phone = 'No HP wajib diisi';
    if (!formData.joinDate) errors.joinDate = 'Tanggal bergabung wajib diisi';
    if (!formData.salary || Number(formData.salary) <= 0) errors.salary = 'Gaji harus lebih dari 0';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Add Employee
  const handleAddEmployee = () => {
    if (!validateForm()) return;

    const div = divisions.find(d => d.id === formData.divisionId);
    const year = new Date(formData.joinDate || new Date()).getFullYear();
    const count = employeeList.length + 1;
    const nik = `EMP-${year}-${String(count).padStart(3, '0')}`;

    const employee: Employee = {
      id: `emp-${Date.now()}`,
      nik,
      name: formData.name,
      avatar: `https://api.dicebear.com/9.x/notionists/svg?seed=${formData.name.split(' ')[0]}`,
      gender: 'male',
      email: formData.email,
      phone: formData.phone || '081234567890',
      address: formData.address || 'Alamat perusahaan',
      birthDate: formData.birthDate || '1995-01-01',
      joinDate: formData.joinDate || new Date().toISOString().split('T')[0],
      position: formData.position,
      division: div?.name || 'Information Technology',
      divisionId: formData.divisionId,
      status: formData.status,
      contractStatus: formData.contractStatus,
      contractEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      bpjs: true,
      salary: Number(formData.salary) || 8000000,
      bankName: formData.bankName || 'BCA',
      bankAccount: formData.bankAccount || '',
      bankAccountName: formData.bankAccountName || formData.name,
    };

    dbSaveEmployee(employee);
    setEmployeeList(dbGetEmployees());
    setIsAddDialogOpen(false);
    setFormData({ ...emptyForm });
    setFormErrors({});
    toast.success('Karyawan berhasil ditambahkan', {
      description: `${employee.name} (${nik}) telah didaftarkan ke sistem.`,
    });
  };

  // Handle Edit Employee
  const openEditDialog = (emp: Employee) => {
    setEditTarget(emp);
    setFormData({
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      address: emp.address,
      birthDate: emp.birthDate,
      joinDate: emp.joinDate,
      position: emp.position,
      divisionId: emp.divisionId,
      status: emp.status,
      contractStatus: emp.contractStatus,
      salary: String(emp.salary),
      bankName: emp.bankName || 'BCA',
      bankAccount: emp.bankAccount || '',
      bankAccountName: emp.bankAccountName || '',
    });
    setFormErrors({});
    setIsEditDialogOpen(true);
  };

  const handleEditEmployee = () => {
    if (!validateForm() || !editTarget) return;

    const div = divisions.find(d => d.id === formData.divisionId);
    const updatedEmployee: Employee = {
      ...editTarget,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      birthDate: formData.birthDate,
      joinDate: formData.joinDate,
      position: formData.position,
      division: div?.name || editTarget.division,
      divisionId: formData.divisionId,
      status: formData.status,
      contractStatus: formData.contractStatus,
      salary: Number(formData.salary),
      bankName: formData.bankName,
      bankAccount: formData.bankAccount,
      bankAccountName: formData.bankAccountName,
    };

    dbSaveEmployee(updatedEmployee);
    setEmployeeList(dbGetEmployees());
    setIsEditDialogOpen(false);
    setEditTarget(null);
    setFormData({ ...emptyForm });
    setFormErrors({});
    toast.success('Data karyawan berhasil diperbarui', {
      description: `Data ${updatedEmployee.name} telah disimpan.`,
    });
  };

  // Handle Delete
  const openDeleteDialog = (emp: Employee) => {
    setDeleteTarget(emp);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteEmployee = () => {
    if (!deleteTarget) return;
    dbDeleteEmployee(deleteTarget.id);
    setEmployeeList(dbGetEmployees());
    setIsDeleteDialogOpen(false);
    toast.error('Karyawan telah dihapus', {
      description: `${deleteTarget.name} telah dihapus dari sistem.`,
    });
    setDeleteTarget(null);
  };

  // Export to CSV Function
  const handleExportCSV = () => {
    const headers = ['NIK', 'Nama', 'Email', 'No HP', 'Jabatan', 'Divisi', 'Gaji Pokok', 'Bank', 'Rekening'];
    const rows = employeeList.map(emp => [
      emp.nik,
      emp.name,
      emp.email,
      emp.phone,
      emp.position,
      emp.division,
      emp.salary,
      emp.bankName || 'BCA',
      emp.bankAccount || ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `data_karyawan_bge_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Export CSV Berhasil', {
      description: 'Data seluruh karyawan telah diunduh ke komputer Anda.',
    });
  };

  // Import mock CSV text parser
  const handleImportCSV = () => {
    if (!importText.trim()) {
      toast.error('Silakan isi teks data CSV terlebih dahulu');
      return;
    }

    const lines = importText.split('\n');
    let importedCount = 0;
    
    lines.forEach(line => {
      const parts = line.split(',');
      if (parts.length >= 5) {
        const [name, email, phone, position, divisionId, salaryStr, bankName, bankAccount] = parts.map(p => p.trim());
        if (!name || !email) return;

        const div = divisions.find(d => d.id === divisionId) || divisions[0];
        const year = new Date().getFullYear();
        const count = employeeList.length + importedCount + 1;
        const nik = `EMP-${year}-${String(count).padStart(3, '0')}`;

        const employee: Employee = {
          id: `emp-import-${Date.now()}-${importedCount}`,
          nik,
          name,
          avatar: `https://api.dicebear.com/9.x/notionists/svg?seed=${name.split(' ')[0]}`,
          gender: 'male',
          email,
          phone: phone || '081234567890',
          address: 'Alamat Kantor Pusat',
          birthDate: '1995-01-01',
          joinDate: new Date().toISOString().split('T')[0],
          position: position || 'Staff',
          division: div.name,
          divisionId: div.id,
          status: 'active',
          contractStatus: 'contract',
          contractEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          bpjs: true,
          salary: Number(salaryStr) || 7500000,
          bankName: bankName || 'BCA',
          bankAccount: bankAccount || '',
          bankAccountName: name,
        };

        dbSaveEmployee(employee);
        importedCount++;
      }
    });

    if (importedCount > 0) {
      setEmployeeList(dbGetEmployees());
      setIsImportDialogOpen(false);
      toast.success('Import Karyawan Sukses', {
        description: `${importedCount} karyawan baru telah berhasil ditambahkan ke database.`,
      });
    } else {
      toast.error('Gagal mengimpor data', {
        description: 'Format baris teks tidak cocok (Nama,Email,NoHP,Jabatan,DivisiId,Gaji,Bank,Rekening)',
      });
    }
  };

  const renderForm = () => (
    <div className="space-y-5 py-2 max-h-[65vh] overflow-y-auto pr-1">
      {/* Section: Personal Info */}
      <div>
        <div className="modal-section-divider mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
              <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Informasi Personal</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5 col-span-2">
            <Label htmlFor="name" className="text-xs font-medium">Nama Lengkap <span className="text-rose-500">*</span></Label>
            <Input id="name" placeholder="Budi Santoso" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={`h-9 text-sm transition-all duration-200 ${formErrors.name ? 'border-rose-400 focus-visible:ring-rose-400' : ''}`} />
            {formErrors.name && <p className="text-[11px] text-rose-500 font-medium">{formErrors.name}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium">Email <span className="text-rose-500">*</span></Label>
            <Input id="email" type="email" placeholder="budi@company.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={`h-9 text-sm transition-all duration-200 ${formErrors.email ? 'border-rose-400 focus-visible:ring-rose-400' : ''}`} />
            {formErrors.email && <p className="text-[11px] text-rose-500 font-medium">{formErrors.email}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs font-medium">No HP <span className="text-rose-500">*</span></Label>
            <Input id="phone" placeholder="0812XXXXXXXX" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={`h-9 text-sm transition-all duration-200 ${formErrors.phone ? 'border-rose-400 focus-visible:ring-rose-400' : ''}`} />
            {formErrors.phone && <p className="text-[11px] text-rose-500 font-medium">{formErrors.phone}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="birthDate" className="text-xs font-medium">Tanggal Lahir</Label>
            <Input id="birthDate" type="date" value={formData.birthDate} onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })} className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="joinDate" className="text-xs font-medium">Tanggal Bergabung <span className="text-rose-500">*</span></Label>
            <Input id="joinDate" type="date" value={formData.joinDate} onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })} className={`h-9 text-sm ${formErrors.joinDate ? 'border-rose-400 focus-visible:ring-rose-400' : ''}`} />
            {formErrors.joinDate && <p className="text-[11px] text-rose-500 font-medium">{formErrors.joinDate}</p>}
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label htmlFor="address" className="text-xs font-medium">Alamat</Label>
            <Textarea id="address" placeholder="Alamat lengkap tempat tinggal..." value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="text-sm min-h-[50px]" />
          </div>
        </div>
      </div>

      {/* Section: Job Info */}
      <div>
        <div className="modal-section-divider mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/30">
              <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Informasi Pekerjaan</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="division" className="text-xs font-medium">Divisi</Label>
            <Select value={formData.divisionId} onValueChange={(v) => v && setFormData({ ...formData, divisionId: v })}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Pilih Divisi" />
              </SelectTrigger>
              <SelectContent>
                {divisions.map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="position" className="text-xs font-medium">Jabatan</Label>
            <Input id="position" placeholder="Software Engineer" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contract" className="text-xs font-medium">Status Kontrak</Label>
            <Select value={formData.contractStatus} onValueChange={(v) => v && setFormData({ ...formData, contractStatus: v as ContractStatus })}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Pilih Kontrak" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="permanent">Tetap</SelectItem>
                <SelectItem value="contract">Kontrak</SelectItem>
                <SelectItem value="intern">Magang</SelectItem>
                <SelectItem value="freelance">Freelance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="status" className="text-xs font-medium">Status Keaktifan</Label>
            <Select value={formData.status} onValueChange={(v) => v && setFormData({ ...formData, status: v as EmployeeStatus })}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Pilih Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="probation">Probation</SelectItem>
                <SelectItem value="inactive">Tidak Aktif</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="salary" className="text-xs font-medium">Gaji Pokok <span className="text-rose-500">*</span></Label>
            <Input id="salary" type="number" placeholder="8000000" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} className={`h-9 text-sm ${formErrors.salary ? 'border-rose-400 focus-visible:ring-rose-400' : ''}`} />
            {formErrors.salary && <p className="text-[11px] text-rose-500 font-medium">{formErrors.salary}</p>}
          </div>
        </div>
      </div>

      {/* Section: Bank Account */}
      <div>
        <div className="modal-section-divider mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30">
              <CreditCard className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Informasi Rekening Bank</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="bankName" className="text-xs font-medium">Nama Bank</Label>
            <Select value={formData.bankName} onValueChange={(v) => v && setFormData({ ...formData, bankName: v })}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Pilih Bank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BCA">BCA</SelectItem>
                <SelectItem value="Mandiri">Mandiri</SelectItem>
                <SelectItem value="BNI">BNI</SelectItem>
                <SelectItem value="BRI">BRI</SelectItem>
                <SelectItem value="CIMB Niaga">CIMB Niaga</SelectItem>
                <SelectItem value="Bank Syariah Indonesia">BSI</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bankAccount" className="text-xs font-medium">Nomor Rekening</Label>
            <Input id="bankAccount" placeholder="Contoh: 8720123456" value={formData.bankAccount} onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })} className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label htmlFor="bankAccountName" className="text-xs font-medium">Nama Pemilik Rekening</Label>
            <Input id="bankAccountName" placeholder="Nama sesuai buku tabungan" value={formData.bankAccountName} onChange={(e) => setFormData({ ...formData, bankAccountName: e.target.value })} className="h-9 text-sm" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 relative">
      
      {/* Page Header */}
      <PageHeader
        title="Data Karyawan"
        description={`${filteredEmployees.length} karyawan terdaftar dalam sistem`}
      >
        <div className="flex gap-2">
          {/* Import Button */}
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-xl text-xs h-9 px-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer font-medium text-slate-700 dark:text-slate-350">
              <Upload className="w-4 h-4" /> Import CSV
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/20">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-base">Import Karyawan via CSV</DialogTitle>
                    <DialogDescription className="text-xs mt-0.5">
                      Tempel teks baris karyawan di bawah untuk mensimulasikan upload file CSV.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-3 py-3 text-xs">
                <p className="text-slate-500">Format baris data: <br />
                  <code className="bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded font-mono font-bold">Nama,Email,NoHP,Jabatan,DivisiId,Gaji,Bank,Rekening</code>
                </p>
                <Textarea 
                  value={importText} 
                  onChange={(e) => setImportText(e.target.value)} 
                  placeholder="Nama,Email,NoHP,Jabatan,DivisiId,Gaji,Bank,Rekening"
                  className="font-mono text-xs min-h-[140px] leading-relaxed" 
                />
              </div>
              <DialogFooter>
                <div className="flex gap-3 w-full">
                  <Button variant="outline" className="flex-1 text-xs h-10 rounded-xl" onClick={() => setIsImportDialogOpen(false)}>Batal</Button>
                  <Button className="flex-1 text-xs h-10 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white btn-premium shadow-lg shadow-emerald-500/20" onClick={handleImportCSV}>
                    <Check className="w-4 h-4 mr-1.5" /> Import Data
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Export Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2 text-xs rounded-xl" onClick={handleExportCSV}>
              <Download className="w-4 h-4" /> Export CSV
            </Button>
            <Button variant="outline" size="sm" className="gap-2 text-xs rounded-xl print-visible" onClick={() => {
              toast.success('Mempersiapkan daftar karyawan PDF...', {
                description: 'Gunakan dialog cetak browser dan pilih "Simpan sebagai PDF" (Save as PDF).',
              });
              setTimeout(() => {
                window.print();
              }, 500);
            }}>
              <Download className="w-4 h-4" /> Export PDF
            </Button>
          </div>

          {/* Add Dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={(o) => { setIsAddDialogOpen(o); if (!o) { setFormData({ ...emptyForm }); setFormErrors({}); } }}>
            <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-xl text-xs font-semibold h-9 px-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white transition-all duration-200 btn-premium cursor-pointer shadow-lg shadow-emerald-500/20">
              <UserPlus className="w-4 h-4" /> Tambah Karyawan
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/20">
                    <UserPlus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-base">Tambah Karyawan Baru</DialogTitle>
                    <DialogDescription className="text-xs mt-0.5">
                      Masukkan data lengkap karyawan. NIK akan otomatis dibuat.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              {renderForm()}
              <DialogFooter>
                <div className="flex gap-3 w-full">
                  <Button variant="outline" className="flex-1 text-xs h-10 rounded-xl" onClick={() => { setIsAddDialogOpen(false); setFormData({ ...emptyForm }); setFormErrors({}); }}>Batal</Button>
                  <Button className="flex-1 text-xs h-10 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white btn-premium shadow-lg shadow-emerald-500/20" onClick={handleAddEmployee}>
                    <Check className="w-4 h-4 mr-1.5" /> Simpan Karyawan
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </PageHeader>

      {/* EDIT Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(o) => { setIsEditDialogOpen(o); if (!o) { setEditTarget(null); setFormData({ ...emptyForm }); setFormErrors({}); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
                <Pencil className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-base">Edit Data Karyawan</DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  Perbarui data {editTarget?.name || 'karyawan'} di bawah ini.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {renderForm()}
          <DialogFooter>
            <div className="flex gap-3 w-full">
              <Button variant="outline" className="flex-1 text-xs h-10 rounded-xl" onClick={() => { setIsEditDialogOpen(false); setEditTarget(null); setFormData({ ...emptyForm }); setFormErrors({}); }}>Batal</Button>
              <Button className="flex-1 text-xs h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white btn-premium shadow-lg shadow-blue-500/20" onClick={handleEditEmployee}>
                <Check className="w-4 h-4 mr-1.5" /> Simpan Perubahan
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={(o) => { setIsDeleteDialogOpen(o); if (!o) setDeleteTarget(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="flex flex-col items-center text-center gap-3 pt-2">
              <div className="p-3 rounded-full bg-rose-50 dark:bg-rose-950/30">
                <AlertTriangle className="w-8 h-8 text-rose-500" />
              </div>
              <div>
                <DialogTitle className="text-base">Hapus Karyawan?</DialogTitle>
                <DialogDescription className="text-xs mt-1.5">
                  Data <strong className="text-slate-700 dark:text-slate-300">{deleteTarget?.name}</strong> ({deleteTarget?.nik}) akan dihapus secara permanen dan tidak dapat dikembalikan.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <div className="flex gap-3 w-full">
              <Button variant="outline" className="flex-1 text-xs h-10 rounded-xl" onClick={() => { setIsDeleteDialogOpen(false); setDeleteTarget(null); }}>Batal</Button>
              <Button className="flex-1 text-xs h-10 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white btn-premium" onClick={handleDeleteEmployee}>
                <Trash2 className="w-4 h-4 mr-1.5" /> Ya, Hapus
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl flex items-center gap-5 shadow-2xl border border-slate-800"
          >
            <div className="flex items-center gap-2 border-r border-slate-800 pr-4 text-xs font-semibold text-slate-300">
              <CheckSquare className="w-4 h-4 text-emerald-500" />
              <span>{selectedIds.size} Karyawan Terpilih</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => handleBulkStatusChange('active')}
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs font-medium text-emerald-400 hover:text-emerald-300 hover:bg-slate-850 px-2 rounded-lg cursor-pointer"
              >
                Set Aktif
              </Button>
              <Button 
                onClick={() => handleBulkStatusChange('inactive')}
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs font-medium text-slate-400 hover:text-slate-350 hover:bg-slate-850 px-2 rounded-lg cursor-pointer"
              >
                Set Nonaktif
              </Button>
              <Button 
                onClick={handleBulkDelete}
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs font-bold text-rose-450 hover:text-rose-400 hover:bg-slate-850 px-2 rounded-lg cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Hapus Massal
              </Button>
            </div>
            <button 
              onClick={() => setSelectedIds(new Set())}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <Card className="border-slate-200/60 dark:border-slate-800/60">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Cari nama, NIK, atau email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10 h-9 text-sm bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl"
              />
            </div>
            <Select value={divisionFilter} onValueChange={(v) => { if (v) { setDivisionFilter(v); setPage(1); } }}>
              <SelectTrigger className="w-full sm:w-44 h-9 text-xs rounded-xl">
                <Filter className="w-3 h-3 mr-1.5" />
                <SelectValue placeholder="Semua Divisi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Divisi</SelectItem>
                {divisions.map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { if (v) { setStatusFilter(v); setPage(1); } }}>
              <SelectTrigger className="w-full sm:w-36 h-9 text-xs rounded-xl">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="probation">Probation</SelectItem>
                <SelectItem value="inactive">Tidak Aktif</SelectItem>
                <SelectItem value="terminated">Keluar</SelectItem>
              </SelectContent>
            </Select>
            <Select value={contractFilter} onValueChange={(v) => { if (v) { setContractFilter(v); setPage(1); } }}>
              <SelectTrigger className="w-full sm:w-36 h-9 text-xs rounded-xl">
                <SelectValue placeholder="Semua Kontrak" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kontrak</SelectItem>
                <SelectItem value="permanent">Tetap</SelectItem>
                <SelectItem value="contract">Kontrak</SelectItem>
                <SelectItem value="intern">Magang</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton rows={5} cols={8} />
      ) : filteredEmployees.length === 0 ? (
        <Card className="border-slate-200/60 dark:border-slate-800/60 p-8">
          <EmptyState type="employees" />
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80 dark:bg-slate-900/50">
                    {/* Select Header Checkbox */}
                    <TableHead className="w-12 text-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-slate-350 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                    </TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 w-28">NIK</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Nama</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Jabatan</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Divisi</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Status</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 hidden xl:table-cell">Bergabung</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 hidden lg:table-cell">No HP</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 hidden xl:table-cell">Kontrak</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 hidden xl:table-cell">BPJS</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEmployees.map((emp) => {
                    const isRowSelected = selectedIds.has(emp.id);
                    return (
                      <TableRow key={emp.id} className={`table-row-hover group ${isRowSelected ? 'bg-emerald-50/20 dark:bg-emerald-950/5' : ''}`}>
                        {/* Row Checkbox */}
                        <TableCell className="text-center">
                          <input
                            type="checkbox"
                            checked={isRowSelected}
                            onChange={(e) => handleSelectRow(emp.id, e.target.checked)}
                            className="w-4 h-4 rounded border-slate-350 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                        </TableCell>
                        <TableCell className="text-xs font-mono text-slate-500">{emp.nik}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8 ring-2 ring-white dark:ring-slate-800 shadow-sm">
                              <AvatarImage src={emp.avatar} />
                              <AvatarFallback className="text-[10px] bg-emerald-100 text-emerald-700 font-semibold">{emp.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">{emp.name}</p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">{emp.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-slate-700 dark:text-slate-300">{emp.position}</TableCell>
                        <TableCell className="text-xs text-slate-700 dark:text-slate-300">{emp.division.split(' ')[0]}</TableCell>
                        <TableCell><StatusBadge status={emp.status} /></TableCell>
                        <TableCell className="text-xs text-slate-500 hidden xl:table-cell">
                          {new Date(emp.joinDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </TableCell>
                        <TableCell className="text-xs text-slate-500 hidden lg:table-cell">{emp.phone}</TableCell>
                        <TableCell className="hidden xl:table-cell"><StatusBadge status={emp.contractStatus} /></TableCell>
                        <TableCell className="hidden xl:table-cell">
                          {emp.bpjs ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600"><Check className="w-3.5 h-3.5" /></span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-500"><X className="w-3.5 h-3.5" /></span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Link href={`/employees/${emp.id}`}>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg">
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg" onClick={() => openEditDialog(emp)}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-500 hover:text-red-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg" onClick={() => openDeleteDialog(emp)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-500">
                Menampilkan {((page - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(page * ITEMS_PER_PAGE, filteredEmployees.length)} dari {filteredEmployees.length} karyawan
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-lg"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <Button
                    key={p}
                    variant={p === page ? 'default' : 'outline'}
                    size="sm"
                    className={`h-8 w-8 p-0 text-xs rounded-lg ${p === page ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-lg"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
