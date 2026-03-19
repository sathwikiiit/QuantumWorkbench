"use client";

import React, { useState, useMemo } from 'react';
import { TableInstance, Column } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Pin, GripHorizontal, Hash, Type, Calendar, Link2, 
  Trash2, Anchor, Search, X, CheckCircle2, AlertCircle,
  ListFilter, ArrowUpDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useWorkbench } from '@/context/WorkbenchContext';

interface TableNodeProps {
  table: TableInstance;
  isRoot: boolean;
  isReachable: boolean;
  onMove: (id: string, x: number, y: number) => void;
  onTogglePin: (tableId: string, colName: string) => void;
  onColumnClick?: (tableId: string, colName: string) => void;
  onRemove: (id: string) => void;
  onSetRoot: (id: string) => void;
  onAddFilter: (tableId: string, colName: string) => void;
  onAddSort: (tableId: string, colName: string) => void;
  isPendingSource?: boolean;
  pendingColumn?: string | null;
}

export function TableNode({ 
  table, 
  isRoot,
  isReachable,
  onMove, 
  onTogglePin, 
  onColumnClick, 
  onRemove,
  onSetRoot,
  onAddFilter,
  onAddSort,
  isPendingSource,
  pendingColumn 
}: TableNodeProps) {
  const { schema } = useWorkbench();

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [search, setSearch] = useState('');

  const schemaItem = useMemo(() => 
    schema.find(s => s.id === table.schemaId) ?? { id: '', name: table.name, columns: [], schemaName: 'public' }, 
  [schema, table.schemaId, table.name]);

  const filteredColumns = useMemo(() => 
    schemaItem.columns.filter(c => c.name.toLowerCase().includes(search.toLowerCase())),
  [schemaItem.columns, search]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - table.position.x,
      y: e.clientY - table.position.y
    });
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        onMove(table.id, e.clientX - dragOffset.x, e.clientY - dragOffset.y);
      }
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, onMove, table.id]);

  const getIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('int') || t.includes('decimal') || t.includes('number') || t.includes('float')) return <Hash className="w-3 h-3 text-accent" />;
    if (t.includes('timestamp') || t.includes('date') || t.includes('time')) return <Calendar className="w-3 h-3 text-accent" />;
    return <Type className="w-3 h-3 text-accent" />;
  };

  return (
    <div
      className="absolute z-10 group/node"
      id={`table-${table.id}`}
      style={{ left: table.position.x, top: table.position.y }}
    >
      <Card className={cn(
        "w-64 border-2 shadow-2xl bg-card transition-all overflow-hidden flex flex-col",
        isPendingSource ? "border-accent ring-4 ring-accent/20" : "hover:shadow-primary/20",
        isRoot ? "border-primary" : "border-border"
      )}>
        <CardHeader 
          className={cn(
            "p-3 flex flex-row items-center justify-between cursor-grab active:cursor-grabbing border-b min-w-0",
            isRoot ? "bg-primary/20" : "bg-secondary/50"
          )}
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-2 min-w-0">
            <GripHorizontal className="w-4 h-4 text-muted-foreground" />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <CardTitle className="text-[11px] font-bold uppercase tracking-widest truncate min-w-0">{table.name}</CardTitle>
                <Badge variant="outline" className="text-[8px] px-1 h-3 opacity-60 font-mono">{schemaItem.schemaName || 'public'}</Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
             <button 
              onClick={() => onSetRoot(table.id)}
              className={cn("p-1.5 rounded hover:bg-white/10 transition-colors", isRoot ? "text-primary" : "text-muted-foreground")}
              title="Set as Root Table"
            >
              <Anchor className="w-3.5 h-3.5" />
            </button>
            <button 
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onRemove(table.id);
              }}
              className="p-1.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
              title="Remove Table"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </CardHeader>

        <div className="px-2 py-1.5 border-b bg-background/50 relative">
          <Search className="absolute left-4 top-2.5 w-3 h-3 text-muted-foreground" />
          <Input 
            placeholder="Search columns..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-7 pl-7 text-[10px] bg-transparent border-none focus-visible:ring-0"
          />
        </div>

        <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
          <div className="max-h-64 overflow-y-auto scrollbar-hide flex-1">
            <TooltipProvider delayDuration={0}>
              {filteredColumns.map((col) => {
                const isPinned = table.pinnedColumns.includes(col.name);
                const isSelectedForJoin = pendingColumn === col.name;
                
                return (
                  <div 
                    key={col.name}
                    id={`col-${table.id}-${col.name}`}
                    className={cn(
                      "group/row flex items-center justify-between px-3 py-1.5 text-[11px] border-b border-white/5 hover:bg-white/5 cursor-pointer relative",
                      isPinned && "bg-primary/5",
                      isSelectedForJoin && "bg-accent/20"
                    )}
                    onClick={() => onTogglePin(table.id, col.name)}
                  >
                    <div className="flex items-center gap-2 max-w-[120px] truncate">
                      {getIcon(col.type)}
                      <span className={cn(
                        "truncate",
                        col.isPrimary && "font-bold text-accent underline decoration-accent/30 underline-offset-2",
                        col.isForeignKey && "text-primary/80"
                      )}>
                        {col.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            className="p-1 rounded hover:bg-primary/20 text-muted-foreground opacity-0 group-hover/row:opacity-100 transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddFilter(table.id, col.name);
                            }}
                          >
                            <ListFilter className="w-3 h-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Add Filter</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            className="p-1 rounded hover:bg-primary/20 text-muted-foreground opacity-0 group-hover/row:opacity-100 transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddSort(table.id, col.name);
                            }}
                          >
                            <ArrowUpDown className="w-3 h-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Add Sort</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            className={cn(
                              "join-handle p-1 rounded hover:bg-accent/20 transition-all",
                              isSelectedForJoin ? "text-accent opacity-100" : "text-muted-foreground opacity-0 group-hover/row:opacity-100"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              onColumnClick?.(table.id, col.name);
                            }}
                          >
                            <Link2 className="w-3 h-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Create Join</TooltipContent>
                      </Tooltip>

                      <Pin className={cn(
                        "w-2.5 h-2.5 transition-all ml-1", 
                        isPinned ? "opacity-100 text-primary scale-110" : "opacity-0 group-hover/row:opacity-40"
                      )} />
                    </div>
                  </div>
                );
              })}
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}