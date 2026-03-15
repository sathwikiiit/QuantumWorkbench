import { NextRequest, NextResponse } from 'next/server';
import { connections } from '@/lib/mock-store';
import type { Connection } from '@/lib/types';

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const updates = await req.json();
  const idx = connections.findIndex(c => c.id === id);
  if (idx === -1) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  const updated: Connection = { ...connections[idx], ...updates };
  connections[idx] = updated;
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const idx = connections.findIndex(c => c.id === id);
  if (idx === -1) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  connections.splice(idx, 1);
  return NextResponse.json({ success: true });
}
