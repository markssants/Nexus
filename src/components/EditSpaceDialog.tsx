import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { SmilePlus, Palette } from 'lucide-react';
import { projectEmojis, companyEmojis, iconMap } from '../constants';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface EditSpaceDialogProps {
  item: { id: string, name: string, icon?: string, color?: string };
  type: 'project' | 'company';
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: any) => void;
}

export function EditSpaceDialog({ item, type, isOpen, onClose, onUpdate }: EditSpaceDialogProps) {
  const [name, setName] = useState(item.name);
  const [icon, setIcon] = useState(item.icon || (type === 'project' ? '🚀' : '🏢'));
  const [color, setColor] = useState(item.color || (type === 'project' ? 'indigo' : 'rose'));

  useEffect(() => {
    setName(item.name);
    setIcon(item.icon || (type === 'project' ? '🚀' : '🏢'));
    setColor(item.color || (type === 'project' ? 'indigo' : 'rose'));
  }, [item, type]);

  const colors = [
    { name: 'indigo', bg: 'bg-indigo-500' },
    { name: 'blue', bg: 'bg-blue-500' },
    { name: 'emerald', bg: 'bg-emerald-500' },
    { name: 'rose', bg: 'bg-rose-500' },
    { name: 'amber', bg: 'bg-amber-500' },
    { name: 'violet', bg: 'bg-violet-500' },
    { name: 'orange', bg: 'bg-orange-500' },
  ];

  const emojis = type === 'project' ? projectEmojis : companyEmojis;

  const handleSave = () => {
    if (name.trim()) {
      onUpdate(item.id, { name, icon, color });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl dark:bg-slate-900 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="dark:text-white">
            Editar {type === 'project' ? 'Projeto' : 'Empresa'}
          </DialogTitle>
          <DialogDescription className="dark:text-slate-400">
            Altere as informações de {item.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nome</Label>
            <Input 
              value={name} 
              onChange={e => setName(e.target.value)}
              className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Ícone</Label>
            <div className="flex flex-wrap gap-2">
              {emojis.slice(0, 8).map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                    icon === emoji 
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 scale-110 shadow-lg' 
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {emoji}
                </button>
              ))}
              
              <Popover>
                <PopoverTrigger
                  type="button"
                  className={`w-10 h-10 flex items-center justify-center transition-all group ${
                    !emojis.slice(0, 8).includes(icon)
                      ? 'bg-amber-400 text-black rounded-xl scale-110 shadow-lg'
                      : 'hover:scale-110'
                  }`}
                >
                  {!emojis.slice(0, 8).includes(icon) ? (
                    <span className="text-xl">{icon}</span>
                  ) : (
                    <SmilePlus size={24} className="text-amber-500" />
                  )}
                </PopoverTrigger>
                <PopoverContent className="p-0 border-none shadow-2xl rounded-2xl z-[100]" side="right" align="start">
                  <EmojiPicker 
                    theme={document.documentElement.classList.contains('dark') ? Theme.DARK : Theme.LIGHT}
                    onEmojiClick={(emojiData) => setIcon(emojiData.emoji)}
                    lazyLoadEmojis={true}
                    searchPlaceholder="Pesquisar emoji..."
                    // @ts-ignore
                    locale="pt"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Cor</Label>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColor(c.name)}
                  className={`w-8 h-8 rounded-full ${c.bg} transition-all ${
                    color === c.name 
                      ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110 shadow-md' 
                      : 'opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1 dark:border-slate-700 dark:text-slate-300"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              className="flex-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
            >
              Salvar Alterações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
