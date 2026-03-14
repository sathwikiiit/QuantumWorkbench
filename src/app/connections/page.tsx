"use client";

import { useState } from 'react';
import { useWorkbench } from '@/context/WorkbenchContext';
import { LeftSidebar } from '@/components/workbench/LeftSidebar';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Database, Plus, Trash2, Terminal, Shield, 
  Settings, Globe, ArrowLeft, Loader2, CheckCircle2, XCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConnectionDialog } from '@/components/workbench/ConnectionDialog';
import Link from 'next/link';

export default function ConnectionsPage() {
  const { connections, addConnection, deleteConnection, testConnection } = useWorkbench();
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  const handleTest = async (id: string) => {
    setTestingId(id);
    await testConnection(id);
    setTestingId(null);
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
            <Database className="w-5 h-5 text-primary" />
            <h1 className="font-headline font-black text-sm tracking-widest uppercase">Connections</h1>
          </div>
        </div>
        <Button onClick={() => setIsNewDialogOpen(true)} className="gap-2 text-[10px] font-black uppercase tracking-widest px-6 h-10">
          <Plus className="w-4 h-4" />
          Add Connection
        </Button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-headline font-bold tracking-tight">Manage Data Sources</h2>
              <p className="text-muted-foreground text-sm">Configure and test connections to your SQL databases.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {connections.map((conn) => (
                <Card key={conn.id} className="border-border/40 bg-card/40 backdrop-blur-sm hover:border-primary/40 transition-all group">
                  <CardHeader className="p-5 flex flex-row items-center justify-between pb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Database className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <CardTitle className="text-sm font-bold">{conn.name}</CardTitle>
                        <Badge variant="outline" className="w-fit text-[9px] uppercase px-1.5 h-4 mt-1">{conn.type}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteConnection(conn.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 pt-2 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Host</span>
                        <span className="text-xs font-mono truncate">{conn.host}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Port</span>
                        <span className="text-xs font-mono">{conn.port}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Database</span>
                        <span className="text-xs font-mono truncate">{conn.databaseName}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Username</span>
                        <span className="text-xs font-mono truncate">{conn.username}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {conn.status === 'connected' ? (
                          <Badge className="bg-green-500/10 text-green-500 border-none text-[9px] gap-1.5">
                            <CheckCircle2 className="w-3 h-3" /> CONNECTED
                          </Badge>
                        ) : conn.status === 'error' ? (
                          <Badge className="bg-destructive/10 text-destructive border-none text-[9px] gap-1.5">
                            <XCircle className="w-3 h-3" /> ERROR
                          </Badge>
                        ) : (
                          <Badge className="bg-muted text-muted-foreground border-none text-[9px] gap-1.5">
                            OFFLINE
                          </Badge>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-[10px] font-black uppercase tracking-widest"
                        onClick={() => handleTest(conn.id)}
                        disabled={testingId === conn.id}
                      >
                        {testingId === conn.id ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Terminal className="w-3 h-3 mr-2" />}
                        Test
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <button 
                onClick={() => setIsNewDialogOpen(true)}
                className="border-2 border-dashed border-border/40 rounded-xl flex flex-col items-center justify-center p-8 gap-4 hover:border-primary/40 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary min-h-[220px]"
              >
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.2em]">New Connection</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConnectionDialog 
        open={isNewDialogOpen} 
        onOpenChange={setIsNewDialogOpen} 
        onSave={(data) => {
          addConnection(data);
          setIsNewDialogOpen(false);
        }} 
        onTest={async (data) => {
          // Temporarily test during creation
          return true;
        }} 
      />
      <Toaster />
    </div>
  );
}
