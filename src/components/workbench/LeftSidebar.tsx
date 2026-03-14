
"use client";

import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search, Database, Table as TableIcon, Bookmark, PlusCircle, Shield, Key, Zap } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function LeftSidebar() {
  const schemas = [
    { name: 'public', tables: ['users', 'orders', 'products', 'inventory', 'categories'] },
    { name: 'auth', tables: ['accounts', 'sessions', 'tokens'] },
    { name: 'analytics', tables: ['events', 'page_views'] }
  ];

  return (
    <div className="w-64 border-r bg-sidebar flex flex-col h-full">
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold tracking-widest text-muted-foreground">SCHEMA BROWSER</span>
          </div>
          <button className="text-muted-foreground hover:text-white">
            <PlusCircle className="w-4 h-4" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search schema..." className="pl-8 h-9 bg-background/50 text-xs border-white/10" />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          <Accordion type="multiple" className="w-full" defaultValue={['item-0']}>
            {schemas.map((schema, idx) => (
              <AccordionItem key={schema.name} value={`item-${idx}`} className="border-none">
                <AccordionTrigger className="hover:no-underline py-2 px-2 hover:bg-white/5 rounded transition-colors text-xs font-bold text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Database className="w-3 h-3 text-accent" />
                    {schema.name.toUpperCase()}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-1 pl-4">
                  <div className="space-y-1 pt-1">
                    {schema.tables.map(table => (
                      <div 
                        key={table} 
                        className="flex items-center gap-2 py-1.5 px-2 text-[11px] text-muted-foreground hover:text-foreground hover:bg-white/5 rounded cursor-pointer group"
                      >
                        <TableIcon className="w-3 h-3 text-primary/60 group-hover:text-primary" />
                        {table}
                        <Bookmark className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-background/50 space-y-3">
        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          <Key className="w-3 h-3" />
          Quick Access
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 p-2 rounded hover:bg-white/5 cursor-pointer text-xs text-muted-foreground">
            <Zap className="w-3 h-3 text-yellow-500" /> My Saved Queries
          </div>
          <div className="flex items-center gap-2 p-2 rounded hover:bg-white/5 cursor-pointer text-xs text-muted-foreground">
            <Bookmark className="w-3 h-3 text-primary" /> Common Joins
          </div>
        </div>
      </div>
    </div>
  );
}
