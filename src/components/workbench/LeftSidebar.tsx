
"use client";

import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  Search, Database, Table as TableIcon, Bookmark, 
  PlusCircle, Shield, Key, Zap, Info, Hash, Type, Link as LinkIcon
} from 'lucide-react';
import { 
  Accordion, AccordionContent, AccordionItem, AccordionTrigger 
} from '@/components/ui/accordion';
import { REALISTIC_SCHEMA } from '@/lib/mock-schema';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface LeftSidebarProps {
  onAddTable: (schemaId: string) => void;
}

export function LeftSidebar({ onAddTable }: LeftSidebarProps) {
  return (
    <div className="w-64 border-r bg-sidebar flex flex-col h-full shadow-inner">
      <div className="p-4 border-b space-y-4 bg-background/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase">Schema Browser</span>
          </div>
          <button className="text-muted-foreground hover:text-white transition-colors">
            <PlusCircle className="w-4 h-4" />
          </button>
        </div>
        <div className="relative group">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search tables..." 
            className="pl-9 h-9 bg-background/50 text-xs border-white/10 focus-visible:ring-primary/30" 
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3">
          <Accordion type="multiple" className="w-full" defaultValue={['public']}>
            <AccordionItem value="public" className="border-none">
              <AccordionTrigger className="hover:no-underline py-2 px-3 hover:bg-white/5 rounded-lg transition-all text-[11px] font-black text-muted-foreground uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-accent" />
                  Public Schema
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-2 pt-1">
                <div className="space-y-1">
                  {REALISTIC_SCHEMA.map(table => (
                    <TooltipProvider key={table.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div 
                            onClick={() => onAddTable(table.id)}
                            className="flex items-center justify-between group py-2 px-3 text-[11px] text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-lg cursor-pointer transition-all border border-transparent hover:border-primary/20"
                          >
                            <div className="flex items-center gap-2">
                              <TableIcon className="w-3.5 h-3.5 text-primary/40 group-hover:text-primary transition-colors" />
                              <span className="font-medium">{table.name}</span>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <PlusCircle className="w-3 h-3 text-primary" />
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="p-2 w-48 bg-card border shadow-xl">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between border-b pb-1">
                              <span className="text-[10px] font-bold uppercase">{table.name}</span>
                              <span className="text-[9px] text-muted-foreground">{table.columns.length} columns</span>
                            </div>
                            <div className="space-y-1">
                              {table.columns.slice(0, 3).map(c => (
                                <div key={c.name} className="flex items-center justify-between text-[9px]">
                                  <span className="text-muted-foreground">{c.name}</span>
                                  <span className="font-mono text-[8px] uppercase">{c.type}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-background/30 space-y-4">
        <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
          <Key className="w-3 h-3" />
          Favorites
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 cursor-pointer text-[11px] text-muted-foreground group">
            <Zap className="w-3.5 h-3.5 text-yellow-500/70 group-hover:text-yellow-500 transition-colors" /> 
            <span>My Active Queries</span>
            <div className="ml-auto w-4 h-4 bg-yellow-500/20 text-yellow-500 text-[8px] flex items-center justify-center rounded">3</div>
          </div>
          <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 cursor-pointer text-[11px] text-muted-foreground group">
            <Bookmark className="w-3.5 h-3.5 text-primary/70 group-hover:text-primary transition-colors" /> 
            <span>Standard Joins</span>
          </div>
        </div>
      </div>
    </div>
  );
}
