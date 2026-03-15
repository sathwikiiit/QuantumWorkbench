import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    rootTableId,
    joins = [],
    selectedColumns = [],
    filters = [],
    sorting = [],
    limit = 50
  } = body as any;

  const errors: string[] = [];
  const warnings: string[] = [];

  if (!rootTableId) {
    errors.push('Root table is not set.');
  }

  if (typeof limit !== 'number' || limit <= 0) {
    errors.push('Limit must be a positive number.');
  }

  const reachable = new Set<string>();
  if (rootTableId) reachable.add(rootTableId);

  const queue = rootTableId ? [rootTableId] : [];
  while (queue.length > 0) {
    const cur = queue.shift();
    joins.forEach((join: any) => {
      if (!join.active) return;
      if (join.sourceTableId === cur && !reachable.has(join.targetTableId)) {
        reachable.add(join.targetTableId);
        queue.push(join.targetTableId);
      }
      if (join.targetTableId === cur && !reachable.has(join.sourceTableId)) {
        reachable.add(join.sourceTableId);
        queue.push(join.sourceTableId);
      }
    });
  }

  const referencedTables = new Set<string>([
    ...selectedColumns.map((c: any) => c.tableId),
    ...filters.map((f: any) => f.tableId),
    ...sorting.map((s: any) => s.tableId)
  ]);

  const unreachableTables = Array.from(referencedTables).filter(t => !reachable.has(t));

  if (unreachableTables.length > 0) {
    warnings.push(`Some tables are unreachable from the root table: ${unreachableTables.join(', ')}`);
  }

  joins.forEach((join: any) => {
    if (join.required && !join.active) {
      errors.push(`Join ${join.id} is required and cannot be disabled.`);
    }
  });

  const isValid = errors.length === 0;

  return NextResponse.json({
    valid: isValid,
    errors,
    warnings,
    unreachableTables
  });
}
