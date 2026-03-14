
"use client";

import { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  TableInstance, Join, Column, QueryResult, ExecutionHistoryItem, 
  Connection, Profile, Filter, SortRule, TableSchema, FilterOperator 
} from '@/lib/types';
import { REALISTIC_SCHEMA } from '@/lib/mock-schema';
import { toast } from '@/hooks/use-toast';

export function useWorkbenchState() {
  // --- Connections ---
  const [connections, setConnections] = useState<Connection[]>([
    { id: 'c1', name: 'Production_v1', type: 'PostgreSQL', host: 'db.prod.internal', port: 5432, databaseName: 'main', username: 'admin', status: 'connected' },
    { id: 'c2', name: 'Staging_Replica', type: 'MySQL', host: 'db.staging.internal', port: 3306, databaseName: 'staging', username: 'developer', status: 'disconnected' }
  ]);
  const [activeConnectionId, setActiveConnectionId] = useState<string>('c1');

  // --- Profiles ---
  const [profiles, setProfiles] = useState<Profile[]>([
    {
      id: 'p1',
      name: 'Sales Overview',
      connectionId: 'c1',
      tables: [],
      joins: [],
      rootTableId: null,
      selectedColumns: [],
      filters: [],
      sorting: [],
      limit: 50
    }
  ]);
  const [activeProfileId, setActiveProfileId] = useState<string>('p1');

  // --- Current Workbench State ---
  const [tables, setTables] = useState<TableInstance[]>([]);
  const [joins, setJoins] = useState<Join[]>([]);
  const [rootTableId, setRootTableId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [sorting, setSorting] = useState<SortRule[]>([]);
  const [limit, setLimit] = useState<number>(50);

  // --- UI State ---
  const [generatedSql, setGeneratedSql] = useState<string>('');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [history, setHistory] = useState<ExecutionHistoryItem[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [pendingJoin, setPendingJoin] = useState<{tableId: string, column: string} | null>(null);

  // --- Reachability Engine ---
  const reachableTables = useMemo(() => {
    if (!rootTableId) return new Set<string>();
    const reachable = new Set<string>();
    const queue = [rootTableId];
    reachable.add(rootTableId);

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      joins.forEach(join => {
        if (!join.active) return;
        if (join.sourceTableId === currentId && !reachable.has(join.targetTableId)) {
          reachable.add(join.targetTableId);
          queue.push(join.targetTableId);
        } else if (join.targetTableId === currentId && !reachable.has(join.sourceTableId)) {
          reachable.add(join.sourceTableId);
          queue.push(join.sourceTableId);
        }
      });
    }
    return reachable;
  }, [rootTableId, joins]);

  // --- Profile Switching ---
  useEffect(() => {
    const p = profiles.find(prof => prof.id === activeProfileId);
    if (p) {
      setTables(p.tables || []);
      setJoins(p.joins || []);
      setRootTableId(p.rootTableId || null);
      setFilters(p.filters || []);
      setSorting(p.sorting || []);
      setLimit(p.limit || 50);
    }
  }, [activeProfileId]);

  // --- Actions ---
  const addTableToCanvas = useCallback((schemaId: string) => {
    const schema = REALISTIC_SCHEMA.find(s => s.id === schemaId);
    if (!schema) return;

    const newInstanceId = `${schemaId}_${Date.now()}`;
    const newInstance: TableInstance = {
      id: newInstanceId,
      schemaId: schema.id,
      name: schema.name,
      position: { x: 100 + (tables.length * 40), y: 100 + (tables.length * 40) },
      pinnedColumns: schema.columns.slice(0, 4).map(c => c.name),
      isRoot: tables.length === 0
    };

    if (tables.length === 0) setRootTableId(newInstanceId);
    setTables(prev => [...prev, newInstance]);

    // Auto-FK Detection
    schema.columns.forEach(col => {
      if (col.isForeignKey && col.references) {
        const target = tables.find(t => t.name === col.references?.table);
        if (target) {
          const newJoin: Join = {
            id: `join_${Date.now()}_${Math.random()}`,
            sourceTableId: newInstanceId,
            sourceColumn: col.name,
            targetTableId: target.id,
            targetColumn: col.references.column,
            type: 'INNER',
            active: true
          };
          setJoins(prev => [...prev, newJoin]);
        }
      }
    });
  }, [tables]);

  const removeTableFromCanvas = useCallback((id: string) => {
    setTables(prev => prev.filter(t => t.id !== id));
    setJoins(prev => prev.filter(j => j.sourceTableId !== id && j.targetTableId !== id));
    setFilters(prev => prev.filter(f => f.tableId !== id));
    setSorting(prev => prev.filter(s => s.tableId !== id));
    if (rootTableId === id) setRootTableId(null);
  }, [rootTableId]);

  const updateTablePosition = useCallback((id: string, x: number, y: number) => {
    setTables(prev => prev.map(t => t.id === id ? { ...t, position: { x, y } } : t));
  }, []);

  const togglePin = useCallback((tableId: string, colName: string) => {
    setTables(prev => prev.map(t => {
      if (t.id !== tableId) return t;
      const isPinned = t.pinnedColumns.includes(colName);
      return {
        ...t,
        pinnedColumns: isPinned 
          ? t.pinnedColumns.filter(c => c !== colName) 
          : [...t.pinnedColumns, colName]
      };
    }));
  }, []);

  const setAsRoot = useCallback((id: string) => {
    setRootTableId(id);
    toast({ title: 'Root Table Updated', description: `Query generation now starts from ${tables.find(t => t.id === id)?.name}.` });
  }, [tables]);

  // --- Filter Management ---
  const addFilter = useCallback((tableId: string, column: string) => {
    const newFilter: Filter = {
      id: `filter-${Date.now()}`,
      tableId,
      column,
      operator: '=',
      value: ''
    };
    setFilters(prev => [...prev, newFilter]);
  }, []);

  const updateFilter = useCallback((id: string, updates: Partial<Filter>) => {
    setFilters(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  }, []);

  const removeFilter = useCallback((id: string) => {
    setFilters(prev => prev.filter(f => f.id !== id));
  }, []);

  // --- Sort Management ---
  const addSort = useCallback((tableId: string, column: string) => {
    const newSort: SortRule = {
      id: `sort-${Date.now()}`,
      tableId,
      column,
      order: 'ASC'
    };
    setSorting(prev => [...prev, newSort]);
  }, []);

  const removeSort = useCallback((id: string) => {
    setSorting(prev => prev.filter(s => s.id !== id));
  }, []);

  // --- Join Management ---
  const handleColumnClick = useCallback((tableId: string, column: string) => {
    if (!pendingJoin) {
      setPendingJoin({ tableId, column });
      toast({ title: 'Select Target', description: 'Click another column to complete the join.' });
    } else {
      if (pendingJoin.tableId !== tableId) {
        const newJoin: Join = {
          id: `join-${Date.now()}`,
          sourceTableId: pendingJoin.tableId,
          sourceColumn: pendingJoin.column,
          targetTableId: tableId,
          targetColumn: column,
          type: 'INNER',
          active: true
        };
        setJoins(prev => [...prev, newJoin]);
        toast({ title: 'Join Created', description: 'Relationship added to query graph.' });
      }
      setPendingJoin(null);
    }
  }, [pendingJoin]);

  const toggleJoinActive = useCallback((id: string) => {
    setJoins(prev => prev.map(j => j.id === id ? { ...j, active: !j.active } : j));
  }, []);

  // --- SQL Generation ---
  useEffect(() => {
    if (!rootTableId) {
      setGeneratedSql('-- Select a root table to start building your query');
      return;
    }

    const rootTable = tables.find(t => t.id === rootTableId);
    if (!rootTable) return;

    const activeReachableTables = tables.filter(t => reachableTables.has(t.id));
    
    let sql = "SELECT\n";
    const selectCols = activeReachableTables.flatMap(t => 
      t.pinnedColumns.map(col => `  ${t.name}.${col}`)
    );
    sql += selectCols.length > 0 ? selectCols.join(",\n") : "  *";
    
    sql += `\nFROM ${rootTable.name}`;

    joins.filter(j => j.active && reachableTables.has(j.sourceTableId) && reachableTables.has(j.targetTableId)).forEach(join => {
      const source = tables.find(t => t.id === join.sourceTableId);
      const target = tables.find(t => t.id === join.targetTableId);
      if (source && target) {
        sql += `\n${join.type} JOIN ${target.name} ON ${source.name}.${join.sourceColumn} = ${target.name}.${join.targetColumn}`;
      }
    });

    const activeFilters = filters.filter(f => reachableTables.has(f.tableId));
    if (activeFilters.length > 0) {
      sql += "\nWHERE " + activeFilters.map(f => {
        const t = tables.find(tbl => tbl.id === f.tableId);
        let val = f.value;
        if (f.operator === 'IS NULL' || f.operator === 'IS NOT NULL') {
          val = '';
        }
        return `${t?.name}.${f.column} ${f.operator} ${val}`.trim();
      }).join("\n  AND ");
    }

    const activeSorting = sorting.filter(s => reachableTables.has(s.tableId));
    if (activeSorting.length > 0) {
      sql += "\nORDER BY " + activeSorting.map(s => {
        const t = tables.find(tbl => tbl.id === s.tableId);
        return `${t?.name}.${s.column} ${s.order}`;
      }).join(", ");
    }

    sql += `\nLIMIT ${limit};`;
    setGeneratedSql(sql);
  }, [tables, joins, rootTableId, reachableTables, filters, sorting, limit]);

  // --- Execution ---
  const executeQuery = useCallback(async () => {
    if (!rootTableId) {
      toast({ variant: 'destructive', title: 'Invalid Query', description: 'Root table missing.' });
      return;
    }

    setIsExecuting(true);
    setTimeout(() => {
      const success = Math.random() > 0.05;
      if (success) {
        const cols = tables.filter(t => reachableTables.has(t.id)).flatMap(t => t.pinnedColumns);
        const mockResult: QueryResult = {
          columns: cols.length > 0 ? cols : ['id', 'status'],
          rows: Array(Math.min(limit, 10)).fill(0).map((_, i) => ({
            id: i + 1,
            ...Object.fromEntries(cols.map(c => [c, `mock_val_${i}`]))
          })),
          executionTimeMs: Math.floor(Math.random() * 150) + 30,
          rowCount: Math.min(limit, 10)
        };
        setQueryResult(mockResult);
        setHistory(prev => [{
          id: `exec-${Date.now()}`,
          timestamp: new Date(),
          sql: generatedSql,
          metrics: { time: mockResult.executionTimeMs, rows: mockResult.rowCount },
          status: 'success'
        }, ...prev]);
      } else {
        toast({ variant: 'destructive', title: 'Query Error', description: 'Internal Database Fault simulated.' });
      }
      setIsExecuting(false);
    }, 1000);
  }, [rootTableId, generatedSql, limit, tables, reachableTables]);

  return {
    connections,
    activeConnectionId,
    setActiveConnectionId,
    profiles,
    activeProfileId,
    setActiveProfileId,
    tables,
    joins,
    rootTableId,
    reachableTables,
    addTableToCanvas,
    removeTableFromCanvas,
    updateTablePosition,
    togglePin,
    setAsRoot,
    handleColumnClick,
    pendingJoin,
    toggleJoinActive,
    generatedSql,
    executeQuery,
    isExecuting,
    queryResult,
    history,
    filters,
    addFilter,
    updateFilter,
    removeFilter,
    sorting,
    addSort,
    removeSort,
    limit,
    setLimit
  };
}
