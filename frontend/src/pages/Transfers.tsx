import React, { useState } from 'react';
import { Button } from '../components/Button.js';
import { Input } from '../components/Input.js';
import { useTronLink } from '../hooks/useTronLink.js';

interface TransactionRecord {
  txid: string;
  timestamp: string;
  from: string;
  to: string;
  amount: string;
  status: 'Success' | 'Pending' | 'Failed';
}

export const Transfers: React.FC = () => {
  const { isConnected } = useTronLink();

  // Mock initial transactions database
  const [transactions, setTransactions] = useState<TransactionRecord[]>([
    { txid: "45fb16a7e930baefcd890fe729da4be13cd4fe729da4be13cd4fe729da4be13c", timestamp: "2026-06-11 22:15:30", from: "TNU1s6m2o9Muxa3xW5M6D7N2oP4yT8Q5R6", to: "TJB1f8m5y9Puxa5xW8M5D9N6oP4yT7Q4R2", amount: "5,000.00", status: "Success" },
    { txid: "72a89fecc628f8ac294d1fe2da98cb36294d5098fecc846109fe1c7f42d9ec89", timestamp: "2026-06-11 21:05:12", from: "TJB1f8m5y9Puxa5xW8M5D9N6oP4yT7Q4R2", to: "TNU1s6m2o9Muxa3xW5M6D7N2oP4yT8Q5R6", amount: "150.00", status: "Success" },
    { txid: "b2f63cd8fe290a188f6c4be09f7a9ec89da7f609e3cd29ff10d65ffbc4123ae42", timestamp: "2026-06-11 20:45:55", from: "TNU1s6m2o9Muxa3xW5M6D7N2oP4yT8Q5R6", to: "TKA3m8p9z4Ruxa5xW8M6D7N5oP3yT9Q2R4", amount: "1,200.00", status: "Failed" },
    { txid: "c29fe028c31e9a2d8e4f1a28a301ecbe29d7fa028fc729feccb8429188e4cb31a", timestamp: "2026-06-11 19:30:18", from: "TKA3m8p9z4Ruxa5xW8M6D7N5oP3yT9Q2R4", to: "TJB1f8m5y9Puxa5xW8M5D9N6oP4yT7Q4R2", amount: "800.00", status: "Success" },
    { txid: "d1a89fecc628f8ac294d1fe2da98cb36294d5098fecc846109fe1c7f42d9ec89", timestamp: "2026-06-11 18:22:04", from: "TNU1s6m2o9Muxa3xW5M6D7N2oP4yT8Q5R6", to: "TJB1f8m5y9Puxa5xW8M5D9N6oP4yT7Q4R2", amount: "2,500.00", status: "Pending" }
  ]);

  // Form states for manual transfer
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  // Search & Pagination states
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 3;

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!isConnected) {
      setFormError('Please connect your TronLink wallet to execute transfers.');
      return;
    }

    if (!/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(recipient)) {
      setFormError('Invalid TRON address format (must start with T and be 34 characters).');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setFormError('Amount must be greater than zero.');
      return;
    }

    try {
      setLoading(true);
      
      // Call window.tronWeb smart contract transfer
      const contract = await window.tronWeb.contract().at("T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb");
      
      // Convert tokens value to uint256 strings (assuming 6 decimals for example, or 18 decimals)
      const tokenUnits = (parseFloat(amount) * 1_000_000).toString();
      const txid = await contract.transfer(recipient, tokenUnits).send({
        feeLimit: 100000000
      });

      // Insert new record into mock list
      const newTx: TransactionRecord = {
        txid,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        from: window.tronWeb.defaultAddress.base58,
        to: recipient,
        amount: parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 }),
        status: 'Pending'
      };

      setTransactions([newTx, ...transactions]);
      setRecipient('');
      setAmount('');
      alert(`Transfer transaction submitted! TxID: ${txid}`);
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Transaction reverted on TRON node.');
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  const filteredTxs = transactions.filter(tx => 
    tx.from.toLowerCase().includes(search.toLowerCase()) ||
    tx.to.toLowerCase().includes(search.toLowerCase()) ||
    tx.txid.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedTxs = filteredTxs.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filteredTxs.length / itemsPerPage) || 1;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Transfer Action Form */}
        <div className="bg-slateCard border border-spaceBorder p-6 rounded-2xl shadow-glass h-fit">
          <h3 className="text-sm font-bold text-pureWhite tracking-tight border-b border-spaceBorder pb-3 mb-4">
            Initiate Manual Token Transfer
          </h3>

          <form onSubmit={handleTransfer} className="space-y-4">
            <Input
              label="Recipient Address"
              placeholder="T..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              error={formError && formError.includes('address') ? formError : undefined}
            />

            <Input
              label="Transfer Amount"
              placeholder="0.00"
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              error={formError && formError.includes('Amount') ? formError : undefined}
            />

            {formError && !formError.includes('address') && !formError.includes('Amount') && (
              <p className="text-[10px] text-crimsonRed font-medium">⚠️ {formError}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              loading={loading}
            >
              Broadcast Transfer
            </Button>
          </form>
        </div>

        {/* Audit Tables Column */}
        <div className="lg:col-span-2 bg-slateCard border border-spaceBorder p-6 rounded-2xl shadow-glass flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-spaceBorder pb-3">
              <h3 className="text-sm font-bold text-pureWhite tracking-tight">Historical Transactions Ledger</h3>
              
              {/* Search Inputs */}
              <input
                type="text"
                placeholder="Search by wallet / TxID..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="bg-obsidian border border-spaceBorder text-[10px] px-3 py-2 rounded-lg text-pureWhite outline-none placeholder-mutedGray/50 focus:border-tealAccent/40 w-full md:w-64"
              />
            </div>

            {/* Ledger Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-spaceBorder text-mutedGray text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-2">TxID</th>
                    <th className="py-3 px-2">Timestamp</th>
                    <th className="py-3 px-2">Destination</th>
                    <th className="py-3 px-2 text-right">Value</th>
                    <th className="py-3 px-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-mutedGray">
                  {paginatedTxs.length > 0 ? (
                    paginatedTxs.map((tx, idx) => (
                      <tr key={idx} className="border-b border-spaceBorder hover:bg-spaceBorder/5">
                        <td className="py-3 px-2 text-tealAccent font-semibold">
                          <span title={tx.txid}>{tx.txid.slice(0, 8)}...</span>
                        </td>
                        <td className="py-3 px-2 text-[10px] text-mutedGray/70 font-sans">{tx.timestamp}</td>
                        <td className="py-3 px-2 font-mono">
                          <span title={tx.to}>{tx.to.slice(0, 6)}...{tx.to.slice(-4)}</span>
                        </td>
                        <td className="py-3 px-2 text-right font-bold text-pureWhite font-mono">{tx.amount}</td>
                        <td className="py-3 px-2 text-center font-sans">
                          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border 
                            ${tx.status === 'Success' 
                              ? 'bg-tealAccent/10 text-tealAccent border-tealAccent/20' 
                              : tx.status === 'Pending' 
                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                                : 'bg-crimsonRed/10 text-crimsonRed border-crimsonRed/20'
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-mutedGray/50 font-sans text-xs">
                        No transactions match search filter
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controllers */}
          <div className="flex items-center justify-between border-t border-spaceBorder pt-4 mt-6">
            <span className="text-[10px] text-mutedGray">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="py-1 px-3"
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="py-1 px-3"
              >
                Next
              </Button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
