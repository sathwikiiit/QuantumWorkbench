"use client";

import { useState } from 'react';
import { useWorkbench } from '@/context/WorkbenchContext';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, Trash2, Globe, ArrowLeft, Copy, Layers, 
  Settings2, Database, Layout, Calendar
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function TemplatesPage() {
  const { profiles, connections, addProfile, deleteProfile, duplicateProfile } = useWorkbench();
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', connectionId: '' });

  const handleAdd = () => {
    if (newTemplate.name && newTemplate.connectionId) {
      addProfile(newTemplate.name, newTemplate.connectionId);
      setIsNewDialogOpen(false);
      setNewTemplate({ name: '', connectionId: '' });
    }
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
            <h1 className="font-headline font-black text-sm tracking-widest uppercase">Templates</h1>
          </div>
        </div>
        <Button onClick={() => setIsNewDialogOpen(true)} className="gap-2 text-[10px] font-black uppercase tracking-widest px-6 h-10">
          <Plus className="w-4 h-4" />
          New Template
        </Button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-headline font-bold tracking-tight">Workspace Templates</h2>
              <p className="text-muted-foreground text-sm">Design reusable graph layouts and query profiles.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profiles.map((p) => {
                const conn = connections.find(c => c.id === p.connectionId);
                return (
                  <Card key={p.id} className="border-border/40 bg-card/40 backdrop-blur-sm hover:border-primary/40 transition-all group overflow-hidden">
                    <CardHeader className="p-5 flex flex-row items-center justify-between pb-2 bg-primary/5">
                      <div className="flex items-center gap-3">
                        <Layout className="w-4 h-4 text-primary" />
                        <CardTitle className="text-sm font-bold">{p.name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => duplicateProfile(p.id)}>
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteProfile(p.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5 space-y-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                          <Database className="w-2.5 h-2.5" /> Data Source
                        </span>
                        <span className="text-xs font-bold text-accent">{conn?.name || 'Unknown Connection'}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Active Tables</span>
                          <span className="text-lg font-headline font-bold">{p.tables.length}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Joins</span>
                          <span className="text-lg font-headline font-bold">{p.joins.length}</span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <Link href="/">
                          <Button className="w-full h-9 text-[10px] font-black uppercase tracking-widest" variant="secondary">
                            Open in Workbench
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
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
                <span className="text-xs font-black uppercase tracking-[0.2em]">Create Template</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              New Workspace Template
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="t-name" className="text-xs font-bold uppercase tracking-widest">Template Name</Label>
              <Input 
                id="t-name" 
                placeholder="e.g. Sales Analysis" 
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="t-conn" className="text-xs font-bold uppercase tracking-widest">Target Connection</Label>
              <Select 
                value={newTemplate.connectionId} 
                onValueChange={(v) => setNewTemplate({ ...newTemplate, connectionId: v })}
              >
                <SelectTrigger id="t-conn">
                  <SelectValue placeholder="Select data source..." />
                </SelectTrigger>
                <SelectContent>
                  {connections.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name} ({c.type})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsNewDialogOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleAdd} disabled={!newTemplate.name || !newTemplate.connectionId}>
              Create Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster />
    </div>
  );
}
