import * as React from 'react';
import { Task } from '../../types';
import { Card, CardContent } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Calendar, Trash2, Tag, Flag } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { motion } from 'motion/react';

interface TaskListViewProps {
  tasks: Task[];
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

export default function TaskListView({ tasks, onUpdate, onDelete }: TaskListViewProps) {
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.status === 'done' && b.status !== 'done') return 1;
    if (a.status !== 'done' && b.status === 'done') return -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
         <h4 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Feed de Atividades</h4>
         <div className="flex gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Total: {tasks.length}</span>
            <span>Concluídas: {tasks.filter(t => t.status === 'done').length}</span>
         </div>
      </div>

      <div className="space-y-3">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
             <p className="text-slate-400 dark:text-slate-500">Nenhuma tarefa encontrada neste espaço.</p>
          </div>
        ) : (
          sortedTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md ${task.status === 'done' ? 'opacity-60 grayscale-[0.2]' : ''}`}>
                <CardContent className="p-4 flex items-center gap-5">
                   <Checkbox 
                     checked={task.status === 'done'} 
                     onCheckedChange={(checked) => onUpdate(task.id, { status: checked ? 'done' : 'todo' })}
                     className="w-5 h-5 rounded-md dark:border-slate-700"
                   />
                   
                   <div className="flex-1">
                      <h4 className={`font-semibold text-slate-900 dark:text-slate-100 ${task.status === 'done' ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-4 mt-1">
                         <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                            <Tag size={12} />
                            <span className="capitalize">{task.category === 'work' ? 'Trabalho' : task.category === 'personal' ? 'Pessoal' : 'Estudo'}</span>
                         </div>
                         <div className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: task.priority === 'high' ? '#EF4444' : task.priority === 'medium' ? '#3B82F6' : '#94A3B8'}}>
                            <Flag size={12} />
                            <span className="capitalize">{task.priority === 'low' ? 'Baixa' : task.priority === 'medium' ? 'Médio' : 'Alta'}</span>
                         </div>
                         {task.dueDate && (
                           <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                              <Calendar size={12} />
                              <span>{format(parseISO(task.dueDate), 'dd/MM/yyyy')}</span>
                           </div>
                         )}
                      </div>
                   </div>

                   <button onClick={() => onDelete(task.id)} className="p-2 text-slate-300 dark:text-slate-600 hover:text-rose-500 transition-colors">
                      <Trash2 size={16} />
                   </button>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
