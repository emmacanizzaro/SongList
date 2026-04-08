"use client";

import { songsApi } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Info, Music2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const createSongSchema = z.object({
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
  lyricsChords: z.string().min(1, "Agrega la letra con acordes"),
  notes: z.string().optional(),
});

type CreateSongInput = z.infer<typeof createSongSchema>;

const KEYS = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

export default function NewSongPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateSongInput>({
    resolver: zodResolver(createSongSchema),
    defaultValues: {
      originalKey: "C",
      bpm: "",
      tags: "",
      notes: "",
      lyricsChords: "",
    },
  });

  const lyricsPreview = watch("lyricsChords");

  const onSubmit = async (data: CreateSongInput) => {
    setError("");

    try {
      const response = await songsApi.create({
        title: data.title,
        artist: data.artist || undefined,
        originalKey: data.originalKey,
        bpm: data.bpm ? Number(data.bpm) : undefined,
        tags: data.tags
          ? data.tags
              .split(",")
              .map((tag) => tag.trim().toLowerCase())
              .filter(Boolean)
          : [],
        version: {
          type: "ORIGINAL",
          key: data.originalKey,
          lyricsChords: data.lyricsChords,
          notes: data.notes || undefined,
        },
      });

      router.push(`/songs/${response.data.id}`);
    } catch (submissionError: any) {
      setError(
        submissionError?.response?.data?.message?.join?.(", ") ||
          submissionError?.response?.data?.message ||
          "No se pudo crear la canción. Revisa los datos e intenta nuevamente.",
      );
    }
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
        <div className="relative flex flex-col gap-3">
          <p className="eyebrow bg-white/10 text-slate-200">Nueva canción</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Carga repertorio con una vista más clara
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Completa la versión original con letra y acordes. Después podrás
            abrir el detalle para transponerla o preparar variantes.
          </p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="card p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
                {error}
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Título
                </label>
                <input
                  type="text"
                  placeholder="Sublime gracia"
                  className="input"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Artista o autor
                </label>
                <input
                  type="text"
                  placeholder="Tradicional"
                  className="input"
                  {...register("artist")}
                />
                {errors.artist && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.artist.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Tonalidad original
                </label>
                <select className="input" {...register("originalKey")}>
                  {KEYS.map((key) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  BPM
                </label>
                <input
                  type="number"
                  min={40}
                  max={300}
                  placeholder="72"
                  className="input"
                  {...register("bpm")}
                />
                {errors.bpm && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.bpm.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Etiquetas
                </label>
                <input
                  type="text"
                  placeholder="adoración, domingo, apertura"
                  className="input"
                  {...register("tags")}
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Letra y acordes
                </label>
                <textarea
                  rows={12}
                  placeholder="[C]Sublime [G]gracia del [Am]Señor..."
                  className="input min-h-[280px] resize-y"
                  {...register("lyricsChords")}
                />
                {errors.lyricsChords && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.lyricsChords.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Notas internas
                </label>
                <textarea
                  rows={4}
                  placeholder="Intro libre, corte instrumental, observaciones del equipo..."
                  className="input resize-y"
                  {...register("notes")}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Se guardará con una versión ORIGINAL lista para transposición.
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
                  disabled={isSubmitting}
                  className="btn-primary disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting ? "Guardando..." : "Guardar canción"}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-900/20">
                <Music2 className="h-6 w-6 text-brand-700 dark:text-brand-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Estructura sugerida
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Usa corchetes para acordes: [C] [G] [Am] [F]
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-950 p-4 font-mono text-sm leading-7 text-slate-100 shadow-inner dark:bg-slate-950/80">
              [C]Sublime [G]gracia del [Am]Señor
              <br />
              que a un [F]pecador [G]salvó
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <Info className="h-4 w-4 text-accent-500" />
              Vista previa rápida
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Aquí ves si la carga quedó legible antes de guardar.
            </p>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              {lyricsPreview ? (
                <pre className="whitespace-pre-wrap font-mono text-sm leading-7">
                  {lyricsPreview}
                </pre>
              ) : (
                <p className="text-slate-400 dark:text-slate-500">
                  La vista previa aparecerá cuando empieces a escribir la letra
                  con acordes.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
