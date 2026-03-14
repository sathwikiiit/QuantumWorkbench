
"use client";

import { Button } from '@/components/ui/button';
import { 
  Database, Play, Save, Share2, Settings, 
  ChevronDown, Layers, Connection as ConnIcon,
  Globe, Terminal, Cpu
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ToolbarProps {
  connections: any[];
  activeConnectionId: string;
  onConnectionChange: (id: string) => void;
  profiles: any[];
  activeProfileId: string;
  onProfileChange: (id: string) => void;
  onExecute: () => void;
  isExecuting: boolean;
}

export function Toolbar({ 
  connections, 
  activeConnectionId, 
  onConnectionChange,
  profiles,
  activeProfileId,
  onProfileChange,
  onExecute, 
  isExecuting 
}: ToolbarProps) {
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
              <Button variant="ghost" size="sm" className="gap-2 font-bold text-xs h-9">
                <Database className="w-4 h-4 text-accent" />
                <div className="flex flex-col items-start">
                  <span className="leading-tight">{activeConn?.name || 'Select Connection'}</span>
                  <span className="text-[9px] font-normal text-muted-foreground uppercase">{activeConn?.type}</span>
                </div>
                <ChevronDown className="w-3 h-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground">Connections</DropdownMenuLabel>
              {connections.map(conn => (
                <DropdownMenuItem key={conn.id} onClick={() => onConnectionChange(conn.id)} className="flex items-center justify-between">
                  <span>{conn.name}</span>
                  {conn.status === 'connected' && <div className="w-2 h-2 rounded-full bg-green-500" />}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-primary font-bold">Manage Connections...</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 font-bold text-xs h-9">
                <Globe className="w-4 h-4 text-primary" />
                <div className="flex flex-col items-start">
                  <span className="leading-tight">{activeProfile?.name || 'Select Profile'}</span>
                  <span className="text-[9px] font-normal text-muted-foreground uppercase">Template</span>
                </div>
                <ChevronDown className="w-3 h-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground">Active Profiles</DropdownMenuLabel>
              {profiles.map(p => (
                <DropdownMenuItem key={p.id} onClick={() => onProfileChange(p.id)}>
                  {p.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-primary font-bold">New Profile...</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center bg-secondary/30 rounded-md p-1 border">
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-2">
            <Save className="w-3.5 h-3.5" />
            Save
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-2">
            <Share2 className="w-3.5 h-3.5" />
            Export
          </Button>
        </div>

        <div className="w-[1px] h-6 bg-border mx-1" />

        <Button 
          variant="default" 
          size="sm" 
          className="gap-2 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 h-9 px-4 font-bold"
          onClick={onExecute}
          disabled={isExecuting}
        >
          {isExecuting ? (
            <Terminal className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-current" />
          )}
          {isExecuting ? 'EXECUTING...' : 'RUN QUERY'}
        </Button>

        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
