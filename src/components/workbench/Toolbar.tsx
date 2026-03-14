
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Database, Play, Save, Share2, Settings, 
  ChevronDown, Globe, Terminal, Cpu, Plus, 
  Settings2, Activity
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ConnectionDialog } from './ConnectionDialog';
import { ProfileDialog } from './ProfileDialog';
import { Connection, Profile } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ToolbarProps {
  connections: Connection[];
  activeConnectionId: string;
  onConnectionChange: (id: string) => void;
  onAddConnection: (conn: any) => void;
  onTestConnection: (conn: Connection) => Promise<boolean>;
  onDeleteConnection: (id: string) => void;
  profiles: Profile[];
  activeProfileId: string;
  onProfileChange: (id: string) => void;
  onAddProfile: (name: string) => void;
  onDeleteProfile: (id: string) => void;
  onDuplicateProfile: (id: string) => void;
  onSaveProfile: () => void;
  onExecute: () => void;
  isExecuting: boolean;
}

export function Toolbar({ 
  connections, activeConnectionId, onConnectionChange, onAddConnection, onTestConnection, onDeleteConnection,
  profiles, activeProfileId, onProfileChange, onAddProfile, onDeleteProfile, onDuplicateProfile, onSaveProfile,
  onExecute, isExecuting 
}: ToolbarProps) {
  const [isConnOpen, setIsConnOpen] = useState(false);
  const [isProfOpen, setIsProfOpen] = useState(false);
  
  const activeConn = connections.find(c => c.id === activeConnectionId);
  const activeProfile = profiles.find(p => p.id === activeProfileId);

  return (
    <header className="h-14 border-b bg-background flex items-center justify-between px-4 z-20 shadow-sm">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/30">
            <Cpu className="text-white w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-headline font-black text-sm tracking-tighter leading-none">QUANTUM</h1>
            <span className="text-[9px] font-bold text-muted-foreground tracking-[0.2em]">WORKBENCH</span>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-border mx-2" />

        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 font-bold text-xs h-10 hover:bg-accent/50">
                <Database className="w-4 h-4 text-accent" />
                <div className="flex flex-col items-start">
                  <span className="leading-tight">{activeConn?.name || 'Select Source'}</span>
                  <span className="text-[9px] font-normal text-muted-foreground uppercase">{activeConn?.type}</span>
                </div>
                <ChevronDown className="w-3 h-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground p-3">Available Connections</DropdownMenuLabel>
              {connections.map(conn => (
                <DropdownMenuItem key={conn.id} onClick={() => onConnectionChange(conn.id)} className="flex items-center justify-between p-3">
                  <div className="flex flex-col">
                    <span className="font-bold">{conn.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">{conn.host}</span>
                  </div>
                  <Badge className={cn(
                    "h-2 w-2 p-0 rounded-full",
                    conn.status === 'connected' ? 'bg-green-500' : 'bg-destructive'
                  )} />
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsConnOpen(true)} className="text-primary font-black uppercase text-[10px] p-3 tracking-widest gap-2">
                <Plus className="w-3 h-3" /> Manage Connections
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 font-bold text-xs h-10 hover:bg-accent/50">
                <Globe className="w-4 h-4 text-primary" />
                <div className="flex flex-col items-start">
                  <span className="leading-tight">{activeProfile?.name || 'Select Template'}</span>
                  <span className="text-[9px] font-normal text-muted-foreground uppercase">Active Graph</span>
                </div>
                <ChevronDown className="w-3 h-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground p-3">Workspace Templates</DropdownMenuLabel>
              {profiles.map(p => (
                <DropdownMenuItem key={p.id} onClick={() => onProfileChange(p.id)} className="p-3">
                  <div className="flex flex-col">
                    <span className="font-bold">{p.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">{p.tables.length} tables active</span>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsProfOpen(true)} className="text-primary font-black uppercase text-[10px] p-3 tracking-widest gap-2">
                <Settings2 className="w-3 h-3" /> Manage Profiles
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center bg-secondary/30 rounded-md p-1 border">
          <Button variant="ghost" size="sm" className="h-8 text-xs gap-2 font-bold" onClick={onSaveProfile}>
            <Save className="w-3.5 h-3.5" />
            Save
          </Button>
          <Button variant="ghost" size="sm" className="h-8 text-xs gap-2 font-bold">
            <Share2 className="w-3.5 h-3.5" />
            Export
          </Button>
        </div>

        <div className="w-[1px] h-6 bg-border mx-1" />

        <Button 
          variant="default" 
          size="sm" 
          className="gap-2 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/30 h-10 px-6 font-black uppercase tracking-widest text-[11px]"
          onClick={onExecute}
          disabled={isExecuting}
        >
          {isExecuting ? <Activity className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
          {isExecuting ? 'Processing...' : 'Run Query'}
        </Button>

        <Button variant="ghost" size="icon" className="h-10 w-10">
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      <ConnectionDialog 
        open={isConnOpen} 
        onOpenChange={setIsConnOpen} 
        onSave={onAddConnection} 
        onTest={onTestConnection}
      />
      <ProfileDialog 
        open={isProfOpen} 
        onOpenChange={setIsProfOpen} 
        profiles={profiles} 
        onAdd={onAddProfile} 
        onDelete={onDeleteProfile} 
        onDuplicate={onDuplicateProfile}
        activeProfileId={activeProfileId}
      />
    </header>
  );
}
