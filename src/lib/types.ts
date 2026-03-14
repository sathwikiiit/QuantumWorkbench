
export type Column = {
  name: string;
  type: string;
  isPrimary?: boolean;
  isNullable?: boolean;
};

export type Table = {
  id: string;
  name: string;
  alias?: string;
  columns: Column[];
  position: { x: number; y: number };
  pinnedColumns: string[];
};

export type JoinType = 'INNER' | 'LEFT' | 'RIGHT' | 'FULL';

export type Join = {
  id: string;
  sourceTableId: string;
  sourceColumn: string;
  targetTableId: string;
  targetColumn: string;
  type: JoinType;
  active: boolean;
};

export type WorkbenchProfile = {
  id: string;
  name: string;
  connectionUrl: string;
  databaseType: 'PostgreSQL' | 'MySQL' | 'SQLite';
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
};
