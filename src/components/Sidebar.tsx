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
  Pencil
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Company, Project } from '../types';
import { iconMap, colorMap, bgColorMap, solidBgColorMap } from '../constants';
import { ProjectManager } from './ProjectManager';
import { CompanyManager } from './CompanyManager';
import { NewProjectDialog } from './NewProjectDialog';
import { NewCompanyDialog } from './NewCompanyDialog';
import { EditSpaceDialog } from './EditSpaceDialog';

interface SidebarProps {
  activeSpace: string;
  activeView: string;
  setActiveSpace: (space: string) => void;
  setActiveView: (view: any) => void;
  projects: Project[];
  companies: Company[];
  tasks: any[];
  user: User;
  signOut: () => void;
  addProject: (name: string, icon: string, color: string) => void;
  deleteProject: (id: string) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  reorderProjects: (projects: Project[]) => void;
  addCompany: (name: string, icon: string, color: string) => void;
  deleteCompany: (id: string) => void;
  updateCompany: (id: string, updates: Partial<Company>) => void;
  reorderCompanies: (companies: Company[]) => void;
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
  reorderCompanies
}: SidebarProps) {
  const [editingProject, setEditingProject] = React.useState<Project | null>(null);
  const [editingCompany, setEditingCompany] = React.useState<Company | null>(null);

  return (
    <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-20">
      <div className="p-6 overflow-y-auto flex-1 scrollbar-hide">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center shadow-lg">
            <CheckCircle2 className="text-white dark:text-slate-900 w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight dark:text-white">Nexus</span>
        </div>

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

      <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
           <img src={(user as any).photoURL || ''} alt="User" className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-700 shadow-sm" />
           <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate dark:text-slate-200">{(user as any).displayName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{(user as any).email}</p>
           </div>
           <button onClick={signOut} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
              <LogOut size={18} />
           </button>
        </div>
        <p className="mt-4 text-[9px] font-bold tracking-[0.1em] text-slate-400 dark:text-slate-500/50 uppercase text-center">Nexus Workspace v1.5</p>
      </div>

      {editingProject && (
        <EditSpaceDialog 
          item={editingProject} 
          type="project" 
          isOpen={!!editingProject} 
          onClose={() => setEditingProject(null)} 
          onUpdate={updateProject} 
        />
      )}

      {editingCompany && (
        <EditSpaceDialog 
          item={editingCompany} 
          type="company" 
          isOpen={!!editingCompany} 
          onClose={() => setEditingCompany(null)} 
          onUpdate={updateCompany} 
        />
      )}
    </aside>
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
