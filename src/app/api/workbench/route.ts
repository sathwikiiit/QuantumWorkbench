import { NextRequest, NextResponse } from 'next/server';
import { workbenchStates, createId } from '@/lib/mock-store';
import type { WorkbenchState } from '@/lib/types';

export async function GET() {
  return NextResponse.json(workbenchStates);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const state: Omit<WorkbenchState, 'id'> = body;
  const newState: WorkbenchState = { ...state, id: createId('w') };
  workbenchStates.push(newState);
  return NextResponse.json(newState, { status: 201 });
}
