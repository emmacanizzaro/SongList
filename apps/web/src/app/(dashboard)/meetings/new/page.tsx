"use client";

import { useAuth } from "@/hooks/useAuth";
import { meetingsApi, songsApi } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Plus,
  Save,
  Sparkles,
  StickyNote,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

const meetingTitleOptions = [
  "Reunión Especial",
  "Reunión de Fin de Semana",
] as const;

const createMeetingSchema = z.object({
  title: z.enum(meetingTitleOptions),
  worshipLeader: z.string().min(2, "Worship Leader es obligatorio").max(100),
  date: z.string().min(1, "La fecha es obligatoria"),
  notes: z.string().optional().default(""),
});

type CreateMeetingInput = z.infer<typeof createMeetingSchema>;

interface SelectedMeetingSong {
  songId: string;
  title: string;
  keyOverride?: string;
  notes?: string;
}

export default function NewMeetingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [selectedSongId, setSelectedSongId] = useState("");
  const [selectedKeyOverride, setSelectedKeyOverride] = useState("");
  const [selectedSongNote, setSelectedSongNote] = useState("");
  const [selectedSongs, setSelectedSongs] = useState<SelectedMeetingSong[]>([]);

  const { data: songs = [] } = useQuery({
    queryKey: ["songs-for-new-meeting"],
    queryFn: () => songsApi.list().then((r) => r.data),
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateMeetingInput>({
    resolver: zodResolver(createMeetingSchema),
    defaultValues: {
      title: "Reunión Especial",
      worshipLeader: "",
      date: "",
      notes: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const liveDate = watch("date");
  const liveTitle = watch("title");
  const liveLeader = watch("worshipLeader");

  const canEditMeetings = user?.currentRole !== "READER";

  const addSongToMeeting = () => {
    if (!selectedSongId) return;

    const foundSong = songs.find((song: any) => song.id === selectedSongId);
    if (!foundSong) return;

    if (selectedSongs.some((song) => song.songId === selectedSongId)) {
      toast.error("Esa canción ya fue agregada");
      return;
    }

    setSelectedSongs((prev) => [
      ...prev,
      {
        songId: foundSong.id,
        title: foundSong.title,
        keyOverride: selectedKeyOverride || undefined,
        notes: selectedSongNote || undefined,
      },
    ]);

    setSelectedSongId("");
    setSelectedKeyOverride("");
    setSelectedSongNote("");
  };

  const removeSongFromMeeting = (songId: string) => {
    setSelectedSongs((prev) => prev.filter((song) => song.songId !== songId));
  };

  const onSubmit = async (data: CreateMeetingInput) => {
    if (!canEditMeetings) {
      toast.error("Tu rol es visualizador. No puedes crear reuniones.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const mergedNotes = [
        `Worship Leader: ${data.worshipLeader}`,
        data.notes?.trim(),
      ]
        .filter(Boolean)
        .join("\n\n");

      const { data: meeting } = await meetingsApi.create({
        title: data.title,
        date: new Date(data.date).toISOString(),
        notes: mergedNotes,
        songs: selectedSongs.map((song, index) => ({
          songId: song.songId,
          order: index + 1,
          keyOverride: song.keyOverride,
          notes: song.notes,
        })),
      });
      toast.success("Reunión creada correctamente");
      router.push(`/meetings/${meeting.id}`);
    } catch (err: any) {
      const message =
        err?.response?.data?.message?.join?.(", ") ||
        err?.response?.data?.message ||
        "No se pudo crear la reunión";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <div className="relative flex flex-col gap-3">
          <p className="eyebrow bg-white/10 text-slate-200">Reuniones</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Crea una reunión clara y accionable
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Define fecha, foco y notas para que tu equipo llegue alineado desde
            el primer momento.
          </p>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {error}
        </div>
      )}

      {!canEditMeetings && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-200">
          Estás en modo visualizador. Puedes revisar reuniones, pero no crear ni
          editar.
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="card p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                TITULO
              </label>
              <select
                {...register("title")}
                className="input"
                disabled={!canEditMeetings}
              >
                {meetingTitleOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Worship Leader
              </label>
              <input
                type="text"
                placeholder="Nombre del líder de alabanza"
                {...register("worshipLeader")}
                className="input"
                disabled={!canEditMeetings}
              />
              {errors.worshipLeader && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.worshipLeader.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Fecha y hora
              </label>
              <input
                type="datetime-local"
                {...register("date")}
                className="input"
                disabled={!canEditMeetings}
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.date.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Notas del equipo
              </label>
              <textarea
                placeholder="Enfoque del servicio, dinámica, observaciones musicales..."
                {...register("notes")}
                rows={5}
                className="input resize-y"
                disabled={!canEditMeetings}
              />
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Canciones de la biblioteca
              </p>

              <div className="grid gap-3 md:grid-cols-2">
                <select
                  className="input"
                  value={selectedSongId}
                  onChange={(event) => setSelectedSongId(event.target.value)}
                  disabled={!canEditMeetings}
                >
                  <option value="">Selecciona una canción</option>
                  {songs.map((song: any) => (
                    <option key={song.id} value={song.id}>
                      {song.title}
                    </option>
                  ))}
                </select>

                <input
                  className="input"
                  placeholder="Tono opcional (ej: D)"
                  value={selectedKeyOverride}
                  onChange={(event) =>
                    setSelectedKeyOverride(event.target.value)
                  }
                  disabled={!canEditMeetings}
                />

                <input
                  className="input md:col-span-2"
                  placeholder="Nota opcional para esta canción"
                  value={selectedSongNote}
                  onChange={(event) => setSelectedSongNote(event.target.value)}
                  disabled={!canEditMeetings}
                />
              </div>

              <button
                type="button"
                onClick={addSongToMeeting}
                disabled={!selectedSongId || !canEditMeetings}
                className="btn-secondary w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus className="h-4 w-4" />
                Agregar canción seleccionada
              </button>

              {selectedSongs.length > 0 ? (
                <div className="space-y-2">
                  {selectedSongs.map((song, index) => (
                    <div
                      key={song.songId}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                    >
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-100">
                          {index + 1}. {song.title}
                        </p>
                        {(song.keyOverride || song.notes) && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {song.keyOverride
                              ? `Tono: ${song.keyOverride}`
                              : ""}
                            {song.keyOverride && song.notes ? " · " : ""}
                            {song.notes ?? ""}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSongFromMeeting(song.songId)}
                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-300"
                        disabled={!canEditMeetings}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Aun no agregaste canciones. Seleccionalas desde tu biblioteca
                  para mas orden y rapidez.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Luego podrás agregar canciones y asignar músicos.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !canEditMeetings}
                  className="btn-primary disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting ? "Creando..." : "Crear reunión"}
                </button>
              </div>
            </div>
          </form>
        </div>

        <aside className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <Sparkles className="h-4 w-4 text-accent-500" />
              Vista previa
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Título
                </p>
                <p className="mt-1 font-medium text-slate-800 dark:text-slate-100">
                  {liveTitle || "Servicio principal"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Worship Leader
                </p>
                <p className="mt-1 font-medium text-slate-800 dark:text-slate-100">
                  {liveLeader || "Sin definir"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                  <p className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Fecha
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">
                    {liveDate
                      ? new Date(liveDate).toLocaleDateString("es-ES")
                      : "Sin definir"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                  <p className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                    <Clock3 className="h-3.5 w-3.5" />
                    Hora
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">
                    {liveDate
                      ? new Date(liveDate).toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Sin definir"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <StickyNote className="h-4 w-4 text-brand-600 dark:text-brand-300" />
              Flujo recomendado
            </div>
            <ol className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>1. Define fecha y objetivo de la reunión.</li>
              <li>2. Selecciona canciones ya guardadas en la biblioteca.</li>
              <li>3. Asigna músicos y comparte el plan final.</li>
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
