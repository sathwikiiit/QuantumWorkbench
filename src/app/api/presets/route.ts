import { NextRequest, NextResponse } from 'next/server';
import { presets, createId } from '@/lib/mock-store';
import type { Preset } from '@/lib/types';

export async function GET() {
  return NextResponse.json(presets);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const preset: Omit<Preset, 'id' | 'createdAt'> = body;
  const newPreset: Preset = { ...preset, id: createId('p'), createdAt: new Date().toISOString() };
  presets.push(newPreset);
  return NextResponse.json(newPreset, { status: 201 });
}
