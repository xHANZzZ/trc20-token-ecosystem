# Deployment Guide & Upgrade Playbook: UUPS TRC20 Token System

This playbook defines the operational steps, resource parameters, gotchas checkouts, and upgrade workflows for deploying our UUPS-upgradeable TRC20 Token and Wallet Registry system from Shasta Testnet to TRON Mainnet.

---

## 1. Deployment Sequence (Shasta to Mainnet)

### 1.1 Environment Setup
We will use a standalone Node.js deployment script utilizing **TronWeb** for automated and verifiable deployments.

Ensure the deploying environment contains the dependencies configured:
```bash
npm install tronweb dotenv
```

Configure your `.env` deployment settings:
```env
# Shasta Testnet RPC parameters
TRON_FULL_NODE=https://api.shasta.tronscan.org
# Deployer Account Private Key
DEPLOYER_PRIVATE_KEY=45fca9b19... # 64-character hex key
# Token Configurations
TOKEN_NAME="Compliant TRC20 Token"
TOKEN_SYMBOL="ACT"
INITIAL_SUPPLY=1000000000000000000000000 # 1,000,000 tokens (18 decimals)
```

### 1.2 Step 1: Deploy Implementation logic contract
Save the following script as `scripts/deployLogic.js`:
```javascript
import { TronWeb } from 'tronweb';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const tronWeb = new TronWeb({
  fullHost: process.env.TRON_FULL_NODE,
  privateKey: process.env.DEPLOYER_PRIVATE_KEY
});

const main = async () => {
  try {
    const deployerAddress = tronWeb.defaultAddress.base58;
    console.log(`🚀 Deploying Implementation logic from account: ${deployerAddress}`);

    const abi = JSON.parse(fs.readFileSync('./abi/MainToken.json', 'utf8'));
    const bytecode = fs.readFileSync('./bytecode/MainToken.hex', 'utf8');

    const contract = await tronWeb.contract().new({
      abi: abi,
      bytecode: bytecode,
      feeLimit: 1500000000, // 1500 TRX fee limit for initial bytecode deploy
      userFeePercentage: 100,
      originEnergyLimit: 10000000
    });

    console.log(`✓ MainToken logic contract successfully deployed!`);
    console.log(`Logic Contract Address (Base58): ${contract.address}`);
  } catch (error) {
    console.error('Logic deployment aborted:', error);
  }
};

main();
```

Execute the logic contract deployment:
```bash
node scripts/deployLogic.js
```

### 1.3 Step 2: Formulate Proxy Initialization Payload
The proxy contract constructor requires:
- `address _logic`: The address of the logic contract deployed in Step 1.
- `bytes _data`: The ABI-encoded function call to trigger the `initialize(string,string,uint256)` function.

To generate the ABI-encoded payload using TronWeb, save `scripts/generatePayload.js`:
```javascript
import { TronWeb } from 'tronweb';
import fs from 'fs';

const tronWeb = new TronWeb({
  fullHost: 'https://api.shasta.tronscan.org',
  privateKey: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef' // Dummy key for parsing
});

const main = async () => {
  const abi = JSON.parse(fs.readFileSync('./abi/MainToken.json', 'utf8'));
  
  // ABI encode the initialize call parameters
  const contractAddress = "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb"; // Dummy target address
  const contractInstance = await tronWeb.contract(abi, contractAddress);
  
  // Encode the payload
  const payload = contractInstance.initialize(
    "Compliant TRC20 Token",
    "ACT",
    "1000000000000000000000000"
  ).functionSelector; // Returns ABI encoded signature + parameters

  console.log(`Encoded Calldata (Hex): ${payload}`);
};

main();
```

