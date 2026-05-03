'use client'

import { Tooltip } from '@/components/ui/Tooltip'
import { useAuth } from '@/hooks/useAuth'
import { meetingsApi } from '@/lib/api'
import { Meeting } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CalendarDays, Save, StickyNote } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'

const editMeetingSchema = z.object({
  title: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(120, 'El título no puede superar 120 caracteres'),
  worshipLeader: z.string().min(2, 'Worship Leader es obligatorio').max(100),
  date: z.string().min(1, 'La fecha es obligatoria'),
  notes: z.string().optional().default(''),
})

type EditMeetingInput = z.infer<typeof editMeetingSchema>

/** Extracts worship leader and remaining notes from a stored notes string */
function parseNotes(raw: string | null | undefined): { worshipLeader: string; notes: string } {
  if (!raw) return { worshipLeader: '', notes: '' }
  const lines = raw.split('\n\n')
  const leaderLine = lines[0] ?? ''
  if (leaderLine.startsWith('Worship Leader: ')) {
    return {
      worshipLeader: leaderLine.replace('Worship Leader: ', '').trim(),
      notes: lines.slice(1).join('\n\n').trim(),
    }
  }
  return { worshipLeader: '', notes: raw.trim() }
}

/** Formats a JS Date (or ISO string) to the value expected by <input type="datetime-local"> */
function toDatetimeLocal(value: string | Date | undefined): string {
  if (!value) return ''
  const d = new Date(value)
  // Pad to "YYYY-MM-DDTHH:mm"
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  )
}

export default function EditMeetingPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()

  const canEditMeetings = user?.currentRole !== 'READER'

  const { data: meeting, isLoading } = useQuery<Meeting>({
    queryKey: ['meeting', id],
    queryFn: () => meetingsApi.get(id).then((r) => r.data),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditMeetingInput>({
    resolver: zodResolver(editMeetingSchema),
    defaultValues: { title: '', worshipLeader: '', date: '', notes: '' },
  })

  // Pre-fill form once meeting data is loaded
  useEffect(() => {
    if (!meeting) return
    const { worshipLeader, notes } = parseNotes(meeting.notes)
    reset({
      title: meeting.title,
      worshipLeader,
      date: toDatetimeLocal(meeting.date),
      notes,
    })
  }, [meeting, reset])

  const updateMutation = useMutation({
    mutationFn: (data: EditMeetingInput) => {
      const mergedNotes = [`Worship Leader: ${data.worshipLeader}`, data.notes?.trim()]
        .filter(Boolean)
        .join('\n\n')

      return meetingsApi.update(id, {
        title: data.title,
        date: new Date(data.date).toISOString(),
        notes: mergedNotes,
      })
    },
    onSuccess: async (response) => {
      const updatedMeeting = response.data

      queryClient.setQueryData(['meeting', id], updatedMeeting)
      queryClient.setQueriesData({ queryKey: ['meetings'] }, (current: Meeting[] | undefined) => {
        if (!current) return current
        return current.map((meeting) =>
          meeting.id === updatedMeeting.id ? { ...meeting, ...updatedMeeting } : meeting,
        )
      })

      toast.success('Reunión actualizada')
      await queryClient.invalidateQueries({ queryKey: ['meeting', id] })
      await queryClient.invalidateQueries({ queryKey: ['meetings'] })
      router.push(`/meetings/${id}`)
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message?.join?.(', ') ||
        err?.response?.data?.message ||
        'No se pudo actualizar la reunión'
      toast.error(message)
    },
  })

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-64 bg-gray-100 rounded-xl mt-8" />
      </div>
    )
  }

  if (!meeting) return <div>Reunión no encontrada</div>

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Link
        href={`/meetings/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-brand-700 dark:text-slate-400 dark:hover:text-brand-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a la reunión
      </Link>

      <section className="relative overflow-hidden rounded-[32px] bg-slate-950 px-6 py-8 text-white shadow-[0_28px_60px_rgba(15,23,42,0.22)] sm:px-8">
        <div className="pointer-events-none absolute inset-0 music-notes-bg opacity-20" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(188,132,47,0.22),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(31,77,143,0.28),transparent_30%)]" />
        <div className="relative flex flex-col gap-3">
          <p className="eyebrow bg-white/10 text-slate-200">Reuniones</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Editar reunión</h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Actualiza el título, fecha, líder o notas de la reunión.
          </p>
        </div>
      </section>

      {!canEditMeetings && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-200">
          Estás en modo visualizador. No puedes editar reuniones.
        </div>
      )}

      <div className="card p-6 sm:p-8">
        <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="meeting-title"
              className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Título
              <Tooltip text="Nombre de la reunión o servicio.">
                <></>
              </Tooltip>
            </label>
            <input
              id="meeting-title"
              type="text"
              placeholder="Ej. Ensayo domingo AM"
              {...register('title')}
              className="input"
              aria-describedby={errors.title ? 'meeting-title-error' : undefined}
              disabled={!canEditMeetings}
            />
            {errors.title && (
              <p
                id="meeting-title-error"
                role="alert"
                className="mt-1 text-sm text-red-600 dark:text-red-400"
              >
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Worship Leader */}
          <div>
            <label
              htmlFor="meeting-leader"
              className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Worship Leader
              <Tooltip text="Quién lidera la reunión o servicio.">
                <></>
              </Tooltip>
            </label>
            <input
              id="meeting-leader"
              type="text"
              placeholder="Nombre del líder de alabanza"
              {...register('worshipLeader')}
              className="input"
              aria-describedby={errors.worshipLeader ? 'meeting-leader-error' : undefined}
              disabled={!canEditMeetings}
            />
            {errors.worshipLeader && (
              <p
                id="meeting-leader-error"
                role="alert"
                className="mt-1 text-sm text-red-600 dark:text-red-400"
              >
                {errors.worshipLeader.message}
              </p>
            )}
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="meeting-date"
              className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              <CalendarDays className="h-4 w-4 text-slate-400" />
              Fecha y hora
            </label>
            <input
              id="meeting-date"
              type="datetime-local"
              {...register('date')}
              className="input"
              aria-describedby={errors.date ? 'meeting-date-error' : undefined}
              disabled={!canEditMeetings}
            />
            {errors.date && (
              <p
                id="meeting-date-error"
                role="alert"
                className="mt-1 text-sm text-red-600 dark:text-red-400"
              >
                {errors.date.message}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="meeting-notes"
              className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              <StickyNote className="h-4 w-4 text-slate-400" />
              Notas del equipo
            </label>
            <textarea
              id="meeting-notes"
              placeholder="Enfoque del servicio, dinámica, observaciones musicales..."
              {...register('notes')}
              rows={5}
              className="input resize-y"
              disabled={!canEditMeetings}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href={`/meetings/${id}`} className="btn-secondary">
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={!canEditMeetings || updateMutation.isPending}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {updateMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
