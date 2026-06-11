import { TronWeb } from 'tronweb';
import { env } from './env.js';
import { logger } from './logger.js';

// Setup TronWeb instance configured with target node and custodian credentials
export const tronWeb = new TronWeb({
  fullHost: env.TRON_FULL_NODE,
  privateKey: env.TRON_PRIVATE_KEY
});

// Full contract ABI mapping MainToken, WalletRegistry, UUPS, and Pausable functions
export const contractAbi = [
  {
    "inputs": [
      { "internalType": "address", "name": "recipient", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "walletAddress", "type": "address" },
      { "internalType": "string", "name": "identityHash", "type": "string" }
    ],
    "name": "registerWallet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "walletAddress", "type": "address" }],
    "name": "revoke",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "walletAddress", "type": "address" }],
    "name": "getWalletStatus",
    "outputs": [
      { "internalType": "bool", "name": "isRegistered", "type": "bool" },
      { "internalType": "string", "name": "identityHash", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "newImplementation", "type": "address" }],
    "name": "upgradeTo",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "acceptOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "paused",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "unpause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Lazy-loaded contract instance cache
let contractInstance: any = null;

/**
 * Resolves and returns the contract client wrapper pointing to the proxy contract address.
 */
export const getContractInstance = async (): Promise<any> => {
  if (contractInstance) return contractInstance;

  try {
    logger.info(`Resolving contract abstraction at proxy address: ${env.CONTRACT_PROXY_ADDRESS}`);
    contractInstance = await tronWeb.contract(contractAbi, env.CONTRACT_PROXY_ADDRESS);
    logger.info('TRON contract abstraction successfully loaded');
    return contractInstance;
  } catch (error) {
    logger.error('Failed to parse contract interface on network node', error);
    throw error;
  }
};
