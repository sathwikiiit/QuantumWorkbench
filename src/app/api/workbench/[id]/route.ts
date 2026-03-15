import { NextRequest, NextResponse } from 'next/server';
import { workbenchStates } from '@/lib/mock-store';
import type { WorkbenchState } from '@/lib/types';

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const updates = await req.json();
  const idx = workbenchStates.findIndex(w => w.id === id);
  if (idx === -1) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  const updated: WorkbenchState = { ...workbenchStates[idx], ...updates };
  workbenchStates[idx] = updated;
  return NextResponse.json(updated);
}

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const state = workbenchStates.find(w => w.id === id);
  if (!state) return NextResponse.json(null);
  return NextResponse.json(state);
}
