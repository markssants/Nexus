import * as React from 'react';
import { useState } from 'react';
import { Task } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import { Button } from '../ui/button';

interface CalendarViewProps {
  tasks: Task[];
}

export default function CalendarView({ tasks }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <Card className="rounded-3xl border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm bg-white dark:bg-slate-900 transition-colors duration-300">
      <CardHeader className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Visão geral mensal de compromissos</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth} className="rounded-xl dark:border-slate-700 dark:text-slate-400">
              <ChevronLeft size={20} />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth} className="rounded-xl dark:border-slate-700 dark:text-slate-400">
              <ChevronRight size={20} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-7 border-b border-r border-slate-100 dark:border-slate-800">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <div key={day} className="p-4 text-center text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 border-l border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              {day}
            </div>
          ))}
          {days.map((day, i) => {
            const dayTasks = tasks.filter(t => t.dueDate && isSameDay(parseISO(t.dueDate), day));
            return (
              <div
                key={day.toString()}
                className={`min-h-[140px] p-2 border-l border-t border-slate-100 dark:border-slate-800 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/20 ${
                  !isSameMonth(day, monthStart) ? 'bg-slate-50/30 dark:bg-slate-950/30' : 'bg-white dark:bg-slate-900'
                }`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium mb-2 ${
                   isSameDay(day, new Date()) ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md' : 'text-slate-500 dark:text-slate-400'
                }`}>
                   {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayTasks.map(task => (
                    <div 
                      key={task.id} 
                      className={`px-2 py-1 rounded-md text-[10px] font-bold truncate border shadow-sm ${
                        task.category === 'work' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800' : 
                        task.category === 'personal' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800' : 
                        'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-800'
                      }`}
                    >
                      {task.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
