/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { useState, useEffect } from 'react';
import { auth, signInWithGoogle, signOut, db } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, deleteDoc, orderBy } from 'firebase/firestore';
import { Task, Habit, Status, Category, Priority, Company, Project } from './types';
import { 
  LayoutDashboard, 
  CheckCircle2, 
  Calendar as CalendarIcon, 
  ListTodo, 
  LogOut, 
  Plus, 
  Search, 
  Settings, 
  User as UserIcon,
  ChevronRight,
  Target,
  Hash,
  Flame,
  Moon,
  Sun,
  Briefcase,
  Home,
  BookOpen,
  Building2,
  Layers,
  ChevronDown,
  Trash2,
  MoreVertical,
  Rocket,
  Zap,
  Globe,
  Shield,
  Cpu,
  Coffee
} from 'lucide-react';

const iconMap = {
  Building2,
  Briefcase,
  Rocket,
  Zap,
  Globe,
  Shield,
  Cpu,
  Coffee,
  BookOpen,
  Layers,
  UserIcon
};

const colorMap = {
  rose: 'text-rose-500',
  blue: 'text-blue-500',
  emerald: 'text-emerald-500',
  amber: 'text-amber-500',
  indigo: 'text-indigo-500',
  violet: 'text-violet-500',
  orange: 'text-orange-500',
  slate: 'text-slate-500',
};

const bgColorMap = {
  rose: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  violet: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300 border-violet-200 dark:border-violet-800',
  orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  slate: 'bg-slate-100 dark:bg-slate-900/30 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800',
};
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup
} from './components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from './components/ui/dialog';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Textarea } from './components/ui/textarea';
import { Checkbox } from './components/ui/checkbox';
import { format, startOfToday, isSameDay, parseISO } from 'date-fns';

