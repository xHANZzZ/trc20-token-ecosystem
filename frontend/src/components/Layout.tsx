import React from 'react';
import { useTronLink } from '../hooks/useTronLink.js';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { address, isConnected, trxBalance, network, connectWallet } = useTronLink();

  const menuItems = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'transfers', name: 'Transfers Logs', icon: '💸' },
    { id: 'registry', name: 'Wallet Registry', icon: '👤' },
    { id: 'settings', name: 'Settings & Upgrades', icon: '⚙️' }
  ];

  return (
    <div className="min-h-screen bg-obsidian text-pureWhite flex font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slateCard border-r border-spaceBorder flex flex-col justify-between p-6">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded bg-tealAccent flex items-center justify-center font-black text-sm text-obsidian shadow-teal-glow">
              T
            </span>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-wider leading-none">TRC20 Admin</span>
              <span className="text-[9px] text-mutedGray mt-1 tracking-widest font-mono">UUPS PROXY</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all duration-200 text-left
                  ${activeTab === item.id
                    ? 'bg-tealAccent/10 text-tealAccent border border-tealAccent/15 shadow-teal-glow/5'
                    : 'text-mutedGray hover:bg-spaceBorder/5 hover:text-pureWhite'
                  }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* System footer context */}
        <div className="text-[9px] text-mutedGray/50 space-y-0.5 font-mono">
          <p>TVM Shanghai standard</p>
          <p>RPC: {network}</p>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Navbar */}
        <header className="h-20 bg-slateCard/35 border-b border-spaceBorder flex items-center justify-between px-8 backdrop-blur-md">
          <div>
            <h1 className="text-sm font-extrabold uppercase tracking-widest text-mutedGray">
              {menuItems.find(i => i.id === activeTab)?.name}
            </h1>
            <p className="text-[10px] text-mutedGray mt-0.5">Manage compliance registers and token metrics</p>
          </div>

          {/* Wallet connection controls */}
          <div>
            {isConnected && address ? (
              <div className="flex items-center gap-3 bg-slateCard border border-spaceBorder px-4 py-2 rounded-xl">
                <div className="text-right">
                  <p className="text-[10px] text-pureWhite font-mono font-bold leading-none">
                    {address.slice(0, 6)}...{address.slice(-6)}
                  </p>
                  <p className="text-[9px] text-tealAccent font-mono mt-1 leading-none font-medium">
                    {trxBalance} TRX
                  </p>
                </div>
                <div className="w-2 h-2 rounded-full bg-tealAccent animate-pulse shadow-teal-glow"></div>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-tealAccent hover:bg-[#00d1b5] active:scale-95 text-obsidian font-bold text-xs px-5 py-2.5 rounded-xl shadow-teal-glow transition-all"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </header>

        {/* Main Content viewport */}
        <main className="flex-1 p-8 overflow-y-auto bg-obsidian">
          {children}
        </main>
      </div>
    </div>
  );
};
