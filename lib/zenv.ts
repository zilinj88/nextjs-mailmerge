import { z } from 'zod'

export const ZEnv = z.object({
  NODE_ENV: z.string().min(1),
  GMAIL_CLIENT_ID: z.string().min(1),
  GMAIL_API_KEY: z.string().min(1),
})

export const zenv = ZEnv.parse({
  NODE_ENV: process.env.NODE_ENV,
  GMAIL_CLIENT_ID: z.string().min(1),
  GMAIL_API_KEY: z.string().min(1),
})
