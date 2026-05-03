'use client'

import { useAuth } from '@/hooks/useAuth'
import { meetingsApi } from '@/lib/api'
import {
    formatShortSpanishDayMonth,
    formatSpanishDayNumber,
    formatSpanishMonthShort,
    isPastDate,
    isTodayDate,
    isTomorrowDate,
} from '@/lib/dates'
import { Meeting } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { clsx } from 'clsx'
import { Calendar, ChevronRight, Music2, Pencil, Plus, Trash2, Users2 } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function MeetingsPage() {
  const { user } = useAuth()
  const { data: meetings = [], isLoading } = useQuery<Meeting[]>({
    queryKey: ['meetings', user?.id],
    queryFn: () => meetingsApi.list().then((r) => r.data),
    enabled: Boolean(user?.id),
  })

  const canEditMeetings = user?.currentRole !== 'READER'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Calendario</p>
          <h1 className="text-2xl font-bold text-slate-900">Reuniones</h1>
          <p className="text-slate-500 text-sm mt-1">{meetings.length} reuniones registradas</p>
        </div>
        {canEditMeetings ? (
          <Link href="/meetings/new" className="btn-primary">
            <Plus className="w-4 h-4" />
            Nueva reunión
          </Link>
        ) : (
          <span className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-200">
            Modo visualizador
          </span>
        )}
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse h-20" />
          ))}
        </div>
      ) : meetings.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-7 h-7 text-brand-600" />
          </div>
          <h3 className="font-semibold text-slate-700">Sin reuniones aún</h3>
          <p className="text-slate-400 text-sm mt-1">
            Crea tu primera reunión para comenzar a organizar
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {meetings.map((meeting) => (
            <MeetingRow key={meeting.id} meeting={meeting} />
          ))}
        </div>
      )}
    </div>
  )
}

function MeetingRow({ meeting }: { meeting: Meeting }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const canEditMeetings = user?.currentRole !== 'READER'
  const date = new Date(meeting.date)
  const past = isPastDate(date) && !isTodayDate(date)
  const dateLabel = isTodayDate(date)
    ? 'Hoy'
    : isTomorrowDate(date)
      ? 'Mañana'
      : formatShortSpanishDayMonth(date)

  const deleteMutation = useMutation({
    mutationFn: () => meetingsApi.delete(meeting.id),
    onSuccess: () => {
      toast.success('Reunión eliminada')
      queryClient.invalidateQueries({ queryKey: ['meetings'] })
    },
    onError: () => {
      toast.error('No se pudo eliminar la reunión')
    },
  })

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    if (window.confirm('¿Seguro que quieres eliminar esta reunión?')) {
      deleteMutation.mutate()
    }
  }

  return (
    <div
      className={clsx(
        'card p-4 flex items-center justify-between transition-all group',
        past ? 'opacity-60' : 'hover:border-brand-400',
      )}
    >
      {/* Fecha */}
      <Link href={`/meetings/${meeting.id}`} className="flex items-center gap-4 flex-1 min-w-0">
        <div
          className={clsx(
            'w-12 h-12 rounded-2xl flex flex-col items-center justify-center text-xs font-bold',
            isTodayDate(date)
              ? 'bg-brand-700 text-white'
              : past
                ? 'bg-slate-100 text-slate-500'
                : 'bg-brand-50 text-brand-800',
          )}
        >
          <span className="text-lg leading-none">{formatSpanishDayNumber(date)}</span>
          <span className="text-[10px] uppercase">{formatSpanishMonthShort(date)}</span>
        </div>

        <div className="min-w-0">
          <p className="font-semibold text-slate-900 group-hover:text-brand-700 transition-colors text-sm truncate">
            {meeting.title}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{dateLabel}</p>
        </div>
      </Link>

      {/* Meta y eliminar */}
      <div className="flex items-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <Music2 className="w-3 h-3" />
          {(meeting as any)._count?.meetingSongs ?? meeting.meetingSongs?.length ?? 0}
        </span>
        <span className="flex items-center gap-1">
          <Users2 className="w-3 h-3" />
          {(meeting as any)._count?.assignments ?? meeting.assignments?.length ?? 0}
        </span>
        {canEditMeetings && (
          <>
            <Link
              href={`/meetings/${meeting.id}/edit`}
              onClick={(e) => e.stopPropagation()}
              title="Editar reunión"
              aria-label="Editar reunión"
              className="hover:text-brand-600 transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </Link>
            <button
              onClick={handleDelete}
              title="Eliminar reunión"
              className="hover:text-red-600 transition-colors"
              aria-label="Eliminar reunión"
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
        <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  )
}
