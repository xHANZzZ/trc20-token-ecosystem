import { useContext } from 'react';
import { TronLinkContext, TronLinkContextType } from '../context/TronLinkContext.js';

/**
 * Hook to retrieve active TronLink wallet states, balances, and admin role gates.
 * Must be wrapped inside <TronLinkProvider>.
 */
export const useTronLink = (): TronLinkContextType => {
  const context = useContext(TronLinkContext);
  if (!context) {
    throw new Error('useTronLink must be used within a TronLinkProvider');
  }
  return context;
};
