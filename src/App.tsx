/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Plus, 
  MoreVertical, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Check,
  LayoutDashboard,
  Calendar as CalendarIcon,
  Wallet,
  User,
  ChevronRight,
  Camera,
  Play,
  Pause,
  ArrowUpRight,
  History,
  ListTodo,
  Info,
  Map as MapIcon,
  Bell,
  Menu,
  X,
  MessageCircle,
  LayoutGrid,
  ChevronDown,
  Search,
  Filter,
  ArrowLeft,
  Minus,
  ChevronLeft
} from 'lucide-react';
import { api } from './services/api';

// --- Helpers ---

const getLocalDateString = (date: Date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- Types ---

type AppointmentStatus = 'Confirmado' | 'A Caminho' | 'Em Curso' | 'Pendente' | 'Concluído' | 'Pago' | 'Já está limpo' | 'Precisa de limpeza';
type Tab = 'dashboard' | 'schedule' | 'history' | 'more' | 'notifications';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  photo: string;
  status: 'Ativo' | 'Inativo';
}

interface ProfileData {
  name: string;
  role: string;
  rating: string;
  jobs: string;
  exp: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

interface Customer {
  id: string;
  name: string;
  photo: string;
  contact: string;
  email: string;
  address: string;
  district: string;
  municipality: string;
}

interface Appointment {
  id: string;
  date: string; 
  startTime: string;
  endTime: string;
  customerName: string;
  customerPhoto?: string;
  serviceType: string;
  address: string;
  city: string;
  status: AppointmentStatus;
  price: number;
  checklist: { task: string; completed: boolean }[];
  contact?: string;
  email?: string;
  typology?: string;
  isSpecial?: string;
  comment?: string;
}

interface EarningRecord {
  id: string;
  date: string;
  amount: number;
  method: string;
  status: 'Em Trânsito' | 'Concluído';
}

// --- Mock Data ---

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: '0',
    date: getLocalDateString(new Date(Date.now() - 86400000)), // Yesterday
    startTime: '10:00',
    endTime: '12:00',
    customerName: 'Histórico Teste',
    customerPhoto: 'https://picsum.photos/seed/history/100/100',
    serviceType: 'Limpeza Padrão',
    address: 'Rua do Passado, 123',
    city: 'Lisboa',
    status: 'Concluído',
    price: 50.00,
    checklist: []
  },
  {
    id: '1',
    date: getLocalDateString(),
    startTime: '09:00',
    endTime: '12:00',
    customerName: 'Maria Silva',
    customerPhoto: 'https://picsum.photos/seed/maria/100/100',
    serviceType: 'Limpeza Padrão',
    address: 'Rua de Santo António, 45',
    city: 'Faro',
    status: 'Confirmado',
    price: 45.00,
    checklist: [
      { task: 'Limpar superfícies da cozinha', completed: true },
      { task: 'Aspirar e lavar o chão', completed: true },
      { task: 'Limpar casas de banho', completed: false },
      { task: 'Mudar lençóis', completed: false },
    ]
  },
  {
    id: '2',
    date: getLocalDateString(),
    startTime: '13:30',
    endTime: '15:30',
    customerName: 'João Pereira',
    customerPhoto: 'https://picsum.photos/seed/joao/100/100',
    serviceType: 'Limpeza Profunda',
    address: 'Avenida da República, 12',
    city: 'Faro',
    status: 'A Caminho',
    price: 65.00,
    checklist: []
  },
  {
    id: '3',
    date: getLocalDateString(),
    startTime: '16:00',
    endTime: '18:00',
    customerName: 'Ana Costa',
    customerPhoto: 'https://picsum.photos/seed/ana/100/100',
    serviceType: 'Limpeza de Escritório',
    address: 'Rua do Prior, 8',
    city: 'Faro',
    status: 'Concluído',
    price: 35.00,
    checklist: []
  },
];

const MOCK_EARNINGS: EarningRecord[] = [
  { id: 'e1', date: '2024-04-12', amount: 36.00, method: 'PayPal', status: 'Em Trânsito' },
  { id: 'e2', date: '2024-04-10', amount: 18.00, method: 'PayPal', status: 'Concluído' },
  { id: 'e3', date: '2024-04-09', amount: 63.00, method: 'PayPal', status: 'Concluído' },
  { id: 'e4', date: '2024-04-08', amount: 21.00, method: 'PayPal', status: 'Concluído' },
];

// --- Components ---

