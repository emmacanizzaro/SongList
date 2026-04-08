"use client";

import { useAuth } from "@/hooks/useAuth";
import { meetingsApi, songsApi } from "@/lib/api";
import { Meeting } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowLeft,
  Calendar,
  GripVertical,
  Loader2,
  Plus,
  Share2,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function MeetingDetailPage() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [songId, setSongId] = useState("");
  const [keyOverride, setKeyOverride] = useState("");
  const [songNotes, setSongNotes] = useState("");

  const { data: meeting, isLoading } = useQuery<Meeting>({
    queryKey: ["meeting", id],
    queryFn: () => meetingsApi.get(id).then((r) => r.data),
  });

  const { data: songs = [] } = useQuery({
    queryKey: ["songs-for-meeting"],
    queryFn: () => songsApi.list().then((r) => r.data),
  });

  const availableSongs = useMemo(() => {
    if (!meeting) return songs;
    const includedIds = new Set(
      meeting.meetingSongs.map((item) => item.songId),
    );
    return songs.filter((song: any) => !includedIds.has(song.id));
  }, [meeting, songs]);

  const canEditMeetings = user?.currentRole !== "READER";

  const shareMutation = useMutation({
    mutationFn: () => meetingsApi.generateShare(id),
    onSuccess: (res) => {
      const token = res.data.shareToken;
      const url = `${window.location.origin}/public/meetings/${token}`;
      navigator.clipboard.writeText(url);
      toast.success("¡Link copiado al portapapeles!");
      queryClient.invalidateQueries({ queryKey: ["meeting", id] });
    },
  });

  const addSongMutation = useMutation({
    mutationFn: () =>
      meetingsApi.addSong(id, {
        songId,
        keyOverride: keyOverride || undefined,
        notes: songNotes || undefined,
      }),
    onSuccess: async () => {
      toast.success("Canción agregada a la reunión");
      setSongId("");
      setKeyOverride("");
      setSongNotes("");
      await queryClient.invalidateQueries({ queryKey: ["meeting", id] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message?.join?.(", ") ||
        error?.response?.data?.message ||
        "No se pudo agregar la canción";
      toast.error(message);
    },
  });

  const removeSongMutation = useMutation({
    mutationFn: (meetingSongId: string) =>
      meetingsApi.removeSong(id, meetingSongId),
    onSuccess: async () => {
      toast.success("Canción eliminada de la reunión");
      await queryClient.invalidateQueries({ queryKey: ["meeting", id] });
    },
    onError: () => {
      toast.error("No se pudo eliminar la canción");
    },
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-64 bg-gray-100 rounded-xl mt-8" />
      </div>
    );
  }

  if (!meeting) return <div>Reunión no encontrada</div>;

  const worshipLeader = (() => {
    const match = meeting.notes?.match(/Worship Leader:\s*(.+)/i);
    return match?.[1]?.trim() || "Sin definir";
  })();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <Link
        href="/meetings"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-brand-700 dark:text-slate-400 dark:hover:text-brand-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a reuniones
      </Link>

      <section className="relative overflow-hidden rounded-[32px] bg-slate-950 px-6 py-8 text-white shadow-[0_28px_60px_rgba(15,23,42,0.22)] sm:px-8 lg:px-10">
        <div className="pointer-events-none absolute inset-0 music-notes-bg opacity-20" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(188,132,47,0.22),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(31,77,143,0.28),transparent_30%)]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow bg-white/10 text-slate-200">Reunión</p>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
              {meeting.title}
            </h1>
            <p className="mt-2 text-sm text-slate-300 sm:text-base">
              {format(new Date(meeting.date), "EEEE d 'de' MMMM 'de' yyyy", {
                locale: es,
              })}
            </p>
          </div>
          {canEditMeetings ? (
            <button
              onClick={() => shareMutation.mutate()}
              disabled={shareMutation.isPending}
              className="btn-secondary self-start border-white/10 bg-white/8 text-white hover:bg-white/12 lg:self-auto"
            >
              {shareMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Compartiendo...
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  {meeting.shareToken ? "Copiar link" : "Compartir"}
                </>
              )}
            </button>
          ) : (
            <span className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-medium text-slate-200">
              Visualizador
            </span>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Lista de canciones
            </h2>
          </div>

          <div className="card p-4 sm:p-5">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Agregar canción
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <select
                className="input"
                value={songId}
                onChange={(event) => setSongId(event.target.value)}
                disabled={!canEditMeetings}
              >
                <option value="">Selecciona una canción...</option>
                {availableSongs.map((song: any) => (
                  <option key={song.id} value={song.id}>
                    {song.title}
                  </option>
                ))}
              </select>
              <input
                className="input"
                placeholder="Tonalidad opcional (ej: D)"
                value={keyOverride}
                onChange={(event) => setKeyOverride(event.target.value)}
                disabled={!canEditMeetings}
              />
              <input
                className="input sm:col-span-2"
                placeholder="Nota opcional para esta reunión"
                value={songNotes}
                onChange={(event) => setSongNotes(event.target.value)}
                disabled={!canEditMeetings}
              />
            </div>
            <button
              disabled={
                !songId || addSongMutation.isPending || !canEditMeetings
              }
              onClick={() => addSongMutation.mutate()}
              className="btn-primary mt-3 w-full disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {addSongMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Agregando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  {canEditMeetings ? "Agregar a la reunión" : "Solo lectura"}
                </>
              )}
            </button>
          </div>

          {meeting.meetingSongs.length === 0 ? (
            <div className="card p-8 text-center text-sm text-gray-400 dark:text-slate-400">
              No hay canciones. Agrega la primera.
            </div>
          ) : (
            <div className="space-y-2">
              {meeting.meetingSongs.map((ms, idx) => (
                <div key={ms.id} className="card flex items-center gap-3 p-3">
                  <GripVertical className="h-4 w-4 cursor-grab text-slate-300" />
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-700 text-xs font-bold text-white">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <Link
                      href={`/songs/${ms.songId}`}
                      className="text-sm font-medium text-slate-900 transition-colors hover:text-brand-700 dark:text-white dark:hover:text-brand-300"
                    >
                      {ms.song.title}
                    </Link>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Tono: {ms.keyOverride ?? ms.song.originalKey}
                      {ms.notes && ` · ${ms.notes}`}
                    </p>
                  </div>
                  <button
                    onClick={() => removeSongMutation.mutate(ms.id)}
                    disabled={removeSongMutation.isPending || !canEditMeetings}
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-300"
                    title="Quitar canción"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Músicos asignados
            </h2>
          </div>

          <div className="card p-4 text-sm text-slate-500 dark:text-slate-400">
            <p className="inline-flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
              <Calendar className="h-4 w-4 text-brand-600 dark:text-brand-300" />
              Próximo paso
            </p>
            <p className="mt-2 leading-6">Worship Leader: {worshipLeader}</p>
          </div>

          {meeting.assignments.length === 0 ? (
            <div className="card p-6 text-center text-sm text-gray-400 dark:text-slate-400">
              Sin músicos asignados aún
            </div>
          ) : (
            <div className="space-y-2">
              {meeting.assignments.map((a) => (
                <div key={a.id} className="card flex items-center gap-3 p-3">
                  <span className="text-lg">{a.instrument.icon ?? "🎵"}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {a.user.name}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {a.instrument.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
