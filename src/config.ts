import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().default(3010),
  NODE_ENV: z.enum(['production', 'development', 'test']).default('production'),
  LOG_LEVEL: z.string().default('info'),

  POSTGRES_URL: z.string().url().optional(),

  PERSONA_API_KEY: z.string().optional(),
  PERSONA_WEBHOOK_SECRET: z.string().optional(),
  PERSONA_TEMPLATE_ID: z.string().optional(),

  ONFIDO_API_KEY: z.string().optional(),
  ONFIDO_WEBHOOK_TOKEN: z.string().optional(),
  ONFIDO_REGION: z.enum(['eu', 'us', 'ca']).default('eu'),

  JWT_PUBLIC_KEY: z.string().optional(),
  JWT_ISSUER: z.string().default('ping-platform'),
});

export type Config = z.infer<typeof schema>;

let cached: Config | undefined;
export function getConfig(): Config {
  if (!cached) cached = schema.parse(process.env);
  return cached;
}
