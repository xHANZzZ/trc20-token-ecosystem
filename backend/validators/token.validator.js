import { z } from 'zod';

// Base TRON address validator
const tronAddress = z.string().regex(/^T[1-9A-HJ-NP-Za-km-z]{33}$/, {
  message: 'Invalid TRON address format (must start with T and be 34 characters)'
});

// Decimals validation for token transfer amounts (as strings to handle uint256 precision safely)
const positiveUint256String = z.string().regex(/^\d+$/, {
  message: 'Amount must be a positive integer representation string'
}).refine((val) => {
  try {
    const num = BigInt(val);
    return num > 0n;
  } catch {
    return false;
  }
}, 'Amount must be greater than zero');

const nonNegativeUint256String = z.string().regex(/^\d+$/, {
  message: 'Amount must be a non-negative integer representation string'
});

export const getBalanceSchema = z.object({
  params: z.object({
    address: tronAddress
  })
});

export const getAllowanceSchema = z.object({
  query: z.object({
    owner: tronAddress,
    spender: tronAddress
  })
});

export const transferSchema = z.object({
  body: z.object({
    recipient: tronAddress,
    amount: positiveUint256String
  })
});

export const approveSchema = z.object({
  body: z.object({
    spender: tronAddress,
    amount: nonNegativeUint256String
  })
});

export const transferFromSchema = z.object({
  body: z.object({
    sender: tronAddress,
    recipient: tronAddress,
    amount: positiveUint256String
  })
});

export const mintSchema = z.object({
  body: z.object({
    to: tronAddress,
    amount: positiveUint256String
  })
});

export const burnSchema = z.object({
  body: z.object({
    amount: positiveUint256String
  })
});
