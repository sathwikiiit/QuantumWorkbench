import { NextRequest, NextResponse } from 'next/server';
import { savedQueries, createId } from '@/lib/mock-store';
import type { SavedQuery } from '@/lib/types';

export async function GET() {
  return NextResponse.json(savedQueries);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const query: Omit<SavedQuery, 'id' | 'createdAt'> = body;
  const newQuery: SavedQuery = { ...query, id: createId('q'), createdAt: new Date().toISOString() };
  savedQueries.push(newQuery);
  return NextResponse.json(newQuery, { status: 201 });
}
