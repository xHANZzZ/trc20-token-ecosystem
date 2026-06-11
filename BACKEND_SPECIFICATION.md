# API Specification: TRC20 Token & Registry Backend

This document specifies the REST API specification for the TRON Web Integration Backend.

---

## 1. Setup & Environment Configurations

The application expects a `.env` file at the root of the backend codebase with the following schema:

```env
PORT=3000
NODE_ENV=development
TRON_FULL_NODE=https://api.nileex.io
TRON_PRIVATE_KEY=45fca9b19... # 64-character hex private key
CONTRACT_PROXY_ADDRESS=T... # 34-character TRON address
```

---

## 2. Standard Response Wrapper Formats

All endpoints return JSON responses using the standard wrapper shape:

### Success Response Template (200 OK / 201 Created)
```json
{
  "status": "success",
  "message": "Action completed successfully", // Optional
  "data": {} // Returned data payload
}
```

### Validation Error Template (400 Bad Request)
```json
{
  "status": "fail",
  "message": "Validation failed",
  "errors": [
    {
      "location": "body",
      "field": "recipient",
      "message": "Invalid TRON address format (must start with T and be 34 characters)"
    }
  ]
}
```

### Execution/System Error Template (400 Bad Request / 500 Internal Error)
```json
{
  "status": "fail", // or "error"
  "message": "Detailed error reason (e.g., contract execution reverted: CallerNotOwner)"
}
```

---

## 3. Endpoint Specifications (15 API Routes)

### 3.1 Token API (`/api/v1/token`)

#### 1. `GET /api/v1/token/details`
- **Description**: Fetch standard metadata from the deployed proxy contract.
- **Access Control**: Public.
- **Request Parameters**: None.
- **Response Shape (200 OK)**:
  ```json
  {
    "status": "success",
    "data": {
      "name": "Admin Compliant Token",
      "symbol": "ACT",
      "decimals": 18,
      "totalSupply": "1000000000000000000000000"
    }
  }
  ```

#### 2. `GET /api/v1/token/balance/:address`
- **Description**: Fetch token balance for a specified address.
- **Access Control**: Public.
- **Request Path Parameters**:
  - `address` (String): A valid 34-character TRON address.
- **Response Shape (200 OK)**:
  ```json
  {
    "status": "success",
    "data": {
      "address": "TNU1s6m2o9Muxa3xW5M6D7N2oP4yT8Q5R6",
      "balance": "500000000000000000000"
    }
  }
  ```

#### 3. `GET /api/v1/token/allowance`
- **Description**: Get the remaining allowance authorized for a spender by a owner wallet.
- **Access Control**: Public.
- **Request Query Parameters**:
  - `owner` (String): Owner TRON address.
  - `spender` (String): Spender TRON address.
- **Response Shape (200 OK)**:
  ```json
  {
    "status": "success",
    "data": {
      "owner": "TNU1s6m2o9Muxa3xW5M6D7N2oP4yT8Q5R6",
      "spender": "TJB1f8m5y9Puxa5xW8M5D9N6oP4yT7Q4R2",
      "allowance": "1000000000000000000000"
    }
  }
  ```

#### 4. `POST /api/v1/token/transfer`
- **Description**: Transfers tokens from the custodian wallet (associated with `TRON_PRIVATE_KEY`) to a recipient.
- **Access Control**: Admin.
- **Request Body (JSON)**:
  ```json
  {
    "recipient": "TNU1s6m2o9Muxa3xW5M6D7N2oP4yT8Q5R6",
    "amount": "1000000000000000000"
  }
  ```
- **Response Shape (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Token transfer complete",
    "data": {
      "txHash": "7fb418a994ec32b904d60c4901f4c728e5792da09c31fe98442bc1946051df31",
      "recipient": "TNU1s6m2o9Muxa3xW5M6D7N2oP4yT8Q5R6",
      "amount": "1000000000000000000"
    }
  }
  ```

#### 5. `POST /api/v1/token/approve`
- **Description**: Approves a spender to execute transfers on behalf of the backend custodian wallet.
- **Access Control**: Admin.
- **Request Body (JSON)**:
  ```json
  {
    "spender": "TJB1f8m5y9Puxa5xW8M5D9N6oP4yT7Q4R2",
    "amount": "50000000000000000000"
  }
  ```
- **Response Shape (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Token allowance approved",
    "data": {
      "txHash": "a9fd632e8b09f429188e4cb31fe2da98d8c36294d5098fecc846109fe1c7f42d",
      "spender": "TJB1f8m5y9Puxa5xW8M5D9N6oP4yT7Q4R2",
      "amount": "50000000000000000000"
    }
  }
  ```

