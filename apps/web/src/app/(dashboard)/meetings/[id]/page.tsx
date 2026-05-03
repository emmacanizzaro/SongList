'use client'
import { useSocket } from '@/lib/socket/useSocket'
import { useEffect as useEffectSocket } from 'react'

import { SongChordsDrawer } from '@/components/songs/SongChordsDrawer'
import { useAuth } from '@/hooks/useAuth'
import { useEntitlements } from '@/hooks/useEntitlements'
import { churchApi, instrumentsApi, meetingsApi, songsApi } from '@/lib/api'
import { formatLongSpanishDateWithYear } from '@/lib/dates'
import { Instrument, Meeting, MeetingSong, Membership, Song } from '@/types'
import {
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import clsx from 'clsx'
import {
    ArrowLeft,
    BookOpen,
    Crown,
    GripVertical,
    Loader2,
    Pencil,
    Plus,
    Printer,
    Share2,
    Trash2,
    UserPlus,
    Users2,
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState, useState as useStateSocket } from 'react'
import toast from 'react-hot-toast'

export default function MeetingDetailPage() {
  // Obtener el id de la URL
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const userId = user?.id || ''
  // --- Colaboración en tiempo real ---
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000'
  const socketRef = useSocket(socketUrl)
  // --- Presencia de usuarios ---
  const [presentUsers, setPresentUsers] = useStateSocket<{ userId: string; name: string }[]>([])

  useEffectSocket(() => {
    const socket = socketRef.current
    if (!socket) return
    // Emitir join al entrar
    socket.emit('meeting:join', {
      meetingId: id,
      user: { userId, name: user?.name || '' },
    })
    // Escuchar presencia
    function onPresence(data: any) {
      if (data.meetingId === id) {
        // Detectar cambios de usuarios conectados
        setPresentUsers((prev) => {
          const prevIds = prev
            .map((u) => u.userId)
            .sort()
            .join(',')
          const nextIds = data.users
            .map((u: any) => u.userId)
            .sort()
            .join(',')
          if (prevIds !== nextIds) {
            // Detectar quién entró o salió
            const joined = data.users.find((u: any) => !prev.some((p) => p.userId === u.userId))
            const left = prev.find((p) => !data.users.some((u: any) => u.userId === p.userId))
            if (joined && joined.userId !== userId) {
              toast('🔵 ' + joined.name + ' se unió a la reunión', { icon: '👤' })
            }
            if (left && left.userId !== userId) {
              toast('⚪️ ' + left.name + ' salió de la reunión', { icon: '👤' })
            }
          }
          return data.users
        })
      }
    }
    socket.on('meeting:presence', onPresence)
    // Emitir leave al salir
    return () => {
      socket.emit('meeting:leave', {
        meetingId: id,
        user: { userId, name: user?.name || '' },
      })
      socket.off('meeting:presence', onPresence)
    }
  }, [id, userId, user?.name, socketRef])

  // Emitir cambios locales (ejemplo: reordenar canciones)
  function emitMeetingUpdate(changes: Record<string, any>) {
    socketRef.current?.emit('meeting:update', {
      meetingId: id,
      changes,
      userId,
    })
  }

  // Escuchar cambios remotos y actualizar estado

  const queryClient = useQueryClient()
  useEffectSocket(() => {
    const socket = socketRef.current
    if (!socket) return
    function onMeetingUpdated(data: any) {
      if (data.meetingId === id && data.userId !== userId) {
        // Por simplicidad, refrescamos los datos de la reunión
        queryClient.invalidateQueries({ queryKey: ['meeting', id] })
        toast('✏️ ' + (data.changes?.editorName || 'Otro usuario') + ' editó la reunión', {
          icon: '✏️',
        })
      }
    }
    socket.on('meeting:updated', onMeetingUpdated)
    return () => {
      socket.off('meeting:updated', onMeetingUpdated)
    }
  }, [id, userId, queryClient, socketRef])
  const router = useRouter()
  const [songId, setSongId] = useState('')
  const [keyOverride, setKeyOverride] = useState('')
  const [songNotes, setSongNotes] = useState('')
  const [assignUserId, setAssignUserId] = useState('')
  const [assignInstrumentId, setAssignInstrumentId] = useState('')
  const [assignNotes, setAssignNotes] = useState('')
  const [removingSongId, setRemovingSongId] = useState<string | null>(null)
  const [removingAssignmentId, setRemovingAssignmentId] = useState<string | null>(null)
  const [chordsDrawer, setChordsDrawer] = useState<{
    songId: string
    defaultKey?: string
  } | null>(null)

  type SongsListResponse = {
    items: Song[]
  }

  const { data: meeting, isLoading } = useQuery<Meeting>({
    queryKey: ['meeting', id],
    queryFn: () => meetingsApi.get(id).then((r) => r.data),
  })

  const { data: songsData } = useQuery<SongsListResponse>({
    queryKey: ['songs-for-meeting'],
    queryFn: () => songsApi.list().then((r) => r.data),
  })
  const songs = useMemo(() => songsData?.items ?? [], [songsData?.items])

  const { data: members = [] } = useQuery<Membership[]>({
    queryKey: ['church-members'],
    queryFn: () => churchApi.getMembers().then((r) => r.data),
  })

  const { data: instruments = [] } = useQuery<Instrument[]>({
    queryKey: ['instruments'],
    queryFn: () => instrumentsApi.list().then((r) => r.data),
  })

  const assignedUserIds = useMemo(
    () => new Set(meeting?.assignments.map((a) => a.userId) ?? []),
    [meeting],
  )

  const availableMembers = useMemo(
    () => members.filter((m) => !assignedUserIds.has(m.userId)),
    [members, assignedUserIds],
  )
  const hasAssignableMembers = availableMembers.length > 0
  const hasAvailableInstruments = instruments.length > 0

  const availableSongs = useMemo(() => {
    if (!meeting) return songs
    const includedIds = new Set(meeting.meetingSongs.map((item) => item.songId))
    return songs.filter((song: any) => !includedIds.has(song.id))
  }, [meeting, songs])

  const isSelectedSongAvailable = useMemo(
    () => availableSongs.some((song: any) => song.id === songId),
    [availableSongs, songId],
  )

  const canEditMeetings = user?.currentRole !== 'READER'
  const isAdmin = user?.currentRole === 'ADMIN'
  const { entitlements, isLoading: isEntitlementsLoading } = useEntitlements(Boolean(user))
  const canExportPdf = Boolean(entitlements?.features.canExportPdf)
  const canShareLinks = Boolean(entitlements?.features.canShareLinks)

  async function copyShareUrl(url: string) {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url)
      return true
    }

    if (typeof window !== 'undefined') {
      window.prompt('Copia este enlace:', url)
      return true
    }

    return false
  }

  // ── Drag & Drop ───────────────────────────────────────────
  const [orderedSongs, setOrderedSongs] = useState<MeetingSong[]>([])

  useEffect(() => {
    if (meeting) setOrderedSongs(meeting.meetingSongs)
  }, [meeting])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const reorderMutation = useMutation({
    mutationFn: (orderedSongIds: string[]) => meetingsApi.reorderSongs(id, orderedSongIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meeting', id] })
    },
    onError: () => {
      if (meeting) setOrderedSongs(meeting.meetingSongs)
      toast.error('No se pudo reordenar')
    },
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id || reorderMutation.isPending) return
    setOrderedSongs((prev) => {
      const oldIndex = prev.findIndex((ms) => ms.id === active.id)
      const newIndex = prev.findIndex((ms) => ms.id === over.id)
      if (oldIndex < 0 || newIndex < 0) {
        return prev
      }
      const next = arrayMove(prev, oldIndex, newIndex)
      reorderMutation.mutate(next.map((ms) => ms.songId))
      // Emitir cambio colaborativo
      emitMeetingUpdate({ type: 'reorderSongs', songOrder: next.map((ms) => ms.songId) })
      return next
    })
  }

  const shareMutation = useMutation({
    mutationFn: () => meetingsApi.generateShare(id),
    onSuccess: async (res) => {
      const token = res.data.shareToken
      const url = `${window.location.origin}/public/meetings/${token}`

      try {
        const copied = await copyShareUrl(url)
        if (copied) {
          toast.success('¡Link listo para compartir!')
        } else {
          toast.success('Link generado correctamente.')
        }
      } catch {
        toast.success('Link generado. Si no se copió automáticamente, cópialo manualmente.')
      }

      queryClient.invalidateQueries({ queryKey: ['meeting', id] })
    },
    onError: (error: any) => {
      const status = error?.response?.status
      const message =
        error?.response?.data?.message?.join?.(', ') ||
        error?.response?.data?.message ||
        'No se pudo compartir la reunión'

      if (status === 403) {
        if (isAdmin) {
          toast.error(message)
          router.push('/settings/billing')
          return
        }

        toast.error(
          'Tu plan actual no permite compartir enlaces. Pide a un admin que actualice la suscripción.',
        )
        return
      }

      toast.error(message)
    },
  })

  async function handleShareClick() {
    if (meeting?.shareToken) {
      const url = `${window.location.origin}/public/meetings/${meeting.shareToken}`
      try {
        const copied = await copyShareUrl(url)
        if (copied) {
          toast.success('¡Link listo para compartir!')
        } else {
          toast.success('Link disponible para compartir.')
        }
      } catch {
        toast.success('Link disponible. Si no se copió automáticamente, cópialo manualmente.')
      }
      return
    }

    shareMutation.mutate()
  }

  const deleteMeetingMutation = useMutation({
    mutationFn: () => meetingsApi.delete(id),
    onSuccess: async () => {
      toast.success('Reunión eliminada')
      await queryClient.invalidateQueries({ queryKey: ['meetings'] })
      await queryClient.invalidateQueries({ queryKey: ['meeting', id] })
      router.push('/meetings')
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message?.join?.(', ') ||
        error?.response?.data?.message ||
        'No se pudo eliminar la reunión'
      toast.error(message)
    },
  })

  function handleDeleteMeeting() {
    if (!canEditMeetings || deleteMeetingMutation.isPending) return

    if (window.confirm('¿Seguro que quieres eliminar esta reunión?')) {
      deleteMeetingMutation.mutate()
    }
  }

  const addSongMutation = useMutation({
    mutationFn: () =>
      meetingsApi.addSong(id, {
        songId,
        keyOverride: keyOverride || undefined,
        notes: songNotes || undefined,
      }),
    onSuccess: async () => {
      toast.success('Canción agregada a la reunión')
      setSongId('')
      setKeyOverride('')
      setSongNotes('')
      await queryClient.invalidateQueries({ queryKey: ['meeting', id] })
    },
    onError: (error: any) => {
      const status = error?.response?.status

      if (status === 409) {
        toast.error('Esa canción ya está agregada a la reunión')
        setSongId('')
        return
      }

      const message =
        error?.response?.data?.message?.join?.(', ') ||
        error?.response?.data?.message ||
        'No se pudo agregar la canción'
      toast.error(message)
    },
  })

  function handleAddSong() {
    if (!songId) return

    if (!isSelectedSongAvailable) {
      toast.error('Esa canción ya está en la reunión. Elige otra.')
      setSongId('')
      return
    }

    addSongMutation.mutate()
  }

  const removeSongMutation = useMutation({
    mutationFn: (meetingSongId: string) => meetingsApi.removeSong(id, meetingSongId),
    onMutate: (meetingSongId: string) => {
      setRemovingSongId(meetingSongId)
      setOrderedSongs((prev) => prev.filter((song) => song.id !== meetingSongId))
    },
    onSuccess: async () => {
      toast.success('Canción eliminada de la reunión')
      await queryClient.invalidateQueries({ queryKey: ['meeting', id] })
    },
    onError: () => {
      if (meeting) setOrderedSongs(meeting.meetingSongs)
      toast.error('No se pudo eliminar la canción')
    },
    onSettled: () => {
      setRemovingSongId(null)
    },
  })

  const assignMutation = useMutation({
    mutationFn: () =>
      meetingsApi.assign(id, {
        userId: assignUserId,
        instrumentId: assignInstrumentId,
        notes: assignNotes || undefined,
      }),
    onSuccess: async () => {
      toast.success('Músico asignado')
      setAssignUserId('')
      setAssignInstrumentId('')
      setAssignNotes('')
      await queryClient.invalidateQueries({ queryKey: ['meeting', id] })
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message?.join?.(', ') ||
        error?.response?.data?.message ||
        'No se pudo asignar el músico'
      toast.error(message)
    },
  })

  const unassignMutation = useMutation({
    mutationFn: (assignmentId: string) => meetingsApi.unassign(id, assignmentId),
    onMutate: (assignmentId: string) => {
      setRemovingAssignmentId(assignmentId)
    },
    onSuccess: async () => {
      toast.success('Músico removido de la reunión')
      await queryClient.invalidateQueries({ queryKey: ['meeting', id] })
    },
    onError: () => {
      toast.error('No se pudo remover el músico')
    },
    onSettled: () => {
      setRemovingAssignmentId(null)
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
    <>
      {/* Presencia de usuarios en la reunión */}
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-300">
        <span className="font-semibold">En línea:</span>
        {presentUsers.map((u) => {
          // Color hash simple por userId
          const colors = [
            'bg-blue-500',
            'bg-green-500',
            'bg-pink-500',
            'bg-yellow-500',
            'bg-purple-500',
            'bg-rose-500',
            'bg-emerald-500',
            'bg-orange-500',
            'bg-cyan-500',
            'bg-indigo-500',
          ]
          let colorIdx = 0
          for (let i = 0; i < u.userId.length; i++)
            colorIdx = (colorIdx + u.userId.charCodeAt(i)) % colors.length
          const color = colors[colorIdx]
          const initial = u.name?.trim()?.charAt(0)?.toUpperCase() || '?'
          return (
            <span
              key={u.userId}
              className="flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 dark:bg-slate-800"
            >
              <span
                className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white ${color}`}
              >
                {initial}
              </span>
              {u.name}
            </span>
          )
        })}
      </div>
      {chordsDrawer && (
        <SongChordsDrawer
          songId={chordsDrawer.songId}
          defaultKey={chordsDrawer.defaultKey}
          onClose={() => setChordsDrawer(null)}
        />
      )}
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
                {formatLongSpanishDateWithYear(new Date(meeting.date))}
              </p>
            </div>
            {canEditMeetings ? (
              <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
                <Link
                  href={canExportPdf ? `/meetings/${id}/print` : '/settings/billing'}
                  target={canExportPdf ? '_blank' : undefined}
                  rel={canExportPdf ? 'noopener noreferrer' : undefined}
                  className={clsx(
                    'btn-secondary border-white/10 bg-white/8 text-white hover:bg-white/12',
                    !canExportPdf && 'ring-1 ring-amber-300/60',
                  )}
                >
                  <Printer className="h-4 w-4" />
                  {canExportPdf ? 'Imprimir setlist' : 'Desbloquear PDF'}
                </Link>
                {isEntitlementsLoading ? (
                  <button
                    disabled
                    className="btn-secondary border-white/10 bg-white/8 text-white opacity-70"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verificando plan...
                  </button>
                ) : canShareLinks ? (
                  <button
                    onClick={handleShareClick}
                    disabled={shareMutation.isPending}
                    className="btn-secondary border-white/10 bg-white/8 text-white hover:bg-white/12"
                  >
                    {shareMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Compartiendo...
                      </>
                    ) : (
                      <>
                        <Share2 className="h-4 w-4" />
                        {meeting.shareToken ? 'Copiar link' : 'Compartir'}
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (isAdmin) {
                        router.push('/settings/billing')
                        return
                      }
                      toast('Solo Admin puede desbloquear compartir enlaces')
                    }}
                    className="btn-secondary border-white/10 bg-white/8 text-white hover:bg-white/12"
                  >
                    <Crown className="h-4 w-4" />
                    Desbloquear compartir
                  </button>
                )}
                <Link
                  href={`/meetings/${id}/edit`}
                  className="btn-secondary border-white/10 bg-white/8 text-white hover:bg-white/12"
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </Link>
                <button
                  onClick={handleDeleteMeeting}
                  disabled={deleteMeetingMutation.isPending}
                  className="btn-secondary border-red-300/40 bg-red-500/20 text-red-100 hover:bg-red-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleteMeetingMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </>
                  )}
                </button>
              </div>
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
              <h2 className="font-semibold text-slate-900 dark:text-white">Lista de canciones</h2>
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
                  !songId ||
                  !isSelectedSongAvailable ||
                  addSongMutation.isPending ||
                  !canEditMeetings
                }
                onClick={handleAddSong}
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
                    {canEditMeetings ? 'Agregar a la reunión' : 'Solo lectura'}
                  </>
                )}
              </button>
            </div>

            {orderedSongs.length === 0 ? (
              <div className="card p-8 text-center text-sm text-gray-400 dark:text-slate-400">
                No hay canciones. Agrega la primera.
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={canEditMeetings ? handleDragEnd : undefined}
              >
                <SortableContext
                  items={orderedSongs.map((ms) => ms.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {orderedSongs.map((ms, idx) => (
                      <SortableSongRow
                        key={ms.id}
                        ms={ms}
                        index={idx + 1}
                        canEdit={canEditMeetings}
                        onRemove={() => removeSongMutation.mutate(ms.id)}
                        isRemoving={removingSongId === ms.id}
                        onViewChords={() =>
                          setChordsDrawer({
                            songId: ms.songId,
                            defaultKey: ms.keyOverride ?? ms.song.originalKey,
                          })
                        }
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users2 className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              <h2 className="font-semibold text-slate-900 dark:text-white">Músicos asignados</h2>
              <span className="ml-auto rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                {meeting.assignments.length}
              </span>
            </div>

            {/* Formulario de asignación */}
            {canEditMeetings && (
              <div className="card p-4 sm:p-5">
                <p className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
                  <UserPlus className="h-4 w-4 text-brand-600" />
                  Asignar músico
                </p>
                <div className="mt-3 space-y-2">
                  <select
                    className="input"
                    value={assignUserId}
                    onChange={(e) => setAssignUserId(e.target.value)}
                    disabled={!hasAssignableMembers || assignMutation.isPending}
                  >
                    <option value="">Selecciona un miembro...</option>
                    {availableMembers.map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.user.name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="input"
                    value={assignInstrumentId}
                    onChange={(e) => setAssignInstrumentId(e.target.value)}
                    disabled={!hasAvailableInstruments || assignMutation.isPending}
                  >
                    <option value="">Selecciona un instrumento...</option>
                    {instruments.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.icon ? `${inst.icon} ` : ''}
                        {inst.name}
                      </option>
                    ))}
                  </select>
                  <input
                    className="input"
                    placeholder="Nota opcional (ej: entra en coro)"
                    value={assignNotes}
                    onChange={(e) => setAssignNotes(e.target.value)}
                  />
                  <button
                    disabled={
                      !assignUserId ||
                      !assignInstrumentId ||
                      !hasAssignableMembers ||
                      !hasAvailableInstruments ||
                      assignMutation.isPending
                    }
                    onClick={() => assignMutation.mutate()}
                    className="btn-primary w-full disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {assignMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Asignando...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Asignar
                      </>
                    )}
                  </button>
                  {!hasAssignableMembers && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Todos los miembros ya están asignados en esta reunión.
                    </p>
                  )}
                  {!hasAvailableInstruments && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      No hay instrumentos disponibles. Crea uno desde la sección de instrumentos.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Lista de asignaciones */}
            {meeting.assignments.length === 0 ? (
              <div className="card p-6 text-center text-sm text-slate-400 dark:text-slate-500">
                Sin músicos asignados aún
              </div>
            ) : (
              <div className="space-y-2">
                {meeting.assignments.map((a) => (
                  <div key={a.id} className="card flex items-center gap-3 p-3">
                    <span className="text-xl shrink-0">{a.instrument.icon ?? '🎵'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {a.user.name}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {a.instrument.name}
                      </p>
                      {a.notes && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          {a.notes}
                        </p>
                      )}
                    </div>
                    {canEditMeetings && (
                      <button
                        onClick={() => unassignMutation.mutate(a.id)}
                        disabled={removingAssignmentId === a.id}
                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-300 shrink-0"
                        title="Remover músico"
                      >
                        {removingAssignmentId === a.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// ── Fila de canción con drag & drop ──────────────────────────

interface SortableSongRowProps {
  ms: MeetingSong
  index: number
  canEdit: boolean
  onRemove: () => void
  isRemoving: boolean
  onViewChords: () => void
}

function SortableSongRow({
  ms,
  index,
  canEdit,
  onRemove,
  isRemoving,
  onViewChords,
}: SortableSongRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: ms.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        'card flex items-center gap-3 p-3 transition-shadow',
        isDragging && 'opacity-50 shadow-xl ring-2 ring-brand-400 dark:ring-brand-500',
      )}
    >
      <button
        {...(canEdit ? { ...attributes, ...listeners } : {})}
        className={clsx(
          'rounded p-1 touch-none transition-colors',
          canEdit
            ? 'cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 dark:hover:text-slate-300'
            : 'invisible',
        )}
        tabIndex={-1}
        aria-label="Arrastrar para reordenar"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-700 text-xs font-bold text-white shrink-0">
        {index}
      </span>
      <div className="flex-1 min-w-0">
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
        onClick={onViewChords}
        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-brand-50 hover:text-brand-600 shrink-0"
        title="Ver acordes"
      >
        <BookOpen className="h-4 w-4" />
      </button>
      <button
        onClick={onRemove}
        disabled={isRemoving || !canEdit}
        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-300 disabled:pointer-events-none disabled:opacity-40 shrink-0"
        title="Quitar canción"
      >
        {isRemoving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </button>
    </div>
  )
}
