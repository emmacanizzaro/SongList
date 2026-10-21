import { Music2 } from 'lucide-react'
import type { ReactNode } from 'react'

/** Centered card used by the account recovery and verification pages. */
export function AuthShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 dark:bg-slate-950">
      <div className="pointer-events-none absolute inset-0 music-notes-bg opacity-50 dark:opacity-30" />
      <div className="relative w-full max-w-md rounded-[30px] border border-white/50 bg-white/80 p-8 shadow-[0_24px_70px_rgba(22,43,73,0.12)] backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-6 flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700">
            <Music2 className="h-5 w-5 text-white" aria-hidden />
          </span>
          <span className="text-lg font-semibold text-slate-900 dark:text-white">SongList</span>
        </div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{title}</h1>
        <div className="mt-4">{children}</div>
      </div>
    </main>
  )
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  const message = (error as { response?: { data?: { message?: unknown } } })?.response?.data?.message
  if (typeof message === 'string') return message
  if (Array.isArray(message) && typeof message[0] === 'string') return message[0]
  return fallback
}
