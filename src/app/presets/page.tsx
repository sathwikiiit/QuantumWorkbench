"use client";

import { useState } from 'react';
import { useWorkbench } from '@/context/WorkbenchContext';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ArrowLeft, Key, Plus, Trash2 } from 'lucide-react';

type ParamPair = { key: string; value: string };

export default function PresetsPage() {
  const { presets, savePreset, applyPreset, deletePreset } = useWorkbench();
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [pairs, setPairs] = useState<ParamPair[]>([{ key: '', value: '' }]);

  const handleAddPair = () => setPairs(prev => [...prev, { key: '', value: '' }]);
  const handleRemovePair = (index: number) => setPairs(prev => prev.filter((_, i) => i !== index));
  const handlePairChange = (index: number, field: keyof ParamPair, value: string) => {
    setPairs(prev => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const handleSave = async () => {
    const params = Object.fromEntries(pairs.filter(p => p.key.trim()).map(p => [p.key.trim(), p.value]));
    if (!name.trim() || Object.keys(params).length === 0) return;
    await savePreset(name.trim(), params);
    setName('');
    setPairs([{ key: '', value: '' }]);
    setIsNewDialogOpen(false);
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
            <Key className="w-5 h-5 text-primary" />
            <h1 className="font-headline font-black text-sm tracking-widest uppercase">Presets</h1>
          </div>
        </div>
        <Button onClick={() => setIsNewDialogOpen(true)} className="gap-2 text-[10px] font-black uppercase tracking-widest px-6 h-10">
          <Plus className="w-4 h-4" />
          New Preset
        </Button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-headline font-bold tracking-tight">Parameter Presets</h2>
              <p className="text-muted-foreground text-sm">Create reusable sets of query parameters for fast reuse.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {presets.map((p) => (
                <Card key={p.id} className="border-border/40 bg-card/40 backdrop-blur-sm hover:border-primary/40 transition-all group overflow-hidden">
                  <CardHeader className="p-5 flex flex-row items-center justify-between pb-2 bg-primary/5">
                    <div className="flex items-center gap-3">
                      <Key className="w-4 h-4 text-primary" />
                      <CardTitle className="text-sm font-bold">{p.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deletePreset(p.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 space-y-3">
                    {Object.entries(p.params).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between text-xs">
                        <span className="font-bold">{key}</span>
                        <span className="text-muted-foreground">{value}</span>
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter className="p-5 pt-2">
                    <Button variant="secondary" className="w-full h-9 text-[10px] font-black uppercase tracking-widest" onClick={() => applyPreset(p)}>
                      Apply Preset
                    </Button>
                  </CardFooter>
                </Card>
              ))}

              <button
                onClick={() => setIsNewDialogOpen(true)}
                className="border-2 border-dashed border-border/40 rounded-xl flex flex-col items-center justify-center p-8 gap-4 hover:border-primary/40 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary min-h-[240px]"
              >
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.2em]">Create Preset</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              New Preset
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="preset-name" className="text-xs font-bold uppercase tracking-widest">Preset Name</Label>
              <Input
                id="preset-name"
                placeholder="e.g. Last 30 Days"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest">Parameters</Label>
              {pairs.map((pair, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    placeholder="key"
                    value={pair.key}
                    onChange={(e) => handlePairChange(idx, 'key', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="value"
                    value={pair.value}
                    onChange={(e) => handlePairChange(idx, 'value', e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => handleRemovePair(idx)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" className="w-full" onClick={handleAddPair}>
                Add Parameter
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsNewDialogOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={!name.trim()}>
              Save Preset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster />
    </div>
  );
}
