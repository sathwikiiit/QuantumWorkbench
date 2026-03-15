import { NextRequest, NextResponse } from 'next/server';
import { profiles, createId } from '@/lib/mock-store';
import type { Profile } from '@/lib/types';

export async function GET() {
  return NextResponse.json(profiles);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const profile: Omit<Profile, 'id'> = body;
  const newProfile: Profile = { ...profile, id: createId('p') };
  profiles.push(newProfile);
  return NextResponse.json(newProfile, { status: 201 });
}
