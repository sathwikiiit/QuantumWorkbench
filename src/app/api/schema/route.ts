import { NextResponse } from 'next/server';
import { REALISTIC_SCHEMA } from '@/lib/mock-schema';

export async function GET() {
  return NextResponse.json({ tables: REALISTIC_SCHEMA });
}
