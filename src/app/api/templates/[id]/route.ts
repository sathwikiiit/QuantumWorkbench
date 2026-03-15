import { NextRequest, NextResponse } from 'next/server';
import { templates } from '@/lib/mock-store';
import type { Template } from '@/lib/types';

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const updates = await req.json();
  const idx = templates.findIndex(t => t.id === id);
  if (idx === -1) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  const updated: Template = { ...templates[idx], ...updates, updatedAt: new Date().toISOString() };
  templates[idx] = updated;
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const idx = templates.findIndex(t => t.id === id);
  if (idx === -1) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  templates.splice(idx, 1);
  return NextResponse.json({ success: true });
}
