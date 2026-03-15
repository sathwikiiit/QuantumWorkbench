import { NextRequest, NextResponse } from 'next/server';
import { presets } from '@/lib/mock-store';
import type { Preset } from '@/lib/types';

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const updates = await req.json();
  const idx = presets.findIndex(p => p.id === id);
  if (idx === -1) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  const updated: Preset = { ...presets[idx], ...updates };
  presets[idx] = updated;
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const idx = presets.findIndex(p => p.id === id);
  if (idx === -1) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  presets.splice(idx, 1);
  return NextResponse.json({ success: true });
}