#### 6. `POST /api/v1/token/transfer-from`
- **Description**: Executes a transfer of tokens from a sender to a recipient address utilizing the custodian wallet's allowance.
- **Access Control**: Admin.
- **Request Body (JSON)**:
  ```json
  {
    "sender": "TNU1s6m2o9Muxa3xW5M6D7N2oP4yT8Q5R6",
    "recipient": "TJB1f8m5y9Puxa5xW8M5D9N6oP4yT7Q4R2",
    "amount": "2500000000000000000"
  }
  ```
- **Response Shape (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Spender token transfer complete",
    "data": {
      "txHash": "b2f63cd8fe290a188f6c4be09f7a9ec89da7f609e3cd29ff10d65ffbc4123ae4",
      "sender": "TNU1s6m2o9Muxa3xW5M6D7N2oP4yT8Q5R6",
      "recipient": "TJB1f8m5y9Puxa5xW8M5D9N6oP4yT7Q4R2",
      "amount": "2500000000000000000"
    }
  }
  ```

#### 7. `POST /api/v1/token/mint`
- **Description**: Creates new tokens out of thin air and grants them to the specified address. Requires that the custodian wallet is the contract owner.
- **Access Control**: Owner.
- **Request Body (JSON)**:
  ```json
  {
    "to": "TNU1s6m2o9Muxa3xW5M6D7N2oP4yT8Q5R6",
    "amount": "100000000000000000000000"
  }
  ```
- **Response Shape (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "New tokens successfully minted",
    "data": {
      "txHash": "c29fe028c31e9a2d8e4f1a28a301ecbe29d7fa028fc729feccb8429188e4cb31",
      "to": "TNU1s6m2o9Muxa3xW5M6D7N2oP4yT8Q5R6",
      "amount": "100000000000000000000000"
    }
  }
  ```

#### 8. `POST /api/v1/token/burn`
- **Description**: Destroys tokens from the custodian wallet's own balance.
- **Access Control**: Admin / Custodian.
- **Request Body (JSON)**:
  ```json
  {
    "amount": "10000000000000000000"
  }
  ```
