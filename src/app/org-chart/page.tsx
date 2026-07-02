'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dbGetEmployees } from '@/lib/db';
import { divisions } from '@/lib/data/divisions';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Search, Network, Users, ChevronDown, ChevronRight, User, Mail, Phone, Calendar, Landmark, MapPin, Building,
} from 'lucide-react';
import { Employee } from '@/types';

// Let's establish CEO as Dian Permata
const CEO_MOCK = {
  id: 'ceo-1',
  nik: 'CEO-BGE-001',
  name: 'Dian Permata',
  avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Dian',
  gender: 'female' as const,
  email: 'dian.permata@benuagreenenergy.co.id',
  phone: '081122334455',
  address: 'Jakarta Selatan',
  birthDate: '1980-05-15',
  joinDate: '2020-01-01',
  position: 'Direktur Utama (CEO)',
  division: 'Management',
  divisionId: 'div-ceo',
  status: 'active' as const,
  contractStatus: 'permanent' as const,
  contractEnd: '—',
  bpjs: true,
  salary: 50000000,
  bankName: 'BCA',
  bankAccount: '1234567890',
  bankAccountName: 'Dian Permata',
};

export default function OrgChartPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [expandedDivisions, setExpandedDivisions] = useState<Record<string, boolean>>({
    'div-1': true,
    'div-2': true,
    'div-3': true,
    'div-4': true,
    'div-5': true,
  });

  useEffect(() => {
    // Add CEO + local db employees
    const dbEmps = dbGetEmployees();
    setEmployees(dbEmps);
  }, []);

  // Group employees by division for tree view
  const groupedData = useMemo(() => {
    const divGroups: Record<string, Employee[]> = {};
    employees.forEach(emp => {
      const divId = emp.divisionId;
      if (!divGroups[divId]) {
        divGroups[divId] = [];
      }
      divGroups[divId].push(emp);
    });
    return divGroups;
  }, [employees]);

  const toggleDivision = (divId: string) => {
    setExpandedDivisions(prev => ({
      ...prev,
      [divId]: !prev[divId],
    }));
  };

  const handleNodeClick = (node: any) => {
    setSelectedNode(node);
  };

  const formatCurrency = (val: number) => {
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Struktur Organisasi"
        description="Bagan hierarki jabatan dan divisi PT. Benua Green Energy"
      />

      {/* Control Panel */}
      <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Cari nama atau jabatan di dalam struktur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="h-10 rounded-xl flex-1 md:flex-initial text-xs gap-1.5"
              onClick={() => setExpandedDivisions({
                'div-1': true, 'div-2': true, 'div-3': true, 'div-4': true, 'div-5': true
              })}
            >
              Expand All
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-10 rounded-xl flex-1 md:flex-initial text-xs gap-1.5"
              onClick={() => setExpandedDivisions({})}
            >
              Collapse All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Org Tree Visualization Container */}
      <div className="w-full overflow-x-auto pb-6">
        <div className="min-w-[900px] flex flex-col items-center py-8 px-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
          
          {/* Level 1: CEO */}
          <div className="flex flex-col items-center relative">
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              onClick={() => handleNodeClick(CEO_MOCK)}
              className="cursor-pointer bg-gradient-to-br from-emerald-600 to-green-600 p-[1.5px] rounded-2xl shadow-xl shadow-emerald-500/10"
            >
              <div className="bg-white dark:bg-slate-900 px-5 py-4 rounded-[14px] flex items-center gap-4 min-w-[240px]">
                <Avatar className="w-12 h-12 ring-2 ring-emerald-500">
                  <AvatarImage src={CEO_MOCK.avatar} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">DP</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{CEO_MOCK.name}</h3>
                  <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">{CEO_MOCK.position}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5 font-mono">{CEO_MOCK.nik}</p>
                </div>
              </div>
            </motion.div>

            {/* vertical connector below CEO */}
            <div className="w-0.5 h-10 bg-slate-200 dark:bg-slate-800" />
            {/* horizontal connector linking all divisions */}
            <div className="h-0.5 bg-slate-200 dark:bg-slate-800 w-[80%] absolute bottom-0 left-[10%] right-[10%]" />
          </div>

          {/* Level 2: Divisions Grid */}
          <div className="grid grid-cols-5 gap-6 pt-10 w-full relative">
            {divisions.map((div) => {
              const headEmp = employees.find(e => e.name === div.head);
              const members = groupedData[div.id] || [];
              const isExpanded = expandedDivisions[div.id];

              return (
                <div key={div.id} className="flex flex-col items-center relative">
                  {/* Division Head Node */}
                  <div className="flex flex-col items-center relative z-10 w-full">
                    {/* vertical connector to horizontal bar */}
                    <div className="w-0.5 h-10 bg-slate-200 dark:bg-slate-800 absolute -top-10" />

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      onClick={() => headEmp && handleNodeClick(headEmp)}
                      className={`cursor-pointer w-full rounded-2xl border p-4 transition-all duration-300 ${
                        headEmp ? 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 shadow-sm' : 'border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50'
                      }`}
                      style={{ borderTopColor: div.color, borderTopWidth: '4px' }}
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">{div.name.split(' ')[0]}</div>
                        <Avatar className="w-10 h-10 mb-2">
                          {headEmp && <AvatarImage src={headEmp.avatar} />}
                          <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-bold">
                            {div.head.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-full">{div.head}</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-full">
                          Head of {div.name.split(' ')[0]}
                        </p>
                        
                        {members.length > 0 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleDivision(div.id); }}
                            className="mt-3 flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                          >
                            {members.length} Anggota 
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  </div>

                  {/* Level 3: Division Members */}
                  <AnimatePresence>
                    {isExpanded && members.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full flex flex-col items-center pt-6 space-y-3 overflow-hidden"
                      >
                        {/* vertical connector for sub-nodes */}
                        <div className="w-0.5 h-6 bg-slate-200 dark:bg-slate-800 -mt-6" />

                        {members
                          .filter(emp => emp.name !== div.head) // Exclude head because shown at top
                          .map((emp) => (
                            <motion.div
                              key={emp.id}
                              whileHover={{ x: 2 }}
                              onClick={() => handleNodeClick(emp)}
                              className="cursor-pointer w-full bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 p-2.5 rounded-xl shadow-sm flex items-center gap-3"
                            >
                              <Avatar className="w-7 h-7">
                                <AvatarImage src={emp.avatar} />
                                <AvatarFallback className="text-[10px] bg-slate-100 text-slate-600 font-bold">{emp.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <h5 className="text-[11px] font-bold text-slate-900 dark:text-white truncate">{emp.name}</h5>
                                <p className="text-[9px] text-slate-500 truncate mt-0.5">{emp.position}</p>
                              </div>
                            </motion.div>
                          ))
                        }
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Node Details Dialog */}
      <Dialog open={!!selectedNode} onOpenChange={(o) => !o && setSelectedNode(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/20">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-base">Detail Karyawan</DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  Informasi lengkap posisi dan kontak karyawan.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedNode && (
            <div className="space-y-4 py-3">
              {/* Profile Card Header */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900 dark:to-slate-800/50 border border-slate-200/40 dark:border-slate-800/40">
                <Avatar className="w-16 h-16 ring-4 ring-white dark:ring-slate-900 shadow-md">
                  <AvatarImage src={selectedNode.avatar} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-lg font-bold">
                    {selectedNode.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedNode.name}</h3>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">{selectedNode.position}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">{selectedNode.nik}</p>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-900/50 space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Building className="w-3 h-3" /> Divisi
                  </span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedNode.division}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-900/50 space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Join Date
                  </span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {new Date(selectedNode.joinDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-900/50 space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Email
                  </span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{selectedNode.email}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-900/50 space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Telepon
                  </span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedNode.phone}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-900/50 space-y-1 col-span-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Landmark className="w-3 h-3" /> Rekening Gaji
                  </span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedNode.bankName ? `${selectedNode.bankName} — ${selectedNode.bankAccount} (a.n. ${selectedNode.bankAccountName || selectedNode.name})` : '—'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-900/50 space-y-1 col-span-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Alamat
                  </span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedNode.address || '—'}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button className="w-full text-xs h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setSelectedNode(null)}>
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
