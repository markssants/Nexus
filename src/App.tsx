/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { useState, useEffect } from 'react';
import { auth, signInWithGoogle, signOut, db } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc, orderBy, getDocFromServer } from 'firebase/firestore';
import { Task, Habit, Status, Company, Project } from './types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}


import { 
  LayoutDashboard, 
  CheckCircle2, 
  Calendar as CalendarIcon, 
  ListTodo, 
  Search, 
  Settings, 
  Moon, 
  Sun,
  Briefcase,
  User as UserIcon,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import { bgColorMap, solidBgColorMap } from './constants';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './components/ui/button';
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
import { format } from 'date-fns';

// Views & Components
import KanbanBoard from './components/kanban/KanbanBoard';
import TaskListView from './components/list/TaskListView';
import CalendarView from './components/calendar/CalendarView';
import HabitTrackerView from './components/habits/HabitTracker';
import { StudyModule } from './components/StudyModule';
import { Sidebar } from './components/Sidebar';
import { NewTaskDialog } from './components/NewTaskDialog';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeView, setActiveView] = useState<'kanban' | 'list' | 'calendar' | 'habits' | 'study'>(() => {
    const saved = localStorage.getItem('nexus-active-view');
    return (saved as any) || 'kanban';
  });
  const [activeSpace, setActiveSpace] = useState<string>(() => {
    const saved = localStorage.getItem('nexus-active-space');
    return saved || 'personal';
  });
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

  useEffect(() => {
    localStorage.setItem('nexus-active-view', activeView);
  }, [activeView]);

  useEffect(() => {
    localStorage.setItem('nexus-active-space', activeSpace);
  }, [activeSpace]);

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

  const [error, setError] = useState<string | null>(null);

  function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth?.currentUser?.uid,
        email: auth?.currentUser?.email,
        emailVerified: auth?.currentUser?.emailVerified,
        isAnonymous: auth?.currentUser?.isAnonymous,
        tenantId: auth?.currentUser?.tenantId,
        providerInfo: auth?.currentUser?.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || []
      },
      operationType,
      path
    }
    console.error('Firestore Error Detailed: ', errInfo);
    setError(`${operationType} em ${path}: ${errInfo.error}`);
  }

  useEffect(() => {
    if (!user || !db) return;

    console.log('Setting up snapshots for user:', user.uid);

    const tasksQuery = query(collection(db, 'tasks'), where('userId', '==', user.uid));
    const habitsQuery = query(collection(db, 'habits'), where('userId', '==', user.uid));
    const companiesQuery = query(collection(db, 'companies'), where('userId', '==', user.uid));
    const projectsQuery = query(collection(db, 'projects'), where('userId', '==', user.uid));

    const unsubTasks = onSnapshot(tasksQuery, (snapshot) => {
      console.log(`Tasks snapshot received: ${snapshot.size} docs`);
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(docs.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      }));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'tasks');
    });

    const unsubHabits = onSnapshot(habitsQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit));
      setHabits(docs.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      }));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'habits');
    });

    const unsubCompanies = onSnapshot(companiesQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Company));
      setCompanies(docs.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      }));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'companies');
    });

    const unsubProjects = onSnapshot(projectsQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(docs.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      }));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'projects');
    });

    return () => {
      unsubTasks();
      unsubHabits();
      unsubCompanies();
      unsubProjects();
    };
  }, [user, db]);

  const addCompany = async (name: string, icon: string = 'Building2', color: string = 'rose') => {
    if (!user) return;
    try {
      const docRef = await addDoc(collection(db, 'companies'), {
        name,
        userId: user.uid,
        icon,
        color,
        createdAt: new Date().toISOString(),
      });
      console.log('Company successfully added with ID:', docRef.id);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'companies');
    }
  };

  const deleteCompany = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'companies', id));
      if (activeSpace === `company_${id}`) setActiveSpace('personal');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'companies');
    }
  };

  const updateCompany = async (id: string, updates: Partial<Company>) => {
    try {
      await updateDoc(doc(db, 'companies', id), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'companies');
    }
  };

  const addProject = async (name: string, icon: string = 'Layers', color: string = 'indigo') => {
    if (!user) return;
    try {
      const docRef = await addDoc(collection(db, 'projects'), {
        name,
        userId: user.uid,
        icon,
        color,
        createdAt: new Date().toISOString(),
      });
      console.log('Project successfully added with ID:', docRef.id);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'projects');
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'projects', id));
      if (activeSpace === `project_${id}`) setActiveSpace('personal');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'projects');
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      await updateDoc(doc(db, 'projects', id), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'projects');
    }
  };

  const addTask = async (task: Partial<Task>) => {
    if (!user) return;
    try {
      console.log('Attempting to add task:', task);
      const newTask = {
        ...task,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        status: task.status || 'todo',
      };
      
      const docRef = await addDoc(collection(db, 'tasks'), newTask);
      console.log('Task successfully added to Firestore with ID:', docRef.id);
      
      // Verification: Try to fetch it back immediately from server to confirm
      // This is optional but can help diagnose if it's "missing"
    } catch (error) {
      console.error('Error adding task:', error);
      handleFirestoreError(error, OperationType.CREATE, 'tasks');
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      await updateDoc(doc(db, 'tasks', id), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'tasks');
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'tasks');
    }
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
    if (activeSpace === 'all') return true;
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

  return (
    <div className={`flex h-screen bg-[#F8F9FA] dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300`}>
      <Sidebar 
        activeSpace={activeSpace}
        activeView={activeView}
        setActiveSpace={setActiveSpace}
        setActiveView={setActiveView}
        projects={projects}
        companies={companies}
        user={user as any}
        signOut={signOut}
        addProject={addProject}
        deleteProject={deleteProject}
        updateProject={updateProject}
        addCompany={addCompany}
        deleteCompany={deleteCompany}
        updateCompany={updateCompany}
      />

      <main className="flex-1 flex flex-col relative h-full overflow-hidden">
        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border-b border-rose-100 dark:border-rose-900/50">
             <div className="flex items-center justify-between gap-4 max-w-5xl mx-auto">
                <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                   <AlertCircle size={20} />
                   <div>
                      <p className="font-bold text-sm">Erro de Sincronização</p>
                      <p className="text-xs opacity-80">{error}</p>
                   </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setError(null)} className="text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/50 whitespace-nowrap">
                   FECHAR
                </Button>
             </div>
          </div>
        )}
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
                  activeSpace.startsWith('project_') ? (bgColorMap as any)[projects.find(p => `project_${p.id}` === activeSpace)?.color || 'indigo'] || 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' :
                  activeSpace === 'personal' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' :
                  activeSpace.startsWith('company_') ? (bgColorMap as any)[companies.find(c => `company_${c.id}` === activeSpace)?.color || 'rose'] || 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-800' :
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
                <HabitTrackerView habits={habits} onToggle={toggleHabit} activeCategory={activeSpace.startsWith('company') ? 'company' : activeSpace as any} />
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



