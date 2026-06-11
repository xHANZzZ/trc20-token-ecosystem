import dotenv from 'dotenv';
import { z } from 'zod';

// Load variables from .env file
dotenv.config();

// Define validator schema for runtime parameters
const envSchema = z.object({
  PORT: z.string().default('3000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  TRON_FULL_NODE: z.string().url({ message: 'TRON_FULL_NODE must be a valid URL' }),
  TRON_PRIVATE_KEY: z.string().regex(/^[0-9a-fA-F]{64}$/, {
    message: 'TRON_PRIVATE_KEY must be a valid 64-character hex string'
  }),
  CONTRACT_PROXY_ADDRESS: z.string().regex(/^T[1-9A-HJ-NP-Za-km-z]{33}$/, {
    message: 'CONTRACT_PROXY_ADDRESS must be a valid TRON address (starts with T, Base58 format)'
  })
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Environment validation failed:');
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;
