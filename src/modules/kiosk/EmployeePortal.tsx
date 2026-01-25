import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api-client';
import {
  Wallet,
  Clock,
  Palmtree,
  User,
  Download,
  Eye,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock as ClockIcon,
  AlertTriangle,
  LogOut,
  Plus
} from 'lucide-react';
import { SectionHeader } from '@/components/admin/shared/AdminShared';
import { DataTable } from '@/components/admin/shared/DataTable';
import { Badge } from '@/components/admin/shared/Icons';
import { PayslipPDF } from '@/modules/admin/hr/components/PayslipPDF';

interface Employee {
  id: string;
  fullName: string;
  matricule: string;
  position: string;
  department: string;
  email: string;
  status: string;
  joinDate: string;
  baseSalary: number;
  faceDescriptor?: string;
  userId?: string;
}

interface Payslip {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string;
  baseSalary: number;
  transportPrime: number;
  housingPrime: number;
  otherBonuses: number;
  cnpsDeduction: number;
  taxDeduction: number;
  otherDeductions: number;
  grossSalary: number;
  netSalary: number;
  cnpsEmployer: number;
  taxEmployer: number;
  totalEmployer: number;
  status: 'Brouillon' | 'Validé' | 'Payé';
  date: string;
}

interface Attendance {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  status: 'Présent' | 'Absent' | 'Retard' | 'Injustifié';
  checkIn: string;
  checkOut: string;
  companyId: string;
}

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

