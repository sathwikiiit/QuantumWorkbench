import { NextRequest, NextResponse } from 'next/server';
import { savedQueries } from '@/lib/mock-store';
import type { SavedQuery } from '@/lib/types';

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const updates = await req.json();
  const idx = savedQueries.findIndex(q => q.id === id);
  if (idx === -1) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  const updated: SavedQuery = { ...savedQueries[idx], ...updates };
  savedQueries[idx] = updated;
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const idx = savedQueries.findIndex(q => q.id === id);
  if (idx === -1) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  savedQueries.splice(idx, 1);
  return NextResponse.json({ success: true });
}
