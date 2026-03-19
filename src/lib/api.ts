import { Connection, ExecutionHistoryItem, Profile, QueryResult, TableSchema, WorkbenchState, Template, SavedQuery, Preset } from './types';

// Use environment variable for the API base URL. 
const BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

export async function getSchema(connectionId?: string, schemaName?: string): Promise<TableSchema[]> {
  const url = connectionId
    ? `${BASE}/connections/${encodeURIComponent(connectionId)}/schema${schemaName ? `?schemaName=${encodeURIComponent(schemaName)}` : ''}`
    : `${BASE}/schema`;

  const res = await fetch(url, { cache: 'no-store' });
  const json = await handleResponse<{ tables: TableSchema[] }>(res);
  return json.tables;
}

export async function getSchemas(connectionId: string): Promise<string[]> {
  const res = await fetch(`${BASE}/connections/${encodeURIComponent(connectionId)}/schemas`, { cache: 'no-store' });
  return handleResponse<string[]>(res);
}

export async function getConnections(): Promise<Connection[]> {
  const res = await fetch(`${BASE}/connections`, { cache: 'no-store' });
  return handleResponse<Connection[]>(res);
}

export async function createConnection(conn: Omit<Connection, 'id' | 'status'>): Promise<Connection> {
  const res = await fetch(`${BASE}/connections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(conn),
  });
  return handleResponse<Connection>(res);
}

export async function updateConnection(id: string, updates: Partial<Connection>): Promise<Connection> {
  const res = await fetch(`${BASE}/connections/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return handleResponse<Connection>(res);
}

export async function deleteConnection(id: string): Promise<void> {
  await fetch(`${BASE}/connections/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function testConnection(id: string): Promise<{ status: 'connected' | 'error'; message?: string }> {
  const res = await fetch(`${BASE}/connections/${encodeURIComponent(id)}/test`, { method: 'POST' });
  return handleResponse<{ status: 'connected' | 'error'; message?: string }>(res);
}

export async function getProfiles(): Promise<Profile[]> {
  const res = await fetch(`${BASE}/profiles`, { cache: 'no-store' });
  return handleResponse<Profile[]>(res);
}

export async function createProfile(profile: Omit<Profile, 'id'>): Promise<Profile> {
  const res = await fetch(`${BASE}/profiles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  return handleResponse<Profile>(res);
}

export async function updateProfile(id: string, updates: Partial<Profile>): Promise<Profile> {
  const res = await fetch(`${BASE}/profiles/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return handleResponse<Profile>(res);
}

export async function deleteProfile(id: string): Promise<void> {
  await fetch(`${BASE}/profiles/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function duplicateProfile(id: string): Promise<Profile> {
  const res = await fetch(`${BASE}/profiles/${encodeURIComponent(id)}/duplicate`, { method: 'POST' });
  return handleResponse<Profile>(res);
}

export type StructuredQuery = {
  connectionId: string;
  rootTableId: string | null;
  joins: Array<{
    id: string;
    sourceTableId: string;
    sourceColumn: string;
    targetTableId: string;
    targetColumn: string;
    type: 'INNER' | 'LEFT';
    active: boolean;
  }>;
  selectedColumns: Array<{ tableId: string; column: string }>;
  filters: Array<{ tableId: string; column: string; operator: string; value: string }>;
  limit: number;
  params?: Record<string, string>;
  sorting?: Array<{ tableId: string; column: string; order: 'ASC' | 'DESC' }>;
};

export type QueryValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
  unreachableTables?: string[];
};

export type QueryRequest = {
  connectionId: string;
  sql: string;
  queryLimit: number;
};

export async function executeQuery(payload: QueryRequest): Promise<QueryResult> {
  const res = await fetch(`${BASE}/query/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<QueryResult>(res);
}

export async function validateQuery(payload: QueryRequest): Promise<QueryValidationResult> {
  const res = await fetch(`${BASE}/query/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<QueryValidationResult>(res);
}

export async function getHistory(): Promise<ExecutionHistoryItem[]> {
  const res = await fetch(`${BASE}/history`, { cache: 'no-store' });
  return handleResponse<ExecutionHistoryItem[]>(res);
}

export async function appendHistory(item: Omit<ExecutionHistoryItem, 'id'>): Promise<ExecutionHistoryItem> {
  const res = await fetch(`${BASE}/history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  return handleResponse<ExecutionHistoryItem>(res);
}

export async function getTemplates(): Promise<Template[]> {
  const res = await fetch(`${BASE}/templates`, { cache: 'no-store' });
  return handleResponse<Template[]>(res);
}

export async function createTemplate(template: Omit<Template, 'id' | 'createdAt'>): Promise<Template> {
  const res = await fetch(`${BASE}/templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(template),
  });
  return handleResponse<Template>(res);
}

export async function updateTemplate(id: string, updates: Partial<Template>): Promise<Template> {
  const res = await fetch(`${BASE}/templates/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return handleResponse<Template>(res);
}

export async function deleteTemplate(id: string): Promise<void> {
  await fetch(`${BASE}/templates/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function getSavedQueries(): Promise<SavedQuery[]> {
  const res = await fetch(`${BASE}/saved-queries`, { cache: 'no-store' });
  return handleResponse<SavedQuery[]>(res);
}

export async function createSavedQuery(query: Omit<SavedQuery, 'id' | 'createdAt'>): Promise<SavedQuery> {
  const res = await fetch(`${BASE}/saved-queries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query),
  });
  return handleResponse<SavedQuery>(res);
}

export async function updateSavedQuery(id: string, updates: Partial<SavedQuery>): Promise<SavedQuery> {
  const res = await fetch(`${BASE}/saved-queries/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return handleResponse<SavedQuery>(res);
}

export async function deleteSavedQuery(id: string): Promise<void> {
  await fetch(`${BASE}/saved-queries/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function getPresets(): Promise<Preset[]> {
  const res = await fetch(`${BASE}/presets`, { cache: 'no-store' });
  return handleResponse<Preset[]>(res);
}

export async function createPreset(preset: Omit<Preset, 'id' | 'createdAt'>): Promise<Preset> {
  const res = await fetch(`${BASE}/presets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preset),
  });
  return handleResponse<Preset>(res);
}

export async function updatePreset(id: string, updates: Partial<Preset>): Promise<Preset> {
  const res = await fetch(`${BASE}/presets/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return handleResponse<Preset>(res);
}

export async function deletePreset(id: string): Promise<void> {
  await fetch(`${BASE}/presets/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function getWorkbenchState(id?: string): Promise<WorkbenchState | null> {
  const url = id ? `${BASE}/workbench/${encodeURIComponent(id)}` : `${BASE}/workbench`;
  const res = await fetch(url, { cache: 'no-store' });
  return handleResponse<WorkbenchState | null>(res);
}

export async function saveWorkbenchState(state: WorkbenchState): Promise<WorkbenchState> {
  const res = await fetch(`${BASE}/workbench`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state),
  });
  return handleResponse<WorkbenchState>(res);
}

export async function updateWorkbenchState(id: string, state: Partial<WorkbenchState>): Promise<WorkbenchState> {
  const res = await fetch(`${BASE}/workbench/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state),
  });
  return handleResponse<WorkbenchState>(res);
}