/**
 * Single source of truth for CLIENT-side configuration.
 *
 * Vite inlines `import.meta.env.VITE_*` at build time, so these values are
 * baked into the bundle and cannot "disappear" at runtime. Nothing else in the
 * app should read `import.meta.env` directly — import from here instead.
 */

type ClientEnv = {
  SUPABASE_URL: string;
  SUPABASE_PUBLISHABLE_KEY: string;
  SUPABASE_PROJECT_ID: string;
  GA_MEASUREMENT_ID: string | undefined;
  DEV: boolean;
  PROD: boolean;
};

const raw = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL as string | undefined,
  SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined,
  SUPABASE_PROJECT_ID: import.meta.env.VITE_SUPABASE_PROJECT_ID as string | undefined,
  GA_MEASUREMENT_ID: import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined,
};

/** Variables that must be present for the app to function. */
const REQUIRED = ["SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY", "SUPABASE_PROJECT_ID"] as const;

/** Present but non-fatal (a missing GA id only disables analytics). */
const OPTIONAL = ["GA_MEASUREMENT_ID"] as const;

export function missingClientEnv(): string[] {
  return REQUIRED.filter((k) => !raw[k]).map((k) => `VITE_${k}`);
}

export function clientEnvStatus(): { name: string; present: boolean; required: boolean }[] {
  return [
    ...REQUIRED.map((k) => ({ name: `VITE_${k}`, present: !!raw[k], required: true })),
    ...OPTIONAL.map((k) => ({ name: `VITE_${k}`, present: !!raw[k], required: false })),
  ];
}

/** Throws a precise, non-silent error naming every missing variable. */
export function assertClientEnv(): void {
  const missing = missingClientEnv();
  if (missing.length) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(", ")}. ` +
        `Set them as Cloudflare Worker variables (see ENVIRONMENT_SETUP.md) and redeploy.`,
    );
  }
}

export const env: ClientEnv = {
  SUPABASE_URL: raw.SUPABASE_URL ?? "",
  SUPABASE_PUBLISHABLE_KEY: raw.SUPABASE_PUBLISHABLE_KEY ?? "",
  SUPABASE_PROJECT_ID: raw.SUPABASE_PROJECT_ID ?? "",
  GA_MEASUREMENT_ID: raw.GA_MEASUREMENT_ID,
  DEV: !!import.meta.env.DEV,
  PROD: !!import.meta.env.PROD,
};
