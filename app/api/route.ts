import { NextResponse } from 'next/server';
import { analyzeAgentTrifecta } from '@/lib/trifecta-engine';
import { AgentConfig } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const config: AgentConfig = await req.json();
    const result = analyzeAgentTrifecta(config);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to analyze agent configuration' }, { status: 400 });
  }
}