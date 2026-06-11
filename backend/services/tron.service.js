import { TronWeb } from 'tronweb';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

// Initialize TronWeb instance
export const tronWeb = new TronWeb({
  fullHost: env.TRON_FULL_NODE,
  privateKey: env.TRON_PRIVATE_KEY
});

// Full contract ABI matching MainToken functions
export const contractAbi = [
  {
    "inputs": [],
    "name": "name",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
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
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "address", "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
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
    "inputs": [
      { "internalType": "address", "name": "sender", "type": "address" },
      { "internalType": "address", "name": "recipient", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "transferFrom",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
    "name": "burn",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "account", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "burnFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "wallet", "type": "address" }],
    "name": "isWalletRegistered",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "wallet", "type": "address" }],
    "name": "getWalletProfile",
    "outputs": [
      { "internalType": "bool", "name": "isRegistered", "type": "bool" },
      { "internalType": "uint8", "name": "kycLevel", "type": "uint8" },
      { "internalType": "uint64", "name": "registrationTime", "type": "uint64" },
      { "internalType": "string", "name": "metadataURI", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "admin", "type": "address" }],
    "name": "isRegistryAdmin",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "admin", "type": "address" },
      { "internalType": "bool", "name": "status", "type": "bool" }
    ],
    "name": "setRegistryAdmin",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "wallet", "type": "address" },
      { "internalType": "uint8", "name": "kycLevel", "type": "uint8" },
      { "internalType": "string", "name": "metadataURI", "type": "string" }
    ],
    "name": "registerWallet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address[]", "name": "wallets", "type": "address[]" },
      { "internalType": "uint8[]", "name": "kycLevels", "type": "uint8[]" },
      { "internalType": "string[]", "name": "metadataURIs", "type": "string[]" }
    ],
    "name": "batchRegisterWallets",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "wallet", "type": "address" },
      { "internalType": "uint8", "name": "newKycLevel", "type": "uint8" }
    ],
    "name": "updateWalletKYC",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "wallet", "type": "address" },
      { "internalType": "string", "name": "newMetadataURI", "type": "string" }
    ],
    "name": "updateWalletMetadata",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "wallet", "type": "address" }],
    "name": "deregisterWallet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "complianceRequired",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bool", "name": "required", "type": "bool" }],
    "name": "setComplianceRequired",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Reference to initialized contract instance
let contractInstance = null;

export const getContractInstance = async () => {
  if (contractInstance) return contractInstance;

  try {
    logger.info(`Initializing contract interface at: ${env.CONTRACT_PROXY_ADDRESS}`);
    // Load contract instance using TronWeb
    contractInstance = await tronWeb.contract(contractAbi, env.CONTRACT_PROXY_ADDRESS);
    logger.info('Contract interface initialized successfully');
    return contractInstance;
  } catch (error) {
    logger.error('Failed to initialize TRON contract instance', error);
    throw error;
  }
};
