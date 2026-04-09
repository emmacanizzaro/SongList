import Link from "next/link";
import { Compass, Home, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-3xl items-center justify-center">
        <section className="relative overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-8 py-10 text-center shadow-[var(--shadow-card)] backdrop-blur sm:px-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(31,77,143,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(188,132,47,0.14),transparent_24%)]" />
          <div className="relative">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg">
              <SearchX className="h-8 w-8" />
            </div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700 dark:text-brand-300">
              Error 404
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Esta ruta no existe
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
              El enlace puede haber cambiado, estar incompleto o apuntar a una
              vista que ya no está disponible.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/dashboard" className="btn-primary">
                <Home className="h-4 w-4" />
                Ir al dashboard
              </Link>
              <Link href="/meetings" className="btn-secondary">
                <Compass className="h-4 w-4" />
                Ver reuniones
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}