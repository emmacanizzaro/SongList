"use client";

import { meetingsApi } from "@/lib/api";
import { Meeting } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, Loader2, Music2, Printer } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function MeetingPrintPage() {
  const { id } = useParams<{ id: string }>();

  const { data: meeting, isLoading } = useQuery<Meeting>({
    queryKey: ["meeting", id],
    queryFn: () => meetingsApi.get(id).then((r) => r.data),
  });

  if (isLoading) {
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

  const sortedSongs = [...meeting.meetingSongs].sort(
    (a, b) => a.order - b.order,
  );

  return (
    <>
      {/* Barra de acciones — se oculta al imprimir */}
      <div
        data-print-hide
        className="mb-8 flex flex-wrap items-center gap-3"
      >
        <Link
          href={`/meetings/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a la reunión
        </Link>
        <button
          onClick={() => window.print()}
          className="btn-primary ml-auto"
        >
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
            {format(new Date(meeting.date), "EEEE d 'de' MMMM 'de' yyyy", {
              locale: es,
            })}
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
                    <p className="text-xs text-slate-400">{a.instrument.name}</p>
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
          Generado con SongList ·{" "}
          {format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es })}
        </footer>
      </div>
    </>
  );
}