// Views
import KanbanBoard from './components/kanban/KanbanBoard';
import TaskListView from './components/list/TaskListView';
import CalendarView from './components/calendar/CalendarView';
import HabitTrackerView from './components/habits/HabitTracker';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeView, setActiveView] = useState<'kanban' | 'list' | 'calendar' | 'habits' | 'study'>('kanban');
  const [activeSpace, setActiveSpace] = useState<string>('personal');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [initialTaskStatus, setInitialTaskStatus] = useState<Status>('todo');
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    const onboarded = localStorage.getItem('nexus-onboarded');
    return !onboarded;
  });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('nexus-theme');
    return (saved as 'light' | 'dark') || 'dark';
  });

  const [inputPassword, setInputPassword] = useState('');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('nexus-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const finishOnboarding = (selectedTheme: 'light' | 'dark') => {
    setTheme(selectedTheme);
    localStorage.setItem('nexus-onboarded', 'true');
    setShowOnboarding(false);
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPassword === 'Lince7') {
      setPasswordError(false);
      setIsPasswordModalOpen(false);
      await signInWithGoogle();
    } else {
      setPasswordError(true);
    }
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user || !db) return;

    const tasksQuery = query(collection(db, 'tasks'), where('userId', '==', user.uid));
    const habitsQuery = query(collection(db, 'habits'), where('userId', '==', user.uid));
    const companiesQuery = query(collection(db, 'companies'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
    const projectsQuery = query(collection(db, 'projects'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));

    const unsubTasks = onSnapshot(tasksQuery, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
    });

    const unsubHabits = onSnapshot(habitsQuery, (snapshot) => {
      setHabits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit)));
    });

    const unsubCompanies = onSnapshot(companiesQuery, (snapshot) => {
      setCompanies(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Company)));
    });

    const unsubProjects = onSnapshot(projectsQuery, (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
    });

    return () => {
      unsubTasks();
      unsubHabits();
      unsubCompanies();
      unsubProjects();
    };
  }, [user]);

  const addCompany = async (name: string, icon: string = 'Building2', color: string = 'rose') => {
    if (!user) return;
    await addDoc(collection(db, 'companies'), {
      name,
      userId: user.uid,
      icon,
      color,
      createdAt: new Date().toISOString(),
    });
  };

  const deleteCompany = async (id: string) => {
    await deleteDoc(doc(db, 'companies', id));
    if (activeSpace === `company_${id}`) setActiveSpace('personal');
  };

  const addProject = async (name: string, icon: string = 'Layers', color: string = 'indigo') => {
    if (!user) return;
    await addDoc(collection(db, 'projects'), {
      name,
      userId: user.uid,
      icon,
      color,
      createdAt: new Date().toISOString(),
    });
  };

  const deleteProject = async (id: string) => {
    await deleteDoc(doc(db, 'projects', id));
    if (activeSpace === `project_${id}`) setActiveSpace('personal');
  };

  const addTask = async (task: Partial<Task>) => {
    if (!user) return;
    await addDoc(collection(db, 'tasks'), {
      ...task,
      userId: user.uid,
      createdAt: new Date().toISOString(),
      status: task.status || 'todo',
    });
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    await updateDoc(doc(db, 'tasks', id), updates);
  };

  const deleteTask = async (id: string) => {
    await deleteDoc(doc(db, 'tasks', id));
  };

  const toggleHabit = async (habit: Habit) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    let newDates = [...habit.completedDates];
    if (newDates.includes(today)) {
      newDates = newDates.filter(d => d !== today);
    } else {
      newDates.push(today);
    }
    await updateDoc(doc(db, 'habits', habit.id), { completedDates: newDates });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-slate-200 border-t-slate-800 dark:border-t-slate-100 rounded-full mb-4"
        />
        <p className="text-slate-500 dark:text-slate-400 font-medium">Carregando Nexus...</p>
      </div>
    );
  }

  if (!auth || !db) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-6 text-center">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Settings className="w-10 h-10 animate-spin-slow" />
          </div>
          <h1 className="text-2xl font-bold dark:text-white mb-4">Configuração Necessária</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Você precisa configurar as chaves do Firebase no seu ambiente para o Nexus funcionar. 
            Vá em <b>Configurações &gt; Segredos</b> e adicione as variáveis VITE_FIREBASE_*.
          </p>
          <div className="space-y-2 text-left bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl font-mono text-xs text-slate-500 dark:text-slate-400">
            <p>VITE_FIREBASE_API_KEY</p>
            <p>VITE_FIREBASE_PROJECT_ID</p>
            <p>VITE_FIREBASE_APP_ID</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FDFCFB] dark:bg-slate-950 p-6 transition-colors duration-500">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="mb-8 flex justify-center">
             <div className="w-16 h-16 bg-slate-900 dark:bg-slate-100 rounded-2xl flex items-center justify-center shadow-xl rotate-3 transform transition-transform hover:rotate-0">
                <CheckCircle2 className="text-white dark:text-slate-900 w-10 h-10" />
             </div>
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-4 font-sans">Nexus</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg">Organize seu mundo. Conquiste seus objetivos. Domine sua rotina.</p>
          
          <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
            <DialogTrigger 
              render={
                <Button 
                  className="w-full py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all bg-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                >
                  Acessar Nexus
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md rounded-2xl dark:bg-slate-900 dark:border-slate-800">
              <DialogHeader>
                <DialogTitle className="dark:text-white">Autenticação Nexus</DialogTitle>
                <DialogDescription className="dark:text-slate-400">
                  Para continuar, insira a chave de acesso do seu workspace.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUnlock} className="space-y-4 pt-4">
                <div className="space-y-2 text-left">
                  <Label htmlFor="access-password">Senha de Acesso</Label>
                  <Input 
                    id="access-password"
                    type="password"
                    placeholder="Digite a senha..."
                    value={inputPassword}
                    onChange={(e) => setInputPassword(e.target.value)}
                    className={`h-12 dark:bg-slate-800 ${passwordError ? 'border-rose-500 ring-rose-500' : ''}`}
                    autoFocus
                  />
                  {passwordError && (
                    <p className="text-xs text-rose-500 font-medium pt-1">Senha incorreta. Tente novamente.</p>
                  )}
                </div>
                <Button 
                  type="submit"
                  className="w-full py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all bg-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                >
                  Confirmar
                </Button>
                <div className="flex justify-center gap-4 pt-2">
                  <a 
                    href="https://wa.me/5519971087116?text=Esqueci%20a%20senha%20do%20Nexus" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                  >
                    Esqueci a senha
                  </a>
                  <span className="text-slate-300 dark:text-slate-700 text-xs">•</span>
                  <a 
                    href="https://wa.me/5519971087116?text=Não%20sei%20a%20senha%20do%20Nexus" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                  >
                    Não sei a senha
                  </a>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <div className="mt-12 flex justify-center gap-8 opacity-40 dark:text-slate-400">
             <Briefcase className="w-6 h-6" />
             <UserIcon className="w-6 h-6" />
             <BookOpen className="w-6 h-6" />
          </div>
          <p className="mt-12 text-[10px] font-bold tracking-[0.2em] text-slate-400 dark:text-slate-600 uppercase">Nexus Workspace v1.2</p>
        </motion.div>
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors duration-500">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold dark:text-white mb-4">Personalize sua experiência</h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg">Como você prefere visualizar seu workspace?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => finishOnboarding('light')}
              className="group flex flex-col items-center p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-800 shadow-xl transition-all"
            >
              <div className="w-24 h-24 bg-amber-100 rounded-3xl flex items-center justify-center text-amber-600 mb-6 group-hover:rotate-12 transition-transform">
                <Sun size={48} />
              </div>
              <h2 className="text-2xl font-bold dark:text-white mb-2">Claro</h2>
              <p className="text-slate-500 text-center text-sm">Design limpo e clássico para foco total durante o dia.</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => finishOnboarding('dark')}
              className="group flex flex-col items-center p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-800 shadow-xl transition-all"
            >
              <div className="w-24 h-24 bg-slate-800 rounded-3xl flex items-center justify-center text-slate-100 mb-6 group-hover:-rotate-12 transition-transform">
                <Moon size={48} />
              </div>
              <h2 className="text-2xl font-bold dark:text-white mb-2">Escuro</h2>
              <p className="text-slate-500 text-center text-sm">Conforto visual e estética moderna para sua produtividade.</p>
            </motion.button>
          </div>
          
          <div className="mt-16 text-center">
             <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">Você poderá alterar isso a qualquer momento nas configurações</p>
          </div>
        </motion.div>
      </div>
    );
  }

  const filteredTasks = tasks.filter(t => {
    if (activeSpace === 'personal') return t.category === 'personal';
    if (activeSpace === 'work') return t.category === 'work';
    if (activeSpace === 'study') return t.category === 'study';
    if (activeSpace.startsWith('project_')) {
      const projectId = activeSpace.replace('project_', '');
      return (t as any).projectId === projectId;
    }
    if (activeSpace.startsWith('company_')) {
      const companyId = activeSpace.replace('company_', '');
      return (t as any).companyId === companyId;
    }
    return true;
  });

  const filteredHabits = habits;

  return (
    <div className={`flex h-screen bg-[#F8F9FA] dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300`}>
      {/* Sidebar */}
      <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-20">
        <div className="p-6 overflow-y-auto flex-1 scrollbar-hide">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center shadow-lg">
              <CheckCircle2 className="text-white dark:text-slate-900 w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight dark:text-white">Nexus</span>
          </div>

          <div className="mb-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-3">Workspace</p>
            <div className="space-y-1">
              <SidebarItem 
                icon={<UserIcon size={18} />} 
                label="Pessoal" 
                active={activeSpace === 'personal' && activeView !== 'study' && activeView !== 'habits'} 
                onClick={() => {
                  setActiveSpace('personal');
                  if (activeView === 'study' || activeView === 'habits') setActiveView('kanban');
                }} 
              />
              <SidebarItem 
                icon={<Briefcase size={18} />} 
                label="Trabalho" 
                active={activeSpace === 'work' && activeView !== 'study' && activeView !== 'habits'} 
                onClick={() => {
                  setActiveSpace('work');
                  if (activeView === 'study' || activeView === 'habits') setActiveView('kanban');
                }} 
              />
            </div>
          </div>

          <div className="my-6 border-t border-slate-100 dark:border-slate-800" />

          <div className="mb-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-3">Projetos</p>
            <div className="space-y-1">
              {projects.map(project => {
                const IconComp = iconMap[project.icon as keyof typeof iconMap] || Layers;
                return (
                  <SidebarItem 
                    key={project.id}
                    icon={<IconComp size={18} className={colorMap[project.color as keyof typeof colorMap]} />} 
                    label={project.name} 
                    active={activeSpace === `project_${project.id}`} 
                    onClick={() => {
                      setActiveSpace(`project_${project.id}`);
                      if (activeView === 'study' || activeView === 'habits') setActiveView('kanban');
                    }} 
                  />
                );
              })}
              <ProjectManager 
                projects={projects} 
                onAdd={addProject} 
                onDelete={deleteProject} 
              />
            </div>
          </div>

          <div className="my-6 border-t border-slate-100 dark:border-slate-800" />

          <div className="mb-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-3">Empresas</p>
            <div className="space-y-1">
              {companies.map(company => {
                const IconComp = iconMap[company.icon as keyof typeof iconMap] || Building2;
                return (
                  <SidebarItem 
                    key={company.id}
                    icon={<IconComp size={18} className={colorMap[company.color as keyof typeof colorMap]} />} 
                    label={company.name} 
                    active={activeSpace === `company_${company.id}`} 
                    onClick={() => {
                      setActiveSpace(`company_${company.id}`);
                      if (activeView === 'study' || activeView === 'habits') setActiveView('kanban');
                    }} 
                  />
                );
              })}
              <CompanyManager 
                companies={companies} 
                onAdd={addCompany} 
                onDelete={deleteCompany} 
              />
            </div>
          </div>

          <div className="my-6 border-t border-slate-100 dark:border-slate-800" />

          <div className="mb-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-3">Módulos</p>
            <div className="space-y-1">
              <SidebarItem 
                icon={<BookOpen size={18} />} 
                label="Estudos" 
                active={activeView === 'study'} 
                onClick={() => setActiveView('study')} 
              />
              <SidebarItem 
                icon={<Target size={18} />} 
                label="Habitos" 
                active={activeView === 'habits'} 
                onClick={() => setActiveView('habits')} 
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
             <img src={user.photoURL || ''} alt="User" className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-700 shadow-sm" />
             <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold truncate dark:text-slate-200">{user.displayName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
             </div>
             <button onClick={signOut} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                <LogOut size={18} />
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative h-full">
        {/* Header */}
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-10 sticky top-0 z-10">
          <div className="flex items-center gap-4">
             <h2 className="text-2xl font-bold tracking-tight capitalize dark:text-white">
                {activeView === 'study' ? 'Área de Estudos' :
                 activeView === 'habits' ? 'Hábitos & Rotina' :
                 activeView === 'kanban' ? 'Fluxo de Trabalho' : 
                 activeView === 'list' ? 'Minhas Tarefas' : 'Planejamento'}
             </h2>
             {activeView !== 'study' && activeView !== 'habits' && (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border uppercase tracking-wider ${
                  activeSpace === 'work' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-800' :
                  activeSpace.startsWith('project_') ? bgColorMap[projects.find(p => `project_${p.id}` === activeSpace)?.color as keyof typeof bgColorMap] || 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' :
                  activeSpace === 'personal' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' :
                  activeSpace.startsWith('company_') ? bgColorMap[companies.find(c => `company_${c.id}` === activeSpace)?.color as keyof typeof bgColorMap] || 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-800' :
                  'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                }`}>
                  {activeSpace === 'work' ? 'Trabalho' : 
                   activeSpace.startsWith('project_') ? (projects.find(p => `project_${p.id}` === activeSpace)?.name || 'Projeto') :
                   activeSpace === 'personal' ? 'Pessoal' : 
                   companies.find(c => `company_${c.id}` === activeSpace)?.name || 'Espaço'}
                </span>
             )}
          </div>

          <div className="flex items-center gap-4">
             {activeView !== 'study' && activeView !== 'habits' && (
               <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mr-2">
                  <button 
                    onClick={() => setActiveView('kanban')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${activeView === 'kanban' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                  >
                    <LayoutDashboard size={16} />
                    <span className="text-xs font-semibold whitespace-nowrap">Kanban</span>
                  </button>
                  <button 
                    onClick={() => setActiveView('list')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${activeView === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                  >
                    <ListTodo size={16} />
                    <span className="text-xs font-semibold whitespace-nowrap">Lista</span>
                  </button>
                  <button 
                    onClick={() => setActiveView('calendar')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${activeView === 'calendar' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                  >
                    <CalendarIcon size={16} />
                    <span className="text-xs font-semibold whitespace-nowrap">Calendário</span>
                  </button>
               </div>
             )}

             <div className="relative w-64 hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <Input placeholder="Buscar..." className="pl-10 h-10 bg-slate-100/50 dark:bg-slate-800/50 border-none rounded-lg focus-visible:ring-slate-400 text-sm" />
             </div>
             
             <Button
               variant="ghost"
               size="icon"
               onClick={toggleTheme}
               className="rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
             >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
             </Button>

              <NewTaskDialog 
                onAdd={addTask} 
                activeSpace={activeSpace} 
                companies={companies} 
                projects={projects}
                open={isTaskModalOpen}
                onOpenChange={setIsTaskModalOpen}
                initialStatus={initialTaskStatus}
              />
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView + activeSpace}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="h-full"
            >
              {activeView === 'kanban' && (
                <KanbanBoard 
                  tasks={filteredTasks} 
                  onUpdate={updateTask} 
                  onDelete={deleteTask} 
                  onAddTask={(status) => {
                    setInitialTaskStatus(status);
                    setIsTaskModalOpen(true);
                  }}
                />
              )}
              {activeView === 'list' && (
                <TaskListView tasks={filteredTasks} onUpdate={updateTask} onDelete={deleteTask} />
              )}
              {activeView === 'calendar' && (
                <CalendarView tasks={filteredTasks} />
              )}
              {activeView === 'habits' && (
                <HabitTrackerView habits={filteredHabits} onToggle={toggleHabit} activeCategory={activeSpace.startsWith('company') ? 'company' : activeSpace as any} />
              )}
              {activeView === 'study' && (
                <StudyModule tasks={filteredTasks.filter(t => t.category === 'study')} onAdd={addTask} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function ProjectManager({ projects, onAdd, onDelete }: { projects: Project[], onAdd: (name: string, icon: string, color: string) => void, onDelete: (id: string) => void }) {
  const [newName, setNewName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Layers');
  const [selectedColor, setSelectedColor] = useState('indigo');
  const [isOpen, setIsOpen] = useState(false);

  const icons = [
    { name: 'Layers', icon: <Layers size={18} /> },
    { name: 'Rocket', icon: <Rocket size={18} /> },
    { name: 'Zap', icon: <Zap size={18} /> },
    { name: 'Globe', icon: <Globe size={18} /> },
    { name: 'Shield', icon: <Shield size={18} /> },
    { name: 'Cpu', icon: <Cpu size={18} /> },
    { name: 'Hash', icon: <Hash size={18} /> },
    { name: 'CheckCircle2', icon: <CheckCircle2 size={18} /> },
  ];

  const colors = [
    { name: 'indigo', bg: 'bg-indigo-500' },
    { name: 'blue', bg: 'bg-blue-500' },
    { name: 'emerald', bg: 'bg-emerald-500' },
    { name: 'rose', bg: 'bg-rose-500' },
    { name: 'amber', bg: 'bg-amber-500' },
    { name: 'violet', bg: 'bg-violet-500' },
    { name: 'orange', bg: 'bg-orange-500' },
    { name: 'slate', bg: 'bg-slate-500' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger 
        render={
          <button className="w-full flex items-center gap-3 px-4 py-2 mt-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-all">
            <Settings size={16} />
            <span className="font-medium text-xs">Gerenciar Projetos</span>
          </button>
        }
      />
      <DialogContent className="sm:max-w-md rounded-2xl dark:bg-slate-900 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Gerenciar Projetos</DialogTitle>
          <DialogDescription className="dark:text-slate-400">
            Personalize seus projetos com ícones e cores específicas.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input 
                placeholder="Nome do projeto..." 
                value={newName} 
                onChange={e => setNewName(e.target.value)} 
                className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
              <Button 
                onClick={() => {
                  if (newName) {
                    onAdd(newName, selectedIcon, selectedColor);
                    setNewName('');
                    setIsOpen(false);
                  }
                }}
                className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
              >
                Adicionar
              </Button>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Escolha um Ícone</Label>
              <div className="grid grid-cols-8 gap-2">
                {icons.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => setSelectedIcon(item.name)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      selectedIcon === item.name 
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 scale-110 shadow-md' 
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {item.icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Escolha uma Cor</Label>
              <div className="grid grid-cols-8 gap-2">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-8 h-8 rounded-full ${color.bg} transition-all ${
                      selectedColor === color.name 
                        ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110' 
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1 mb-2 block">Projetos Atuais</Label>
            {projects.map(project => {
              const IconComp = iconMap[project.icon as keyof typeof iconMap] || Layers;
              const colorClass = colorMap[project.color as keyof typeof colorMap] || 'text-indigo-500';
              return (
                <div key={project.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <IconComp size={16} className={colorClass} />
                    <span className="font-semibold text-sm dark:text-slate-200">{project.name}</span>
                  </div>
                  <button 
                    onClick={() => onDelete(project.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CompanyManager({ companies, onAdd, onDelete }: { companies: Company[], onAdd: (name: string, icon: string, color: string) => void, onDelete: (id: string) => void }) {
  const [newName, setNewName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Building2');
  const [selectedColor, setSelectedColor] = useState('rose');
  const [isOpen, setIsOpen] = useState(false);

  const icons = [
    { name: 'Building2', icon: <Building2 size={18} /> },
    { name: 'Briefcase', icon: <Briefcase size={18} /> },
    { name: 'Rocket', icon: <Rocket size={18} /> },
    { name: 'Zap', icon: <Zap size={18} /> },
    { name: 'Globe', icon: <Globe size={18} /> },
    { name: 'Shield', icon: <Shield size={18} /> },
    { name: 'Cpu', icon: <Cpu size={18} /> },
    { name: 'Coffee', icon: <Coffee size={18} /> },
  ];

  const colors = [
    { name: 'rose', bg: 'bg-rose-500' },
    { name: 'blue', bg: 'bg-blue-500' },
    { name: 'emerald', bg: 'bg-emerald-500' },
    { name: 'amber', bg: 'bg-amber-500' },
    { name: 'indigo', bg: 'bg-indigo-500' },
    { name: 'violet', bg: 'bg-violet-500' },
    { name: 'orange', bg: 'bg-orange-500' },
    { name: 'slate', bg: 'bg-slate-500' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger 
        render={
          <button className="w-full flex items-center gap-3 px-4 py-2 mt-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-all">
            <Settings size={16} />
            <span className="font-medium text-xs">Gerenciar Empresas</span>
          </button>
        }
      />
      <DialogContent className="sm:max-w-md rounded-2xl dark:bg-slate-900 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Gerenciar Empresas</DialogTitle>
          <DialogDescription className="dark:text-slate-400">
            Personalize suas empresas com ícones e cores específicas.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input 
                placeholder="Nome da empresa..." 
                value={newName} 
                onChange={e => setNewName(e.target.value)} 
                className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
              <Button 
                onClick={() => {
                  if (newName) {
                    onAdd(newName, selectedIcon, selectedColor);
                    setNewName('');
                    setIsOpen(false);
                  }
                }}
                className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
              >
                Adicionar
              </Button>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Escolha um Ícone</Label>
              <div className="grid grid-cols-8 gap-2">
                {icons.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => setSelectedIcon(item.name)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      selectedIcon === item.name 
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 scale-110 shadow-md' 
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {item.icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Escolha uma Cor</Label>
              <div className="grid grid-cols-8 gap-2">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-8 h-8 rounded-full ${color.bg} transition-all ${
                      selectedColor === color.name 
                        ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110' 
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1 mb-2 block">Empresas Atuais</Label>
            {companies.map(company => {
              const IconComp = iconMap[company.icon as keyof typeof iconMap] || Building2;
              const colorClass = colorMap[company.color as keyof typeof colorMap] || 'text-rose-500';
              return (
                <div key={company.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <IconComp size={16} className={colorClass} />
                    <span className="font-semibold text-sm dark:text-slate-200">{company.name}</span>
                  </div>
                  <button 
                    onClick={() => onDelete(company.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StudyModule({ tasks, onAdd }: { tasks: Task[], onAdd: (t: any) => void }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="col-span-2 border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
          <CardHeader className="bg-amber-500 text-white p-8">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <BookOpen size={28} />
              Plano de Estudos
            </CardTitle>
            <p className="text-amber-100">Gerencie seus cursos, livros e aprendizados.</p>
          </CardHeader>
          <CardContent className="p-8">
             <div className="space-y-4">
                {tasks.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-500">Comece adicionando tópicos de estudo.</p>
                  </div>
                ) : (
                  tasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-4">
                        <Checkbox className="w-6 h-6 rounded-lg" />
                        <div>
                          <p className="font-bold dark:text-slate-200">{task.title}</p>
                          <p className="text-xs text-slate-500">{task.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 text-[10px] font-bold rounded-lg uppercase tracking-tight">Estudo</span>
                      </div>
                    </div>
                  ))
                )}
             </div>
          </CardContent>
        </Card>
        
        <div className="space-y-8">
           <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl p-8">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Flame size={20} className="text-orange-500" />
                Foco de Hoje
              </h3>
              <div className="space-y-3">
                 <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800">
                    <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Dica Pro</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Use a técnica Pomodoro para sessões de 25min de foco total.</p>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  key?: string | number;
}

function SidebarItem({ icon, label, active, onClick }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active 
          ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-lg' 
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
      }`}
    >
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}

function NewTaskDialog({ 
  onAdd, 
  activeSpace, 
  companies, 
  projects,
  open,
  onOpenChange,
  initialStatus = 'todo'
}: { 
  onAdd: (t: any) => void, 
  activeSpace: string, 
  companies: Company[], 
  projects: Project[],
  open: boolean,
  onOpenChange: (open: boolean) => void,
  initialStatus?: Status
}) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState<Category>('work');
  const [status, setStatus] = useState<Status>(initialStatus);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [priority, setPriority] = useState<Priority>('medium');

  useEffect(() => {
    if (open) {
      setStatus(initialStatus);
    }
  }, [open, initialStatus]);

  useEffect(() => {
    if (activeSpace === 'personal') {
      setCategory('personal');
      setCompanyId(null);
      setProjectId(null);
    } else if (activeSpace === 'work') {
      setCategory('work');
      setCompanyId(null);
      setProjectId(null);
    } else if (activeSpace === 'project') {
      setCategory('project');
      setCompanyId(null);
      setProjectId(null);
    } else if (activeSpace === 'study') {
      setCategory('study');
      setCompanyId(null);
      setProjectId(null);
    } else if (activeSpace.startsWith('project_')) {
      setCategory('project');
      setProjectId(activeSpace.replace('project_', ''));
      setCompanyId(null);
    } else if (activeSpace.startsWith('company_')) {
      setCategory('company');
      setCompanyId(activeSpace.replace('company_', ''));
      setProjectId(null);
    }
  }, [activeSpace, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ title, description: desc, category, priority, companyId, projectId, status });
    setTitle('');
    setDesc('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger 
        render={
          <Button className="rounded-lg h-10 px-5 gap-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white transition-all">
            <Plus size={18} />
            Nova Tarefa
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md rounded-2xl dark:bg-slate-900 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Criar Nova Tarefa</DialogTitle>
          <DialogDescription className="dark:text-slate-400">
            Adicione uma tarefa à sua lista e organize por categoria.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="dark:text-slate-200">Título</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Projeto X" required className="dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc" className="dark:text-slate-200">Descrição</Label>
            <Textarea id="desc" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Notas extras..." className="dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label className="dark:text-slate-200">Categoria</Label>
                <Select value={category} onValueChange={(v: any) => {
                  setCategory(v);
                  if (v !== 'company') setCompanyId(null);
                  if (v !== 'project') setProjectId(null);
                }}>
                   <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                      <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                      <SelectItem value="work">Trabalho</SelectItem>
                      <SelectItem value="personal">Pessoal</SelectItem>
                      <SelectItem value="study">Estudos</SelectItem>
                      <SelectItem value="project">Projeto</SelectItem>
                      <SelectItem value="company">Empresa</SelectItem>
                   </SelectContent>
                </Select>
             </div>
             <div className="space-y-2">
                <Label className="dark:text-slate-200">Prioridade</Label>
                <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                   <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                      <SelectValue />
                   </SelectTrigger>
                   <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                   </SelectContent>
                </Select>
             </div>
          </div>
          <div className="space-y-2">
            <Label className="dark:text-slate-200">Status Inicial</Label>
            <Select value={status} onValueChange={(v: Status) => setStatus(v)}>
                <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                  <SelectItem value="todo">A Fazer</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="done">Concluído</SelectItem>
                </SelectContent>
            </Select>
          </div>
          {category === 'project' && (
            <div className="space-y-2">
              <Label className="dark:text-slate-200">Projeto Selecionado</Label>
              <Select value={projectId || ''} onValueChange={setProjectId}>
                <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                  <SelectValue placeholder="Selecione o projeto" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {category === 'company' && (
            <div className="space-y-2">
              <Label className="dark:text-slate-200">Empresa Selecionada</Label>
              <Select value={companyId || ''} onValueChange={setCompanyId}>
                <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                  {companies.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter>
            <Button type="submit" className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white">Criar Tarefa</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
