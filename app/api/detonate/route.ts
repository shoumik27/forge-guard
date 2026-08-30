import { NextResponse } from 'next/server';
import { runDetonationSimulation } from '@/lib/detonator-simulator';
import { AgentConfig } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const { config, guardActive } = await req.json();
    const result = runDetonationSimulation(config, guardActive);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Detonation simulation failed' }, { status: 400 });
  }
}