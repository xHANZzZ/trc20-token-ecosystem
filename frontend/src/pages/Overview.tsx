import React from 'react';
import { useTronLink } from '../hooks/useTronLink';

export const Overview: React.FC = () => {
  const { isConnected, network } = useTronLink();

  // Mock data representing contract metrics
  const metrics = [
    { name: "Total Supply", value: "1,000,000.00 ACT", details: "TRC20 Token Supply", icon: "💎" },
    { name: "Active Registry", value: "482 Wallets", details: "Registered Identities", icon: "👤" },
    { name: "Available Energy", value: "85,290 / 100,000", details: "Estimated Gas Limits", icon: "⚡" },
    { name: "Available Bandwidth", value: "4,520 / 5,000 kb", details: "Remaining Network Net", icon: "🌐" }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Network Alert */}
      {!isConnected && (
        <div className="bg-crimsonRed/10 border border-crimsonRed/20 rounded-xl p-4 flex items-center justify-between">
          <p class="text-xs text-crimsonRed font-medium">
            ⚠️ TronLink wallet disconnected. Overview display is showing mock cache records.
          </p>
        </div>
      )}

      {/* Grid panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((item, idx) => (
          <div key={idx} className="bg-slateCard border border-spaceBorder p-5 rounded-2xl shadow-glass flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-mutedGray">
                {item.name}
              </span>
              <p className="text-lg font-black text-pureWhite">
                {item.value}
              </p>
              <span className="text-[10px] text-mutedGray/70 mt-0.5 block font-medium">
                {item.details}
              </span>
            </div>
            <span className="text-2xl bg-obsidian w-12 h-12 flex items-center justify-center rounded-xl border border-spaceBorder">
              {item.icon}
            </span>
          </div>
        ))}
      </div>

      {/* Transaction Activity Chart Mock */}
      <div className="bg-slateCard border border-spaceBorder p-6 rounded-2xl shadow-glass space-y-4">
        <div>
          <h3 class="text-sm font-bold text-pureWhite tracking-tight">Real-Time Transaction Activity</h3>
          <p class="text-[10px] text-mutedGray mt-0.5">Ecosystem transaction throughput trend (last 7 blocks)</p>
        </div>

        {/* SVG-drawn Vector Chart */}
        <div className="relative h-64 bg-obsidian/40 border border-spaceBorder rounded-xl p-4 flex items-end justify-between overflow-hidden">
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            {/* Fill under line */}
            <path
              d="M 0 100 L 0 70 L 16.6 50 L 33.3 80 L 50 40 L 66.6 60 L 83.3 30 L 100 45 L 100 100 Z"
              fill="url(#teal-gradient)"
              opacity="0.1"
            />
            {/* Line path */}
            <path
              d="M 0 70 L 16.6 50 L 33.3 80 L 50 40 L 66.6 60 L 83.3 30 L 100 45"
              fill="none"
              stroke="#00F5D4"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            <defs>
              <linearGradient id="teal-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00F5D4" />
                <stop offset="100%" stopColor="#00F5D4" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Grid lines and y labels */}
          <div className="absolute inset-0 flex flex-col justify-between py-6 px-4 pointer-events-none text-[8px] font-mono text-mutedGray/20">
            <div className="border-b border-spaceBorder w-full pb-1 text-right">80tx</div>
            <div className="border-b border-spaceBorder w-full pb-1 text-right">60tx</div>
            <div className="border-b border-spaceBorder w-full pb-1 text-right">40tx</div>
            <div className="border-b border-spaceBorder w-full pb-1 text-right">20tx</div>
          </div>

          {/* Block markers */}
          <div className="absolute bottom-2 inset-x-4 flex justify-between text-[8px] font-mono text-mutedGray/50">
            <span>Block #8493021</span>
            <span>Block #8493022</span>
            <span>Block #8493023</span>
            <span>Block #8493024</span>
            <span>Block #8493025</span>
            <span>Block #8493026</span>
            <span>Block #8493027</span>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-slateCard border border-spaceBorder p-6 rounded-2xl shadow-glass space-y-4">
        <h3 class="text-sm font-bold text-pureWhite tracking-tight">Compliance Audit Auditing Console</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs">
          <div className="bg-obsidian border border-spaceBorder p-4 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-tealAccent uppercase">Network Endpoint</span>
            <p className="font-semibold">{network}</p>
            <span className="text-[9px] text-mutedGray mt-0.5 block font-mono">Proxy: T9yD14Nj9j7x...</span>
          </div>
          <div className="bg-obsidian border border-spaceBorder p-4 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-tealAccent uppercase">TVM Version</span>
            <p className="font-semibold">Solidity Compiler 0.8.20</p>
            <span className="text-[9px] text-mutedGray mt-0.5 block font-mono">EVM: Shanghai Compat</span>
          </div>
          <div className="bg-obsidian border border-spaceBorder p-4 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-tealAccent uppercase">Ecosystem Compliance</span>
            <p className="font-semibold">Compliance Checking Ready</p>
            <span className="text-[9px] text-mutedGray mt-0.5 block font-mono">UUPS upgrade patterns</span>
          </div>
        </div>
      </div>

    </div>
  );
};
