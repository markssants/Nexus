import * as React from 'react';
import { 
  CheckCircle2, 
  User as UserIcon, 
  Briefcase, 
  Layers, 
  Building2, 
  BookOpen, 
  Target, 
  LogOut,
  Pencil,
  Cloud,
  CloudOff,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Company, Project } from '../types';
import { iconMap, colorMap, bgColorMap, solidBgColorMap } from '../constants';
import { ProjectManager } from './ProjectManager';
import { CompanyManager } from './CompanyManager';
import { NewProjectDialog } from './NewProjectDialog';
import { NewCompanyDialog } from './NewCompanyDialog';
import { EditSpaceDialog } from './EditSpaceDialog';
import { Button } from './ui/button';

interface SidebarProps {
  activeSpace: string;
  activeView: string;
  setActiveSpace: (space: string) => void;
  setActiveView: (view: any) => void;
  projects: Project[];
  companies: Company[];
  tasks: any[];
  user: User | null;
  signOut: () => void;
  addProject: (name: string, icon: string, color: string) => void;
  deleteProject: (id: string) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  reorderProjects: (projects: Project[]) => void;
  addCompany: (name: string, icon: string, color: string) => void;
  deleteCompany: (id: string) => void;
  updateCompany: (id: string, updates: Partial<Company>) => void;
  reorderCompanies: (companies: Company[]) => void;
  syncStatus: 'idle' | 'syncing' | 'error';
  isOffline: boolean;
  retrySync: () => void;
  forceSync: () => Promise<void>;
}

export function Sidebar({
  activeSpace,
  activeView,
  setActiveSpace,
  setActiveView,
  projects,
  companies,
  tasks,
  user,
  signOut,
  addProject,
  deleteProject,
  updateProject,
  reorderProjects,
  addCompany,
  deleteCompany,
  updateCompany,
  reorderCompanies,
  syncStatus,
  isOffline,
  retrySync,
  forceSync
}: SidebarProps) {
  const [editingProject, setEditingProject] = React.useState<Project | null>(null);
  const [editingCompany, setEditingCompany] = React.useState<Company | null>(null);

  return (
    <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-20">
      <div className="flex items-center justify-between p-6 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center shadow-lg">
            <CheckCircle2 className="text-white dark:text-slate-900 w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight dark:text-white">Nexus</span>
        </div>
        
        <SyncIndicator status={syncStatus} offline={isOffline} onRetry={retrySync} />
      </div>

      <div className="p-6 pt-2 overflow-y-auto flex-1 scrollbar-hide">

        <div className="mb-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-3">Workspace</p>
          <div className="space-y-1">
            <SidebarItem 
              icon={<UserIcon size={18} />} 
              label="Pessoal" 
              active={activeSpace === 'personal' && activeView !== 'study' && activeView !== 'habits'} 
              onClick={() => {
                setActiveSpace('personal');
                if (activeView === 'study' || activeView === 'habits') setActiveView('kanban');
              }} 
            />
            <SidebarItem 
              icon={<Briefcase size={18} />} 
              label="Trabalho" 
              active={activeSpace === 'work' && activeView !== 'study' && activeView !== 'habits'} 
              onClick={() => {
                setActiveSpace('work');
                if (activeView === 'study' || activeView === 'habits') setActiveView('kanban');
              }} 
            />
          </div>
        </div>

        <div className="my-6 border-t border-slate-100 dark:border-slate-800" />

        <div className="mb-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-3">Projetos</p>
          <div className="space-y-1">
            {projects.map(project => {
              const isEmoji = !((iconMap as any)[project.icon || 'Layers']);
              const IconElement = isEmoji ? (
                <span className="text-lg">{project.icon}</span>
              ) : (
                React.createElement((iconMap as any)[project.icon || 'Layers'] || Layers, { size: 18, className: (colorMap as any)[project.color || 'indigo'] })
              );
              
              return (
                <SidebarItem 
                  key={project.id}
                  icon={IconElement} 
                  label={project.name} 
                  active={activeSpace === `project_${project.id}`} 
                  color={project.color}
                  count={tasks.filter(t => (t as any).projectId === project.id).length}
                  onEdit={() => setEditingProject(project)}
                  onClick={() => {
                    setActiveSpace(`project_${project.id}`);
                    if (activeView === 'study' || activeView === 'habits') setActiveView('kanban');
                  }} 
                />
              );
            })}
            <div className="flex gap-2 mt-2 px-1">
              <div className="flex-1">
                <ProjectManager 
                  projects={projects} 
                  onDelete={deleteProject} 
                  onUpdate={updateProject}
                  onReorder={reorderProjects}
                />
              </div>
              <NewProjectDialog onAdd={addProject} />
            </div>
          </div>
        </div>

        <div className="my-6 border-t border-slate-100 dark:border-slate-800" />

        <div className="mb-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-3">Empresas</p>
          <div className="space-y-1">
            {companies.map(company => {
              const isEmoji = !((iconMap as any)[company.icon || 'Building2']);
              const IconElement = isEmoji ? (
                <span className="text-lg">{company.icon}</span>
              ) : (
                React.createElement((iconMap as any)[company.icon || 'Building2'] || Building2, { size: 18, className: (colorMap as any)[company.color || 'rose'] })
              );

              return (
                <SidebarItem 
                  key={company.id}
                  icon={IconElement} 
                  label={company.name} 
                  active={activeSpace === `company_${company.id}`} 
                  color={company.color}
                  count={tasks.filter(t => (t as any).companyId === company.id).length}
                  onEdit={() => setEditingCompany(company)}
                  onClick={() => {
                    setActiveSpace(`company_${company.id}`);
                    if (activeView === 'study' || activeView === 'habits') setActiveView('kanban');
                  }} 
                />
              );
            })}
            <div className="flex gap-2 mt-2 px-1">
              <div className="flex-1">
                <CompanyManager 
                  companies={companies} 
                  onDelete={deleteCompany} 
                  onUpdate={updateCompany}
                  onReorder={reorderCompanies}
                />
              </div>
              <NewCompanyDialog onAdd={addCompany} />
            </div>
          </div>
        </div>

        <div className="my-6 border-t border-slate-100 dark:border-slate-800" />

        <div className="mb-6">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-3">Módulos</p>
          <div className="space-y-1">
            <SidebarItem 
              icon={<BookOpen size={18} />} 
              label="Estudos" 
              active={activeView === 'study'} 
              onClick={() => setActiveView('study')} 
            />
            <SidebarItem 
              icon={<Target size={18} />} 
              label="Habitos" 
              active={activeView === 'habits'} 
              onClick={() => setActiveView('habits')} 
            />
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
        {user && (
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/30 p-2 rounded-2xl border border-slate-100 dark:border-slate-800/50">
            <img src={(user as any).photoURL || ''} alt="User" className="w-8 h-8 rounded-full border border-white dark:border-slate-700 shadow-sm" />
            <div className="flex-1 overflow-hidden">
                <p className="text-xs font-semibold truncate dark:text-slate-200">{(user as any).displayName}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate">{user.uid}</p>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={forceSync}
            className="flex-1 rounded-xl h-10 text-[10px] uppercase font-bold tracking-wider gap-2 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            disabled={syncStatus === 'syncing' || isOffline}
          >
            <RefreshCw size={14} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
            Forçar Sync
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={signOut}
            className="rounded-xl h-10 px-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
          >
            <LogOut size={16} />
          </Button>
        </div>
      </div>

      {editingProject && (
        <EditSpaceDialog 
          item={editingProject} 
          type="project" 
          isOpen={!!editingProject} 
          onClose={() => setEditingProject(null)} 
          onUpdate={updateProject} 
          onDelete={deleteProject}
        />
      )}

      {editingCompany && (
        <EditSpaceDialog 
          item={editingCompany} 
          type="company" 
          isOpen={!!editingCompany} 
          onClose={() => setEditingCompany(null)} 
          onUpdate={updateCompany} 
          onDelete={deleteCompany}
        />
      )}
    </aside>
  );
}

function SyncIndicator({ status, offline, onRetry }: { status: 'idle' | 'syncing' | 'error', offline: boolean, onRetry: () => void }) {
  if (offline) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-full border border-rose-100 dark:border-rose-500/20 animate-pulse">
        <CloudOff size={12} />
        <span className="text-[10px] font-bold uppercase tracking-tight">Offline</span>
      </div>
    );
  }

  if (status === 'syncing') {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-full border border-blue-100 dark:border-blue-500/20">
        <RefreshCw size={12} className="animate-spin" />
        <span className="text-[10px] font-bold uppercase tracking-tight">Sincronizando</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <button 
        onClick={onRetry}
        className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full border border-amber-100 dark:border-amber-500/20 hover:scale-105 transition-transform"
      >
        <AlertCircle size={12} />
        <span className="text-[10px] font-bold uppercase tracking-tight">Erro</span>
        <RefreshCw size={10} className="ml-0.5 opacity-60" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-100 dark:border-emerald-500/20">
      <Cloud size={12} />
      <span className="text-[10px] font-bold uppercase tracking-tight">Salvo</span>
    </div>
  );
}

