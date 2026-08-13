/**
 * Compare Engine diagnostics.
 *
 * Purpose: never let a Compare failure surface as a generic
 * "Couldn't load this comparison." Every step is traced and every error keeps
 * its message, code, table, filter and stack so Preview, Local and Cloudflare
 * Production all report the same, real reason.
 */

export type TraceStep = {
  step: string;
  ok: boolean;
  ms: number;
  detail?: string;
};

export class CompareError extends Error {
  step: string;
  context: Record<string, unknown>;

  constructor(step: string, message: string, context: Record<string, unknown> = {}) {
    super(`[compare:${step}] ${message}`);
    this.name = "CompareError";
    this.step = step;
    this.context = context;
  }
}

const IS_DEV = process.env.NODE_ENV === "development";

/**
 * Normalizes a PostgREST error. Full query context (code, details, hint) is
 * logged server-side only; the thrown message stays generic in production so
 * public visitors never receive raw database internals.
 */
export function throwQueryError(
  step: string,
  err: { message: string; code?: string; details?: string | null; hint?: string | null },
  context: Record<string, unknown>,
): never {
  console.error(`[compare] query failed at step "${step}"`, {
    ...context,
    message: err.message,
    pgCode: err.code ?? null,
    pgDetails: err.details ?? null,
    pgHint: err.hint ?? null,
  });
  throw new CompareError(step, IS_DEV ? err.message : "Database query failed", {
    ...context,
    pgCode: IS_DEV ? (err.code ?? null) : null,
  });
}


export function describeError(error: unknown): {
  name: string;
  message: string;
  step: string | null;
  context: Record<string, unknown> | null;
  stack: string | null;
} {
  if (error instanceof CompareError) {
    return {
      name: error.name,
      message: error.message,
      step: error.step,
      context: error.context,
      stack: error.stack ?? null,
    };
  }
  if (error instanceof Error) {
    return { name: error.name, message: error.message, step: null, context: null, stack: error.stack ?? null };
  }
  return { name: "Unknown", message: String(error), step: null, context: null, stack: null };
}

/** Runs a labelled step, logging start/finish and re-throwing with context. */
export async function traced<T>(
  step: string,
  trace: TraceStep[],
  fn: () => Promise<T>,
  context: Record<string, unknown> = {},
): Promise<T> {
  const t0 = Date.now();
  try {
    const out = await fn();
    trace.push({ step, ok: true, ms: Date.now() - t0 });
    return out;
  } catch (error) {
    const described = describeError(error);
    trace.push({ step, ok: false, ms: Date.now() - t0, detail: described.message });
    console.error(`[compare] FAILED at step "${step}"`, { ...context, ...described });
    throw error instanceof CompareError ? error : new CompareError(step, described.message, context);
  }
}
