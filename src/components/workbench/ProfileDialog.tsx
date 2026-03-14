
"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Profile } from '@/lib/types';
import { Layers, Trash2, Copy, Edit3 } from 'lucide-react';

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profiles: Profile[];
  onAdd: (name: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  activeProfileId: string;
}

export function ProfileDialog({ open, onOpenChange, profiles, onAdd, onDelete, onDuplicate, activeProfileId }: ProfileDialogProps) {
  const [newName, setNewName] = useState('');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            Manage Profiles & Templates
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="flex gap-2">
            <Input 
              placeholder="New profile name..." 
              value={newName} 
              onChange={e => setNewName(e.target.value)} 
              className="h-9"
            />
            <Button size="sm" onClick={() => { onAdd(newName); setNewName(''); }}>Create</Button>
          </div>

          <div className="border rounded-lg divide-y max-h-[300px] overflow-auto">
            {profiles.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors">
                <div className="flex flex-col">
                  <span className="text-sm font-bold">{p.name}</span>
                  <span className="text-[10px] text-muted-foreground uppercase">{p.tables.length} tables • {p.joins.length} joins</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDuplicate(p.id)} title="Duplicate">
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:text-destructive" 
                    onClick={() => onDelete(p.id)}
                    disabled={profiles.length <= 1}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