function SidebarItem({ 
  icon, 
  label, 
  active, 
  onClick, 
  count, 
  color,
  onEdit
}: { 
  icon: React.ReactNode, 
  label: string, 
  active?: boolean, 
  onClick: () => void, 
  count?: number, 
  color?: string, 
  key?: React.Key,
  onEdit?: () => void
}) {
  const activeClass = color && solidBgColorMap[color as keyof typeof solidBgColorMap] 
    ? `${solidBgColorMap[color as keyof typeof solidBgColorMap]} shadow-lg px-4 scale-[1.02]` 
    : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md';

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group relative ${
        active 
          ? activeClass 
          : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
      }`}
    >
      <div className="flex items-center gap-3 flex-1 overflow-hidden">
        <span className={`${active ? (color ? '' : 'text-white dark:text-slate-900') : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'} transition-colors shrink-0`}>
          {icon}
        </span>
        <span className="font-semibold text-sm truncate">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {onEdit && active && (
          <div 
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className={`p-1.5 rounded-lg transition-all hover:scale-110 ${
              color 
                ? 'bg-black/10 dark:bg-white/20 text-inherit border border-black/5 dark:border-white/5' 
                : 'bg-white/30 dark:bg-slate-900/40 text-inherit border border-white/20 dark:border-slate-700/50'
            }`}
          >
            <Pencil size={12} strokeWidth={2.5} />
          </div>
        )}
        {count !== undefined && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${active ? (color ? 'bg-black/5 dark:bg-white/10 text-inherit' : 'bg-white/20 text-white') : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
            {count}
          </span>
        )}
      </div>
    </button>
  );
}
