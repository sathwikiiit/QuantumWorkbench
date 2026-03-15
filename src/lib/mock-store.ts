import { Connection, ExecutionHistoryItem, Profile, WorkbenchState, Template, SavedQuery, Preset } from './types';

export const connections: Connection[] = [
  { id: 'c1', name: 'Production_v1', type: 'PostgreSQL', host: 'db.prod.internal', port: 5432, databaseName: 'main', username: 'admin', status: 'connected' },
  { id: 'c2', name: 'Staging_Replica', type: 'MySQL', host: 'db.staging.internal', port: 3306, databaseName: 'staging', username: 'developer', status: 'disconnected' }
];

export const profiles: Profile[] = [
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
];

export const history: ExecutionHistoryItem[] = [];

export const workbenchStates: WorkbenchState[] = [];

export const templates: Template[] = [];
export const savedQueries: SavedQuery[] = [];
export const presets: Preset[] = [];

export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}
