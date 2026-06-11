import React, { createContext, useState, useEffect, ReactNode } from 'react';

// Declare globals since TronLink injects tronWeb and tronLink into the window object
declare global {
  interface Window {
    tronWeb: any;
    tronLink: any;
  }
}

export interface TronLinkContextType {
  address: string | null;
  isConnected: boolean;
  trxBalance: string;
  isOwner: boolean;
  isAdmin: boolean;
  loading: boolean;
  network: string;
  connectWallet: () => Promise<void>;
  refreshData: () => Promise<void>;
}

export const TronLinkContext = createContext<TronLinkContextType | undefined>(undefined);

const CONTRACT_PROXY_ADDRESS = "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb"; // Default Shasta proxy example

export const TronLinkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [trxBalance, setTrxBalance] = useState<string>('0');
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [network, setNetwork] = useState<string>('Unknown');

  /**
   * Prompts TronLink connection access request
   */
  const connectWallet = async (): Promise<void> => {
    if (!window.tronWeb) {
      alert('TronLink extension not detected. Please install TronLink.');
      return;
    }
    try {
      await window.tronLink.request({ method: 'tron_requestAccounts' });
      const addr = window.tronWeb.defaultAddress.base58;
      if (addr) {
        setAddress(addr);
        setIsConnected(true);
        await refreshUserData(addr);
      }
    } catch (error) {
      console.error('User rejected wallet connection:', error);
    }
  };

  /**
   * Refreshes TRX balance, network settings, and queries role validations
   */
  const refreshUserData = async (userAddress: string): Promise<void> => {
    if (!window.tronWeb || !userAddress) return;

    try {
      // 1. Resolve Active Network Name
      const host = window.tronWeb.fullNode.host;
      if (host.includes('shasta')) {
        setNetwork('Shasta Testnet');
      } else if (host.includes('nile')) {
        setNetwork('Nile Testnet');
      } else if (host.includes('trongrid')) {
        setNetwork('TRON Mainnet');
      } else {
        setNetwork('Local/Custom Node');
      }

      // 2. Query Account TRX balance (in Sun, converted to TRX)
      const balanceSun = await window.tronWeb.trx.getBalance(userAddress);
      setTrxBalance((balanceSun / 1_000_000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }));

      // 3. Resolve permissions by checking smart contract views
      const contract = await window.tronWeb.contract().at(CONTRACT_PROXY_ADDRESS);
      
      const [ownerAddr, adminStatus] = await Promise.all([
        contract.owner().call().catch(() => null),
        contract.isRegistryAdmin(userAddress).call().catch(() => false)
      ]);

      const ownerMatched = ownerAddr === userAddress;
      setIsOwner(ownerMatched);
      setIsAdmin(ownerMatched || adminStatus === true);
    } catch (error) {
      console.error('Failed to query contract profiles and balances:', error);
    }
  };

  const refreshData = async (): Promise<void> => {
    if (address) {
      await refreshUserData(address);
    }
  };

  useEffect(() => {
    const initConnection = async (): Promise<void> => {
      if (window.tronWeb && window.tronWeb.ready) {
        const addr = window.tronWeb.defaultAddress.base58;
        if (addr) {
          setAddress(addr);
          setIsConnected(true);
          await refreshUserData(addr);
        }
      }
      setLoading(false);
    };

    // Check on startup
    setTimeout(initConnection, 1000);

    // Event listener for accounts changes in TronLink
    const handleAccountsChanged = async (e: MessageEvent): Promise<void> => {
      if (e.data && e.data.message && e.data.message.action === 'accountsChanged') {
        const newAddr = e.data.message.data.address;
        if (newAddr) {
          setAddress(newAddr);
          setIsConnected(true);
          await refreshUserData(newAddr);
        } else {
          setAddress(null);
          setIsConnected(false);
          setIsOwner(false);
          setIsAdmin(false);
          setTrxBalance('0');
        }
      }
    };

    window.addEventListener('message', handleAccountsChanged);
    return () => window.removeEventListener('message', handleAccountsChanged);
  }, []);

  return (
    <TronLinkContext.Provider value={{
      address,
      isConnected,
      trxBalance,
      isOwner,
      isAdmin,
      loading,
      network,
      connectWallet,
      refreshData
    }}>
      {children}
    </TronLinkContext.Provider>
  );
};
