import { useState, useEffect } from 'react';

/**
 * Custom hook to interface with TronLink wallet extension.
 * Provides account connections, listeners, and queries roles (Owner/Admin)
 * from the contract proxy to drive UI permissions.
 */
export const useTronLink = (tokenProxyAddress) => {
  const [address, setAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [trxBalance, setTrxBalance] = useState('0');
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  /**
   * Triggers TronLink connection pop-up
   */
  const connectWallet = async () => {
    if (!window.tronWeb) {
      alert('TronLink extension not detected. Please install TronLink.');
      return;
    }
    try {
      // Standard method to trigger account access request
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
   * Refreshes TRX balances and owner/admin check statuses
   */
  const refreshUserData = async (userAddress) => {
    if (!window.tronWeb || !userAddress) return;

    try {
      // 1. Query TRX Balance
      const balanceSun = await window.tronWeb.trx.getBalance(userAddress);
      setTrxBalance((balanceSun / 1_000_000).toString()); // Convert Sun to TRX

      // 2. Query roles from the Smart Contract if address is provided
      if (tokenProxyAddress) {
        const contract = await window.tronWeb.contract().at(tokenProxyAddress);
        
        // Execute contract view queries
        const [ownerAddr, adminStatus] = await Promise.all([
          contract.owner().call(),
          contract.isRegistryAdmin(userAddress).call()
        ]);

        setIsOwner(ownerAddr === userAddress);
        setIsAdmin(ownerAddr === userAddress || adminStatus === true);
      }
    } catch (err) {
      console.error('Error fetching contract permissions/balances:', err);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      // Delay check slightly to allow TronLink script injection to complete
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

    initialize();

    // Event listener for TronLink accountsChanged
    const handleAccountsChanged = async (e) => {
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
  }, [tokenProxyAddress]);

  return {
    address,
    isConnected,
    trxBalance,
    isOwner,
    isAdmin,
    loading,
    connectWallet,
    refreshPermissions: () => refreshUserData(address)
  };
};
