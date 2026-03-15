import { NextRequest, NextResponse } from 'next/server';
import { profiles, createId } from '@/lib/mock-store';

export async function POST(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const source = profiles.find(p => p.id === id);
  if (!source) return NextResponse.json({ message: 'Not found' }, { status: 404 });

  const copy = {
    ...source,
    id: createId('p'),
    name: `${source.name} (Copy)`
  };
  profiles.push(copy);
  return NextResponse.json(copy);
}
