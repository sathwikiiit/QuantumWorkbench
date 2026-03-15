
"use client";

import { useState } from 'react';
import { useWorkbench } from '@/context/WorkbenchContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, ArrowLeft, Layers, Database, Layout, Edit3 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Template } from '@/lib/types';

export default function TemplatesPage() {
  const { templates, connections, saveTemplate, updateTemplate, applyTemplate, deleteTemplate } = useWorkbench();
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | undefined>(undefined);
  const [newTemplateData, setNewTemplateData] = useState({ name: '', connectionId: '' });

  const handleAdd = async () => {
    if (newTemplateData.name && newTemplateData.connectionId) {
      await saveTemplate(newTemplateData.name, newTemplateData.connectionId);
      setIsNewDialogOpen(false);
      setNewTemplateData({ name: '', connectionId: '' });
    }
  };

  const handleOpenEdit = (t: Template) => {
    setEditingTemplate(t);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (editingTemplate) {
      await updateTemplate(editingTemplate.id, editingTemplate);
      setIsEditDialogOpen(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background selection:bg-primary/30 select-none overflow-hidden">
      <header className="h-14 border-b bg-background flex items-center justify-between px-6 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-primary" />
            <h1 className="font-headline font-black text-sm tracking-widest uppercase">Templates</h1>
          </div>
        </div>
        <Button onClick={() => setIsNewDialogOpen(true)} className="gap-2 text-[10px] font-black uppercase px-6 h-10">
          <Plus className="w-4 h-4" /> New Template
        </Button>
      </header>

      <div className="flex-1 flex overflow-hidden p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto w-full space-y-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-headline font-bold">Workspace Templates</h2>
            <p className="text-muted-foreground text-sm">Design reusable graph layouts for specific connections.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((t) => {
              const conn = connections.find(c => c.id === t.connectionId);
              return (
                <Card key={t.id} className="border-border/40 bg-card/40 backdrop-blur-sm group overflow-hidden">
                  <CardHeader className="p-5 flex flex-row items-center justify-between pb-2 bg-primary/5">
                    <div className="flex items-center gap-3">
                      <Layout className="w-4 h-4 text-primary" />
                      <CardTitle className="text-sm font-bold">{t.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenEdit(t)}><Edit3 className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteTemplate(t.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 space-y-5">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-muted-foreground uppercase flex items-center gap-1.5"><Database className="w-2.5 h-2.5" /> Data Source</span>
                      <span className="text-xs font-bold text-accent">{conn?.name || 'Unknown Connection'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-muted-foreground uppercase">Tables</span>
                        <span className="text-lg font-headline font-bold">{t.tables.length}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-muted-foreground uppercase">Joins</span>
                        <span className="text-lg font-headline font-bold">{t.joins.length}</span>
                      </div>
                    </div>
                    <Link href="/">
                      <Button className="w-full h-9 text-[10px] font-black uppercase" variant="secondary" onClick={() => applyTemplate(t)}>Open in Workbench</Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Workspace Template</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase">Template Name</Label>
              <Input placeholder="e.g. Sales Analysis" value={newTemplateData.name} onChange={(e) => setNewTemplateData({ ...newTemplateData, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase">Target Connection</Label>
              <Select value={newTemplateData.connectionId} onValueChange={(v) => setNewTemplateData({ ...newTemplateData, connectionId: v })}>
                <SelectTrigger><SelectValue placeholder="Select connection..." /></SelectTrigger>
                <SelectContent>
                  {connections.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" onClick={handleAdd} disabled={!newTemplateData.name || !newTemplateData.connectionId}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Template</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase">Template Name</Label>
              <Input value={editingTemplate?.name || ''} onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, name: e.target.value } : undefined)} />
            </div>
          </div>
          <DialogFooter>
            <Button size="sm" onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
