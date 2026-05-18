/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { useState, useEffect } from 'react';
import { auth, signInWithGoogle, signOut, db } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Task, Habit, Status, Category, Priority } from './types';
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
  ChevronDown
} from 'lucide-react';
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
  const [activeView, setActiveView] = useState<'kanban' | 'list' | 'calendar' | 'habits'>('kanban');
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('nexus-theme');
    return (saved as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('nexus-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

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

    const unsubTasks = onSnapshot(tasksQuery, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
    });

    const unsubHabits = onSnapshot(habitsQuery, (snapshot) => {
      setHabits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit)));
    });

    return () => {
      unsubTasks();
      unsubHabits();
    };
  }, [user]);

  const addTask = async (task: Partial<Task>) => {
    if (!user) return;
    await addDoc(collection(db, 'tasks'), {
      ...task,
      userId: user.uid,
      createdAt: new Date().toISOString(),
      status: 'todo',
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
          <Button 
            onClick={signInWithGoogle}
            className="w-full py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all bg-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            Começar Agora com Google
          </Button>
          <div className="mt-12 flex justify-center gap-8 opacity-40 dark:text-slate-400">
             <Briefcase className="w-6 h-6" />
             <UserIcon className="w-6 h-6" />
             <BookOpen className="w-6 h-6" />
          </div>
        </motion.div>
      </div>
    );
  }

  const filteredTasks = activeCategory === 'all' 
    ? tasks 
    : tasks.filter(t => t.category === activeCategory);

  const filteredHabits = activeCategory === 'all'
    ? habits
    : habits.filter(h => (h as any).category === activeCategory || !(h as any).category);

  return (
    <div className={`flex h-screen bg-[#F8F9FA] dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300`}>
      {/* Sidebar */}
      <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-20">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center shadow-lg">
              <CheckCircle2 className="text-white dark:text-slate-900 w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight dark:text-white">Nexus</span>
          </div>

          <div className="mb-8">
            <DropdownMenu>
              <DropdownMenuTrigger 
                render={
                  <button className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all group">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        activeCategory === 'work' ? 'bg-blue-500' :
                        activeCategory === 'personal' ? 'bg-emerald-500' :
                        activeCategory === 'study' ? 'bg-amber-500' :
                        activeCategory === 'project' ? 'bg-indigo-500' :
                        activeCategory === 'company' ? 'bg-rose-500' : 'bg-slate-400'
                      } text-white`}>
                        {activeCategory === 'work' ? <Briefcase size={16} /> :
                         activeCategory === 'personal' ? <UserIcon size={16} /> :
                         activeCategory === 'study' ? <BookOpen size={16} /> :
                         activeCategory === 'project' ? <Layers size={16} /> :
                         activeCategory === 'company' ? <Building2 size={16} /> : <Hash size={16} />}
                      </div>
                      <div className="text-left overflow-hidden">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Espaço</p>
                        <p className="text-sm font-bold truncate dark:text-slate-200">
                          {activeCategory === 'work' ? 'Trabalho' : 
                           activeCategory === 'personal' ? 'Pessoal' : 
                           activeCategory === 'study' ? 'Estudos' : 
                           activeCategory === 'project' ? 'Projetos' : 
                           activeCategory === 'company' ? 'Empresas' : 'Todos'}
                        </p>
                      </div>
                    </div>
                    <ChevronDown size={16} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
                  </button>
                }
              />
              <DropdownMenuContent className="w-60 rounded-xl dark:bg-slate-900 dark:border-slate-800" align="start">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 py-2">Mudar Estação</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setActiveCategory('personal')} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white"><UserIcon size={16} /></div>
                    <span className="font-semibold">Pessoal</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveCategory('work')} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white"><Briefcase size={16} /></div>
                    <span className="font-semibold">Trabalho</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveCategory('study')} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white"><BookOpen size={16} /></div>
                    <span className="font-semibold">Estudos</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveCategory('project')} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white"><Layers size={16} /></div>
                    <span className="font-semibold">Projetos</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveCategory('company')} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center text-white"><Building2 size={16} /></div>
                    <span className="font-semibold">Empresas</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="dark:bg-slate-800" />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setActiveCategory('all')} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-slate-400 flex items-center justify-center text-white"><Hash size={16} /></div>
                    <span className="font-semibold">Visão Global</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <nav className="space-y-1">
            <SidebarItem 
              icon={<LayoutDashboard size={20} />} 
              label="Kanban" 
              active={activeView === 'kanban'} 
              onClick={() => setActiveView('kanban')} 
            />
            <SidebarItem 
              icon={<ListTodo size={20} />} 
              label="Lista" 
              active={activeView === 'list'} 
              onClick={() => setActiveView('list')} 
            />
            <SidebarItem 
              icon={<CalendarIcon size={20} />} 
              label="Calendário" 
              active={activeView === 'calendar'} 
              onClick={() => setActiveView('calendar')} 
            />
            <SidebarItem 
              icon={<Target size={20} />} 
              label="Hábitos" 
              active={activeView === 'habits'} 
              onClick={() => setActiveView('habits')} 
            />
          </nav>
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
               {activeView === 'kanban' ? 'Fluxo de Trabalho' : 
                activeView === 'list' ? 'Minhas Tarefas' : 
                activeView === 'calendar' ? 'Planejamento' : 'Hábitos & Rotina'}
             </h2>
             {activeCategory !== 'all' && (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border uppercase tracking-wider ${
                  activeCategory === 'work' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-800' :
                  activeCategory === 'personal' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' :
                  activeCategory === 'study' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-800' :
                  activeCategory === 'project' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' :
                  'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                }`}>
                  {activeCategory === 'work' ? 'Trabalho' : 
                   activeCategory === 'personal' ? 'Pessoal' : 
                   activeCategory === 'study' ? 'Estudos' :
                   activeCategory === 'project' ? 'Projeto' : 'Empresa'}
                </span>
             )}
          </div>

          <div className="flex items-center gap-4">
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

             <NewTaskDialog onAdd={addTask} categories={['work', 'personal', 'study', 'project', 'company']} />
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView + activeCategory}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="h-full"
            >
              {activeView === 'kanban' && (
                <KanbanBoard tasks={filteredTasks} onUpdate={updateTask} onDelete={deleteTask} />
              )}
              {activeView === 'list' && (
                <TaskListView tasks={filteredTasks} onUpdate={updateTask} onDelete={deleteTask} />
              )}
              {activeView === 'calendar' && (
                <CalendarView tasks={filteredTasks} />
              )}
              {activeView === 'habits' && (
                <HabitTrackerView habits={filteredHabits} onToggle={toggleHabit} activeCategory={activeCategory} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
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

function NewTaskDialog({ onAdd, categories }: { onAdd: (t: any) => void, categories: string[] }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState<Category>('work');
  const [priority, setPriority] = useState<Priority>('medium');
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ title, description: desc, category, priority });
    setTitle('');
    setDesc('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
                <Select value={category} onValueChange={(v: any) => setCategory(v)}>
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
          <DialogFooter>
            <Button type="submit" className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white">Criar Tarefa</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
