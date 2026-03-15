import { NextRequest, NextResponse } from 'next/server';
import { connections, createId } from '@/lib/mock-store';
import type { Connection } from '@/lib/types';

export async function GET() {
  return NextResponse.json(connections);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const conn: Omit<Connection, 'id' | 'status'> = body;
  const newConn: Connection = {
    ...conn,
    id: createId('c'),
    status: 'disconnected'
  };
  connections.push(newConn);
  return NextResponse.json(newConn, { status: 201 });
}
