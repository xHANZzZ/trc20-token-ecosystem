import React, { useState } from 'react';
import { TronLinkProvider } from './context/TronLinkContext.js';
import { Layout } from './components/Layout.js';
import { Overview } from './pages/Overview.js';
import { Transfers } from './pages/Transfers.js';
import { Registry } from './pages/Registry.js';
import { Settings } from './pages/Settings.js';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Router dispatcher based on menu selections
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />;
      case 'transfers':
        return <Transfers />;
      case 'registry':
        return <Registry />;
      case 'settings':
        return <Settings />;
      default:
        return <Overview />;
    }
  };

  return (
    <TronLinkProvider>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderContent()}
      </Layout>
    </TronLinkProvider>
  );
}
