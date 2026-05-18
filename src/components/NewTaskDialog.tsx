import * as React from 'react';
import { useState, useEffect } from 'react';
import { Task, Category, Priority, Company, Project, Status } from '../types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus } from 'lucide-react';

interface NewTaskDialogProps {
  onAdd: (task: Partial<Task>) => void;
  activeSpace: string;
  companies: Company[];
  projects: Project[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialStatus?: Status;
}

export function NewTaskDialog({ 
  onAdd, 
  activeSpace, 
  companies, 
  projects,
  open,
  onOpenChange,
  initialStatus = 'todo'
}: NewTaskDialogProps) {
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
    if (activeSpace === 'all') {
      setCategory('work');
      setCompanyId(null);
      setProjectId(null);
    } else if (activeSpace === 'personal') {
      setCategory('personal');
      setCompanyId(null);
      setProjectId(null);
    } else if (activeSpace === 'work') {
      setCategory('work');
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
    onAdd({ 
      title, 
      description: desc, 
      category, 
      priority, 
      companyId, 
      projectId, 
      status 
    });
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
            <span className="font-semibold text-sm">Nova Tarefa</span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg rounded-2xl dark:bg-slate-900 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-xl dark:text-white">Criar Nova Tarefa</DialogTitle>
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
                  <SelectValue placeholder="Selecione o espaço" />
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
               Criar Tarefa
             </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
