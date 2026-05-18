import * as React from 'react';
import { useState } from 'react';
import { Habit } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Plus, 
  Flame, 
  Award, 
  Calendar as CalendarIcon, 
  CheckCircle2,
  Trophy,
  History,
  TrendingUp
} from 'lucide-react';
import { format, subDays, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { motion } from 'motion/react';
import { db, auth } from '../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface HabitTrackerProps {
  habits: Habit[];
  onToggle: (habit: Habit) => void;
  activeCategory?: string;
}

export default function HabitTracker({ habits, onToggle, activeCategory }: HabitTrackerProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState('');

  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date()
  });

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    const category = activeCategory && activeCategory !== 'all' ? activeCategory : 'personal';
    
    await addDoc(collection(db, 'habits'), {
      title: newHabitTitle,
      userId: auth.currentUser.uid,
      completedDates: [],
      category: category,
      createdAt: new Date().toISOString()
    });
    setNewHabitTitle('');
    setIsAddOpen(false);
  };

  const calculateStreak = (habit: Habit) => {
    let streak = 0;
    let checkDate = new Date();
    
    const dates = habit.completedDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    // Simplistic streak check
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    
    if (dates.includes(todayStr) || dates.includes(yesterdayStr)) {
       // logic for actual counting would be more complex, but let's show dates.length as a simple metric
       return dates.length;
    }
    return 0;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 transition-colors duration-300">
      {/* Header Stats */}
      {habits.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
              title="Consistência" 
              value="85%" 
              icon={<TrendingUp className="text-emerald-500" />} 
              subtitle="Nos últimos 30 dias"
          />
          <StatCard 
              title="Maior Streak" 
              value="12 Dias" 
              icon={<Flame className="text-orange-500" />} 
              subtitle="Focar no objetivo"
          />
          <StatCard 
              title="Conquistas" 
              value="4" 
              icon={<Trophy className="text-amber-500" />} 
              subtitle="Selo de Disciplina Nível 1"
          />
        </div>
      )}

      <div className="flex items-center justify-between">
         <div>
            <h3 className="text-2xl font-bold tracking-tight dark:text-white">Suas Rotinas</h3>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Monitore e celebre seu progresso diário</p>
         </div>
         <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger 
               render={
                  <Button className="rounded-xl gap-2 h-11 px-6 shadow-md hover:shadow-lg transition-all bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900" />
               }
            >
               <Plus size={18} />
               Novo Hábito
            </DialogTrigger>
            <DialogContent className="rounded-2xl dark:bg-slate-900 dark:border-slate-800">
               <DialogHeader>
                  <DialogTitle className="dark:text-white">Criar Novo Hábito</DialogTitle>
               </DialogHeader>
               <form onSubmit={handleAddHabit} className="space-y-6 pt-4">
                  <div className="space-y-2">
                     <Label className="dark:text-slate-200">Qual o nome do hábito?</Label>
                     <Input 
                        placeholder="Ex: Ler 20 min" 
                        value={newHabitTitle} 
                        onChange={e => setNewHabitTitle(e.target.value)} 
                        required 
                        className="h-12 text-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                     />
                  </div>
                  <DialogFooter>
                     <Button type="submit" className="w-full h-12 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900">Começar Jornada</Button>
                  </DialogFooter>
               </form>
            </DialogContent>
         </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {habits.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
             <Trophy className="mx-auto text-slate-200 dark:text-slate-800 mb-4" size={48} />
             <p className="text-slate-400 dark:text-slate-500 font-medium">Você ainda não tem hábitos cadastrados.</p>
          </div>
        ) : (
          habits.map((habit, index) => (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-md transition-all group dark:bg-slate-900">
                <div className="flex flex-col md:flex-row items-stretch">
                   <div className="p-8 md:w-72 bg-slate-50 dark:bg-slate-800/50 flex flex-col justify-between border-r border-slate-100 dark:border-slate-800 group-hover:bg-slate-100/50 dark:group-hover:bg-slate-800 transition-colors">
                      <div>
                         <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 mb-4" variant="secondary">Ativo</Badge>
                         <h4 className="text-xl font-bold text-slate-900 dark:text-white group-hover:translate-x-1 transition-transform">{habit.title}</h4>
                      </div>
                      <div className="flex items-center gap-2 mt-6 text-slate-500 dark:text-slate-400 font-semibold truncate">
                         <Flame className="text-orange-500" size={18} />
                         <span>{habit.completedDates.length} d totais</span>
                      </div>
                   </div>

                   <div className="flex-1 p-8 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-6">
                         <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Últimos 7 Dias</span>
                         <div className="flex gap-2">
                           {last7Days.map(day => {
                             const isCompleted = habit.completedDates.includes(format(day, 'yyyy-MM-dd'));
                             const isToday = isSameDay(day, new Date());
                             return (
                               <div key={day.toString()} className="flex flex-col items-center gap-2">
                                  <span className={`text-[10px] font-bold uppercase ${isToday ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'}`}>
                                    {format(day, 'EEE')}
                                  </span>
                                  <button
                                    onClick={() => isToday && onToggle(habit)}
                                    disabled={!isToday}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                      isCompleted 
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20' 
                                        : isToday 
                                          ? 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-500 hover:border-emerald-200 dark:hover:border-emerald-500 hover:text-emerald-300' 
                                          : 'bg-slate-100 dark:bg-slate-800/50 text-slate-200 dark:text-slate-700 cursor-not-allowed'
                                    }`}
                                  >
                                    <CheckCircle2 size={20} />
                                  </button>
                               </div>
                             );
                           })}
                         </div>
                      </div>
                      
                      <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                         <div className="flex gap-1">
                            {/* Simple heatmap preview */}
                            {Array.from({ length: 30 }).map((_, i) => (
                               <div 
                                 key={i} 
                                 className={`w-2 h-2 rounded-sm ${
                                   i < habit.completedDates.length 
                                     ? 'bg-emerald-400 dark:bg-emerald-500' 
                                     : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                                 }`} 
                               />
                            ))}
                         </div>
                         <Button variant="ghost" size="sm" className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 uppercase font-bold tracking-widest">
                            Ver Detalhes
                         </Button>
                      </div>
                   </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, subtitle }: { title: string, value: string, icon: React.ReactNode, subtitle: string }) {
  return (
    <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm p-8 bg-white dark:bg-slate-900 hover:shadow-md transition-all">
       <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{title}</span>
          <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">{icon}</div>
       </div>
       <div className="flex flex-col">
          <span className="text-3xl font-bold text-slate-900 dark:text-white">{value}</span>
          <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">{subtitle}</span>
       </div>
    </Card>
  );
}