### 1.4 Step 3: Deploy ERC1967Proxy (`TokenProxy.sol`)
Deploy the proxy contract using the logic contract address and the generated calldata payload. Save as `scripts/deployProxy.js`:
```javascript
import { TronWeb } from 'tronweb';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const tronWeb = new TronWeb({
  fullHost: process.env.TRON_FULL_NODE,
  privateKey: process.env.DEPLOYER_PRIVATE_KEY
});

const main = async () => {
  try {
    const deployerAddress = tronWeb.defaultAddress.base58;
    console.log(`🚀 Deploying Proxy pointing to logic from account: ${deployerAddress}`);

    const proxyAbi = JSON.parse(fs.readFileSync('./abi/TokenProxy.json', 'utf8'));
    const proxyBytecode = fs.readFileSync('./bytecode/TokenProxy.hex', 'utf8');

    const logicAddress = "TLogicAddressFromStep1...";
    const initPayload = "0xInitializePayloadFromStep2...";

    const contract = await tronWeb.contract().new({
      abi: proxyAbi,
      bytecode: proxyBytecode,
      feeLimit: 1000000000, // 1000 TRX fee limit
      userFeePercentage: 100,
      originEnergyLimit: 5000000,
      parameters: [logicAddress, initPayload] // Pass parameters to constructor
    });

    console.log(`✓ TokenProxy successfully deployed!`);
    console.log(`TokenProxy Proxy Address (Base58): ${contract.address}`);
  } catch (error) {
    console.error('Proxy deployment aborted:', error);
  }
};

main();
```

### 1.5 Step 4: Verification on Tronscan
1. Go to [Tronscan Shasta](https://shasta.tronscan.org) or Mainnet Tronscan.
2. Search for the deployed **Logic Contract Address**. Upload the flattened Solidity source code of `MainToken.sol` to verify implementation compiler signatures (version `0.8.20`, optimizer `200` runs).
3. Search for the deployed **Proxy Contract Address**. Verify the source code using `TokenProxy.sol` files.
4. Once both are verified, go to the proxy contract page on Tronscan, click **Contract** -> **Write as Proxy** or **Read as Proxy** to link and interact with implementation views.

---

## 2. UUPS-Specific Gotchas & Vulnerabilities Checklist

Upgradeable smart contracts bypass standard immutability rules, which opens specific attack vectors:

- **Uninitialized implementation logic hijacking**:
  *Gotcha*: Logic contracts are deployed as independent templates. If the deployer leaves the logic contract uninitialized, an attacker can initialize it themselves, set themselves as owner, and execute a `selfdestruct` delegatecall, rendering the proxy permanently broken.
  *Mitigation*: The constructor of the implementation contract [MainToken.sol](file:///c:/Users/f1392cs045.pafiast/Documents/TRC20%20Project/contracts/MainToken.sol) invokes `_disableInitializers();`. This locks the initialization storage states permanently for the logic contract itself, ensuring it can only be initialized within a proxy delegatecall context.
- **Unauthorized upgrade check (`_authorizeUpgrade`)**:
  *Gotcha*: The UUPS logic upgrade functions reside inside the implementation contract. If `_authorizeUpgrade` lacks ownership checking, anyone can upgrade the proxy to pointing to their own custom logic contract.
  *Mitigation*: Ensure `_authorizeUpgrade(address)` is strictly modifier-gated using the `onlyOwner` access control:
  ```solidity
  function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
  ```
- **Storage Layout Mutation & Collision**:
  *Gotcha*: Adding new state variables in modified implementation contracts (e.g. V2) shifts storage slot indexes if added in the middle of standard variables, corrupting proxy parameters.
  *Mitigation*: Follow a strict storage inheritance sequencing layout. Base contracts (like `TRC20Upgradeable`, `WalletRegistry`, and `UUPSUpgradeable`) incorporate gap arrays:
  ```solidity
  uint256[50] private __gap;
  ```
  If you add variables to base contracts in future implementations, reduce the size of `__gap` by the exact number of slots occupied by the new variables.

---

## 3. Testing & Verification Checklist

| Test ID | Action | Parameters | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **QA-01** | Initial supply lookup | Deployed Proxy | `balanceOf(Owner)` equals `1,000,000,000,000,000,000,000,000` (1M tokens). |
| **QA-02** | Initializer Hijack check | Call `initialize()` on Logic | Transaction reverts with custom error `InvalidInitialization()`. |
| **QA-03** | Standard Transfer check | Transfer 1000 tokens | Balance maps correctly. `Transfer` event is logged. |
| **QA-04** | Registry Wallet Profile | Register address + identity hash | Profile is stored. `WalletRegistered` event is emitted on chain. |
| **QA-05** | Double Registration check | Register address again | Transaction reverts with custom error `WalletAlreadyRegistered()`. |
| **QA-06** | Access check | Revoke from Guest wallet | Transaction reverts with custom error `CallerNotRegistryAdmin()`. |
| **QA-07** | Pausable check | Pause contract, call transfer | Transaction reverts. Transfers are blocked during pause states. |
| **QA-08** | Two-Step Ownership | Propose new owner, claim | Claim accepts ownership correctly. Old owner loses access. |

---

## 4. Energy & Bandwidth Cost Profiles

On TRON, execution costs are paid in **Energy** (representing CPU/computing limits) and **Bandwidth** (representing storage sizes). 

### 4.1 Cost Breakdown & Buffer Requirements
If energy and bandwidth are not staked and frozen, TRON nodes burn TRX directly to pay for resources.

- **Current Mainnet Burn rates**:
  - `1 Energy` = `420 Sun`
  - `1 Bandwidth` = `1,000 Sun`
  - `1 TRX` = `1,000,000 Sun`

- **Estimated Energy Cost Matrices**:
  - Deploy implementation logic: **~1,200,000 Energy** = **~504 TRX** (Burn limit)
  - Deploy ERC1967Proxy: **~600,000 Energy** = **~252 TRX** (Burn limit)
  - Execute Proxy initialization: **~180,000 Energy** = **~75 TRX** (Burn limit)
  - Execute standard Token transfer: **~52,000 Energy** = **~22 TRX** (Burn limit)
  - Register Wallet Profile (storage writing): **~85,000 Energy** = **~35.7 TRX** (Burn limit)

- **The ~410 TRX Fee Limit Buffer Strategy**:
  Deploying the proxy and executing the initialization payload (`initialize`) in a single transaction requires a minimum fee limit buffer of **410 TRX** (approx. **970,000 Energy**). 
  To prevent out-of-energy transaction failures (which still consume all burnt TRX), developers must configure transaction fee limit parameters:
  ```javascript
  const txid = await contract.initialize(name, symbol, supply).send({
    feeLimit: 410000000 // Set feeLimit parameter to 410 TRX
  });
  ```

---

## 5. V2 Upgrade Playbook

Follow these steps to upgrade contract logic from V1 to V2 without losing state variables.

### 5.1 Step 1: Deploy Implementation logic contract V2
- Compile V2 with the same Solidity configuration.
- Check that the storage layout has not mutated and does not collide with V1.
- Deploy the new implementation contract `MainTokenV2.sol`. Record the address: `V2_LOGIC_ADDRESS`.

### 5.2 Step 2: Execute Upgrade via Proxy
The contract owner calls the `upgradeTo(address)` or `upgradeToAndCall(address, bytes)` function on the **active Proxy Address**.

Save this script as `scripts/upgradeProxy.js`:
```javascript
import { TronWeb } from 'tronweb';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const tronWeb = new TronWeb({
  fullHost: process.env.TRON_FULL_NODE,
  privateKey: process.env.DEPLOYER_PRIVATE_KEY // Private key of contract OWNER
});

const main = async () => {
  try {
    const proxyAddress = "TProxyAddressFromV1...";
    const newLogicAddress = "V2_LOGIC_ADDRESS...";

    console.log(`🚀 Executing logic upgrade for Proxy: ${proxyAddress}`);
    console.log(`Pointing logic to V2 address: ${newLogicAddress}`);

    // Interact with Proxy contract address USING V1 ABI definitions
    const abi = JSON.parse(fs.readFileSync('./abi/MainToken.json', 'utf8'));
    const proxyInstance = await tronWeb.contract(abi, proxyAddress);

    // Call upgradeTo method on Proxy Address
    const txid = await proxyInstance.upgradeTo(newLogicAddress).send({
      feeLimit: 150000000 // 150 TRX fee limit buffer
    });

    console.log(`✓ Proxy Logic successfully upgraded to V2!`);
    console.log(`Upgrade TxID: ${txid}`);
  } catch (error) {
    console.error('Upgrade execution aborted:', error);
  }
};

main();
```

Run the script to upgrade:
```bash
node scripts/upgradeProxy.js
```
The proxy storage slot now points to the V2 logic contract, and all state data (balances, registered wallet addresses, KYC indicators, and ownership parameters) is preserved.
