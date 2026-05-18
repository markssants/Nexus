import * as React from 'react';
import { useState, useEffect } from 'react';
import { Task, Category, Priority, Company, Project, Status } from '../types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Trash2 } from 'lucide-react';

interface TaskEditDialogProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  companies: Company[];
  projects: Project[];
}

export function TaskEditDialog({ 
  task, 
  isOpen, 
  onClose, 
  onUpdate, 
  onDelete,
  companies, 
  projects 
}: TaskEditDialogProps) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState<Category>('work');
  const [status, setStatus] = useState<Status>('todo');
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (task && isOpen) {
      setTitle(task.title);
      setDesc(task.description || '');
      setCategory(task.category);
      setStatus(task.status);
      setCompanyId(task.companyId || null);
      setProjectId(task.projectId || null);
      setPriority(task.priority);
      setDueDate(task.dueDate || '');
    }
  }, [task, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    
    onUpdate(task.id, { 
      title, 
      description: desc, 
      category, 
      priority, 
      companyId, 
      projectId, 
      status,
      dueDate: dueDate || undefined
    });
    onClose();
  };

  const handleDelete = () => {
    if (!task) return;
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      onDelete(task.id);
      onClose();
    }
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-2xl dark:bg-slate-900 dark:border-slate-800">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl dark:text-white">Editar Tarefa</DialogTitle>
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleDelete}
                className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
            >
                <Trash2 size={18} />
            </Button>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="dark:text-slate-200">Título</Label>
            <Input 
              placeholder="O que precisa ser feito?" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required
              className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="dark:text-slate-200">Descrição</Label>
            <Textarea 
              placeholder="Adicione mais detalhes..." 
              value={desc} 
              onChange={e => setDesc(e.target.value)}
              className="dark:bg-slate-800 dark:border-slate-700 dark:text-white resize-none h-24"
            />
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
                      <SelectItem value="project">Projeto</SelectItem>
                      <SelectItem value="company">Empresa</SelectItem>
                      <SelectItem value="study">Estudo</SelectItem>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label className="dark:text-slate-200">Status</Label>
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
            <div className="space-y-2">
                <Label className="dark:text-slate-200">Prazo</Label>
                <Input 
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
            </div>
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
          <DialogFooter className="pt-4">
             <Button type="submit" className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 py-6 text-lg rounded-xl">
               Salvar Alterações
             </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
