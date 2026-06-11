import { z } from 'zod';

const tronAddress = z.string().regex(/^T[1-9A-HJ-NP-Za-km-z]{33}$/, {
  message: 'Invalid TRON address format (must start with T and be 34 characters)'
});

const kycLevel = z.number().int().min(0).max(255, {
  message: 'KYC Level must be an integer between 0 and 255'
});

const metadataURI = z.string().url().or(
  z.string().startsWith('ipfs://', { message: 'Metadata URI must be a valid URL or IPFS link (ipfs://)' })
);

export const registerWalletSchema = z.object({
  body: z.object({
    wallet: tronAddress,
    kycLevel: kycLevel,
    metadataURI: metadataURI
  })
});

export const batchRegisterWalletsSchema = z.object({
  body: z.object({
    wallets: z.array(tronAddress).nonempty({ message: 'Wallets array cannot be empty' }),
    kycLevels: z.array(kycLevel).nonempty({ message: 'KYC levels array cannot be empty' }),
    metadataURIs: z.array(metadataURI).nonempty({ message: 'Metadata URIs array cannot be empty' })
  }).refine((data) => {
    return data.wallets.length === data.kycLevels.length && data.wallets.length === data.metadataURIs.length;
  }, {
    message: 'Array lengths for wallets, kycLevels, and metadataURIs must match'
  })
});

export const getProfileSchema = z.object({
  params: z.object({
    address: tronAddress
  })
});

export const updateKYCSchema = z.object({
  body: z.object({
    wallet: tronAddress,
    newKycLevel: kycLevel
  })
});

export const updateMetadataSchema = z.object({
  body: z.object({
    wallet: tronAddress,
    newMetadataURI: metadataURI
  })
});

export const deregisterWalletSchema = z.object({
  params: z.object({
    address: tronAddress
  })
});
