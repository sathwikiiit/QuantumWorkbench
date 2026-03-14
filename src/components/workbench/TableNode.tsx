
"use client";

import React, { useState } from 'react';
import { Table, Column } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pin, GripHorizontal, ChevronRight, Hash, Type, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TableNodeProps {
  table: Table;
  onMove: (id: string, x: number, y: number) => void;
  onTogglePin: (tableId: string, colName: string) => void;
}

export function TableNode({ table, onMove, onTogglePin }: TableNodeProps) {
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
      style={{ left: table.position.x, top: table.position.y }}
    >
      <Card className="w-64 border-2 shadow-xl bg-card transition-shadow hover:shadow-primary/10 overflow-hidden">
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
            {table.columns.map((col) => (
              <div 
                key={col.name}
                className={cn(
                  "group flex items-center justify-between px-3 py-2 text-xs border-b border-white/5 hover:bg-white/5 cursor-pointer",
                  table.pinnedColumns.includes(col.name) && "bg-primary/10"
                )}
                onClick={() => onTogglePin(table.id, col.name)}
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
                  <Pin className={cn(
                    "w-3 h-3 transition-opacity", 
                    table.pinnedColumns.includes(col.name) ? "opacity-100 text-primary" : "opacity-0 group-hover:opacity-40"
                  )} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
