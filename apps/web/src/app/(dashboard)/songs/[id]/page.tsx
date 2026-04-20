"use client";

import { ChordSheet } from "@/components/songs/ChordSheet";
import { TranspositionControl } from "@/components/songs/TranspositionControl";
import { useTransposition } from "@/hooks/useTransposition";
import { songsApi } from "@/lib/api";
import { Song } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Music2, Save, Sparkles, Tags } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

const editSongSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(200),
  artist: z.string().max(100).optional().or(z.literal("")),
  originalKey: z.string().min(1, "La tonalidad es obligatoria"),
  bpm: z
    .string()
    .optional()
    .refine(
      (value) => !value || (Number(value) >= 40 && Number(value) <= 300),
      "El BPM debe estar entre 40 y 300",
    ),
  tags: z.string().optional(),
});

type EditSongInput = z.infer<typeof editSongSchema>;

const versionTypeOptions = [
  { value: "MALE_KEY", label: "Voz masculina" },
  { value: "FEMALE_KEY", label: "Voz femenina" },
  { value: "CUSTOM", label: "Personalizada" },
] as const;

export default function SongDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const [variantType, setVariantType] = useState<
    "MALE_KEY" | "FEMALE_KEY" | "CUSTOM"
  >("CUSTOM");
  const [variantNotes, setVariantNotes] = useState("");

  const {
    data: song,
    isLoading,
    refetch,
  } = useQuery<Song>({
    queryKey: ["song", id],
    queryFn: () => songsApi.get(id).then((r) => r.data),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditSongInput>({
    resolver: zodResolver(editSongSchema),
    defaultValues: {
      title: "",
      artist: "",
      originalKey: "C",
      bpm: "",
      tags: "",
    },
  });

  const { currentKey, setKey, transposedLyrics, isTransposing } =
    useTransposition(song);

  const updateSongMutation = useMutation({
    mutationFn: async (payload: EditSongInput) => {
      await songsApi.update(id, {
        title: payload.title,
        artist: payload.artist || undefined,
        originalKey: payload.originalKey,
        bpm: payload.bpm ? Number(payload.bpm) : undefined,
        tags: payload.tags
          ? payload.tags
              .split(",")
              .map((tag) => tag.trim().toLowerCase())
              .filter(Boolean)
          : [],
      });
    },
    onSuccess: async () => {
      toast.success("Canción actualizada");
      setIsEditing(false);
      await refetch();
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message?.join?.(", ") ||
        error?.response?.data?.message ||
        "No se pudo guardar la canción";
      toast.error(message);
    },
  });

  const saveVariantMutation = useMutation({
    mutationFn: async () => {
      await songsApi.addVersion(id, {
        type: variantType,
        targetKey: currentKey,
        notes: variantNotes || undefined,
      });
    },
    onSuccess: async () => {
      toast.success("Versión transpuesta guardada");
      setVariantNotes("");
      await refetch();
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message?.join?.(", ") ||
        error?.response?.data?.message ||
        "No se pudo guardar la versión";
      toast.error(message);
    },
  });

  useEffect(() => {
    if (!song) return;

    reset({
      title: song.title,
      artist: song.artist ?? "",
      originalKey: song.originalKey,
      bpm: song.bpm ? String(song.bpm) : "",
      tags: song.tags?.join(", ") ?? "",
    });
  }, [song, reset]);

  const originalVersion = song?.versions.find((v) => v.type === "ORIGINAL");

  const transposedVersions = useMemo(
    () => song?.versions.filter((v) => v.type !== "ORIGINAL") ?? [],
    [song],
  );

  const versionSummary = useMemo(() => {
    if (transposedVersions.length === 0) {
      return "Aún no hay versiones guardadas";
    }

    return transposedVersions
      .map((version) => `${formatVersionType(version.type)} (${version.key})`)
      .join(" · ");
  }, [transposedVersions]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-6xl animate-pulse space-y-4">
        <div className="h-8 w-1/3 rounded bg-gray-200" />
        <div className="h-4 w-1/5 rounded bg-gray-100" />
        <div className="mt-8 h-96 rounded-xl bg-gray-100" />
      </div>
    );
  }

  if (!song) return <div>Canción no encontrada</div>;

  const canSaveVariant =
    Boolean(originalVersion) && currentKey !== originalVersion?.key;

  const onSubmitEdit = (data: EditSongInput) => {
    updateSongMutation.mutate(data);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <Link
        href="/songs"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-brand-700 dark:text-slate-400 dark:hover:text-brand-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a canciones
      </Link>

      <section className="relative overflow-hidden rounded-[32px] bg-slate-950 px-6 py-8 text-white shadow-[0_28px_60px_rgba(15,23,42,0.22)] sm:px-8 lg:px-10">
        <div className="pointer-events-none absolute inset-0 music-notes-bg opacity-20" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(188,132,47,0.22),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(31,77,143,0.28),transparent_30%)]" />

        <div className="relative flex flex-col gap-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow bg-white/10 text-slate-200">Canción</p>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                {song.title}
              </h1>
              {song.artist && (
                <p className="mt-2 text-sm leading-6 text-slate-300 sm:text-base">
                  {song.artist}
                </p>
              )}
            </div>

            <button
              onClick={() => setIsEditing((prev) => !prev)}
              className="btn-secondary self-start border-white/10 bg-white/8 text-white hover:bg-white/12 lg:self-auto"
            >
              {isEditing ? "Cerrar edición" : "Editar metadatos"}
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur-md">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-700 px-3 py-1.5 text-xs font-semibold text-white">
                  <Music2 className="h-3 w-3" />
                  Tono original: {song.originalKey}
                </span>
                {song.bpm && (
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-slate-200">
                    {song.bpm} BPM
                  </span>
                )}
                {song.tags.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs text-slate-200">
                    <Tags className="h-3 w-3" />
                    {song.tags.slice(0, 3).join(" · ")}
                  </span>
                )}
              </div>
              <p className="mt-4 text-sm text-slate-300">{versionSummary}</p>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur-md">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                Versionado
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                Usa la transposición en vivo y guarda las tonalidades más usadas
                por tu equipo.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          {originalVersion && (
            <TranspositionControl
              originalKey={originalVersion.key}
              currentKey={currentKey}
              onKeyChange={setKey}
            />
          )}

          {originalVersion ? (
            <div className="card p-6">
              {isTransposing ? (
                <div className="animate-pulse space-y-2">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="h-4 rounded bg-gray-100" />
                  ))}
                </div>
              ) : (
                <ChordSheet
                  lyricsChords={
                    transposedLyrics ?? originalVersion.lyricsChords
                  }
                  currentKey={currentKey}
                />
              )}
            </div>
          ) : (
            <div className="card p-10 text-center text-slate-400 dark:text-slate-400">
              <p className="text-sm">
                Esta canción no tiene versión ORIGINAL cargada. Para transponer
                o guardar variantes primero se necesita esa base.
              </p>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <Sparkles className="h-4 w-4 text-accent-500" />
              Guardar versión transpuesta
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Tipo de versión
                </label>
                <select
                  className="input"
                  value={variantType}
                  onChange={(event) =>
                    setVariantType(
                      event.target.value as
                        | "MALE_KEY"
                        | "FEMALE_KEY"
                        | "CUSTOM",
                    )
                  }
                >
                  {versionTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Tonalidad actual
                </label>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                  {currentKey}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Nota opcional
                </label>
                <textarea
                  rows={3}
                  className="input resize-none"
                  placeholder="Ej: versión cómoda para tenor"
                  value={variantNotes}
                  onChange={(event) => setVariantNotes(event.target.value)}
                />
              </div>

              <button
                disabled={!canSaveVariant || saveVariantMutation.isPending}
                onClick={() => saveVariantMutation.mutate()}
                className="btn-primary w-full disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saveVariantMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Guardar versión
                  </>
                )}
              </button>

              {!canSaveVariant && originalVersion && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cambia la tonalidad para guardar una variante distinta al tono
                  original.
                </p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Editar metadatos
              </h3>
              <form
                onSubmit={handleSubmit(onSubmitEdit)}
                className="mt-4 space-y-4"
              >
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Título
                  </label>
                  <input className="input" {...register("title")} />
                  {errors.title && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Artista
                  </label>
                  <input className="input" {...register("artist")} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      Tono original
                    </label>
                    <input className="input" {...register("originalKey")} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      BPM
                    </label>
                    <input
                      className="input"
                      type="number"
                      {...register("bpm")}
                    />
                    {errors.bpm && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.bpm.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    Etiquetas
                  </label>
                  <input className="input" {...register("tags")} />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || updateSongMutation.isPending}
                  className="btn-secondary w-full disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updateSongMutation.isPending
                    ? "Guardando..."
                    : "Guardar cambios"}
                </button>
              </form>
            </div>
          )}

          <div className="card p-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Versiones disponibles
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {song.versions.map((version) => (
                <span
                  key={version.id}
                  className="inline-flex items-center gap-1 rounded-full border border-brand-100 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:border-brand-800 dark:bg-brand-900/20 dark:text-brand-300"
                >
                  {formatVersionType(version.type)} · {version.key}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function formatVersionType(type: string) {
  if (type === "ORIGINAL") return "Original";
  if (type === "MALE_KEY") return "Voz masculina";
  if (type === "FEMALE_KEY") return "Voz femenina";
  return "Personalizada";
}
