
import React, { useState } from 'react';
import { SectionHeader, InputField, Modal, Badge } from '@/components/admin/shared/AdminShared';
import { Plus, Users, FileText, Settings, Trash2, Calendar, Mail, Phone, MapPin, Wallet, Download, CheckCircle2, Building2, Filter } from 'lucide-react';
import { useHr } from './hooks/useHr';
import { Employee, Payslip, SiteContent } from '@/types';
import { Skeleton, TableRowSkeleton } from '@/components/admin/shared/Skeleton';
import { DataTable } from '@/components/admin/shared/DataTable';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { PayslipPDF } from './components/PayslipPDF';
import { FaceTrainingModal } from './components/FaceTrainingModal';
import { Eye, Printer, Clock, Palmtree, UserCheck, ShieldCheck, AlertCircle, Camera, Link2, ScanFace } from 'lucide-react';
import * as faceapi from 'face-api.js';

interface HRModuleProps {
    companyId: string;
    allCompanies?: SiteContent[];
}

export const HRModule: React.FC<HRModuleProps> = ({ companyId, allCompanies = [] }) => {
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined);

    const { employees, payslips, attendances, leaveRequests, isLoading, createEmployee, updateEmployee, deleteEmployee, createPayslip, createAttendance, createLeaveRequest, updateLeaveRequest } = useHr(companyId, { year: selectedYear, month: selectedMonth });
    const [activeTab, setActiveTab] = useState<'employees' | 'payroll' | 'attendance' | 'leaves'>('employees');
    const [editingEmployee, setEditingEmployee] = useState<Partial<Employee> | null>(null);
    const [generatingPayslip, setGeneratingPayslip] = useState<Partial<Payslip> | null>(null);
    const [trainingEmployee, setTrainingEmployee] = useState<Employee | null>(null);
    const [showPayslipPreview, setShowPayslipPreview] = useState<Payslip | null>(null);
    const [showingAttendanceModal, setShowingAttendanceModal] = useState(false);
    const [newAttendance, setNewAttendance] = useState({ employeeId: '', date: new Date().toISOString().split('T')[0], status: 'Présent', checkIn: '08:00', checkOut: '17:00' });
    const [showingLeaveModal, setShowingLeaveModal] = useState(false);
    const [newLeave, setNewLeave] = useState({ employeeId: '', type: 'Congé Annuel', startDate: new Date().toISOString().split('T')[0], endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], reason: '', status: 'Pending' });

    if (isLoading) return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div className="space-y-2">
                    <Skeleton width={300} height={32} />
                    <Skeleton width={200} height={16} />
                </div>
                <Skeleton width={150} height={40} />
            </div>

            <div className="bg-white rounded-sm border border-slate-200 shadow-sm p-4 space-y-4">
                <TableRowSkeleton columns={6} />
                <TableRowSkeleton columns={6} />
                <TableRowSkeleton columns={6} />
                <TableRowSkeleton columns={6} />
            </div>
        </div>
    );

    const handleSaveEmployee = () => {
        if (!editingEmployee) return;
        if (editingEmployee.id?.startsWith('new-')) {
            createEmployee(editingEmployee);
        } else {
            updateEmployee(editingEmployee as Employee);
        }
        setEditingEmployee(null);
    };

    const handleGeneratePayslip = () => {
        if (!generatingPayslip) return;

        // Calcul automatique du brut et du net simplifié pour la démo
        const base = generatingPayslip.baseSalary || 0;
        const primes = (generatingPayslip.transportPrime || 0) + (generatingPayslip.housingPrime || 0) + (generatingPayslip.otherBonuses || 0);
        const gross = base + primes;
        const deductions = (generatingPayslip.cnpsDeduction || 0) + (generatingPayslip.taxDeduction || 0) + (generatingPayslip.otherDeductions || 0);
        const net = gross - deductions;

        createPayslip({
            ...generatingPayslip,
            grossSalary: gross,
            netSalary: net,
            date: new Date().toISOString()
        });
        setGeneratingPayslip(null);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-1">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Ressources Humaines</h1>
                    <p className="text-slate-500 font-medium">Gérez votre capital humain et la conformité sociale.</p>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="flex bg-slate-100 p-1 rounded-sm w-fit self-start md:self-auto shadow-inner">
                        <button
                            onClick={() => setActiveTab('employees')}
                            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-sm transition-all ${activeTab === 'employees' ? 'bg-white text-sky-600 shadow-md transform scale-105' : 'text-slate-500 hover:bg-slate-200'}`}
                        >
                            <Users size={18} /> Effectif ({employees.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('payroll')}
                            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-sm transition-all ${activeTab === 'payroll' ? 'bg-white text-sky-600 shadow-md transform scale-105' : 'text-slate-500 hover:bg-slate-200'}`}
                        >
                            <FileText size={18} /> Paie & Bulletins
                        </button>
                        <button
                            onClick={() => setActiveTab('attendance')}
                            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-sm transition-all ${activeTab === 'attendance' ? 'bg-white text-sky-600 shadow-md transform scale-105' : 'text-slate-500 hover:bg-slate-200'}`}
                        >
                            <Clock size={18} /> Pointage
                        </button>
                        <button
                            onClick={() => setActiveTab('leaves')}
                            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-sm transition-all ${activeTab === 'leaves' ? 'bg-white text-sky-600 shadow-md transform scale-105' : 'text-slate-500 hover:bg-slate-200'}`}
                        >
                            <Palmtree size={18} /> Congés
                        </button>
                    </div>

                    <div className="flex items-center gap-2 bg-white p-1.5 border border-slate-200 rounded-sm shadow-sm">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-sm border border-slate-100">
                            <Filter size={14} className="text-slate-400" />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filtres</span>
                        </div>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="px-3 py-1.5 text-sm font-bold text-slate-700 bg-transparent outline-none cursor-pointer hover:bg-slate-50 rounded-sm"
                        >
                            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        <div className="w-px h-4 bg-slate-200"></div>
                        <select
                            value={selectedMonth || ''}
                            onChange={(e) => setSelectedMonth(e.target.value ? Number(e.target.value) : undefined)}
                            className="px-3 py-1.5 text-sm font-bold text-slate-700 bg-transparent outline-none cursor-pointer hover:bg-slate-50 rounded-sm"
                        >
                            <option value="">Toute l'année</option>
                            {['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'].map((m, i) => (
                                <option key={i} value={i + 1}>{m}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Content: Employees */}
            {activeTab === 'employees' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
                        <div className="flex gap-8">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Salariés</p>
                                <p className="text-2xl font-black text-slate-800">{employees.length}</p>
                            </div>
                            <div className="w-px h-10 bg-slate-100"></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Actifs</p>
                                <p className="text-2xl font-black text-green-600">{employees.filter(e => e.status === 'Actif').length}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setEditingEmployee({
                                id: 'new-' + Date.now(),
                                matricule: 'MAT-' + (employees.length + 1).toString().padStart(3, '0'),
                                fullName: '',
                                position: '',
                                department: '',
                                email: '',
                                status: 'Actif',
                                contractType: 'CDI',
                                role: 'EMPLOYEE',
                                password: '',
                                baseSalary: 0,
                                joinDate: new Date().toISOString().split('T')[0],
                                companyId: companyId // Par défaut sur l'entreprise actuelle
                            })}
                            className="bg-slate-900 text-white px-6 py-3 rounded-sm flex items-center gap-2 text-sm font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-95"
                        >
                            <Plus size={18} /> Ajouter un Collaborateur
                        </button>
                        <button
                            onClick={() => window.open(`/kiosk/${companyId}`, '_blank')}
                            className="bg-sky-600 text-white px-6 py-3 rounded-sm flex items-center gap-2 text-sm font-bold hover:bg-sky-700 transition-all shadow-lg hover:shadow-sky-600/20 active:scale-95"
                        >
                            <Camera size={18} /> Mode Kiosque (IA)
                        </button>
                        <button
                            onClick={() => {
                                const url = `${window.location.origin}/kiosk/${companyId}`;
                                navigator.clipboard.writeText(url);
                                alert("Lien du kiosque copié dans le presse-papier !");
                            }}
                            className="bg-white text-slate-900 border border-slate-200 px-4 py-3 rounded-sm flex items-center gap-2 text-sm font-bold hover:bg-slate-50 transition-all active:scale-95"
                            title="Copier le lien du kiosque"
                        >
                            <Link2 size={18} />
                        </button>
                    </div>

                    <DataTable<Employee>
                        data={employees}
                        searchPlaceholder="Rechercher par nom, matricule ou poste..."
                        searchKeys={['fullName', 'matricule', 'position']}
                        columns={[
                            {
                                header: 'Matricule & Identité',
                                accessor: (emp) => (
                                    <div className="flex items-center gap-4 py-1">
                                        <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-black text-xs shrink-0">
                                            {emp.fullName.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800 flex items-center gap-2">
                                                {emp.fullName}
                                                {emp.role && emp.role !== 'EMPLOYEE' && (
                                                    <span className="text-[9px] px-1.5 py-0.5 bg-slate-900 text-white rounded-sm font-black uppercase tracking-tighter">
                                                        {emp.role}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-400 font-mono tracking-tighter uppercase">{emp.matricule}</div>
                                        </div>
                                    </div>
                                ),
                                sortable: true
                            },
                            {
                                header: 'Poste & Département',
                                accessor: (emp) => (
                                    <div className="py-1">
                                        <div className="font-semibold text-slate-700">{emp.position}</div>
                                        <div className="text-xs text-slate-400">{emp.department}</div>
                                    </div>
                                ),
                                sortable: true
                            },
                            {
                                header: 'Contrat & Début',
                                accessor: (emp) => (
                                    <div className="py-1">
                                        <div className="flex items-center gap-1.5 font-bold text-xs text-slate-600">
                                            <Badge color="blue">{emp.contractType}</Badge>
                                        </div>
                                        <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5">
                                            <Calendar size={10} /> {new Date(emp.joinDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                ),
                                sortable: true
                            },
                            {
                                header: 'Rémunération Brute',
                                accessor: (emp) => (
                                    <div className="py-1">
                                        <div className="font-black text-slate-800">{(emp.baseSalary || 0).toLocaleString()} <span className="text-[10px] font-bold text-slate-400 uppercase">CFA</span></div>
                                        <div className="text-[10px] text-slate-400">Mensuel de base</div>
                                    </div>
                                ),
                                sortable: true
                            },
                            {
                                header: 'Statut',
                                accessor: (emp) => (
                                    <Badge color={emp.status === 'Actif' ? 'green' : emp.status === 'Congé' ? 'blue' : 'slate'}>{emp.status}</Badge>
                                ),
                                sortable: true
                            }
                        ]}
                        actions={(emp) => (
                            <div className="flex items-center justify-end gap-1 opacity-10 md:opacity-0 group-hover:opacity-100 transition-all">
                                <button
                                    onClick={() => setGeneratingPayslip({ employeeId: emp.id, employeeName: emp.fullName, baseSalary: emp.baseSalary || 0, period: new Date().toISOString().substring(0, 7), status: 'Brouillon', transportPrime: 0, housingPrime: 0, otherBonuses: 0, cnpsDeduction: 0, taxDeduction: 0, otherDeductions: 0 })}
                                    className="p-2.5 text-sky-600 hover:bg-sky-50 rounded-sm transition-all"
                                    title="Générer bulletin"
                                >
                                    <Wallet size={18} />
                                </button>
                                <button
                                    onClick={() => setTrainingEmployee(emp)}
                                    className="p-2.5 text-purple-600 hover:bg-purple-50 rounded-sm transition-all"
                                    title="Enregistrer empreinte faciale"
                                >
                                    <UserCheck size={18} />
                                </button>
                                <button onClick={() => setEditingEmployee(emp)} className="p-2.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-sm transition-all"><Settings size={18} /></button>
                                <button onClick={() => { if (confirm('Confirmer la suppression ?')) deleteEmployee(emp.id) }} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all"><Trash2 size={18} /></button>
                            </div>
                        )}
                        onRowClick={(emp) => setEditingEmployee(emp)}
                    />
                </div>
            )}

            {/* Content: Payroll */}
            {activeTab === 'payroll' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm flex items-center gap-5">
                            <div className="p-4 bg-sky-50 text-sky-600 rounded-sm"><Wallet size={24} /></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Masse Salariale Net</p>
                                <p className="text-xl font-black text-slate-800">{(payslips.filter(p => p.status === 'Payé').reduce((acc, p) => acc + p.netSalary, 0)).toLocaleString()} CFA</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm flex items-center gap-5">
                            <div className="p-4 bg-purple-50 text-purple-600 rounded-sm"><FileText size={24} /></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bulletins Période</p>
                                <p className="text-xl font-black text-slate-800">{payslips.length} Édités</p>
                            </div>
                        </div>
                    </div>

                    <DataTable<Payslip>
                        data={payslips}
                        searchPlaceholder="Rechercher par collaborateur..."
                        searchKeys={['employeeName']}
                        columns={[
                            {
                                header: 'Collaborateur',
                                accessor: (ps) => (
                                    <div className="py-1">
                                        <div className="font-bold text-slate-800">{ps.employeeName}</div>
                                        <div className="text-[10px] text-slate-400 uppercase font-mono">ID: {ps.employeeId}</div>
                                    </div>
                                ),
                                sortable: true
                            },
                            {
                                header: 'Période',
                                accessor: (ps) => (
                                    <div className="font-bold text-slate-600 uppercase tracking-tight py-1">
                                        {new Date(ps.period + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                                    </div>
                                ),
                                sortable: true
                            },
                            {
                                header: 'Salaire Net',
                                accessor: (ps) => (
                                    <div className="font-black text-sky-700 py-1">{ps.netSalary.toLocaleString()} CFA</div>
                                ),
                                sortable: true
                            },
                            {
                                header: 'Statut',
                                accessor: (ps) => (
                                    <Badge color={ps.status === 'Payé' ? 'green' : ps.status === 'Validé' ? 'blue' : 'slate'}>{ps.status}</Badge>
                                ),
                                sortable: true
                            }
                        ]}
                        actions={(ps) => (
                            <div className="flex justify-end gap-1 opacity-10 md:opacity-0 group-hover:opacity-100 transition-all">
                                <button
                                    onClick={() => setShowPayslipPreview(ps)}
                                    className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-sm transition-all"
                                    title="Aperçu & PDF"
                                >
                                    <Eye size={18} />
                                </button>
                                {ps.status === 'Payé' && (
                                    <PDFDownloadLink
                                        document={<PayslipPDF payslip={ps} employee={employees.find(e => e.id === ps.employeeId) || {} as Employee} />}
                                        fileName={`Bulletin_${ps.employeeName}_${ps.period}.pdf`}
                                        className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-sm transition-all"
                                        title="Télécharger"
                                    >
                                        <Download size={18} />
                                    </PDFDownloadLink>
                                )}
                            </div>
                        )}
                        onRowClick={(ps) => setShowPayslipPreview(ps)}
                    />
                </div>
            )}

            {/* Content: Attendance */}
            {activeTab === 'attendance' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
                        <div className="flex gap-8">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Présents aujourd'hui</p>
                                <p className="text-2xl font-black text-green-600">{attendances.filter((a: any) => a.date && a.date.startsWith(new Date().toISOString().split('T')[0]) && a.status === 'Présent').length}</p>
                            </div>
                            <div className="w-px h-10 bg-slate-100"></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Absences</p>
                                <p className="text-2xl font-black text-red-500">{attendances.filter((a: any) => a.date && a.date.startsWith(new Date().toISOString().split('T')[0]) && (a.status === 'Absent' || a.status === 'Injustifié')).length}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowingAttendanceModal(true)}
                            className="bg-slate-900 text-white px-6 py-3 rounded-sm flex items-center gap-2 text-sm font-bold hover:bg-black transition-all"
                        >
                            <UserCheck size={18} /> Pointer une présence
                        </button>
                    </div>

                    <DataTable<any>
                        data={attendances}
                        searchPlaceholder="Rechercher par employé..."
                        searchKeys={['employeeName']}
                        columns={[
                            {
                                header: 'Date',
                                accessor: (a) => <span className="font-mono text-xs font-bold">{new Date(a.date).toLocaleDateString()}</span>,
                                sortable: true
                            },
                            {
                                header: 'Employé',
                                accessor: (a) => <span className="font-bold text-slate-800">{a.employeeName}</span>,
                                sortable: true
                            },
                            {
                                header: 'Heures',
                                accessor: (a) => (
                                    <div className="text-xs font-medium space-x-2">
                                        <span className="text-green-600">Entrée: {a.checkIn ? new Date(a.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                                        <span className="text-red-500">Sortie: {a.checkOut ? new Date(a.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                                    </div>
                                )
                            },
                            {
                                header: 'Statut',
                                accessor: (a) => <Badge color={a.status === 'Présent' ? 'green' : a.status === 'Retard' ? 'orange' : 'red'}>{a.status}</Badge>,
                                sortable: true
                            }
                        ]}
                    />
                </div>
            )}

            {/* Content: Leaves */}
            {activeTab === 'leaves' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
                        <div className="flex gap-8">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">En Congés</p>
                                <p className="text-2xl font-black text-sky-600">{leaveRequests.filter((r: any) => r.status === 'Approved' && new Date(r.startDate) <= new Date() && new Date(r.endDate) >= new Date()).length}</p>
                            </div>
                            <div className="w-px h-10 bg-slate-100"></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Demandes en attente</p>
                                <p className="text-2xl font-black text-orange-500">{leaveRequests.filter((r: any) => r.status === 'Pending').length}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowingLeaveModal(true)}
                            className="bg-slate-900 text-white px-6 py-3 rounded-sm flex items-center gap-2 text-sm font-bold hover:bg-black transition-all"
                        >
                            <Calendar size={18} /> Nouvelle Demande
                        </button>
                    </div>

                    <DataTable<any>
                        data={leaveRequests}
                        searchPlaceholder="Rechercher une demande..."
                        searchKeys={['employeeName', 'type']}
                        columns={[
                            {
                                header: 'Collaborateur',
                                accessor: (r) => <span className="font-bold text-slate-800">{r.employeeName}</span>,
                                sortable: true
                            },
                            {
                                header: 'Type & Période',
                                accessor: (r) => (
                                    <div className="py-1">
                                        <div className="text-xs font-bold text-slate-700">{r.type}</div>
                                        <div className="text-[10px] text-slate-400">Du {new Date(r.startDate).toLocaleDateString()} au {new Date(r.endDate).toLocaleDateString()}</div>
                                    </div>
                                ),
                                sortable: true
                            },
                            {
                                header: 'Motif',
                                accessor: (r) => <div className="max-w-xs truncate text-[10px] text-slate-500 italic">{r.reason}</div>
                            },
                            {
                                header: 'Statut',
                                accessor: (r) => <Badge color={r.status === 'Approved' ? 'green' : r.status === 'Rejected' ? 'red' : 'orange'}>{r.status === 'Pending' ? 'En attente' : r.status === 'Approved' ? 'Accepté' : 'Refusé'}</Badge>,
                                sortable: true
                            }
                        ]}
                        actions={(r) => (
                            <div className="flex justify-end gap-1 opacity-10 md:opacity-0 group-hover:opacity-100 transition-all">
                                {r.status === 'Pending' && (
                                    <>
                                        <button onClick={() => updateLeaveRequest({ id: r.id, data: { status: 'Approved' } })} className="p-2 text-green-600 hover:bg-green-50 rounded-sm" title="Approuver"><ShieldCheck size={18} /></button>
                                        <button onClick={() => updateLeaveRequest({ id: r.id, data: { status: 'Rejected' } })} className="p-2 text-red-600 hover:bg-red-50 rounded-sm" title="Refuser"><AlertCircle size={18} /></button>
                                    </>
                                )}
                            </div>
                        )}
                    />
                </div>
            )}

            {/* Modal: Employee Form */}
            <Modal
                isOpen={!!editingEmployee}
                onClose={() => setEditingEmployee(null)}
                title={editingEmployee?.id?.toString().startsWith('new') ? "Nouveau Collaborateur" : "Modifier Collaborateur"}
                size="xl"
                footer={
                    <div className="flex gap-3 justify-end w-full">
                        <button onClick={() => setEditingEmployee(null)} className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-100 rounded-sm transition-all">Annuler</button>
                        <button onClick={handleSaveEmployee} className="px-8 py-2.5 bg-slate-900 text-white font-black rounded-sm hover:bg-black shadow-lg flex items-center gap-2 transition-all">
                            <CheckCircle2 size={18} /> Confirmer
                        </button>
                    </div>
                }
            >
                {editingEmployee && (
                    <div className="space-y-8 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sky-600 mb-2 font-bold text-xs uppercase tracking-widest"><Users size={14} /> État Civil</div>
                                <InputField label="Nom Complet" value={editingEmployee.fullName || ''} onChange={v => setEditingEmployee({ ...editingEmployee, fullName: v })} icon={<Users size={16} />} />
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="Matricule" value={editingEmployee.matricule || ''} onChange={v => setEditingEmployee({ ...editingEmployee, matricule: v })} />
                                    <InputField label="Date d'entrée" type="date" value={editingEmployee.joinDate || ''} onChange={v => setEditingEmployee({ ...editingEmployee, joinDate: v })} />
                                </div>
                                <InputField label="Email Professionnel" value={editingEmployee.email || ''} onChange={v => setEditingEmployee({ ...editingEmployee, email: v })} icon={<Mail size={16} />} />
                                <InputField label="Téléphone" value={editingEmployee.phone || ''} onChange={v => setEditingEmployee({ ...editingEmployee, phone: v })} icon={<Phone size={16} />} />
                                <InputField label="Adresse" value={editingEmployee.address || ''} onChange={v => setEditingEmployee({ ...editingEmployee, address: v })} icon={<MapPin size={16} />} />
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sky-600 mb-2 font-bold text-xs uppercase tracking-widest"><Settings size={14} /> Poste & Contrat</div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Affectation Entité</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-600 transition-colors">
                                            <Building2 size={16} />
                                        </div>
                                        <select
                                            className="w-full pl-11 pr-4 py-2.5 rounded-sm border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all shadow-inner"
                                            value={editingEmployee.companyId || companyId}
                                            onChange={e => setEditingEmployee({ ...editingEmployee, companyId: e.target.value })}
                                        >
                                            {allCompanies.map(c => (
                                                <option key={c.id} value={c.id}>{c.entityName} ({c.country})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <InputField label="Intitulé du Poste" value={editingEmployee.position || ''} onChange={v => setEditingEmployee({ ...editingEmployee, position: v })} />
                                <InputField label="Département" value={editingEmployee.department || ''} onChange={v => setEditingEmployee({ ...editingEmployee, department: v })} />

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type de Contrat</label>
                                        <select className="w-full px-4 py-2.5 rounded-sm border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all shadow-inner" value={editingEmployee.contractType} onChange={e => setEditingEmployee({ ...editingEmployee, contractType: e.target.value })}>
                                            <option value="CDI">CDI</option>
                                            <option value="CDD">CDD</option>
                                            <option value="Freelance">Expertise / Freelance</option>
                                            <option value="Stage">Stage</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Statut</label>
                                        <select className="w-full px-4 py-2.5 rounded-sm border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all shadow-inner" value={editingEmployee.status} onChange={e => setEditingEmployee({ ...editingEmployee, status: e.target.value as any })}>
                                            <option value="Actif">Actif</option>
                                            <option value="Congé">En Congé</option>
                                            <option value="Arrêt">Arrêt Maladie</option>
                                            <option value="Sorti">Sorti du Groupe</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-4 mt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-2 text-sky-600 mb-4 font-bold text-xs uppercase tracking-widest"><Wallet size={14} /> Rémunération</div>
                                    <InputField
                                        label="Salaire de Base Mensuel (CFA)"
                                        type="number"
                                        value={editingEmployee.baseSalary?.toString()}
                                        onChange={v => setEditingEmployee({ ...editingEmployee, baseSalary: parseFloat(v) || 0 })}
                                        icon={<Wallet size={16} />}
                                    />
                                </div>

                                <div className="pt-4 mt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-2 text-sky-600 mb-4 font-bold text-xs uppercase tracking-widest"><Settings size={14} /> Accès Système</div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rôle d'accès</label>
                                            <select
                                                className="w-full px-4 py-2.5 rounded-sm border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all shadow-inner"
                                                value={editingEmployee.role}
                                                onChange={e => setEditingEmployee({ ...editingEmployee, role: e.target.value })}
                                            >
                                                <option value="EMPLOYEE">Employé Standard</option>
                                                <option value="MANAGER">Manager / Chef de service</option>
                                                <option value="ADMIN">Administrateur Local</option>
                                                <option value="VIEWER">Consultation Seule</option>
                                            </select>
                                        </div>
                                        <InputField
                                            label="Mot de passe Connexion"
                                            type="password"
                                            value={editingEmployee.password || ''}
                                            onChange={v => setEditingEmployee({ ...editingEmployee, password: v })}
                                            placeholder="••••••••"
                                            helper="Utilisé pour se connecter au portail"
                                        />
                                    </div>
                                    <p className="text-[9px] text-slate-400 font-bold mt-2 ml-1 italic">
                                        Note: Le rôle définit les permissions de l'employé sur cette entreprise.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal: Generate Payslip */}
            <Modal
                isOpen={!!generatingPayslip}
                onClose={() => setGeneratingPayslip(null)}
                title={`Bulletin de Paie: ${generatingPayslip?.employeeName}`}
                size="lg"
                footer={
                    <div className="flex gap-3 justify-end w-full">
                        <button onClick={() => setGeneratingPayslip(null)} className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-100 rounded-sm">Annuler</button>
                        <button onClick={handleGeneratePayslip} className="px-8 py-2.5 bg-sky-600 text-white font-black rounded-sm hover:bg-sky-700 shadow-lg shadow-sky-600/30">Générer le Bulletin</button>
                    </div>
                }
            >
                {generatingPayslip && (
                    <div className="space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="Période (YYYY-MM)" value={generatingPayslip.period || ''} onChange={v => setGeneratingPayslip({ ...generatingPayslip, period: v })} />
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Statut Initial</label>
                                <select className="w-full px-4 py-2.5 rounded-sm border border-slate-200 bg-slate-50 text-sm font-bold outline-none" value={generatingPayslip.status} onChange={e => setGeneratingPayslip({ ...generatingPayslip, status: e.target.value as any })}>
                                    <option value="Brouillon">Brouillon</option>
                                    <option value="Validé">Validé</option>
                                    <option value="Payé">Payé</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 pt-4">
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-green-600 uppercase tracking-widest border-b border-green-100 pb-1">Gains (+) </p>
                                <InputField label="Salaire de Base" type="number" value={generatingPayslip.baseSalary?.toString()} onChange={v => setGeneratingPayslip({ ...generatingPayslip, baseSalary: parseFloat(v) })} />
                                <InputField label="Indemnité Transport" type="number" value={generatingPayslip.transportPrime?.toString()} onChange={v => setGeneratingPayslip({ ...generatingPayslip, transportPrime: parseFloat(v) || 0 })} />
                                <InputField label="Indemnité Logement" type="number" value={generatingPayslip.housingPrime?.toString()} onChange={v => setGeneratingPayslip({ ...generatingPayslip, housingPrime: parseFloat(v) || 0 })} />
                                <InputField label="Autres Bonus" type="number" value={generatingPayslip.otherBonuses?.toString()} onChange={v => setGeneratingPayslip({ ...generatingPayslip, otherBonuses: parseFloat(v) || 0 })} />
                            </div>
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest border-b border-red-100 pb-1">Retenues (-) </p>
                                <InputField label="Part Ouvrière CNPS" type="number" value={generatingPayslip.cnpsDeduction?.toString()} onChange={v => setGeneratingPayslip({ ...generatingPayslip, cnpsDeduction: parseFloat(v) || 0 })} />
                                <InputField label="Impôt (IOTS)" type="number" value={generatingPayslip.taxDeduction?.toString()} onChange={v => setGeneratingPayslip({ ...generatingPayslip, taxDeduction: parseFloat(v) || 0 })} />
                                <InputField label="Autres Retenues" type="number" value={generatingPayslip.otherDeductions?.toString()} onChange={v => setGeneratingPayslip({ ...generatingPayslip, otherDeductions: parseFloat(v) || 0 })} />
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal: Payslip Preview */}
            <Modal
                isOpen={!!showPayslipPreview}
                onClose={() => setShowPayslipPreview(null)}
                title={`Aperçu Bulletin: ${showPayslipPreview?.employeeName}`}
                size="xl"
            >
                {showPayslipPreview && (
                    <div className="p-4 space-y-8">
                        <div id="payslip-to-print" className="bg-white border border-slate-200 shadow-2xl p-12 max-w-4xl mx-auto min-h-[800px] text-slate-800 font-sans">
                            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-10">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter">ENEA TELECOM</h2>
                                    <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest mt-1">Infrastructures & Réseaux</p>
                                    <div className="mt-6 text-xs text-slate-500 font-medium space-y-1">
                                        <p>Cocody Riviera 3, Abidjan</p>
                                        <p>CI-ABJ-2013-B-345</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="bg-slate-900 text-white px-4 py-2 inline-block font-black text-sm uppercase tracking-widest mb-4">Bulletin de Paie</div>
                                    <p className="text-2xl font-black text-slate-900 mb-1">{new Date(showPayslipPreview.period + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }).toUpperCase()}</p>
                                    <p className="text-xs text-slate-400 font-bold italic">Date d'édition: {new Date(showPayslipPreview.date).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-12 mb-12">
                                <div className="bg-slate-50 p-6 rounded-sm border border-slate-100">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Salarié</h4>
                                    <p className="font-bold text-slate-800 text-lg">{showPayslipPreview.employeeName}</p>
                                    <div className="text-xs text-slate-500 mt-2 space-y-1">
                                        <p className="font-bold uppercase">Matricule: {employees.find(e => e.id === showPayslipPreview.employeeId)?.matricule}</p>
                                        <p>Poste: {employees.find(e => e.id === showPayslipPreview.employeeId)?.position}</p>
                                        <p>Entrée: {new Date(employees.find(e => e.id === showPayslipPreview.employeeId)?.joinDate || '').toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="bg-sky-50/30 p-6 rounded-sm border border-sky-100/50">
                                    <h4 className="text-[10px] font-black text-sky-600 uppercase tracking-widest mb-3">Récapitulatif</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-500">Salaire Brut</span>
                                            <span className="font-black text-slate-900">{showPayslipPreview.grossSalary.toLocaleString()} CFA</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-500">Retenues</span>
                                            <span className="font-black text-red-600">- {(showPayslipPreview.grossSalary - showPayslipPreview.netSalary).toLocaleString()} CFA</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border border-slate-200 rounded-sm overflow-hidden mb-12">
                                <table className="w-full text-xs">
                                    <thead className="bg-slate-900 text-white uppercase font-bold tracking-widest">
                                        <tr>
                                            <th className="py-3 px-4 text-left">Rubriques</th>
                                            <th className="py-3 px-4 text-right">Gains (+)</th>
                                            <th className="py-3 px-4 text-right">Retenues (-)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        <tr>
                                            <td className="py-4 px-4 font-bold text-slate-800">Salaire de Base</td>
                                            <td className="py-4 px-4 text-right font-black">{showPayslipPreview.baseSalary.toLocaleString()}</td>
                                            <td className="py-4 px-4 text-right"></td>
                                        </tr>
                                        {showPayslipPreview.transportPrime > 0 && (
                                            <tr>
                                                <td className="py-4 px-4 font-bold text-slate-800">Indemnité Transport</td>
                                                <td className="py-4 px-4 text-right font-black">{showPayslipPreview.transportPrime.toLocaleString()}</td>
                                                <td className="py-4 px-4 text-right"></td>
                                            </tr>
                                        )}
                                        {showPayslipPreview.housingPrime > 0 && (
                                            <tr>
                                                <td className="py-4 px-4 font-bold text-slate-800">Indemnité Logement</td>
                                                <td className="py-4 px-4 text-right font-black">{showPayslipPreview.housingPrime.toLocaleString()}</td>
                                                <td className="py-4 px-4 text-right"></td>
                                            </tr>
                                        )}
                                        {showPayslipPreview.cnpsDeduction > 0 && (
                                            <tr>
                                                <td className="py-4 px-4 font-bold text-slate-800">CNPS Part Ouvrière</td>
                                                <td className="py-4 px-4 text-right"></td>
                                                <td className="py-4 px-4 text-right font-black text-red-600">{showPayslipPreview.cnpsDeduction.toLocaleString()}</td>
                                            </tr>
                                        )}
                                        {showPayslipPreview.taxDeduction > 0 && (
                                            <tr>
                                                <td className="py-4 px-4 font-bold text-slate-800">Impôt (IOTS)</td>
                                                <td className="py-4 px-4 text-right"></td>
                                                <td className="py-4 px-4 text-right font-black text-red-600">{showPayslipPreview.taxDeduction.toLocaleString()}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end pt-10 border-t-2 border-slate-900">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Net à Payer</p>
                                    <p className="text-4xl font-black text-sky-600">{showPayslipPreview.netSalary.toLocaleString()} <span className="text-sm font-normal text-slate-400">CFA</span></p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 justify-center no-print">
                            <PDFDownloadLink
                                document={<PayslipPDF payslip={showPayslipPreview} employee={employees.find(e => e.id === showPayslipPreview.employeeId) || {} as Employee} />}
                                fileName={`Bulletin_${showPayslipPreview.employeeName}_${showPayslipPreview.period}.pdf`}
                                className="flex items-center gap-2 px-8 py-3 bg-sky-600 text-white rounded-sm hover:bg-sky-700 font-bold transition-all shadow-lg shadow-sky-900/10"
                            >
                                {({ loading }) => (
                                    <>
                                        <Download size={18} />
                                        {loading ? 'Génération...' : 'Télécharger Bulletin PDF'}
                                    </>
                                )}
                            </PDFDownloadLink>
                            <button onClick={() => window.print()} className="flex items-center gap-2 px-8 py-3 bg-slate-800 text-white rounded-sm hover:bg-slate-900 font-bold transition-all"><Printer size={18} /> Imprimer</button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal: Attendance Form */}
            <Modal
                isOpen={showingAttendanceModal}
                onClose={() => setShowingAttendanceModal(false)}
                title="Enregistrer un Pointage"
                size="md"
                footer={<button
                    onClick={() => {
                        createAttendance({
                            ...newAttendance,
                            employeeName: employees.find((e: any) => e.id === newAttendance.employeeId)?.fullName || 'Inconnu',
                            checkIn: new Date(newAttendance.date + 'T' + newAttendance.checkIn).toISOString(),
                            checkOut: new Date(newAttendance.date + 'T' + newAttendance.checkOut).toISOString()
                        });
                        setShowingAttendanceModal(false);
                    }}
                    className="px-8 py-3 bg-slate-900 text-white font-black rounded-sm shadow-lg hover:shadow-xl transition-all active:scale-95">Pointer Présence</button>}
            >
                <div className="space-y-4 py-2">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Employé</label>
                        <select className="w-full px-4 py-2.5 rounded-sm border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all shadow-inner" value={newAttendance.employeeId} onChange={e => setNewAttendance({ ...newAttendance, employeeId: e.target.value })}>
                            <option value="">Sélectionner un employé...</option>
                            {employees.map((e: any) => <option key={e.id} value={e.id}>{e.fullName} ({e.matricule})</option>)}
                        </select>
                    </div>
                    <InputField label="Date" type="date" value={newAttendance.date} onChange={v => setNewAttendance({ ...newAttendance, date: v })} />
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Heure d'arrivée" type="time" value={newAttendance.checkIn} onChange={v => setNewAttendance({ ...newAttendance, checkIn: v })} />
                        <InputField label="Heure de départ" type="time" value={newAttendance.checkOut} onChange={v => setNewAttendance({ ...newAttendance, checkOut: v })} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Statut</label>
                        <select className="w-full px-4 py-2.5 rounded-sm border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all shadow-inner" value={newAttendance.status} onChange={e => setNewAttendance({ ...newAttendance, status: e.target.value })}>
                            <option value="Présent">Présent</option>
                            <option value="Retard">Retard</option>
                            <option value="Absent">Absent</option>
                            <option value="Injustifié">Injustifié</option>
                        </select>
                    </div>
                </div>
            </Modal>

            {/* Modal: Leave Request Form */}
            <Modal
                isOpen={showingLeaveModal}
                onClose={() => setShowingLeaveModal(false)}
                title="Nouvelle Demande de Congé"
                size="lg"
                footer={<button
                    onClick={() => {
                        createLeaveRequest({
                            ...newLeave,
                            employeeName: employees.find((e: any) => e.id === newLeave.employeeId)?.fullName || 'Inconnu'
                        });
                        setShowingLeaveModal(false);
                    }}
                    className="px-8 py-3 bg-sky-600 text-white font-black rounded-sm shadow-lg shadow-sky-600/30 hover:bg-sky-700 transition-all active:scale-95">Soumettre la demande</button>}
            >
                <div className="grid grid-cols-2 gap-6 py-2">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Employé concerné</label>
                            <select className="w-full px-4 py-2.5 rounded-sm border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all shadow-inner" value={newLeave.employeeId} onChange={e => setNewLeave({ ...newLeave, employeeId: e.target.value })}>
                                <option value="">Choisir un collaborateur...</option>
                                {employees.map((e: any) => <option key={e.id} value={e.id}>{e.fullName}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type de congé</label>
                            <select className="w-full px-4 py-2.5 rounded-sm border border-slate-200 bg-slate-50 text-sm font-bold outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all shadow-inner" value={newLeave.type} onChange={e => setNewLeave({ ...newLeave, type: e.target.value })}>
                                <option value="Congé Annuel">Congé Annuel</option>
                                <option value="Permission Exceptionnelle">Permission Exceptionnelle</option>
                                <option value="Maladie">Congé Maladie</option>
                                <option value="Maternité/Paternité">Maternité / Paternité</option>
                                <option value="RTT">RTT / Repos</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <InputField label="Date de début" type="date" value={newLeave.startDate} onChange={v => setNewLeave({ ...newLeave, startDate: v })} />
                        <InputField label="Date de fin" type="date" value={newLeave.endDate} onChange={v => setNewLeave({ ...newLeave, endDate: v })} />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Motif de la demande</label>
                        <textarea className="w-full p-4 rounded-sm border border-slate-200 bg-slate-50 text-sm font-medium outline-none focus:bg-white focus:ring-4 focus:ring-sky-500/10 transition-all shadow-inner" rows={3} value={newLeave.reason} onChange={e => setNewLeave({ ...newLeave, reason: e.target.value })} placeholder="Détaillez le motif ici..."></textarea>
                    </div>
                </div>
            </Modal>

            {/* Modal: Face Training */}
            <FaceTrainingModal
                isOpen={!!trainingEmployee}
                onClose={() => setTrainingEmployee(null)}
                employee={trainingEmployee}
                onSave={(descriptor) => {
                    if (trainingEmployee) {
                        updateEmployee({
                            ...trainingEmployee,
                            faceDescriptor: JSON.stringify(descriptor)
                        });
                        setTrainingEmployee(null);
                        alert("Empreinte faciale enregistrée avec succès !");
                    }
                }}
            />
        </div>
    );
};
