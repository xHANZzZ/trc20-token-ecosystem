# Frontend Specification: UUPS TRC20 Admin Dashboard

This document specifies the layout specifications, UI tokens, responsive grids, and wallet connection architectures for the React + TypeScript Admin Dashboard.

---

## 1. Design System Tokens (Color Scheme)

The dashboard theme utilizes a high-contrast dark palette to maximize readability of blockchain parameters:

- **Background**: Deep Obsidian (`#0B0F19`) - Primary body background color.
- **Surface/Card**: Dark Slate (`#161B26`) - Translucent glass container fill for dashboard components.
- **Primary/Accent**: Electric Teal (`#00F5D4`) - Glowing borders, buttons, and status ticks.
- **Destructive**: Crimson Red (`#FF3B30`) - Error boundaries, revoke buttons, and logic upgrade triggers.
- **Text Primary**: Pure White (`#FFFFFF`) - Primary headings and numeric balances.
- **Text Secondary**: Muted Gray (`#94A3B8`) - Sidebar descriptions and contract details.
- **Space Borders**: `rgba(255, 255, 255, 0.05)` - Translucent borders.

---

## 2. Reusable UI Components (`src/components/`)

### 2.1 Button (`Button.tsx`)
- **Primary**: Teal background (`#00F5D4`), dark text (`#0B0F19`), and a subtle teal shadow.
- **Secondary**: Slate container (`#161B26`) with a translucent border.
- **Destructive**: Crimson Red background (`#FF3B30`), white text, and a red shadow.
- **Outline**: Transparent container with a teal border and a hover overlay.
- **States**: Includes a spinner animation for the `loading` state, and disables click actions for both `loading` and `disabled` states.

### 2.2 Input (`Input.tsx`)
- Dark-styled text inputs with validation states:
  - Default: Slate borders.
  - Focused: Teal borders with a ring outline.
  - Valid: Green borders with a checkmark.
  - Invalid: Crimson borders with a warning label.

### 2.3 Modal (`Modal.tsx`)
- Overlay dialog featuring blur backdrops, warning alerts, and confirmation controls.

---

## 3. Four Core Pages (`src/pages/`)

### 3.1 Overview Page (`Overview.tsx`)
- **Metric Cards Grid**:
  1. *Total Supply*: Fetches and shows the total TRC20 token supply.
  2. *Active Registry*: Total registered user identities in the registry mapping.
  3. *Energy Level*: Available custodian wallet resources for transaction execution.
  4. *Bandwidth*: Remaining node communication limits.
- **Activity Graph**: Line chart rendered via inline SVGs and color gradients.
- **Quick-Actions**: Displays connectivity configurations and TVM compiler specifications.

### 3.2 Transfers Page (`Transfers.tsx`)
- **Transfer Action Form**: Handlers check for active connections, validate recipient formats using regex, and execute `transfer` on the proxy contract.
- **Transaction Ledger Table**: Displays mock/live transactions with status pills:
  - `Success`: Teal border and text.
  - `Pending`: Yellow amber border and text.
  - `Failed`: Crimson border and text.
- **Pagination & Filters**: Search field matches input addresses against historical records, paginating results in chunks of 3.

### 3.3 Registry Page (`Registry.tsx`)
- **Administrative Access Gate**: If the connected wallet address is not an admin, it displays a locked overlay explaining the credentials required.
- **Register Wallet Form**: Fields validate inputs (Base58 formats and 64-character hex sha256 hashes) before calling `registerWallet` on the contract.
- **Directory Table**: Displays registered profiles with a "Revoke" button that triggers `revoke` transactions for admins.

### 3.4 Settings Page (`Settings.tsx`)
- **Security Lock Overlay**: Restricts panel visibility to the contract deployer (Owner).
- **Two-Step Ownership Management**:
  - *Proposed Owner*: Field to propose a candidate address.
  - *Claim Ownership*: A claim button appears only if the connected account is the nominated proposed owner, triggering the `acceptOwnership` method.
- **UUPS Logic Upgrades**: Trigger button prompts the confirmation `Modal` before calling `upgradeTo`.

---

## 4. TronLink Hook integration (`useTronLink.ts`)

Conveys connection management:
1. **Window injection check**: Inspects `window.tronWeb` and `window.tronLink`.
2. **Account request handshake**: Queries account permissions.
3. **Change triggers**: Binds `accountsChanged` and `chainChanged` events to update TRX balances and network statuses.
4. **Role validation**: Checks `owner()` and `isRegistryAdmin(address)` views on load to drive page access rules.
