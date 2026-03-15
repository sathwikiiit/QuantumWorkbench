import { NextResponse } from 'next/server';

export async function PUT() {
  return new NextResponse('Mock endpoint removed. Configure NEXT_PUBLIC_API_URL.', { status: 410 });
}

export async function DELETE() {
  return new NextResponse('Mock endpoint removed. Configure NEXT_PUBLIC_API_URL.', { status: 410 });
}
