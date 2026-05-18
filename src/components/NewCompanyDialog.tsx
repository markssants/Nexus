import * as React from 'react';
import { useState } from 'react';
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
import { Plus, SmilePlus, Palette } from 'lucide-react';
import { companyEmojis } from '../constants';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface NewCompanyDialogProps {
  onAdd: (name: string, icon: string, color: string) => void;
}

export function NewCompanyDialog({ onAdd }: NewCompanyDialogProps) {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🏢');
  const [selectedColor, setSelectedColor] = useState('rose');
  const [isOpen, setIsOpen] = useState(false);

  const colors = [
    { name: 'rose', bg: 'bg-rose-500' },
    { name: 'blue', bg: 'bg-blue-500' },
    { name: 'emerald', bg: 'bg-emerald-500' },
    { name: 'amber', bg: 'bg-amber-500' },
    { name: 'indigo', bg: 'bg-indigo-500' },
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger 
        className="flex items-center justify-center px-3 py-2.5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-all font-medium"
        title="Nova Empresa"
      >
        <Plus size={14} />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl dark:bg-slate-900 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Nova Empresa</DialogTitle>
          <DialogDescription className="dark:text-slate-400">
            Crie um novo espaço para sua empresa.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input 
                placeholder="Nome da empresa..." 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
              <Button 
                onClick={() => {
                  if (name) {
                    onAdd(name, selectedIcon, selectedColor);
                    setName('');
                    setSelectedIcon('🏢');
                    setSelectedColor('rose');
                    setIsOpen(false);
                  }
                }}
                className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
              >
                Adicionar
              </Button>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Escolha um icone</Label>
              <div className="grid grid-cols-8 gap-2">
                {companyEmojis.slice(0, 15).map((emoji) => (
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
                      !companyEmojis.slice(0, 15).includes(selectedIcon)
                        ? 'bg-amber-400 text-black rounded-lg scale-110 shadow-lg'
                        : 'hover:scale-120'
                    }`}
                    title="Mais emojis"
                  >
                    {!companyEmojis.slice(0, 15).includes(selectedIcon) ? (
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
      </DialogContent>
    </Dialog>
  );
}
