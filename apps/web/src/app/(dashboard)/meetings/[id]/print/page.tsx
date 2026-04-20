"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEntitlements } from "@/hooks/useEntitlements";
import { meetingsApi } from "@/lib/api";
import {
  formatLongSpanishDateWithYear,
  formatShortSpanishDayMonth,
} from "@/lib/dates";
import { Meeting } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Crown, Loader2, Music2, Printer } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function MeetingPrintPage() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const isAdmin = user?.currentRole === "ADMIN";
  const { entitlements, isLoading: isLoadingEntitlements } = useEntitlements(
    Boolean(user),
  );

  const { data: meeting, isLoading } = useQuery<Meeting>({
    queryKey: ["meeting", id],
    queryFn: () => meetingsApi.get(id).then((r) => r.data),
  });

  if (isLoading || isLoadingEntitlements) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="py-16 text-center text-sm text-slate-400">
        Reunión no encontrada.
      </div>
    );
  }

  const canExportPdf = Boolean(entitlements?.features.canExportPdf);

  if (!canExportPdf) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 rounded-3xl border border-amber-200 bg-amber-50 p-8 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-300/60 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] dark:border-amber-800 dark:bg-amber-950/50">
          <Crown className="h-3.5 w-3.5" />
          Función Premium
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Exportar e imprimir está disponible en plan Pro
        </h1>
        <p className="text-sm leading-6">
          Puedes seguir gestionando la reunión normalmente. Para guardar PDF o
          imprimir setlists, actualiza el plan de tu iglesia.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link href={`/meetings/${id}`} className="btn-secondary">
            <ArrowLeft className="h-4 w-4" />
            Volver a la reunión
          </Link>
          {isAdmin ? (
            <Link href="/settings/billing" className="btn-primary">
              <Crown className="h-4 w-4" />
              Ver planes y desbloquear
            </Link>
          ) : (
            <span className="rounded-xl border border-amber-300/70 px-3 py-2 text-xs font-medium dark:border-amber-800">
              Solo Admin puede cambiar el plan
            </span>
          )}
        </div>
      </div>
    );
  }

  const sortedSongs = [...meeting.meetingSongs].sort(
    (a, b) => a.order - b.order,
  );

  return (
    <>
      {/* Barra de acciones — se oculta al imprimir */}
      <div data-print-hide className="mb-8 flex flex-wrap items-center gap-3">
        <Link
          href={`/meetings/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a la reunión
        </Link>
        <button onClick={() => window.print()} className="btn-primary ml-auto">
          <Printer className="h-4 w-4" />
          Imprimir / Guardar PDF
        </button>
      </div>

      {/* ── Contenido imprimible ────────────────────────────── */}
      <div className="setlist-print mx-auto max-w-3xl font-sans text-slate-900">
        {/* Encabezado */}
        <header className="mb-8 border-b-2 border-slate-200 pb-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700">
              <Music2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
              SongList
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {meeting.title}
          </h1>
          <p className="mt-1.5 text-base text-slate-500">
            {formatLongSpanishDateWithYear(new Date(meeting.date))}
          </p>
        </header>

        {/* Lista de canciones */}
        <section className="mb-10">
          <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
            Canciones ({sortedSongs.length})
          </h2>

          {sortedSongs.length === 0 ? (
            <p className="text-sm text-slate-400">Sin canciones asignadas.</p>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-slate-200 text-left">
                  <th className="w-8 pb-3 pr-4 font-semibold text-slate-400">
                    #
                  </th>
                  <th className="pb-3 pr-4 font-semibold text-slate-700">
                    Canción
                  </th>
                  <th className="pb-3 pr-4 font-semibold text-slate-700">
                    Artista
                  </th>
                  <th className="w-24 pb-3 pr-4 font-semibold text-slate-700">
                    Tonalidad
                  </th>
                  <th className="w-16 pb-3 pr-4 font-semibold text-slate-700">
                    BPM
                  </th>
                  <th className="pb-3 font-semibold text-slate-700">Notas</th>
                </tr>
              </thead>
              <tbody>
                {sortedSongs.map((ms, idx) => (
                  <tr
                    key={ms.id}
                    className="border-b border-slate-100 last:border-b-0"
                  >
                    <td className="py-3 pr-4 font-mono text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3 pr-4 font-semibold text-slate-900">
                      {ms.song.title}
                    </td>
                    <td className="py-3 pr-4 text-slate-500">
                      {ms.song.artist ?? "—"}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="chord-key-badge inline-block rounded-md bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700">
                        {ms.keyOverride ?? ms.song.originalKey}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-mono text-slate-500">
                      {ms.song.bpm ?? "—"}
                    </td>
                    <td className="py-3 text-xs text-slate-400">
                      {ms.notes ?? ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Músicos asignados */}
        {meeting.assignments.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
              Músicos asignados ({meeting.assignments.length})
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {meeting.assignments.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-150 bg-slate-50 px-4 py-3"
                >
                  <span className="shrink-0 text-xl" aria-hidden="true">
                    {a.instrument.icon ?? "🎵"}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {a.user.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {a.instrument.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Notas generales */}
        {meeting.notes && (
          <section className="mb-10">
            <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
              Notas generales
            </h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
              {meeting.notes}
            </p>
          </section>
        )}

        {/* Footer */}
        <footer className="border-t border-slate-200 pt-4 text-xs text-slate-400">
          Generado con SongList · {formatShortSpanishDayMonth(new Date())}
        </footer>
      </div>
    </>
  );
}
