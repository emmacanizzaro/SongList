"use client";

import api from "@/lib/api";
import { Meeting, MeetingSong } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AlertCircle, Calendar, Music2, Users2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function PublicMeetingPage() {
  const { token } = useParams<{ token: string }>();

  const {
    data: meeting,
    isLoading,
    isError,
  } = useQuery<Meeting>({
    queryKey: ["public-meeting", token],
    queryFn: () =>
      api.get(`/api/v1/public/meetings/${token}`).then((r) => r.data),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="animate-pulse space-y-6 w-full max-w-lg">
          <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-[28px]" />
          <div className="space-y-2">
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-slate-100 dark:bg-slate-800/50 rounded-2xl"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !meeting) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-950/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
            Reunión no disponible
          </h1>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">
            Este link no es válido o la reunión ya no está disponible al
            público.
          </p>
          <Link href="/login" className="btn-primary mt-6 inline-flex">
            Ir al inicio
          </Link>
        </div>
      </div>
    );
  }

  const date = new Date(meeting.date);

  const assignmentsByInstrument = meeting.assignments.reduce<
    Record<string, Meeting["assignments"]>
  >((acc, assignment) => {
    const key = assignment.instrument.name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(assignment);
    return acc;
  }, {});

  const hasAssignments = meeting.assignments.length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar mínimo */}
      <nav className="sticky top-0 z-10 backdrop-blur-sm bg-[var(--color-bg-soft)]/80 border-b border-[var(--color-border)] px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <Music2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-900 dark:text-white text-sm">
            SongList
          </span>
        </Link>
        <Link href="/login" className="btn-secondary text-xs px-3 py-1.5">
          Iniciar sesión
        </Link>
      </nav>

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-[28px] bg-slate-950 px-6 py-8 text-white shadow-[0_28px_60px_rgba(15,23,42,0.22)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(188,132,47,0.22),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(31,77,143,0.28),transparent_30%)]" />
          <div className="relative">
            <p className="text-xs font-semibold tracking-widest uppercase text-brand-300 mb-3">
              Setlist compartido
            </p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {meeting.title}
            </h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-300">
              <Calendar className="w-4 h-4 shrink-0" />
              {format(date, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
            </p>
            {meeting.notes && (
              <p className="mt-3 text-sm text-slate-400 leading-relaxed border-t border-white/10 pt-3">
                {meeting.notes}
              </p>
            )}
          </div>
        </section>

        {/* Lista de canciones */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Music2 className="w-4 h-4 text-brand-600" />
            <h2 className="font-semibold text-slate-900 dark:text-white text-sm">
              Canciones ({meeting.meetingSongs.length})
            </h2>
          </div>

          {meeting.meetingSongs.length === 0 ? (
            <div className="card p-10 text-center text-slate-400 text-sm">
              No hay canciones en esta reunión
            </div>
          ) : (
            <div className="space-y-2">
              {meeting.meetingSongs.map((item, index) => (
                <SongRow key={item.id} item={item} index={index + 1} />
              ))}
            </div>
          )}
        </section>

        {/* Asignaciones de músicos */}
        {hasAssignments && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Users2 className="w-4 h-4 text-brand-600" />
              <h2 className="font-semibold text-slate-900 dark:text-white text-sm">
                Músicos ({meeting.assignments.length})
              </h2>
            </div>
            <div className="card divide-y divide-[var(--color-border)]">
              {Object.entries(assignmentsByInstrument).map(
                ([instrument, assignments]) => (
                  <div
                    key={instrument}
                    className="px-4 py-3 flex items-center gap-3"
                  >
                    <span className="text-lg shrink-0">
                      {assignments[0].instrument.icon ?? "🎵"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                        {instrument}
                      </p>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                        {assignments.map((a) => a.user.name).join(", ")}
                      </p>
                    </div>
                  </div>
                ),
              )}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 px-4 border-t border-[var(--color-border)]">
        <p className="text-xs text-slate-400">
          Creado con{" "}
          <Link
            href="/login"
            className="text-brand-600 font-medium hover:underline"
          >
            SongList
          </Link>{" "}
          · Plataforma para equipos de alabanza
        </p>
      </footer>
    </div>
  );
}

function SongRow({ item, index }: { item: MeetingSong; index: number }) {
  const key = item.keyOverride ?? item.song.originalKey;

  return (
    <div className="card px-4 py-3.5 flex items-center gap-4">
      <span className="w-7 h-7 rounded-full bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center text-xs font-bold text-brand-700 dark:text-brand-300 shrink-0">
        {index}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
          {item.song.title}
        </p>
        {item.song.artist && (
          <p className="text-xs text-slate-400 truncate">{item.song.artist}</p>
        )}
        {item.notes && (
          <p className="text-xs text-brand-600 dark:text-brand-400 mt-0.5 truncate">
            {item.notes}
          </p>
        )}
      </div>
      <span className="shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-600 dark:text-slate-300 font-mono">
        {key}
      </span>
    </div>
  );
}
