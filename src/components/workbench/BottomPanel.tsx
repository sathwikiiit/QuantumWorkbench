
"use client";

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { QueryResult, ExecutionHistoryItem, Filter, SortRule, FilterOperator, Join, TableInstance } from '@/lib/types';
import { 
  Timer, ListFilter, History, Database, BarChart3, ChevronUp, 
  Trash2, Plus, ArrowUpDown, GitBranch, Settings2, Info
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface BottomPanelProps {
  result: QueryResult | null;
  history: ExecutionHistoryItem[];
  filters: Filter[];
  onUpdateFilter: (id: string, updates: Partial<Filter>) => void;
  onRemoveFilter: (id: string) => void;
  sorting: SortRule[];
  onRemoveSort: (id: string) => void;
  joins: Join[];
  onToggleJoin: (id: string) => void;
  tables: TableInstance[];
  limit: number;
  onLimitChange: (val: number) => void;
}

const OPERATORS: FilterOperator[] = ['=', '!=', '>', '<', '>=', '<=', 'LIKE', 'IN', 'IS NULL', 'IS NOT NULL'];

export function BottomPanel({ 
  result, history, filters, onUpdateFilter, onRemoveFilter, 
  sorting, onRemoveSort, joins, onToggleJoin, tables,
  limit, onLimitChange
}: BottomPanelProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getTableName = (id: string) => tables.find(t => t.id === id)?.name || id;

  return (
    <div className="h-full flex flex-col bg-background">
      <Tabs defaultValue="results" className="flex-1 flex flex-col">
        <div className="px-4 border-b flex items-center justify-between bg-card/80 backdrop-blur-md sticky top-0 z-20">
          <TabsList className="bg-transparent h-12 border-b-0 gap-2">
            <TabsTrigger value="results" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary h-9 px-4 rounded-md transition-all text-[11px] font-black uppercase tracking-widest">
              <Database className="w-3.5 h-3.5 mr-2" />
              RESULTS
            </TabsTrigger>
            <TabsTrigger value="filters" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary h-9 px-4 rounded-md transition-all text-[11px] font-black uppercase tracking-widest">
              <ListFilter className="w-3.5 h-3.5 mr-2" />
              FILTERS ({filters.length})
            </TabsTrigger>
            <TabsTrigger value="sorting" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary h-9 px-4 rounded-md transition-all text-[11px] font-black uppercase tracking-widest">
              <ArrowUpDown className="w-3.5 h-3.5 mr-2" />
              SORTING
            </TabsTrigger>
            <TabsTrigger value="joins" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary h-9 px-4 rounded-md transition-all text-[11px] font-black uppercase tracking-widest">
              <GitBranch className="w-3.5 h-3.5 mr-2" />
              JOINS
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary h-9 px-4 rounded-md transition-all text-[11px] font-black uppercase tracking-widest">
              <History className="w-3.5 h-3.5 mr-2" />
              HISTORY
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Limit:</span>
              <Input 
                type="number" 
                value={limit} 
                onChange={(e) => onLimitChange(parseInt(e.target.value) || 0)}
                className="w-20 h-7 text-xs bg-background/50"
              />
            </div>
            {result && (
              <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground uppercase border-l pl-4">
                <div className="flex items-center gap-1">
                  <Timer className="w-3 h-3 text-accent" /> {result.executionTimeMs}ms
                </div>
                <div className="flex items-center gap-1">
                  <Database className="w-3 h-3 text-primary" /> {result.rowCount} rows
                </div>
              </div>
            )}
          </div>
        </div>

        <TabsContent value="results" className="flex-1 mt-0 overflow-hidden">
          {result ? (
            <ScrollArea className="h-full">
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-sm">
                  <TableRow>
                    {result.columns.map(col => (
                      <TableHead key={col.name} className="text-[10px] font-black uppercase tracking-wider">{col.name}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.rows.map((row, i) => (
                    <TableRow key={i} className="hover:bg-white/5 border-white/5 h-8">
                      {result.columns.map(col => (
                        <TableCell key={col.name} className="text-[11px] font-mono text-muted-foreground py-1">
                          {row[col.name]?.toString() || ''}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm flex-col gap-4 opacity-40">
              <Database className="w-12 h-12" />
              <div className="text-center">
                <p className="font-bold uppercase tracking-widest text-xs">Awaiting Execution</p>
                <p className="text-[10px]">Construct your query graph and hit "Run Query"</p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="filters" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
              {filters.map(filter => (
                <div key={filter.id} className="flex items-center gap-3 p-3 bg-card border rounded-lg group shadow-sm border-white/5 hover:border-primary/30 transition-all">
                  <div className="flex flex-col gap-0.5 min-w-[120px]">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{getTableName(filter.tableId)}</span>
                    <span className="text-xs font-bold text-primary">{filter.column}</span>
                  </div>
                  
                  <Select 
                    value={filter.operator} 
                    onValueChange={(v) => onUpdateFilter(filter.id, { operator: v as FilterOperator })}
                  >
                    <SelectTrigger className="w-[140px] h-9 bg-background/50 text-xs font-mono">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OPERATORS.map(op => (
                        <SelectItem key={op} value={op} className="text-xs font-mono">{op}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {filter.operator !== 'IS NULL' && filter.operator !== 'IS NOT NULL' && (
                    <Input 
                      placeholder={filter.operator === 'IN' ? "val1, val2, val3..." : "Value..."}
                      value={filter.value}
                      onChange={(e) => onUpdateFilter(filter.id, { value: e.target.value })}
                      className="flex-1 h-9 bg-background/50 text-xs font-mono"
                    />
                  )}

                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => onRemoveFilter(filter.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {filters.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-xl opacity-50">
                  <ListFilter className="w-8 h-8 mb-2" />
                  <p className="text-xs font-bold uppercase tracking-widest">No Active Filters</p>
                  <p className="text-[10px]">Pin a column and use the Filter UI to refine results</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="sorting" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {sorting.map(sort => (
                <div key={sort.id} className="flex items-center justify-between p-3 bg-card border rounded-lg group border-white/5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{getTableName(sort.tableId)}</span>
                      <span className="text-xs font-bold text-accent">{sort.column}</span>
                    </div>
                    <Badge variant="outline" className="font-mono text-[10px] uppercase">{sort.order}</Badge>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onRemoveSort(sort.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {sorting.length === 0 && (
                <div className="text-center py-12 text-muted-foreground opacity-50 flex flex-col items-center">
                  <ArrowUpDown className="w-8 h-8 mb-2" />
                  <p className="text-xs font-bold uppercase tracking-widest">No Sort Rules Defined</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="joins" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {joins.map(join => (
                <div key={join.id} className={cn(
                  "flex items-center justify-between p-3 bg-card border rounded-lg transition-all border-white/5",
                  !join.active && "opacity-40 grayscale"
                )}>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-black text-muted-foreground uppercase">{getTableName(join.sourceTableId)}</span>
                      <span className="text-xs font-bold">{join.sourceColumn}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Badge variant="secondary" className="text-[9px] uppercase">{join.type} JOIN</Badge>
                      <div className="w-12 h-[1px] bg-border my-1" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-muted-foreground uppercase">{getTableName(join.targetTableId)}</span>
                      <span className="text-xs font-bold">{join.targetColumn}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Active</span>
                    <span className="text-[10px] text-muted-foreground">{join.active ? 'ON' : 'OFF'}</span>
                    <Switch checked={join.active} onCheckedChange={() => onToggleJoin(join.id)} />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="history" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {history.map(item => (
                <div key={item.id} className="p-4 bg-card border rounded-xl group hover:border-primary/50 transition-all shadow-sm border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-2">
                      <Timer className="w-3 h-3" /> {isMounted ? new Date(item.timestamp).toLocaleTimeString() : '...'}
                    </span>
                    <Badge className="bg-green-500/20 text-green-500 border-none text-[9px]">SUCCESS</Badge>
                  </div>
                  <code className="text-[11px] text-muted-foreground font-mono bg-black/30 p-2 rounded block mb-3 line-clamp-1 border border-white/5">{item.sql}</code>
                  <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-mono">
                    <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" /> {item.metrics.time}ms</span>
                    <span className="flex items-center gap-1"><Database className="w-3 h-3" /> {item.metrics.rows} rows</span>
                    <Button variant="ghost" size="sm" className="ml-auto h-7 text-[10px] font-black uppercase text-primary tracking-widest opacity-0 group-hover:opacity-100">RESTORE STATE</Button>
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm opacity-50">Session history is currently empty.</div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
