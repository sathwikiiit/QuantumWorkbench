import { NextRequest, NextResponse } from 'next/server';
import { history, createId } from '@/lib/mock-store';
import type { ExecutionHistoryItem } from '@/lib/types';

export async function GET() {
  return NextResponse.json(history);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const item: Omit<ExecutionHistoryItem, 'id'> = body;
  const newItem: ExecutionHistoryItem = {
    ...item,
    id: createId('h'),
    timestamp: item.timestamp ? new Date(item.timestamp).toISOString() : new Date().toISOString()
  };
  history.unshift(newItem);
  return NextResponse.json(newItem, { status: 201 });
}
