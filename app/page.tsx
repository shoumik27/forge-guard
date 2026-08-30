'use client';

import React, { useState } from 'react';
import { AgentConfig, TrifectaAnalysisResult, DetonationResult } from '@/lib/types';

const PRESET_VULNERABLE_AGENT: AgentConfig = {
  id: 'agent-support-ops',
  name: 'SupportTriage-Agent-Production',
  systemPrompt: 'You process inbound customer tickets from email and update the database and Slack.',
  model: 'gemini-1.5-pro',
  tools: [
    {
      id: 'email-fetcher-mcp',
      name: 'Inbound Email Ingest',
      description: 'Reads incoming customer emails (untrusted content)',
      category: 'untrusted_content',
      schemaHash: 'hash_v1_f7e3d2',
      parameters: {}
    },
    {
      id: 'customer-db-mcp',
      name: 'Customer Database Reader',
      description: 'Queries confidential internal customer accounts and balances',
      category: 'private_data',
      schemaHash: 'hash_v1_c9a1b8',
      parameters: {}
    },
    {
      id: 'slack-notifier-mcp',
      name: 'External Webhook / Slack Notifier',
      description: 'Sends external notification messages and payload data',
      category: 'external_communication',
      schemaHash: 'hash_v1_a3b9c4',
      parameters: {}
    }
  ]
};

