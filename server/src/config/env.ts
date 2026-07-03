import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  MONGO_URI: z.string().default('mongodb://localhost:27017/cove'),
  GEMINI_API_KEY: z.string().optional().or(z.literal('')),
  OPENAI_API_KEY: z.string().optional().or(z.literal('')),
  GROQ_API_KEY: z.string().optional().or(z.literal('')),
  CLIENT_URL: z.string().default('*'),
});

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('Invalid environment configuration:', parseResult.error.format());
  process.exit(1);
}

export const env = parseResult.data;
