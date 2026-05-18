import * as React from 'react';
import { Task, Company, Project } from '../types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { 
  Calendar, 
  Clock, 
  Tag, 
  Layout, 
  Building2, 
  Pencil, 
  Trash2,
  CheckCircle2,
  Circle,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TaskDetailsDialogProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: string) => void;
  companies: Company[];
  projects: Project[];
}

const priorityConfig = {
  low: { label: 'Baixa', color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' },
  medium: { label: 'Média', color: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' },
  high: { label: 'Alta', color: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' },
};

const statusConfig = {
  todo: { label: 'A Fazer', icon: Circle, color: 'text-slate-400' },
  in_progress: { label: 'Em Andamento', icon: Clock, color: 'text-blue-500' },
  done: { label: 'Concluído', icon: CheckCircle2, color: 'text-emerald-500' },
};

export function TaskDetailsDialog({ 
  task, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete,
  onToggleStatus,
  companies, 
  projects 
}: TaskDetailsDialogProps) {
  if (!task) return null;

  const company = companies.find(c => c.id === task.companyId);
  const project = projects.find(p => p.id === task.projectId);
  const StatusIcon = statusConfig[task.status].icon;

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      onDelete(task.id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] rounded-3xl dark:bg-slate-900 dark:border-slate-800 p-0 overflow-hidden border-none shadow-2xl flex flex-col">
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 shrink-0" />
        
        <div className="p-8 flex-1 overflow-y-auto min-h-0">
          <DialogHeader className="flex flex-row items-start justify-between space-y-0 mb-8 pb-6 border-b border-slate-50 dark:border-slate-800/50">
            <div className="flex items-start gap-4">
              <button 
                onClick={() => onToggleStatus(task.id, task.status)}
                className={`p-3 rounded-2xl transition-all shrink-0 mt-1 ${task.status === 'done' ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10' : 'bg-slate-50 text-slate-400 hover:text-slate-600 dark:bg-slate-800 dark:hover:text-slate-300'}`}
              >
                <StatusIcon size={28} />
              </button>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {statusConfig[task.status].label}
                  </span>
                  <span className="text-slate-200 dark:text-slate-700">•</span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${priorityConfig[task.priority].color}`}>
                    Prioridade {priorityConfig[task.priority].label}
                  </span>
                </div>
                <DialogTitle className="text-3xl font-bold dark:text-white leading-tight">
                  {task.title}
                </DialogTitle>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline"
                size="icon" 
                onClick={() => onEdit(task)}
                className="rounded-xl border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <Pencil size={18} />
              </Button>
              <Button 
                variant="outline"
                size="icon" 
                onClick={handleDelete}
                className="rounded-xl border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400"
              >
                <Trash2 size={18} />
              </Button>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-8">
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                  <Layout size={14} />
                  Descrição da Tarefa
                </h4>
                <div className="bg-slate-50 dark:bg-slate-800/20 rounded-3xl p-6 border border-slate-100 dark:border-slate-800/50 min-h-[200px]">
                  {task.description ? (
                    <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed whitespace-pre-wrap">
                      {task.description}
                    </p>
                  ) : (
                    <p className="text-slate-400 italic">Nenhum detalhe adicional fornecido para esta tarefa.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
              <div className="space-y-6">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Tag size={14} />
                  Informações
                </h4>
                
                <div className="space-y-3">
                  {task.dueDate && (
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-transparent dark:border-slate-800/50">
                      <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10 shrink-0">
                        <Calendar size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Prazo Final</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {format(new Date(task.dueDate), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-transparent dark:border-slate-800/50">
                    <div className="p-2.5 rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-700 shrink-0">
                      <Tag size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Categoria</span>
                      <span className="font-semibold text-slate-900 dark:text-white capitalize">{task.category}</span>
                    </div>
                  </div>

                  {project && (
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 bg-emerald-50/30 dark:bg-emerald-500/5 p-4 rounded-2xl border border-emerald-100/50 dark:border-emerald-500/10">
                      <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 shrink-0">
                        <Layout size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Projeto Relacionado</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{project.name}</span>
                      </div>
                    </div>
                  )}

                  {company && (
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 bg-rose-50/30 dark:bg-rose-500/5 p-4 rounded-2xl border border-rose-100/50 dark:border-rose-500/10">
                      <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 shrink-0">
                        <Building2 size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Empresa / Cliente</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{company.name}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-8 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 shrink-0">
          <div className="text-[11px] text-slate-400 font-medium">
             ID: {task.id.substring(0, 8)}...
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose} className="rounded-xl px-6 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
              Fechar
            </Button>
            <Button 
              className={`rounded-xl px-8 h-12 flex items-center gap-2 font-bold transition-all shadow-lg active:scale-95 ${task.status === 'done' ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'}`}
              onClick={() => onToggleStatus(task.id, task.status)}
            >
              {task.status === 'done' ? (
                <>Reabrir Tarefa</>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Marcar como Concluída
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