export default function ForgeGuardDashboard() {
  const [agentConfig, setAgentConfig] = useState<AgentConfig>(PRESET_VULNERABLE_AGENT);
  const [analysis, setAnalysis] = useState<TrifectaAnalysisResult | null>(null);
  const [detonation, setDetonation] = useState<DetonationResult | null>(null);
  const [guardActive, setGuardActive] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [hitlApproved, setHitlApproved] = useState<boolean>(false);

  const runAnalysis = async () => {
    setLoading(true);
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agentConfig)
    });
    const data = await res.json();
    setAnalysis(data);
    setLoading(false);
  };

  const runDetonation = async () => {
    setLoading(true);
    const res = await fetch('/api/detonate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config: agentConfig, guardActive })
    });
    const data = await res.json();
    setDetonation(data);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      {/* Header */}
      <header className="mb-8 border-b border-slate-800 pb-5 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-emerald-500 animate-ping"></span>
            FORGEGUARD <span className="text-xs px-2.5 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">Agent Harness Governance</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Lethal Trifecta Detection & Daytona Sandbox Detonation Suite</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
            <span>ForgeGuard Enforcement:</span>
            <input 
              type="checkbox" 
              checked={guardActive} 
              onChange={(e) => setGuardActive(e.target.checked)}
              className="toggle-checkbox h-5 w-9 rounded-full bg-slate-800 checked:bg-indigo-600 transition"
            />
          </label>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Configuration & Trifecta Gate */}
        <section className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Connected MCP Tool Topology</h2>
              <button 
                onClick={runAnalysis} 
                disabled={loading}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded transition"
              >
                {loading ? 'Evaluating...' : 'Run Trifecta Scan'}
              </button>
            </div>

            <div className="space-y-3">
              {agentConfig.tools.map((tool) => (
                <div key={tool.id} className="p-3 bg-slate-950 rounded border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-slate-200">{tool.name}</p>
                    <p className="text-xs text-slate-400">{tool.description}</p>
                  </div>
                  <span className={`text-[10px] uppercase font-mono px-2 py-1 rounded border ${
                    tool.category === 'private_data' ? 'bg-amber-950/60 border-amber-800 text-amber-300' :
                    tool.category === 'untrusted_content' ? 'bg-red-950/60 border-red-800 text-red-300' :
                    'bg-purple-950/60 border-purple-800 text-purple-300'
                  }`}>
                    {tool.category.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Analysis Results Card */}
          {analysis && (
            <div className={`p-5 rounded-lg border ${
              analysis.isLethalTrifecta ? 'bg-red-950/20 border-red-800/80' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Governance Gate Evaluation</h3>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  analysis.governanceAction === 'BLOCKED_PENDING_APPROVAL' 
                    ? 'bg-red-900 text-red-200' 
                    : 'bg-emerald-900 text-emerald-200'
                }`}>
                  {analysis.governanceAction}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                <div className={`p-2 rounded border ${analysis.breakdown.hasUntrustedContent ? 'bg-red-950/50 border-red-800 text-red-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                  <p className="text-[10px] uppercase font-bold">1. Ingestion</p>
                  <p className="text-xs font-mono mt-1">{analysis.breakdown.hasUntrustedContent ? 'UNTRUSTED' : 'SAFE'}</p>
                </div>
                <div className={`p-2 rounded border ${analysis.breakdown.hasPrivateData ? 'bg-amber-950/50 border-amber-800 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                  <p className="text-[10px] uppercase font-bold">2. Private Data</p>
                  <p className="text-xs font-mono mt-1">{analysis.breakdown.hasPrivateData ? 'CONFIDENTIAL' : 'NONE'}</p>
                </div>
                <div className={`p-2 rounded border ${analysis.breakdown.hasExternalComm ? 'bg-purple-950/50 border-purple-800 text-purple-300' : 'bg-slate-950 border-slate-800 text-slate-500'}`}>
                  <p className="text-[10px] uppercase font-bold">3. Outbound</p>
                  <p className="text-xs font-mono mt-1">{analysis.breakdown.hasExternalComm ? 'EXFIL_CAPABLE' : 'NONE'}</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 mb-4 bg-slate-950 p-3 rounded border border-slate-800 font-mono">
                {analysis.riskSummary}
              </p>

              {analysis.isLethalTrifecta && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-xs text-slate-400">Human-in-the-Loop Override Required</span>
                  <button 
                    onClick={() => setHitlApproved(!hitlApproved)}
                    className={`px-3 py-1 text-xs font-bold rounded border ${
                      hitlApproved ? 'bg-emerald-800 border-emerald-600 text-white' : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    {hitlApproved ? 'APPROVED BY SECURITY LEAD' : 'GRANT EXCEPTION APPROVAL'}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Right Column: Live Detonation Sandbox */}
        <section className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Live Sandbox Detonation Chamber</h2>
                <p className="text-xs text-slate-400">Daytona Isolated Environment Target Verification</p>
              </div>
              <button 
                onClick={runDetonation}
                disabled={loading}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-xs font-bold rounded transition"
              >
                {loading ? 'Detonating...' : 'Trigger Exploit Payload'}
              </button>
            </div>

            {/* Terminal Window */}
            <div className="bg-slate-950 rounded-lg border border-slate-800 p-4 font-mono text-xs h-[380px] overflow-y-auto space-y-2">
              <div className="text-slate-500 pb-2 border-b border-slate-900">
                [SYSTEM READY] Daytona sandbox container initialized. Listening for agent execution events...
              </div>

              {detonation?.logs.map((log, index) => (
                <div key={index} className={`flex gap-2 ${log.isThreat ? 'text-rose-400' : 'text-slate-300'}`}>
                  <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                  <span className="font-bold shrink-0">[{log.phase}]</span>
                  <span>{log.message}</span>
                </div>
              ))}

              {detonation?.status === 'EXPLOITED' && detonation.exfiltratedData && (
                <div className="mt-4 p-3 bg-rose-950/40 border border-rose-900 rounded">
                  <p className="text-rose-300 font-bold mb-1">CRITICAL: DATA EXFILTRATION DETECTED</p>
                  <pre className="text-[11px] text-rose-200 overflow-x-auto">{detonation.exfiltratedData}</pre>
                </div>
              )}

              {detonation?.status === 'CONTAINED' && (
                <div className="mt-4 p-3 bg-emerald-950/40 border border-emerald-900 rounded">
                  <p className="text-emerald-300 font-bold">CONTAINMENT SUCCESSFUL: Zero bytes leaked.</p>
                </div>
              )}
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}