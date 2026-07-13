// TEMPORARY DIAGNOSTIC INSTRUMENTATION — remove after root cause is identified.
// Captures every runtime error surfacing in the /admin subtree with full context.

import { Component, type ErrorInfo, type ReactNode } from "react";

type DiagRecord = {
  when: string;
  kind: string;
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  componentStack?: string;
  route?: string;
  url?: string;
  extra?: Record<string, unknown>;
  cause?: unknown;
};

const HISTORY: DiagRecord[] = [];
const MAX = 50;
let installed = false;

function push(rec: DiagRecord) {
  HISTORY.push(rec);
  if (HISTORY.length > MAX) HISTORY.shift();
  // Emit an eye-catching group so the crash is easy to find in the console.
  // eslint-disable-next-line no-console
  console.group(`%c[ADMIN-DIAG:${rec.kind}] ${rec.message}`, "color:#f87171;font-weight:bold");
  // eslint-disable-next-line no-console
  console.log(rec);
  if (rec.stack) console.log("stack:\n" + rec.stack);
  if (rec.componentStack) console.log("component stack:\n" + rec.componentStack);
  if (rec.cause) console.log("cause:", rec.cause);
  // eslint-disable-next-line no-console
  console.groupEnd();
  try {
    (window as unknown as { __ADMIN_DIAG__?: DiagRecord[] }).__ADMIN_DIAG__ = HISTORY;
  } catch {}
}

export function installAdminDiagnostics() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  // eslint-disable-next-line no-console
  console.log("%c[ADMIN-DIAG] instrumentation installed", "color:#22d3ee");

  const origErr = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    try {
      const first = args[0];
      const msg = first instanceof Error ? first.message : String(first);
      push({
        when: new Date().toISOString(),
        kind: "console.error",
        message: msg,
        stack: first instanceof Error ? first.stack : new Error("trace").stack,
        route: location.pathname,
        url: location.href,
        extra: { args },
      });
    } catch {}
    origErr(...args);
  };

  window.addEventListener("error", (e) => {
    push({
      when: new Date().toISOString(),
      kind: "window.onerror",
      message: e.message,
      stack: e.error?.stack,
      filename: e.filename,
      lineno: e.lineno,
      colno: e.colno,
      route: location.pathname,
      url: location.href,
      cause: e.error?.cause,
    });
  });

  window.addEventListener("unhandledrejection", (e) => {
    const r = e.reason;
    push({
      when: new Date().toISOString(),
      kind: "unhandledrejection",
      message: r instanceof Error ? r.message : String(r),
      stack: r instanceof Error ? r.stack : undefined,
      route: location.pathname,
      url: location.href,
      cause: r?.cause,
    });
  });
}

/** Log a module-level import so we can see if any dep resolved to undefined. */
export function logImport(name: string, value: unknown) {
  const t = typeof value;
  const ok = value !== undefined && value !== null;
  // eslint-disable-next-line no-console
  console.log(
    `%c[ADMIN-DIAG:import] ${ok ? "✓" : "✗"} ${name}`,
    `color:${ok ? "#4ade80" : "#f87171"}`,
    { type: t, isFn: t === "function", value },
  );
  if (!ok) {
    push({
      when: new Date().toISOString(),
      kind: "import-undefined",
      message: `Import "${name}" is ${String(value)}`,
      route: typeof location !== "undefined" ? location.pathname : undefined,
    });
  }
}

