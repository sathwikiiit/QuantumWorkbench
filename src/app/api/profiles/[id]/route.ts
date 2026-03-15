import { NextRequest, NextResponse } from 'next/server';
import { profiles } from '@/lib/mock-store';
import type { Profile } from '@/lib/types';

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const updates = await req.json();
  const idx = profiles.findIndex(p => p.id === id);
  if (idx === -1) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  const updated: Profile = { ...profiles[idx], ...updates };
  profiles[idx] = updated;
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const idx = profiles.findIndex(p => p.id === id);
  if (idx === -1) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  profiles.splice(idx, 1);
  return NextResponse.json({ success: true });
}
