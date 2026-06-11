import React, { useState } from 'react';
import { Button } from '../components/Button.js';
import { Input } from '../components/Input.js';
import { useTronLink } from '../hooks/useTronLink.js';

interface RegistryRecord {
  wallet: string;
  identityHash: string;
  registrationTime: string;
}

export const Registry: React.FC = () => {
  const { isConnected, isAdmin } = useTronLink();

  // Mock initial registry database
  const [registry, setRegistry] = useState<RegistryRecord[]>([
    { wallet: "TNU1s6m2o9Muxa3xW5M6D7N2oP4yT8Q5R6", identityHash: "45fca9b19b62fbca8e937d50fc3108c9fe729d7fa028fc729feccb842918e3c1", registrationTime: "2026-06-11 18:22:04" },
    { wallet: "TJB1f8m5y9Puxa5xW8M5D9N6oP4yT7Q4R2", identityHash: "b2f63cd8fe290a188f6c4be09f7a9ec89da7f609e3cd29ff10d65ffbc4123ae4", registrationTime: "2026-06-11 19:30:18" }
  ]);

  // Form states for manual registration
  const [walletInput, setWalletInput] = useState('');
  const [hashInput, setHashInput] = useState('');
  const [formError, setFormError] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [revokeLoading, setRevokeLoading] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!isConnected) {
      setFormError('Please connect your TronLink wallet.');
      return;
    }

    if (!isAdmin) {
      setFormError('Action rejected: Admin privileges required.');
      return;
    }

    if (!/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(walletInput)) {
      setFormError('Invalid TRON address format.');
      return;
    }

    if (!/^[0-9a-fA-F]{64}$/.test(hashInput)) {
      setFormError('Identity hash must be a valid 64-character hex string.');
      return;
    }

    try {
      setRegisterLoading(true);
      
      const contract = await window.tronWeb.contract().at("T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb");
      const txid = await contract.registerWallet(walletInput, hashInput).send({
        feeLimit: 150000000
      });

      const newRecord: RegistryRecord = {
        wallet: walletInput,
        identityHash: hashInput,
        registrationTime: new Date().toISOString().replace('T', ' ').slice(0, 19)
      };

      setRegistry([...registry, newRecord]);
      setWalletInput('');
      setHashInput('');
      alert(`Wallet registered successfully! TxID: ${txid}`);
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Smart contract execution failed.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleRevoke = async (walletAddress: string) => {
    if (!window.confirm(`Are you sure you want to revoke the registration for ${walletAddress}?`)) {
      return;
    }

    try {
      setRevokeLoading(walletAddress);
      
      const contract = await window.tronWeb.contract().at("T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb");
      const txid = await contract.revoke(walletAddress).send({
        feeLimit: 100000000
      });

      setRegistry(registry.filter(item => item.wallet !== walletAddress));
      alert(`Registration revoked! TxID: ${txid}`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Deregistration transaction failed.');
    } finally {
      setRevokeLoading(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Register Action Form (Locked if not admin) */}
        <div className="bg-slateCard border border-spaceBorder p-6 rounded-2xl shadow-glass h-fit relative overflow-hidden">
          
          {/* Permission Overlay */}
          {!isAdmin && (
            <div className="absolute inset-0 bg-[#161B26]/90 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
              <span className="text-2xl">🔒</span>
              <h4 className="text-xs font-black uppercase text-tealAccent mt-2 tracking-widest">Admin Authorization Required</h4>
              <p className="text-[10px] text-mutedGray mt-2 px-4 leading-relaxed">
                Your wallet is not authorized as a Registry Admin. Registration actions are locked.
              </p>
            </div>
          )}

          <h3 className="text-sm font-bold text-pureWhite tracking-tight border-b border-spaceBorder pb-3 mb-4">
            Register Wallet Profile
          </h3>

          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="Wallet Address"
              placeholder="T..."
              value={walletInput}
              onChange={(e) => setWalletInput(e.target.value)}
              error={formError && formError.includes('address') ? formError : undefined}
            />

            <Input
              label="Identity Hash"
              placeholder="64-character sha256 hex string"
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              error={formError && formError.includes('hash') ? formError : undefined}
            />

            {formError && !formError.includes('address') && !formError.includes('hash') && (
              <p className="text-[10px] text-crimsonRed font-medium">⚠️ {formError}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              loading={registerLoading}
            >
              Register Address
            </Button>
          </form>
        </div>

        {/* Registered Table */}
        <div className="lg:col-span-2 bg-slateCard border border-spaceBorder p-6 rounded-2xl shadow-glass">
          <h3 className="text-sm font-bold text-pureWhite tracking-tight border-b border-spaceBorder pb-3 mb-4">
            Registered Identities Directory
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-spaceBorder text-mutedGray text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-2">Registered Address</th>
                  <th className="py-3 px-2">Identity Signature</th>
                  <th className="py-3 px-2">Created At</th>
                  <th className="py-3 px-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="font-mono text-mutedGray">
                {registry.length > 0 ? (
                  registry.map((item, idx) => (
                    <tr key={idx} className="border-b border-spaceBorder hover:bg-spaceBorder/5">
                      <td className="py-3 px-2 text-pureWhite font-bold">
                        <span title={item.wallet}>{item.wallet.slice(0, 6)}...{item.wallet.slice(-6)}</span>
                      </td>
                      <td className="py-3 px-2 text-[10px] text-mutedGray/70">
                        <span title={item.identityHash}>{item.identityHash.slice(0, 12)}...</span>
                      </td>
                      <td className="py-3 px-2 text-[10px] font-sans text-mutedGray/50">{item.registrationTime}</td>
                      <td className="py-3 px-2 text-center font-sans">
                        <Button
                          variant="destructive"
                          disabled={!isAdmin || revokeLoading === item.wallet}
                          loading={revokeLoading === item.wallet}
                          onClick={() => handleRevoke(item.wallet)}
                          className="py-1 px-3.5 text-[10px]"
                        >
                          Revoke
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-mutedGray/50 font-sans text-xs">
                      No addresses are registered in the contract storage
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
