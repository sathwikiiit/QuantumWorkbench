
"use client";

import React, { useState } from 'react';
import { Table, Column } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pin, GripHorizontal, ChevronRight, Hash, Type, Calendar, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TableNodeProps {
  table: Table;
  onMove: (id: string, x: number, y: number) => void;
  onTogglePin: (tableId: string, colName: string) => void;
  onColumnClick?: (tableId: string, colName: string) => void;
  isPendingSource?: boolean;
  pendingColumn?: string | null;
}

export function TableNode({ 
  table, 
  onMove, 
  onTogglePin, 
  onColumnClick, 
  isPendingSource,
  pendingColumn 
}: TableNodeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - table.position.x,
      y: e.clientY - table.position.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      onMove(table.id, e.clientX - dragOffset.x, e.clientY - dragOffset.y);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const getIcon = (type: string) => {
    if (type.includes('int') || type.includes('decimal')) return <Hash className="w-3 h-3 text-accent" />;
    if (type.includes('timestamp') || type.includes('date')) return <Calendar className="w-3 h-3 text-accent" />;
    return <Type className="w-3 h-3 text-accent" />;
  };

  return (
    <div
      className="absolute z-10"
      id={`table-${table.id}`}
      style={{ left: table.position.x, top: table.position.y }}
    >
      <Card className={cn(
        "w-64 border-2 shadow-xl bg-card transition-all overflow-hidden",
        isPendingSource ? "border-accent ring-2 ring-accent/20" : "hover:shadow-primary/10"
      )}>
        <CardHeader 
          className="p-3 bg-secondary/50 flex flex-row items-center justify-between cursor-grab active:cursor-grabbing border-b"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-2">
            <GripHorizontal className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-sm font-headline uppercase tracking-wider">{table.name}</CardTitle>
          </div>
          {table.alias && <Badge variant="outline" className="text-[10px] uppercase font-bold">{table.alias}</Badge>}
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-64 overflow-y-auto scrollbar-hide">
            {table.columns.map((col) => {
              const isSelectedForJoin = pendingColumn === col.name;
              
              return (
                <div 
                  key={col.name}
                  id={`col-${table.id}-${col.name}`}
                  className={cn(
                    "group flex items-center justify-between px-3 py-2 text-xs border-b border-white/5 hover:bg-white/5 cursor-pointer relative",
                    table.pinnedColumns.includes(col.name) && "bg-primary/5",
                    isSelectedForJoin && "bg-accent/20"
                  )}
                  onClick={(e) => {
                    // If clicking the text/icon, handle pinning. If clicking the right area, handle joins? 
                    // Let's just make it simple: clicking the row handles join if we are in "connection mode"
                    // But we want pinning too. Let's use the Link icon for joins.
                    if ((e.target as HTMLElement).closest('.join-handle')) {
                      onColumnClick?.(table.id, col.name);
                    } else {
                      onTogglePin(table.id, col.name);
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    {getIcon(col.type)}
                    <span className={cn(col.isPrimary && "font-bold text-accent")}>
                      {col.name}
                      {col.isPrimary && "*"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground opacity-50">{col.type}</span>
                    <button 
                      className={cn(
                        "join-handle p-1 rounded hover:bg-accent/20 transition-all",
                        isSelectedForJoin ? "text-accent opacity-100" : "text-muted-foreground opacity-0 group-hover:opacity-100"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onColumnClick?.(table.id, col.name);
                      }}
                    >
                      <Link2 className="w-3.5 h-3.5" />
                    </button>
                    <Pin className={cn(
                      "w-3 h-3 transition-opacity", 
                      table.pinnedColumns.includes(col.name) ? "opacity-100 text-primary" : "opacity-0 group-hover:opacity-40"
                    )} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
