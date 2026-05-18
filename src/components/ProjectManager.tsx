import * as React from 'react';
import { useState } from 'react';
import { Project } from '../types';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  Settings, 
  Layers, 
  Trash2,
  Pencil,
  SmilePlus,
  Palette,
  GripVertical
} from 'lucide-react';
import { iconMap, colorMap, projectEmojis } from '../constants';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ProjectManagerProps {
  projects: Project[];
  onAdd: (name: string, icon: string, color: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Project>) => void;
  onReorder: (projects: Project[]) => void;
}

export function ProjectManager({ projects, onDelete, onUpdate, onReorder }: Omit<ProjectManagerProps, 'onAdd'>) {
  const [newName, setNewName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🚀');
  const [selectedColor, setSelectedColor] = useState('indigo');
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = projects.findIndex((p) => p.id === active.id);
      const newIndex = projects.findIndex((p) => p.id === over.id);
      const newProjects = arrayMove(projects, oldIndex, newIndex);
      onReorder(newProjects);
    }
  };

  const colors = [
    { name: 'indigo', bg: 'bg-indigo-500' },
    { name: 'blue', bg: 'bg-blue-500' },
    { name: 'emerald', bg: 'bg-emerald-500' },
    { name: 'rose', bg: 'bg-rose-500' },
    { name: 'amber', bg: 'bg-amber-500' },
    { name: 'violet', bg: 'bg-violet-500' },
    { name: 'orange', bg: 'bg-orange-500' },
  ];

  const extendedColors = [
    { name: 'rose', bg: 'bg-rose-500' },
    { name: 'pink', bg: 'bg-pink-500' },
    { name: 'fuchsia', bg: 'bg-fuchsia-500' },
    { name: 'purple', bg: 'bg-purple-500' },
    { name: 'violet', bg: 'bg-violet-500' },
    { name: 'indigo', bg: 'bg-indigo-500' },
    { name: 'blue', bg: 'bg-blue-500' },
    { name: 'sky', bg: 'bg-sky-500' },
    { name: 'cyan', bg: 'bg-cyan-500' },
    { name: 'teal', bg: 'bg-teal-500' },
    { name: 'emerald', bg: 'bg-emerald-500' },
    { name: 'green', bg: 'bg-green-500' },
    { name: 'lime', bg: 'bg-lime-500' },
    { name: 'yellow', bg: 'bg-yellow-500' },
    { name: 'amber', bg: 'bg-amber-500' },
    { name: 'orange', bg: 'bg-orange-500' },
    { name: 'red', bg: 'bg-red-500' },
    { name: 'slate', bg: 'bg-slate-500' },
    { name: 'zinc', bg: 'bg-zinc-500' },
    { name: 'neutral', bg: 'bg-neutral-500' },
    { name: 'stone', bg: 'bg-stone-500' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        setEditingId(null);
        setNewName('');
      }
    }}>
      <DialogTrigger 
        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-all text-xs font-medium"
      >
        <Settings size={14} />
        Gerenciar Projetos
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl dark:bg-slate-900 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="dark:text-white">
            {editingId ? 'Editar Projeto' : 'Gerenciar Projetos'}
          </DialogTitle>
          <DialogDescription className="dark:text-slate-400">
            {editingId ? 'Altere as informações do seu projeto.' : 'Visualize e edite seus projetos atuais.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {editingId ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Nome do projeto..." 
                    value={newName} 
                    onChange={e => setNewName(e.target.value)} 
                    className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                  <Button 
                    onClick={() => {
                      if (newName && editingId) {
                        onUpdate(editingId, { name: newName, icon: selectedIcon, color: selectedColor });
                        setEditingId(null);
                        setNewName('');
                      }
                    }}
                    className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                  >
                    Salvar
                  </Button>
                  <Button 
                    variant="ghost"
                    onClick={() => setEditingId(null)}
                    className="dark:text-slate-400"
                  >
                    Voltar
                  </Button>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Escolha um icone</Label>
                  <div className="grid grid-cols-8 gap-2">
                    {projectEmojis.slice(0, 15).map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setSelectedIcon(emoji)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all ${
                          selectedIcon === emoji 
                            ? 'bg-slate-900 text-white dark:bg-white scale-110 shadow-md' 
                            : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                    
                    <Popover>
                      <PopoverTrigger
                        type="button"
                        className={`w-8 h-8 flex items-center justify-center transition-all group ${
                          !projectEmojis.slice(0, 15).includes(selectedIcon)
                            ? 'bg-amber-400 text-black rounded-lg scale-110 shadow-lg'
                            : 'hover:scale-120'
                        }`}
                        title="Mais emojis"
                      >
                        {!projectEmojis.slice(0, 15).includes(selectedIcon) ? (
                          <span className="text-lg">{selectedIcon}</span>
                        ) : (
                          <SmilePlus size={22} strokeWidth={2.5} className="text-amber-500 dark:text-amber-400 group-hover:text-amber-600 transition-colors" />
                        )}
                      </PopoverTrigger>
                      <PopoverContent className="p-0 border-none shadow-2xl rounded-2xl z-50 pointer-events-auto" side="right" align="start">
                        <EmojiPicker 
                          theme={document.documentElement.classList.contains('dark') ? Theme.DARK : Theme.LIGHT}
                          onEmojiClick={(emojiData) => {
                            setSelectedIcon(emojiData.emoji);
                          }}
                          lazyLoadEmojis={true}
                          searchDisabled={false}
                          skinTonesDisabled={true}
                          searchPlaceholder="Pesquisar emoji..."
                          // @ts-ignore
                          locale="pt"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Escolha uma Cor</Label>
                  <div className="grid grid-cols-8 gap-2">
                    {colors.map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => setSelectedColor(color.name)}
                        className={`w-8 h-8 rounded-full ${color.bg} transition-all ${
                          selectedColor === color.name 
                            ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110' 
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      />
                    ))}
                    
                    <Popover>
                      <PopoverTrigger
                        type="button"
                        className={`w-8 h-8 rounded-full bg-slate-500 flex items-center justify-center transition-all ${
                          !colors.some(c => c.name === selectedColor)
                            ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110 shadow-lg'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                        title="Mais cores"
                      >
                        <Palette size={14} className="text-white" />
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-3 dark:bg-slate-900 dark:border-slate-800 rounded-2xl shadow-2xl" side="top">
                        <div className="grid grid-cols-5 gap-2">
                          {extendedColors.map((color) => (
                            <button
                              key={color.name}
                              type="button"
                              onClick={() => setSelectedColor(color.name)}
                              className={`w-8 h-8 rounded-full ${color.bg} transition-all ${
                                selectedColor === color.name 
                                  ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110' 
                                  : 'opacity-80 hover:opacity-100'
                              }`}
                            />
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
              {projects.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm italic">
                  Nenhum projeto cadastrado.
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={projects.map(p => p.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {projects.map((project) => (
                        <SortableProjectItem 
                          key={project.id} 
                          project={project} 
                          onEdit={() => {
                            setEditingId(project.id);
                            setNewName(project.name);
                            setSelectedIcon(project.icon || '🚀');
                            setSelectedColor(project.color || 'indigo');
                          }}
                          onDelete={() => onDelete(project.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SortableProjectItem({ project, onEdit, onDelete }: { project: Project; onEdit: () => void; onDelete: () => void; key?: React.Key }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  const colorClass = (colorMap as any)[project.color || 'indigo'] || 'text-indigo-500';
  const isEmoji = !((iconMap as any)[project.icon || '']);

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 ${isDragging ? 'shadow-xl border-slate-200 dark:border-slate-600' : ''}`}
    >
      <div className="flex items-center gap-3">
        <button 
          {...attributes} 
          {...listeners}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-grab active:cursor-grabbing"
        >
          <GripVertical size={14} />
        </button>
        {isEmoji ? (
          <span className="text-lg">{project.icon}</span>
        ) : (
          React.createElement((iconMap as any)[project.icon || 'Layers'] || Layers, { size: 16, className: colorClass })
        )}
        <span className="font-semibold text-sm dark:text-slate-200">{project.name}</span>
      </div>
      <div className="flex items-center gap-1">
        <button 
          onClick={onEdit}
          className="p-1.5 text-slate-400 hover:text-indigo-500 transition-colors"
        >
          <Pencil size={16} />
        </button>
        <button 
          onClick={onDelete}
          className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

