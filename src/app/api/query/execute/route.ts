import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const {
    connectionId,
    rootTableId,
    joins = [],
    selectedColumns = [],
    filters = [],
    sorting = [],
    limit = 50,
    params = {}
  } = body as any;

  if (!rootTableId) {
    return NextResponse.json({ message: 'Missing rootTableId' }, { status: 400 });
  }

  if (limit <= 0) {
    return NextResponse.json({ message: 'Limit must be positive' }, { status: 400 });
  }

  const reachableTables = new Set<string>();
  reachableTables.add(rootTableId);

  const queue = [rootTableId];
  while (queue.length > 0) {
    const current = queue.shift();
    joins.forEach((join: any) => {
      if (!join.active) return;
      if (join.sourceTableId === current && !reachableTables.has(join.targetTableId)) {
        reachableTables.add(join.targetTableId);
        queue.push(join.targetTableId);
      }
      if (join.targetTableId === current && !reachableTables.has(join.sourceTableId)) {
        reachableTables.add(join.sourceTableId);
        queue.push(join.sourceTableId);
      }
    });
  }

  const selectCols = selectedColumns.length > 0
    ? selectedColumns.map((c: any) => `${c.tableId}.${c.column}`)
    : [`${rootTableId}.id`];

  let sql = `SELECT\n  ${selectCols.join(',\n  ')}\nFROM ${rootTableId}`;

  joins.filter((j: any) => j.active && reachableTables.has(j.sourceTableId) && reachableTables.has(j.targetTableId))
    .forEach((join: any) => {
      sql += `\n${join.type || 'INNER'} JOIN ${join.targetTableId} ON ${join.sourceTableId}.${join.sourceColumn} = ${join.targetTableId}.${join.targetColumn}`;
    });

  if (filters.length > 0) {
    const where = filters
      .filter((f: any) => reachableTables.has(f.tableId))
      .map((f: any) => {
        const value = typeof f.value === 'string' && f.value.startsWith(':') ? `:${f.value.slice(1)}` : JSON.stringify(f.value);
        return `${f.tableId}.${f.column} ${f.operator} ${value}`;
      });
    if (where.length > 0) sql += `\nWHERE ${where.join(' AND ')}`;
  }

  if (sorting.length > 0) {
    const order = sorting
      .filter((s: any) => reachableTables.has(s.tableId))
      .map((s: any) => `${s.tableId}.${s.column} ${s.order}`);
    if (order.length > 0) sql += `\nORDER BY ${order.join(', ')}`;
  }

  sql += `\nLIMIT ${limit};`;

  const cols = selectedColumns.length > 0
    ? selectedColumns.map((c: any) => ({ name: c.column, type: 'varchar' }))
    : [{ name: 'id', type: 'uuid' }];

  const rows = Array.from({ length: Math.min(limit, 5) }, (_, i) => {
    const row: Record<string, any> = { id: i + 1 };
    cols.forEach((c: { name: string }) => {
      if (c.name === 'id') return;
      row[c.name] = `value_${i + 1}`;
    });
    return row;
  });

  const result = {
    sql,
    columns: cols,
    rows,
    executionTimeMs: 30 + Math.floor(Math.random() * 120),
    rowCount: rows.length
  };

  // Simulate latency
  await new Promise(resolve => setTimeout(resolve, 300));

  return NextResponse.json(result);
}