const StatusBadge = ({ status }: { status: AppointmentStatus }) => {
  const styles = {
    Confirmado: 'bg-success text-white',
    'A Caminho': 'bg-pending text-white',
    Pendente: 'bg-pending text-white',
    Concluído: 'bg-completed text-white',
  };

  return (
    <div className={`flex items-center px-2.5 py-1 rounded-badge text-[10px] font-bold uppercase tracking-wider ${styles[status]}`}>
      {status}
    </div>
  );
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', role: '' });
  const [selectedJob, setSelectedJob] = useState<Appointment | null>(null);
  const [profile, setProfile] = useState<ProfileData>({
    name: 'Ricardo Oliveira',
    role: 'Limpador Profissional',
    rating: '4.9',
    jobs: '124',
    exp: '2 anos'
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appts, custs, tm, ntfs] = await Promise.all([
          api.getAppointments(),
          api.getCustomers(),
          api.getTeam(),
          api.getNotifications()
        ]);
        setAppointments(appts);
        setCustomers(custs);
        setTeam(tm);
        setNotifications(ntfs);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [isOperationCenterOpen, setIsOperationCenterOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [categoryDetail, setCategoryDetail] = useState<string | null>(null);
  
  const [newJob, setNewJob] = useState({
    customerId: '',
    name: '',
    contact: '',
    email: '',
    address: '',
    district: '',
    municipality: '',
    typology: 'T1',
    serviceType: 'Limpeza Padrão',
    isSpecial: 'Não',
    date: getLocalDateString(),
    time: '09:00',
    price: 0,
    comment: ''
  });

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    contact: '',
    email: '',
    address: '',
    district: '',
    municipality: ''
  });

  const handleCreateJob = async () => {
    let appointment: Appointment;
    if (editingJobId) {
      const existing = appointments.find(a => a.id === editingJobId);
      appointment = {
        ...existing!,
        date: newJob.date,
        startTime: newJob.time,
        customerName: newJob.name,
        contact: newJob.contact,
        email: newJob.email,
        address: newJob.address,
        city: newJob.district,
        typology: newJob.typology,
        serviceType: newJob.serviceType,
        isSpecial: newJob.isSpecial,
        comment: newJob.comment,
        price: Number(newJob.price)
      };
      setAppointments(prev => prev.map(app => app.id === editingJobId ? appointment : app));
      setEditingJobId(null);
    } else {
      appointment = {
        id: Date.now().toString(),
        date: newJob.date,
        startTime: newJob.time,
        endTime: '11:00',
        customerName: newJob.name,
        customerPhoto: `https://picsum.photos/seed/${newJob.name}/100/100`,
        serviceType: newJob.serviceType,
        address: newJob.address,
        city: newJob.district,
        status: 'Confirmado',
        price: Number(newJob.price),
        checklist: [],
        contact: newJob.contact,
        email: newJob.email,
        typology: newJob.typology,
        isSpecial: newJob.isSpecial,
        comment: newJob.comment
      };
      setAppointments([...appointments, appointment]);
    }

    await api.saveAppointment(appointment);

    setIsAddJobOpen(false);
    
    const notification: Notification = {
      id: Date.now().toString(),
      title: editingJobId ? 'Agendamento Atualizado' : 'Agendamento Criado',
      message: `O serviço para ${newJob.name} foi processado com sucesso.`,
      time: 'Agora',
      unread: true
    };
    setNotifications([notification, ...notifications]);
    await api.saveNotification(notification);

    // Reset form
    setNewJob({
      customerId: '',
      name: '',
      contact: '',
      email: '',
      address: '',
      district: '',
      municipality: '',
      typology: 'T1',
      serviceType: 'Limpeza Padrão',
      isSpecial: 'Não',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      price: 0,
      comment: ''
    });
  };

  const handleCreateCustomer = async () => {
    let customer: Customer;
    if (editingCustomerId) {
      const existing = customers.find(c => c.id === editingCustomerId);
      customer = { ...existing!, ...newCustomer };
      setCustomers(prev => prev.map(c => c.id === editingCustomerId ? customer : c));
      setEditingCustomerId(null);
    } else {
      customer = {
        id: Date.now().toString(),
        name: newCustomer.name,
        photo: `https://picsum.photos/seed/${newCustomer.name}/100/100`,
        contact: newCustomer.contact,
        email: newCustomer.email,
        address: newCustomer.address,
        district: newCustomer.district,
        municipality: newCustomer.municipality
      };
      setCustomers([...customers, customer]);
    }

    await api.saveCustomer(customer);

    setIsAddCustomerOpen(false);
    
    const notification: Notification = {
      id: Date.now().toString(),
      title: editingCustomerId ? 'Cliente Atualizado' : 'Cliente Registado',
      message: `O cliente ${newCustomer.name} foi guardado com sucesso.`,
      time: 'Agora',
      unread: true
    };
    setNotifications([notification, ...notifications]);
    await api.saveNotification(notification);

    setNewCustomer({
      name: '',
      contact: '',
      email: '',
      address: '',
      district: '',
      municipality: ''
    });
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomerId(customer.id);
    setNewCustomer({
      name: customer.name,
      contact: customer.contact,
      email: customer.email,
      address: customer.address,
      district: customer.district,
      municipality: customer.municipality
    });
    setIsOperationCenterOpen(false);
    setIsAddCustomerOpen(true);
  };

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.role) return;
    const member: TeamMember = {
      id: Date.now().toString(),
      name: newMember.name,
      role: newMember.role,
      photo: `https://picsum.photos/seed/${newMember.name}/100/100`,
      status: 'Ativo'
    };
    setTeam([...team, member]);
    await api.saveTeamMember(member);
    setNewMember({ name: '', role: '' });
    setIsAddMemberOpen(false);
  };

  const handleRemoveMember = async (id: string) => {
    setTeam(prev => prev.filter(m => m.id !== id));
    await api.deleteTeamMember(id);
  };

  const handleDeleteCustomer = async (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    await api.deleteCustomer(id);
  };

  const handleSelectCustomer = (customerId: string) => {
    if (customerId === 'new') {
      setIsAddCustomerOpen(true);
      return;
    }

    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setNewJob({
        ...newJob,
        customerId,
        name: customer.name,
        contact: customer.contact,
        email: customer.email,
        address: customer.address,
        district: customer.district,
        municipality: customer.municipality
      });
    }
  };

  const handleEditJob = (job: Appointment) => {
    setEditingJobId(job.id);
    setNewJob({
      customerId: '', // We don't necessarily track this on old jobs
      name: job.customerName,
      contact: job.contact || '',
      email: job.email || '',
      address: job.address,
      district: job.city,
      municipality: job.address.split(',')[0],
      typology: job.typology || 'T1',
      serviceType: job.serviceType,
      isSpecial: job.isSpecial || 'Não',
      date: job.date,
      time: job.startTime,
      price: job.price,
      comment: job.comment || ''
    });
    setIsAddJobOpen(true);
  };

  const handleCancelJob = async (jobId: string) => {
    setAppointments(prev => prev.filter(app => app.id !== jobId));
    await api.deleteAppointment(jobId);
    
    const notification: Notification = {
      id: Date.now().toString(),
      title: 'Agendamento Cancelado',
      message: 'O serviço foi removido da sua lista.',
      time: 'Agora',
      unread: true
    };
    setNotifications([notification, ...notifications]);
    await api.saveNotification(notification);
  };
  const [activeProfileSubView, setActiveProfileSubView] = useState<string | null>(null);

  const handleJobClick = (job: Appointment) => {
    setSelectedJob(job);
  };

  const handleCompleteJob = async (jobId: string) => {
    const existing = appointments.find(a => a.id === jobId);
    if (!existing) return;

    const updated = { ...existing, status: 'Concluído' as AppointmentStatus };
    setAppointments(prev => prev.map(app => app.id === jobId ? updated : app));
    await api.saveAppointment(updated);
    setSelectedJob(null);
    
    const notification: Notification = {
      id: Date.now().toString(),
      title: 'Trabalho Concluído',
      message: 'O serviço foi finalizado com sucesso. Bom trabalho!',
      time: 'Agora',
      unread: true
    };
    setNotifications([notification, ...notifications]);
    await api.saveNotification(notification);
  };

  const handleUpdateStatus = async (jobId: string, status: AppointmentStatus) => {
    const existing = appointments.find(a => a.id === jobId);
    if (!existing) return;

    const updated = { ...existing, status };
    setAppointments(prev => prev.map(app => app.id === jobId ? updated : app));
    await api.saveAppointment(updated);

    const notification: Notification = {
      id: Date.now().toString(),
      title: 'Status Atualizado',
      message: `O serviço foi marcado como ${status}.`,
      time: 'Agora',
      unread: true
    };
    setNotifications([notification, ...notifications]);
    await api.saveNotification(notification);
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  if (!isLoggedIn) {
    return showRegister ? (
      <RegisterView onRegister={() => setIsLoggedIn(true)} onBackToLogin={() => setShowRegister(false)} />
    ) : (
      <LoginView onLogin={() => setIsLoggedIn(true)} onGoToRegister={() => setShowRegister(false)} />
    );
  }

  return (
    <div className="min-h-screen bg-bg-app font-sans text-text-main flex flex-col max-w-md mx-auto shadow-2xl relative overflow-hidden border-x border-gray-200">
      
      {/* Fixed Global Header */}
      {!selectedJob && (
        <header className="bg-white h-20 flex items-end justify-between px-5 pb-4 border-b border-[#F5F7FA] z-30 shrink-0">
          <button 
            onClick={() => setIsOperationCenterOpen(true)}
            className="p-2 -ml-2 text-[#4A5568] hover:bg-gray-50 rounded-full transition-colors"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-[#A0AEC0] uppercase tracking-widest">TaviClean</span>
            <h1 className="text-lg font-bold text-[#1A202C]">Painel</h1>
          </div>

          <button 
            onClick={() => setActiveTab('notifications')}
            className={`relative p-2 rounded-full transition-colors ${activeTab === 'notifications' ? 'bg-primary/10 text-primary' : 'text-[#4A5568] hover:bg-gray-50'}`}
          >
            <Bell size={24} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            )}
          </button>
        </header>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pb-20">
        <AnimatePresence mode="wait">
          {selectedJob ? (
            <JobExecutionView 
              job={selectedJob} 
              onBack={() => setSelectedJob(null)} 
              onComplete={() => handleCompleteJob(selectedJob.id)}
              onEditJob={handleEditJob}
              onCancelJob={handleCancelJob}
              onUpdateStatus={handleUpdateStatus}
            />
          ) : (
            <div key="tabs" className="flex flex-col h-full">
              {activeTab === 'dashboard' && (
                <DashboardView 
                  appointments={appointments}
                  onJobClick={handleJobClick} 
                  selectedDate={selectedDate} 
                  onDateChange={setSelectedDate} 
                  onAddClick={() => setIsAddJobOpen(true)}
                  onEditJob={handleEditJob}
                  onCancelJob={handleCancelJob}
                  onCompleteJob={handleCompleteJob}
                  onCategoryClick={setCategoryDetail}
                  onUpdateStatus={handleUpdateStatus}
                  customers={customers}
                />
              )}
              {activeTab === 'schedule' && (
                <ScheduleView 
                  selectedDate={selectedDate} 
                  onDateChange={setSelectedDate} 
                  appointments={appointments}
                  onJobClick={handleJobClick}
                />
              )}
              {activeTab === 'history' && <HistoryView appointments={appointments} />}
              {activeTab === 'more' && (
                <MoreView 
                  profile={profile} 
                  team={team}
                  onLogout={() => setIsLoggedIn(false)} 
                  onOperationCenter={() => setIsOperationCenterOpen(true)}
                  onAddMember={() => setIsAddMemberOpen(true)}
                  onRemoveMember={handleRemoveMember}
                />
              )}
              {activeTab === 'notifications' && <NotificationsView notifications={notifications} setNotifications={setNotifications} />}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Team Member Modal */}
      <AnimatePresence>
        {isAddMemberOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 z-[70] flex items-end"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="w-full bg-white rounded-t-[32px] p-8 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-[#1E293B]">Adicionar Equipa</h2>
                <button onClick={() => setIsAddMemberOpen(false)} className="p-2 hover:bg-gray-50 rounded-full">
                  <X size={24} className="text-[#64748B]" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest ml-1">Nome do Funcionário</label>
                  <input 
                    className="w-full p-4 bg-[#F8FAFC] rounded-2xl border border-transparent focus:border-primary focus:outline-none" 
                    placeholder="Ex: Carlos Mendes"
                    value={newMember.name}
                    onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest ml-1">Cargo / Função</label>
                  <input 
                    className="w-full p-4 bg-[#F8FAFC] rounded-2xl border border-transparent focus:border-primary focus:outline-none" 
                    placeholder="Ex: Técnico de Limpeza"
                    value={newMember.role}
                    onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                  />
                </div>
              </div>
              <button 
                onClick={handleAddMember}
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold uppercase tracking-widest shadow-lg shadow-primary/20"
              >
                Adicionar Funcionário
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Detail View */}
      <AnimatePresence>
        {categoryDetail && (
          <CategoryDetailView 
            category={categoryDetail}
            appointments={appointments}
            onBack={() => setCategoryDetail(null)}
            onCategoryChange={setCategoryDetail}
            onJobClick={setSelectedJob}
          />
        )}
      </AnimatePresence>

      {/* Operation Center Modal */}
      <OperationCenterView 
        isOpen={isOperationCenterOpen} 
        onClose={() => setIsOperationCenterOpen(false)} 
        customers={customers}
        onAddClient={() => {
          setIsOperationCenterOpen(false);
          setIsAddCustomerOpen(true);
          setEditingCustomerId(null);
        }}
        onEditClient={handleEditCustomer}
        onDeleteClient={handleDeleteCustomer}
      />

      {/* Add Customer Modal */}
      <AnimatePresence>
        {isAddCustomerOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 z-[70] flex items-end"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="w-full bg-white rounded-t-[32px] p-8 space-y-6 max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-text-main">{editingCustomerId ? 'Editar Cliente' : 'Novo Cliente'}</h2>
                <button onClick={() => { setIsAddCustomerOpen(false); setEditingCustomerId(null); }} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={24} className="text-text-sub" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-sub uppercase tracking-widest ml-1">Nome</label>
                  <input 
                    className="w-full p-4 bg-bg-app rounded-2xl border border-transparent focus:border-primary focus:outline-none" 
                    placeholder="Ex: Maria Silva"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-sub uppercase tracking-widest ml-1">Contacto</label>
                    <input 
                      className="w-full p-4 bg-bg-app rounded-2xl border border-transparent focus:border-primary focus:outline-none" 
                      placeholder="+351 ..."
                      value={newCustomer.contact}
                      onChange={(e) => setNewCustomer({...newCustomer, contact: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-sub uppercase tracking-widest ml-1">Email</label>
                    <input 
                      className="w-full p-4 bg-bg-app rounded-2xl border border-transparent focus:border-primary focus:outline-none" 
                      placeholder="email@.."
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-sub uppercase tracking-widest ml-1">Morada</label>
                  <input 
                    className="w-full p-4 bg-bg-app rounded-2xl border border-transparent focus:border-primary focus:outline-none" 
                    placeholder="Rua ..."
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-sub uppercase tracking-widest ml-1">Distrito</label>
                    <input 
                      className="w-full p-4 bg-bg-app rounded-2xl border border-transparent focus:border-primary focus:outline-none" 
                      placeholder="Ex: Lisboa"
                      value={newCustomer.district}
                      onChange={(e) => setNewCustomer({...newCustomer, district: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-sub uppercase tracking-widest ml-1">Concelho</label>
                    <input 
                      className="w-full p-4 bg-bg-app rounded-2xl border border-transparent focus:border-primary focus:outline-none" 
                      placeholder="Ex: Oeiras"
                      value={newCustomer.municipality}
                      onChange={(e) => setNewCustomer({...newCustomer, municipality: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="flex-1 py-4 border-2 border-[#EEEEEE] rounded-2xl text-sm font-bold text-text-sub uppercase tracking-widest"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleCreateCustomer}
                  className="flex-1 py-4 bg-primary rounded-2xl text-sm font-bold text-white uppercase tracking-widest shadow-fab"
                >
                  Guardar Cliente
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Job Modal */}
      <AnimatePresence>
        {isAddJobOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 z-50 flex items-end"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="w-full bg-white rounded-t-[32px] p-8 space-y-6 max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex flex-col space-y-1 sticky top-0 bg-white pb-4 z-10">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-text-main">{editingJobId ? 'Editar agendamento' : 'Novo agendamento'}</h2>
                  <button onClick={() => { setIsAddJobOpen(false); setEditingJobId(null); }} className="p-2 hover:bg-gray-100 rounded-full">
                    <X size={24} className="text-text-sub" />
                  </button>
                </div>
                <p className="text-xs text-text-sub">Preencha os dados do cliente e do serviço. Tudo fica guardado neste dispositivo.</p>
              </div>
              
              <div className="space-y-6 pb-6">
                {/* CLIENTE SECTION */}
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">CLIENTE</p>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-sub uppercase tracking-widest ml-1">Cliente</label>
                    <div className="relative">
                      <select 
                        className="w-full p-4 bg-bg-app rounded-2xl border border-transparent focus:border-primary focus:outline-none appearance-none font-medium"
                        value={newJob.customerId}
                        onChange={(e) => handleSelectCustomer(e.target.value)}
                      >
                        <option value="">Selecione um cliente</option>
                        <option value="new">+ Criar novo cliente</option>
                        {customers.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-sub pointer-events-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-sub uppercase tracking-widest ml-1">Contacto</label>
                      <input 
                        className="w-full p-4 bg-bg-app rounded-2xl border border-transparent focus:border-primary focus:outline-none transition-all" 
                        placeholder="+351 .."
                        value={newJob.contact}
                        onChange={(e) => setNewJob({...newJob, contact: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-sub uppercase tracking-widest ml-1">Email</label>
                      <input 
                        className="w-full p-4 bg-bg-app rounded-2xl border border-transparent focus:border-primary focus:outline-none transition-all" 
                        placeholder="email@.."
                        value={newJob.email}
                        onChange={(e) => setNewJob({...newJob, email: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* LOCAL SECTION */}
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">LOCAL</p>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-sub uppercase tracking-widest ml-1">Morada / endereço</label>
                    <input 
                      className="w-full p-4 bg-bg-app rounded-2xl border border-transparent focus:border-primary focus:outline-none transition-all" 
                      placeholder="rua teste 123"
                      value={newJob.address}
                      onChange={(e) => setNewJob({...newJob, address: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-sub uppercase tracking-widest ml-1">Distrito</label>
                      <input 
                        className="w-full p-4 bg-bg-app rounded-2xl border border-transparent focus:border-primary focus:outline-none transition-all" 
                        placeholder="Ex: Lisboa"
                        value={newJob.district}
                        onChange={(e) => setNewJob({...newJob, district: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-sub uppercase tracking-widest ml-1">Concelho</label>
                      <input 
                        className="w-full p-4 bg-bg-app rounded-2xl border border-transparent focus:border-primary focus:outline-none transition-all" 
                        placeholder="Ex: Oeiras"
                        value={newJob.municipality}
                        onChange={(e) => setNewJob({...newJob, municipality: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* SERVIÇO SECTION */}
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">SERVIÇO</p>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-sub uppercase tracking-widest ml-1">Tipologia do espaço</label>
                    <div className="relative">
                      <select 
                        className="w-full p-4 bg-bg-app rounded-2xl border border-transparent focus:border-primary focus:outline-none appearance-none"
                        value={newJob.typology}
                        onChange={(e) => setNewJob({...newJob, typology: e.target.value})}
                      >
                        <option>T0</option>
                        <option>T1</option>
                        <option>T2</option>
                        <option>T3</option>
                        <option>T4</option>
                        <option>T5+</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-sub pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-sub uppercase tracking-widest ml-1">Tipo de serviço</label>
                    <div className="relative">
                      <select 
                        className="w-full p-4 bg-bg-app rounded-2xl border border-transparent focus:border-primary focus:outline-none appearance-none"
                        value={newJob.serviceType}
                        onChange={(e) => setNewJob({...newJob, serviceType: e.target.value})}
                      >
                        <option>Limpeza padrão</option>
                        <option>Limpeza profunda</option>
                        <option>Limpeza pós-obra</option>
                        <option>Limpeza de vidros</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-sub pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-sub uppercase tracking-widest ml-1">Características do local</label>
                    <div className="relative">
                      <select 
                        className="w-full p-4 bg-bg-app rounded-2xl border border-transparent focus:border-primary focus:outline-none appearance-none"
                        value={newJob.isSpecial}
                        onChange={(e) => setNewJob({...newJob, isSpecial: e.target.value})}
                      >
                        <option>Standard (sem particularidades)</option>
                        <option>Escadas</option>
                        <option>Pós-Obra</option>
                        <option>Ambos</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-sub pointer-events-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-sub uppercase tracking-widest ml-1">Data</label>
                      <input 
                        type="date"
                        className="w-full p-4 bg-bg-app rounded-2xl border border-transparent focus:border-primary focus:outline-none transition-all" 
                        value={newJob.date}
                        onChange={(e) => setNewJob({...newJob, date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-text-sub uppercase tracking-widest ml-1">Hora</label>
                      <input 
                        type="time"
                        className="w-full p-4 bg-bg-app rounded-2xl border border-transparent focus:border-primary focus:outline-none transition-all" 
                        value={newJob.time}
                        onChange={(e) => setNewJob({...newJob, time: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-sub uppercase tracking-widest ml-1">Preço acordado (€)</label>
                    <input 
                      type="number"
                      className="w-full p-4 bg-bg-app rounded-2xl border border-transparent focus:border-primary focus:outline-none transition-all" 
                      placeholder="0,00"
                      value={newJob.price}
                      onChange={(e) => setNewJob({...newJob, price: Number(e.target.value)})}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-sub uppercase tracking-widest ml-1">Comentários</label>
                    <textarea 
                      className="w-full p-4 bg-bg-app rounded-2xl border border-transparent focus:border-primary focus:outline-none transition-all min-h-[100px]" 
                      placeholder="Acesso, código porta, animais, produtos preferidos..."
                      value={newJob.comment}
                      onChange={(e) => setNewJob({...newJob, comment: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-4">
                <button 
                  onClick={() => { setIsAddJobOpen(false); setEditingJobId(null); }}
                  className="flex-1 py-4 border-2 border-[#EEEEEE] rounded-2xl text-sm font-bold text-text-sub uppercase tracking-widest"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleCreateJob}
                  className="flex-1 py-4 bg-primary rounded-2xl text-sm font-bold text-white uppercase tracking-widest shadow-fab"
                >
                  {editingJobId ? 'Atualizar' : 'Guardar agendamento'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation (Fixed) */}
      {!selectedJob && (
        <nav className="absolute bottom-0 left-0 right-0 h-20 bg-white border-t border-[#F5F7FA] flex items-center justify-around px-2 z-30 pb-2">
          <NavButton 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
            icon={<LayoutGrid size={24} />} 
            label="Painel" 
          />
          <NavButton 
            active={activeTab === 'schedule'} 
            onClick={() => setActiveTab('schedule')} 
            icon={<CalendarIcon size={24} />} 
            label="Agenda" 
          />
          
          <div className="relative -top-6">
            <button 
              onClick={() => setIsAddJobOpen(true)}
              className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/30 active:scale-90 transition-transform"
            >
              <Plus size={32} />
            </button>
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-text-sub uppercase tracking-widest">Agendar</span>
          </div>

          <NavButton 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')} 
            icon={<History size={24} />} 
            label="Histórico" 
          />
          <NavButton 
            active={activeTab === 'more'} 
            onClick={() => setActiveTab('more')} 
            icon={<Menu size={24} />} 
            label="Mais" 
          />
        </nav>
      )}
    </div>
  );
}

// --- Sub-Views ---

function WeeklyCalendar({ selectedDate, onDateChange }: { selectedDate: string; onDateChange: (d: string) => void }) {
  const [baseDate, setBaseDate] = useState(new Date(selectedDate));

  const weekDays = useMemo(() => {
    const days = [];
    const startOfWeek = new Date(baseDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  }, [baseDate]);

  const navigateWeek = (direction: number) => {
    const newDate = new Date(baseDate);
    newDate.setDate(baseDate.getDate() + (direction * 7));
    setBaseDate(newDate);
  };

  const dayNames = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];

  return (
    <div className="bg-white p-4 rounded-[32px] shadow-sm border border-[#F1F5F9] mx-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigateWeek(-1)} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
          <ChevronLeft size={20} className="text-[#64748B]" />
        </button>
        <div className="w-8 h-1 bg-[#E2E8F0] rounded-full" />
        <button onClick={() => navigateWeek(1)} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
          <ChevronRight size={20} className="text-[#64748B]" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((date, i) => {
          const dateStr = getLocalDateString(date);
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === getLocalDateString();
          
          return (
            <button
              key={i}
              onClick={() => onDateChange(dateStr)}
              className="flex flex-col items-center gap-2 py-2 group"
            >
              <span className={`text-[10px] font-bold tracking-widest ${isSelected ? 'text-primary' : 'text-[#94A3B8]'}`}>
                {dayNames[i]}
              </span>
              <div className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-bold transition-all ${
                isSelected 
                  ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                  : isToday 
                    ? 'bg-[#1E293B] text-white' 
                    : 'text-[#1E293B] hover:bg-gray-50'
              }`}>
                {date.getDate()}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DashboardView({ appointments, onJobClick, selectedDate, onDateChange, onAddClick, onEditJob, onCancelJob, onCompleteJob, onCategoryClick, onUpdateStatus, customers }: { 
  appointments: Appointment[]; 
  onJobClick: (job: Appointment) => void; 
  selectedDate: string; 
  onDateChange: (d: string) => void; 
  onAddClick: () => void;
  onEditJob: (job: Appointment) => void;
  onCancelJob: (id: string) => void;
  onCompleteJob: (id: string) => void;
  onCategoryClick: (cat: string) => void;
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
  customers: Customer[];
}) {
  const [activeSubTab, setActiveSubTab] = useState('Agendamento');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showStatusMenu, setShowStatusMenu] = useState<string | null>(null);

  const stats = useMemo(() => {
    const today = getLocalDateString();
    const todayJobs = appointments.filter(a => a.date === today);
    const completedJobs = appointments.filter(a => a.status === 'Concluído');
    const inProgressJobs = appointments.filter(a => a.status === 'Em Curso' || a.status === 'A Caminho');
    
    return {
      todayCount: todayJobs.length,
      weekEarnings: appointments.reduce((acc, curr) => acc + curr.price, 0),
      rating: 0.0,
      budgets: 0,
      inProgress: inProgressJobs.length,
      completed: completedJobs.length
    };
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => a.date === selectedDate);
  }, [appointments, selectedDate]);

  const statusOptions: AppointmentStatus[] = [
    'Confirmado', 'A Caminho', 'Em Curso', 'Pendente', 'Concluído', 'Pago', 'Já está limpo', 'Precisa de limpeza'
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full bg-[#F8FAFC]"
    >
      {/* Weekly Calendar Header */}
      <WeeklyCalendar selectedDate={selectedDate} onDateChange={onDateChange} />

      <div className="p-4 space-y-4 overflow-y-auto no-scrollbar pb-24">
        {/* Top Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-[24px] shadow-sm border border-[#F1F5F9] text-center flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1">HOJE</span>
            <span className="text-2xl font-bold text-primary">{stats.todayCount}</span>
            <span className="text-[10px] font-medium text-[#94A3B8] mt-1">serviços</span>
          </div>
          <div className="bg-white p-4 rounded-[24px] shadow-sm border border-[#F1F5F9] text-center flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1">SEMANA</span>
            <span className="text-2xl font-bold text-success">€{stats.weekEarnings}</span>
            <span className="text-[10px] font-medium text-[#94A3B8] mt-1">esta semana</span>
          </div>
          <div className="bg-white p-4 rounded-[24px] shadow-sm border border-[#F1F5F9] text-center flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1">AVALIAÇÃO</span>
            <span className="text-2xl font-bold text-warning">{stats.rating.toFixed(1)}</span>
            <span className="text-[10px] font-medium text-[#94A3B8] mt-1">média</span>
          </div>
        </div>

        {/* Middle Stats */}
        <div className="bg-white p-4 rounded-[24px] shadow-sm border border-[#F1F5F9] grid grid-cols-3 gap-2">
          <button 
            onClick={() => onCategoryClick('Orçamentos')}
            className="text-center py-2 active:bg-gray-50 rounded-xl transition-colors"
          >
            <p className="text-xl font-bold text-[#1E293B]">{stats.budgets}</p>
            <p className="text-[8px] font-bold text-[#94A3B8] uppercase tracking-widest">ORÇAMENTOS</p>
          </button>
          <button 
            onClick={() => onCategoryClick('Em Curso')}
            className="text-center py-2 border-x border-[#F1F5F9] active:bg-gray-50 rounded-xl transition-colors"
          >
            <p className="text-xl font-bold text-[#1E293B]">{stats.inProgress}</p>
            <p className="text-[8px] font-bold text-[#94A3B8] uppercase tracking-widest">EM CURSO</p>
          </button>
          <button 
            onClick={() => onCategoryClick('Concluídos')}
            className="text-center py-2 active:bg-gray-50 rounded-xl transition-colors"
          >
            <p className="text-xl font-bold text-[#1E293B]">{stats.completed}</p>
            <p className="text-[8px] font-bold text-[#94A3B8] uppercase tracking-widest">CONCLUÍDOS</p>
          </button>
        </div>

        {/* Sub Tabs */}
        <div className="bg-white p-1.5 rounded-[20px] shadow-sm border border-[#F1F5F9] flex gap-1">
          {['Agendamento', 'Rastreio', 'Ganhos'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`flex-1 py-3 rounded-[16px] text-xs font-bold transition-all ${
                activeSubTab === tab 
                  ? 'bg-primary text-white shadow-md shadow-primary/20' 
                  : 'text-[#64748B] hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content based on Sub Tab */}
        {activeSubTab === 'Agendamento' && (
          <div className="space-y-3">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map(job => (
                <div key={job.id} className="relative">
                  <div 
                    onClick={() => onJobClick(job)}
                    className="bg-white p-4 rounded-[24px] shadow-sm border border-[#F1F5F9] flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <img src={job.customerPhoto} alt="" className="w-12 h-12 rounded-xl shadow-sm" referrerPolicy="no-referrer" />
                    <div className="flex-1">
                      <h4 className="font-bold text-[#1E293B]">{job.customerName}</h4>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{job.serviceType}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${
                          job.status === 'Concluído' ? 'bg-success/10 text-success' : 
                          job.status === 'Pago' ? 'bg-blue-100 text-blue-600' :
                          job.status === 'Em Curso' ? 'bg-warning/10 text-warning' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#1E293B]">{job.startTime}</p>
                      <p className="text-[10px] font-bold text-success">€{job.price}</p>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === job.id ? null : job.id);
                        setShowStatusMenu(null);
                      }}
                      className="p-2 text-[#CBD5E1] hover:text-primary transition-colors"
                    >
                      <MoreVertical size={20} />
                    </button>
                  </div>

                  {/* Job Menu */}
                  <AnimatePresence>
                    {openMenuId === job.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute right-4 top-16 bg-white rounded-2xl shadow-2xl border border-[#F1F5F9] z-50 py-2 min-w-[180px]"
                        >
                          <button 
                            onClick={(e) => { e.stopPropagation(); onEditJob(job); setOpenMenuId(null); }}
                            className="w-full px-4 py-3 text-left text-xs font-bold text-[#1E293B] hover:bg-gray-50 flex items-center gap-3"
                          >
                            Editar
                          </button>
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setShowStatusMenu(job.id);
                            }}
                            className="w-full px-4 py-3 text-left text-xs font-bold text-primary hover:bg-gray-50 flex items-center justify-between"
                          >
                            Status
                            <ChevronRight size={14} />
                          </button>
                          
                          {showStatusMenu === job.id && (
                            <motion.div 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="absolute right-full top-0 mr-2 bg-white rounded-2xl shadow-2xl border border-[#F1F5F9] py-2 min-w-[160px]"
                            >
                              {statusOptions.map(status => (
                                <button
                                  key={status}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onUpdateStatus(job.id, status);
                                    setOpenMenuId(null);
                                    setShowStatusMenu(null);
                                  }}
                                  className={`w-full px-4 py-2.5 text-left text-[10px] font-bold hover:bg-gray-50 ${
                                    job.status === status ? 'text-primary bg-primary/5' : 'text-[#64748B]'
                                  }`}
                                >
                                  {status}
                                </button>
                              ))}
                            </motion.div>
                          )}

                          <button 
                            onClick={(e) => { e.stopPropagation(); onCompleteJob(job.id); setOpenMenuId(null); }}
                            className="w-full px-4 py-3 text-left text-xs font-bold text-success hover:bg-gray-50 flex items-center gap-3"
                          >
                            Finalizar
                          </button>
                          <div className="h-px bg-[#F1F5F9] mx-2 my-1" />
                          <button 
                            onClick={(e) => { e.stopPropagation(); onCancelJob(job.id); setOpenMenuId(null); }}
                            className="w-full px-4 py-3 text-left text-xs font-bold text-red-500 hover:bg-gray-50 flex items-center gap-3"
                          >
                            Cancelar
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ))
            ) : (
              <div className="py-10 text-center space-y-2">
                <p className="text-sm font-medium text-[#94A3B8]">
                  Sem serviços agendados para este dia.
                </p>
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'Rastreio' && (
          <div className="space-y-4">
            <div className="bg-[#EBF3FF] rounded-[24px] p-1 border border-[#D0E4FF] overflow-hidden">
              <div className="aspect-[4/3] bg-[#F1F5F9] rounded-[20px] relative overflow-hidden">
                {/* Simulated Map Background */}
                <div className="absolute inset-0 opacity-20" style={{ 
                  backgroundImage: 'linear-gradient(#4A90E2 1px, transparent 1px), linear-gradient(90deg, #4A90E2 1px, transparent 1px)',
                  backgroundSize: '40px 40px'
                }} />
                
                {/* Current Location Marker */}
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                >
                  <div className="w-6 h-6 bg-primary rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap bg-primary text-white text-[8px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    A sua localização
                  </div>
                </motion.div>

                {/* Scheduled Houses Markers */}
                {appointments.filter(a => a.date === getLocalDateString()).map((app, i) => (
                  <div 
                    key={app.id}
                    className="absolute"
                    style={{ 
                      top: `${20 + (i * 25)}%`, 
                      left: `${30 + (i * 35)}%` 
                    }}
                  >
                    <div className="w-5 h-5 bg-white rounded-full border-2 border-success shadow-md flex items-center justify-center">
                      <MapPin size={10} className="text-success" />
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap bg-white text-[#1E293B] text-[7px] font-bold px-1.5 py-0.5 rounded-md shadow-sm border border-[#F1F5F9]">
                      {app.customerName}
                    </div>
                  </div>
                ))}

                {/* Registered Customers Markers */}
                {customers.slice(0, 3).map((cust, i) => (
                  <div 
                    key={cust.id}
                    className="absolute opacity-50"
                    style={{ 
                      bottom: `${15 + (i * 20)}%`, 
                      right: `${10 + (i * 20)}%` 
                    }}
                  >
                    <div className="w-4 h-4 bg-white rounded-full border border-[#CBD5E1] shadow-sm flex items-center justify-center">
                      <MapPin size={8} className="text-[#94A3B8]" />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-[#64748B] p-3 text-center font-medium">
                Mapa em tempo real: <span className="text-primary font-bold">Localização atual</span> e <span className="text-success font-bold">serviços agendados</span>.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-8 rounded-[24px] shadow-sm border border-[#F1F5F9] text-center">
                <span className="text-sm font-medium text-[#94A3B8]">Antes</span>
              </div>
              <div className="bg-white p-8 rounded-[24px] shadow-sm border border-[#F1F5F9] text-center">
                <span className="text-sm font-medium text-[#94A3B8]">Depois</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-[24px] shadow-sm border border-[#F1F5F9] flex items-center gap-4">
              <div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center text-[#94A3B8]">
                <Minus size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1E293B]">Sem equipa em campo</h4>
                <p className="text-[10px] text-[#64748B]">Os detalhes aparecem quando atribuir trabalhos</p>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'Ganhos' && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-[#FFFBEB] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-warning/5 rounded-full -mr-8 -mt-8" />
              <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">EM AGENDAMENTO</span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-[#1E293B]">0,00 €</span>
              </div>
              <p className="text-[10px] text-[#64748B] mt-1">Serviços ainda não finalizados</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#F0FDF4] p-5 rounded-[24px] border border-[#DCFCE7]">
                <span className="text-[10px] font-bold text-[#166534] uppercase tracking-widest">FINALIZADOS E PAGOS</span>
                <p className="text-xl font-bold text-[#166534] mt-1">0,00 €</p>
              </div>
              <div className="bg-white p-5 rounded-[24px] border border-[#FEF3C7]">
                <span className="text-[10px] font-bold text-[#92400E] uppercase tracking-widest">A RECEBER</span>
                <p className="text-xl font-bold text-[#D97706] mt-1">0,00 €</p>
                <p className="text-[8px] text-[#92400E] mt-0.5">Realizados, pagamento em falta</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-[#F1F5F9]">
              <h4 className="text-sm font-bold text-[#1E293B]">Por dia da semana</h4>
              <p className="text-[10px] text-[#64748B] mt-1">Os valores preenchem quando registar faturação real.</p>
              
              <div className="mt-12 flex justify-between items-end h-24 px-2">
                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => (
                  <div key={day} className="flex flex-col items-center gap-2">
                    <div className="w-1.5 h-1 bg-[#F1F5F9] rounded-full" />
                    <span className="text-[10px] text-[#94A3B8]">{day}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-5 rounded-[24px] border border-[#F1F5F9]">
                <p className="text-2xl font-bold text-[#1E293B]">0</p>
                <p className="text-[10px] text-[#64748B]">trabalhos</p>
              </div>
              <div className="bg-white p-5 rounded-[24px] border border-[#F1F5F9]">
                <p className="text-2xl font-bold text-[#1E293B]">--</p>
                <p className="text-[10px] text-[#64748B]">tempo médio</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-[#F1F5F9] space-y-4">
              <h4 className="text-sm font-bold text-[#1E293B]">Serviços principais</h4>
              <p className="text-[10px] text-[#64748B]">Distribuição por tipo quando tiver histórico de serviços.</p>
              
              <div className="space-y-4">
                {['Residencial', 'Escritórios', 'Pós-obra'].map(type => (
                  <div key={type} className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold text-[#64748B]">
                      <span>{type}</span>
                      <span>--</span>
                    </div>
                    <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div className="h-full bg-primary/20 w-0" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function CategoryDetailView({ category, appointments, onBack, onCategoryChange, onJobClick }: { 
  category: string; 
  appointments: Appointment[]; 
  onBack: () => void;
  onCategoryChange: (cat: string) => void;
  onJobClick: (job: Appointment) => void;
}) {
  const filteredJobs = useMemo(() => {
    if (category === 'Orçamentos') return appointments.filter(a => a.status === 'Pendente');
    if (category === 'Em Curso') return appointments.filter(a => a.status === 'A Caminho' || a.status === 'Em Curso');
    if (category === 'Concluídos') return appointments.filter(a => a.status === 'Concluído');
    return [];
  }, [appointments, category]);

  return (
    <motion.div 
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      className="absolute inset-0 bg-bg-app z-[60] flex flex-col"
    >
      <header className="bg-white px-6 py-4 flex items-center gap-4 border-b border-[#F1F5F9]">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-text-main" />
        </button>
        <h2 className="text-lg font-bold text-text-main">{category}</h2>
      </header>

      <div className="p-4 bg-white border-b border-[#F1F5F9] flex gap-2">
        {['Orçamentos', 'Em Curso', 'Concluídos'].map(cat => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
              category === cat 
                ? 'bg-primary text-white shadow-md shadow-primary/20' 
                : 'bg-bg-app text-text-sub hover:bg-gray-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
        {filteredJobs.length > 0 ? (
          filteredJobs.map(job => (
            <div 
              key={job.id}
              onClick={() => onJobClick(job)}
              className="bg-white p-4 rounded-[24px] shadow-sm border border-[#F1F5F9] flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer"
            >
              <img src={job.customerPhoto} alt="" className="w-12 h-12 rounded-xl shadow-sm" referrerPolicy="no-referrer" />
              <div className="flex-1">
                <h4 className="font-bold text-[#1E293B]">{job.customerName}</h4>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{job.serviceType}</p>
                <p className="text-[10px] text-text-sub mt-0.5">{job.date} • {job.startTime}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-success">€{job.price}</p>
                <div className={`mt-1 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase inline-block ${
                  job.status === 'Concluído' ? 'bg-success/10 text-success' :
                  job.status === 'Pendente' ? 'bg-warning/10 text-warning' :
                  'bg-primary/10 text-primary'
                }`}>
                  {job.status}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-[#F1F5F9]">
              <LayoutGrid size={32} className="text-[#CBD5E1]" />
            </div>
            <p className="text-sm font-medium text-[#94A3B8]">
              Nenhum trabalho encontrado nesta categoria.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function OperationCenterView({ isOpen, onClose, customers, onAddClient, onEditClient, onDeleteClient }: { 
  isOpen: boolean; 
  onClose: () => void; 
  customers: Customer[];
  onAddClient: () => void;
  onEditClient: (customer: Customer) => void;
  onDeleteClient: (id: string) => void;
}) {
  const [activeTab, setActiveTab] = useState('Clientes');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute inset-0 bg-white z-[60] flex flex-col"
        >
          <div className="p-6 pt-10 flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-text-sub uppercase tracking-[0.2em] mb-1">GESTÃO</p>
              <h2 className="text-2xl font-extrabold text-[#1A1A1A]">Centro de operação</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={24} className="text-text-sub" />
            </button>
          </div>

          <div className="px-6 flex gap-3 overflow-x-auto no-scrollbar pb-6 border-b border-[#F5F5F5]">
            {['Clientes', 'Stock', 'Metas', 'Dicas'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === tab 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'bg-[#F0F2F5] text-text-sub'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'Clientes' && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-text-sub">
                    Clientes e locais de serviço — dados guardados neste dispositivo.
                  </p>
                </div>

                {customers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <p className="text-sm font-medium text-text-sub opacity-60">
                      Nenhum cliente registado.
                    </p>
                    <button 
                      onClick={onAddClient}
                      className="px-6 py-3 bg-primary/10 text-primary rounded-2xl text-sm font-bold uppercase tracking-wider"
                    >
                      Criar Primeiro Cliente
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {customers.map((customer, idx) => (
                      <div key={idx} className="relative">
                        <div className="p-4 bg-white border border-[#EEEEEE] rounded-2xl shadow-sm flex items-center gap-4">
                          <img src={customer.photo} alt="" className="w-12 h-12 rounded-xl shadow-sm" referrerPolicy="no-referrer" />
                          <div className="flex-1">
                            <h3 className="font-bold text-text-main">{customer.name}</h3>
                            <p className="text-xs text-text-sub">{customer.contact || 'Sem contacto'}</p>
                          </div>
                          <button 
                            onClick={() => setOpenMenuId(openMenuId === customer.id ? null : customer.id)}
                            className="p-2 text-[#CCCCCC] hover:text-primary transition-colors"
                          >
                            <MoreVertical size={20} />
                          </button>
                        </div>

                        <AnimatePresence>
                          {openMenuId === customer.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute right-4 top-16 bg-white rounded-2xl shadow-2xl border border-[#F1F5F9] z-50 py-2 min-w-[160px]"
                              >
                                <button 
                                  onClick={() => { onEditClient(customer); setOpenMenuId(null); }}
                                  className="w-full px-4 py-3 text-left text-xs font-bold text-[#1E293B] hover:bg-gray-50 flex items-center gap-3"
                                >
                                  Editar
                                </button>
                                <div className="h-px bg-[#F1F5F9] mx-2 my-1" />
                                <button 
                                  onClick={() => { onDeleteClient(customer.id); setOpenMenuId(null); }}
                                  className="w-full px-4 py-3 text-left text-xs font-bold text-red-500 hover:bg-gray-50 flex items-center gap-3"
                                >
                                  Eliminar
                                </button>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                    <button 
                      onClick={onAddClient}
                      className="w-full py-4 border-2 border-dashed border-[#EEEEEE] rounded-2xl flex items-center justify-center gap-2 text-text-sub hover:border-primary hover:text-primary transition-all"
                    >
                      <Plus size={20} />
                      <span className="text-sm font-bold uppercase tracking-widest">Novo Cliente</span>
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {activeTab !== 'Clientes' && (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                <p className="text-sm font-bold uppercase tracking-widest">Em breve</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function JobExecutionView({ job, onBack, onComplete, onEditJob, onCancelJob, onUpdateStatus }: { 
  job: Appointment; 
  onBack: () => void; 
  onComplete: () => void;
  onEditJob: (job: Appointment) => void;
  onCancelJob: (id: string) => void;
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const completedCount = job.checklist.filter(t => t.completed).length;
  const progress = job.checklist.length > 0 ? Math.round((completedCount / job.checklist.length) * 100) : 0;

  const statusOptions: AppointmentStatus[] = [
    'Confirmado', 'A Caminho', 'Em Curso', 'Pendente', 'Concluído', 'Pago', 'Já está limpo', 'Precisa de limpeza'
  ];

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="bg-white h-full flex flex-col relative"
    >
      <header className="px-6 h-20 flex items-end pb-4 border-b border-[#EEEEEE] relative">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors">
          <ChevronRight className="rotate-180 text-text-sub" size={24} />
        </button>
        <h1 className="flex-1 text-center text-xs font-bold uppercase tracking-widest text-text-sub mb-2">
          {job.status === 'Concluído' ? 'Trabalho Concluído' : 'Execução do Trabalho'}
        </h1>
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-gray-50 rounded-full transition-colors text-text-sub"
          >
            <MoreVertical size={24} />
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-12 bg-white rounded-2xl shadow-2xl border border-[#F1F5F9] z-50 py-2 min-w-[180px]"
                >
                  <button 
                    onClick={() => { onEditJob(job); setIsMenuOpen(false); }}
                    className="w-full px-4 py-3 text-left text-xs font-bold text-[#1E293B] hover:bg-gray-50"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => setShowStatusMenu(!showStatusMenu)}
                    className="w-full px-4 py-3 text-left text-xs font-bold text-primary hover:bg-gray-50 flex items-center justify-between"
                  >
                    Status
                    <ChevronRight size={14} />
                  </button>
                  
                  {showStatusMenu && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute right-full top-0 mr-2 bg-white rounded-2xl shadow-2xl border border-[#F1F5F9] py-2 min-w-[160px]"
                    >
                      {statusOptions.map(status => (
                        <button
                          key={status}
                          onClick={() => {
                            onUpdateStatus(job.id, status);
                            setIsMenuOpen(false);
                            setShowStatusMenu(false);
                          }}
                          className={`w-full px-4 py-2.5 text-left text-[10px] font-bold hover:bg-gray-50 ${
                            job.status === status ? 'text-primary bg-primary/5' : 'text-[#64748B]'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </motion.div>
                  )}

                  <button 
                    onClick={() => { onComplete(); setIsMenuOpen(false); }}
                    className="w-full px-4 py-3 text-left text-xs font-bold text-success hover:bg-gray-50"
                  >
                    Finalizar
                  </button>
                  <div className="h-px bg-[#F1F5F9] mx-2 my-1" />
                  <button 
                    onClick={() => { onCancelJob(job.id); setIsMenuOpen(false); onBack(); }}
                    className="w-full px-4 py-3 text-left text-xs font-bold text-red-500 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="bg-bg-app rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-text-sub">
            <CalendarIcon size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">29 Ago 2024</span>
          </div>
          <div className="flex items-center gap-2 text-success">
            <Play size={14} fill="currentColor" />
            <span className="text-xs font-bold uppercase tracking-wider">1h 20min restantes</span>
          </div>
        </div>

        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <img src={job.customerPhoto} alt="" className="w-14 h-14 rounded-2xl shadow-sm" referrerPolicy="no-referrer" />
            <div>
              <h2 className="text-xl font-bold text-text-main">{job.customerName}</h2>
              <p className="text-xs font-medium text-text-sub">Proprietário</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-primary">€{job.price.toFixed(2)}</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-text-sub opacity-50 uppercase tracking-widest">Endereço</p>
            <p className="text-sm font-medium text-text-main">{job.address}, {job.city}</p>
            <button className="flex items-center gap-1 text-primary text-[10px] font-bold uppercase tracking-wider pt-1">
              <MapIcon size={12} />
              Abrir no Mapa
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-text-sub opacity-50 uppercase tracking-widest">Contacto</p>
              <p className="text-sm font-medium text-text-main">{job.contact || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-text-sub opacity-50 uppercase tracking-widest">Tipologia</p>
              <p className="text-sm font-medium text-text-main">{job.typology || 'N/A'}</p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-bold text-text-sub opacity-50 uppercase tracking-widest">Serviço Especial</p>
            <p className="text-sm font-medium text-text-main">{job.isSpecial || 'Não'}</p>
          </div>

          {job.comment && (
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-text-sub opacity-50 uppercase tracking-widest">Comentário</p>
              <p className="text-sm font-medium text-text-main italic">"{job.comment}"</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-white border border-[#EEEEEE] rounded-card shadow-card">
            <div className="flex items-center gap-3">
              <ListTodo size={18} className="text-primary" />
              <span className="text-xs font-bold text-text-main">Checklist de Tarefas</span>
            </div>
            <span className={`text-xs font-bold ${progress === 100 ? 'text-success' : 'text-primary'}`}>{progress}%</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-white border border-[#EEEEEE] rounded-card shadow-card">
            <div className="flex items-center gap-3">
              <Info size={18} className="text-text-sub" />
              <span className="text-xs font-bold text-text-main">Informação da Propriedade</span>
            </div>
            <ChevronRight size={16} className="text-[#CCCCCC]" />
          </div>

          <div className="flex items-center justify-between p-4 bg-white border border-[#EEEEEE] rounded-card shadow-card">
            <div className="flex items-center gap-3">
              <Camera size={18} className="text-text-sub" />
              <span className="text-xs font-bold text-text-main">Fotos Antes</span>
            </div>
            <button className="p-2 bg-bg-app rounded-lg">
              <Camera size={16} className="text-text-sub" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white border-t border-[#EEEEEE]">
        <button 
          onClick={onComplete}
          className="w-full py-4 bg-primary rounded-2xl text-sm font-bold text-white uppercase tracking-widest shadow-fab active:scale-95 transition-transform"
        >
          Concluir Trabalho
        </button>
      </div>
    </motion.div>
  );
}

function HistoryView({ appointments }: { appointments: Appointment[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<AppointmentStatus | 'Todos'>('Todos');

  const filteredHistory = useMemo(() => {
    return appointments.filter(job => {
      const matchesSearch = job.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           job.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'Todos' || job.status === filterStatus;
      return matchesSearch && matchesFilter;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [appointments, searchTerm, filterStatus]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full bg-[#F8FAFC]"
    >
      <div className="p-5 space-y-6 overflow-y-auto no-scrollbar pb-24">
        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input 
              type="text"
              placeholder="Pesquisar por cliente ou serviço..."
              className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-[#F1F5F9] shadow-sm focus:outline-none focus:border-primary text-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {['Todos', 'Concluído', 'Pago', 'Pendente', 'Cancelado'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={`px-4 py-2 rounded-full text-[10px] font-bold whitespace-nowrap transition-all ${
                  filterStatus === status 
                    ? 'bg-primary text-white shadow-md shadow-primary/20' 
                    : 'bg-white text-[#64748B] border border-[#F1F5F9]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* History List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[1.5px]">Registos Detalhados</h2>
            <span className="text-[10px] font-bold text-primary uppercase">{filteredHistory.length} serviços</span>
          </div>
          
          <div className="space-y-3">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((job) => (
                <div key={job.id} className="bg-white rounded-[28px] p-5 shadow-sm border border-[#F1F5F9] space-y-4 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={job.customerPhoto} alt="" className="w-10 h-10 rounded-xl" referrerPolicy="no-referrer" />
                      <div>
                        <h4 className="text-sm font-bold text-[#1E293B]">{job.customerName}</h4>
                        <p className="text-[10px] font-medium text-[#64748B]">{new Date(job.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase ${
                      job.status === 'Concluído' ? 'bg-success/10 text-success' : 
                      job.status === 'Pago' ? 'bg-blue-100 text-blue-600' :
                      job.status === 'Cancelado' ? 'bg-red-100 text-red-500' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {job.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-3 border-y border-[#F8FAFC]">
                    <div className="space-y-1">
                      <p className="text-[8px] font-bold text-[#94A3B8] uppercase tracking-widest">Serviço</p>
                      <p className="text-xs font-bold text-[#1E293B]">{job.serviceType}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[8px] font-bold text-[#94A3B8] uppercase tracking-widest">Valor</p>
                      <p className="text-xs font-bold text-success">€{job.price.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2 text-[#64748B]">
                      <Clock size={14} />
                      <span className="text-[10px] font-bold">{job.startTime} - {job.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#64748B]">
                      <MapPin size={14} />
                      <span className="text-[10px] font-bold">{job.city}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center">
                <p className="text-sm font-medium text-[#94A3B8]">Nenhum registo encontrado.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ScheduleView({ selectedDate, onDateChange, appointments, onJobClick }: { 
  selectedDate: string; 
  onDateChange: (d: string) => void;
  appointments: Appointment[];
  onJobClick: (job: Appointment) => void;
}) {
  const currentMonth = new Date().toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
  
  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => a.date === selectedDate);
  }, [appointments, selectedDate]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full bg-[#F8FAFC]"
    >
      <div className="p-5 space-y-6 flex flex-col h-full overflow-y-auto no-scrollbar pb-24">
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-[#F1F5F9]">
          <div className="flex items-center justify-between mb-6 px-2">
            <button className="p-2 hover:bg-gray-50 rounded-full transition-colors">
              <ChevronLeft size={20} className="text-[#64748B]" />
            </button>
            <p className="text-base font-bold text-[#1E293B] capitalize">{currentMonth}</p>
            <button className="p-2 hover:bg-gray-50 rounded-full transition-colors">
              <ChevronRight size={20} className="text-[#64748B]" />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center mb-4">
            {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map(d => (
              <span key={d} className="text-[10px] font-bold text-[#94A3B8] tracking-widest">{d}</span>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2 text-center">
            {Array.from({ length: 31 }).map((_, i) => {
              const dayNum = i + 1;
              const d = new Date();
              d.setDate(dayNum);
              const fullDate = getLocalDateString(d);
              const isSelected = fullDate === selectedDate;
              const isToday = fullDate === getLocalDateString();
              
              return (
                <button 
                  key={i} 
                  onClick={() => onDateChange(fullDate)}
                  className={`aspect-square flex flex-col items-center justify-center rounded-2xl text-xs font-bold transition-all relative ${
                    isSelected 
                      ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                      : isToday 
                        ? 'bg-[#1E293B] text-white' 
                        : 'text-[#1E293B] hover:bg-gray-50'
                  }`}
                >
                  {dayNum}
                  {appointments.some(a => a.date === fullDate) && !isSelected && (
                    <div className={`w-1 h-1 rounded-full absolute bottom-1.5 ${isToday ? 'bg-white' : 'bg-primary'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Appointments */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-[1.5px]">
              {new Date(selectedDate).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' })}
            </h3>
            <span className="text-[10px] font-bold text-primary uppercase">{filteredAppointments.length} serviços</span>
          </div>

          <div className="space-y-3">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map(job => (
                <div 
                  key={job.id}
                  onClick={() => onJobClick(job)}
                  className="bg-white p-4 rounded-[24px] shadow-sm border border-[#F1F5F9] flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden">
                    <img src={job.customerPhoto} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-[#1E293B]">{job.customerName}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{job.serviceType}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${
                        job.status === 'Concluído' ? 'bg-success/10 text-success' : 
                        job.status === 'Pago' ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#1E293B]">{job.startTime}</p>
                    <p className="text-[10px] font-bold text-[#94A3B8]">{job.city}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white p-10 rounded-[32px] border border-[#F1F5F9] text-center space-y-2">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto text-[#CBD5E1]">
                  <CalendarIcon size={24} />
                </div>
                <p className="text-xs font-bold text-[#94A3B8]">Nenhum serviço agendado.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MoreView({ profile, team, onLogout, onOperationCenter, onAddMember, onRemoveMember }: { 
  profile: ProfileData; 
  team: TeamMember[];
  onLogout: () => void; 
  onOperationCenter: () => void;
  onAddMember: () => void;
  onRemoveMember: (id: string) => void;
}) {
  const [activeSubView, setActiveSubView] = useState<'main' | 'profile' | 'team' | 'settings'>('main');

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full bg-[#F8FAFC]"
    >
      <div className="p-6 space-y-6 overflow-y-auto no-scrollbar pb-24">
        {activeSubView === 'main' && (
          <>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-extrabold text-[#1E293B]">Mais</h2>
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <Menu size={20} />
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => setActiveSubView('profile')}
                className="w-full p-5 bg-white rounded-[28px] shadow-sm border border-[#F1F5F9] flex items-center gap-4 active:scale-[0.98] transition-all"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <User size={24} />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-[#1E293B]">Perfil do Utilizador</h3>
                  <p className="text-[10px] text-[#64748B] font-medium uppercase tracking-wider">Dados pessoais e rating</p>
                </div>
                <ChevronRight size={20} className="text-[#CBD5E1]" />
              </button>

              <button 
                onClick={() => setActiveSubView('team')}
                className="w-full p-5 bg-white rounded-[28px] shadow-sm border border-[#F1F5F9] flex items-center gap-4 active:scale-[0.98] transition-all"
              >
                <div className="w-12 h-12 bg-success/10 rounded-2xl flex items-center justify-center text-success">
                  <LayoutGrid size={24} />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-[#1E293B]">Gestão de Equipa</h3>
                  <p className="text-[10px] text-[#64748B] font-medium uppercase tracking-wider">{team.length} membros ativos</p>
                </div>
                <ChevronRight size={20} className="text-[#CBD5E1]" />
              </button>

              <button 
                onClick={onOperationCenter}
                className="w-full p-5 bg-white rounded-[28px] shadow-sm border border-[#F1F5F9] flex items-center gap-4 active:scale-[0.98] transition-all"
              >
                <div className="w-12 h-12 bg-warning/10 rounded-2xl flex items-center justify-center text-warning">
                  <Sparkles size={24} />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-[#1E293B]">Centro de Operação</h3>
                  <p className="text-[10px] text-[#64748B] font-medium uppercase tracking-wider">Clientes e stock</p>
                </div>
                <ChevronRight size={20} className="text-[#CBD5E1]" />
              </button>

              <button 
                onClick={() => setActiveSubView('settings')}
                className="w-full p-5 bg-white rounded-[28px] shadow-sm border border-[#F1F5F9] flex items-center gap-4 active:scale-[0.98] transition-all"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-[#64748B]">
                  <MoreVertical size={24} className="rotate-90" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-[#1E293B]">Definições</h3>
                  <p className="text-[10px] text-[#64748B] font-medium uppercase tracking-wider">App e notificações</p>
                </div>
                <ChevronRight size={20} className="text-[#CBD5E1]" />
              </button>
            </div>

            <button 
              onClick={onLogout}
              className="w-full py-5 text-red-500 font-bold text-sm uppercase tracking-widest mt-4"
            >
              Sair da Conta
            </button>
          </>
        )}

        {activeSubView === 'profile' && (
          <div className="space-y-6">
            <button onClick={() => setActiveSubView('main')} className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
              <ArrowLeft size={16} /> Voltar
            </button>
            <ProfileView profile={profile} onLogout={onLogout} onOperationCenter={onOperationCenter} />
          </div>
        )}

        {activeSubView === 'team' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button onClick={() => setActiveSubView('main')} className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                <ArrowLeft size={16} /> Voltar
              </button>
              <button 
                onClick={onAddMember}
                className="bg-primary text-white p-2 rounded-xl shadow-lg shadow-primary/20"
              >
                <Plus size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-extrabold text-[#1E293B]">A sua Equipa</h3>
              <div className="grid grid-cols-1 gap-3">
                {team.map(member => (
                  <div key={member.id} className="bg-white p-4 rounded-[24px] shadow-sm border border-[#F1F5F9] flex items-center gap-4">
                    <img src={member.photo} alt="" className="w-12 h-12 rounded-xl" referrerPolicy="no-referrer" />
                    <div className="flex-1">
                      <h4 className="font-bold text-[#1E293B]">{member.name}</h4>
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{member.role}</p>
                    </div>
                    <button 
                      onClick={() => onRemoveMember(member.id)}
                      className="p-2 text-red-100 hover:text-red-500 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSubView === 'settings' && (
          <div className="space-y-6">
            <button onClick={() => setActiveSubView('main')} className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
              <ArrowLeft size={16} /> Voltar
            </button>
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-[#F1F5F9] space-y-6">
              <h3 className="text-lg font-bold text-[#1E293B]">Configurações</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#64748B]">Notificações Push</span>
                  <div className="w-10 h-5 bg-primary rounded-full relative">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#64748B]">Modo Escuro</span>
                  <div className="w-10 h-5 bg-gray-200 rounded-full relative">
                    <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ProfileView({ profile, onLogout, onOperationCenter }: { profile: ProfileData; onLogout: () => void; onOperationCenter: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full bg-[#F8FAFC]"
    >
      <div className="p-6 space-y-6 overflow-y-auto no-scrollbar pb-24">
        {/* Profile Header Card */}
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-[#F1F5F9] flex items-center gap-4">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary/20">
            {profile.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-[#1E293B]">{profile.name}</h2>
            <p className="text-xs text-[#64748B]">teste@local.dev</p>
            <div className="flex gap-2 mt-2">
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-bold uppercase rounded-full">Profissional</span>
              <span className="px-2 py-0.5 bg-success/10 text-success text-[8px] font-bold uppercase rounded-full">Verificado</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-[24px] shadow-sm border border-[#F1F5F9] text-center">
            <p className="text-lg font-bold text-[#1E293B]">--</p>
            <p className="text-[8px] font-bold text-[#94A3B8] uppercase tracking-widest">nota</p>
          </div>
          <div className="bg-white p-4 rounded-[24px] shadow-sm border border-[#F1F5F9] text-center">
            <p className="text-lg font-bold text-[#1E293B]">0</p>
            <p className="text-[8px] font-bold text-[#94A3B8] uppercase tracking-widest">trabalhos</p>
          </div>
          <div className="bg-white p-4 rounded-[24px] shadow-sm border border-[#F1F5F9] text-center">
            <p className="text-lg font-bold text-[#1E293B]">--</p>
            <p className="text-[8px] font-bold text-[#94A3B8] uppercase tracking-widest">conclusão</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-[#F1F5F9] space-y-4">
          <h3 className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Contactos</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-xs font-medium text-[#64748B]">
              <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-primary">
                <Bell size={16} />
              </div>
              teste@local.dev
            </div>
            <div className="flex items-center gap-3 text-xs font-medium text-[#64748B]">
              <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-primary">
                <MoreVertical size={16} className="rotate-90" />
              </div>
              --
            </div>
            <div className="flex items-center gap-3 text-xs font-medium text-[#64748B]">
              <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-primary">
                <MapPin size={16} />
              </div>
              Lisboa, Portugal
            </div>
          </div>
        </div>

        {/* Services Offered */}
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-[#F1F5F9] space-y-4">
          <h3 className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Serviços oferecidos</h3>
          <div className="space-y-3">
            {['Limpeza residencial', 'Limpeza pós-obra', 'Escritórios & cowork'].map(service => (
              <div key={service} className="flex items-center gap-3 text-xs font-medium text-[#64748B]">
                <CheckCircle2 size={18} className="text-success" />
                {service}
              </div>
            ))}
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-[#F1F5F9] space-y-4">
          <h3 className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Documentos & certificações</h3>
          <div className="flex gap-4">
            {['HST', 'Seguro RC', 'Cert. Limpeza'].map(doc => (
              <div key={doc} className="text-[10px] font-bold text-[#64748B] bg-gray-50 px-3 py-1.5 rounded-lg">
                {doc}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button 
            onClick={onOperationCenter}
            className="w-full py-4 bg-white border border-[#F1F5F9] rounded-[20px] shadow-sm flex items-center justify-center gap-3 text-primary font-bold text-sm active:scale-[0.98] transition-all"
          >
            <LayoutGrid size={20} />
            Centro de operação
          </button>
          <button className="w-full py-4 bg-primary rounded-[20px] shadow-lg shadow-primary/20 text-white font-bold text-sm active:scale-[0.98] transition-all">
            Editar perfil
          </button>
          <button className="w-full py-4 bg-white border border-[#F1F5F9] rounded-[20px] shadow-sm text-[#1E293B] font-bold text-sm active:scale-[0.98] transition-all">
            Configurações
          </button>
          <button 
            onClick={onLogout}
            className="w-full py-4 bg-white border border-red-100 rounded-[20px] shadow-sm text-red-500 font-bold text-sm active:scale-[0.98] transition-all"
          >
            Sair
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function LoginView({ onLogin, onGoToRegister }: { onLogin: () => void; onGoToRegister: () => void }) {
  return (
    <div className="min-h-screen bg-white flex flex-col p-8 max-w-md mx-auto">
      <div className="flex-1 flex flex-col justify-center space-y-12">
        <div className="space-y-4 text-center">
          <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-cyan-100">
            <Sparkles size={40} className="text-white" fill="white" />
          </div>
          <h1 className="text-4xl font-extrabold text-primary tracking-tight">TaviClean</h1>
          <p className="text-text-sub font-medium">Bem-vindo de volta!</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-sub uppercase tracking-widest ml-1">E-mail</label>
            <input 
              type="email" 
              placeholder="seu@email.com"
              className="w-full p-4 bg-bg-app rounded-2xl border border-transparent focus:border-primary focus:outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-sub uppercase tracking-widest ml-1">Senha</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full p-4 bg-bg-app rounded-2xl border border-transparent focus:border-primary focus:outline-none transition-all"
            />
          </div>
          <button className="text-xs font-bold text-primary text-right w-full">Esqueceu a senha?</button>
        </div>

        <button 
          onClick={onLogin}
          className="w-full py-5 bg-primary rounded-2xl text-white font-bold uppercase tracking-widest shadow-fab active:scale-95 transition-transform"
        >
          Entrar
        </button>
      </div>

      <div className="py-8 text-center">
        <p className="text-sm text-text-sub">
          Não tem uma conta? <button onClick={onGoToRegister} className="text-primary font-bold">Registre-se</button>
        </p>
      </div>
    </div>
  );
}

function RegisterView({ onRegister, onBackToLogin }: { onRegister: () => void; onBackToLogin: () => void }) {
  return (
    <div className="min-h-screen bg-white flex flex-col p-8 max-w-md mx-auto">
      <div className="flex-1 flex flex-col justify-center space-y-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-text-main tracking-tight">Crie sua conta</h1>
          <p className="text-text-sub font-medium">Comece sua jornada com a TaviClean.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-sub uppercase tracking-widest ml-1">Nome Completo</label>
            <input 
              type="text" 
              placeholder="Ricardo Oliveira"
              className="w-full p-4 bg-bg-app rounded-2xl border border-transparent focus:border-primary focus:outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-sub uppercase tracking-widest ml-1">E-mail</label>
            <input 
              type="email" 
              placeholder="seu@email.com"
              className="w-full p-4 bg-bg-app rounded-2xl border border-transparent focus:border-primary focus:outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-sub uppercase tracking-widest ml-1">Senha</label>
            <input 
              type="password" 
              placeholder="••••••••"
              className="w-full p-4 bg-bg-app rounded-2xl border border-transparent focus:border-primary focus:outline-none transition-all"
            />
          </div>
        </div>

        <button 
          onClick={onRegister}
          className="w-full py-5 bg-primary rounded-2xl text-white font-bold uppercase tracking-widest shadow-fab active:scale-95 transition-transform"
        >
          Registrar
        </button>
      </div>

      <div className="py-8 text-center">
        <p className="text-sm text-text-sub">
          Já tem uma conta? <button onClick={onBackToLogin} className="text-primary font-bold">Entrar</button>
        </p>
      </div>
    </div>
  );
}

function NotificationsView({ notifications, setNotifications }: { notifications: Notification[]; setNotifications: (n: Notification[]) => void }) {
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full"
    >
      <div className="p-6 space-y-6 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] font-bold text-text-sub uppercase tracking-[1.5px]">Notificações</h2>
          <button onClick={markAllAsRead} className="text-[10px] font-bold text-primary uppercase tracking-wider">Marcar todas como lidas</button>
        </div>

        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className={`p-4 rounded-card border transition-all ${n.unread ? 'bg-white border-primary/20 shadow-sm' : 'bg-gray-50/50 border-gray-100'}`}>
              <div className="flex justify-between items-start mb-1">
                <h3 className={`text-sm font-bold ${n.unread ? 'text-text-main' : 'text-text-sub'}`}>{n.title}</h3>
                <span className="text-[10px] text-text-sub opacity-60">{n.time}</span>
              </div>
              <p className="text-xs text-text-sub leading-relaxed">{n.message}</p>
              {n.unread && <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></div>}
            </div>
          ))}
        </div>

        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <Bell size={48} />
            <p className="text-sm font-bold mt-4">Nenhuma notificação</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// --- Helpers ---

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-primary' : 'text-[#CCCCCC]'}`}
    >
      <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'scale-100'}`}>
        {icon}
      </div>
      <span className={`text-[8px] font-bold uppercase tracking-widest transition-opacity ${active ? 'opacity-100' : 'opacity-60'}`}>
        {label}
      </span>
      {active && (
        <motion.div 
          layoutId="navIndicator"
          className="w-1 h-1 bg-primary rounded-full mt-0.5"
        />
      )}
    </button>
  );
}

function ProfileMenuItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-white rounded-card shadow-card border border-[#EEEEEE] group hover:border-primary/20 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="text-text-sub group-hover:text-primary transition-colors">{icon}</div>
        <span className="text-xs font-bold text-text-main">{label}</span>
      </div>
      <ChevronRight size={16} className="text-[#CCCCCC]" />
    </button>
  );
}
