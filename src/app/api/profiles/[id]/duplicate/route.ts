import { NextResponse } from 'next/server';

export async function POST() {
  return new NextResponse('Mock endpoint removed. Configure NEXT_PUBLIC_API_URL.', { status: 410 });
}
