"use client";

import { useState } from 'react';
import { useWorkbench } from '@/context/WorkbenchContext';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ArrowLeft, Play, Trash2, Plus, Layers } from 'lucide-react';

export default function SavedQueriesPage() {
  const { savedQueries, templates, saveQuery, applySavedQuery, deleteSavedQuery, executeQuery } = useWorkbench();

  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTemplate, setNewTemplate] = useState<string>(templates[0]?.id || '');

  const handleCreate = async () => {
    if (!newName) return;
    const templateId = newTemplate || templates[0]?.id || '';
    await saveQuery(newName, templateId);
    setIsNewDialogOpen(false);
    setNewName('');
    setNewTemplate(templates[0]?.id || '');
  };

  const handleRun = async (query: typeof savedQueries[number]) => {
    await applySavedQuery(query);
    await executeQuery();
  };

  return (
    <div className="h-screen flex flex-col bg-background selection:bg-primary/30 select-none overflow-hidden">
      <header className="h-14 border-b bg-background flex items-center justify-between px-6 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-primary" />
            <h1 className="font-headline font-black text-sm tracking-widest uppercase">Saved Queries</h1>
          </div>
        </div>
        <Button onClick={() => setIsNewDialogOpen(true)} className="gap-2 text-[10px] font-black uppercase tracking-widest px-6 h-10">
          <Plus className="w-4 h-4" />
          Save Current
        </Button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-headline font-bold tracking-tight">Manage Saved Queries</h2>
              <p className="text-muted-foreground text-sm">Store and recall query configurations without rebuilding the graph.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedQueries.map((q) => {
                const template = templates.find(t => t.id === q.templateId);
                return (
                  <Card key={q.id} className="border-border/40 bg-card/40 backdrop-blur-sm hover:border-primary/40 transition-all group overflow-hidden">
                    <CardHeader className="p-5 flex flex-row items-center justify-between pb-2 bg-primary/5">
                      <div className="flex items-center gap-3">
                        <Play className="w-4 h-4 text-primary" />
                        <CardTitle className="text-sm font-bold">{q.name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRun(q)}>
                          <Play className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteSavedQuery(q.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Template</span>
                        <span className="text-xs font-bold text-accent">{template?.name ?? '—'}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Joins</span>
                          <span className="text-lg font-headline font-bold">{q.enabledJoins.length}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Params</span>
                          <span className="text-lg font-headline font-bold">{Object.keys(q.params).length}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-5 pt-2">
                      <Button variant="secondary" className="w-full h-9 text-[10px] font-black uppercase tracking-widest" onClick={() => handleRun(q)}>
                        Run Query
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}

              <button
                onClick={() => setIsNewDialogOpen(true)}
                className="border-2 border-dashed border-border/40 rounded-xl flex flex-col items-center justify-center p-8 gap-4 hover:border-primary/40 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary min-h-[240px]"
              >
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.2em]">New Saved Query</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-primary" />
              Save Query
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="q-name" className="text-xs font-bold uppercase tracking-widest">Query Name</Label>
              <Input
                id="q-name"
                placeholder="e.g. Sales by Region"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="q-template" className="text-xs font-bold uppercase tracking-widest">Based On Template</Label>
              <Select value={newTemplate} onValueChange={(v) => setNewTemplate(v)}>
                <SelectTrigger id="q-template">
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsNewDialogOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreate} disabled={!newName || !newTemplate}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster />
    </div>
  );
}
