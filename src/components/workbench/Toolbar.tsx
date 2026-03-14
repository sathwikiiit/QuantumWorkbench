
"use client";

import { Button } from '@/components/ui/button';
import { Database, Play, Save, Share2, Settings, ChevronDown, Layers } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export function Toolbar({ onExecute, isExecuting }: { onExecute: () => void, isExecuting: boolean }) {
  return (
    <header className="h-14 border-b bg-background flex items-center justify-between px-4 z-20">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <Layers className="text-white w-5 h-5" />
          </div>
          <h1 className="font-headline font-bold text-lg tracking-tight">QUANTUM WORKBENCH</h1>
        </div>

        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 font-medium">
                <Database className="w-4 h-4 text-accent" />
                <span>Production_v1 (PostgreSQL)</span>
                <ChevronDown className="w-3 h-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>Dev_Local (SQLite)</DropdownMenuItem>
              <DropdownMenuItem>Staging_Internal (MySQL)</DropdownMenuItem>
              <DropdownMenuItem className="text-primary font-bold">+ New Connection</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-2">
          <Save className="w-4 h-4" />
          Save Template
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          Export
        </Button>
        <div className="w-[1px] h-6 bg-border mx-2" />
        <Button 
          variant="default" 
          size="sm" 
          className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
          onClick={onExecute}
          disabled={isExecuting}
        >
          <Play className={cn("w-4 h-4", isExecuting && "animate-pulse")} />
          {isExecuting ? 'Executing...' : 'Run Query'}
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}

import { cn } from '@/lib/utils';
