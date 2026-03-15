"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { 
  TableInstance, Join, QueryResult, ExecutionHistoryItem, 
  Connection, Profile, Filter, SortRule, TableSchema, Template, SavedQuery, Preset 
} from '@/lib/types';
import * as api from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface WorkbenchContextType {
  schema: TableSchema[];
  connections: Connection[];
  activeConnectionId: string;
  setActiveConnectionId: (id: string) => void;
  addConnection: (conn: Omit<Connection, 'id' | 'password' | 'status'> & { password?: string }) => Promise<string>;
  updateConnection: (id: string, updates: Partial<Connection>) => Promise<void>;
  deleteConnection: (id: string) => Promise<void>;
  testConnection: (id: string) => Promise<boolean>;
  profiles: Profile[];
  activeProfileId: string;
  setActiveProfileId: (id: string) => void;
  addProfile: (name: string, connectionId?: string) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  duplicateProfile: (id: string) => Promise<void>;
  saveCurrentToProfile: () => Promise<void>;
  tables: TableInstance[];
  joins: Join[];
  rootTableId: string | null;
  reachableTables: Set<string>;
  addTableToCanvas: (schemaId: string) => void;
  removeTableFromCanvas: (id: string) => void;
  updateTablePosition: (id: string, x: number, y: number) => void;
  togglePin: (tableId: string, colName: string) => void;
  setAsRoot: (id: string) => void;
  handleColumnClick: (tableId: string, column: string) => void;
  pendingJoin: { tableId: string, column: string } | null;
  toggleJoinActive: (id: string) => void;
  generatedSql: string;
  executeQuery: () => Promise<void>;
  validateQuery: () => Promise<void>;
  isExecuting: boolean;
  queryResult: QueryResult | null;
  history: ExecutionHistoryItem[];
  filters: Filter[];
  addFilter: (tableId: string, colName: string) => void;
  updateFilter: (id: string, updates: Partial<Filter>) => void;
  removeFilter: (id: string) => void;
  sorting: SortRule[];
  addSort: (tableId: string, column: string) => void;
  removeSort: (id: string) => void;
  limit: number;
  setLimit: (val: number) => void;
  params: Record<string, string>;
  setParam: (key: string, value: string) => void;
  removeParam: (key: string) => void;
  clearParams: () => void;
  templates: Template[];
  saveTemplate: (name: string, connectionId?: string) => Promise<void>;
  updateTemplate: (id: string, updates: Partial<Template>) => Promise<void>;
  applyTemplate: (template: Template) => void;
  deleteTemplate: (id: string) => Promise<void>;
  savedQueries: SavedQuery[];
  saveQuery: (name: string, templateId: string) => Promise<void>;
  applySavedQuery: (query: SavedQuery) => Promise<void>;
  deleteSavedQuery: (id: string) => Promise<void>;
  presets: Preset[];
  savePreset: (name: string, params: Record<string, string>) => Promise<void>;
  applyPreset: (preset: Preset) => void;
  deletePreset: (id: string) => Promise<void>;
}

const WorkbenchContext = createContext<WorkbenchContextType | undefined>(undefined);

