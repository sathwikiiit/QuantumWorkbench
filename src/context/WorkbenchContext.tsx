
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
  addConnection: (conn: Omit<Connection, 'id' | 'status'>) => Promise<string>;
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
  isExecuting: boolean;
  queryResult: QueryResult | null;
  history: ExecutionHistoryItem[];
  filters: Filter[];
  addFilter: (tableId: string, column: string) => void;
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
  saveTemplate: (name: string) => Promise<void>;
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

  // Initial data load
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [connectionsData, profilesData, historyData, templatesData, savedQueriesData, presetsData] = await Promise.all([
          api.getConnections().catch(() => []),
          api.getProfiles().catch(() => []),
          api.getHistory().catch(() => []),
          api.getTemplates().catch(() => []),
          api.getSavedQueries().catch(() => []),
          api.getPresets().catch(() => [])
        ]);

        if (cancelled) return;

        setConnections(connectionsData);
        setProfiles(profilesData);
        setHistory(historyData);
        setTemplates(templatesData);
        setSavedQueries(savedQueriesData);
        setPresets(presetsData);

        if (connectionsData.length > 0) {
          setActiveConnectionId(connectionsData[0].id);
        }
        if (profilesData.length > 0) {
          setActiveProfileId(profilesData[0].id);
        }
      } catch (error) {
        console.error('Failed to load initial workbench data', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Schema fetching
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
        console.error('Failed to load schema for connection', activeConnectionId, error);
        toast({ 
          variant: 'destructive', 
          title: 'Schema Load Failed', 
          description: 'Could not retrieve database metadata from the backend.' 
        });
        setSchema([]);
      }
    })();

    return () => {
      cancelled = true;
    };
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

  const addConnection = useCallback(async (conn: Omit<Connection, 'id' | 'status'>) => {
    const newConn = await api.createConnection(conn);
    setConnections(prev => [...prev, newConn]);
    toast({ title: "Connection Added", description: `${conn.name} is ready for testing.` });
    return newConn.id;
  }, []);

  const updateConnection = useCallback(async (id: string, updates: Partial<Connection>) => {
    const updated = await api.updateConnection(id, updates);
    setConnections(prev => prev.map(c => c.id === id ? updated : c));
  }, []);

  const deleteConnection = useCallback(async (id: string) => {
    await api.deleteConnection(id);
    setConnections(prev => {
      const next = prev.filter(c => c.id !== id);
      if (activeConnectionId === id) {
        if (next.length > 0) {
          setActiveConnectionId(next[0].id);
        } else {
          setActiveConnectionId('');
        }
      }
      return next;
    });
  }, [activeConnectionId]);

  const testConnection = useCallback(async (id: string) => {
    const result = await api.testConnection(id);
    setConnections(prev => prev.map(c => c.id === id ? { ...c, status: result.status } : c));
    if (result.status === 'error') {
      toast({ variant: 'destructive', title: 'Connection Failed', description: result.message ?? 'Host unreachable or invalid credentials.' });
    } else {
      toast({ title: 'Success', description: 'Connection established successfully.' });
    }
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
    toast({ title: "Profile Created", description: `Template ${name} is now active.` });
  }, [activeConnectionId]);

  const deleteProfile = useCallback(async (id: string) => {
    await api.deleteProfile(id);
    setProfiles(prev => prev.filter(p => p.id !== id));
    if (activeProfileId === id) setActiveProfileId(profiles[0]?.id || '');
  }, [activeProfileId, profiles]);

  const duplicateProfile = useCallback(async (id: string) => {
    const copy = await api.duplicateProfile(id);
    setProfiles(prev => [...prev, copy]);
    setActiveProfileId(copy.id);
    toast({ title: "Profile Duplicated" });
  }, []);

  const saveCurrentToProfile = useCallback(async () => {
    if (!activeProfileId) return;
    const updated = await api.updateProfile(activeProfileId, {
      tables,
      joins,
      rootTableId,
      filters,
      sorting,
      limit
    });
    setProfiles(prev => prev.map(p => p.id === activeProfileId ? updated : p));
    toast({ title: "State Saved", description: "Workbench layout and query parameters persisted to profile." });
  }, [activeProfileId, tables, joins, rootTableId, filters, sorting, limit]);

  const saveTemplate = useCallback(async (name: string) => {
    const newTemplate = await api.createTemplate({
      name,
      connectionId: activeConnectionId,
      tables,
      joins,
      rootTableId,
      selectedColumns: tables.flatMap(t => t.pinnedColumns.map(col => ({ tableId: t.id, column: col }))),
      filters,
      sorting,
      limit,
      schemaSnapshotVersion: `v-${Date.now()}`
    });
    setTemplates(prev => [...prev, newTemplate]);
    toast({ title: "Template Saved", description: `${name} saved for reuse.` });
  }, [activeConnectionId, tables, joins, rootTableId, filters, sorting, limit]);

  const applyTemplate = useCallback((template: Template) => {
    setActiveConnectionId(template.connectionId);
    setTables(template.tables);
    setJoins(template.joins);
    setRootTableId(template.rootTableId);
    setFilters(template.filters);
    setSorting(template.sorting);
    setLimit(template.limit);
    setParamSet({});
    toast({ title: "Template Applied", description: `${template.name} loaded into workbench.` });
  }, []);

  const deleteTemplate = useCallback(async (id: string) => {
    await api.deleteTemplate(id);
    setTemplates(prev => prev.filter(t => t.id !== id));
  }, []);

  const saveQuery = useCallback(async (name: string, templateId: string, description?: string) => {
    const enabledJoins = joins.filter(j => j.active).map(j => j.id);
    const selectedColumns = tables.flatMap(t => t.pinnedColumns.map(col => ({ tableId: t.id, column: col })));
    const newQuery = await api.createSavedQuery({
      name,
      connectionId: activeConnectionId,
      templateId,
      sql: generatedSql,
      description,
      enabledJoins,
      selectedColumns,
      filters,
      sorting,
      limit,
      params
    });
    setSavedQueries(prev => [...prev, newQuery]);
    toast({ title: "Saved Query Created", description: `${name} is now available in saved queries.` });
  }, [activeConnectionId, generatedSql, joins, tables, filters, sorting, limit, params]);

  const applySavedQuery = useCallback(async (query: SavedQuery) => {
    if (query.connectionId) {
      setActiveConnectionId(query.connectionId);
    }

    const template = templates.find(t => t.id === query.templateId);
    if (template) {
      applyTemplate(template);
    }

    setJoins(prev => prev.map(j => ({ ...j, active: query.enabledJoins.includes(j.id) })));

    setTables(prev => prev.map(t => {
      const selected = query.selectedColumns
        .filter(sc => sc.tableId === t.id)
        .map(sc => sc.column);
      if (selected.length > 0) {
        return { ...t, pinnedColumns: selected };
      }
      return t;
    }));

    setFilters(query.filters);
    setSorting(query.sorting);
    setLimit(query.limit);
    setParamSet(query.params || {});

    if (query.sql) {
      setGeneratedSql(query.sql);
    }

    toast({ title: "Saved Query Applied", description: `${query.name} loaded into workbench.` });
  }, [templates, applyTemplate]);

  const deleteSavedQuery = useCallback(async (id: string) => {
    await api.deleteSavedQuery(id);
    setSavedQueries(prev => prev.filter(q => q.id !== id));
  }, []);

  const savePreset = useCallback(async (name: string, params: Record<string, string>) => {
    const newPreset = await api.createPreset({ name, params });
    setPresets(prev => [...prev, newPreset]);
    toast({ title: "Preset Saved", description: `${name} saved for later use.` });
  }, []);

  const applyPreset = useCallback((preset: Preset) => {
    setParamSet(preset.params);
    toast({ title: "Preset Applied", description: `${preset.name} parameters loaded.` });
  }, []);

  const deletePreset = useCallback(async (id: string) => {
    await api.deletePreset(id);
    setPresets(prev => prev.filter(p => p.id !== id));
  }, []);

  useEffect(() => {
    const p = profiles.find(prof => prof.id === activeProfileId);
    if (p) {
      setTables(p.tables || []);
      setJoins(p.joins || []);
      setRootTableId(p.rootTableId || null);
      setFilters(p.filters || []);
      setSorting(p.sorting || []);
      setLimit(p.limit || 50);
      setActiveConnectionId(p.connectionId);
    }
  }, [activeProfileId, profiles]);

  const addTableToCanvas = useCallback((schemaId: string) => {
    const tableSchema = schema.find(s => s.id === schemaId);
    if (!tableSchema) return;

    const newInstanceId = `${schemaId}_${Date.now()}`;
    const newInstance: TableInstance = {
      id: newInstanceId,
      schemaId: tableSchema.id,
      name: tableSchema.name,
      position: { x: 150 + (tables.length * 50), y: 150 + (tables.length * 50) },
      pinnedColumns: tableSchema.columns.slice(0, 4).map(c => c.name),
      isRoot: tables.length === 0
    };

    if (tables.length === 0) setRootTableId(newInstanceId);
    setTables(prev => [...prev, newInstance]);

    tableSchema.columns.forEach(col => {
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
            active: true,
            required: true,
            source: 'auto'
          };
          setJoins(prev => [...prev, newJoin]);
        }
      }
    });
  }, [tables, schema]);

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
    toast({ title: 'Root Table Updated', description: `Query generation starts from ${tables.find(t => t.id === id)?.name}.` });
  }, [tables]);

  const handleColumnClick = useCallback((tableId: string, column: string) => {
    if (!pendingJoin) {
      setPendingJoin({ tableId, column });
      toast({ title: 'Select Target', description: 'Select target column in another table.' });
    } else {
      if (pendingJoin.tableId !== tableId) {
        setJoins(prev => [...prev, {
          id: `j-${Date.now()}`,
          sourceTableId: pendingJoin.tableId,
          sourceColumn: pendingJoin.column,
          targetTableId: tableId,
          targetColumn: column,
          type: 'INNER',
          active: true,
          required: false,
          source: 'manual'
        }]);
      }
      setPendingJoin(null);
    }
  }, [pendingJoin]);

  const toggleJoinActive = useCallback((id: string) => {
    setJoins(prev => prev.map(j => j.id === id ? { ...j, active: !j.active } : j));
  }, []);

  useEffect(() => {
    if (!rootTableId) {
      setGeneratedSql('-- Select an anchor root table to begin SQL generation');
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
          return `${t?.name}.${f.column} ${f.operator}`;
        }
        return `${t?.name}.${f.column} ${f.operator} ${val}`;
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

  const buildStructuredQuery = useCallback(() => {
    return {
      connectionId: activeConnectionId,
      rootTableId,
      joins: joins.map(j => ({
        id: j.id,
        sourceTableId: j.sourceTableId,
        sourceColumn: j.sourceColumn,
        targetTableId: j.targetTableId,
        targetColumn: j.targetColumn,
        type: j.type,
        active: j.active,
        required: j.required,
        source: j.source
      })),
      selectedColumns: tables.flatMap(t =>
        t.pinnedColumns.map(col => ({ tableId: t.id, column: col }))
      ),
      filters: filters.map(f => ({ tableId: f.tableId, column: f.column, operator: f.operator, value: f.value })),
      sorting: sorting.map(s => ({ tableId: s.tableId, column: s.column, order: s.order })),
      limit,
      params
    };
  }, [activeConnectionId, rootTableId, joins, tables, filters, sorting, limit, params]);

  const executeQuery = useCallback(async () => {
    if (!rootTableId) {
      toast({ variant: 'destructive', title: 'Invalid Graph', description: 'No root table anchored.' });
      return;
    }

    setIsExecuting(true);
    try {
      const payload = buildStructuredQuery();
      const validation = await api.validateQuery(payload);
      if (!validation.valid) {
        toast({ variant: 'destructive', title: 'Query Validation Failed', description: validation.errors.join(' ') });
        setIsExecuting(false);
        return;
      }
      if (validation.warnings.length > 0) {
        toast({ title: 'Query Warnings', description: validation.warnings.join(' ') });
      }

      const result = await api.executeQuery(payload);
      setQueryResult(result);

      const historyItem = await api.appendHistory({
        timestamp: new Date().toISOString(),
        connectionId: activeConnectionId,
        sql: result.sql,
        params,
        metrics: { time: result.executionTimeMs, rows: result.rowCount },
        status: 'success'
      });

      setHistory(prev => [historyItem, ...prev]);
    } catch (error: any) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Query Failed', description: 'There was an error executing your query.' });
      await api.appendHistory({
        timestamp: new Date().toISOString(),
        connectionId: activeConnectionId,
        sql: generatedSql,
        params,
        metrics: { time: 0, rows: 0 },
        status: 'error',
        errorMessage: error?.message ?? String(error)
      });
    } finally {
      setIsExecuting(false);
    }
  }, [buildStructuredQuery, rootTableId, activeConnectionId, generatedSql, params]);

  const addFilter = useCallback((tableId: string, column: string) => {
    setFilters(prev => [...prev, { id: `f-${Date.now()}`, tableId, column, operator: '=', value: '' }]);
  }, []);

  const updateFilter = useCallback((id: string, updates: Partial<Filter>) => {
    setFilters(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  }, []);

  const removeFilter = useCallback((id: string) => {
    setFilters(prev => prev.filter(f => f.id !== id));
  }, []);

  const addSort = useCallback((tableId: string, column: string) => {
    setSorting(prev => [...prev, { id: `s-${Date.now()}`, tableId, column, order: 'ASC' }]);
  }, []);

  const removeSort = useCallback((id: string) => {
    setSorting(prev => prev.filter(s => s.id !== id));
  }, []);

  const setParam = useCallback((key: string, value: string) => {
    setParams(prev => ({ ...prev, [key]: value }));
  }, []);

  const removeParam = useCallback((key: string) => {
    setParams(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const clearParams = useCallback(() => setParams({}), []);
  const setParamSet = useCallback((ps: Record<string, string>) => setParams(ps), []);

  const value = {
    schema,
    connections,
    activeConnectionId,
    setActiveConnectionId,
    addConnection,
    updateConnection,
    deleteConnection,
    testConnection,
    profiles,
    activeProfileId,
    setActiveProfileId,
    addProfile,
    deleteProfile,
    duplicateProfile,
    saveCurrentToProfile,

    templates,
    saveTemplate,
    applyTemplate,
    deleteTemplate,

    savedQueries,
    saveQuery,
    applySavedQuery,
    deleteSavedQuery,

    presets,
    savePreset,
    applyPreset,
    deletePreset,

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
    setLimit,
    params,
    setParam,
    removeParam,
    clearParams,
  };

  return (
    <WorkbenchContext.Provider value={value}>
      {children}
    </WorkbenchContext.Provider>
  );
}

export function useWorkbench() {
  const context = useContext(WorkbenchContext);
  if (context === undefined) {
    throw new Error('useWorkbench must be used within a WorkbenchProvider');
  }
  return context;
}
