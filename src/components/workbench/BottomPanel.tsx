"use client";

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { QueryResult, ExecutionHistoryItem } from '@/lib/types';
import { Timer, ListFilter, History, Database, BarChart3, ChevronUp } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export function BottomPanel({ result, history }: { result: QueryResult | null, history: ExecutionHistoryItem[] }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="h-full flex flex-col bg-background">
      <Tabs defaultValue="results" className="flex-1 flex flex-col">
        <div className="px-4 border-b flex items-center justify-between bg-card">
          <TabsList className="bg-transparent h-10 border-b-0">
            <TabsTrigger value="results" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary h-8 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all">
              <Database className="w-3 h-3 mr-2" />
              QUERY RESULTS
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary h-8 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all">
              <History className="w-3 h-3 mr-2" />
              EXECUTION HISTORY
            </TabsTrigger>
            <TabsTrigger value="metrics" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary h-8 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all">
              <BarChart3 className="w-3 h-3 mr-2" />
              PERFORMANCE
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-4">
            {result && (
              <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground uppercase">
                <div className="flex items-center gap-1">
                  <Timer className="w-3 h-3" /> {result.executionTimeMs}ms
                </div>
                <div className="flex items-center gap-1">
                  <ListFilter className="w-3 h-3" /> {result.rowCount} rows
                </div>
              </div>
            )}
            <button className="p-1 hover:bg-secondary rounded">
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        <TabsContent value="results" className="flex-1 mt-0 overflow-hidden">
          {result ? (
            <ScrollArea className="h-full">
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0 z-10">
                  <TableRow>
                    {result.columns.map(col => (
                      <TableHead key={col} className="text-[10px] font-bold uppercase tracking-wider">{col}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.rows.map((row, i) => (
                    <TableRow key={i} className="hover:bg-white/5 border-white/5">
                      {result.columns.map(col => (
                        <TableCell key={col} className="text-xs font-mono text-muted-foreground">
                          {row[col]?.toString() || String(row[Object.keys(row)[0]])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm flex-col gap-2">
              <Database className="w-8 h-8 opacity-20" />
              No active results. Run a query to see data.
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {history.map(item => (
                <div key={item.id} className="p-3 bg-card border rounded-md group hover:border-primary/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {isMounted ? item.timestamp.toLocaleTimeString() : '...'}
                    </span>
                    <span className="text-[10px] font-bold text-accent uppercase">STATUS: 200 OK</span>
                  </div>
                  <code className="text-[11px] text-muted-foreground line-clamp-1 block mb-2">{item.sql}</code>
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-mono">
                    <span>TIME: {item.metrics.time}ms</span>
                    <span>ROWS: {item.metrics.rows}</span>
                    <button className="ml-auto text-primary opacity-0 group-hover:opacity-100 transition-opacity">RESTORE</button>
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <div className="text-center py-10 text-muted-foreground text-sm">Session history is empty.</div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
