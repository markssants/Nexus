import * as React from 'react';
import { useState } from 'react';
import { Task } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Flame, 
  Target, 
  ChevronRight, 
  Search, 
  Calendar, 
  Clock 
} from 'lucide-react';
import { motion } from 'motion/react';

interface StudyModuleProps {
  tasks: Task[];
  onAdd: (task: Partial<Task>) => void;
}

export function StudyModule({ tasks, onAdd }: StudyModuleProps) {
  const [newCourse, setNewCourse] = useState('');

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
                  <div className="text-center py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                    <BookOpen size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
                    <p className="text-slate-400 font-medium">Nenhum curso ou livro adicionado.</p>
                  </div>
                ) : (
                  tasks.map(task => (
                    <motion.div 
                      key={task.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-amber-200 dark:hover:border-amber-900/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm text-amber-500 group-hover:scale-110 transition-transform">
                           <BookOpen size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white">{task.title}</h3>
                          <div className="flex items-center gap-3 mt-1">
                             <Badge variant="outline" className="text-[10px] uppercase tracking-wider bg-white dark:bg-slate-800">Em Progresso</Badge>
                             <span className="text-xs text-slate-400 flex items-center gap-1">
                               <Clock size={12} />
                               Atualizado recentemente
                             </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 group-hover:text-amber-500 transition-all" />
                    </motion.div>
                  ))
                )}
                
                <div className="flex gap-3 pt-4">
                  <div className="relative flex-1">
                    <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input 
                      placeholder="Nome do curso, livro ou matéria..." 
                      value={newCourse} 
                      onChange={e => setNewCourse(e.target.value)}
                      className="pl-12 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 focus-visible:ring-amber-500" 
                    />
                  </div>
                  <Button 
                    onClick={() => {
                      if (newCourse) {
                        onAdd({ title: newCourse, category: 'study', status: 'todo', priority: 'medium' });
                        setNewCourse('');
                      }
                    }}
                    className="h-14 px-8 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold shadow-lg shadow-amber-500/20"
                  >
                    Adicionar
                  </Button>
                </div>
             </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
           <Card className="border-none shadow-xl bg-slate-900 text-white rounded-3xl overflow-hidden">
             <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                   <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-amber-400">
                      <Flame size={24} />
                   </div>
                   <Badge className="bg-amber-500 border-none text-white font-bold">HOT STREAK</Badge>
                </div>
                <h3 className="text-3xl font-bold mb-2">12 Dias</h3>
                <p className="text-slate-400 font-medium">Você está em uma sequência incrível de estudos!</p>
                
                <div className="mt-8 space-y-3">
                   <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                      <span>Meta Diária</span>
                      <span className="text-amber-400">85%</span>
                   </div>
                   <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '85%' }}
                        className="h-full bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]" 
                      />
                   </div>
                </div>
             </CardContent>
           </Card>

           <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl">
              <CardHeader>
                 <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Target size={20} className="text-amber-500" />
                    Foco da Semana
                 </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 {[
                   { label: 'React Arquitetura', done: true },
                   { label: 'TypeScript Advanced', done: false },
                   { label: 'Cloud Fundamentals', done: false }
                 ].map((goal, i) => (
                   <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${goal.done ? 'bg-amber-500 border-amber-500' : 'border-slate-300'}`}>
                         {goal.done && <CheckCircle2 size={12} className="text-white" />}
                      </div>
                      <span className={`text-sm font-medium ${goal.done ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>{goal.label}</span>
                   </div>
                 ))}
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
