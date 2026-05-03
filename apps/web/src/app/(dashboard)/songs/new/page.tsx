'use client'

import { Tooltip } from '@/components/ui/Tooltip'
import { useAuth } from '@/hooks/useAuth'
import { useEntitlements } from '@/hooks/useEntitlements'
import { songsApi } from '@/lib/api'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Crown, Info, Music2, Save } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const createSongSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio').max(200),
  artist: z.string().max(100).optional().or(z.literal('')),
  originalKey: z.string().min(1, 'La tonalidad es obligatoria'),
  bpm: z
    .string()
    .optional()
    .refine(
      (value) => !value || (Number(value) >= 40 && Number(value) <= 300),
      'El BPM debe estar entre 40 y 300',
    ),
  tags: z.string().optional(),
  lyricsChords: z.string().min(1, 'Agrega la letra con acordes'),
  notes: z.string().optional(),
})

type CreateSongInput = z.infer<typeof createSongSchema>

const KEYS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']

export default function NewSongPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [error, setError] = useState('')
  const isAdmin = user?.currentRole === 'ADMIN'
  const { entitlements } = useEntitlements(Boolean(user))

  const songsQuota = entitlements?.quotas.songs
  const hasSongsLimitReached = Boolean(
    songsQuota && !songsQuota.unlimited && (songsQuota.remaining ?? 0) <= 0,
  )

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateSongInput>({
    resolver: zodResolver(createSongSchema),
    defaultValues: {
      originalKey: 'C',
      bpm: '',
      tags: '',
      notes: '',
      lyricsChords: '',
    },
  })

  const lyricsPreview = watch('lyricsChords')

  const onSubmit = async (data: CreateSongInput) => {
    setError('')

    if (hasSongsLimitReached) {
      setError(
        'Tu plan alcanzó el límite de canciones. Actualiza para seguir agregando repertorio.',
      )
      return
    }

    try {
      const response = await songsApi.create({
        title: data.title,
        artist: data.artist || undefined,
        originalKey: data.originalKey,
        bpm: data.bpm ? Number(data.bpm) : undefined,
        tags: data.tags
          ? data.tags
              .split(',')
              .map((tag) => tag.trim().toLowerCase())
              .filter(Boolean)
          : [],
        version: {
          type: 'ORIGINAL',
          key: data.originalKey,
          lyricsChords: data.lyricsChords,
          notes: data.notes || undefined,
        },
      })

      router.push(`/songs/${response.data.id}`)
    } catch (submissionError: any) {
      setError(
        submissionError?.response?.data?.message?.join?.(', ') ||
          submissionError?.response?.data?.message ||
          'No se pudo crear la canción. Revisa los datos e intenta nuevamente.',
      )
    }
  }

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
            Completa la versión original con letra y acordes. Después podrás abrir el detalle para
            transponerla o preparar variantes.
          </p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="card p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div
                role="alert"
                className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
              >
                {error}
              </div>
            )}

            {hasSongsLimitReached && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-200">
                Llegaste al límite de canciones para tu plan. Para cargar nuevas, actualiza tu
                suscripción.
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href="/songs" className="btn-secondary">
                    Volver a canciones
                  </Link>
                  {isAdmin ? (
                    <Link href="/settings/billing" className="btn-primary">
                      <Crown className="h-4 w-4" />
                      Ver planes
                    </Link>
                  ) : (
                    <span className="rounded-xl border border-amber-300/70 px-3 py-2 text-xs font-medium dark:border-amber-800">
                      Solo Admin puede cambiar el plan
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label
                  htmlFor="song-title"
                  className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Título
                  <Tooltip text="Nombre de la canción tal como aparece en tu repertorio.">
                    <></>
                  </Tooltip>
                </label>
                <input
                  id="song-title"
                  type="text"
                  placeholder="Sublime gracia"
                  className="input"
                  aria-describedby={errors.title ? 'song-title-error' : undefined}
                  {...register('title')}
                />
                {errors.title && (
                  <p
                    id="song-title-error"
                    role="alert"
                    className="mt-1 text-sm text-red-600 dark:text-red-400"
                  >
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="song-artist"
                  className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Artista o autor
                  <Tooltip text="¿Quién compuso o popularizó la canción? Opcional.">
                    <></>
                  </Tooltip>
                </label>
                <input
                  id="song-artist"
                  type="text"
                  placeholder="Tradicional"
                  className="input"
                  aria-describedby={errors.artist ? 'song-artist-error' : undefined}
                  {...register('artist')}
                />
                {errors.artist && (
                  <p
                    id="song-artist-error"
                    role="alert"
                    className="mt-1 text-sm text-red-600 dark:text-red-400"
                  >
                    {errors.artist.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="song-originalKey"
                  className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Tonalidad original
                  <Tooltip text="Clave musical en la que está originalmente la canción.">
                    <></>
                  </Tooltip>
                </label>
                <select id="song-originalKey" className="input" {...register('originalKey')}>
                  {KEYS.map((key) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="song-bpm"
                  className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  BPM
                  <Tooltip text="Beats por minuto. Indica el tempo de la canción. Opcional.">
                    <></>
                  </Tooltip>
                </label>
                <input
                  id="song-bpm"
                  type="number"
                  min={40}
                  max={300}
                  placeholder="72"
                  className="input"
                  aria-describedby={errors.bpm ? 'song-bpm-error' : undefined}
                  {...register('bpm')}
                />
                {errors.bpm && (
                  <p
                    id="song-bpm-error"
                    role="alert"
                    className="mt-1 text-sm text-red-600 dark:text-red-400"
                  >
                    {errors.bpm.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="song-tags"
                  className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Etiquetas
                  <Tooltip text="Palabras clave separadas por coma para organizar y buscar más fácil.">
                    <></>
                  </Tooltip>
                </label>
                <input
                  id="song-tags"
                  type="text"
                  placeholder="adoración, domingo, apertura"
                  className="input"
                  {...register('tags')}
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="song-lyricsChords"
                  className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Letra y acordes
                  <Tooltip text="Pega aquí la letra con los acordes entre corchetes. Ejemplo: [C]Sublime [G]gracia...">
                    <></>
                  </Tooltip>
                </label>
                <textarea
                  id="song-lyricsChords"
                  rows={12}
                  placeholder="[C]Sublime [G]gracia del [Am]Señor..."
                  className="input min-h-[280px] resize-y"
                  aria-describedby={errors.lyricsChords ? 'song-lyricsChords-error' : undefined}
                  {...register('lyricsChords')}
                />
                {errors.lyricsChords && (
                  <p
                    id="song-lyricsChords-error"
                    role="alert"
                    className="mt-1 text-sm text-red-600 dark:text-red-400"
                  >
                    {errors.lyricsChords.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="song-notes"
                  className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Notas internas
                  <Tooltip text="Observaciones para tu equipo, no visibles en la proyección.">
                    <></>
                  </Tooltip>
                </label>
                <textarea
                  id="song-notes"
                  rows={4}
                  placeholder="Intro libre, corte instrumental, observaciones del equipo..."
                  className="input resize-y"
                  {...register('notes')}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Se guardará con una versión ORIGINAL lista para transposición.
              </p>
              <div className="flex gap-3">
                <button type="button" onClick={() => router.back()} className="btn-secondary">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || hasSongsLimitReached}
                  className="btn-primary disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting
                    ? 'Guardando...'
                    : hasSongsLimitReached
                      ? 'Límite alcanzado'
                      : 'Guardar canción'}
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
                  La vista previa aparecerá cuando empieces a escribir la letra con acordes.
                </p>
              )}
            </div>
          </div>

          {songsQuota && (
            <div className="card p-6">
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                Cuota de canciones
              </div>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {songsQuota.unlimited
                  ? `${songsQuota.used} registradas · sin límite`
                  : `${songsQuota.used} de ${songsQuota.limit} en uso`}
              </p>
              {!songsQuota.unlimited && (
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  {songsQuota.remaining ?? 0} disponibles en tu plan actual.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
