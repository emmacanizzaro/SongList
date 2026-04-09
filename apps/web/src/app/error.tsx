"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="es">
      <body>
        <div className="min-h-screen px-4 py-10">
          <div className="mx-auto flex min-h-[80vh] w-full max-w-3xl items-center justify-center">
            <section className="relative overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-8 py-10 text-center shadow-[var(--shadow-card)] backdrop-blur sm:px-12">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(188,132,47,0.18),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(31,77,143,0.15),transparent_28%)]" />
              <div className="relative">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg">
                  <AlertTriangle className="h-8 w-8" />
                </div>
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-red-600 dark:text-red-300">
                  Error inesperado
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                  Algo se rompió en esta vista
                </h1>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
                  Puedes reintentar la acción o volver al dashboard. Si el
                  problema persiste, revisa la consola y el backend.
                </p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <button onClick={() => reset()} className="btn-primary">
                    <RefreshCw className="h-4 w-4" />
                    Reintentar
                  </button>
                  <Link href="/dashboard" className="btn-secondary">
                    Volver al dashboard
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </body>
    </html>
  );
}
