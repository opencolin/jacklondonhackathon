import { z } from "zod";

const isServer = typeof window === "undefined";

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  DATABASE_URL: z.string().url(),
  DATABASE_URL_DIRECT: z.string().url().optional(),

  REDIS_URL: z.string().url().optional(),

  AUTH_SECRET: z.string().min(32),
  AUTH_GITHUB_ID: z.string().optional(),
  AUTH_GITHUB_SECRET: z.string().optional(),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  AUTH_LINKEDIN_ID: z.string().optional(),
  AUTH_LINKEDIN_SECRET: z.string().optional(),

  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().min(1).default("BuilderShip <hello@mail.ship.builders>"),

  // Comma-separated admin emails. Anyone signing in with one of these gets
  // session.user.isAdmin = true without touching the DB users.is_admin flag.
  ADMIN_EMAILS: z.string().optional(),

  NEBIUS_TOKEN_FACTORY_KEY: z.string().optional(),
  NEBIUS_TOKEN_FACTORY_BASE_URL: z
    .string()
    .url()
    .default("https://api.studio.nebius.ai/v1"),
  NEBIUS_JUDGE_MODEL: z.string().default("Qwen/Qwen2.5-72B-Instruct-fast"),

  COMPOSIO_API_KEY: z.string().optional(),
  TAVILY_API_KEY: z.string().optional(),

  GITHUB_APP_ID: z.string().optional(),
  GITHUB_APP_PRIVATE_KEY: z.string().optional(),
  GITHUB_APP_WEBHOOK_SECRET: z.string().optional(),

  DISCORD_WEBHOOK_URL: z.string().url().optional(),

  PUSHER_APP_ID: z.string().optional(),
  PUSHER_KEY: z.string().optional(),
  PUSHER_SECRET: z.string().optional(),
  PUSHER_CLUSTER: z.string().default("us2"),

  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().default("codecruise"),
  R2_PUBLIC_BASE_URL: z.string().url().optional(),

  SENTRY_DSN: z.string().url().optional(),
  AXIOM_TOKEN: z.string().optional(),
  AXIOM_DATASET: z.string().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3030"),
  NEXT_PUBLIC_PUSHER_KEY: z.string().optional(),
  NEXT_PUBLIC_PUSHER_CLUSTER: z.string().default("us2"),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
});

const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_PUSHER_KEY: process.env.NEXT_PUBLIC_PUSHER_KEY,
  NEXT_PUBLIC_PUSHER_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
});

let serverEnv: z.infer<typeof serverSchema> | undefined;

if (isServer) {
  const parsed = serverSchema.safeParse(process.env);
  if (parsed.success) {
    serverEnv = parsed.data;
  } else {
    // Don't throw at module-eval time — that breaks the Next.js build for
    // public pages that don't actually need the missing vars. Log loudly,
    // fill in safe placeholder defaults, and let runtime callers fail with
    // their own clearer errors when they try to use missing config.
    console.warn(
      "[env] missing or invalid server env (using placeholder fallbacks):",
      JSON.stringify(parsed.error.flatten().fieldErrors, null, 2),
    );
    serverEnv = serverSchema.partial().parse({
      ...process.env,
      AUTH_SECRET: process.env.AUTH_SECRET ?? "x".repeat(32),
      DATABASE_URL:
        process.env.DATABASE_URL ?? "postgres://placeholder@localhost/codecruise",
      RESEND_FROM_EMAIL:
        process.env.RESEND_FROM_EMAIL ??
        "BuilderShip <hello@mail.ship.builders>",
    }) as z.infer<typeof serverSchema>;
  }
}

export const env = {
  ...(serverEnv ?? {} as z.infer<typeof serverSchema>),
  ...clientEnv,
} as z.infer<typeof serverSchema> & z.infer<typeof clientSchema>;
