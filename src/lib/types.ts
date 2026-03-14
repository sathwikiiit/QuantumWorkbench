
export type Column = {
  name: string;
  type: string;
  isPrimary?: boolean;
  isForeignKey?: boolean;
  references?: { table: string; column: string };
  isNullable?: boolean;
};

export type TableSchema = {
  id: string;
  name: string;
  columns: Column[];
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

export type QueryResult = {
  columns: string[];
  rows: any[];
  executionTimeMs: number;
  rowCount: number;
};

export type ExecutionHistoryItem = {
  id: string;
  timestamp: Date;
  sql: string;
  metrics: {
    time: number;
    rows: number;
  };
  status: 'success' | 'error';
};

export type ParameterPreset = {
  id: string;
  name: string;
  queryId?: string;
  params: Record<string, any>;
};