export function WorkbenchProvider({ children }: { children: React.ReactNode }) {
  const [schema, setSchema] = useState<TableSchema[]>([]);
  const [schemaCache, setSchemaCache] = useState<Record<string, TableSchema[]>>({});
  const [params, setParams] = useState<Record<string, string>>({});
  const [connections, setConnections] = useState<Connection[]>([]);
  const [activeConnectionId, setActiveConnectionId] = useState<string>('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string>('');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [tables, setTables] = useState<TableInstance[]>([]);
  const [joins, setJoins] = useState<Join[]>([]);
  const [rootTableId, setRootTableId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [sorting, setSorting] = useState<SortRule[]>([]);
  const [limit, setLimit] = useState<number>(50);
  const [generatedSql, setGeneratedSql] = useState<string>('');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [history, setHistory] = useState<ExecutionHistoryItem[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [pendingJoin, setPendingJoin] = useState<{tableId: string, column: string} | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [conn, prof, hist, templ, saved, pre] = await Promise.all([
          api.getConnections().catch(() => []),
          api.getProfiles().catch(() => []),
          api.getHistory().catch(() => []),
          api.getTemplates().catch(() => []),
          api.getSavedQueries().catch(() => []),
          api.getPresets().catch(() => [])
        ]);
        if (cancelled) return;
        setConnections(conn);
        setProfiles(prof);
        setHistory(hist);
        setTemplates(templ);
        setSavedQueries(saved);
        setPresets(pre);
        if (conn.length > 0 && !activeConnectionId) setActiveConnectionId(conn[0].id);
        if (prof.length > 0 && !activeProfileId) setActiveProfileId(prof[0].id);
      } catch (error) {
        console.error('Failed initial load', error);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!activeConnectionId) {
      setSchema([]);
      return;
    }
    if (schemaCache[activeConnectionId]) {
      setSchema(schemaCache[activeConnectionId]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const schemaData = await api.getSchema(activeConnectionId);
        if (cancelled) return;
        setSchema(schemaData);
        setSchemaCache(prev => ({ ...prev, [activeConnectionId]: schemaData }));
      } catch (error) {
        console.error('Schema fetch failed', error);
        setSchema([]);
      }
    })();
    return () => { cancelled = true; };
  }, [activeConnectionId, schemaCache]);

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

  const addTableToCanvas = useCallback((schemaId: string) => {
    const tableSchema = schema.find(s => s.id === schemaId);
    if (!tableSchema) return;

    const newId = `${schemaId}_${Date.now()}`;
    const newTable: TableInstance = {
      id: newId,
      schemaId: tableSchema.id,
      name: tableSchema.name,
      schemaName: tableSchema.schemaName,
      position: { x: 100 + tables.length * 50, y: 100 + tables.length * 50 },
      pinnedColumns: tableSchema.columns.slice(0, 5).map(c => c.name),
      isRoot: tables.length === 0
    };

    setTables(prev => [...prev, newTable]);
    if (tables.length === 0) setRootTableId(newId);
  }, [schema, tables.length]);

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
    toast({ title: "Root Table Set", description: `Query generation now starts from ${tables.find(t => t.id === id)?.name}` });
  }, [tables]);

  const handleColumnClick = useCallback((tableId: string, column: string) => {
    if (!pendingJoin) {
      setPendingJoin({ tableId, column });
      toast({ title: "Select Target", description: "Select a column in another table to create a join." });
    } else {
      if (pendingJoin.tableId === tableId) {
        setPendingJoin(null);
        return;
      }
      const newJoin: Join = {
        id: `j-${Date.now()}`,
        sourceTableId: pendingJoin.tableId,
        sourceColumn: pendingJoin.column,
        targetTableId: tableId,
        targetColumn: column,
        type: 'INNER',
        active: true
      };
      setJoins(prev => [...prev, newJoin]);
      setPendingJoin(null);
      toast({ title: "Join Created", description: `Linked ${pendingJoin.column} to ${column}` });
    }
  }, [pendingJoin]);

  const toggleJoinActive = useCallback((id: string) => {
    setJoins(prev => prev.map(j => j.id === id ? { ...j, active: !j.active } : j));
  }, []);

  const addConnection = useCallback(async (conn: Omit<Connection, 'id' | 'password' | 'status'> & { password?: string }) => {
    const newConn = await api.createConnection(conn);
    setConnections(prev => [...prev, newConn]);
    return newConn.id;
  }, []);

  const updateConnection = useCallback(async (id: string, updates: Partial<Connection>) => {
    const updated = await api.updateConnection(id, updates);
    setConnections(prev => prev.map(c => c.id === id ? updated : c));
  }, []);

  const deleteConnection = useCallback(async (id: string) => {
    await api.deleteConnection(id);
    setConnections(prev => prev.filter(c => c.id !== id));
    if (activeConnectionId === id) setActiveConnectionId('');
  }, [activeConnectionId]);

  const testConnection = useCallback(async (id: string) => {
    const result = await api.testConnection(id);
    setConnections(prev => prev.map(c => c.id === id ? { ...c, status: result.status } : c));
    return result.status === 'connected';
  }, []);

  const addProfile = useCallback(async (name: string, connectionId?: string) => {
    const newProfile = await api.createProfile({
      name,
      connectionId: connectionId || activeConnectionId,
      tables: [],
      joins: [],
      rootTableId: null,
      selectedColumns: [],
      filters: [],
      sorting: [],
      limit: 50
    });
    setProfiles(prev => [...prev, newProfile]);
    setActiveProfileId(newProfile.id);
  }, [activeConnectionId]);

  const deleteProfile = useCallback(async (id: string) => {
    await api.deleteProfile(id);
    setProfiles(prev => prev.filter(p => p.id !== id));
  }, []);

  const duplicateProfile = useCallback(async (id: string) => {
    const copy = await api.duplicateProfile(id);
    setProfiles(prev => [...prev, copy]);
    setActiveProfileId(copy.id);
  }, []);

  const saveCurrentToProfile = useCallback(async () => {
    if (!activeProfileId) return;
    const updated = await api.updateProfile(activeProfileId, {
      tables, joins, rootTableId, filters, sorting, limit, connectionId: activeConnectionId
    });
    setProfiles(prev => prev.map(p => p.id === activeProfileId ? updated : p));
    toast({ title: "Profile Saved" });
  }, [activeProfileId, activeConnectionId, tables, joins, rootTableId, filters, sorting, limit]);

  const saveTemplate = useCallback(async (name: string, connectionId?: string) => {
    const cid = connectionId || activeConnectionId;
    const newTemplate = await api.createTemplate({
      name, connectionId: cid, tables, joins, rootTableId, 
      selectedColumns: tables.flatMap(t => t.pinnedColumns.map(col => ({ tableId: t.id, column: col }))),
      filters, sorting, limit, createdAt: new Date().toISOString()
    });
    setTemplates(prev => [...prev, newTemplate]);
  }, [activeConnectionId, tables, joins, rootTableId, filters, sorting, limit]);

  const updateTemplate = useCallback(async (id: string, updates: Partial<Template>) => {
    const updated = await api.updateTemplate(id, updates);
    setTemplates(prev => prev.map(t => t.id === id ? updated : t));
    toast({ title: "Template Updated" });
  }, []);

  const applyTemplate = useCallback((template: Template) => {
    setActiveConnectionId(template.connectionId);
    setTables(template.tables);
    setJoins(template.joins);
    setRootTableId(template.rootTableId);
    setFilters(template.filters);
    setSorting(template.sorting);
    setLimit(template.limit);
    toast({ title: "Template Applied" });
  }, []);

  const deleteTemplate = useCallback(async (id: string) => {
    await api.deleteTemplate(id);
    setTemplates(prev => prev.filter(t => t.id !== id));
  }, []);

  const saveQuery = useCallback(async (name: string, templateId: string) => {
    const newQuery = await api.createSavedQuery({
      name, connectionId: activeConnectionId, templateId, sql: generatedSql,
      enabledJoins: joins.filter(j => j.active).map(j => j.id),
      selectedColumns: tables.flatMap(t => t.pinnedColumns.map(col => ({ tableId: t.id, column: col }))),
      filters, sorting, limit, params, createdAt: new Date().toISOString()
    });
    setSavedQueries(prev => [...prev, newQuery]);
  }, [activeConnectionId, generatedSql, joins, tables, filters, sorting, limit, params]);

  const applySavedQuery = useCallback(async (query: SavedQuery) => {
    setActiveConnectionId(query.connectionId);
    const template = templates.find(t => t.id === query.templateId);
    if (template) applyTemplate(template);
    setJoins(prev => prev.map(j => ({ ...j, active: query.enabledJoins.includes(j.id) })));
    setFilters(query.filters);
    setSorting(query.sorting);
    setLimit(query.limit);
    setParams(query.params || {});
  }, [templates, applyTemplate]);

  const deleteSavedQuery = useCallback(async (id: string) => {
    await api.deleteSavedQuery(id);
    setSavedQueries(prev => prev.filter(q => q.id !== id));
  }, []);

  const executeQuery = useCallback(async () => {
    if (!rootTableId || !activeConnectionId) return;
    setIsExecuting(true);
    try {
      const payload = {
        connectionId: activeConnectionId,
        rootTableId,
        limit,
        params,
        joins: joins.map(j => ({
          id: j.id,
          sourceTableId: j.sourceTableId,
          sourceColumn: j.sourceColumn,
          targetTableId: j.targetTableId,
          targetColumn: j.targetColumn,
          type: j.type,
          active: j.active
        })),
        selectedColumns: tables.flatMap(t => t.pinnedColumns.map(col => ({ tableId: t.id, column: col }))),
        filters: filters.map(f => ({ tableId: f.tableId, column: f.column, operator: f.operator, value: f.value })),
        sorting: sorting.map(s => ({ tableId: s.tableId, column: s.column, order: s.order }))
      };
      const result = await api.executeQuery(payload);
      setQueryResult(result);
      const hist = await api.appendHistory({
        timestamp: new Date().toISOString(), connectionId: activeConnectionId, sql: result.sql,
        metrics: { time: result.executionTimeMs, rows: result.rowCount }, status: 'success', params
      });
      setHistory(prev => [hist, ...prev]);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Query Failed' });
    } finally { setIsExecuting(false); }
  }, [activeConnectionId, rootTableId, joins, tables, filters, sorting, limit, params]);

  const validateQuery = useCallback(async () => {
    if (!rootTableId || !activeConnectionId) return;
    try {
      const payload = {
        connectionId: activeConnectionId,
        rootTableId,
        limit,
        params,
        joins: joins.map(j => ({ id: j.id, sourceTableId: j.sourceTableId, sourceColumn: j.sourceColumn, targetTableId: j.targetTableId, targetColumn: j.targetColumn, type: j.type, active: j.active })),
        selectedColumns: tables.flatMap(t => t.pinnedColumns.map(col => ({ tableId: t.id, column: col }))),
        filters: filters.map(f => ({ tableId: f.tableId, column: f.column, operator: f.operator, value: f.value })),
        sorting: sorting.map(s => ({ tableId: s.tableId, column: s.column, order: s.order }))
      };
      const result = await api.validateQuery(payload);
      if (result.valid) {
        toast({ title: "Validation Success", description: "Graph is fully connected and valid." });
      } else {
        toast({ variant: 'destructive', title: "Validation Failed", description: result.errors.join(", ") });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: "Validation Error" });
    }
  }, [activeConnectionId, rootTableId, joins, tables, filters, sorting, limit, params]);

  useEffect(() => {
    if (!rootTableId) { setGeneratedSql('-- Anchor a root table to begin SQL generation'); return; }
    const rootTable = tables.find(t => t.id === rootTableId);
    if (!rootTable) return;
    const activeReachableTables = tables.filter(t => reachableTables.has(t.id));
    let sql = "SELECT\n";
    const selectCols = activeReachableTables.flatMap(t => t.pinnedColumns.map(col => `  ${t.name}.${col}`));
    sql += selectCols.length > 0 ? selectCols.join(",\n") : "  *";
    sql += `\nFROM ${rootTable.name}`;
    joins.filter(j => j.active && reachableTables.has(j.sourceTableId) && reachableTables.has(j.targetTableId)).forEach(join => {
      const target = tables.find(t => t.id === join.targetTableId);
      const source = tables.find(t => t.id === join.sourceTableId);
      if (source && target) sql += `\n${join.type} JOIN ${target.name} ON ${source.name}.${join.sourceColumn} = ${target.name}.${join.targetColumn}`;
    });
    const activeFilters = filters.filter(f => reachableTables.has(f.tableId));
    if (activeFilters.length > 0) {
      sql += "\nWHERE " + activeFilters.map(f => {
        const t = tables.find(tbl => tbl.id === f.tableId);
        if (f.operator === 'IS NULL' || f.operator === 'IS NOT NULL') return `${t?.name}.${f.column} ${f.operator}`;
        return `${t?.name}.${f.column} ${f.operator} ${f.value}`;
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

  const addFilter = useCallback((tableId: string, column: string) => { setFilters(prev => [...prev, { id: `f-${Date.now()}`, tableId, column, operator: '=', value: '' }]); }, []);
  const updateFilter = useCallback((id: string, updates: Partial<Filter>) => { setFilters(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f)); }, []);
  const removeFilter = useCallback((id: string) => { setFilters(prev => prev.filter(f => f.id !== id)); }, []);
  const addSort = useCallback((tableId: string, column: string) => { setSorting(prev => [...prev, { id: `s-${Date.now()}`, tableId, column, order: 'ASC' }]); }, []);
  const removeSort = useCallback((id: string) => { setSorting(prev => prev.filter(s => s.id !== id)); }, []);
  const setParam = useCallback((key: string, value: string) => { setParams(prev => ({ ...prev, [key]: value })); }, []);
  const removeParam = useCallback((key: string) => { setParams(prev => { const n = { ...prev }; delete n[key]; return n; }); }, []);
  const clearParams = useCallback(() => setParams({}), []);

  const savePreset = useCallback(async (name: string, params: Record<string, string>) => {
    const newPreset = await api.createPreset({
      name, params, createdAt: new Date().toISOString()
    });
    setPresets(prev => [...prev, newPreset]);
  }, []);

  const applyPreset = useCallback((preset: Preset) => {
    setParams(preset.params);
    toast({ title: "Preset Applied" });
  }, []);

  const deletePreset = useCallback(async (id: string) => {
    await api.deletePreset(id);
    setPresets(prev => prev.filter(p => p.id !== id));
  }, []);

  return (
    <WorkbenchContext.Provider value={{
      schema, connections, activeConnectionId, setActiveConnectionId, addConnection, updateConnection, deleteConnection, testConnection,
      profiles, activeProfileId, setActiveProfileId, addProfile, deleteProfile, duplicateProfile, saveCurrentToProfile,
      tables, joins, rootTableId, reachableTables, addTableToCanvas, removeTableFromCanvas, updateTablePosition, togglePin, setAsRoot,
      handleColumnClick, pendingJoin, toggleJoinActive, generatedSql, executeQuery, validateQuery, isExecuting, queryResult, history,
      filters, addFilter, updateFilter, removeFilter, sorting, addSort, removeSort, limit, setLimit,
      params, setParam, removeParam, clearParams, templates, saveTemplate, updateTemplate, applyTemplate, deleteTemplate,
      savedQueries, saveQuery, applySavedQuery, deleteSavedQuery, presets, savePreset, applyPreset, deletePreset
    }}>
      {children}
    </WorkbenchContext.Provider>
  );
}

export function useWorkbench() {
  const context = useContext(WorkbenchContext);
  if (context === undefined) throw new Error('useWorkbench must be used within a WorkbenchProvider');
  return context;
}
