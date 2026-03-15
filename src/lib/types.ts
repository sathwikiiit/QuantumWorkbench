
export type Column = {
  name: string;
  type: string;
  isPrimary?: boolean;
  isForeignKey?: boolean;
  references?: { table: string; column: string };
  isNullable?: boolean;
};

export type ForeignKey = {
  column: string;
  referencesTable: string;
  referencesColumn: string;
};

export type TableSchema = {
  id: string;
  name: string;
  columns: Column[];
  foreignKeys?: ForeignKey[];
};

export type TableInstance = {
  id: string;
  schemaId: string;
  name: string;
  alias?: string;
  position: { x: number; y: number };
  pinnedColumns: string[];
  isRoot?: boolean;
  isReachable?: boolean;
};

export type JoinType = 'INNER' | 'LEFT';

export type Join = {
  id: string;
  sourceTableId: string;
  sourceColumn: string;
  targetTableId: string;
  targetColumn: string;
  type: JoinType;
  active: boolean;
  required?: boolean;
  source?: 'auto' | 'manual';
};

export type FilterOperator = '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN' | 'IS NULL' | 'IS NOT NULL';

export type Filter = {
  id: string;
  tableId: string;
  column: string;
  operator: FilterOperator;
  value: string;
};

export type SortOrder = 'ASC' | 'DESC';

export type SortRule = {
  id: string;
  tableId: string;
  column: string;
  order: SortOrder;
};

export type DBType = 'PostgreSQL' | 'MySQL' | 'SQLite';

export type Connection = {
  id: string;
  name: string;
  type: DBType;
  host: string;
  port: number;
  databaseName: string;
  username: string;
  password?: string;
  status: 'connected' | 'disconnected' | 'error';
};

export type Profile = {
  id: string;
  name: string;
  connectionId: string;
  tables: TableInstance[];
  joins: Join[];
  rootTableId: string | null;
  selectedColumns: { tableId: string; column: string }[];
  filters: Filter[];
  sorting: SortRule[];
  limit: number;
};

export type WorkbenchState = {
  id?: string;
  connectionId: string;
  tables: TableInstance[];
  joins: Join[];
  rootTableId: string | null;
  filters: Filter[];
  sorting: SortRule[];
  limit: number;
  selectedColumns: { tableId: string; column: string }[];
  params?: Record<string, string>;
};

export type Template = {
  id: string;
  name: string;
  connectionId: string;
  tables: TableInstance[];
  joins: Join[];
  rootTableId: string | null;
  selectedColumns: { tableId: string; column: string }[];
  filters: Filter[];
  sorting: SortRule[];
  limit: number;
  createdAt: string;
  updatedAt?: string;
  schemaSnapshotVersion?: string;
};

export type SavedQuery = {
  id: string;
  name: string;
  connectionId: string;
  templateId?: string;
  sql?: string;
  description?: string;
  enabledJoins: string[]; // join ids
  selectedColumns: { tableId: string; column: string }[];
  filters: Filter[];
  sorting: SortRule[];
  limit: number;
  params: Record<string, string>;
  createdAt: string;
};

export type Preset = {
  id: string;
  name: string;
  queryId?: string;
  templateId?: string;
  params: Record<string, string>;
  tags?: string[];
  notes?: string;
  createdAt: string;
};

export type QueryResult = {
  sql: string;
  columns: Array<{ name: string; type?: string }>;
  rows: any[];
  executionTimeMs: number;
  rowCount: number;
};

export type ExecutionHistoryItem = {
  id: string;
  timestamp: string;
  connectionId: string;
  sql: string;
  params?: Record<string, string>;
  joins?: Join[];
  selectedColumns?: { tableId: string; column: string }[];
  metrics: {
    time: number;
    rows: number;
  };
  status: 'success' | 'error';
  errorMessage?: string;
};
