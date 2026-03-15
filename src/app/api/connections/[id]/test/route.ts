import { NextRequest, NextResponse } from 'next/server';
import { connections } from '@/lib/mock-store';

export async function POST(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const conn = connections.find(c => c.id === id);
  if (!conn) return NextResponse.json({ status: 'error', message: 'Connection not found' }, { status: 404 });

  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const success = Math.random() > 0.2;
  conn.status = success ? 'connected' : 'error';

  return NextResponse.json({ status: success ? 'connected' : 'error', message: success ? undefined : 'Host unreachable or invalid credentials.' });
}
