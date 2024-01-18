import { z } from 'zod'

const ZEnv = z.object({
  NODE_ENV: z.string().min(1),
  NEXT_PUBLIC_CLIENT_ID: z.string().min(1),
  NEXT_PUBLIC_API_KEY: z.string().min(1),
  NEXT_PUBLIC_ATTACHMENT_MAX_SIZE_MB: z.number(),
  NEXT_PUBLIC_ATTACHMENT_MAX_FILES: z.number().min(1),
})

export const zenv = ZEnv.parse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_CLIENT_ID: process.env.NEXT_PUBLIC_CLIENT_ID,
  NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY,
  NEXT_PUBLIC_ATTACHMENT_MAX_SIZE_MB: Number(process.env.NEXT_PUBLIC_ATTACHMENT_MAX_SIZE_MB),
  NEXT_PUBLIC_ATTACHMENT_MAX_FILES: Number(process.env.NEXT_PUBLIC_ATTACHMENT_MAX_FILES),
})
