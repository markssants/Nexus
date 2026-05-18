import * as React from 'react';
import { useState } from 'react';
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor, closestCorners, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, Status } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Calendar, MoreVertical, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { format, parseISO } from 'date-fns';

interface KanbanBoardProps {
  tasks: Task[];
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
}

const COLUMNS: { id: Status; title: string }[] = [
  { id: 'todo', title: 'A Fazer' },
  { id: 'in_progress', title: 'Em Andamento' },
  { id: 'done', title: 'Concluído' },
];
export default function KanbanBoard({ tasks, onUpdate, onDelete }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Is it dropping over a column?
    const newStatus = COLUMNS.find(c => c.id === overId)?.id as Status;
    
    if (newStatus) {
      onUpdate(taskId, { status: newStatus });
    } else {
      // Is it dropping over another task?
      const overTask = tasks.find(t => t.id === overId);
      if (overTask && overTask.status !== tasks.find(t => t.id === taskId)?.status) {
        onUpdate(taskId, { status: overTask.status });
      }
    }
    
    setActiveId(null);
  };

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCorners} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-full min-h-[600px]">
        {COLUMNS.map(column => (
          <div key={column.id} className="flex flex-col h-full bg-slate-100/30 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800 transition-colors">
            <div className="flex items-center justify-between mb-6 px-2">
              <div className="flex items-center gap-3">
                 <h3 className="font-bold text-sm tracking-widest uppercase text-slate-500 dark:text-slate-400">{column.title}</h3>
                 <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                   {tasks.filter(t => t.status === column.id).length}
                 </span>
              </div>
            </div>

            <SortableContext id={column.id} items={tasks.filter(t => t.status === column.id).map(t => t.id)} strategy={verticalListSortingStrategy}>
              <div className="flex-1 space-y-4">
                {tasks.filter(t => t.status === column.id).map(task => (
                  <KanbanTask key={String(task.id)} task={task} onDelete={onDelete} />
                ))}
              </div>
            </SortableContext>
          </div>
        ))}
      </div>
    </DndContext>
  );
}

const KanbanTask: React.FC<{ task: Task, onDelete: (id: string) => void }> = ({ task, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const priorityColor = {
    low: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
    medium: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    high: 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group">
        <CardContent className="p-5">
          <div className="flex justify-between items-start mb-3">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${priorityColor[task.priority]}`}>
              {task.priority === 'low' ? 'Baixa' : task.priority === 'medium' ? 'Média' : 'Alta'}
            </span>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-all focus:opacity-100"
            >
               <Trash2 size={14} />
            </button>
          </div>
          <h4 className="font-semibold text-slate-900 dark:text-white leading-snug mb-2">{task.title}</h4>
          {task.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
              {task.description}
            </p>
          )}
          
          <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700">
             <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                <Calendar size={12} />
                <span className="text-[10px] font-medium">
                  {task.dueDate ? format(parseISO(task.dueDate), 'dd/MM') : 'Sem data'}
                </span>
             </div>
             <div className={`w-2 h-2 rounded-full ${
               task.category === 'work' ? 'bg-blue-500' : task.category === 'personal' ? 'bg-emerald-500' : 'bg-amber-500'
             }`} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