const EmployeePortal: React.FC = () => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'payroll' | 'attendance' | 'leaves'>('dashboard');
  const [showPayslipPreview, setShowPayslipPreview] = useState<Payslip | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [newLeave, setNewLeave] = useState({
    type: 'Congé Annuel',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reason: '',
  });
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Récupérer l'employé connecté
  const { data: employeeData, isLoading: profileLoading, error: profileError } = useQuery<Employee>({
    queryKey: ['employee-profile'],
    queryFn: async () => {
      console.log('Fetching profile with token:', localStorage.getItem('auth_token'));
      const result = await apiFetch('/hr/profile');
      console.log('Profile result:', result);
      return result;
    },
    enabled: !!localStorage.getItem('auth_token'), // seulement si un token est présent
    retry: false,
  });

  useEffect(() => {
    if (employeeData) {
      setEmployee(employeeData);
    }
  }, [employeeData]);

  const handleLogout = () => {
    logout();
    // Après déconnexion, rediriger vers la page de connexion
    navigate('/login');
  };

  // Récupérer les bulletins de paie de l'employé
  const { data: payslips = [], isLoading: payslipsLoading } = useQuery<Payslip[]>({
    queryKey: ['employee-payslips', employee?.id],
    queryFn: () => apiFetch(`/hr/employees/${employee?.id}/payslips`),
    enabled: !!employee?.id,
  });

  // Récupérer les pointages de l'employé
  const { data: attendances = [], isLoading: attendancesLoading } = useQuery<Attendance[]>({
    queryKey: ['employee-attendances', employee?.id],
    queryFn: () => apiFetch(`/hr/employees/${employee?.id}/attendances`),
    enabled: !!employee?.id,
  });

  // Récupérer les demandes de congé de l'employé
  const { data: leaveRequests = [], isLoading: leavesLoading } = useQuery<LeaveRequest[]>({
    queryKey: ['employee-leaves', employee?.id],
    queryFn: () => apiFetch(`/hr/employees/${employee?.id}/leave-requests`),
    enabled: !!employee?.id,
  });

  // Charger les données une fois que l'employé est connu
  useEffect(() => {
    if (employee?.id) {
      queryClient.invalidateQueries({ queryKey: ['employee-payslips', employee.id] });
      queryClient.invalidateQueries({ queryKey: ['employee-attendances', employee.id] });
      queryClient.invalidateQueries({ queryKey: ['employee-leaves', employee.id] });
    }
  }, [employee?.id, queryClient]);

  const handleSubmitLeave = async () => {
    if (!employee) return;
    setIsSubmittingLeave(true);
    try {
      await apiFetch('/hr/leave-requests', {
        method: 'POST',
        body: JSON.stringify(newLeave),
      });
      setShowLeaveModal(false);
      queryClient.invalidateQueries({ queryKey: ['employee-leaves', employee.id] });
      alert('Demande de congé envoyée avec succès !');
    } catch (err: any) {
      alert('Erreur: ' + err.message);
    } finally {
      setIsSubmittingLeave(false);
    }
  };

  // Calculs pour le tableau de bord
  const currentMonthPayslip = payslips.find(p =>
    p.period === new Date().toISOString().substring(0, 7) && p.status === 'Payé'
  );

  const upcomingLeaves = leaveRequests.filter(lr =>
    lr.status === 'Approved' &&
    new Date(lr.startDate) >= new Date()
  );

  const pendingLeaves = leaveRequests.filter(lr => lr.status === 'Pending');

  const attendanceStats = {
    presentThisMonth: attendances.filter(a =>
      a.status === 'Présent' &&
      new Date(a.date).getMonth() === new Date().getMonth() &&
      new Date(a.date).getFullYear() === new Date().getFullYear()
    ).length,
    lateThisMonth: attendances.filter(a =>
      a.status === 'Retard' &&
      new Date(a.date).getMonth() === new Date().getMonth() &&
      new Date(a.date).getFullYear() === new Date().getFullYear()
    ).length,
    absentThisMonth: attendances.filter(a =>
      (a.status === 'Absent' || a.status === 'Injustifié') &&
      new Date(a.date).getMonth() === new Date().getMonth() &&
      new Date(a.date).getFullYear() === new Date().getFullYear()
    ).length
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!employeeData && !localStorage.getItem('auth_token')) {
    // Rediriger vers la page de connexion principale si pas authentifié
    return <Navigate to="/login" replace />;
  }

  // Si l'utilisateur est authentifié mais que les données de l'employé ne sont pas encore chargées,
  // on continue à afficher le chargement
  if (!employeeData && localStorage.getItem('auth_token')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium mb-4">Chargement des données employé...</p>
          {profileError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-sm text-sm">
              <p className="font-bold mb-2">Erreur de chargement :</p>
              <p>{profileError.message}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-sm hover:bg-red-700 text-sm"
              >
                Recharger la page
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center">
          <p className="text-slate-600 font-medium">Aucune donnée d'employé disponible.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (employeeData) {
      setEmployee(employeeData);
    }
  }, [employeeData]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* En-tête du portail employé */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900">Portail Employé</h1>
              <p className="text-slate-500">Bienvenue, {employee.fullName}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-700">{employee.position}</p>
                <p className="text-xs text-slate-500">{employee.department}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-black text-lg">
                {employee.fullName.split(' ').map(n => n[0]).join('')}
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all"
                title="Déconnexion"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex overflow-x-auto pb-2 -mx-4 px-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-sm transition-all whitespace-nowrap ${activeTab === 'dashboard'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              <User size={18} /> Tableau de bord
            </button>
            <button
              onClick={() => setActiveTab('payroll')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-sm transition-all whitespace-nowrap ${activeTab === 'payroll'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              <Wallet size={18} /> Mes Bulletins
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-sm transition-all whitespace-nowrap ${activeTab === 'attendance'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              <Clock size={18} /> Mes Pointages
            </button>
            <button
              onClick={() => setActiveTab('leaves')}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-sm transition-all whitespace-nowrap ${activeTab === 'leaves'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              <Palmtree size={18} /> Mes Congés
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contenu selon l'onglet actif */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-sky-50 text-sky-600 rounded-sm">
                    <Wallet size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                      Salaire Net Mois
                    </p>
                    <p className="text-xl font-black text-slate-800">
                      {currentMonthPayslip
                        ? currentMonthPayslip.netSalary.toLocaleString()
                        : '0'} CFA
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-50 text-green-600 rounded-sm">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                      Présences ce mois
                    </p>
                    <p className="text-xl font-black text-green-600">
                      {attendanceStats.presentThisMonth}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-50 text-yellow-600 rounded-sm">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                      Retards ce mois
                    </p>
                    <p className="text-xl font-black text-yellow-600">
                      {attendanceStats.lateThisMonth}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-50 text-red-600 rounded-sm">
                    <XCircle size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                      Absences ce mois
                    </p>
                    <p className="text-xl font-black text-red-600">
                      {attendanceStats.absentThisMonth}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Prochains congés et demandes en attente */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Palmtree size={16} /> Prochains Congés
                </h3>
                {upcomingLeaves.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingLeaves.slice(0, 3).map((leave) => (
                      <div key={leave.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-sm">
                        <div>
                          <p className="text-sm font-bold text-slate-700">{leave.type}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge color="blue">{leave.status}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm italic">Aucun congé prévu prochainement</p>
                )}
              </div>

              <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <ClockIcon size={16} /> Demandes en Attente
                </h3>
                {pendingLeaves.length > 0 ? (
                  <div className="space-y-3">
                    {pendingLeaves.slice(0, 3).map((leave) => (
                      <div key={leave.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-sm">
                        <div>
                          <p className="text-sm font-bold text-slate-700">{leave.type}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge color="orange">{leave.status}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm italic">Aucune demande en attente</p>
                )}
              </div>
            </div>

            {/* Dernier bulletin de paie */}
            {currentMonthPayslip && (
              <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Wallet size={16} /> Dernier Bulletin de Paie
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">
                      {new Date(currentMonthPayslip.period + '-01').toLocaleDateString('fr-FR', {
                        month: 'long',
                        year: 'numeric'
                      }).toUpperCase()}
                    </p>
                    <p className="text-sm text-slate-500">
                      Net à payer: {currentMonthPayslip.netSalary.toLocaleString()} CFA
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowPayslipPreview(currentMonthPayslip)}
                      className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-sm transition-all"
                      title="Aperçu"
                    >
                      <Eye size={18} />
                    </button>
                    <a
                      href={`/api/payslips/${currentMonthPayslip.id}/download`}
                      className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-sm transition-all"
                      title="Télécharger"
                    >
                      <Download size={18} />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'payroll' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 mb-4">Mes Bulletins de Paie</h3>
              {payslipsLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
              ) : payslips.length > 0 ? (
                <DataTable<Payslip>
                  data={payslips}
                  searchPlaceholder="Rechercher un bulletin..."
                  searchKeys={['period']}
                  columns={[
                    {
                      header: 'Période',
                      accessor: (ps) => (
                        <div className="font-bold text-slate-600 uppercase tracking-tight">
                          {new Date(ps.period + '-01').toLocaleDateString('fr-FR', {
                            month: 'long',
                            year: 'numeric'
                          })}
                        </div>
                      ),
                      sortable: true,
                    },
                    {
                      header: 'Salaire Net',
                      accessor: (ps) => (
                        <div className="font-black text-sky-700">
                          {ps.netSalary.toLocaleString()} CFA
                        </div>
                      ),
                      sortable: true,
                    },
                    {
                      header: 'Statut',
                      accessor: (ps) => (
                        <Badge
                          color={
                            ps.status === 'Payé' ? 'green' : ps.status === 'Validé' ? 'blue' : 'slate'
                          }
                        >
                          {ps.status}
                        </Badge>
                      ),
                      sortable: true,
                    },
                    {
                      header: 'Date',
                      accessor: (ps) => (
                        <span className="text-sm text-slate-500">
                          {new Date(ps.date).toLocaleDateString()}
                        </span>
                      ),
                      sortable: true,
                    },
                  ]}
                  actions={(ps) => (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowPayslipPreview(ps)}
                        className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-sm transition-all"
                        title="Aperçu"
                      >
                        <Eye size={18} />
                      </button>
                      <a
                        href={`/api/payslips/${ps.id}/download`}
                        className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-sm transition-all"
                        title="Télécharger"
                      >
                        <Download size={18} />
                      </a>
                    </div>
                  )}
                />
              ) : (
                <p className="text-slate-500 text-center py-8 italic">Aucun bulletin de paie disponible</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 mb-4">Mes Pointages</h3>
              {attendancesLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
              ) : attendances.length > 0 ? (
                <DataTable<Attendance>
                  data={attendances}
                  searchPlaceholder="Rechercher un pointage..."
                  searchKeys={['date']}
                  columns={[
                    {
                      header: 'Date',
                      accessor: (a) => (
                        <span className="font-mono text-sm font-bold">
                          {new Date(a.date).toLocaleDateString()}
                        </span>
                      ),
                      sortable: true,
                    },
                    {
                      header: 'Heures',
                      accessor: (a) => (
                        <div className="text-sm font-medium space-x-2">
                          <span className="text-green-600">
                            Entrée: {new Date(a.checkIn).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <span className="text-red-500">
                            Sortie: {new Date(a.checkOut).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      ),
                    },
                    {
                      header: 'Statut',
                      accessor: (a) => (
                        <Badge
                          color={
                            a.status === 'Présent' ? 'green' :
                              a.status === 'Retard' ? 'yellow' :
                                a.status === 'Absent' ? 'red' : 'orange'
                          }
                        >
                          {a.status}
                        </Badge>
                      ),
                      sortable: true,
                    },
                  ]}
                />
              ) : (
                <p className="text-slate-500 text-center py-8 italic">Aucun pointage enregistré</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'leaves' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-slate-900">Mes Demandes de Congé</h3>
                <button
                  onClick={() => setShowLeaveModal(true)}
                  className="bg-sky-600 text-white px-6 py-2 rounded-sm flex items-center gap-2 text-sm font-bold hover:bg-sky-700 transition-all shadow-lg shadow-sky-900/10"
                >
                  <Plus size={18} /> Nouvelle Demande
                </button>
              </div>
              {leavesLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
              ) : leaveRequests.length > 0 ? (
                <DataTable<LeaveRequest>
                  data={leaveRequests}
                  searchPlaceholder="Rechercher une demande..."
                  searchKeys={['type', 'reason']}
                  columns={[
                    {
                      header: 'Type',
                      accessor: (lr) => (
                        <span className="font-bold text-slate-800">{lr.type}</span>
                      ),
                      sortable: true,
                    },
                    {
                      header: 'Période',
                      accessor: (lr) => (
                        <div className="text-sm">
                          <div>Du {new Date(lr.startDate).toLocaleDateString()}</div>
                          <div>Au {new Date(lr.endDate).toLocaleDateString()}</div>
                        </div>
                      ),
                      sortable: true,
                    },
                    {
                      header: 'Motif',
                      accessor: (lr) => (
                        <div className="max-w-xs truncate text-sm text-slate-500 italic">
                          {lr.reason}
                        </div>
                      ),
                    },
                    {
                      header: 'Statut',
                      accessor: (lr) => (
                        <Badge
                          color={
                            lr.status === 'Approved' ? 'green' :
                              lr.status === 'Rejected' ? 'red' : 'orange'
                          }
                        >
                          {lr.status === 'Pending'
                            ? 'En attente'
                            : lr.status === 'Approved'
                              ? 'Accepté'
                              : 'Refusé'}
                        </Badge>
                      ),
                      sortable: true,
                    },
                    {
                      header: 'Date',
                      accessor: (lr) => (
                        <span className="text-sm text-slate-500">
                          {new Date(lr.createdAt).toLocaleDateString()}
                        </span>
                      ),
                      sortable: true,
                    },
                  ]}
                />
              ) : (
                <p className="text-slate-500 text-center py-8 italic">Aucune demande de congé</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal: Aperçu du bulletin de paie */}
      {showPayslipPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-sm max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-900">
                Aperçu du Bulletin: {showPayslipPreview.employeeName}
              </h3>
              <button
                onClick={() => setShowPayslipPreview(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-sm"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div
                id="payslip-to-print"
                className="bg-white border border-slate-200 p-8 max-w-4xl mx-auto min-h-[800px] text-slate-800 font-sans"
              >
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-10">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                      ENEA TELECOM
                    </h2>
                    <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest mt-1">
                      Infrastructures & Réseaux
                    </p>
                    <div className="mt-6 text-xs text-slate-500 font-medium space-y-1">
                      <p>Cocody Riviera 3, Abidjan</p>
                      <p>CI-ABJ-2013-B-345</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-slate-900 text-white px-4 py-2 inline-block font-black text-sm uppercase tracking-widest mb-4">
                      Bulletin de Paie
                    </div>
                    <p className="text-2xl font-black text-slate-900 mb-1">
                      {new Date(showPayslipPreview.period + '-01')
                        .toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
                        .toUpperCase()}
                    </p>
                    <p className="text-xs text-slate-400 font-bold italic">
                      Date d'édition: {new Date(showPayslipPreview.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-12 mb-12">
                  <div className="bg-slate-50 p-6 rounded-sm border border-slate-100">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                      Salarié
                    </h4>
                    <p className="font-bold text-slate-800 text-lg">
                      {showPayslipPreview.employeeName}
                    </p>
                    <div className="text-xs text-slate-500 mt-2 space-y-1">
                      <p className="font-bold uppercase">
                        Matricule: {employee?.matricule}
                      </p>
                      <p>
                        Poste: {employee?.position}
                      </p>
                      <p>
                        Entrée: {new Date(employee?.joinDate || '').toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="bg-sky-50/30 p-6 rounded-sm border border-sky-100/50">
                    <h4 className="text-[10px] font-black text-sky-600 uppercase tracking-widest mb-3">
                      Récapitulatif
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Salaire Brut</span>
                        <span className="font-black text-slate-900">
                          {showPayslipPreview.grossSalary.toLocaleString()} CFA
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Retenues</span>
                        <span className="font-black text-red-600">
                          - {(showPayslipPreview.grossSalary - showPayslipPreview.netSalary).toLocaleString()} CFA
                        </span>
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
                        <td className="py-4 px-4 text-right font-black">
                          {showPayslipPreview.baseSalary.toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-right"></td>
                      </tr>
                      {showPayslipPreview.transportPrime > 0 && (
                        <tr>
                          <td className="py-4 px-4 font-bold text-slate-800">Indemnité Transport</td>
                          <td className="py-4 px-4 text-right font-black">
                            {showPayslipPreview.transportPrime.toLocaleString()}
                          </td>
                          <td className="py-4 px-4 text-right"></td>
                        </tr>
                      )}
                      {showPayslipPreview.housingPrime > 0 && (
                        <tr>
                          <td className="py-4 px-4 font-bold text-slate-800">Indemnité Logement</td>
                          <td className="py-4 px-4 text-right font-black">
                            {showPayslipPreview.housingPrime.toLocaleString()}
                          </td>
                          <td className="py-4 px-4 text-right"></td>
                        </tr>
                      )}
                      {showPayslipPreview.cnpsDeduction > 0 && (
                        <tr>
                          <td className="py-4 px-4 font-bold text-slate-800">CNPS Part Ouvrière</td>
                          <td className="py-4 px-4 text-right"></td>
                          <td className="py-4 px-4 text-right font-black text-red-600">
                            {showPayslipPreview.cnpsDeduction.toLocaleString()}
                          </td>
                        </tr>
                      )}
                      {showPayslipPreview.taxDeduction > 0 && (
                        <tr>
                          <td className="py-4 px-4 font-bold text-slate-800">Impôt (IOTS)</td>
                          <td className="py-4 px-4 text-right"></td>
                          <td className="py-4 px-4 text-right font-black text-red-600">
                            {showPayslipPreview.taxDeduction.toLocaleString()}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="border border-slate-200 rounded-sm overflow-hidden mb-12">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-widest">
                      <tr>
                        <th className="py-3 px-4 text-left">Charges Patronales (Employeur)</th>
                        <th className="py-3 px-4 text-right">Taux / Base</th>
                        <th className="py-3 px-4 text-right">Montant</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {showPayslipPreview.cnpsEmployer > 0 && (
                        <tr>
                          <td className="py-4 px-4 font-medium text-slate-700">CNPS Part Patronale</td>
                          <td className="py-4 px-4 text-right text-slate-500">7.7%</td>
                          <td className="py-4 px-4 text-right font-bold text-slate-700">
                            {showPayslipPreview.cnpsEmployer.toLocaleString()}
                          </td>
                        </tr>
                      )}
                      {showPayslipPreview.taxEmployer > 0 && (
                        <tr>
                          <td className="py-4 px-4 font-medium text-slate-700">Taxe Apprentissage / FDFP</td>
                          <td className="py-4 px-4 text-right text-slate-500">1.5%</td>
                          <td className="py-4 px-4 text-right font-bold text-slate-700">
                            {showPayslipPreview.taxEmployer.toLocaleString()}
                          </td>
                        </tr>
                      )}
                      <tr className="bg-slate-50">
                        <td className="py-4 px-4 font-black text-slate-900">TOTAL CHARGES PATRONALES</td>
                        <td className="py-4 px-4 text-right"></td>
                        <td className="py-4 px-4 text-right font-black text-slate-900">
                          {showPayslipPreview.totalEmployer.toLocaleString()} CFA
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-10 border-t-2 border-slate-900">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Net à Payer
                    </p>
                    <p className="text-4xl font-black text-sky-600">
                      {showPayslipPreview.netSalary.toLocaleString()}{' '}
                      <span className="text-sm font-normal text-slate-400">CFA</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center mt-6">
                <a
                  href={`/api/payslips/${showPayslipPreview.id}/download`}
                  className="flex items-center gap-2 px-8 py-3 bg-sky-600 text-white rounded-sm hover:bg-sky-700 font-bold transition-all shadow-lg shadow-sky-900/10"
                >
                  <Download size={18} /> Télécharger Bulletin PDF
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal: Nouvelle demande de congé */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-sm max-w-lg w-full shadow-2xl">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-900">Demander un congé</h3>
              <button
                onClick={() => setShowLeaveModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-sm"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Type de congé</label>
                <select
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-sm font-bold text-sm outline-none focus:border-sky-500 transition-all"
                  value={newLeave.type}
                  onChange={(e) => setNewLeave({ ...newLeave, type: e.target.value })}
                >
                  <option value="Congé Annuel">Congé Annuel</option>
                  <option value="Maladie">Maladie</option>
                  <option value="Maternité/Paternité">Maternité / Paternité</option>
                  <option value="RTT">RTT / Repos</option>
                  <option value="Sans Solde">Sans Solde</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Début</label>
                  <input
                    type="date"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-sm font-bold text-sm outline-none focus:border-sky-500 transition-all"
                    value={newLeave.startDate}
                    onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Fin</label>
                  <input
                    type="date"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-sm font-bold text-sm outline-none focus:border-sky-500 transition-all"
                    value={newLeave.endDate}
                    onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Motif</label>
                <textarea
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-sm font-medium text-sm outline-none focus:border-sky-500 transition-all"
                  rows={3}
                  placeholder="Expliquez brièvement votre demande..."
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowLeaveModal(false)}
                  className="flex-1 py-3 px-4 border border-slate-200 text-slate-600 font-bold rounded-sm hover:bg-slate-50 transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmitLeave}
                  disabled={isSubmittingLeave}
                  className="flex-1 py-3 px-4 bg-sky-600 text-white font-black rounded-sm hover:bg-sky-700 shadow-lg shadow-sky-900/10 transition-all disabled:opacity-50"
                >
                  {isSubmittingLeave ? 'Envoi...' : 'Soumettre'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeePortal;