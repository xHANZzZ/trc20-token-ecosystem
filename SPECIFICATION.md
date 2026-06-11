# Technical Specification: UUPS TRC20 Token & Wallet Registry

This document defines the architectural specification, storage layouts, interface standards, custom error specifications, and deployment workflows for the UUPS-upgradeable TRC20 token with an integrated Wallet Registry.

---

## 1. System Architecture

The smart contract suite uses the **UUPS (Universal Upgradeable Proxy Standard - ERC-1822 / ERC-1967)** pattern. In this architecture, the logic of upgradeability resides entirely within the implementation contract, while the proxy holds the state and handles call redirection.

```
       User/Client (TRX/TRC20 Tx)
                   |
                   v
       ┌────────────────────────┐
       │       TokenProxy       │ (State & ERC-1967 Storage Slots)
       │    (fallback/receive)  │
       └───────────┬────────────┘
                   │
                   │ (delegatecall)
                   v
       ┌────────────────────────┐
       │       MainToken        │ (Logic & Upgrade Authorization)
       │ (Implementation V1/V2) │
       └────────────────────────┘
```

### Key Architectural Benefits
- **Gas Efficiency**: The proxy code is extremely lightweight, requiring only a single `sload` to fetch the implementation address, saving gas on normal interactions.
- **Upgradeable Logic**: Upgrades are authorized and executed inside the active implementation, allowing developers to completely remove upgrade logic later if the system needs to be finalized/immutable.
- **ERC-1967 Storage Compliance**: The implementation contract is stored at storage slot `0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc` to prevent collisions.

---

## 2. Storage Slot Layout & Upgrade Safety

To prevent **storage collisions** during upgrades, the system inherits state variables in a strictly defined order and uses reserved storage slots (`__gap`).

### Storage Inheritance Sequence
The Solidity inheritance linearization algorithm (`C3 Linearization`) orders state variable declaration sequentially from the most base contract to the most derived. For `MainToken`, the inheritance is linearized as:
`Initializable` -> `Ownable2StepUpgradeable` -> `UUPSUpgradeable` -> `TRC20Upgradeable` -> `WalletRegistry` -> `MainToken`.

### Storage Map

| Slot # | Contract Owner | Variable | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| **0** | `Initializable` | `_initialized` | `uint64` | Tracks initialized versions (packed with `_initializing`) |
| **0** | `Initializable` | `_initializing` | `bool` | Indicates active initialization phase |
| **1** | `Ownable2Step` | `_owner` | `address` | Owner of the smart contracts |
| **2** | `Ownable2Step` | `_pendingOwner` | `address` | Candidate for two-step transfer |
| **3 - 51** | `Ownable2Step` | `__gap` | `uint256[49]` | Reserved space for future ownable extensions |
| **52 - 101** | `UUPSUpgradeable` | `__gap` | `uint256[50]` | Reserved space for upgradeable extensions |
| **102** | `TRC20Upgradeable`| `_balances` | `mapping` | Mapping of address to balance |
| **103** | `TRC20Upgradeable`| `_allowances` | `mapping` | Nested allowance mapping (owner => spender => amount) |
| **104** | `TRC20Upgradeable`| `_totalSupply` | `uint256` | Current circulating token supply |
| **105** | `TRC20Upgradeable`| `_name` | `string` | Token name (takes multiple slots if > 31 bytes) |
| **106** | `TRC20Upgradeable`| `_symbol` | `string` | Token symbol (takes multiple slots if > 31 bytes) |
| **107 - 151**| `TRC20Upgradeable`| `__gap` | `uint256[45]` | Reserved space for token extensions |
| **152** | `WalletRegistry` | `_profiles` | `mapping` | Maps addresses to `UserProfile` structs |
| **153** | `WalletRegistry` | `_registryAdmins` | `mapping` | Maps admin address to status |
| **154 - 203**| `WalletRegistry` | `__gap` | `uint256[50]` | Reserved space for registry extensions |
| **204** | `MainToken` | `_complianceRequired` | `bool` | Toggle state for compliance check |

> [!WARNING]
> When adding new state variables in future implementations (e.g. `MainTokenV2`), variables **MUST** be defined in `MainTokenV2` and cannot be added to base contracts unless base `__gap` arrays are reduced by corresponding slots to keep the sequential layout correct.

---

## 3. Interface Definitions & Signatures

### ITRC20.sol
Standard ERC20 interface translated to TRON ecosystem.
- `transfer(address recipient, uint256 amount) external returns (bool)`
- `approve(address spender, uint256 amount) external returns (bool)`
- `transferFrom(address sender, address recipient, uint256 amount) external returns (bool)`
- `totalSupply() external view returns (uint256)`
- `balanceOf(address account) external view returns (uint256)`
- `allowance(address owner, address spender) external view returns (uint256)`
- `name() external view returns (string memory)`
- `symbol() external view returns (string memory)`
- `decimals() external view returns (uint8)`

---

## 4. API Function Specification

### 4.1 UUPS Upgrade Logic
Upgrade capabilities are defined in [UUPSUpgradeable.sol](file:///c:/Users/f1392cs045.pafiast/Documents/TRC20%20Project/contracts/common/UUPSUpgradeable.sol) and authorized inside [MainToken.sol](file:///c:/Users/f1392cs045.pafiast/Documents/TRC20%20Project/contracts/MainToken.sol).

#### `upgradeTo(address newImplementation)`
- **Modifier**: `onlyProxy`
- **Access Control**: Restricted to `onlyOwner` (implemented in internal `_authorizeUpgrade`).
- **Logic**: Updates the logic contract address stored in slot `_IMPLEMENTATION_SLOT`.
- **Reverts**:
  - `CallerNotOwner()` if sender is not the owner.
  - `ActiveProxyRequired()` if called directly on logic contract.
  - `ImplementationNotContract()` if `newImplementation` is not a smart contract.

#### `upgradeToAndCall(address newImplementation, bytes calldata data)`
- **Modifier**: `onlyProxy`, payable.
- **Access Control**: `onlyOwner` (via `_authorizeUpgrade`).
- **Logic**: Performs upgrade and immediately triggers a `delegatecall` onto the proxy with the provided `data` payload. Useful for setting up state in a new version.
- **Reverts**: Same as `upgradeTo`, plus `UpgradeFailed()` if the initialization call reverts.

---

### 4.2 Access Control & Two-Step Ownership
Two-step ownership transfer is defined in [Ownable2StepUpgradeable.sol](file:///c:/Users/f1392cs045.pafiast/Documents/TRC20%20Project/contracts/common/Ownable2StepUpgradeable.sol).

#### `transferOwnership(address newOwner)`
- **Modifier**: `onlyOwner`
- **Logic**: Nominates `newOwner` as the candidate by writing to the `_pendingOwner` state variable.
- **Emits**: `OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner)`
- **Reverts**:
  - `CallerNotOwner()` if sender is not current owner.
  - `NewOwnerCannotBeZeroAddress()` if `newOwner` is `address(0)`.

#### `acceptOwnership()`
- **Modifier**: None.
- **Logic**: Finalizes ownership transfer by assigning the pending owner as the owner and deleting pending owner variables.
- **Emits**: `OwnershipTransferred(address indexed previousOwner, address indexed newOwner)`
- **Reverts**:
  - `CallerNotPendingOwner()` if sender is not the nominated pending owner.

---

### 4.3 Wallet Registry
Management functions are defined in [WalletRegistry.sol](file:///c:/Users/f1392cs045.pafiast/Documents/TRC20%20Project/contracts/registry/WalletRegistry.sol).

#### `registerWallet(address wallet, uint8 kycLevel, string calldata metadataURI)`
- **Modifier**: `onlyRegistryAdmin`
- **Logic**: Creates a profile for `wallet`.
- **Emits**: `WalletRegistered(address indexed wallet, uint8 kycLevel, string metadataURI)`
- **Reverts**:
  - `CallerNotRegistryAdmin()` if sender is neither owner nor registry admin.
  - `ZeroAddress()` if `wallet` is `address(0)`.
  - `WalletAlreadyRegistered()` if profile already exists.

#### `batchRegisterWallets(address[] calldata wallets, uint8[] calldata kycLevels, string[] calldata metadataURIs)`
- **Modifier**: `onlyRegistryAdmin`
- **Logic**: Registers multiple wallets in a loop to optimize gas fees.
- **Reverts**:
  - `ArrayLengthMismatch()` if inputs arrays vary in size.
  - Same registry reverts as single registration.

#### `updateWalletKYC(address wallet, uint8 newKycLevel)`
- **Modifier**: `onlyRegistryAdmin`
- **Logic**: Updates KYC level for an existing wallet.
- **Emits**: `WalletKYCUpdated(address indexed wallet, uint8 oldKycLevel, uint8 newKycLevel)`
- **Reverts**:
  - `WalletNotRegistered()` if wallet profile does not exist.

#### `deregisterWallet(address wallet)`
- **Modifier**: `onlyRegistryAdmin`
- **Logic**: Deletes the profile data of the specified address.
- **Emits**: `WalletDeregistered(address indexed wallet)`
- **Reverts**:
  - `WalletNotRegistered()` if profile does not exist.

#### `setRegistryAdmin(address admin, bool status)`
- **Modifier**: `onlyOwner`
- **Logic**: Configures admin permissions for writing/editing the registry.
- **Emits**: `RegistryAdminStatusChanged(address indexed admin, bool status)`
- **Reverts**:
  - `CallerNotOwner()` if sender is not the owner.
  - `ZeroAddress()` if target admin is zero.
  - `AdminStatusUnchanged()` if settings are already at target state.

---

### 4.4 Main Token Compliance & Lifecycle
Implementation details are in [MainToken.sol](file:///c:/Users/f1392cs045.pafiast/Documents/TRC20%20Project/contracts/MainToken.sol).

#### `setComplianceRequired(bool required)`
- **Modifier**: `onlyOwner`
- **Logic**: Activates or deactivates transfer compliance restrictions.
- **Emits**: `ComplianceRequirementChanged(bool required)`

#### `mint(address to, uint256 amount)`
- **Modifier**: `onlyOwner`
- **Logic**: Creates new tokens and adds them to `to` address balance.
- **Emits**: Standard TRC20 `Transfer(address(0), to, amount)` event.

#### `burn(uint256 amount)`
- **Modifier**: None.
- **Logic**: Destroys caller's tokens.
- **Emits**: Standard TRC20 `Transfer(msg.sender, address(0), amount)` event.

---

## 5. Solidity Custom Errors List

Using custom errors instead of `require("Error string")` saves a significant amount of gas (around 100-300 gas per check) and provides explicit parameters back to dApp integrations.

```solidity
error InvalidInitialization();
error NotInitializing();

error CallerNotOwner();
error CallerNotPendingOwner();
error NewOwnerCannotBeZeroAddress();

error ImplementationNotContract();
error UpgradeFailed();
error ActiveProxyRequired();

error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed);
error ERC20InsufficientAllowance(address spender, uint256 currentAllowance, uint256 needed);
error ERC20InvalidSender(address sender);
error ERC20InvalidReceiver(address receiver);
error ERC20InvalidApprover(address approver);
error ERC20InvalidSpender(address spender);

error WalletAlreadyRegistered();
error WalletNotRegistered();
error ArrayLengthMismatch();
error CallerNotRegistryAdmin();
error ZeroAddress();
error AdminStatusUnchanged();

error ComplianceCheckFailed(address account);
```

---

## 6. TronIDE Deployment & Verification Manual

Follow these steps to deploy and manage this architecture in TronIDE (or Nile Testnet / Mainnet):

### 6.1 Compiler Configuration
1. Open **TronIDE** and load the contract files.
2. Select compiler version `0.8.20`.
3. Set **EVM Version** parameter to `shanghai` or `paris`.
4. Enable **Optimization** with the default run configuration (`200` runs).

### 6.2 Deployment Pipeline

#### Step 1: Deploy Implementation
Deploy the logic implementation contract `MainToken.sol`.
- **Note**: The constructor of `MainToken` calls `_disableInitializers()`, which prevents anyone from calling `initialize` directly on the logic contract.

#### Step 2: Prepare Initialization Parameters
You must encode the parameters for your token initialization. For example, if you want:
- Token Name: `Test TRC20 Token`
- Symbol: `TTT`
- Initial Supply: `1000000000000000000000000` (1 Million tokens with 18 decimal places)

In TronIDE or your deployment script, generate the ABI-encoded calldata for the initialization method:
```solidity
initialize("Test TRC20 Token", "TTT", 1000000000000000000000000)
```

#### Step 3: Deploy Proxy
Deploy `TokenProxy.sol` passing:
- `_logic`: Address of the `MainToken` deployed in Step 1.
- `_data`: The ABI-encoded calldata from Step 2.

#### Step 4: Access via Interface
Instruct TronIDE to interact with the deployed `TokenProxy` address using the ABI/interface of `MainToken`.
You now have a fully operational, upgradeable TRC20 token with a Wallet Registry!

### 6.3 Upgrade Workflow (V1 to V2)
If you need to change logic in the future:
1. Deploy new logic contract `MainTokenV2.sol` (ensure storage variables match).
2. Call `upgradeTo(address)` or `upgradeToAndCall(address, bytes)` on the proxy address, passing the address of the newly deployed `MainTokenV2`.
3. The proxy will now delegate all incoming transactions to `MainTokenV2` while preserving all state, balances, and registry records.