/** Wrap a server function reference with pre-call logging + defensive undefined guard. */
export function withServerFnDiag<T extends (...args: unknown[]) => unknown>(
  name: string,
  fn: T | undefined,
): T {
  if (typeof fn !== "function") {
    push({
      when: new Date().toISOString(),
      kind: "serverFn-undefined",
      message: `useServerFn(${name}) returned ${String(fn)} — aborting call to prevent TanStack internal crash.`,
      route: typeof location !== "undefined" ? location.pathname : undefined,
    });
    return ((...args: unknown[]) => {
      throw new Error(
        `[ADMIN-DIAG] Server function "${name}" is undefined at call time (typeof=${typeof fn}). ` +
          `This is almost certainly the source of the ".bind of undefined" crash.`,
      );
    }) as unknown as T;
  }
  return ((...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.log(`%c[ADMIN-DIAG:serverFn] → ${name}`, "color:#60a5fa", { args });
    try {
      const out = fn(...args);
      if (out && typeof (out as Promise<unknown>).then === "function") {
        return (out as Promise<unknown>).then(
          (r) => {
            // eslint-disable-next-line no-console
            console.log(`%c[ADMIN-DIAG:serverFn] ← ${name}`, "color:#60a5fa", { result: r });
            return r;
          },
          (err) => {
            push({
              when: new Date().toISOString(),
              kind: "serverFn-reject",
              message: `${name} rejected: ${err?.message ?? err}`,
              stack: err?.stack,
              cause: err?.cause,
              route: location.pathname,
              url: location.href,
              extra: { args },
            });
            throw err;
          },
        );
      }
      return out;
    } catch (err) {
      push({
        when: new Date().toISOString(),
        kind: "serverFn-throw",
        message: `${name} threw synchronously: ${(err as Error)?.message}`,
        stack: (err as Error)?.stack,
        cause: (err as { cause?: unknown })?.cause,
        route: location.pathname,
        url: location.href,
        extra: { args },
      });
      throw err;
    }
  }) as T;
}

/** Error boundary that shows full diagnostic detail instead of a generic React error. */
export class AdminErrorBoundary extends Component<
  { children: ReactNode; area?: string },
  { error: Error | null; info: ErrorInfo | null }
> {
  state = { error: null as Error | null, info: null as ErrorInfo | null };

  static getDerivedStateFromError(error: Error) {
    return { error, info: null };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState({ error, info });
    push({
      when: new Date().toISOString(),
      kind: "ErrorBoundary",
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack ?? undefined,
      cause: (error as { cause?: unknown }).cause,
      route: typeof location !== "undefined" ? location.pathname : undefined,
      url: typeof location !== "undefined" ? location.href : undefined,
      extra: { area: this.props.area },
    });
  }

  render() {
    if (!this.state.error) return this.props.children;
    const e = this.state.error;
    const info = this.state.info;
    return (
      <div className="p-6 max-w-4xl mx-auto text-sm">
        <div className="rounded-xl border border-red-500/40 bg-red-500/5 p-5 space-y-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-red-300/80">Admin runtime error</div>
            <div className="mt-1 text-lg font-semibold text-red-200">{e.message}</div>
            {this.props.area && (
              <div className="text-[11px] text-red-300/70 mt-0.5">area: {this.props.area}</div>
            )}
          </div>
          <Section title="Stack">
            <pre className="whitespace-pre-wrap break-words text-[11px] leading-relaxed">{e.stack}</pre>
          </Section>
          {info?.componentStack && (
            <Section title="Component stack">
              <pre className="whitespace-pre-wrap break-words text-[11px] leading-relaxed">
                {info.componentStack}
              </pre>
            </Section>
          )}
          {(e as { cause?: unknown }).cause !== undefined && (
            <Section title="Cause">
              <pre className="whitespace-pre-wrap break-words text-[11px]">
                {String((e as { cause?: unknown }).cause)}
              </pre>
            </Section>
          )}
          <Section title="Context">
            <pre className="text-[11px]">
              {JSON.stringify(
                {
                  route: typeof location !== "undefined" ? location.pathname : null,
                  url: typeof location !== "undefined" ? location.href : null,
                  name: e.name,
                },
                null,
                2,
              )}
            </pre>
          </Section>
          <div className="flex gap-2">
            <button
              onClick={() => this.setState({ error: null, info: null })}
              className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15 text-xs"
            >
              Reset boundary
            </button>
            <button
              onClick={() => {
                // eslint-disable-next-line no-console
                console.log("[ADMIN-DIAG] full history:", HISTORY);
                try {
                  navigator.clipboard.writeText(JSON.stringify(HISTORY, null, 2));
                } catch {}
              }}
              className="px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15 text-xs"
            >
              Copy diagnostics JSON
            </button>
          </div>
        </div>
      </div>
    );
  }
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-red-300/70 mb-1">{title}</div>
      <div className="rounded-md bg-black/40 border border-white/5 p-3 max-h-72 overflow-auto">
        {children}
      </div>
    </div>
  );
}
