import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { useTronLink } from '../hooks/useTronLink';

export const Settings: React.FC = () => {
  const { isConnected, isOwner, address } = useTronLink();

  // Settings State variables
  const [proposedOwner, setProposedOwner] = useState('');
  const [pendingOwner, setPendingOwner] = useState<string | null>(null);
  const [newImplementation, setNewImplementation] = useState('');
  
  // Modals & UI triggers
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [proposeLoading, setProposeLoading] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch pending owner from contract on mount or refresh
  const fetchPendingOwner = async () => {
    if (!window.tronWeb || !isConnected) return;
    try {
      const contract = await window.tronWeb.contract().at("T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb");
      const pending = await contract.pendingOwner().call();
      if (pending && pending !== "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb" && pending !== "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb") {
        setPendingOwner(pending);
      } else {
        setPendingOwner(null);
      }
    } catch (err) {
      console.error('Failed to query pendingOwner status:', err);
    }
  };

  useEffect(() => {
    fetchPendingOwner();
  }, [isConnected]);

  const handleProposeOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!isOwner) {
      setFormError('Action rejected: Owner privileges required.');
      return;
    }

    if (!/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(proposedOwner)) {
      setFormError('Invalid TRON address format.');
      return;
    }

    try {
      setProposeLoading(true);
      const contract = await window.tronWeb.contract().at("T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb");
      const txid = await contract.transferOwnership(proposedOwner).send({
        feeLimit: 100000000
      });

      setPendingOwner(proposedOwner);
      setProposedOwner('');
      alert(`Ownership transfer proposed! Pending Owner: ${proposedOwner}. TxID: ${txid}`);
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Ownership transfer transaction reverted.');
    } finally {
      setProposeLoading(false);
    }
  };

  const handleClaimOwnership = async () => {
    try {
      setClaimLoading(true);
      const contract = await window.tronWeb.contract().at("T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb");
      const txid = await contract.acceptOwnership().send({
        feeLimit: 100000000
      });

      setPendingOwner(null);
      alert(`Ownership claimed successfully! You are now the contract owner. TxID: ${txid}`);
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Ownership claim transaction reverted.');
    } finally {
      setClaimLoading(false);
    }
  };

  const handleUpgradeTrigger = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!isOwner) {
      setFormError('Only the contract Owner can upgrade implementations.');
      return;
    }

    if (!/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(newImplementation)) {
      setFormError('Invalid implementation logic address format.');
      return;
    }

    setIsUpgradeModalOpen(true);
  };

  const handleUpgradeConfirm = async () => {
    try {
      setUpgradeLoading(true);
      const contract = await window.tronWeb.contract().at("T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb");
      const txid = await contract.upgradeTo(newImplementation).send({
        feeLimit: 150000000
      });

      setIsUpgradeModalOpen(false);
      setNewImplementation('');
      alert(`Proxy upgraded to new implementation successfully! TxID: ${txid}`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Proxy upgrade transaction reverted.');
    } finally {
      setUpgradeLoading(false);
    }
  };

  // Determine if connected address is the proposed claimant
  const showClaimButton = address && pendingOwner && address === pendingOwner;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Settings Grid Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
        
        {/* Security Gating Overlay */}
        {!isOwner && (
          <div className="absolute inset-0 bg-[#0B0F19]/90 backdrop-blur-[4px] z-20 flex flex-col items-center justify-center p-6 text-center rounded-2xl border border-spaceBorder">
            <span className="text-3xl">🔒</span>
            <h3 className="text-sm font-black uppercase text-tealAccent mt-4 tracking-widest">Ownership Credentials Required</h3>
            <p className="text-xs text-mutedGray mt-2 max-w-sm leading-relaxed">
              These settings control contract logic and storage ownership. Connect the contract deployer address using TronLink.
            </p>
          </div>
        )}

        {/* Column 1: Two-Step Ownership Management */}
        <div className="bg-slateCard border border-spaceBorder p-6 rounded-2xl shadow-glass space-y-6">
          <h3 className="text-sm font-bold text-pureWhite tracking-tight border-b border-spaceBorder pb-3">
            Two-Step Ownership Delegation
          </h3>

          <form onSubmit={handleProposeOwner} className="space-y-4">
            <Input
              label="Propose New Owner Address"
              placeholder="T..."
              value={proposedOwner}
              onChange={(e) => setProposedOwner(e.target.value)}
              error={formError && formError.includes('proposed') ? formError : undefined}
            />

            <Button
              type="submit"
              variant="primary"
              loading={proposeLoading}
              disabled={!isOwner}
            >
              Propose New Owner
            </Button>
          </form>

          {/* Pending Owner Details */}
          {pendingOwner && (
            <div className="bg-obsidian border border-spaceBorder p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-mutedGray uppercase tracking-wider">Pending Proposed Owner</span>
                <span className="text-[9px] bg-tron-amber/10 text-tron-amber border border-tron-amber/20 px-2 py-0.5 rounded font-bold uppercase">Pending</span>
              </div>
              <p className="text-xs font-mono text-pureWhite break-all">{pendingOwner}</p>

              {/* Claim Action Interface (Visible only to claimant) */}
              {showClaimButton && (
                <div className="border-t border-spaceBorder pt-3 mt-2">
                  <p className="text-[10px] text-mutedGray mb-2">
                    Your connected address is the designated candidate. Click accept to assume contract ownership.
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleClaimOwnership}
                    loading={claimLoading}
                  >
                    Claim Contract Ownership
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Column 2: Proxy Logic Upgrades */}
        <div className="bg-slateCard border border-spaceBorder p-6 rounded-2xl shadow-glass space-y-6">
          <h3 className="text-sm font-bold text-pureWhite tracking-tight border-b border-spaceBorder pb-3">
            UUPS Proxy Logic Upgrades
          </h3>

          <form onSubmit={handleUpgradeTrigger} className="space-y-4">
            <Input
              label="New Logic Implementation Contract Address"
              placeholder="T..."
              value={newImplementation}
              onChange={(e) => setNewImplementation(e.target.value)}
              error={formError && formError.includes('implementation') ? formError : undefined}
            />

            <Button
              type="submit"
              variant="destructive"
              disabled={!isOwner}
            >
              Trigger Implementation Upgrade
            </Button>
          </form>

          <div className="bg-obsidian border border-spaceBorder p-4 rounded-xl text-[10px] text-mutedGray/80 leading-relaxed space-y-2 font-sans">
            <p className="font-bold text-pureWhite uppercase">⚠️ Critical UUPS Storage Warning</p>
            <p>
              Upgrading proxies is high-risk. Ensure the target logic implementation contract implements identical storage sequence mappings to avoid state variable corruption.
            </p>
          </div>
        </div>

      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isUpgradeModalOpen}
        title="Confirm Logic Implementation Upgrade"
        description={`Warning: You are about to upgrade the proxy contract to the implementation logic address: ${newImplementation}. If the target contract lacks UUPS upgrade methods, this contract will become permanently immutable.`}
        onClose={() => setIsUpgradeModalOpen(false)}
        onConfirm={handleUpgradeConfirm}
        confirmText="Execute Upgrade"
        confirmLoading={upgradeLoading}
        isDestructive={true}
      />
    </div>
  );
};
