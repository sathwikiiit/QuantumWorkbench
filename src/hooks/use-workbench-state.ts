
"use client";

import { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  TableInstance, Join, Column, QueryResult, ExecutionHistoryItem, 
  Connection, Profile, Filter, SortRule, TableSchema 
} from '@/lib/types';
import { REALISTIC_SCHEMA } from '@/lib/mock-schema';
import { toast } from '@/hooks/use-toast';

export function useWorkbenchState() {
  // --- Connections ---
  const [connections, setConnections] = useState<Connection[]>([
    { id: 'c1', name: 'Production_v1', type: 'PostgreSQL', host: 'db.prod.internal', port: 5432, databaseName: 'main', username: 'admin', status: 'connected' }
  ]);
  const [activeConnectionId, setActiveConnectionId] = useState<string>('c1');

  // --- Profiles & Templates ---
  const [profiles, setProfiles] = useState<Profile[]>([
    {
      id: 'p1',
      name: 'Default Customer View',
      connectionId: 'c1',
      tables: [],
      joins: [],
      rootTableId: null,
      selectedColumns: [],
      filters: [],
      sorting: [],
      limit: 100
    }
  ]);
  const [activeProfileId, setActiveProfileId] = useState<string>('p1');

  // --- Current Workbench State (Local overrides of profile) ---
  const currentProfile = useMemo(() => 
    profiles.find(p => p.id === activeProfileId) || profiles[0],
  [profiles, activeProfileId]);

  const [tables, setTables] = useState<TableInstance[]>([]);
  const [joins, setJoins] = useState<Join[]>([]);
  const [rootTableId, setRootTableId] = useState<string | null>(null);
  const [selectedColumns, setSelectedColumns] = useState<{ tableId: string; column: string }[]>([]);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [sorting, setSorting] = useState<SortRule[]>([]);
  const [limit, setLimit] = useState<number>(100);

  // --- UI State ---
  const [generatedSql, setGeneratedSql] = useState<string>('');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [history, setHistory] = useState<ExecutionHistoryItem[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [pendingJoin, setPendingJoin] = useState<{tableId: string, column: string} | null>(null);

  // --- Reachability Logic ---
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

  // --- Sync State when active profile changes ---
  useEffect(() => {
    setTables(currentProfile.tables);
    setJoins(currentProfile.joins);
    setRootTableId(currentProfile.rootTableId);
    setSelectedColumns(currentProfile.selectedColumns);
    setFilters(currentProfile.filters);
    setSorting(currentProfile.sorting);
    setLimit(currentProfile.limit);
  }, [activeProfileId]);

  // --- Actions ---
  const addTableToCanvas = useCallback((schemaId: string) => {
    const schema = REALISTIC_SCHEMA.find(s => s.id === schemaId);
    if (!schema) return;

    const newInstance: TableInstance = {
      id: `${schemaId}_${Date.now()}`,
      schemaId: schema.id,
      name: schema.name,
      position: { x: 100, y: 100 },
      pinnedColumns: schema.columns.slice(0, 4).map(c => c.name),
      isRoot: tables.length === 0
    };

    if (tables.length === 0) setRootTableId(newInstance.id);
    setTables(prev => [...prev, newInstance]);

    // Auto-suggest joins based on FKs
    schema.columns.forEach(col => {
      if (col.isForeignKey && col.references) {
        const targetTable = tables.find(t => t.name === col.references?.table);
        if (targetTable) {
          const newJoin: Join = {
            id: `join_${Date.now()}_${Math.random()}`,
            sourceTableId: newInstance.id,
            sourceColumn: col.name,
            targetTableId: targetTable.id,
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
  }, []);

  // --- Join Logic ---
  const handleColumnClick = useCallback((tableId: string, column: string) => {
    if (!pendingJoin) {
      setPendingJoin({ tableId, column });
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
      }
      setPendingJoin(null);
    }
  }, [pendingJoin]);

  const toggleJoinActive = useCallback((id: string) => {
    setJoins(prev => prev.map(j => j.id === id && !j.required ? { ...j, active: !j.active } : j));
  }, []);

  // --- Query Generation ---
  useEffect(() => {
    if (!rootTableId) {
      setGeneratedSql('-- Select a root table to generate SQL');
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

    if (filters.length > 0) {
      sql += "\nWHERE " + filters.map(f => {
        const t = tables.find(tbl => tbl.id === f.tableId);
        return `${t?.name}.${f.column} ${f.operator} ${f.value}`;
      }).join("\n  AND ");
    }

    if (sorting.length > 0) {
      sql += "\nORDER BY " + sorting.map(s => {
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
      toast({ variant: 'destructive', title: 'Invalid Query', description: 'Please set a root table first.' });
      return;
    }

    setIsExecuting(true);
    // Simulate async connection testing if status is not 'connected'
    const conn = connections.find(c => c.id === activeConnectionId);
    
    setTimeout(() => {
      const success = Math.random() > 0.1;
      if (success) {
        const cols = tables.filter(t => reachableTables.has(t.id)).flatMap(t => t.pinnedColumns);
        const mockResult: QueryResult = {
          columns: cols.length > 0 ? cols : ['id', 'status'],
          rows: Array(Math.floor(Math.random() * 20) + 1).fill(0).map((_, i) => ({
            id: i + 1,
            status: 'active',
            ...Object.fromEntries(cols.map(c => [c, `value_${i}`]))
          })),
          executionTimeMs: Math.floor(Math.random() * 200) + 20,
          rowCount: 5
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
        toast({ variant: 'destructive', title: 'Execution Failed', description: 'Database connection error simulated.' });
      }
      setIsExecuting(false);
    }, 1200);
  }, [rootTableId, generatedSql, activeConnectionId, tables, reachableTables]);

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
    generatedSql,
    executeQuery,
    isExecuting,
    queryResult,
    history,
    filters,
    setFilters,
    sorting,
    setSorting,
    limit,
    setLimit
  };
}
