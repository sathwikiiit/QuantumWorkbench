import { NextResponse } from 'next/server';
import { REALISTIC_SCHEMA } from '@/lib/mock-schema';

export async function GET() {
  // In a real backend, you'd look up the schema for the given connection.
  // Here we just return the same mock schema for every connection.
  return NextResponse.json({ tables: REALISTIC_SCHEMA });
}
