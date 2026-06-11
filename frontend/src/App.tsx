import { useState } from 'react';
import { TronLinkProvider } from './context/TronLinkContext';
import { Layout } from './components/Layout';
import { Overview } from './pages/Overview';
import { Transfers } from './pages/Transfers';
import { Registry } from './pages/Registry';
import { Settings } from './pages/Settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');

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
