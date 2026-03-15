import { NextRequest, NextResponse } from 'next/server';
import { templates, createId } from '@/lib/mock-store';
import type { Template } from '@/lib/types';

export async function GET() {
  return NextResponse.json(templates);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'> = body;
  const now = new Date().toISOString();
  const newTemplate: Template = { ...template, id: createId('t'), createdAt: now, updatedAt: now };
  templates.push(newTemplate);
  return NextResponse.json(newTemplate, { status: 201 });
}