- **Response Shape (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Tokens burned from custodian balance",
    "data": {
      "txHash": "d1a89fecc628f8ac294d1fe2da98cb36294d5098fecc846109fe1c7f42d9ec89",
      "amount": "10000000000000000000"
    }
  }
  ```

---

### 3.2 Wallet Registry API (`/api/v1/registry`)

#### 9. `POST /api/v1/registry/register`
- **Description**: Add a new wallet profile record to the smart contract database.
- **Access Control**: Registry Admin.
- **Request Body (JSON)**:
  ```json
  {
    "wallet": "TNU1s6m2o9Muxa3xW5M6D7N2oP4yT8Q5R6",
    "kycLevel": 1,
    "metadataURI": "ipfs://QmXoypizjW3WknFixtd4TxsL2NZ6fYT1JHdhk233iJp7yp"
  }
  ```
- **Response Shape (210 Created)**:
  ```json
  {
    "status": "success",
    "message": "Wallet profile created in registry",
    "data": {
      "txHash": "e39fd028c11a2e9d8c48a128e301dcba29d7fa028fc729fecc8429188e4cb31a",
      "wallet": "TNU1s6m2o9Muxa3xW5M6D7N2oP4yT8Q5R6",
      "kycLevel": 1,
      "metadataURI": "ipfs://QmXoypizjW3WknFixtd4TxsL2NZ6fYT1JHdhk233iJp7yp"
    }
  }
  ```

#### 10. `POST /api/v1/registry/batch-register`
- **Description**: Add multiple wallet profile records in one transaction to save gas fees.
- **Access Control**: Registry Admin.
- **Request Body (JSON)**:
  ```json
  {
    "wallets": [
      "TNU1s6m2o9Muxa3xW5M6D7N2oP4yT8Q5R6",
      "TJB1f8m5y9Puxa5xW8M5D9N6oP4yT7Q4R2"
    ],
    "kycLevels": [1, 2],
    "metadataURIs": [
      "ipfs://QmXoypizjW3WknFixtd4TxsL2NZ6fYT1JHdhk233iJp7yp",
      "ipfs://QmYwAPJAF3wHV2LuA8A41fwmr8F3uW9dfdf928d18471"
    ]
  }
  ```
- **Response Shape (201 Created)**:
  ```json
  {
    "status": "success",
    "message": "Batch wallet profiles registered successfully",
    "data": {
      "txHash": "f8ecba29d7fa028fc729feccb8429188e4cb31ae39fd028c11a2e9d8c48a128e",
      "count": 2
    }
  }
  ```

#### 11. `GET /api/v1/registry/profile/:address`
- **Description**: Read profile registration, KYC, and metadata link details of a wallet.
- **Access Control**: Public.
- **Request Path Parameters**:
  - `address` (String): Wallet address.
- **Response Shape (200 OK)**:
  ```json
  {
    "status": "success",
    "data": {
      "wallet": "TNU1s6m2o9Muxa3xW5M6D7N2oP4yT8Q5R6",
      "isRegistered": true,
      "kycLevel": 1,
      "registrationTime": 1776037492,
      "metadataURI": "ipfs://QmXoypizjW3WknFixtd4TxsL2NZ6fYT1JHdhk233iJp7yp"
    }
  }
  ```

#### 12. `PUT /api/v1/registry/kyc`
- **Description**: Update the KYC tier classification of a registered wallet address.
- **Access Control**: Registry Admin.
- **Request Body (JSON)**:
  ```json
  {
    "wallet": "TNU1s6m2o9Muxa3xW5M6D7N2oP4yT8Q5R6",
    "newKycLevel": 3
  }
  ```
- **Response Shape (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Wallet KYC tier updated",
    "data": {
      "txHash": "a98dfbba31d8e62fca09fe827d50fc3108c9fe729d7fa028fc729feccb84291e",
      "wallet": "TNU1s6m2o9Muxa3xW5M6D7N2oP4yT8Q5R6",
      "newKycLevel": 3
    }
  }
  ```

#### 13. `PUT /api/v1/registry/metadata`
- **Description**: Update metadata URI of a registered wallet address.
- **Access Control**: Registry Admin.
- **Request Body (JSON)**:
  ```json
  {
    "wallet": "TNU1s6m2o9Muxa3xW5M6D7N2oP4yT8Q5R6",
    "newMetadataURI": "ipfs://QmZ98fecc729fba82decc846109fe1c7f42d9ec89128ab"
  }
  ```
- **Response Shape (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Wallet profile metadata updated",
    "data": {
      "txHash": "bcda1028fc729feccb8429188e4cb31ae39fd028c11a2e9d8c48a128e301dcba",
      "wallet": "TNU1s6m2o9Muxa3xW5M6D7N2oP4yT8Q5R6",
      "newMetadataURI": "ipfs://QmZ98fecc729fba82decc846109fe1c7f42d9ec89128ab"
    }
  }
  ```

#### 14. `DELETE /api/v1/registry/:address`
- **Description**: Remove a wallet address registration and delete profile mapping data.
- **Access Control**: Registry Admin.
- **Request Path Parameters**:
  - `address` (String): Wallet address.
- **Response Shape (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Wallet deregistered successfully",
    "data": {
      "txHash": "cd8b028fc729feccb8429188e4cb31ae39fd028c11a2e9d8c48a128e301dcba2",
      "wallet": "TNU1s6m2o9Muxa3xW5M6D7N2oP4yT8Q5R6"
    }
  }
  ```

---

### 3.3 Administrative/System API (`/api/v1/admin`)

#### 15. `POST /api/v1/admin/compliance`
- **Description**: Toggle transfer compliance verification. If compliance requirement is active, all transfer activities between non-registered wallets will revert.
- **Access Control**: Owner.
- **Request Body (JSON)**:
  ```json
  {
    "required": true
  }
  ```
- **Response Shape (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Compliance requirement state updated",
    "data": {
      "txHash": "da036294d5098fecc846109fe1c7f42d9ec89b2f63cd8fe290a188f6c4be09f7",
      "complianceRequired": true
    }
  }
  ```
