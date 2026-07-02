'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dbGetDocuments, dbSaveDocument, dbGetEmployees } from '@/lib/db';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Search, Upload, Eye, Download, FileText, CheckCircle2,
  AlertCircle, Clock, XCircle, Filter, FolderOpen, AlertTriangle, Bell,
} from 'lucide-react';
import { DocumentCategory } from '@/types';
import { toast } from 'sonner';

const categories: DocumentCategory[] = ['KTP', 'KK', 'NPWP', 'Ijazah', 'Sertifikat', 'BPJS', 'Jamsostek', 'Kontrak Kerja'];

const categoryIcons: Record<string, React.ElementType> = {
  KTP: FileText, KK: FileText, NPWP: FileText, Ijazah: FileText,
  Sertifikat: FileText, BPJS: FileText, Jamsostek: FileText, 'Kontrak Kerja': FileText,
};

export default function DocumentsPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [docList, setDocList] = useState<any[]>([]);

  useEffect(() => {
    setDocList(dbGetDocuments());
  }, []);

  const stats = useMemo(() => {
    return {
      total: docList.length,
      verified: docList.filter(d => d.status === 'verified').length,
      uploaded: docList.filter(d => d.status === 'uploaded').length,
      pendingReview: docList.filter(d => d.status === 'pending_review').length,
      notUploaded: docList.filter(d => d.status === 'not_uploaded').length,
    };
  }, [docList]);

  const completeness = useMemo(() => {
    const activeEmployees = dbGetEmployees().filter(e => e.status === 'active' || e.status === 'probation');
    return activeEmployees.map(emp => {
      const docs = docList.filter(d => d.employeeId === emp.id);
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
  }, [docList]);

  const handleUploadDoc = (id: string) => {
    const list = dbGetDocuments();
    const doc = list.find(r => r.id === id);
    if (!doc) return;

    doc.status = 'uploaded';
    doc.fileName = `${doc.employeeName.split(' ')[0]}_${doc.category.replace(/\s/g, '_')}.pdf`;
    doc.fileSize = '250KB';
    doc.uploadDate = new Date().toISOString().split('T')[0];

    dbSaveDocument(doc);
    setDocList(dbGetDocuments());
    alert(`Dokumen ${doc.category} untuk ${doc.employeeName} berhasil diunggah!`);
  };

  const statCards = [
    { label: 'Total Dokumen', value: stats.total, icon: FolderOpen, color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400' },
    { label: 'Terverifikasi', value: stats.verified, icon: CheckCircle2, color: 'bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400' },
    { label: 'Uploaded', value: stats.uploaded, icon: Upload, color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400' },
    { label: 'Pending Review', value: stats.pendingReview, icon: Clock, color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400' },
    { label: 'Belum Upload', value: stats.notUploaded, icon: XCircle, color: 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400' },
  ];

  const filteredDocs = useMemo(() => {
    return docList.filter(doc => {
      const matchSearch = search === '' ||
        doc.employeeName.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === 'all' || doc.category === categoryFilter;
      const matchStatus = statusFilter === 'all' || doc.status === statusFilter;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [search, categoryFilter, statusFilter, docList]);

  // Group by employee for display
  const displayDocs = filteredDocs.slice(0, 50);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dokumen Karyawan"
        description="Kelola dokumen dan berkas karyawan"
      >
        <Button size="sm" className="gap-2 text-xs bg-green-600 hover:bg-green-700 text-white">
          <Upload className="w-4 h-4" /> Upload Dokumen
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="border-gray-200 dark:border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-2 rounded-xl ${stat.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Document Expiry Alert */}
      <Card className="border-amber-200/60 dark:border-amber-800/30 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-600" />
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-600" />
            Peringatan Dokumen Kedaluwarsa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(() => {
              // Simulate document expiry alerts
              const now = new Date();
              const expiryAlerts = [
                { employee: 'Ahmad Fadli', doc: 'Kontrak Kerja', expiryDate: new Date(now.getTime() + 7 * 86400000), urgency: 'critical' },
                { employee: 'Sari Dewi', doc: 'KTP', expiryDate: new Date(now.getTime() + 15 * 86400000), urgency: 'warning' },
                { employee: 'Budi Santoso', doc: 'BPJS', expiryDate: new Date(now.getTime() + 30 * 86400000), urgency: 'info' },
                { employee: 'Rina Maharani', doc: 'Kontrak Kerja', expiryDate: new Date(now.getTime() + 45 * 86400000), urgency: 'info' },
                { employee: 'Dian Purnama', doc: 'KTP', expiryDate: new Date(now.getTime() + 60 * 86400000), urgency: 'info' },
              ];

              const urgencyStyles = {
                critical: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/30',
                warning: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/30',
                info: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/30',
              };
              const urgencyIcons = {
                critical: 'text-red-600 dark:text-red-400',
                warning: 'text-amber-600 dark:text-amber-400',
                info: 'text-blue-600 dark:text-blue-400',
              };

              return expiryAlerts.map((alert, i) => {
                const daysLeft = Math.ceil((alert.expiryDate.getTime() - now.getTime()) / 86400000);
                return (
                  <motion.div
                    key={`${alert.employee}-${alert.doc}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${urgencyStyles[alert.urgency as keyof typeof urgencyStyles]}`}
                  >
                    <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${urgencyIcons[alert.urgency as keyof typeof urgencyIcons]}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {alert.employee} — <span className="text-slate-600 dark:text-slate-400">{alert.doc}</span>
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Kedaluwarsa: {alert.expiryDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      daysLeft <= 7 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      daysLeft <= 30 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {daysLeft} hari lagi
                    </span>
                  </motion.div>
                );
              });
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Document Completeness */}
      <Card className="border-gray-200 dark:border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">Kelengkapan Dokumen per Karyawan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {completeness.slice(0, 9).map((item) => (
              <div key={item.employeeId} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.employeeName}</p>
                  <p className="text-[10px] text-gray-500 truncate">{item.division}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Progress value={item.percentage} className="w-16 h-1.5" />
                  <span className={`text-xs font-semibold ${item.percentage === 100 ? 'text-green-600' : item.percentage >= 75 ? 'text-amber-600' : 'text-red-600'}`}>
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="border-gray-200 dark:border-gray-800">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Cari nama karyawan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-9 text-sm bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
              />
            </div>
            <Select value={categoryFilter} onValueChange={(v) => v && setCategoryFilter(v)}>
              <SelectTrigger className="w-full sm:w-44 h-9 text-xs">
                <Filter className="w-3 h-3 mr-1.5" />
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
              <SelectTrigger className="w-full sm:w-36 h-9 text-xs">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="verified">Terverifikasi</SelectItem>
                <SelectItem value="uploaded">Uploaded</SelectItem>
                <SelectItem value="pending_review">Pending Review</SelectItem>
                <SelectItem value="not_uploaded">Belum Upload</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Document Table */}
      <Card className="border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 dark:bg-gray-900/50">
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Karyawan</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Kategori</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 hidden lg:table-cell">File</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 hidden lg:table-cell">Ukuran</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 hidden xl:table-cell">Tanggal Upload</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Status</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayDocs.map((doc) => (
                <TableRow key={doc.id} className="table-row-hover">
                  <TableCell className="text-sm font-medium text-gray-900 dark:text-white">{doc.employeeName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs font-medium">{doc.category}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500 hidden lg:table-cell">{doc.fileName || '—'}</TableCell>
                  <TableCell className="text-xs text-gray-500 hidden lg:table-cell">{doc.fileSize || '—'}</TableCell>
                  <TableCell className="text-xs text-gray-500 hidden xl:table-cell">
                    {doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </TableCell>
                  <TableCell><StatusBadge status={doc.status} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {doc.status !== 'not_uploaded' ? (
                        <>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-500 hover:text-blue-600">
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-500 hover:text-green-600">
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      ) : (
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 cursor-pointer" onClick={() => handleUploadDoc(doc.id)}>
                          <Upload className="w-3.5 h-3.5 mr-1" /> Upload
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
