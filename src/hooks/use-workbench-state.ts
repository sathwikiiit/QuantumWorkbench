
"use client";

import { useState, useCallback, useEffect } from 'react';
import { Table, Join, Column, JoinType, QueryResult, ExecutionHistoryItem } from '@/lib/types';

const MOCK_SCHEMA: Table[] = [
  {
    id: 'users',
    name: 'users',
    columns: [
      { name: 'id', type: 'uuid', isPrimary: true },
      { name: 'email', type: 'varchar' },
      { name: 'full_name', type: 'varchar' },
      { name: 'created_at', type: 'timestamp' }
    ],
    position: { x: 50, y: 50 },
    pinnedColumns: ['id', 'email']
  },
  {
    id: 'orders',
    name: 'orders',
    columns: [
      { name: 'id', type: 'uuid', isPrimary: true },
      { name: 'user_id', type: 'uuid' },
      { name: 'amount', type: 'decimal' },
      { name: 'status', type: 'varchar' }
    ],
    position: { x: 400, y: 150 },
    pinnedColumns: ['id', 'user_id', 'amount']
  },
  {
    id: 'products',
    name: 'products',
    columns: [
      { name: 'id', type: 'uuid', isPrimary: true },
      { name: 'name', type: 'varchar' },
      { name: 'price', type: 'decimal' }
    ],
    position: { x: 750, y: 50 },
    pinnedColumns: ['name', 'price']
  }
];

export function useWorkbenchState() {
  const [tables, setTables] = useState<Table[]>(MOCK_SCHEMA);
  const [joins, setJoins] = useState<Join[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [generatedSql, setGeneratedSql] = useState<string>('');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [history, setHistory] = useState<ExecutionHistoryItem[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [pendingJoin, setPendingJoin] = useState<{tableId: string, column: string} | null>(null);

  const updateTablePosition = useCallback((id: string, x: number, y: number) => {
    setTables(prev => prev.map(t => t.id === id ? { ...t, position: { x, y } } : t));
  }, []);

  const togglePin = useCallback((tableId: string, columnName: string) => {
    setTables(prev => prev.map(t => {
      if (t.id !== tableId) return t;
      const isPinned = t.pinnedColumns.includes(columnName);
      return {
        ...t,
        pinnedColumns: isPinned 
          ? t.pinnedColumns.filter(c => c !== columnName) 
          : [...t.pinnedColumns, columnName]
      };
    }));
  }, []);

  const handleColumnClick = useCallback((tableId: string, column: string) => {
    if (!pendingJoin) {
      setPendingJoin({ tableId, column });
    } else {
      if (pendingJoin.tableId !== tableId) {
        addJoin(pendingJoin, { tableId, column });
      }
      setPendingJoin(null);
    }
  }, [pendingJoin]);

  const addJoin = useCallback((source: {tableId: string, column: string}, target: {tableId: string, column: string}) => {
    const newJoin: Join = {
      id: `join-${Date.now()}`,
      sourceTableId: source.tableId,
      sourceColumn: source.column,
      targetTableId: target.tableId,
      targetColumn: target.column,
      type: 'INNER',
      active: true
    };
    setJoins(prev => [...prev, newJoin]);
  }, []);

  const removeJoin = useCallback((id: string) => {
    setJoins(prev => prev.filter(j => j.id !== id));
  }, []);

  useEffect(() => {
    const selectLines: string[] = [];
    const fromLines: string[] = [];
    const joinLines: string[] = [];

    tables.forEach(table => {
      table.pinnedColumns.forEach(col => {
        selectLines.push(`  ${table.name}.${col}`);
      });
    });

    if (tables.length > 0) {
      fromLines.push(`FROM ${tables[0].name}`);
      
      joins.filter(j => j.active).forEach(join => {
        const targetTable = tables.find(t => t.id === join.targetTableId);
        const sourceTable = tables.find(t => t.id === join.sourceTableId);
        if (targetTable && sourceTable) {
          joinLines.push(`INNER JOIN ${targetTable.name} ON ${sourceTable.name}.${join.sourceColumn} = ${targetTable.name}.${join.targetColumn}`);
        }
      });
    }

    const sql = `SELECT\n${selectLines.join(',\n')}\n${fromLines.join(' ')}\n${joinLines.join('\n')};`;
    setGeneratedSql(sql);
  }, [tables, joins]);

  const executeQuery = useCallback(async () => {
    setIsExecuting(true);
    setTimeout(() => {
      const mockResult: QueryResult = {
        columns: tables.flatMap(t => t.pinnedColumns),
        rows: Array(5).fill(0).map((_, i) => ({
          id: i + 1,
          name: `Sample Item ${i + 1}`,
          value: Math.floor(Math.random() * 1000)
        })),
        executionTimeMs: 45,
        rowCount: 5
      };
      setQueryResult(mockResult);
      setHistory(prev => [{
        id: `exec-${Date.now()}`,
        timestamp: new Date(),
        sql: generatedSql,
        metrics: { time: 45, rows: 5 }
      }, ...prev]);
      setIsExecuting(false);
    }, 800);
  }, [tables, generatedSql]);

  return {
    tables,
    joins,
    selectedTableId,
    setSelectedTableId,
    updateTablePosition,
    togglePin,
    handleColumnClick,
    pendingJoin,
    addJoin,
    removeJoin,
    generatedSql,
    executeQuery,
    isExecuting,
    queryResult,
    history
  };
}
