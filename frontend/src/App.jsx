import React, { useState } from 'react';
import { useTronLink } from './hooks/useTronLink';

// Mock Config Proxy Address
const PROXY_CONTRACT_ADDRESS = "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb"; // Example address

export default function App() {
  const {
    address,
    isConnected,
    trxBalance,
    isOwner,
    isAdmin,
    loading,
    connectWallet
  } = useTronLink(PROXY_CONTRACT_ADDRESS);

  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-white flex items-center justify-center font-sans">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-red-500 border-gray-700 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400">Synchronizing with TronLink...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#131b2e] border-r border-gray-800 flex flex-col justify-between p-6">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <span className="w-8 h-8 rounded bg-red-500 flex items-center justify-center font-bold text-lg text-white shadow-neon-red">
              T
            </span>
            <span className="font-semibold text-lg tracking-wider">TRC20 Admin</span>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'overview', name: 'Overview', icon: '📊' },
              { id: 'transfers', name: 'Transfers', icon: '💸' },
              { id: 'registry', name: 'Wallet Registry', icon: '👤', restricted: false },
              { id: 'settings', name: 'Settings', icon: '⚙️', restricted: true }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-red-500/10 text-red-500 border border-red-500/20 shadow-neon-red/10'
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </div>
                {tab.restricted && (
                  <span className="text-[10px] uppercase font-bold text-amber-500/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25">
                    Owner
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Footer info */}
        <div className="text-[10px] text-gray-500">
          <p>TVM Shanghai standard</p>
          <p>Version V1.0.0 (UUPS)</p>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Header Navbar */}
        <header className="h-20 bg-[#131b2e]/50 backdrop-blur-glass border-b border-gray-800 flex items-center justify-between px-8">
          <div>
            <h1 className="text-xl font-semibold capitalize">{activeTab} Panel</h1>
            <p className="text-xs text-gray-500 mt-1">Manage compliance registers and token metrics</p>
          </div>

          {/* Wallet Connection Status */}
          <div>
            {isConnected ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-mono">
                    {address.slice(0, 6)}...{address.slice(-6)}
                  </p>
                  <p className="text-[10px] text-emerald-400 font-mono mt-0.5">
                    {trxBalance} TRX
                  </p>
                </div>
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-neon-green"></div>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-red-500 hover:bg-red-600 active:scale-95 text-white font-medium text-xs px-5 py-2.5 rounded-lg shadow-neon-red transition-all duration-200"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </header>

        {/* Panel Main Area */}
        <div className="flex-1 p-8 overflow-y-auto">
          {/* Permission gating warnings */}
          {activeTab === 'settings' && !isOwner && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 text-center max-w-lg mx-auto mt-12 backdrop-blur-glass">
              <span className="text-3xl">🔒</span>
              <h3 className="text-lg font-semibold text-amber-500 mt-4">System Locked</h3>
              <p className="text-sm text-gray-400 mt-2">
                This page requires the contract Owner role. Please log in with the deployer account using TronLink.
              </p>
            </div>
          )}

          {activeTab === 'registry' && !isAdmin && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 text-center max-w-lg mx-auto mt-12 backdrop-blur-glass">
              <span className="text-3xl">🛡️</span>
              <h3 className="text-lg font-semibold text-amber-500 mt-4">Access Restricted</h3>
              <p className="text-sm text-gray-400 mt-2">
                Registry write actions are locked. Please request registry admin authorization from the owner.
              </p>
            </div>
          )}

          {/* Render regular tabs if not restricted */}
          {((activeTab === 'settings' && isOwner) || (activeTab === 'registry' && isAdmin) || ['overview', 'transfers'].includes(activeTab)) && (
            <div className="space-y-6">
              <div className="bg-[#131b2e] border border-gray-800/50 rounded-xl p-6 shadow-glass backdrop-blur-glass">
                <h2 className="text-lg font-medium mb-2">Active View: {activeTab}</h2>
                <p className="text-sm text-gray-400">
                  Ready to deploy on TRON network Nile / Shasta environment. Use variables to write logic.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
